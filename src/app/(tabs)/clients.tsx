import React from 'react';
import { AccountantClientsScreen } from '../../screens/AccountantScreens';
import { VerificationScreen } from '../../screens/ParityScreens';
import { useApp } from '../../state/AppState';
export default function ClientsRoute() { const { professionalVerification } = useApp(); return professionalVerification === 'VERIFICADO' ? <AccountantClientsScreen /> : <VerificationScreen />; }
