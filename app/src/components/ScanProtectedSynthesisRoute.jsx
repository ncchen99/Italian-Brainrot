import React from 'react';
import { Navigate } from 'react-router-dom';
import SynthesisRoom from '../pages/SynthesisRoom';
import { hasScanAccess } from '../services/scanAccessService';

export default function ScanProtectedSynthesisRoute() {
  if (!hasScanAccess('/synthesis')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SynthesisRoom />;
}
