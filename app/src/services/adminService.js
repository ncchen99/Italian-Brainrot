import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage, isFirebaseEnabled, isFirebaseStorageEnabled } from '../lib/firebase';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function deleteCollectionDocs(pathSegments) {
  if (!isFirebaseEnabled || !db) return;
  const colRef = collection(db, ...pathSegments);
  const snapshot = await getDocs(colRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}

async function deleteChallengeSessions(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return;
  const sessionsRef = collection(db, 'teams', teamId, 'challengeSessions');
  const sessionsSnapshot = await getDocs(sessionsRef);
  for (const sessionDoc of sessionsSnapshot.docs) {
    const sid = sessionDoc.id;
    await deleteCollectionDocs(['teams', teamId, 'challengeSessions', sid, 'progress']);
    await deleteCollectionDocs(['teams', teamId, 'challengeSessions', sid, 'cooldowns']);
    await deleteDoc(sessionDoc.ref);
  }
}

// ─── Read: all teams ─────────────────────────────────────────────────────────

/**
 * Subscribe to the live list of all teams.
 * Each team entry:
 *   { id, name, createdAt, updatedAt, activeSessionId, activeSessionStartedAtMs, activeSessionEndsAtMs }
 * Returns an unsubscribe function.
 */
export function subscribeAllTeams({ onChange, onError }) {
  if (!isFirebaseEnabled || !db) {
    onChange([]);
    return () => {};
  }

  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, orderBy('createdAt', 'desc'));

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const teams = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      onChange(teams);
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
    }
  );

  return unsub;
}

/**
 * Fetch a single team's progress sub-collection (root-level progress only).
 */
export async function getTeamProgress(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return {};
  const snap = await getDocs(collection(db, 'teams', teamId, 'progress'));
  const map = {};
  snap.forEach((d) => { map[d.id] = d.data(); });
  return map;
}

/**
 * Fetch active challenge session data (and its progress sub-collection) for a team.
 * Returns { session, progress } where progress is a map of levelId → data.
 */
export async function getTeamSessionDetail(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return { session: null, progress: {} };

  const teamDoc = await getDoc(doc(db, 'teams', teamId));
  if (!teamDoc.exists()) return { session: null, progress: {} };

  const teamData = teamDoc.data() || {};
  const sessionId = teamData.activeSessionId;
  if (!sessionId) return { session: null, progress: {} };

  const sessionDoc = await getDoc(doc(db, 'teams', teamId, 'challengeSessions', sessionId));
  const session = sessionDoc.exists() ? { id: sessionId, ...sessionDoc.data() } : { id: sessionId };

  const progressSnap = await getDocs(
    collection(db, 'teams', teamId, 'challengeSessions', sessionId, 'progress')
  );
  const progress = {};
  progressSnap.forEach((d) => { progress[d.id] = d.data(); });

  return { session, progress };
}

/**
 * Fetch all challenge sessions (with their progress) for a team, newest first.
 * Returns array of { id, ...sessionData, progress: { levelId: data } }
 */
export async function getAllTeamSessions(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return [];

  const sessionsSnap = await getDocs(collection(db, 'teams', teamId, 'challengeSessions'));
  const sessions = [];

  for (const sessionDoc of sessionsSnap.docs) {
    const progressSnap = await getDocs(
      collection(db, 'teams', teamId, 'challengeSessions', sessionDoc.id, 'progress')
    );
    const progress = {};
    progressSnap.forEach((d) => { progress[d.id] = d.data(); });

    sessions.push({ id: sessionDoc.id, ...sessionDoc.data(), progress });
  }

  // Sort newest first
  sessions.sort((a, b) => (b.startedAtMs || 0) - (a.startedAtMs || 0));
  return sessions;
}

/**
 * Fetch all uploaded images for a team.
 * Returns array of { id, levelId, imageUrl, objectKey, createdAt }
 */
export async function getTeamUploads(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return [];
  const snap = await getDocs(collection(db, 'teams', teamId, 'uploads'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Delete team ─────────────────────────────────────────────────────────────

/**
 * Completely delete a team from Firestore + all Storage images.
 * Does NOT delete the Firebase Auth user (anonymous users are auto-cleaned by Firebase after 180 days).
 */
export async function deleteTeam(teamId) {
  if (!isFirebaseEnabled || !db || !teamId) return;

  // 1. Delete Storage uploads
  if (isFirebaseStorageEnabled && storage) {
    try {
      const uploadsSnap = await getDocs(collection(db, 'teams', teamId, 'uploads'));
      await Promise.allSettled(
        uploadsSnap.docs.map(async (uDoc) => {
          const objectKey = uDoc.data()?.objectKey;
          if (objectKey) {
            const fileRef = ref(storage, objectKey);
            await deleteObject(fileRef).catch(() => {});
          }
        })
      );
    } catch {
      // Continue even if storage deletion fails
    }
  }

  // 2. Delete Firestore sub-collections
  await deleteCollectionDocs(['teams', teamId, 'progress']);
  await deleteCollectionDocs(['teams', teamId, 'uploads']);
  await deleteCollectionDocs(['teams', teamId, 'scanAccess']);
  await deleteCollectionDocs(['teams', teamId, 'cooldowns']);
  await deleteChallengeSessions(teamId);

  // 3. Delete team document itself
  await deleteDoc(doc(db, 'teams', teamId));
}
