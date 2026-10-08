import { describe, expect, it } from 'vitest';
import { formatDueDate, getDueDayFromRuc, getNextDueDate } from './taxCalendar';
import { getDocumentStatusLabel, getEmissionBlocker } from './documentStatus';
import { calculateAdminStats } from './adminStats';

describe('cross-platform behavior contract', () => {
  it('calculates the ninth-digit statutory base due day and rejects incomplete RUCs', () => {
    expect(getDueDayFromRuc('1792847592001')).toBe(26);
    expect(getDueDayFromRuc('123')).toBeNull();
  });

  it('derives an upcoming deadline from the obligation and RUC digit', () => {
    expect(getNextDueDate('IVA mensual', '1792847592001', new Date(2026, 9, 8)))?.toEqual(new Date(2026, 9, 26));
    expect(getNextDueDate('IVA mensual', '123', new Date(2026, 9, 8))).toBeNull();
    expect(formatDueDate(null)).toBe('Configura el RUC');
  });

  it('uses the exact pending and approved emission labels', () => {
    expect(getDocumentStatusLabel('PENDIENTE_SRI')).toBe('Pendiente por aprobación del SRI');
    expect(getDocumentStatusLabel('APROBADO_ENVIADO')).toBe('Aprobado por el SRI y enviado');
  });

  it('requires one-time certificate and SRI profile setup before simulating transmission', () => {
    expect(getEmissionBlocker(false, false)).toBe('certificate');
    expect(getEmissionBlocker(true, false)).toBe('sri-account');
    expect(getEmissionBlocker(true, true)).toBeNull();
  });

  it('aggregates superadmin statistics only from the supplied demo records', () => {
    const stats = calculateAdminStats({
      users: [{ role: 'CONTRIBUYENTE' }, { role: 'CONTADOR_PROFESIONAL' }, { role: 'CONTRIBUYENTE' }],
      documents: [{ status: 'PENDIENTE_SRI' }, { status: 'APROBADO_ENVIADO' }, { status: 'APROBADO_ENVIADO' }],
      marketplace: [{ offersCount: 2 }, { offersCount: 1 }],
      ocrReconciliations: 4,
      vaultUsed: 7,
      vaultLimit: 20,
      services: [{ status: 'available' }, { status: 'simulated' }, { status: 'available' }],
    });
    expect(stats.usersByRole).toEqual({ CONTRIBUYENTE: 2, CONTADOR_PROFESIONAL: 1, SUPER_ADMIN: 0 });
    expect(stats.documentsByStatus).toEqual({ BORRADOR: 0, PENDIENTE_SRI: 1, APROBADO_ENVIADO: 2, DEVUELTO: 0 });
    expect(stats.marketplaceOffers).toBe(3);
    expect(stats.ocrReconciliations).toBe(4);
    expect(stats.vaultUsagePercent).toBe(35);
    expect(stats.servicesAvailable).toBe(2);
  });
});
