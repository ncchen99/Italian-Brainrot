import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '../lib/firebase';

const LOCAL_AUTH_KEY = 'ibr-local-anon-uid';
const TEAM_NAME_KEY = 'ibr-team-name';

function getOrCreateLocalUid() {
  const existing = window.localStorage.getItem(LOCAL_AUTH_KEY);
  if (existing) return existing;
  const uid = `local-${crypto.randomUUID()}`;
  window.localStorage.setItem(LOCAL_AUTH_KEY, uid);
  return uid;
}

export function getStoredTeamName() {
  return window.localStorage.getItem(TEAM_NAME_KEY) || '';
}

export function setStoredTeamName(teamName) {
  window.localStorage.setItem(TEAM_NAME_KEY, teamName.trim());
}

export function subscribeAuthState(callback) {
  if (!isFirebaseEnabled || !auth) {
    const uid = getOrCreateLocalUid();
    callback({
      uid,
      isLocalFallback: true
    });
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user || null);
  });
}

export async function ensureAnonymousAuth() {
  if (!isFirebaseEnabled || !auth) {
    return {
      uid: getOrCreateLocalUid(),
      isLocalFallback: true
    };
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function upsertTeamProfile({ uid, teamName }) {
  const safeTeamName = teamName.trim();
  setStoredTeamName(safeTeamName);

  if (!isFirebaseEnabled || !db) {
    return {
      teamId: uid,
      teamName: safeTeamName,
      isLocalFallback: true
    };
  }

  const teamRef = doc(db, 'teams', uid);
  await setDoc(
    teamRef,
    {
      name: safeTeamName,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  return {
    teamId: uid,
    teamName: safeTeamName
  };
}
