import React from 'react';
import { AdminUsersScreen } from '../../screens/AdminScreens';
import { ManagerScreen } from '../../screens/ParityScreens';
import { useApp } from '../../state/AppState';
import { AdminOperationsScreen } from '../../screens/ParityScreens';
export default function UsersRoute() { const { activeRole } = useApp(); return activeRole === 'GESTOR_CONTADORES' ? <ManagerScreen module="manager_applications" /> : activeRole === 'SUPER_ADMIN' ? <AdminOperationsScreen module="admin_taxpayers" /> : <AdminUsersScreen />; }
