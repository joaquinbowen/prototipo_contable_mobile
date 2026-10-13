import React, { useEffect } from 'react';
import { Screen, TitleBlock } from '../../components/ui/primitives';
import { AccountantClientsScreen, AccountantDashboardScreen, AccountantOpportunitiesScreen } from '../../screens/AccountantScreens';
import { AdminOperationsScreen, ClientWorkspaceScreen, ManagerScreen, NotificationsScreen, VerificationScreen, WorkScreen } from '../../screens/ParityScreens';
import { BusinessOverviewScreen } from '../../screens/BusinessScreen';
import { PurchaseScreen } from '../../screens/PurchaseScreen';
import { ContributorHomeScreen, ContributorWorkspaceScreen, DocumentHistoryScreen } from '../../screens/ContributorScreens';
import { AdminServicesScreen } from '../../screens/AdminScreens';
import { ProfileScreen } from '../../screens/ProfileScreen';
import SignPdfScreen from '../../screens/SignPdfScreen';
import { useApp } from '../../state/AppState';
import { getModuleForRole } from '../../state/navigation';

export default function ModuleRoute() {
  const { activeRole, activeModule, professionalVerification, setSelectedDocumentType } = useApp();
  const module = getModuleForRole(activeRole, activeModule);
  useEffect(() => {
    if (activeModule === 'invoicing') setSelectedDocumentType('FACTURA');
  }, [activeModule, setSelectedDocumentType]);

  if (!module) return <Screen><TitleBlock title="Sección no disponible" subtitle="Esta opción no está habilitada para el perfil actual." /></Screen>;
  if (activeRole === 'CONTADOR_PROFESIONAL' && professionalVerification !== 'VERIFICADO' && !['verification', 'profile'].includes(activeModule)) return <VerificationScreen />;
  if (activeModule === 'dashboard') return activeRole === 'GESTOR_CONTADORES' ? <ManagerScreen module="manager_dashboard" /> : activeRole === 'SUPER_ADMIN' ? <AdminOperationsScreen module="admin_console" /> : <ContributorHomeScreen />;
  if (activeModule === 'business') return <BusinessOverviewScreen />;
  if (activeModule === 'invoicing') return <DocumentHistoryScreen />;
  if (activeModule === 'document_history') return <DocumentHistoryScreen />;
  if (activeModule === 'purchases') return <PurchaseScreen />;
  if (activeModule === 'marketplace' && activeRole === 'CONTADOR_PROFESIONAL') return <AccountantOpportunitiesScreen />;
  if (['inventory', 'calendar', 'marketplace'].includes(activeModule)) return <ContributorWorkspaceScreen area={activeModule as 'inventory' | 'calendar' | 'marketplace'} />;
  if (activeModule === 'sign_pdf') return <SignPdfScreen />;
  if (activeModule === 'vault') return <ProfileScreen initialSection="vault" />;
  if (activeModule === 'onboarding') return <ProfileScreen initialSection="ruc" />;
  if (activeModule === 'profile') return <ProfileScreen />;
  if (activeModule === 'notifications') return <NotificationsScreen />;
  if (activeModule === 'work') return <WorkScreen />;
  if (activeModule === 'accountant_dashboard') return <AccountantDashboardScreen />;
  if (activeModule === 'verification') return <VerificationScreen />;
  if (activeModule === 'accountant_proposals' || activeModule === 'admin_marketplace') return activeRole === 'CONTADOR_PROFESIONAL' ? <AccountantOpportunitiesScreen section="sent" /> : <AdminOperationsScreen module={activeModule} />;
  if (activeModule === 'accountant_clients') return <AccountantClientsScreen />;
  if (activeModule === 'client_workspace') return <ClientWorkspaceScreen />;
  if (activeModule.startsWith('manager_')) return <ManagerScreen module={activeModule} />;
  if (activeModule === 'admin_taxpayers' || activeModule === 'admin_accountants' || activeModule === 'admin_activity' || activeModule === 'admin_console') return <AdminOperationsScreen module={activeModule} />;
  if (activeModule === 'admin_services') return <AdminServicesScreen />;
  return <Screen><TitleBlock title={module.label} subtitle="Esta sección estará disponible en tu espacio de trabajo." /></Screen>;
}

