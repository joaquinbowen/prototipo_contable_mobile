import type { UserRole } from './types';

export type AccessMode = 'login' | 'register';

export function getAccessIdentifierField(mode: AccessMode, role: UserRole) {
  if (mode === 'register') {
    return { label: 'Correo electrónico', placeholder: 'nombre@negocio.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const };
  }
  if (role === 'SUPER_ADMIN') {
    return { label: 'Usuario administrador', placeholder: 'Usuario de demostración', keyboardType: 'default' as const, autoCapitalize: 'none' as const };
  }
  return {
    label: role === 'CONTADOR_PROFESIONAL' ? 'RUC del estudio contable' : 'RUC',
    placeholder: 'Ingresa los 13 dígitos del RUC',
    keyboardType: 'numeric' as const,
    autoCapitalize: 'none' as const,
  };
}

export function isValidAccessRuc(value: string): boolean {
  return /^\d{13}$/.test(value.trim());
}
