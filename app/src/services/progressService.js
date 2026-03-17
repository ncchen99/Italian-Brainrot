import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseEnabled } from '../lib/firebase';

const COOLDOWN_CACHE_PREFIX = 'ibr-cooldown';

function getCooldownCacheKey(teamId, levelId) {
  return `${COOLDOWN_CACHE_PREFIX}:${teamId}:${levelId}`;
}

export async function saveLevelProgress({
  teamId,
  levelId,
  status,
  payload = {}
}) {
  if (!teamId || !levelId) return;

  if (!isFirebaseEnabled || !db) return;

  const progressRef = doc(db, 'teams', teamId, 'progress', levelId);
  await setDoc(
    progressRef,
    {
      status,
      updatedAt: serverTimestamp(),
      ...payload
    },
    { merge: true }
  );
}

export async function saveUploadRecord({
  teamId,
  levelId,
  imageUrl,
  objectKey
}) {
  if (!teamId || !imageUrl) return;

  if (!isFirebaseEnabled || !db) return;

  const uploadsRef = collection(db, 'teams', teamId, 'uploads');
  const uploadRef = doc(uploadsRef);
  await setDoc(uploadRef, {
    levelId,
    imageUrl,
    objectKey: objectKey || null,
    createdAt: serverTimestamp()
  });
}

export async function markRecentScan({
  teamId,
  route,
  code
}) {
  if (!teamId || !route) return;

  if (!isFirebaseEnabled || !db) return;

  const scanRef = doc(db, 'teams', teamId, 'scanAccess', route.replaceAll('/', '__'));
  await setDoc(
    scanRef,
    {
      route,
      code: code || '',
      grantedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function setLevelCooldown({
  teamId,
  levelId,
  cooldownUntil
}) {
  if (!teamId || !levelId || !cooldownUntil) return;

  window.localStorage.setItem(getCooldownCacheKey(teamId, levelId), String(cooldownUntil));

  if (!isFirebaseEnabled || !db) return;

  const cooldownRef = doc(db, 'teams', teamId, 'cooldowns', levelId);
  await setDoc(
    cooldownRef,
    {
      cooldownUntil,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getLevelCooldown({ teamId, levelId }) {
  if (!teamId || !levelId) return null;

  const localValue = window.localStorage.getItem(getCooldownCacheKey(teamId, levelId));
  if (localValue) {
    const parsed = Number(localValue);
    if (Number.isFinite(parsed) && parsed > Date.now()) {
      return parsed;
    }
  }

  if (!isFirebaseEnabled || !db) return null;

  const cooldownRef = doc(db, 'teams', teamId, 'cooldowns', levelId);
  const snap = await getDoc(cooldownRef);
  if (!snap.exists()) return null;

  const value = Number(snap.data()?.cooldownUntil);
  if (!Number.isFinite(value)) return null;
  if (value <= Date.now()) return null;

  window.localStorage.setItem(getCooldownCacheKey(teamId, levelId), String(value));
  return value;
}
