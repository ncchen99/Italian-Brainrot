import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSession } from '../contexts/AppSessionContext';
import { getLevelCooldown, setLevelCooldown } from '../services/progressService';

const COOLDOWN_DURATION_MS = 5 * 60 * 1000;

function getStorageKey(levelId) {
  return `level-cooldown:${levelId}`;
}

function readStoredExpiry(levelId) {
  const raw = window.localStorage.getItem(getStorageKey(levelId));
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    window.localStorage.removeItem(getStorageKey(levelId));
    return null;
  }

  return parsed;
}

export function formatCooldownTime(remainingMs) {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function useLevelCooldown(levelId, durationMs = COOLDOWN_DURATION_MS) {
  const { teamId, activeChallenge } = useAppSession();
  const sessionScopedLevelId = activeChallenge?.id ? `${activeChallenge.id}:${levelId}` : levelId;
  const [cooldownUntil, setCooldownUntil] = useState(() => {
    const stored = readStoredExpiry(sessionScopedLevelId);
    const current = Date.now();
    if (stored && stored > current) {
      return stored;
    }
    if (stored) {
      window.localStorage.removeItem(getStorageKey(sessionScopedLevelId));
    }
    return null;
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const stored = readStoredExpiry(sessionScopedLevelId);
    const current = Date.now();
    if (stored && stored > current) {
      setCooldownUntil(stored);
      return;
    }
    setCooldownUntil(null);
  }, [sessionScopedLevelId]);

  useEffect(() => {
    let isMounted = true;
    const current = Date.now();

    if (teamId) {
      getLevelCooldown({ teamId, sessionId: activeChallenge?.id || null, levelId })
        .then((cloudExpiry) => {
          if (!isMounted || !cloudExpiry || cloudExpiry <= current) return;
          setCooldownUntil(cloudExpiry);
          window.localStorage.setItem(getStorageKey(sessionScopedLevelId), String(cloudExpiry));
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [activeChallenge?.id, levelId, sessionScopedLevelId, teamId]);

  useEffect(() => {
    if (!cooldownUntil) return undefined;

    const intervalId = window.setInterval(() => {
      const current = Date.now();
      setNow(current);

      if (current >= cooldownUntil) {
        window.localStorage.removeItem(getStorageKey(sessionScopedLevelId));
        setCooldownUntil(null);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownUntil, sessionScopedLevelId]);

  const triggerCooldown = useCallback(() => {
    const expiry = Date.now() + durationMs;
    window.localStorage.setItem(getStorageKey(sessionScopedLevelId), String(expiry));
    setCooldownUntil(expiry);
    setNow(Date.now());
    if (teamId) {
      setLevelCooldown({ teamId, sessionId: activeChallenge?.id || null, levelId, cooldownUntil: expiry }).catch(() => {});
    }
  }, [activeChallenge?.id, durationMs, levelId, sessionScopedLevelId, teamId]);

  const remainingMs = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, cooldownUntil - now);
  }, [cooldownUntil, now]);

  return {
    isCoolingDown: remainingMs > 0,
    remainingMs,
    triggerCooldown
  };
}
