import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { clientPortfolio, opportunities } from './types';
import type { DocumentType, EvidenceType, MobileChatMessage, MobileDocument, MobileEvidence, MobileExpense, MobileInventoryItem, MobileMarketplaceRequest, MobilePayable, MobileTaxpayerProfile, UserRole } from './types';
import { getEmissionBlocker } from './documentStatus';

type DemoClient = (typeof clientPortfolio)[number];

interface AppState {
  isAuthenticated: boolean;
  authRole: UserRole;
  activeRole: UserRole;
  authMode: 'login' | 'register';
  selectedDocumentType: DocumentType | null;
  activeWorkspace: 'purchases' | 'expenses' | 'payables' | 'inventory' | 'calendar' | 'marketplace' | 'proposals' | 'vault';
  documents: MobileDocument[];
  inventory: MobileInventoryItem[];
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
  vaultFiles: string[];
  addVaultFile: (fileName: string) => void;
  selectedClient: DemoClient | null;
  sentProposals: string[];
  login: (role?: UserRole) => void;
  logout: () => void;
  setAuthRole: (role: UserRole) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setSelectedDocumentType: (type: DocumentType | null) => void;
  setActiveWorkspace: (area: AppState['activeWorkspace']) => void;
  addDocument: (customer: string, total: number) => Promise<'submitted' | 'certificate' | 'sri-account'>;
  reconcilePurchase: (purchaseId: string, actions: { expense: boolean; payable: boolean; inventory: boolean }) => boolean;
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
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('CONTRIBUYENTE');
  const [activeRole, setActiveRole] = useState<UserRole>('CONTRIBUYENTE');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<AppState['activeWorkspace']>('purchases');
  const [documents, setDocuments] = useState<MobileDocument[]>([
    { id: '001-001-000000124', type: 'FACTURA', customer: 'Papelería San Luis', date: '08 oct 2026', total: 86.25, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000124' },
    { id: '001-001-000000123', type: 'FACTURA', customer: 'Café La Floresta', date: '06 oct 2026', total: 43.5, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000123' },
    { id: '001-001-000000122', type: 'NOTA_CREDITO', customer: 'Librería Central', date: '02 oct 2026', total: 15.0, status: 'APROBADO_ENVIADO', signedAutomatically: true, demoAccessKey: 'DEMO-001001000000122' },
  ]);
  const [inventory, setInventory] = useState<MobileInventoryItem[]>([
    { id: 'sku-1', name: 'Resma papel A4', code: 'PAP-A4-001', stock: 24, cost: 4.2 },
    { id: 'sku-2', name: 'Tinta negra 664', code: 'TIN-664-N', stock: 8, cost: 12.75 },
    { id: 'sku-3', name: 'Carpeta archivadora', code: 'CAR-ARCH-02', stock: 42, cost: 1.65 },
  ]);
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
    ruc: '', razonSocial: '', nombreComercial: '', regimen: '', actividades: '', establecimiento: '', obligaciones: [], address: '',
  });
  const [ocrReconciliations, setOcrReconciliations] = useState(0);
  const [chatMessages, setChatMessages] = useState<MobileChatMessage[]>([]);
  const [clientPermissions, setClientPermissions] = useState({ invoices2026: false, sriTaxAccess: false, bankStatements: false });
  const [vaultFiles, setVaultFiles] = useState<string[]>(['RUC-1792847592001.pdf', 'Declaración-IVA-semestral.pdf']);
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const [sentProposals, setSentProposals] = useState<string[]>([]);
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
    authMode,
    selectedDocumentType,
    activeWorkspace,
    documents,
    inventory,
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
    vaultFiles,
    selectedClient,
    sentProposals,
    login: (role = authRole) => {
      setActiveRole(role);
      setAuthRole(role);
      setSelectedClient(null);
      setIsAuthenticated(true);
      setSelectedDocumentType(null);
    },
    logout: () => {
      setIsAuthenticated(false);
      setSelectedClient(null);
      setSelectedDocumentType(null);
      setAuthMode('login');
    },
    setAuthRole,
    setAuthMode,
    setSelectedDocumentType,
    setActiveWorkspace,
    addDocument: async (customer, total) => {
      const blocker = getEmissionBlocker(signatureConfigured, sriAccountConfigured);
      if (blocker) return blocker;
      const createdId = `001-001-${String(Date.now()).slice(-9)}`;
      setDocuments((items) => [{
        id: createdId,
        type: selectedDocumentType ?? 'FACTURA',
        customer,
        date: new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
        total,
        status: 'PENDIENTE_SRI',
        signedAutomatically: true,
        demoAccessKey: `DEMO-${createdId}`,
      }, ...items]);
      setSelectedDocumentType(null);
      setTimeout(() => setDocuments((items) => items.map((item) => item.id === createdId ? { ...item, status: 'APROBADO_ENVIADO' } : item)), 2400);
      await new Promise((resolve) => setTimeout(resolve, 2200));
      return 'submitted';
    },
    reconcilePurchase: (purchaseId, actions) => {
      if (reconciledPurchaseIds.includes(purchaseId) || !Object.values(actions).some(Boolean)) return false;
      setReconciledPurchaseIds((ids) => [...ids, purchaseId]);
      if (actions.inventory) setInventory((items) => items.map((item, index) => index === 0 ? { ...item, stock: item.stock + 6 } : item));
      if (actions.expense) setExpenses((items) => [{ id: `expense-${purchaseId}`, supplier: 'Distribuidora Papelera', concept: 'Factura de compra OCR', total: 144.9 }, ...items]);
      if (actions.payable) setPayables((items) => [{ id: `payable-${purchaseId}`, supplier: 'Distribuidora Papelera', total: 144.9, dueDate: '31 oct 2026', status: 'Pendiente · demo' }, ...items]);
      setOcrReconciliations((count) => count + 1);
      return true;
    },
    setAttachedRuc,
    setCertificateName,
    completeSignatureSetup: (expiryDate) => { setSignatureExpiryDate(expiryDate); setSignatureConfigured(true); },
    completeSriSetup: (username) => { setSriUsername(username); setSriAccountConfigured(true); },
    simulateRucExtraction: () => setTaxpayerProfile({ ruc: '1792847592001', razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.', nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS', regimen: 'RIMPE - Emprendedor', actividades: 'Servicios profesionales y comerciales', establecimiento: '001 · Av. Amazonas y República, Quito', obligaciones: ['Declaración Semestral IVA (Julio/Enero)', 'Impuesto a la Renta Anual'], address: 'Av. Amazonas y República, Quito' }),
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
    acceptMarketplaceOffer: (requestId, offerId) => setMarketplaceRequests((items) => items.map((request) => request.id === requestId ? { ...request, acceptedOfferId: offerId, offers: request.offers.map((offer) => ({ ...offer, accepted: offer.id === offerId })) } : request)),
  }), [activeRole, activeWorkspace, attachedRuc, authMode, authRole, certificateName, clientPermissions, chatMessages, documents, evidence, expenses, inventory, isAuthenticated, marketplaceRequests, ocrReconciliations, payables, reconciledPurchaseIds, selectedClient, selectedDocumentType, sentProposals, signatureConfigured, signatureExpiryDate, sriAccountConfigured, sriUsername, taxpayerProfile, vaultFiles]);

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
}

export { clientPortfolio, opportunities };
export type { EvidenceType, DemoClient };
