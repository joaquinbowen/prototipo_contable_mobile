import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ContributorHomeScreen } from '../../screens/ContributorScreens';
import { useApp } from '../../state/AppState';
import { AdminOperationsScreen, ManagerScreen, VerificationScreen } from '../../screens/ParityScreens';
import { AccountantDashboardScreen } from '../../screens/AccountantScreens';

export default function HomeRoute() {
  const { activeRole, professionalVerification } = useApp();
  return <View style={styles.page}>{activeRole === 'GESTOR_CONTADORES' ? <ManagerScreen module="manager_dashboard" /> : activeRole === 'SUPER_ADMIN' ? <AdminOperationsScreen module="admin_console" /> : activeRole === 'CONTADOR_PROFESIONAL' && professionalVerification !== 'VERIFICADO' ? <VerificationScreen /> : activeRole === 'CONTADOR_PROFESIONAL' ? <AccountantDashboardScreen /> : <ContributorHomeScreen />}</View>;
}

const styles = StyleSheet.create({ page: { flex: 1 } });
