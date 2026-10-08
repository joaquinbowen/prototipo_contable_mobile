export type EmissionStatus = 'BORRADOR' | 'PENDIENTE_SRI' | 'APROBADO_ENVIADO' | 'DEVUELTO';

const labels: Record<EmissionStatus, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_SRI: 'Pendiente por aprobación del SRI',
  APROBADO_ENVIADO: 'Aprobado por el SRI y enviado',
  DEVUELTO: 'Devuelto por el SRI',
};

export function getDocumentStatusLabel(status: EmissionStatus): string {
  return labels[status];
}

export function getEmissionBlocker(signatureConfigured: boolean, sriAccountConfigured: boolean): 'certificate' | 'sri-account' | null {
  if (!signatureConfigured) return 'certificate';
  if (!sriAccountConfigured) return 'sri-account';
  return null;
}
