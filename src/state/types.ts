export type UserRole = 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL' | 'GESTOR_CONTADORES' | 'SUPER_ADMIN';

export type DocumentType =
  | 'FACTURA'
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO'
  | 'RETENCION'
  | 'GUIA_REMISION'
  | 'LIQUIDACION_COMPRA';

export type EvidenceType = 'IVA mensual' | 'Impuesto a la renta' | 'ATS / anexo' | 'Otra obligación';
export type ProfessionalVerificationStatus = 'PENDIENTE' | 'EN_REVISION' | 'OBSERVADO' | 'HABILITADO_PARA_ENTREVISTA' | 'ENTREVISTA_AGENDADA' | 'PENDIENTE_DECISION' | 'VERIFICADO' | 'RECHAZADO' | 'SUSPENDIDO';
export type MobileInterviewModality = 'VIRTUAL' | 'PRESENCIAL';
export type MobileInterviewAvailability = { id: string; weekday: number; startsAt: string; endsAt: string; modality: MobileInterviewModality; place: string };
export type MobileInterviewAppointment = { id: string; startsAt: string; modality: MobileInterviewModality; place: string; accountantName: string; accountantEmail: string; completed: boolean; note?: string };
export type ProfessionalProfile = {
  fullName: string;
  email: string;
  city: string;
  phone: string;
  title: string;
  institution: string;
  graduationYear: string;
  experience: string;
  specialities: string;
  services: string;
  certifications: string;
};
export type ProfessionalEvidence = { name: string; uri: string; size: number; type: string };
export type ProfessionalDocuments = { cv: ProfessionalEvidence | null; title: ProfessionalEvidence | null; certifications: ProfessionalEvidence[] };
export type MobileContractStatus = 'EN_CURSO' | 'ENTREGADO' | 'CAMBIOS_SOLICITADOS' | 'COMPLETADO';

export interface MobileServiceContract {
  id: string;
  requestId: string;
  clientId: string;
  accountantId: string;
  accountantName: string;
  title: string;
  scope: string;
  priceUsd: number;
  estimatedTime: string;
  status: MobileContractStatus;
  deliveries: { id: string; version: number; name: string; uri: string; note: string; at: string }[];
  messages: { id: string; authorId: string; text: string; sentAt: string }[];
  review: { stars: number; comment: string } | null;
  events: { id: string; kind: string; note: string; at: string }[];
}

export interface MobileDocument {
  id: string;
  type: DocumentType;
  customer: string;
  date: string;
  dateISO?: string;
  total: number;
  status: import('./documentStatus').EmissionStatus;
  signedAutomatically: boolean;
  demoAccessKey: string;
  clientRuc?: string;
  clientEmail?: string;
  clientAddress?: string;
  subtotal0?: number;
  subtotal15?: number;
  iva15?: number;
  formaPago?: string;
  observaciones?: string;
  items?: { description: string; quantity: number; unitPrice: number; taxPercent: number }[];
}

export interface MobileTaxpayerProfile {
  ruc: string;
  email?: string;
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
  category?: string;
  unit?: string;
  minimumStock?: number;
  salePrice?: number;
  use?: string;
  lastSource?: string;
  kind?: 'PRODUCTO' | 'INSUMO';
}

export interface MobileParsedPurchase {
  id: string;
  fileName: string;
  supplier: string;
  supplierRuc: string;
  invoiceNumber: string;
  dateISO: string;
  items: { description: string; quantity: number; unitCost: number }[];
  total: number;
}

export type MobileInventoryDecision =
  | { mode: 'EXISTING'; itemId: string }
  | { mode: 'NEW'; item: Omit<MobileInventoryItem, 'id' | 'stock' | 'cost'> };

export interface MobileExpense {
  id: string;
  supplier: string;
  concept: string;
  total: number;
  supplierRuc?: string;
  invoiceNumber?: string;
  dateISO?: string;
  category?: string;
}

export interface MobilePayable {
  id: string;
  supplier: string;
  total: number;
  dueDate: string;
  status: 'PENDIENTE' | 'PAGADO';
  supplierRuc?: string;
  invoiceNumber?: string;
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
