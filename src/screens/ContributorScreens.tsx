import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowUpRight, CalendarClock, Check, FilePlus2, FileUp, Package, ScanLine, Store, X } from 'lucide-react-native';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, Stat, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { documentTypes } from '../state/types';
import { theme } from '../theme';

export function ContributorHomeScreen() {
  const { activeRole, documents, certificateName, attachedRuc, setSelectedDocumentType, setActiveWorkspace } = useApp();
  const [showNew, setShowNew] = useState(false);
  const sales = documents.reduce((sum, item) => sum + item.total, 0);
  const contributor = activeRole === 'CONTRIBUYENTE';

  function chooseType(type: (typeof documentTypes)[number]['id']) {
    setShowNew(false);
    setSelectedDocumentType(type);
    router.push('/(tabs)/documents');
  }

  return <Screen>
    <TitleBlock eyebrow={contributor ? 'ESPACIO DEL NEGOCIO' : activeRole === 'CONTADOR_PROFESIONAL' ? 'ESPACIO PROFESIONAL' : 'ADMINISTRACIÓN'} title={contributor ? 'Hola, tu negocio.' : activeRole === 'CONTADOR_PROFESIONAL' ? 'Tu trabajo contable.' : 'Vista general'} subtitle={contributor ? 'Tus documentos y obligaciones, en un solo lugar.' : activeRole === 'CONTADOR_PROFESIONAL' ? 'Revisa tu cartera, oportunidades y tareas pendientes.' : 'Actividad y servicios de la plataforma · datos de demostración.'} />

    {contributor ? <>
      <Card style={styles.hero}><View style={styles.heroHeading}><View style={styles.heroIcon}><FilePlus2 size={18} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>EMISIÓN ELECTRÓNICA · DEMO</Text><Text style={styles.heroTitle}>¿Qué documento necesitas?</Text></View></View><Text style={styles.heroCopy}>Elige el tipo y completa sus datos paso a paso.</Text><Button title="Nuevo documento" onPress={() => setShowNew(true)} icon={<FilePlus2 size={17} color="#fff" />} /></Card>
      {(!attachedRuc || !certificateName) ? <Pressable onPress={() => router.push('/(tabs)/profile')}><Notice tone="warning">{!attachedRuc && !certificateName ? 'Termina la configuración del RUC y firma digital para preparar tu cuenta.' : !attachedRuc ? 'Falta adjuntar el RUC en el perfil del negocio.' : 'Adjunta el certificado en Firma digital para completar el perfil.'}  · Revisar perfil</Notice></Pressable> : <Notice tone="success">Perfil listo · RUC y certificado configurados localmente.</Notice>}
      <View style={styles.stats}><Stat value={`$${sales.toFixed(2)}`} label="Ventas registradas · demo" /><Stat value={String(documents.length)} label="Documentos del mes" accent /></View>
      <Card><View style={styles.nextHeader}><View style={styles.calendarIcon}><CalendarClock size={18} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Próxima obligación</Text><Text style={styles.muted}>Declaración de IVA mensual</Text></View><Pill tone="warning">12 oct</Pill></View><Text style={styles.smallCopy}>Revisa tus compras e ingresos antes de preparar la declaración. Este calendario es de demostración.</Text><Button compact title="Ver calendario" variant="secondary" onPress={() => { setActiveWorkspace('calendar'); router.push('/(tabs)/workspace'); }} /></Card>
      <SectionTitle title="Actividad reciente" action="Ver historial" onAction={() => router.push('/(tabs)/documents')} />
      {documents.slice(0, 2).map((doc) => <Card key={doc.id} style={styles.compactCard}><View style={styles.activityRow}><View style={styles.activityIcon}><FilePlus2 size={16} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{documentTypes.find((item) => item.id === doc.type)?.label}</Text><Text style={styles.muted}>{doc.customer} · {doc.date}</Text></View><Text style={styles.amount}>${doc.total.toFixed(2)}</Text></View><Pill tone="good">{doc.status}</Pill></Card>)}
    </> : activeRole === 'CONTADOR_PROFESIONAL' ? <>
      <View style={styles.stats}><Stat value="12" label="Clientes en cartera" /><Stat value="3" label="Obligaciones próximas" accent /></View>
      <Card><Text style={styles.cardTitle}>Pendiente de revisar</Text><Text style={styles.muted}>Declaración IVA · Comercial Andina</Text><Text style={styles.smallCopy}>Recibe la declaración presentada y guarda su evidencia en el expediente del cliente.</Text><Button title="Abrir cartera" onPress={() => router.push('/(tabs)/clients')} /></Card>
      <Card><Text style={styles.cardTitle}>Nuevas oportunidades</Text><Text style={styles.muted}>Hay servicios contables que necesitan cotización.</Text><Button variant="secondary" title="Ver oportunidades" onPress={() => router.push('/(tabs)/opportunities')} /></Card>
    </> : <>
      <View style={styles.stats}><Stat value="1,284" label="Cuentas de demostración" /><Stat value="98.7%" label="Disponibilidad simulada" accent /></View>
      <Card><Text style={styles.cardTitle}>Servicios de plataforma</Text><Text style={styles.muted}>Los estados que ves son datos simulados, no conexiones activas.</Text><Button title="Revisar servicios" onPress={() => router.push('/(tabs)/services')} /></Card>
      <Card><Text style={styles.cardTitle}>Control de acceso</Text><Text style={styles.muted}>Revisa perfiles y actividad de demostración.</Text><Button variant="secondary" title="Ver usuarios" onPress={() => router.push('/(tabs)/users')} /></Card>
    </>}

    <Modal visible={showNew} animationType="slide" transparent onRequestClose={() => setShowNew(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>NUEVO DOCUMENTO</Text><Text style={styles.sheetTitle}>¿Qué vas a emitir?</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setShowNew(false)} style={styles.close}><X size={20} color={theme.muted} /></Pressable></View>{documentTypes.map((item) => <Pressable key={item.id} onPress={() => chooseType(item.id)} style={styles.documentChoice}><View style={styles.choiceIcon}><FilePlus2 size={17} color={theme.brand} /></View><Text style={styles.choiceLabel}>{item.label}</Text><ArrowUpRight size={16} color={theme.subtle} /></Pressable>)}<Notice>Documento de demostración. No se envía al SRI.</Notice></View></View></Modal>
  </Screen>;
}

export function DocumentHistoryScreen() {
  const { documents, selectedDocumentType, setSelectedDocumentType, addDocument } = useApp();
  const [customer, setCustomer] = useState('');
  const [ruc, setRuc] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'mes'>('todos');
  const formDoc = documentTypes.find((item) => item.id === selectedDocumentType);

  function startDocument(type: (typeof documentTypes)[number]['id']) {
    setSelectedDocumentType(type);
    setCustomer(''); setRuc(''); setDescription(''); setAmount(''); setShowNew(false);
  }

  function saveDocument() {
    const total = Number(amount.replace(',', '.'));
    if (!customer.trim() || !Number.isFinite(total) || total <= 0) {
      Alert.alert('Revisa el documento', 'Escribe el cliente y un total mayor que cero.');
      return;
    }
    addDocument(customer.trim(), total);
    setCustomer(''); setRuc(''); setDescription(''); setAmount('');
  }

  return <Screen>
    <TitleBlock eyebrow="COMPROBANTES" title={formDoc ? `Nueva ${formDoc.label.toLowerCase()}` : 'Historial y efecto contable'} subtitle={formDoc ? 'Completa el documento elegido. El formulario se adapta a su tipo.' : 'Consulta tus comprobantes y su impacto resumido en ventas e IVA.'} />
    {formDoc ? <>
      <Notice>Estás creando una {formDoc.label.toLowerCase()} de demostración. Aquí no hay un selector de tipo; la elegiste en “Nuevo”.</Notice>
      <Card><Text style={styles.cardTitle}>Datos del cliente</Text><Field label="Cliente o razón social" value={customer} onChangeText={setCustomer} placeholder="Nombre de quien recibe" autoCapitalize="words" /><Field label="RUC / cédula" value={ruc} onChangeText={setRuc} placeholder="Identificación" keyboardType="numeric" /><Field label="Descripción" value={description} onChangeText={setDescription} placeholder="Producto o servicio" /><Field label="Total del documento · USD" value={amount} onChangeText={setAmount} placeholder="0,00" keyboardType="numeric" /><View style={styles.formActions}><Button title="Cancelar" variant="secondary" onPress={() => setSelectedDocumentType(null)} /><Button title="Guardar borrador" onPress={saveDocument} /></View></Card>
      <Notice>El comprobante queda guardado en esta demostración; no se firma ni se envía al SRI.</Notice>
    </> : <>
      <Button title="Nuevo documento" onPress={() => setShowNew(true)} icon={<FilePlus2 size={17} color="#fff" />} />
      <View style={styles.stats}><Stat value={`$${documents.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`} label="Ventas acumuladas" /><Stat value={String(documents.length)} label="Comprobantes" accent /></View>
      <View style={styles.filters}><Pressable onPress={() => setHistoryFilter('todos')} style={[styles.filter, historyFilter === 'todos' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'todos' && styles.filterTextActive]}>Todos</Text></Pressable><Pressable onPress={() => setHistoryFilter('mes')} style={[styles.filter, historyFilter === 'mes' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'mes' && styles.filterTextActive]}>Este mes</Text></Pressable></View>
      {documents.map((doc) => <Card key={doc.id} style={styles.documentCard}><View style={styles.activityRow}><View style={styles.activityIcon}><FilePlus2 size={16} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{documentTypes.find((item) => item.id === doc.type)?.label}</Text><Text style={styles.muted}>{doc.customer}</Text></View><Text style={styles.amount}>${doc.total.toFixed(2)}</Text></View><View style={styles.documentFoot}><Text style={styles.smallCopy}>{doc.id} · {doc.date}</Text><Pill tone="good">{doc.status}</Pill></View><View style={styles.accountingRow}><Text style={styles.accountingLabel}>Venta contabilizada · IVA incluido</Text><Text style={styles.accountingAmount}>${(doc.total / 1.15 * 0.15).toFixed(2)} IVA</Text></View></Card>)}
      <Notice>Historial de demostración. Los estados no representan autorización del SRI.</Notice>
    </>}
    <Modal visible={showNew} animationType="slide" transparent onRequestClose={() => setShowNew(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>EMITIR DOCUMENTO</Text><Text style={styles.sheetTitle}>Elige el tipo</Text></View><Pressable onPress={() => setShowNew(false)} style={styles.close}><X size={20} color={theme.muted} /></Pressable></View>{documentTypes.map((item) => <Pressable key={item.id} onPress={() => startDocument(item.id)} style={styles.documentChoice}><View style={styles.choiceIcon}><FilePlus2 size={17} color={theme.brand} /></View><Text style={styles.choiceLabel}>{item.label}</Text><ArrowUpRight size={16} color={theme.subtle} /></Pressable>)}</View></View></Modal>
  </Screen>;
}

const workspaceItems = [{ id: 'purchases', label: 'Compras', Icon: ScanLine }, { id: 'inventory', label: 'Inventario', Icon: Package }, { id: 'calendar', label: 'Calendario', Icon: CalendarClock }, { id: 'marketplace', label: 'Contador', Icon: Store }] as const;

export function ContributorWorkspaceScreen() {
  const { activeWorkspace, setActiveWorkspace, inventory, reconcilePurchase } = useApp();
  const [purchaseFile, setPurchaseFile] = useState<string | null>(null);
  const [ocrReady, setOcrReady] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

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
      {ocrReady ? <Card><View style={styles.activityRow}><View style={styles.activityIcon}><Check size={17} color={theme.success} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Datos extraídos · demo</Text><Text style={styles.muted}>Distribuidora Papelera · RUC 1792200112001</Text></View><Pill tone="good">Revisado</Pill></View><View style={styles.ocrLine}><Text style={styles.muted}>Subtotal</Text><Text style={styles.cardTitle}>$126,00</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>IVA</Text><Text style={styles.cardTitle}>$18,90</Text></View><View style={styles.ocrLine}><Text style={styles.muted}>Total</Text><Text style={styles.amount}>$144,90</Text></View><Notice>Al conciliar, los productos recibidos se suman al inventario.</Notice><Button title="Conciliar compra" onPress={() => { reconcilePurchase(); setActiveWorkspace('inventory'); setOcrReady(false); setPurchaseFile(null); Alert.alert('Compra conciliada', 'Se actualizaron las existencias en el inventario de demostración.'); }} /></Card> : null}
      <Card><Text style={styles.cardTitle}>Cómo funciona</Text><Text style={styles.smallCopy}>1. Adjunta la factura · 2. Revisa proveedor e impuestos · 3. Concilia para actualizar el inventario.</Text></Card>
    </> : activeWorkspace === 'inventory' ? <>
      <View style={styles.stats}><Stat value={String(inventory.reduce((sum, item) => sum + item.stock, 0))} label="Unidades en stock" /><Stat value={String(inventory.length)} label="Productos" accent /></View>
      <SectionTitle title="Productos y existencias" />
      {inventory.map((item) => <Card key={item.id} style={styles.productCard}><View style={styles.activityRow}><View style={styles.productIcon}><Package size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.code}</Text></View><View style={styles.stockBox}><Text style={styles.stockValue}>{item.stock}</Text><Text style={styles.stockLabel}>unidades</Text></View></View><View style={styles.accountingRow}><Text style={styles.accountingLabel}>Costo promedio</Text><Text style={styles.accountingAmount}>${item.cost.toFixed(2)}</Text></View></Card>)}
      <Button title="Registrar compra con OCR" onPress={() => setActiveWorkspace('purchases')} icon={<ScanLine size={17} color="#fff" />} />
    </> : activeWorkspace === 'calendar' ? <>
      <Notice>Fechas ilustrativas para el prototipo. Confirma tus plazos en el calendario del SRI.</Notice>
      {[['IVA mensual', '12 oct 2026', 'Preparar ventas y compras del mes'], ['ATS · anexo transaccional', '28 oct 2026', 'Revisar información de compras'], ['Impuesto a la renta', '20 mar 2027', 'Declaración anual del negocio']].map(([title, date, detail]) => <Card key={title}><View style={styles.nextHeader}><View style={styles.calendarIcon}><CalendarClock size={17} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{detail}</Text></View><Pill tone="warning">{date}</Pill></View><Button compact title="Marcar como revisado" variant="secondary" onPress={() => Alert.alert('Recordatorio actualizado', 'El estado de esta obligación se guardó en la demo.')} /></Card>)}
    </> : <>
      <View style={styles.filters}><Pressable onPress={() => setShowOffers(false)} style={[styles.filter, !showOffers && styles.filterActive]}><Text style={[styles.filterText, !showOffers && styles.filterTextActive]}>Contadores</Text></Pressable><Pressable onPress={() => setShowOffers(true)} style={[styles.filter, showOffers && styles.filterActive]}><Text style={[styles.filterText, showOffers && styles.filterTextActive]}>Mis solicitudes</Text></Pressable></View>
      {!showOffers ? <><Card><Text style={styles.cardTitle}>Encuentra un profesional</Text><Text style={styles.smallCopy}>Compara especialidades y solicita ayuda con una obligación tributaria.</Text><Button title="Publicar solicitud contable" onPress={() => Alert.alert('Solicitud creada · demo', 'Recibirás propuestas de contadores en este apartado.')} /></Card>{[['María Fernanda López', 'Declaraciones y devolución IVA', '4.9 · 28 reseñas', '$45 / mes'], ['Estudio Contable Sierra', 'Contabilidad para pequeñas empresas', '4.8 · 41 reseñas', '$65 / mes']].map(([name, specialty, rating, price]) => <Card key={name}><View style={styles.professionalRow}><View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1)}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{name}</Text><Text style={styles.muted}>{specialty}</Text><Text style={styles.smallCopy}>★ {rating}</Text></View><Text style={styles.amount}>{price}</Text></View><Button compact title="Ver perfil y solicitar" variant="secondary" onPress={() => Alert.alert('Perfil profesional · demo', `${name} · ${specialty}`)} /></Card>)}</> : <>{[['María Fernanda López', 'Declaración de IVA mensual · Septiembre 2026', '$45,00'], ['Estudio Contable Sierra', 'Contabilidad mensual · Octubre 2026', '$65,00']].map(([name, service, price]) => <Card key={name}><View style={styles.professionalRow}><View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1)}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{name}</Text><Text style={styles.muted}>{service}</Text></View><Text style={styles.amount}>{price}</Text></View><Notice tone="warning">Propuesta recibida · revisa el alcance antes de aceptar.</Notice><View style={styles.formActions}><Button compact title="Rechazar" variant="secondary" onPress={() => Alert.alert('Respuesta guardada · demo', 'La propuesta quedó rechazada.')} /><Button compact title="Aceptar propuesta" onPress={() => Alert.alert('Propuesta aceptada · demo', 'El servicio se añadió a la cartera de esta demostración.')} /></View></Card>)}</>}
      <Notice>Perfiles y solicitudes de demostración. No se envía información a un marketplace real.</Notice>
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
  avatar: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.brandSoft },
  avatarText: { color: theme.brandDark, fontSize: 16, fontWeight: '800' },
});
