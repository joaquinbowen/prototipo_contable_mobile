import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowUpRight, CalendarClock, Check, FilePlus2, FileUp, Package, ScanLine, Store, X } from 'lucide-react-native';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, Stat, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { documentTypes } from '../state/types';
import { getDocumentStatusLabel, getEmissionBlocker } from '../state/documentStatus';
import { formatDueDate, getDueDayFromRuc, getNextDueDate } from '../state/taxCalendar';
import { calculateAdminStats } from '../state/adminStats';
import { theme } from '../theme';

export function ContributorHomeScreen() {
  const { activeRole, documents, attachedRuc, signatureConfigured, sriAccountConfigured, taxpayerProfile, inventory, expenses, payables, ocrReconciliations, vaultFiles, marketplaceRequests, setSelectedDocumentType, setActiveWorkspace } = useApp();
  const [showNew, setShowNew] = useState(false);
  const sales = documents.reduce((sum, item) => sum + item.total, 0);
  const contributor = activeRole === 'CONTRIBUYENTE';
  const adminStats = calculateAdminStats({
    users: [{ role: 'CONTRIBUYENTE' }, { role: 'CONTRIBUYENTE' }, { role: 'CONTADOR_PROFESIONAL' }, { role: 'SUPER_ADMIN' }],
    documents,
    marketplace: marketplaceRequests.map((request) => ({ offersCount: request.offers.length })),
    ocrReconciliations,
    vaultUsed: vaultFiles.length,
    vaultLimit: 20,
    services: [{ status: 'available' }, { status: 'available' }, { status: 'available' }],
  });

  function chooseType(type: (typeof documentTypes)[number]['id']) {
    setShowNew(false);
    setSelectedDocumentType(type);
    router.push('/(tabs)/documents');
  }

  return <Screen>
    <TitleBlock eyebrow={contributor ? 'ESPACIO DEL NEGOCIO' : activeRole === 'CONTADOR_PROFESIONAL' ? 'ESPACIO PROFESIONAL' : 'ADMINISTRACIÓN'} title={contributor ? 'Hola, tu negocio.' : activeRole === 'CONTADOR_PROFESIONAL' ? 'Tu trabajo contable.' : 'Vista general'} subtitle={contributor ? 'Tus documentos y obligaciones, en un solo lugar.' : activeRole === 'CONTADOR_PROFESIONAL' ? 'Revisa tu cartera, oportunidades y tareas pendientes.' : 'Actividad y servicios de la plataforma · datos de demostración.'} />

    {contributor ? <>
      <Card style={styles.hero}><View style={styles.heroHeading}><View style={styles.heroIcon}><FilePlus2 size={18} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>EMISIÓN ELECTRÓNICA · DEMO</Text><Text style={styles.heroTitle}>¿Qué documento necesitas?</Text></View></View><Text style={styles.heroCopy}>Elige el tipo y completa sus datos paso a paso.</Text><Button title="Nuevo documento" onPress={() => setShowNew(true)} icon={<FilePlus2 size={17} color="#fff" />} /></Card>
      {(!attachedRuc || !signatureConfigured || !sriAccountConfigured) ? <Pressable onPress={() => router.push('/(tabs)/profile')}><Notice tone="warning">{!attachedRuc ? 'Falta cargar y revisar el PDF del RUC.' : !signatureConfigured ? 'Configura tu certificado una vez para firmar cada documento automáticamente.' : 'Configura la cuenta SRI para simular la sincronización de documentos.'} · Revisar perfil</Notice></Pressable> : <Notice tone="success">Perfil listo · firma automática y sincronización SRI de demostración.</Notice>}
      <View style={styles.stats}><Stat value={`$${sales.toFixed(2)}`} label="Ventas registradas · demo" /><Stat value={String(documents.length)} label="Documentos del mes" accent /></View>
      <Card><View style={styles.nextHeader}><View style={styles.calendarIcon}><CalendarClock size={18} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Próxima obligación</Text><Text style={styles.muted}>{taxpayerProfile.obligaciones[0] ?? 'Configura el RUC para ver tu fecha'}</Text></View><Pill tone="warning">{formatDueDate(getNextDueDate(taxpayerProfile.obligaciones[0] ?? 'IVA mensual', taxpayerProfile.ruc))}</Pill></View><Text style={styles.smallCopy}>Fecha base calculada por el noveno dígito del RUC; revisa feriados y ajustes en el calendario oficial del SRI.</Text><Button compact title="Ver calendario" variant="secondary" onPress={() => { setActiveWorkspace('calendar'); router.push('/(tabs)/workspace'); }} /></Card>
      <SectionTitle title="Actividad reciente" action="Ver historial" onAction={() => router.push('/(tabs)/documents')} />
      {documents.slice(0, 2).map((doc) => <Card key={doc.id} style={styles.compactCard}><View style={styles.activityRow}><View style={styles.activityIcon}><FilePlus2 size={16} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{documentTypes.find((item) => item.id === doc.type)?.label}</Text><Text style={styles.muted}>{doc.customer} · {doc.date}</Text></View><Text style={styles.amount}>${doc.total.toFixed(2)}</Text></View><Pill tone={doc.status === 'PENDIENTE_SRI' ? 'warning' : doc.status === 'DEVUELTO' ? 'warning' : 'good'}>{getDocumentStatusLabel(doc.status)}</Pill></Card>)}
    </> : activeRole === 'CONTADOR_PROFESIONAL' ? <>
      <View style={styles.stats}><Stat value="12" label="Clientes en cartera" /><Stat value="3" label="Obligaciones próximas" accent /></View>
      <Card><Text style={styles.cardTitle}>Pendiente de revisar</Text><Text style={styles.muted}>Declaración IVA · Comercial Andina</Text><Text style={styles.smallCopy}>Recibe la declaración presentada y guarda su evidencia en el expediente del cliente.</Text><Button title="Abrir cartera" onPress={() => router.push('/(tabs)/clients')} /></Card>
      <Card><Text style={styles.cardTitle}>Nuevas oportunidades</Text><Text style={styles.muted}>Hay servicios contables que necesitan cotización.</Text><Button variant="secondary" title="Ver oportunidades" onPress={() => router.push('/(tabs)/opportunities')} /></Card>
    </> : <>
      <Notice>Panel operativo de demostración. Los conteos se derivan de los datos locales de esta app; no representan producción.</Notice>
      <View style={styles.stats}><Stat value={String(adminStats.usersByRole.CONTRIBUYENTE)} label="Contribuyentes · demo" /><Stat value={String(adminStats.usersByRole.CONTADOR_PROFESIONAL)} label="Contadores · demo" accent /><Stat value={String(adminStats.usersByRole.SUPER_ADMIN)} label="Admins · demo" /></View>
      <Card><Text style={styles.cardTitle}>Comprobantes por estado</Text><View style={styles.ocrLine}><Text style={styles.muted}>Pendiente por aprobación del SRI</Text><Text style={styles.cardTitle}>{adminStats.documentsByStatus.PENDIENTE_SRI}</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>Aprobado por el SRI y enviado</Text><Text style={styles.cardTitle}>{adminStats.documentsByStatus.APROBADO_ENVIADO}</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>Borradores / devueltos</Text><Text style={styles.cardTitle}>{adminStats.documentsByStatus.BORRADOR + adminStats.documentsByStatus.DEVUELTO}</Text></View></Card>
      <View style={styles.stats}><Stat value={String(adminStats.marketplaceOffers)} label="Propuestas enviadas · demo" /><Stat value={String(adminStats.ocrReconciliations)} label="Compras OCR conciliadas" accent /></View>
      <View style={styles.stats}><Stat value={`${adminStats.vaultUsagePercent}%`} label={`Bóveda usada · ${vaultFiles.length}/20`} /><Stat value={`${adminStats.servicesAvailable}/3`} label="Servicios en estado demo" accent /></View>
      <Card><Text style={styles.cardTitle}>Actividad de negocio en la demo</Text><Text style={styles.muted}>Gastos registrados: {expenses.length} · Cuentas por pagar: {payables.length} · Productos en inventario: {inventory.length}</Text><View style={styles.formActions}><Button compact title="Revisar servicios" variant="secondary" onPress={() => router.push('/(tabs)/services')} /><Button compact title="Ver usuarios" variant="secondary" onPress={() => router.push('/(tabs)/users')} /></View></Card>
    </>}

    <Modal visible={showNew} animationType="slide" transparent onRequestClose={() => setShowNew(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>NUEVO DOCUMENTO</Text><Text style={styles.sheetTitle}>¿Qué vas a emitir?</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setShowNew(false)} style={styles.close}><X size={20} color={theme.muted} /></Pressable></View>{documentTypes.map((item) => <Pressable key={item.id} onPress={() => chooseType(item.id)} style={styles.documentChoice}><View style={styles.choiceIcon}><FilePlus2 size={17} color={theme.brand} /></View><Text style={styles.choiceLabel}>{item.label}</Text><ArrowUpRight size={16} color={theme.subtle} /></Pressable>)}<Notice>Documento de demostración. No se envía al SRI.</Notice></View></View></Modal>
  </Screen>;
}

export function DocumentHistoryScreen() {
  const { documents, selectedDocumentType, setSelectedDocumentType, addDocument, signatureConfigured, sriAccountConfigured } = useApp();
  const [customer, setCustomer] = useState('');
  const [ruc, setRuc] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'mes'>('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blocker = getEmissionBlocker(signatureConfigured, sriAccountConfigured);
  const formDoc = documentTypes.find((item) => item.id === selectedDocumentType);

  function startDocument(type: (typeof documentTypes)[number]['id']) {
    setSelectedDocumentType(type);
    setCustomer(''); setRuc(''); setDescription(''); setAmount(''); setShowNew(false);
  }

  async function saveDocument() {
    const total = Number(amount.replace(',', '.'));
    if (!customer.trim() || !Number.isFinite(total) || total <= 0) {
      Alert.alert('Revisa el documento', 'Escribe el cliente y un total mayor que cero.');
      return;
    }
    if (blocker) {
      const detail = blocker === 'certificate' ? 'Configura el certificado en Perfil > Firma digital. Luego firmará automáticamente.' : 'Configura la cuenta de ejemplo en Perfil > Cuenta SRI para simular la sincronización.';
      Alert.alert('Completa la configuración', detail, [{ text: 'Ir a Perfil', onPress: () => router.push('/(tabs)/profile') }, { text: 'Ahora no', style: 'cancel' }]);
      return;
    }
    setIsSubmitting(true);
    const result = await addDocument(customer.trim(), total);
    setIsSubmitting(false);
    if (result === 'submitted') Alert.alert('Comprobante enviado · demo', 'Primero queda pendiente por aprobación del SRI y después cambia a aprobado y enviado. No hubo conexión real.');
    setCustomer(''); setRuc(''); setDescription(''); setAmount('');
  }

  return <Screen>
    <TitleBlock eyebrow="COMPROBANTES" title={formDoc ? `Nueva ${formDoc.label.toLowerCase()}` : 'Historial y efecto contable'} subtitle={formDoc ? 'Completa el documento elegido. El formulario se adapta a su tipo.' : 'Consulta tus comprobantes y su impacto resumido en ventas e IVA.'} />
    {formDoc ? <>
      <Notice>Estás creando una {formDoc.label.toLowerCase()} de demostración. La firma configurada se aplica automáticamente; no ingresas su clave de nuevo.</Notice>
      {blocker && <Pressable onPress={() => router.push('/(tabs)/profile')}><Notice tone="warning">{blocker === 'certificate' ? 'Configura el certificado digital en Perfil > Firma digital.' : 'Configura tu usuario SRI en Perfil > Cuenta SRI.'} · Abrir Perfil</Notice></Pressable>}
      <Card><Text style={styles.cardTitle}>Datos del cliente</Text><Field label="Cliente o razón social" value={customer} onChangeText={setCustomer} placeholder="Nombre de quien recibe" autoCapitalize="words" /><Field label="RUC / cédula" value={ruc} onChangeText={setRuc} placeholder="Identificación" keyboardType="numeric" /><Field label="Descripción" value={description} onChangeText={setDescription} placeholder="Producto o servicio" /><Field label="Total del documento · USD" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="numeric" /><View style={styles.formActions}><Button title="Cancelar" variant="secondary" onPress={() => setSelectedDocumentType(null)} /><Button title={isSubmitting ? 'Enviando…' : 'Firmar automáticamente y enviar'} disabled={isSubmitting || Boolean(blocker)} onPress={saveDocument} /></View></Card>
      <Notice>Estado esperado: “Pendiente por aprobación del SRI” y luego “Aprobado por el SRI y enviado”. Ambos son simulados.</Notice>
    </> : <>
      <Button title="Nuevo documento" onPress={() => setShowNew(true)} icon={<FilePlus2 size={17} color="#fff" />} />
      <View style={styles.stats}><Stat value={`$${documents.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`} label="Ventas acumuladas" /><Stat value={String(documents.length)} label="Comprobantes" accent /></View>
      <View style={styles.filters}><Pressable onPress={() => setHistoryFilter('todos')} style={[styles.filter, historyFilter === 'todos' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'todos' && styles.filterTextActive]}>Todos</Text></Pressable><Pressable onPress={() => setHistoryFilter('mes')} style={[styles.filter, historyFilter === 'mes' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'mes' && styles.filterTextActive]}>Este mes</Text></Pressable></View>
      {documents.map((doc) => <Card key={doc.id} style={styles.documentCard}><View style={styles.activityRow}><View style={styles.activityIcon}><FilePlus2 size={16} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{documentTypes.find((item) => item.id === doc.type)?.label}</Text><Text style={styles.muted}>{doc.customer}</Text></View><Text style={styles.amount}>${doc.total.toFixed(2)}</Text></View><View style={styles.documentFoot}><Text style={styles.smallCopy}>{doc.id} · {doc.date}</Text><Pill tone={doc.status === 'PENDIENTE_SRI' ? 'warning' : doc.status === 'DEVUELTO' ? 'warning' : 'good'}>{getDocumentStatusLabel(doc.status)}</Pill></View><View style={styles.accountingRow}><Text style={styles.accountingLabel}>Firmado automáticamente · demo</Text><Text style={styles.accountingAmount}>${(doc.total / 1.15 * 0.15).toFixed(2)} IVA</Text></View><Text style={styles.smallCopy}>Identificador de acceso simulado: {doc.demoAccessKey}</Text></Card>)}
      <Notice>Historial de demostración. Los estados no representan autorización del SRI.</Notice>
    </>}
    <Modal visible={showNew} animationType="slide" transparent onRequestClose={() => setShowNew(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>EMITIR DOCUMENTO</Text><Text style={styles.sheetTitle}>Elige el tipo</Text></View><Pressable onPress={() => setShowNew(false)} style={styles.close}><X size={20} color={theme.muted} /></Pressable></View>{documentTypes.map((item) => <Pressable key={item.id} onPress={() => startDocument(item.id)} style={styles.documentChoice}><View style={styles.choiceIcon}><FilePlus2 size={17} color={theme.brand} /></View><Text style={styles.choiceLabel}>{item.label}</Text><ArrowUpRight size={16} color={theme.subtle} /></Pressable>)}</View></View></Modal>
  </Screen>;
}

const workspaceItems = [{ id: 'purchases', label: 'Compras', Icon: ScanLine }, { id: 'expenses', label: 'Gastos', Icon: FilePlus2 }, { id: 'payables', label: 'Por pagar', Icon: FileUp }, { id: 'inventory', label: 'Inventario', Icon: Package }, { id: 'calendar', label: 'Calendario', Icon: CalendarClock }, { id: 'marketplace', label: 'Contador', Icon: Store }] as const;

export function ContributorWorkspaceScreen() {
  const { activeWorkspace, setActiveWorkspace, inventory, expenses, payables, reconcilePurchase, taxpayerProfile, marketplaceRequests, createMarketplaceRequest, acceptMarketplaceOffer, chatMessages, sendChatMessage, clientPermissions, toggleClientPermission } = useApp();
  const [purchaseFile, setPurchaseFile] = useState<string | null>(null);
  const [ocrReady, setOcrReady] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [postExpense, setPostExpense] = useState(true);
  const [postPayable, setPostPayable] = useState(false);
  const [postInventory, setPostInventory] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [chatDraft, setChatDraft] = useState('');

  async function pickPurchase() {
    const file = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (!file.canceled && file.assets[0]) setPurchaseFile(file.assets[0].name);
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permiso necesario', 'Permite seleccionar una imagen de tu factura para continuar.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPurchaseFile(result.assets[0].fileName ?? 'factura-seleccionada.jpg');
  }

  return <Screen><TitleBlock eyebrow="GESTIÓN DEL NEGOCIO" title="Compras e inventario" subtitle="Lee facturas recibidas y organiza el stock y las obligaciones." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workspaceTabs}>{workspaceItems.map(({ id, label, Icon }) => <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: activeWorkspace === id }} onPress={() => setActiveWorkspace(id)} style={[styles.workspaceTab, activeWorkspace === id && styles.workspaceTabActive]}><Icon size={14} color={activeWorkspace === id ? theme.brand : theme.muted} /><Text style={[styles.workspaceTabText, activeWorkspace === id && styles.workspaceTabTextActive]}>{label}</Text></Pressable>)}</ScrollView>
    {activeWorkspace === 'purchases' ? <>
      <Card><View style={styles.activityRow}><View style={styles.activityIcon}><ScanLine size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Conciliar factura de compra</Text><Text style={styles.muted}>Adjunta un PDF o una foto para simular su lectura.</Text></View></View><View style={styles.formActions}><Button compact title="Buscar archivo" variant="secondary" onPress={pickPurchase} icon={<FileUp size={15} color={theme.brand} />} /><Button compact title="Elegir foto" variant="secondary" onPress={pickImage} /></View>{purchaseFile ? <Notice tone="success">Adjunto: {purchaseFile}</Notice> : null}<Button title={ocrReady ? 'Revisar datos extraídos' : 'Simular lectura OCR'} onPress={() => { if (!purchaseFile) { Alert.alert('Adjunta la factura', 'Primero elige un PDF o una foto de la factura.'); return; } setOcrReady(true); }} disabled={!purchaseFile} /><Notice>Simulación local: no se envía la imagen a un servicio OCR.</Notice></Card>
      {ocrReady ? <Card><View style={styles.activityRow}><View style={styles.activityIcon}><Check size={17} color={theme.success} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Datos extraídos · demo</Text><Text style={styles.muted}>Distribuidora Papelera · RUC 1792200112001</Text></View><Pill tone="good">Revisado</Pill></View><View style={styles.ocrLine}><Text style={styles.muted}>Subtotal</Text><Text style={styles.cardTitle}>$126,00</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>IVA</Text><Text style={styles.cardTitle}>$18,90</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>Total</Text><Text style={styles.amount}>$144,90</Text></View><Text style={styles.label}>¿Dónde registramos esta compra?</Text>{[[postExpense, setPostExpense, 'Registrar como gasto'], [postPayable, setPostPayable, 'Crear cuenta por pagar'], [postInventory, setPostInventory, 'Ingresar ítems al inventario']].map(([selected, setSelected, label]) => <Pressable key={String(label)} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(selected) }} onPress={() => (setSelected as (value: boolean) => void)(!selected)} style={styles.permissionRow}><View style={[styles.checkbox, selected && styles.checkboxActive]}>{selected ? <Check size={12} color="#fff" /> : null}</View><Text style={styles.choiceLabel}>{String(label)}</Text></Pressable>)}<Notice>Al conciliar, cada efecto elegido se refleja en su apartado.</Notice><Button title="Confirmar conciliación" disabled={!postExpense && !postPayable && !postInventory} onPress={() => { const done = reconcilePurchase(purchaseFile ?? 'demo-purchase', { expense: postExpense, payable: postPayable, inventory: postInventory }); if (!done) { Alert.alert('Compra ya conciliada', 'No se volverán a duplicar sus efectos.'); return; } setActiveWorkspace(postInventory ? 'inventory' : postExpense ? 'expenses' : 'payables'); setOcrReady(false); setPurchaseFile(null); Alert.alert('Compra conciliada · demo', 'Se actualizaron los apartados seleccionados.'); }} /></Card> : null}
      <Card><Text style={styles.cardTitle}>Cómo funciona</Text><Text style={styles.smallCopy}>1. Adjunta la factura · 2. Revisa proveedor e impuestos · 3. Concilia para actualizar el inventario.</Text></Card>
    </> : activeWorkspace === 'expenses' ? <>
      <SectionTitle title="Gastos registrados" />
      {expenses.length ? expenses.map((item) => <Card key={item.id}><Text style={styles.cardTitle}>{item.supplier}</Text><Text style={styles.muted}>{item.concept}</Text><Text style={styles.amount}>${item.total.toFixed(2)}</Text></Card>) : <Notice>Aún no se registran gastos OCR.</Notice>}
    </> : activeWorkspace === 'payables' ? <>
      <SectionTitle title="Cuentas por pagar" />
      {payables.length ? payables.map((item) => <Card key={item.id}><Text style={styles.cardTitle}>{item.supplier}</Text><Text style={styles.muted}>Vence {item.dueDate} · {item.status}</Text><Text style={styles.amount}>${item.total.toFixed(2)}</Text></Card>) : <Notice>Aún no hay cuentas por pagar desde compras OCR.</Notice>}
    </> : activeWorkspace === 'inventory' ? <>
      <View style={styles.stats}><Stat value={String(inventory.reduce((sum, item) => sum + item.stock, 0))} label="Unidades en stock" /><Stat value={String(inventory.length)} label="Productos" accent /></View>
      <SectionTitle title="Productos y existencias" />
      {inventory.map((item) => <Card key={item.id} style={styles.productCard}><View style={styles.activityRow}><View style={styles.productIcon}><Package size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.code}</Text></View><View style={styles.stockBox}><Text style={styles.stockValue}>{item.stock}</Text><Text style={styles.stockLabel}>unidades</Text></View></View><View style={styles.accountingRow}><Text style={styles.accountingLabel}>Costo promedio</Text><Text style={styles.accountingAmount}>${item.cost.toFixed(2)}</Text></View></Card>)}
      <Button title="Registrar compra con OCR" onPress={() => setActiveWorkspace('purchases')} icon={<ScanLine size={17} color="#fff" />} />
    </> : activeWorkspace === 'calendar' ? <>
      {getDueDayFromRuc(taxpayerProfile.ruc) === null ? <Notice tone="warning">Carga y confirma un RUC de 13 dígitos para calcular el calendario.</Notice> : <><Notice>Agenda de obligaciones por noveno dígito ({taxpayerProfile.ruc[8]}): la fecha base es el día {getDueDayFromRuc(taxpayerProfile.ruc)}. Revisa feriados y ajustes en el calendario oficial del SRI.</Notice>{taxpayerProfile.obligaciones.map((obligation) => <Card key={obligation}><View style={styles.nextHeader}><View style={styles.calendarIcon}><CalendarClock size={17} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{obligation}</Text><Text style={styles.muted}>Próximo vencimiento base · fecha de demostración.</Text></View><Pill tone="warning">{formatDueDate(getNextDueDate(obligation, taxpayerProfile.ruc))}</Pill></View></Card>)}</>}
    </> : <>
      <View style={styles.filters}><Pressable onPress={() => setShowOffers(false)} style={[styles.filter, !showOffers && styles.filterActive]}><Text style={[styles.filterText, !showOffers && styles.filterTextActive]}>Contadores</Text></Pressable><Pressable onPress={() => setShowOffers(true)} style={[styles.filter, showOffers && styles.filterActive]}><Text style={[styles.filterText, showOffers && styles.filterTextActive]}>Mis solicitudes</Text></Pressable></View>
      {!showOffers ? <><Card><Text style={styles.cardTitle}>Encuentra un profesional</Text><Text style={styles.smallCopy}>Publica el trabajo que necesitas y compara propuestas de contadores.</Text><Button title="Publicar solicitud contable" onPress={() => setShowRequest(true)} /></Card>{marketplaceRequests.map((request) => <Card key={request.id}><Text style={styles.cardTitle}>{request.title}</Text><Text style={styles.muted}>{request.description}</Text><View style={styles.ocrLine}><Text style={styles.muted}>Presupuesto</Text><Text style={styles.amount}>{request.budget}</Text></View><Pill>{request.offers.length} propuestas recibidas</Pill></Card>)}</> : marketplaceRequests.map((request) => <Card key={request.id}><Text style={styles.cardTitle}>{request.title}</Text><Text style={styles.muted}>{request.description}</Text>{request.offers.length ? request.offers.map((offer) => <View key={offer.id} style={styles.offerCard}><View style={styles.professionalRow}><View style={styles.avatar}><Text style={styles.avatarText}>{offer.accountantName.slice(0, 1)}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{offer.accountantName}</Text><Text style={styles.muted}>{offer.estimatedTime} · ${offer.price.toFixed(2)}</Text></View><Pill tone={offer.accepted ? 'good' : 'warning'}>{offer.accepted ? 'Aceptada' : 'Recibida'}</Pill></View><Text style={styles.smallCopy}>{offer.message}</Text>{!request.acceptedOfferId ? <Button compact title="Aceptar propuesta" onPress={() => { acceptMarketplaceOffer(request.id, offer.id); Alert.alert('Propuesta aceptada · demo', 'El contador podrá continuar la conversación.'); }} /> : null}</View>) : <Notice>Aún no hay propuestas para esta solicitud.</Notice>}</Card>)}
      <Card><Text style={styles.cardTitle}>Permisos del expediente</Text><Text style={styles.smallCopy}>Elige qué información autorizas compartir con tu contador. Puedes cambiarlo aquí.</Text>{([['invoices2026', 'Comprobantes emitidos'], ['sriTaxAccess', 'Información tributaria SRI'], ['bankStatements', 'Estados de cuenta']] as const).map(([key, label]) => <Pressable key={key} accessibilityRole="switch" accessibilityState={{ checked: clientPermissions[key] }} onPress={() => toggleClientPermission(key)} style={styles.permissionRow}><View style={[styles.checkbox, clientPermissions[key] && styles.checkboxActive]}>{clientPermissions[key] ? <Check size={12} color="#fff" /> : null}</View><Text style={styles.choiceLabel}>{label}</Text><Text style={styles.muted}>{clientPermissions[key] ? 'Compartido' : 'Privado'}</Text></Pressable>)}</Card>
      <Card><Text style={styles.cardTitle}>Conversación con el contador</Text>{chatMessages.length ? chatMessages.map((message) => <View key={message.id} style={styles.chatMessage}><Text style={styles.muted}>{message.sender === 'CONTADOR' ? 'Contador' : 'Tú'} · {message.sentAt}</Text><Text style={styles.cardTitle}>{message.text}</Text></View>) : <Text style={styles.muted}>Cuando aceptes una propuesta, puedes coordinar el trabajo aquí.</Text>}<Field label="Mensaje" value={chatDraft} onChangeText={setChatDraft} placeholder="Escribe un mensaje" /><Button title="Enviar mensaje" disabled={!chatDraft.trim()} onPress={() => { sendChatMessage(chatDraft); setChatDraft(''); }} /><Notice>Mensajes y permisos de demostración; se guardan localmente en esta app.</Notice></Card>
      <Modal visible={showRequest} animationType="slide" transparent onRequestClose={() => setShowRequest(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><Text style={styles.sheetTitle}>Nueva solicitud</Text><Field label="Servicio que necesitas" value={requestTitle} onChangeText={setRequestTitle} placeholder="Ej. Declaración de IVA mensual" /><Field label="Detalle" value={requestDescription} onChangeText={setRequestDescription} placeholder="Período, alcance y documentos disponibles" multiline /><Field label="Presupuesto estimado" value={requestBudget} onChangeText={setRequestBudget} placeholder="Ej. $40–$70" /><View style={styles.formActions}><Button compact title="Cancelar" variant="secondary" onPress={() => setShowRequest(false)} /><Button compact title="Publicar solicitud" onPress={() => { if (!requestTitle.trim() || !requestDescription.trim() || !requestBudget.trim()) { Alert.alert('Completa la solicitud', 'Indica servicio, detalle y presupuesto.'); return; } createMarketplaceRequest({ title: requestTitle.trim(), description: requestDescription.trim(), budget: requestBudget.trim() }); setRequestTitle(''); setRequestDescription(''); setRequestBudget(''); setShowRequest(false); setShowOffers(true); }} /></View><Notice>Tu solicitud queda visible a contadores en la demostración.</Notice></View></View></Modal>
      <Notice>Marketplace de demostración; las solicitudes, propuestas y mensajes se guardan localmente.</Notice>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.brandDark, borderColor: theme.brandDark, gap: 11 },
  heroHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff20' },
  heroEyebrow: { color: '#bfd8d8', fontSize: 9, fontWeight: '800', letterSpacing: 1.15 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroCopy: { color: '#d8e6e4', fontSize: 13 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calendarIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.warningSoft },
  cardTitle: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 17 },
  smallCopy: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  compactCard: { padding: 13, gap: 9 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: theme.brandSoft },
  amount: { color: theme.ink, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0c1b2066' },
  sheet: { gap: 10, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 28, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.canvas },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  sheetEyebrow: { color: theme.brand, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  sheetTitle: { marginTop: 4, color: theme.ink, fontSize: 22, fontWeight: '700' },
  close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 99, backgroundColor: theme.surfaceMuted },
  documentChoice: { minHeight: 51, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface },
  choiceIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: theme.brandSoft },
  choiceLabel: { flex: 1, color: theme.ink, fontSize: 14, fontWeight: '600' },
  formActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  filters: { flexDirection: 'row', alignSelf: 'flex-start', padding: 3, gap: 3, borderRadius: 13, backgroundColor: theme.surfaceMuted },
  filter: { minHeight: 35, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  filterActive: { backgroundColor: theme.surface, shadowColor: '#203239', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  filterText: { color: theme.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: theme.brandDark },
  documentCard: { gap: 11, padding: 14 },
  documentFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  accountingRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accountingLabel: { color: theme.muted, fontSize: 11 },
  accountingAmount: { color: theme.ink, fontSize: 12, fontWeight: '700' },
  workspaceTabs: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 3 },
  workspaceTab: { minHeight: 37, paddingHorizontal: 7, borderRadius: 11, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', gap: 4 },
  workspaceTabActive: { borderColor: '#c1d9d6', backgroundColor: theme.brandSoft },
  workspaceTabText: { color: theme.muted, fontSize: 10, fontWeight: '600' },
  workspaceTabTextActive: { color: theme.brandDark },
  ocrLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productCard: { padding: 14, gap: 12 },
  productIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: theme.brandSoft },
  stockBox: { minWidth: 52, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 11, backgroundColor: theme.surfaceMuted, alignItems: 'center' },
  stockValue: { color: theme.brandDark, fontSize: 17, fontWeight: '800' },
  stockLabel: { color: theme.muted, fontSize: 9 },
  professionalRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  offerCard: { gap: 9, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surfaceMuted },
  chatMessage: { gap: 3, padding: 10, borderRadius: 11, backgroundColor: theme.surfaceMuted },
  label: { color: theme.ink, fontSize: 13, fontWeight: '700' },
  permissionRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: theme.line, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.brand, borderColor: theme.brand },
  avatar: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.brandSoft },
  avatarText: { color: theme.brandDark, fontSize: 16, fontWeight: '800' },
});
