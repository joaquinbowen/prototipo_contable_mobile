import type { UserRole } from './types';

export type MobileTabKey =
  | 'home'
  | 'documents'
  | 'workspace'
  | 'profile'
  | 'opportunities'
  | 'clients'
  | 'users'
  | 'services'
  | 'more';

export type MobileModuleKey = 'dashboard' | 'business' | 'invoicing' | 'document_history' | 'purchases' | 'inventory' | 'calendar' | 'sign_pdf' | 'vault' | 'onboarding' | 'marketplace' | 'work' | 'notifications' | 'profile' | 'accountant_dashboard' | 'verification' | 'accountant_proposals' | 'accountant_clients' | 'client_workspace' | 'manager_dashboard' | 'manager_applications' | 'manager_interviews' | 'admin_console' | 'admin_marketplace' | 'admin_taxpayers' | 'admin_accountants' | 'admin_activity' | 'admin_services';

export interface MobileModule { key: MobileModuleKey; label: string; group: string; }

const modulesByRole: Record<UserRole, MobileModule[]> = {
  CONTRIBUYENTE: [
    { key: 'dashboard', label: 'Inicio', group: 'Tu negocio' }, { key: 'business', label: 'Mi negocio', group: 'Tu negocio' },
    { key: 'document_history', label: 'Documentos emitidos', group: 'Facturación y compras' },
    { key: 'purchases', label: 'Compras y OCR', group: 'Facturación y compras' }, { key: 'inventory', label: 'Inventario', group: 'Facturación y compras' },
    { key: 'calendar', label: 'Calendario tributario', group: 'Trámites y firma' }, { key: 'sign_pdf', label: 'Firmar PDF', group: 'Trámites y firma' },
    { key: 'marketplace', label: 'Buscar contador', group: 'Servicios contables' }, { key: 'work', label: 'Mis trabajos', group: 'Servicios contables' },
    { key: 'notifications', label: 'Notificaciones', group: 'Mi cuenta' }, { key: 'profile', label: 'Mi perfil', group: 'Mi cuenta' },
  ],
  CONTADOR_PROFESIONAL: [
    { key: 'accountant_dashboard', label: 'Resumen profesional', group: 'Perfil profesional' }, { key: 'verification', label: 'Mi verificación', group: 'Perfil profesional' },
    { key: 'marketplace', label: 'Oportunidades', group: 'Marketplace' }, { key: 'accountant_proposals', label: 'Mis propuestas', group: 'Marketplace' },
    { key: 'accountant_clients', label: 'Mis clientes', group: 'Clientes y trabajos' }, { key: 'work', label: 'Mis trabajos', group: 'Clientes y trabajos' },
    { key: 'notifications', label: 'Notificaciones', group: 'Mi cuenta' }, { key: 'profile', label: 'Mi perfil', group: 'Mi cuenta' },
  ],
  GESTOR_CONTADORES: [
    { key: 'manager_dashboard', label: 'Panel general', group: 'Seguimiento' }, { key: 'manager_applications', label: 'Expedientes', group: 'Verificación' }, { key: 'manager_interviews', label: 'Agenda de entrevistas', group: 'Verificación' },
  ],
  SUPER_ADMIN: [
    { key: 'admin_console', label: 'Panorama', group: 'Plataforma' }, { key: 'admin_activity', label: 'Actividad', group: 'Plataforma' },
    { key: 'admin_taxpayers', label: 'Contribuyentes', group: 'Usuarios' }, { key: 'admin_accountants', label: 'Contadores', group: 'Usuarios' }, { key: 'admin_marketplace', label: 'Marketplace', group: 'Servicios' },
  ],
};

export function getModulesForRole(role: UserRole): MobileModule[] { return modulesByRole[role]; }
export function getModuleForRole(role: UserRole, key: MobileModuleKey): MobileModule | undefined { return modulesByRole[role].find((module) => module.key === key); }

export interface MobileTab {
  key: MobileTabKey;
  label: string;
  icon: 'home' | 'documents' | 'workspace' | 'profile' | 'opportunities' | 'clients' | 'users' | 'services' | 'more';
}

const tabsByRole: Record<UserRole, MobileTab[]> = {
  CONTRIBUYENTE: [
    { key: 'home', label: 'Inicio', icon: 'home' },
    { key: 'workspace', label: 'Mi negocio', icon: 'workspace' },
    { key: 'documents', label: 'Documentos', icon: 'documents' },
    { key: 'more', label: 'Menú', icon: 'more' },
  ],
  CONTADOR_PROFESIONAL: [
    { key: 'home', label: 'Resumen', icon: 'home' },
    { key: 'opportunities', label: 'Oportunidades', icon: 'opportunities' },
    { key: 'clients', label: 'Clientes', icon: 'clients' },
    { key: 'more', label: 'Menú', icon: 'more' },
  ],
  GESTOR_CONTADORES: [
    { key: 'home', label: 'Resumen', icon: 'home' },
    { key: 'users', label: 'Expedientes', icon: 'users' },
    { key: 'services', label: 'Agenda', icon: 'services' },
    { key: 'more', label: 'Menú', icon: 'more' },
  ],
  SUPER_ADMIN: [
    { key: 'home', label: 'Resumen', icon: 'home' },
    { key: 'users', label: 'Usuarios', icon: 'users' },
    { key: 'services', label: 'Marketplace', icon: 'services' },
    { key: 'more', label: 'Menú', icon: 'more' },
  ],
};

export function getTabsForRole(role: UserRole): MobileTab[] {
  return tabsByRole[role];
}

export function getLandingTab(_role: UserRole): MobileTabKey {
  return 'home';
}

export function getRouteForSession(authenticated: boolean): '/login' | '/(tabs)' {
  return authenticated ? '/(tabs)' : '/login';
}
