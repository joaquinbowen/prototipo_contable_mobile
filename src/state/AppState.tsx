import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { clientPortfolio, opportunities } from './types';
import type { DocumentType, EvidenceType, MobileDocument, MobileEvidence, MobileInventoryItem, UserRole } from './types';

type DemoClient = (typeof clientPortfolio)[number];

interface AppState {
  isAuthenticated: boolean;
  authRole: UserRole;
  activeRole: UserRole;
  authMode: 'login' | 'register';
  selectedDocumentType: DocumentType | null;
  activeWorkspace: 'purchases' | 'inventory' | 'calendar' | 'marketplace' | 'proposals' | 'vault';
  documents: MobileDocument[];
  inventory: MobileInventoryItem[];
  evidence: MobileEvidence[];
  attachedRuc: string | null;
  certificateName: string | null;
  selectedClient: DemoClient | null;
  sentProposals: string[];
  login: (role?: UserRole) => void;
  logout: () => void;
  setAuthRole: (role: UserRole) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setSelectedDocumentType: (type: DocumentType | null) => void;
  setActiveWorkspace: (area: AppState['activeWorkspace']) => void;
  addDocument: (customer: string, total: number) => void;
  reconcilePurchase: () => void;
  setAttachedRuc: (fileName: string | null) => void;
  setCertificateName: (fileName: string | null) => void;
  selectClient: (client: DemoClient | null) => void;
  addEvidence: (input: Omit<MobileEvidence, 'id' | 'receivedAt' | 'clientId' | 'clientName'>) => void;
  sendProposal: (opportunityId: string) => void;
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
    { id: '001-001-000000124', type: 'FACTURA', customer: 'Papelería San Luis', date: '08 oct 2026', total: 86.25, status: 'AUTORIZADO · demo' },
    { id: '001-001-000000123', type: 'FACTURA', customer: 'Café La Floresta', date: '06 oct 2026', total: 43.5, status: 'AUTORIZADO · demo' },
    { id: '001-001-000000122', type: 'NOTA_CREDITO', customer: 'Librería Central', date: '02 oct 2026', total: 15.0, status: 'AUTORIZADO · demo' },
  ]);
  const [inventory, setInventory] = useState<MobileInventoryItem[]>([
    { id: 'sku-1', name: 'Resma papel A4', code: 'PAP-A4-001', stock: 24, cost: 4.2 },
    { id: 'sku-2', name: 'Tinta negra 664', code: 'TIN-664-N', stock: 8, cost: 12.75 },
    { id: 'sku-3', name: 'Carpeta archivadora', code: 'CAR-ARCH-02', stock: 42, cost: 1.65 },
  ]);
  const [evidence, setEvidence] = useState<MobileEvidence[]>([]);
  const [attachedRuc, setAttachedRuc] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const [sentProposals, setSentProposals] = useState<string[]>([]);

  const state = useMemo<AppState>(() => ({
    isAuthenticated,
    authRole,
    activeRole,
    authMode,
    selectedDocumentType,
    activeWorkspace,
    documents,
    inventory,
    evidence,
    attachedRuc,
    certificateName,
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
    addDocument: (customer, total) => {
      setDocuments((items) => [{
        id: `001-001-${String(Date.now()).slice(-9)}`,
        type: selectedDocumentType ?? 'FACTURA',
        customer,
        date: new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
        total,
        status: 'AUTORIZADO · demo',
      }, ...items]);
      setSelectedDocumentType(null);
    },
    reconcilePurchase: () => setInventory((items) => items.map((item, index) => index === 0 ? { ...item, stock: item.stock + 6 } : item)),
    setAttachedRuc,
    setCertificateName,
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
    sendProposal: (id) => setSentProposals((items) => items.includes(id) ? items : [id, ...items]),
  }), [activeRole, activeWorkspace, attachedRuc, authMode, authRole, certificateName, documents, evidence, inventory, isAuthenticated, selectedClient, selectedDocumentType, sentProposals]);

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
}

export { clientPortfolio, opportunities };
export type { EvidenceType, DemoClient };
