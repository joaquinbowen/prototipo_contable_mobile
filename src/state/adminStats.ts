import type { UserRole } from './types';
import type { EmissionStatus } from './documentStatus';

interface AdminStatsInput {
  users: { role: UserRole }[];
  documents: { status: EmissionStatus }[];
  marketplace: { offersCount: number }[];
  ocrReconciliations: number;
  vaultUsed: number;
  vaultLimit: number;
  services: { status: 'available' | 'simulated' | 'unavailable' }[];
}

export function calculateAdminStats(input: AdminStatsInput) {
  const usersByRole: Record<UserRole, number> = {
    CONTRIBUYENTE: 0,
    CONTADOR_PROFESIONAL: 0,
    SUPER_ADMIN: 0,
  };
  input.users.forEach(({ role }) => { usersByRole[role] += 1; });

  const documentsByStatus: Record<EmissionStatus, number> = {
    BORRADOR: 0,
    PENDIENTE_SRI: 0,
    APROBADO_ENVIADO: 0,
    DEVUELTO: 0,
  };
  input.documents.forEach(({ status }) => { documentsByStatus[status] += 1; });

  return {
    usersByRole,
    documentsByStatus,
    marketplaceOffers: input.marketplace.reduce((sum, request) => sum + request.offersCount, 0),
    ocrReconciliations: input.ocrReconciliations,
    vaultUsagePercent: input.vaultLimit > 0 ? Math.round((input.vaultUsed / input.vaultLimit) * 100) : 0,
    servicesAvailable: input.services.filter(({ status }) => status === 'available').length,
  };
}
