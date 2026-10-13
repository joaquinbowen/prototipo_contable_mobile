import React from 'react';
import { AdminServicesScreen } from '../../screens/AdminScreens';
import { ManagerScreen } from '../../screens/ParityScreens';
import { AdminOperationsScreen } from '../../screens/ParityScreens';
import { useApp } from '../../state/AppState';
export default function ServicesRoute() { const { activeRole } = useApp(); return activeRole === 'GESTOR_CONTADORES' ? <ManagerScreen module="manager_interviews" /> : activeRole === 'SUPER_ADMIN' ? <AdminOperationsScreen module="admin_marketplace" /> : <AdminServicesScreen />; }
