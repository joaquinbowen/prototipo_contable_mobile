import type { UserRole } from './types';

export type MobileTabKey =
  | 'home'
  | 'documents'
  | 'workspace'
  | 'profile'
  | 'opportunities'
  | 'clients'
  | 'users'
  | 'services';

export interface MobileTab {
  key: MobileTabKey;
  label: string;
  icon: 'home' | 'documents' | 'workspace' | 'profile' | 'opportunities' | 'clients' | 'users' | 'services';
}

const tabsByRole: Record<UserRole, MobileTab[]> = {
  CONTRIBUYENTE: [
    { key: 'home', label: 'Inicio', icon: 'home' },
    { key: 'documents', label: 'Documentos', icon: 'documents' },
    { key: 'workspace', label: 'Gestión', icon: 'workspace' },
    { key: 'profile', label: 'Perfil', icon: 'profile' },
  ],
  CONTADOR_PROFESIONAL: [
    { key: 'home', label: 'Resumen', icon: 'home' },
    { key: 'opportunities', label: 'Oportunidades', icon: 'opportunities' },
    { key: 'clients', label: 'Clientes', icon: 'clients' },
    { key: 'profile', label: 'Perfil', icon: 'profile' },
  ],
  SUPER_ADMIN: [
    { key: 'home', label: 'Resumen', icon: 'home' },
    { key: 'users', label: 'Usuarios', icon: 'users' },
    { key: 'services', label: 'Servicios', icon: 'services' },
    { key: 'profile', label: 'Perfil', icon: 'profile' },
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
