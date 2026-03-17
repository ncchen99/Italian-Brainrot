import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import CharacterIntroPage from '../pages/CharacterIntroPage';
import { hasScanAccess } from '../services/scanAccessService';

export default function ScanProtectedIntroRoute() {
  const { characterId } = useParams();
  const introRoute = `/intro/${characterId || ''}`;
  const canAccess = hasScanAccess(introRoute);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <CharacterIntroPage />;
}
