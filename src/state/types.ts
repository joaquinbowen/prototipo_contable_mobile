export type UserRole = 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL' | 'SUPER_ADMIN';

export type DocumentType =
  | 'FACTURA'
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO'
  | 'RETENCION'
  | 'GUIA_REMISION'
  | 'LIQUIDACION_COMPRA';

export type EvidenceType = 'IVA mensual' | 'Impuesto a la renta' | 'ATS / anexo' | 'Otra obligación';

export interface MobileDocument {
  id: string;
  type: DocumentType;
  customer: string;
  date: string;
  total: number;
  status: import('./documentStatus').EmissionStatus;
  signedAutomatically: boolean;
  demoAccessKey: string;
}

export interface MobileTaxpayerProfile {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  regimen: string;
  actividades: string;
  establecimiento: string;
  obligaciones: string[];
  address: string;
}

export interface MobileChatMessage {
  id: string;
  sender: 'CONTRIBUYENTE' | 'CONTADOR';
  text: string;
  sentAt: string;
}

export interface MobileMarketplaceOffer {
  id: string;
  accountantName: string;
  price: number;
  estimatedTime: string;
  message: string;
  accepted: boolean;
}

export interface MobileMarketplaceRequest {
  id: string;
  title: string;
  description: string;
  budget: string;
  offers: MobileMarketplaceOffer[];
  acceptedOfferId: string | null;
}

export interface MobileInventoryItem {
  id: string;
  name: string;
  code: string;
  stock: number;
  cost: number;
}

export interface MobileExpense {
  id: string;
  supplier: string;
  concept: string;
  total: number;
}

export interface MobilePayable {
  id: string;
  supplier: string;
  total: number;
  dueDate: string;
  status: 'Pendiente · demo';
}

export interface MobileEvidence {
  id: string;
  clientId: string;
  clientName: string;
  obligation: EvidenceType;
  period: string;
  fileName: string;
  note: string;
  receivedAt: string;
}

export const documentTypes: { id: DocumentType; label: string }[] = [
  { id: 'FACTURA', label: 'Factura' },
  { id: 'NOTA_CREDITO', label: 'Nota de crédito' },
  { id: 'NOTA_DEBITO', label: 'Nota de débito' },
  { id: 'RETENCION', label: 'Comprobante de retención' },
  { id: 'GUIA_REMISION', label: 'Guía de remisión' },
  { id: 'LIQUIDACION_COMPRA', label: 'Liquidación de compra' },
];

export const clientPortfolio = [
  { id: 'client-1', name: 'Comercial Andina', ruc: '1792456789001', regime: 'Régimen general', next: 'IVA mensual', due: '12 oct 2026' },
  { id: 'client-2', name: 'Servicios Pichincha', ruc: '1791987654001', regime: 'RIMPE Emprendedor', next: 'Impuesto a la renta', due: '20 oct 2026' },
  { id: 'client-3', name: 'Taller Los Cedros', ruc: '1791765432001', regime: 'Régimen general', next: 'ATS / anexo', due: '28 oct 2026' },
];

export const opportunities = [
  { id: 'opp-1', title: 'Declaración de IVA mensual', client: 'Distribuidora El Sol', category: 'Declaración IVA', budget: '$40–$70', due: '12 oct' },
  { id: 'opp-2', title: 'Impuesto a la renta 2025', client: 'Consultora Prisma', category: 'Impuesto a la renta', budget: '$120–$200', due: '20 oct' },
];
