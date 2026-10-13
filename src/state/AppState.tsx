import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { clientPortfolio, opportunities } from './types';
import type { DocumentType, EvidenceType, MobileChatMessage, MobileDocument, MobileEvidence, MobileExpense, MobileInventoryDecision, MobileInventoryItem, MobileInterviewAppointment, MobileInterviewAvailability, MobileInterviewModality, MobileMarketplaceRequest, MobileParsedPurchase, MobilePayable, MobileServiceContract, MobileTaxpayerProfile, ProfessionalDocuments, ProfessionalEvidence, ProfessionalProfile, ProfessionalVerificationStatus, UserRole } from './types';
import type { MobileModuleKey } from './navigation';
import { getEmissionBlocker } from './documentStatus';

type DemoClient = (typeof clientPortfolio)[number];

interface AppState {
  isAuthenticated: boolean;
  authRole: UserRole;
  activeRole: UserRole;
  accountantEmail: string;
  authMode: 'login' | 'register';
  selectedDocumentType: DocumentType | null;
  activeModule: MobileModuleKey;
  professionalVerification: ProfessionalVerificationStatus;
  professionalProfile: ProfessionalProfile;
  professionalDocuments: ProfessionalDocuments;
  professionalManagerNote: string;
  managerInterviewAvailability: MobileInterviewAvailability[];
  professionalInterview: MobileInterviewAppointment | null;
  availableInterviewSlots: { id: string; startsAt: string; modality: MobileInterviewModality; place: string }[];
  documents: MobileDocument[];
  inventory: MobileInventoryItem[];
  parsedPurchases: MobileParsedPurchase[];
  expenses: MobileExpense[];
  payables: MobilePayable[];
  reconciledPurchaseIds: string[];
  evidence: MobileEvidence[];
  attachedRuc: string | null;
  certificateName: string | null;
  signatureConfigured: boolean;
  signatureExpiryDate: string;
  sriAccountConfigured: boolean;
  sriUsername: string;
  taxpayerProfile: MobileTaxpayerProfile;
  ocrReconciliations: number;
  chatMessages: MobileChatMessage[];
  clientPermissions: { invoices2026: boolean; sriTaxAccess: boolean; bankStatements: boolean };
  marketplaceRequests: MobileMarketplaceRequest[];
  serviceContracts: MobileServiceContract[];
  vaultFiles: string[];
  addVaultFile: (fileName: string) => void;
  selectedClient: DemoClient | null;
  sentProposals: string[];
  resetDemo: () => void;
  notificationDismissed: boolean;
  dismissDemoNotification: () => void;
  login: (role?: UserRole) => void;
  loginDemo: (identifier: string) => boolean;
  registerDemo: (role: Extract<UserRole, 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL'>, displayName: string, email: string, ruc: string) => void;
  logout: () => void;
  setActiveRole: (role: UserRole) => void;
  setAuthRole: (role: UserRole) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setSelectedDocumentType: (type: DocumentType | null) => void;
  setActiveModule: (module: MobileModuleKey) => void;
  submitProfessionalVerification: () => void;
  updateProfessionalProfile: (key: keyof ProfessionalProfile, value: string) => void;
  updateProfessionalDocument: (key: 'cv' | 'title', file: ProfessionalEvidence | null) => void;
  addProfessionalCertifications: (files: ProfessionalEvidence[]) => void;
  reviewProfessionalVerification: (status: Exclude<ProfessionalVerificationStatus, 'PENDIENTE' | 'EN_REVISION'>, note?: string) => void;
  addManagerInterviewAvailability: (input: Omit<MobileInterviewAvailability, 'id'>) => string | null;
  removeManagerInterviewAvailability: (id: string) => void;
  scheduleProfessionalInterview: (slotId: string) => boolean;
  completeProfessionalInterview: (note: string) => boolean;
  addDocument: (input: { customer: string; total: number; clientRuc: string; clientEmail: string; clientAddress: string; dateISO: string; subtotal0: number; subtotal15: number; iva15: number; formaPago: string; observaciones?: string; items: { description: string; quantity: number; unitPrice: number; taxPercent: number }[] }) => Promise<'submitted' | 'certificate' | 'sri-account'>;
  addInventoryItem: (input: Omit<MobileInventoryItem, 'id'>) => boolean;
  importInventoryItems: (items: Omit<MobileInventoryItem, 'id'>[]) => boolean;
  simulatePurchaseOcr: (fileName: string) => MobileParsedPurchase;
  addExpense: (input: Pick<MobileExpense, 'supplier' | 'concept' | 'total' | 'dateISO' | 'category'>) => boolean;
  setPayableStatus: (id: string, paid: boolean) => void;
  reconcilePurchase: (purchaseId: string, actions: { expense: boolean; payable: boolean; inventory: boolean }, details: { supplier: string; supplierRuc: string; concept: string; invoiceNumber: string; total: number; quantity: number; inventoryItemId: string; dueDate: string; dateISO?: string; lines?: { quantity: number; unitCost: number; decision: MobileInventoryDecision }[] }) => boolean;
  setAttachedRuc: (fileName: string | null) => void;
  setCertificateName: (fileName: string | null) => void;
  completeSignatureSetup: (expiryDate: string) => void;
  completeSriSetup: (username: string) => void;
  simulateRucExtraction: () => void;
  confirmTaxpayerProfile: (profile: MobileTaxpayerProfile) => void;
  sendChatMessage: (text: string) => void;
  toggleClientPermission: (permission: keyof AppState['clientPermissions']) => void;
  selectClient: (client: DemoClient | null) => void;
  addEvidence: (input: Omit<MobileEvidence, 'id' | 'receivedAt' | 'clientId' | 'clientName'>) => void;
  createMarketplaceRequest: (input: Pick<MobileMarketplaceRequest, 'title' | 'description' | 'budget'>) => void;
  sendProposal: (requestId: string, input: { price: number; estimatedTime: string; message: string }) => void;
  acceptMarketplaceOffer: (requestId: string, offerId: string) => void;
  deliverWork: (contractId: string, file: { name: string; uri: string }, note: string) => boolean;
  requestWorkChanges: (contractId: string, note: string) => boolean;
  completeWork: (contractId: string) => boolean;
  reviewWork: (contractId: string, stars: number, comment: string) => boolean;
  messageWork: (contractId: string, text: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

function getAvailableInterviewSlots(rules: MobileInterviewAvailability[], booked: MobileInterviewAppointment | null) {
  const now = new Date();
  const slots: { id: string; startsAt: string; modality: MobileInterviewModality; place: string }[] = [];
  for (let offset = 0; offset < 60; offset += 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    for (const rule of rules.filter((item) => item.weekday === day.getDay())) {
      const toMinutes = (value: string) => value.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
      const start = toMinutes(rule.startsAt);
      const end = toMinutes(rule.endsAt);
      for (let minute = start; minute + 30 <= end; minute += 30) {
        const startsAt = new Date(day);
        startsAt.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        const iso = startsAt.toISOString();
        if (startsAt <= now || booked?.startsAt === iso || slots.some((slot) => slot.startsAt === iso)) continue;
        slots.push({ id: `${rule.id}:${iso}`, startsAt: iso, modality: rule.modality, place: rule.place });
      }
    }
  }
  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function AppProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('CONTRIBUYENTE');
  const [activeRole, setActiveRole] = useState<UserRole>('CONTRIBUYENTE');
  const [accountantEmail, setAccountantEmail] = useState('contador@demo.local');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [activeModule, setActiveModule] = useState<MobileModuleKey>('dashboard');
  const [professionalVerification, setProfessionalVerification] = useState<ProfessionalVerificationStatus>('PENDIENTE');
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile>({ fullName: '', email: '', city: '', phone: '', title: '', institution: '', graduationYear: '', experience: '', specialities: '', services: '', certifications: '' });
  const [professionalDocuments, setProfessionalDocuments] = useState<ProfessionalDocuments>({ cv: null, title: null, certifications: [] });
  const [professionalManagerNote, setProfessionalManagerNote] = useState('');
  const [managerInterviewAvailability, setManagerInterviewAvailability] = useState<MobileInterviewAvailability[]>([]);
  const [professionalInterview, setProfessionalInterview] = useState<MobileInterviewAppointment | null>(null);
  const availableInterviewSlots = getAvailableInterviewSlots(managerInterviewAvailability, professionalInterview);
  const [documents, setDocuments] = useState<MobileDocument[]>([
    { id: '001-001-000000124', type: 'FACTURA', customer: 'Papelería San Luis', date: '08 oct 2026', dateISO: '2026-10-08', total: 86.25, subtotal0: 0, subtotal15: 75, iva15: 11.25, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000124' },
    { id: '001-001-000000123', type: 'FACTURA', customer: 'Café La Floresta', date: '06 oct 2026', dateISO: '2026-10-06', total: 43.5, subtotal0: 0, subtotal15: 37.83, iva15: 5.67, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000123' },
    { id: '001-001-000000122', type: 'NOTA_CREDITO', customer: 'Librería Central', date: '02 oct 2026', dateISO: '2026-10-02', total: 15.0, subtotal0: 0, subtotal15: 13.04, iva15: 1.96, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000122' },
  ]);
  const [inventory, setInventory] = useState<MobileInventoryItem[]>([
    { id: 'sku-1', name: 'Resma papel A4', code: 'PAP-A4-001', stock: 24, cost: 4.2 },
    { id: 'sku-2', name: 'Tinta negra 664', code: 'TIN-664-N', stock: 8, cost: 12.75 },
    { id: 'sku-3', name: 'Carpeta archivadora', code: 'CAR-ARCH-02', stock: 42, cost: 1.65 },
  ]);
  const [parsedPurchases, setParsedPurchases] = useState<MobileParsedPurchase[]>([{
    id: 'purchase-example-1', fileName: 'Factura de ejemplo', supplier: 'Distribuidora Papelera', supplierRuc: '1792200112001', invoiceNumber: '001-002-000004321', dateISO: '2026-10-10',
    items: [{ description: 'Resma papel A4', quantity: 6, unitCost: 21 }, { description: 'Carpeta archivadora', quantity: 4, unitCost: 3.5 }], total: 161,
  }]);
  const [expenses, setExpenses] = useState<MobileExpense[]>([]);
  const [payables, setPayables] = useState<MobilePayable[]>([]);
  const [reconciledPurchaseIds, setReconciledPurchaseIds] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<MobileEvidence[]>([]);
  const [attachedRuc, setAttachedRuc] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [signatureConfigured, setSignatureConfigured] = useState(false);
  const [signatureExpiryDate, setSignatureExpiryDate] = useState('');
  const [sriAccountConfigured, setSriAccountConfigured] = useState(false);
  const [sriUsername, setSriUsername] = useState('');
  const [taxpayerProfile, setTaxpayerProfile] = useState<MobileTaxpayerProfile>({
    ruc: '1792847592001', email: 'facturacion@demotaxecuador.com', razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.', nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS', regimen: 'RIMPE - Emprendedor', actividades: 'Servicios profesionales y comerciales de tecnología y asesoría', establecimiento: '001 · Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras', obligaciones: ['Declaración Semestral IVA (Julio/Enero)', 'Impuesto a la Renta Anual'], address: 'Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras, Quito, Ecuador',
  });
  const [ocrReconciliations, setOcrReconciliations] = useState(0);
  const [chatMessages, setChatMessages] = useState<MobileChatMessage[]>([]);
  const [clientPermissions, setClientPermissions] = useState({ invoices2026: false, sriTaxAccess: false, bankStatements: false });
  const [vaultFiles, setVaultFiles] = useState<string[]>(['RUC-1792847592001.pdf', 'Declaración-IVA-semestral.pdf']);
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const [sentProposals, setSentProposals] = useState<string[]>([]);
  const [serviceContracts, setServiceContracts] = useState<MobileServiceContract[]>([]);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [marketplaceRequests, setMarketplaceRequests] = useState<MobileMarketplaceRequest[]>([
    { id: 'request-iva-demo', title: 'Declaración de IVA mensual', description: 'Revisión de compras y comprobantes del período.', budget: '$40–$70', acceptedOfferId: null, offers: [
      { id: 'offer-fernanda', accountantName: 'María Fernanda López', price: 45, estimatedTime: '2 días', message: 'Reviso comprobantes y preparo la declaración del mes.', accepted: false },
      { id: 'offer-sierra', accountantName: 'Estudio Contable Sierra', price: 55, estimatedTime: '3 días', message: 'Incluye conciliación de compras y resumen de presentación.', accepted: false },
    ] },
  ]);

  const state = useMemo<AppState>(() => ({
    isAuthenticated,
    authRole,
    activeRole,
    accountantEmail,
    authMode,
    selectedDocumentType,
    activeModule,
    professionalVerification,
    professionalProfile,
    professionalDocuments,
    professionalManagerNote,
    managerInterviewAvailability,
    professionalInterview,
    availableInterviewSlots,
    documents,
    inventory,
    parsedPurchases,
    expenses,
    payables,
    reconciledPurchaseIds,
    evidence,
    attachedRuc,
    certificateName,
    signatureConfigured,
    signatureExpiryDate,
    sriAccountConfigured,
    sriUsername,
    taxpayerProfile,
    ocrReconciliations,
    chatMessages,
    clientPermissions,
    marketplaceRequests,
    serviceContracts,
    vaultFiles,
    selectedClient,
    sentProposals,
    resetDemo: () => {
      setProfessionalVerification('PENDIENTE');
      setProfessionalProfile({ fullName: '', email: '', city: '', phone: '', title: '', institution: '', graduationYear: '', experience: '', specialities: '', services: '', certifications: '' });
      setProfessionalDocuments({ cv: null, title: null, certifications: [] });
      setProfessionalManagerNote(''); setManagerInterviewAvailability([]); setProfessionalInterview(null);
      setDocuments([
        { id: '001-001-000000124', type: 'FACTURA', customer: 'Papelería San Luis', date: '08 oct 2026', dateISO: '2026-10-08', total: 86.25, subtotal0: 0, subtotal15: 75, iva15: 11.25, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000124' },
        { id: '001-001-000000123', type: 'FACTURA', customer: 'Café La Floresta', date: '06 oct 2026', dateISO: '2026-10-06', total: 43.5, subtotal0: 0, subtotal15: 37.83, iva15: 5.67, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000123' },
        { id: '001-001-000000122', type: 'NOTA_CREDITO', customer: 'Librería Central', date: '02 oct 2026', dateISO: '2026-10-02', total: 15, subtotal0: 0, subtotal15: 13.04, iva15: 1.96, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000122' },
      ]);
      setInventory([{ id: 'sku-1', name: 'Resma papel A4', code: 'PAP-A4-001', stock: 24, cost: 4.2 }, { id: 'sku-2', name: 'Tinta negra 664', code: 'TIN-664-N', stock: 8, cost: 12.75 }, { id: 'sku-3', name: 'Carpeta archivadora', code: 'CAR-ARCH-02', stock: 42, cost: 1.65 }]);
      setParsedPurchases([{ id: 'purchase-example-1', fileName: 'Factura de ejemplo', supplier: 'Distribuidora Papelera', supplierRuc: '1792200112001', invoiceNumber: '001-002-000004321', dateISO: '2026-10-10', items: [{ description: 'Resma papel A4', quantity: 6, unitCost: 21 }, { description: 'Carpeta archivadora', quantity: 4, unitCost: 3.5 }], total: 161 }]);
      setExpenses([]); setPayables([]); setReconciledPurchaseIds([]); setEvidence([]); setAttachedRuc(null); setCertificateName(null);
      setSignatureConfigured(false); setSignatureExpiryDate(''); setSriAccountConfigured(false); setSriUsername(''); setTaxpayerProfile({ ruc: '1792847592001', email: 'facturacion@demotaxecuador.com', razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.', nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS', regimen: 'RIMPE - Emprendedor', actividades: 'Servicios profesionales y comerciales de tecnología y asesoría', establecimiento: '001 · Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras', obligaciones: ['Declaración Semestral IVA (Julio/Enero)', 'Impuesto a la Renta Anual'], address: 'Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras, Quito, Ecuador' });
      setOcrReconciliations(0); setChatMessages([]); setClientPermissions({ invoices2026: false, sriTaxAccess: false, bankStatements: false }); setVaultFiles(['RUC-1792847592001.pdf', 'Declaración-IVA-semestral.pdf']); setSelectedClient(null); setSentProposals([]); setServiceContracts([]);
      setMarketplaceRequests([{ id: 'request-iva-demo', title: 'Declaración de IVA mensual', description: 'Revisión de compras y comprobantes del período.', budget: '$40–$70', acceptedOfferId: null, offers: [{ id: 'offer-fernanda', accountantName: 'María Fernanda López', price: 45, estimatedTime: '2 días', message: 'Reviso comprobantes y preparo la declaración del mes.', accepted: false }, { id: 'offer-sierra', accountantName: 'Estudio Contable Sierra', price: 55, estimatedTime: '3 días', message: 'Incluye conciliación de compras y resumen de presentación.', accepted: false }] }]);
      setNotificationDismissed(false); setSelectedDocumentType(null);
    },
    login: (role = authRole) => {
      setActiveRole(role);
      setAuthRole(role);
      setSelectedClient(null);
      setIsAuthenticated(true);
      setSelectedDocumentType(null);
    },
    loginDemo: (identifier) => {
      const normalized = identifier.trim().toLowerCase();
      const role: UserRole | null = normalized === 'admin' ? 'SUPER_ADMIN' :
        [taxpayerProfile.email?.toLowerCase(), taxpayerProfile.ruc].includes(normalized) ? 'CONTRIBUYENTE' :
        normalized === accountantEmail.toLowerCase() ? 'CONTADOR_PROFESIONAL' : null;
      if (!role) return false;
      setActiveRole(role);
      setAuthRole(role);
      setActiveModule(role === 'SUPER_ADMIN' ? 'admin_console' : role === 'CONTADOR_PROFESIONAL' ? 'verification' : 'dashboard');
      setSelectedClient(null);
      setIsAuthenticated(true);
      setSelectedDocumentType(null);
      return true;
    },
    registerDemo: (role, displayName, email, ruc) => {
      setActiveRole(role);
      setAuthRole(role);
      setSelectedClient(null);
      setIsAuthenticated(true);
      setSelectedDocumentType(null);
      if (role === 'CONTRIBUYENTE') {
        setTaxpayerProfile((profile) => ({ ...profile, razonSocial: displayName, email, ruc }));
        setActiveModule('onboarding');
      } else {
        setAccountantEmail(email);
        setProfessionalVerification('PENDIENTE');
        setProfessionalProfile((profile) => ({ ...profile, fullName: displayName, email }));
        setProfessionalDocuments({ cv: null, title: null, certifications: [] });
        setProfessionalManagerNote(''); setProfessionalInterview(null);
        setActiveModule('verification');
      }
    },
    logout: () => {
      setIsAuthenticated(false);
      setSelectedClient(null);
      setSelectedDocumentType(null);
      setAuthMode('login');
    },
    setActiveRole: (role) => {
      setActiveRole(role);
      setAuthRole(role);
      setSelectedClient(null);
      setSelectedDocumentType(null);
      setActiveModule(role === 'SUPER_ADMIN' ? 'admin_console' : role === 'GESTOR_CONTADORES' ? 'manager_dashboard' : role === 'CONTADOR_PROFESIONAL' ? 'verification' : 'dashboard');
    },
    setAuthRole,
    setAuthMode,
    setSelectedDocumentType,
    setActiveModule,
    submitProfessionalVerification: () => {
      if (activeRole !== 'CONTADOR_PROFESIONAL') return;
      const requiredFields: (keyof ProfessionalProfile)[] = ['fullName', 'email', 'city', 'phone', 'title', 'institution', 'graduationYear', 'experience', 'specialities', 'services'];
      if (requiredFields.some((key) => !professionalProfile[key].trim()) || !professionalDocuments.cv || !professionalDocuments.title) return;
      setProfessionalVerification('EN_REVISION');
    },
    updateProfessionalProfile: (key, value) => setProfessionalProfile((profile) => ({ ...profile, [key]: value })),
    updateProfessionalDocument: (key, file) => setProfessionalDocuments((files) => ({ ...files, [key]: file })),
    addProfessionalCertifications: (files) => setProfessionalDocuments((current) => ({ ...current, certifications: [...current.certifications, ...files] })),
    reviewProfessionalVerification: (status, note = '') => {
      if (activeRole !== 'GESTOR_CONTADORES') return;
      const allowed: Partial<Record<ProfessionalVerificationStatus, ProfessionalVerificationStatus[]>> = {
        EN_REVISION: ['OBSERVADO', 'HABILITADO_PARA_ENTREVISTA'],
        PENDIENTE_DECISION: ['VERIFICADO', 'RECHAZADO'],
        VERIFICADO: ['SUSPENDIDO'],
      };
      if (!allowed[professionalVerification]?.includes(status)) return;
      if (['OBSERVADO', 'RECHAZADO', 'SUSPENDIDO'].includes(status) && !note.trim()) return;
      setProfessionalManagerNote(note.trim());
      setProfessionalVerification(status);
    },
    addManagerInterviewAvailability: (input) => {
      if (activeRole !== 'GESTOR_CONTADORES') return 'Solo el gestor puede configurar horarios.';
      if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startsAt) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endsAt) || input.startsAt >= input.endsAt || !input.place.trim()) return 'Completa el día, una franja válida y el lugar o enlace.';
      const start = input.startsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
      const end = input.endsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
      const overlaps = managerInterviewAvailability.some((item) => {
        if (item.weekday !== input.weekday) return false;
        const itemStart = item.startsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
        const itemEnd = item.endsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
        return start < itemEnd && itemStart < end;
      });
      if (overlaps) return 'Esta franja se cruza con otra disponibilidad del mismo día.';
      setManagerInterviewAvailability((items) => [...items, { ...input, id: `availability-${Date.now()}` }]);
      return null;
    },
    removeManagerInterviewAvailability: (id) => setManagerInterviewAvailability((items) => items.filter((item) => item.id !== id)),
    scheduleProfessionalInterview: (slotId) => {
      if (activeRole !== 'CONTADOR_PROFESIONAL' || professionalVerification !== 'HABILITADO_PARA_ENTREVISTA') return false;
      const slot = availableInterviewSlots.find((item) => item.id === slotId);
      if (!slot) return false;
      setProfessionalInterview({ ...slot, accountantName: professionalProfile.fullName, accountantEmail: professionalProfile.email, completed: false });
      setProfessionalVerification('ENTREVISTA_AGENDADA');
      return true;
    },
    completeProfessionalInterview: (note) => {
      if (activeRole !== 'GESTOR_CONTADORES' || professionalVerification !== 'ENTREVISTA_AGENDADA' || !professionalInterview || !note.trim()) return false;
      setProfessionalInterview((appointment) => appointment ? { ...appointment, completed: true, note: note.trim() } : null);
      setProfessionalManagerNote(note.trim());
      setProfessionalVerification('PENDIENTE_DECISION');
      return true;
    },
    addDocument: async (input) => {
      const blocker = getEmissionBlocker(signatureConfigured, sriAccountConfigured);
      if (blocker) return blocker;
      const createdId = `001-001-${String(Date.now()).slice(-9)}`;
      setDocuments((items) => [{
        id: createdId,
        type: selectedDocumentType ?? 'FACTURA',
        customer: input.customer,
        clientRuc: input.clientRuc,
        clientEmail: input.clientEmail,
        clientAddress: input.clientAddress,
        subtotal0: input.subtotal0,
        subtotal15: input.subtotal15,
        iva15: input.iva15,
        formaPago: input.formaPago,
        observaciones: input.observaciones,
        items: input.items,
        date: new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${input.dateISO}T12:00:00`)),
        dateISO: input.dateISO,
        total: input.total,
        status: 'PENDIENTE_SRI',
        signedAutomatically: true,
        demoAccessKey: `DEMO-${createdId}`,
      }, ...items]);
      setSelectedDocumentType(null);
      setTimeout(() => setDocuments((items) => items.map((item) => item.id === createdId ? { ...item, status: 'APROBADO_ENVIADO' } : item)), 2400);
      await new Promise((resolve) => setTimeout(resolve, 2200));
      return 'submitted';
    },
    addInventoryItem: (input) => {
      if (!input.name.trim() || !input.code.trim() || !Number.isFinite(input.stock) || input.stock < 0 || !Number.isFinite(input.cost) || input.cost < 0 || inventory.some((item) => item.code.toLowerCase() === input.code.trim().toLowerCase())) return false;
      setInventory((items) => [{ ...input, id: `sku-${Date.now()}`, name: input.name.trim(), code: input.code.trim(), category: input.category?.trim() || 'General', unit: input.unit?.trim() || 'unidad' }, ...items]);
      return true;
    },
    importInventoryItems: (items) => {
      const seen = new Set(inventory.map((item) => item.code.toLowerCase()));
      if (!items.length || items.some((item) => { const code = item.code.trim().toLowerCase(); if (!code || seen.has(code) || !item.name.trim() || !item.unit?.trim() || !Number.isFinite(item.stock) || item.stock < 0 || !Number.isFinite(item.cost) || item.cost < 0) return true; seen.add(code); return false; })) return false;
      setInventory((current) => [...items.map((item, index) => ({ ...item, id: `sku-import-${Date.now()}-${index}` })), ...current]);
      return true;
    },
    simulatePurchaseOcr: (fileName) => {
      const id = `purchase-${Date.now()}`;
      const purchase: MobileParsedPurchase = { id, fileName, supplier: 'Proveedor detectado · demo', supplierRuc: '1792200112001', invoiceNumber: `001-001-${String(Date.now()).slice(-9)}`, dateISO: new Date().toISOString().slice(0, 10), items: [{ description: 'Resma papel A4', quantity: 6, unitCost: 21 }, { description: 'Carpeta archivadora', quantity: 4, unitCost: 3.5 }], total: 161 };
      setParsedPurchases((items) => [purchase, ...items]);
      return purchase;
    },
    addExpense: (input) => {
      if (!input.supplier.trim() || !input.concept.trim() || !Number.isFinite(input.total) || input.total <= 0 || !input.dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateISO)) return false;
      setExpenses((items) => [{ ...input, id: `expense-manual-${Date.now()}`, supplier: input.supplier.trim(), concept: input.concept.trim(), category: input.category?.trim() || 'Otros gastos' }, ...items]);
      return true;
    },
    setPayableStatus: (id, paid) => setPayables((items) => items.map((item) => item.id === id ? { ...item, status: paid ? 'PAGADO' : 'PENDIENTE' } : item)),
    reconcilePurchase: (purchaseId, actions, details) => {
      const lines = details.lines;
      if (reconciledPurchaseIds.includes(purchaseId) || !Object.values(actions).some(Boolean) || !details.supplier.trim() || !details.concept.trim() || !details.invoiceNumber.trim() || !Number.isFinite(details.total) || details.total <= 0 || !Number.isFinite(details.quantity) || details.quantity <= 0) return false;
      if (actions.inventory && lines) {
        const codes = new Set(inventory.map((item) => item.code.toLowerCase()));
        if (!lines.length || lines.some((line) => {
          const decision = line.decision;
          if (!Number.isFinite(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.unitCost) || line.unitCost < 0) return true;
          if (decision.mode === 'EXISTING') return !inventory.some((item) => item.id === decision.itemId);
          const code = decision.item.code.trim().toLowerCase();
          if (!code || codes.has(code) || !decision.item.name.trim() || !decision.item.unit?.trim()) return true;
          codes.add(code);
          return false;
        })) return false;
      } else if (actions.inventory && !details.inventoryItemId) return false;
      setReconciledPurchaseIds((ids) => [...ids, purchaseId]);
      if (actions.inventory) setInventory((items) => {
        if (!lines) return items.map((item) => item.id === details.inventoryItemId ? { ...item, stock: item.stock + details.quantity, lastSource: details.invoiceNumber } : item);
        const next = [...items];
        lines.forEach((line, index) => {
          const decision = line.decision;
          if (decision.mode === 'EXISTING') {
            const found = next.findIndex((item) => item.id === decision.itemId);
            if (found >= 0) { const current = next[found], stock = current.stock + line.quantity; next[found] = { ...current, stock, cost: stock ? (current.stock * current.cost + line.quantity * line.unitCost) / stock : line.unitCost, lastSource: details.invoiceNumber }; }
          } else next.unshift({ ...decision.item, id: `sku-${purchaseId}-${index}`, stock: line.quantity, cost: line.unitCost, lastSource: details.invoiceNumber });
        });
        return next;
      });
      if (actions.expense) setExpenses((items) => [{ id: `expense-${purchaseId}`, supplier: details.supplier.trim(), supplierRuc: details.supplierRuc.trim(), invoiceNumber: details.invoiceNumber.trim(), concept: details.concept.trim(), total: details.total, dateISO: details.dateISO || new Date().toISOString().slice(0, 10), category: 'Compras' }, ...items]);
      if (actions.payable) setPayables((items) => [{ id: `payable-${purchaseId}`, supplier: details.supplier.trim(), supplierRuc: details.supplierRuc.trim(), invoiceNumber: details.invoiceNumber.trim(), total: details.total, dueDate: details.dueDate, status: 'PENDIENTE' }, ...items]);
      setParsedPurchases((items) => items.filter((item) => item.id !== purchaseId));
      setOcrReconciliations((count) => count + 1);
      return true;
    },
    setAttachedRuc,
    setCertificateName,
    completeSignatureSetup: (expiryDate) => { setSignatureExpiryDate(expiryDate); setSignatureConfigured(true); },
    completeSriSetup: (username) => { setSriUsername(username); setSriAccountConfigured(true); },
    simulateRucExtraction: () => setTaxpayerProfile({ ruc: '1792847592001', email: taxpayerProfile.email ?? 'facturacion@demotaxecuador.com', razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.', nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS', regimen: 'RIMPE - Emprendedor', actividades: 'Servicios profesionales y comerciales de tecnología y asesoría', establecimiento: '001 · Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras', obligaciones: ['Declaración Semestral IVA (Julio/Enero)', 'Impuesto a la Renta Anual'], address: 'Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras, Quito, Ecuador' }),
    confirmTaxpayerProfile: setTaxpayerProfile,
    sendChatMessage: (text) => { if (text.trim()) setChatMessages((items) => [{ id: `msg-${Date.now()}`, sender: activeRole === 'CONTADOR_PROFESIONAL' ? 'CONTADOR' : 'CONTRIBUYENTE', text: text.trim(), sentAt: new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' }).format(new Date()) }, ...items]); },
    toggleClientPermission: (permission) => setClientPermissions((items) => ({ ...items, [permission]: !items[permission] })),
    addVaultFile: (fileName) => setVaultFiles((items) => [fileName, ...items]),
    selectClient: setSelectedClient,
    addEvidence: (input) => {
      const client = selectedClient;
      if (!client) return;
      setEvidence((items) => [{
        ...input,
        id: `evidence-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        receivedAt: new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date()),
      }, ...items]);
    },
    createMarketplaceRequest: (input) => setMarketplaceRequests((items) => [{ ...input, id: `request-${Date.now()}`, offers: [], acceptedOfferId: null }, ...items]),
    sendProposal: (requestId, input) => {
      const offerId = `offer-${Date.now()}`;
      setMarketplaceRequests((items) => items.map((request) => request.id === requestId ? { ...request, offers: [...request.offers, { id: offerId, accountantName: 'Estudio contable demo', ...input, accepted: false }] } : request));
      setSentProposals((items) => items.includes(requestId) ? items : [requestId, ...items]);
    },
    acceptMarketplaceOffer: (requestId, offerId) => {
      const request = marketplaceRequests.find((item) => item.id === requestId);
      const offer = request?.offers.find((item) => item.id === offerId);
      if (request && offer && !serviceContracts.some((item) => item.requestId === requestId)) {
        const now = new Date().toISOString();
        setServiceContracts((items) => items.some((item) => item.requestId === requestId) ? items : [...items, {
          id: `contract-${Date.now()}`, requestId, clientId: 'DEMO-CLIENT', accountantId: 'DEMO-ACCOUNTANT', accountantName: offer.accountantName,
          title: request.title, scope: offer.message, priceUsd: offer.price, estimatedTime: offer.estimatedTime, status: 'EN_CURSO',
          deliveries: [], messages: [], review: null, events: [{ id: `event-${Date.now()}`, kind: 'CONTRATADO', note: `Propuesta de ${offer.accountantName} aceptada`, at: now }],
        }]);
      }
      setMarketplaceRequests((items) => items.map((item) => item.id === requestId ? { ...item, acceptedOfferId: offerId, offers: item.offers.map((entry) => ({ ...entry, accepted: entry.id === offerId })) } : item));
    },
    deliverWork: (contractId, file, note) => {
      const contract = serviceContracts.find((item) => item.id === contractId);
      if (!contract || activeRole !== 'CONTADOR_PROFESIONAL' || !file.name || !file.uri || !['EN_CURSO', 'CAMBIOS_SOLICITADOS'].includes(contract.status)) return false;
      setServiceContracts((items) => items.map((item) => item.id === contractId ? { ...item, status: 'ENTREGADO', deliveries: [...item.deliveries, { id: `delivery-${Date.now()}`, version: item.deliveries.length + 1, name: file.name, uri: file.uri, note: note.trim(), at: new Date().toISOString() }], events: [...item.events, { id: `event-${Date.now()}`, kind: 'ENTREGADO', note: note.trim() || file.name, at: new Date().toISOString() }] } : item));
      return true;
    },
    requestWorkChanges: (contractId, note) => {
      const contract = serviceContracts.find((item) => item.id === contractId);
      if (!contract || activeRole !== 'CONTRIBUYENTE' || contract.status !== 'ENTREGADO' || !note.trim()) return false;
      setServiceContracts((items) => items.map((item) => item.id === contractId ? { ...item, status: 'CAMBIOS_SOLICITADOS', events: [...item.events, { id: `event-${Date.now()}`, kind: 'CAMBIOS_SOLICITADOS', note: note.trim(), at: new Date().toISOString() }] } : item));
      return true;
    },
    completeWork: (contractId) => {
      const contract = serviceContracts.find((item) => item.id === contractId);
      if (!contract || activeRole !== 'CONTRIBUYENTE' || contract.status !== 'ENTREGADO') return false;
      setServiceContracts((items) => items.map((item) => item.id === contractId ? { ...item, status: 'COMPLETADO', events: [...item.events, { id: `event-${Date.now()}`, kind: 'COMPLETADO', note: 'Entrega aceptada por el cliente', at: new Date().toISOString() }] } : item));
      return true;
    },
    reviewWork: (contractId, stars, comment) => {
      const contract = serviceContracts.find((item) => item.id === contractId);
      if (!contract || activeRole !== 'CONTRIBUYENTE' || contract.status !== 'COMPLETADO' || contract.review || !Number.isInteger(stars) || stars < 1 || stars > 5) return false;
      setServiceContracts((items) => items.map((item) => item.id === contractId ? { ...item, review: { stars, comment: comment.trim() }, events: [...item.events, { id: `event-${Date.now()}`, kind: 'CALIFICADO', note: `${stars} estrellas`, at: new Date().toISOString() }] } : item));
      return true;
    },
    messageWork: (contractId, text) => {
      const contract = serviceContracts.find((item) => item.id === contractId);
      if (!contract || !text.trim() || !['CONTRIBUYENTE', 'CONTADOR_PROFESIONAL'].includes(activeRole)) return false;
      const authorId = activeRole === 'CONTRIBUYENTE' ? contract.clientId : contract.accountantId;
      setServiceContracts((items) => items.map((item) => item.id === contractId ? { ...item, messages: [...item.messages, { id: `message-${Date.now()}`, authorId, text: text.trim(), sentAt: new Date().toISOString() }], events: [...item.events, { id: `event-${Date.now()}`, kind: 'MENSAJE', note: 'Mensaje enviado', at: new Date().toISOString() }] } : item));
      return true;
    },
    dismissDemoNotification: () => setNotificationDismissed(true),
    notificationDismissed,
  }), [activeModule, activeRole, accountantEmail, attachedRuc, authMode, authRole, availableInterviewSlots, certificateName, clientPermissions, chatMessages, documents, evidence, expenses, inventory, isAuthenticated, managerInterviewAvailability, marketplaceRequests, notificationDismissed, ocrReconciliations, parsedPurchases, payables, professionalDocuments, professionalInterview, professionalManagerNote, professionalProfile, professionalVerification, reconciledPurchaseIds, selectedClient, selectedDocumentType, sentProposals, serviceContracts, signatureConfigured, signatureExpiryDate, sriAccountConfigured, sriUsername, taxpayerProfile, vaultFiles]);

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
}

export { clientPortfolio, opportunities };
export type { EvidenceType, DemoClient };
