import React from 'react';
import { AccountantOpportunitiesScreen } from '../../screens/AccountantScreens';
import { VerificationScreen } from '../../screens/ParityScreens';
import { useApp } from '../../state/AppState';
export default function OpportunitiesRoute() { const { professionalVerification } = useApp(); return professionalVerification === 'VERIFICADO' ? <AccountantOpportunitiesScreen /> : <VerificationScreen />; }
