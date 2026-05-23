/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredAuthState,
  ensureAnonymousAuth,
  getStoredTeamName,
  subscribeAuthState,
  subscribeTeamDeletion,
  upsertTeamProfile
} from '../services/authService';
import { clearScanAccess } from '../services/scanAccessService';
import { clearLocalChallengeCache, getActiveChallengeSession, startChallengeSession } from '../services/progressService';

const AppSessionContext = createContext(null);
const ACTIVE_CHALLENGE_CACHE_PREFIX = 'ibr-active-challenge';

function getActiveChallengeCacheKey(teamId) {
  return `${ACTIVE_CHALLENGE_CACHE_PREFIX}:${teamId}`;
}

function readCachedActiveChallenge(teamId) {
  if (!teamId) return null;
  try {
    const raw = window.localStorage.getItem(getActiveChallengeCacheKey(teamId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const endsAtMs = Number(parsed?.endsAtMs);
    const startedAtMs = Number(parsed?.startedAtMs);
    if (!parsed?.id || !Number.isFinite(endsAtMs) || !Number.isFinite(startedAtMs)) {
      return null;
    }
    return {
      id: String(parsed.id),
      teamId,
      startedAtMs,
      endsAtMs
    };
  } catch {
    return null;
  }
}

function writeCachedActiveChallenge(teamId, session) {
  if (!teamId || !session?.id) return;
  const endsAtMs = Number(session.endsAtMs);
  const startedAtMs = Number(session.startedAtMs);
  if (!Number.isFinite(endsAtMs) || !Number.isFinite(startedAtMs)) return;

  window.localStorage.setItem(
    getActiveChallengeCacheKey(teamId),
    JSON.stringify({
      id: String(session.id),
      startedAtMs,
      endsAtMs
    })
  );
}

function clearCachedActiveChallenge(teamId) {
  if (!teamId) return;
  window.localStorage.removeItem(getActiveChallengeCacheKey(teamId));
}

export function AppSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState(getStoredTeamName());
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  const [impersonateUid, setImpersonateUid] = useState(window.localStorage.getItem('ibr-impersonate-uid') || null);
  const [impersonateName, setImpersonateName] = useState(window.localStorage.getItem('ibr-impersonate-name') || null);

  const clearSessionState = () => {
    window.localStorage.removeItem('ibr-impersonate-uid');
    window.localStorage.removeItem('ibr-impersonate-name');
    setImpersonateUid(null);
    setImpersonateName(null);

    clearStoredAuthState();
    clearScanAccess();
    clearLocalChallengeCache();
    if (user?.uid) {
      clearCachedActiveChallenge(user.uid);
    }
    setUser(null);
    setTeamName('');
    setActiveChallenge(null);
  };

  const bindTeamProfile = async (inputTeamName) => {
    const authUser = await ensureAnonymousAuth();
    const profile = await upsertTeamProfile({
      uid: authUser.uid,
      teamName: inputTeamName
    });
    const existingSession = await getActiveChallengeSession({ teamId: authUser.uid }).catch(() => null);
    const hasActiveSession = Boolean(existingSession?.id);

    if (!hasActiveSession) {
      clearScanAccess();
      clearLocalChallengeCache();
    }

    const session = hasActiveSession
      ? existingSession
      : await startChallengeSession({
          teamId: authUser.uid,
          teamName: profile.teamName
        });
    if (session?.id) {
      writeCachedActiveChallenge(authUser.uid, session);
    } else {
      clearCachedActiveChallenge(authUser.uid);
    }
    setUser(authUser);
    setTeamName(profile.teamName);
    setActiveChallenge(session);
    return profile;
  };

  useEffect(() => {
    const unsubscribe = subscribeAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let alive = true;
    const effectiveUid = impersonateUid || user?.uid;
    if (!effectiveUid) {
      setActiveChallenge(null);
      return () => {
        alive = false;
      };
    }

    const cached = readCachedActiveChallenge(effectiveUid);
    if (cached) {
      setActiveChallenge(cached);
    }

    getActiveChallengeSession({ teamId: effectiveUid })
      .then((session) => {
        if (!alive) return;
        const isValid = Boolean(session?.id);
        if (isValid) {
          setActiveChallenge(session);
          writeCachedActiveChallenge(effectiveUid, session);
          return;
        }
        setActiveChallenge(null);
        clearCachedActiveChallenge(effectiveUid);
      })
      .catch(() => {
        if (!alive) return;
        if (!cached) {
          setActiveChallenge(null);
        }
      });

    return () => {
      alive = false;
    };
  }, [user?.uid, impersonateUid]);

  // Listen for team document deletion (Admin action)
  useEffect(() => {
    if (impersonateUid) return; // Skip deletion subscription if impersonating
    if (!user?.uid || user?.isLocalFallback) return;
    // Only care if we actually have a team name (i.e., we are already "logged in" as a specific team)
    if (!teamName) return;

    const unsubscribe = subscribeTeamDeletion(user.uid, () => {
      console.log(`[AppSession] Team document for ${user.uid} was deleted (possibly by Admin). Clearing session.`);
      clearSessionState();
    });

    return unsubscribe;
  }, [user?.uid, teamName, impersonateUid]);


  const value = useMemo(() => {
    const effectiveTeamId = impersonateUid || user?.uid || null;
    const effectiveTeamName = impersonateUid ? impersonateName : teamName;

    return {
      user,
      teamId: effectiveTeamId,
      teamName: effectiveTeamName,
      activeChallenge,
      setTeamName: impersonateUid ? () => {} : setTeamName,
      loading,
      bindTeamProfile,
      clearSessionState,
      
      // Impersonation features
      isImpersonating: Boolean(impersonateUid),
      realUser: user,
      startImpersonating: (uid, name) => {
        window.localStorage.setItem('ibr-impersonate-uid', uid);
        window.localStorage.setItem('ibr-impersonate-name', name);
        setImpersonateUid(uid);
        setImpersonateName(name);
      },
      stopImpersonating: () => {
        window.localStorage.removeItem('ibr-impersonate-uid');
        window.localStorage.removeItem('ibr-impersonate-name');
        setImpersonateUid(null);
        setImpersonateName(null);
      }
    };
  }, [user, teamName, activeChallenge, loading, impersonateUid, impersonateName]);

  return (
    <AppSessionContext.Provider value={value}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error('useAppSession must be used within AppSessionProvider');
  }
  return context;
}
