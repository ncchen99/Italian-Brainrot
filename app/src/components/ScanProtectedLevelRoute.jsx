import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import LevelTaskContainer from '../pages/LevelTaskContainer';
import { hasScanAccess } from '../services/scanAccessService';

export default function ScanProtectedLevelRoute({ children, levelTitle, characterColor, levelId: levelIdProp }) {
  const { levelId: levelIdParam } = useParams();
  const levelId = levelIdProp || levelIdParam;
  const introRoute = `/intro/${levelId || ''}`;
  const canAccess = hasScanAccess(introRoute);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <LevelTaskContainer levelTitle={levelTitle} characterColor={characterColor}>
      {children}
    </LevelTaskContainer>
  );
}
