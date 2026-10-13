import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { ArrowUpRight, CalendarClock, Check, FilePlus2, FileUp, Package, ScanLine, Store, X } from 'lucide-react-native';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, Stat, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { documentTypes, type DocumentType } from '../state/types';
import { getDocumentStatusLabel, getEmissionBlocker } from '../state/documentStatus';
import { formatDueDate, getDueDayFromRuc, getNextDueDate } from '../state/taxCalendar';
import { calculateAdminStats } from '../state/adminStats';
import { theme } from '../theme';
import { inventoryTemplate, parseInventoryCsv } from '../features/inventoryCsv';

export function ContributorHomeScreen() {
  const { activeRole, documents, attachedRuc, signatureConfigured, sriAccountConfigured, taxpayerProfile, inventory, expenses, payables, ocrReconciliations, vaultFiles, marketplaceRequests, setSelectedDocumentType, setActiveModule } = useApp();
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
      <Card><View style={styles.nextHeader}><View style={styles.calendarIcon}><CalendarClock size={18} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Próxima obligación</Text><Text style={styles.muted}>{taxpayerProfile.obligaciones[0] ?? 'Configura el RUC para ver tu fecha'}</Text></View><Pill tone="warning">{formatDueDate(getNextDueDate(taxpayerProfile.obligaciones[0] ?? 'IVA mensual', taxpayerProfile.ruc))}</Pill></View><Text style={styles.smallCopy}>Fecha base calculada por el noveno dígito del RUC; revisa feriados y ajustes en el calendario oficial del SRI.</Text><Button compact title="Ver calendario" variant="secondary" onPress={() => { setActiveModule('calendar'); router.push('/(tabs)/calendar' as Href); }} /></Card>
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

type InvoiceDraftItem = { id: string; description: string; quantity: string; unitPrice: string; discount: string; taxPercent: 0 | 15 };
const newInvoiceItem = (): InvoiceDraftItem => ({ id: `line-${Date.now()}-${Math.random().toString(16).slice(2)}`, description: '', quantity: '1', unitPrice: '', discount: '0', taxPercent: 15 });

export function DocumentHistoryScreen() {
  const { documents, selectedDocumentType, setSelectedDocumentType, addDocument, signatureConfigured, sriAccountConfigured } = useApp();
  const [customer, setCustomer] = useState('');
  const [ruc, setRuc] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceDraftItem[]>([newInvoiceItem()]);
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Transferencia / sistema financiero');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [documentReason, setDocumentReason] = useState('');
  const [withholdingPercent, setWithholdingPercent] = useState('1.75');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'mes'>('todos');
  const [typeFilter, setTypeFilter] = useState<DocumentType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blocker = getEmissionBlocker(signatureConfigured, sriAccountConfigured);
  const formDoc = documentTypes.find((item) => item.id === selectedDocumentType);
  const parsedItems = invoiceItems.map((item) => ({ description: item.description.trim(), quantity: Number(item.quantity.replace(',', '.')), unitPrice: Number(item.unitPrice.replace(',', '.')), discount: Number(item.discount.replace(',', '.')) || 0, taxPercent: item.taxPercent }));
  const subtotal0 = parsedItems.filter((item) => item.taxPercent === 0).reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0);
  const subtotal15 = parsedItems.filter((item) => item.taxPercent === 15).reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0);
  const iva15 = subtotal15 * 0.15;
  const total = subtotal0 + subtotal15 + iva15;
  const grossSales = documents.filter((item) => item.type === 'FACTURA').reduce((sum, item) => sum + item.total, 0);
  const credits = documents.filter((item) => item.type === 'NOTA_CREDITO').reduce((sum, item) => sum + item.total, 0);
  const debits = documents.filter((item) => item.type === 'NOTA_DEBITO').reduce((sum, item) => sum + item.total, 0);
  const netSales = grossSales - credits + debits;
  const recordedVat = documents.reduce((sum, item) => sum + (item.iva15 ?? (item.type === 'FACTURA' ? item.total / 1.15 * 0.15 : 0)), 0);

  function startDocument(type: (typeof documentTypes)[number]['id']) {
    setSelectedDocumentType(type);
    const firstItem = newInvoiceItem();
    if (type === 'RETENCION') firstItem.taxPercent = 0;
    setCustomer(''); setRuc(''); setInvoiceItems([firstItem]); setClientEmail(''); setClientAddress(''); setReferenceNumber(''); setDocumentReason(''); setOriginAddress(''); setDestinationAddress(''); setCarrierName(''); setVehiclePlate(''); setDocumentDate(new Date().toISOString().slice(0, 10)); setShowNew(false);
  }

  async function saveDocument() {
    if (!customer.trim() || !Number.isFinite(total) || total <= 0 || parsedItems.some((item) => !item.description || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0 || !Number.isFinite(item.discount) || item.discount < 0 || item.discount > item.quantity * item.unitPrice)) {
      Alert.alert('Revisa el documento', 'Completa el cliente y cada concepto con cantidad, precio y descuento válidos.');
      return;
    }
    const parsedDate = new Date(`${documentDate}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(documentDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== documentDate) {
      Alert.alert('Revisa la fecha', 'Usa el formato AAAA-MM-DD.');
      return;
    }
    if (blocker) {
      const detail = blocker === 'certificate' ? 'Configura el certificado en Perfil > Firma digital. Luego firmará automáticamente.' : 'Configura la cuenta de ejemplo en Perfil > Cuenta SRI para simular la sincronización.';
      Alert.alert('Completa la configuración', detail, [{ text: 'Ir a Perfil', onPress: () => router.push('/(tabs)/profile') }, { text: 'Ahora no', style: 'cancel' }]);
      return;
    }
    const normalizedType = selectedDocumentType ?? 'FACTURA';
    const isGuide = normalizedType === 'GUIA_REMISION';
    const isRelated = ['NOTA_CREDITO', 'NOTA_DEBITO', 'RETENCION'].includes(normalizedType);
    if (isRelated && (!referenceNumber.trim() || !documentReason.trim())) { Alert.alert('Completa el documento relacionado', 'Añade el número del comprobante relacionado y el motivo.'); return; }
    if (normalizedType === 'RETENCION' && (!Number.isFinite(Number(withholdingPercent)) || Number(withholdingPercent) < 0 || Number(withholdingPercent) > 100)) { Alert.alert('Revisa la retención', 'Ingresa un porcentaje referencial entre 0 y 100.'); return; }
    if (isGuide && (!originAddress.trim() || !destinationAddress.trim() || !carrierName.trim() || !vehiclePlate.trim())) { Alert.alert('Completa los datos del traslado', 'Indica origen, destino, transportista y placa.'); return; }
    setIsSubmitting(true);
    const observations = isRelated ? `Documento relacionado: ${referenceNumber.trim()}. Motivo: ${documentReason.trim()}${normalizedType === 'RETENCION' ? `. Retención referencial: ${withholdingPercent}%` : ''}` : isGuide ? `Origen: ${originAddress}. Destino: ${destinationAddress}. Transportista: ${carrierName}. Vehículo: ${vehiclePlate}.` : undefined;
    const result = await addDocument({ customer: customer.trim(), total, clientRuc: ruc.trim(), clientEmail: clientEmail.trim(), clientAddress: clientAddress.trim(), dateISO: documentDate, subtotal0, subtotal15, iva15, formaPago: paymentMethod, observaciones: observations, items: parsedItems.map(({ description, quantity, unitPrice, taxPercent }) => ({ description, quantity, unitPrice, taxPercent })) });
    setIsSubmitting(false);
    if (result === 'submitted') Alert.alert('Comprobante enviado · demo', 'Primero queda pendiente por aprobación del SRI y después cambia a aprobado y enviado. No hubo conexión real.');
    setCustomer(''); setRuc(''); setInvoiceItems([newInvoiceItem()]); setClientEmail(''); setClientAddress('');
  }

  return <Screen>
    <TitleBlock eyebrow="COMPROBANTES" title={formDoc ? `Nueva ${formDoc.label.toLowerCase()}` : 'Historial y efecto contable'} subtitle={formDoc ? 'Completa el documento elegido. El formulario se adapta a su tipo.' : 'Consulta tus comprobantes y su impacto resumido en ventas e IVA.'} />
    {formDoc ? <>
      <Notice>Estás creando una {formDoc.label.toLowerCase()} de demostración. La firma configurada se aplica automáticamente; no ingresas su clave de nuevo.</Notice>
      {blocker && <Pressable onPress={() => router.push('/(tabs)/profile')}><Notice tone="warning">{blocker === 'certificate' ? 'Configura el certificado digital en Perfil > Firma digital.' : 'Configura tu usuario SRI en Perfil > Cuenta SRI.'} · Abrir Perfil</Notice></Pressable>}
      <Card><Text style={styles.cardTitle}>Datos del documento</Text><Text style={styles.muted}>Establecimiento 001 · Punto de emisión 001 · Valores en USD</Text><Field label="Fecha de emisión" value={documentDate} onChangeText={setDocumentDate} placeholder="AAAA-MM-DD" /><Field label={selectedDocumentType === 'RETENCION' || selectedDocumentType === 'LIQUIDACION_COMPRA' ? 'RUC / cédula del proveedor' : 'RUC / cédula del cliente'} value={ruc} onChangeText={setRuc} placeholder="Identificación" keyboardType="numeric" /><Field label="Razón social / nombres" value={customer} onChangeText={setCustomer} placeholder="Nombre de quien recibe" autoCapitalize="words" /><Field label="Correo electrónico" value={clientEmail} onChangeText={setClientEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" /><Field label="Dirección" value={clientAddress} onChangeText={setClientAddress} placeholder="Dirección del cliente" /><SectionTitle title="Bienes o servicios" />{invoiceItems.map((item, index) => <View key={item.id} style={styles.invoiceLine}><View style={styles.invoiceLineHeading}><Text style={styles.cardTitle}>Concepto {index + 1}</Text>{invoiceItems.length > 1 ? <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar concepto ${index + 1}`} onPress={() => setInvoiceItems((items) => items.filter((line) => line.id !== item.id))}><Text style={styles.removeLine}>Eliminar</Text></Pressable> : null}</View><Field label="Descripción" value={item.description} onChangeText={(value) => setInvoiceItems((items) => items.map((line) => line.id === item.id ? { ...line, description: value } : line))} placeholder="Producto o servicio" /><View style={styles.formActions}><View style={styles.flex}><Field label="Cantidad" value={item.quantity} onChangeText={(value) => setInvoiceItems((items) => items.map((line) => line.id === item.id ? { ...line, quantity: value } : line))} placeholder="1" keyboardType="numeric" /></View><View style={styles.flex}><Field label="Precio unitario · USD" value={item.unitPrice} onChangeText={(value) => setInvoiceItems((items) => items.map((line) => line.id === item.id ? { ...line, unitPrice: value } : line))} placeholder="0,00" keyboardType="numeric" /></View></View><View style={styles.formActions}><View style={styles.flex}><Field label="Descuento · USD" value={item.discount} onChangeText={(value) => setInvoiceItems((items) => items.map((line) => line.id === item.id ? { ...line, discount: value } : line))} placeholder="0,00" keyboardType="numeric" /></View><View style={styles.taxSelector}>{(selectedDocumentType === 'RETENCION' ? [0] as const : [0, 15] as const).map((tax) => <Button key={tax} compact title={`IVA ${tax}%`} variant={item.taxPercent === tax ? 'primary' : 'secondary'} onPress={() => setInvoiceItems((items) => items.map((line) => line.id === item.id ? { ...line, taxPercent: tax } : line))} />)}</View></View></View>)}<Button compact variant="secondary" title="Agregar otro concepto" onPress={() => setInvoiceItems((items) => [...items, newInvoiceItem()])} /><View style={styles.invoiceTotals}><Text style={styles.muted}>Subtotal 0% · ${subtotal0.toFixed(2)}</Text><Text style={styles.muted}>Subtotal 15% · ${subtotal15.toFixed(2)}</Text><Text style={styles.muted}>IVA 15% · ${iva15.toFixed(2)}</Text><Text style={styles.invoiceTotal}>Total · ${total.toFixed(2)}</Text>{selectedDocumentType === 'RETENCION' ? <Text style={styles.muted}>Retención referencial ({withholdingPercent}%) · ${(total * (Number(withholdingPercent) || 0) / 100).toFixed(2)}</Text> : null}</View>{selectedDocumentType !== 'GUIA_REMISION' && selectedDocumentType !== 'RETENCION' ? <><Text style={styles.cardTitle}>Forma de pago</Text><View style={styles.formActions}>{['Transferencia / sistema financiero', 'Efectivo / otros medios'].map((method) => <Button key={method} compact title={method} variant={paymentMethod === method ? 'primary' : 'secondary'} onPress={() => setPaymentMethod(method)} />)}</View></> : null}{['NOTA_CREDITO', 'NOTA_DEBITO', 'RETENCION'].includes(selectedDocumentType ?? '') ? <><SectionTitle title="Documento relacionado" /><Field label="Número de comprobante" value={referenceNumber} onChangeText={setReferenceNumber} placeholder="001-001-000000001" /><Field label="Motivo o concepto" value={documentReason} onChangeText={setDocumentReason} placeholder="Describe el motivo" multiline />{selectedDocumentType === 'RETENCION' ? <Field label="Porcentaje referencial de retención" value={withholdingPercent} onChangeText={setWithholdingPercent} placeholder="1.75" keyboardType="numeric" /> : null}</> : null}{selectedDocumentType === 'GUIA_REMISION' ? <><SectionTitle title="Datos del traslado" /><Field label="Dirección de origen" value={originAddress} onChangeText={setOriginAddress} placeholder="Ciudad, provincia y dirección" /><Field label="Dirección de destino" value={destinationAddress} onChangeText={setDestinationAddress} placeholder="Ciudad, provincia y dirección" /><Field label="Transportista" value={carrierName} onChangeText={setCarrierName} placeholder="Nombre del transportista" /><Field label="Placa del vehículo" value={vehiclePlate} onChangeText={setVehiclePlate} placeholder="ABC-0123" autoCapitalize="characters" /></> : null}<View style={styles.formActions}><Button title="Cancelar" variant="secondary" onPress={() => setSelectedDocumentType(null)} /><Button title={isSubmitting ? 'Enviando…' : 'Firmar automáticamente y enviar'} disabled={isSubmitting || Boolean(blocker)} onPress={saveDocument} /></View></Card>
      <Notice>Estado esperado: “Pendiente por aprobación del SRI” y luego “Aprobado por el SRI y enviado”. Ambos son simulados.</Notice>
    </> : <>
      <Button title="Nuevo documento" onPress={() => setShowNew(true)} icon={<FilePlus2 size={17} color="#fff" />} />
      <View style={styles.stats}><Stat value={`$${grossSales.toFixed(2)}`} label={`Facturas · ${documents.filter((item) => item.type === 'FACTURA').length}`} accent /><Stat value={`−$${credits.toFixed(2)} / +$${debits.toFixed(2)}`} label="Notas de crédito / débito" /><Stat value={`$${netSales.toFixed(2)}`} label="Ventas netas estimadas" /><Stat value={`$${recordedVat.toFixed(2)}`} label="IVA asociado · demo" accent /></View>
      <View style={styles.filters}><Pressable onPress={() => setHistoryFilter('todos')} style={[styles.filter, historyFilter === 'todos' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'todos' && styles.filterTextActive]}>Todos</Text></Pressable><Pressable onPress={() => setHistoryFilter('mes')} style={[styles.filter, historyFilter === 'mes' && styles.filterActive]}><Text style={[styles.filterText, historyFilter === 'mes' && styles.filterTextActive]}>Este mes</Text></Pressable></View>
      <Field label="Buscar por cliente, RUC o comprobante" value={search} onChangeText={setSearch} placeholder="Escribe para filtrar" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{[{ id: null, label: 'Todos' }, ...documentTypes.map((item) => ({ id: item.id, label: item.label }))].map((item) => <Pressable key={item.id ?? 'all'} onPress={() => setTypeFilter(item.id)} style={[styles.filterChip, typeFilter === item.id && styles.filterChipActive]}><Text style={[styles.filterChipText, typeFilter === item.id && styles.filterChipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{[{ id: null, label: 'Cualquier estado' }, ...(['BORRADOR', 'PENDIENTE_SRI', 'APROBADO_ENVIADO', 'DEVUELTO'] as const).map((id) => ({ id, label: getDocumentStatusLabel(id) }))].map((item) => <Pressable key={item.id ?? 'any-status'} onPress={() => setStatusFilter(item.id)} style={[styles.filterChip, statusFilter === item.id && styles.filterChipActive]}><Text style={[styles.filterChipText, statusFilter === item.id && styles.filterChipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
      {(() => { const filtered = documents.filter((doc) => (!typeFilter || doc.type === typeFilter) && (!statusFilter || doc.status === statusFilter) && (!search.trim() || `${doc.id} ${doc.customer} ${doc.clientRuc ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())) && (historyFilter !== 'mes' || !doc.dateISO || doc.dateISO.slice(0, 7) === new Date().toISOString().slice(0, 7))); return filtered.length ? filtered.map((doc) => <Pressable key={doc.id} accessibilityRole="button" accessibilityState={{ expanded: selectedHistoryId === doc.id }} onPress={() => setSelectedHistoryId((current) => current === doc.id ? null : doc.id)}><Card style={styles.documentCard}><View style={styles.activityRow}><View style={styles.activityIcon}><FilePlus2 size={16} color={theme.brand} /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={styles.cardTitle}>{documentTypes.find((item) => item.id === doc.type)?.label}</Text><Text style={styles.muted}>{doc.customer}{doc.clientRuc ? ` · RUC ${doc.clientRuc}` : ''}</Text></View><Text style={styles.amount}>${doc.total.toFixed(2)}</Text></View><View style={styles.documentFoot}><Text style={styles.documentId}>{doc.id} · {doc.date}</Text><Pill tone={doc.status === 'PENDIENTE_SRI' ? 'warning' : doc.status === 'DEVUELTO' ? 'warning' : 'good'}>{getDocumentStatusLabel(doc.status)}</Pill></View>{selectedHistoryId === doc.id ? <View style={styles.historyDetails}><Text style={styles.accountingLabel}>Detalle del comprobante</Text><Text style={styles.muted}>Cliente: {doc.customer}{doc.clientRuc ? ` · RUC ${doc.clientRuc}` : ''}</Text>{doc.clientEmail ? <Text style={styles.muted}>{doc.clientEmail}</Text> : null}{doc.clientAddress ? <Text style={styles.muted}>{doc.clientAddress}</Text> : null}{doc.items?.map((line, index) => <Text key={`${doc.id}-line-${index}`} style={styles.muted}>{line.quantity} × {line.description} · ${line.unitPrice.toFixed(2)} · IVA {line.taxPercent}%</Text>)}{doc.observaciones ? <Text style={styles.muted}>Observaciones: {doc.observaciones}</Text> : null}<View style={styles.accountingRow}><Text style={styles.accountingLabel}>Subtotal 0% · ${doc.subtotal0?.toFixed(2) ?? '0.00'}  |  Subtotal 15% · ${doc.subtotal15?.toFixed(2) ?? '0.00'}</Text><Text style={styles.accountingAmount}>IVA ${doc.iva15?.toFixed(2) ?? '0.00'}</Text></View><Text style={styles.smallCopy}>{doc.formaPago ? `Forma de pago: ${doc.formaPago} · ` : ''}Firmado automáticamente · demo · Acceso: {doc.demoAccessKey}</Text></View> : <Text style={styles.smallCopy}>Toca para ver el detalle</Text>}</Card></Pressable>) : <Notice>No hay documentos para estos filtros. Prueba otro tipo, estado o búsqueda.</Notice>; })()}
      <Notice>Historial de demostración. Los estados no representan autorización del SRI.</Notice>
    </>}
    <Modal visible={showNew} animationType="slide" transparent onRequestClose={() => setShowNew(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>EMITIR DOCUMENTO</Text><Text style={styles.sheetTitle}>Elige el tipo</Text></View><Pressable onPress={() => setShowNew(false)} style={styles.close}><X size={20} color={theme.muted} /></Pressable></View>{documentTypes.map((item) => <Pressable key={item.id} onPress={() => startDocument(item.id)} style={styles.documentChoice}><View style={styles.choiceIcon}><FilePlus2 size={17} color={theme.brand} /></View><Text style={styles.choiceLabel}>{item.label}</Text><ArrowUpRight size={16} color={theme.subtle} /></Pressable>)}</View></View></Modal>
  </Screen>;
}

const workspaceTitles = { inventory: 'Inventario', calendar: 'Calendario tributario', marketplace: 'Buscar contador' } as const;

export function ContributorWorkspaceScreen({ area }: { area: 'inventory' | 'calendar' | 'marketplace' }) {
  const { setActiveModule, inventory, addInventoryItem, importInventoryItems, taxpayerProfile, marketplaceRequests, createMarketplaceRequest, acceptMarketplaceOffer, chatMessages, sendChatMessage, clientPermissions, toggleClientPermission } = useApp();
  const openModule = (module: 'purchases') => { setActiveModule(module); router.push('/(tabs)/purchases' as Href); };
  const [showOffers, setShowOffers] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'PRODUCTO' | 'INSUMO'>('PRODUCTO');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarDay, setCalendarDay] = useState(() => new Date().getDate());
  const [calendarView, setCalendarView] = useState<'month' | 'agenda'>('month');
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [inventoryKind, setInventoryKind] = useState<'PRODUCTO' | 'INSUMO'>('PRODUCTO');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('unidad');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemMinimum, setNewItemMinimum] = useState('');
  const [newItemSalePrice, setNewItemSalePrice] = useState('');
  const [newItemUse, setNewItemUse] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState('');
  async function downloadInventoryTemplate() {
    try {
      if (Platform.OS === 'web') {
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(new Blob([inventoryTemplate(inventoryFilter)], { type: 'text/csv;charset=utf-8' }));
        anchor.download = `plantilla-${inventoryFilter.toLowerCase()}s.csv`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
        setInventoryStatus('Plantilla descargada. Complétala en Excel y guárdala como CSV.');
        return;
      }
      const folder = new Directory(Paths.document, 'inventory-templates');
      if (!folder.exists) folder.create();
      const file = new File(folder, `plantilla-${inventoryFilter.toLowerCase()}s.csv`);
      if (!file.exists) file.create();
      file.write(inventoryTemplate(inventoryFilter));
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Guardar plantilla para Excel' });
      setInventoryStatus('Plantilla preparada. Ábrela en Excel, complétala y guárdala como CSV.');
    } catch { setInventoryStatus('No se pudo compartir la plantilla. Intenta de nuevo.'); }
  }

  async function importInventoryFile() {
    const picked = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets[0]) return;
    try {
      const asset = picked.assets[0];
      if (!asset.name.toLowerCase().endsWith('.csv')) throw new Error('Guarda el archivo como CSV desde Excel antes de cargarlo.');
      const contents = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
      const parsed = parseInventoryCsv(contents, inventoryFilter, inventory.map((item) => item.code));
      if (!importInventoryItems(parsed)) throw new Error('Revisa los códigos y valores de los registros.');
      setInventoryStatus(`${parsed.length} ${inventoryFilter === 'PRODUCTO' ? 'productos' : 'insumos'} importados correctamente.`);
    } catch (error) { setInventoryStatus(error instanceof Error ? error.message : 'No se pudo leer el archivo.'); }
  }

  return <Screen><TitleBlock eyebrow={area === 'inventory' ? 'FACTURACIÓN Y COMPRAS' : area === 'calendar' ? 'TRÁMITES Y FIRMA' : 'SERVICIOS CONTABLES'} title={workspaceTitles[area]} subtitle={area === 'calendar' ? 'Consulta las fechas tributarias estimadas para tus obligaciones.' : area === 'marketplace' ? 'Encuentra profesionales y administra las propuestas que recibes.' : 'Consulta productos e insumos de tu negocio.'} />
    {area === 'inventory' ? <>
      <View style={styles.stats}><Stat value={String(inventory.reduce((sum, item) => sum + item.stock, 0))} label="Unidades en stock" /><Stat value={String(inventory.length)} label="Productos e insumos" accent /><Stat value={String(inventory.filter((item) => item.stock <= (item.minimumStock ?? 2)).length)} label="Por debajo del mínimo" /></View>
      <View style={styles.inventoryFilters}>{([{ id: 'PRODUCTO', label: `Productos · ${inventory.filter((item) => (item.kind ?? 'PRODUCTO') === 'PRODUCTO').length}` }, { id: 'INSUMO', label: `Insumos · ${inventory.filter((item) => (item.kind ?? 'PRODUCTO') === 'INSUMO').length}` }] as const).map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: inventoryFilter === item.id }} onPress={() => { setInventoryFilter(item.id); setInventoryKind(item.id); setInventoryStatus(''); }} style={[styles.filterChip, inventoryFilter === item.id && styles.filterChipActive]}><Text style={[styles.filterChipText, inventoryFilter === item.id && styles.filterChipTextActive]}>{item.label}</Text></Pressable>)}</View>
      <View style={styles.inventoryHeader}><SectionTitle title={inventoryFilter === 'PRODUCTO' ? 'Productos para venta' : 'Insumos de operación'} /><Button compact title={showAddInventory ? 'Cerrar' : 'Agregar ítem'} onPress={() => setShowAddInventory((show) => !show)} /></View>
      {showAddInventory ? <Card><Text style={styles.cardTitle}>Nuevo producto o insumo</Text><View style={styles.formActions}><Button compact title="Producto" variant={inventoryKind === 'PRODUCTO' ? 'primary' : 'secondary'} onPress={() => setInventoryKind('PRODUCTO')} /><Button compact title="Insumo" variant={inventoryKind === 'INSUMO' ? 'primary' : 'secondary'} onPress={() => setInventoryKind('INSUMO')} /></View><Field label="Nombre" value={newItemName} onChangeText={setNewItemName} placeholder="Nombre del producto o insumo" /><View style={styles.formActions}><View style={styles.flex}><Field label="Código" value={newItemCode} onChangeText={setNewItemCode} placeholder="PROD-001" autoCapitalize="characters" /></View><View style={styles.flex}><Field label="Categoría" value={newItemCategory} onChangeText={setNewItemCategory} placeholder="General" /></View></View><View style={styles.formActions}><View style={styles.flex}><Field label="Stock inicial" value={newItemStock} onChangeText={setNewItemStock} placeholder="0" keyboardType="numeric" /></View><View style={styles.flex}><Field label="Costo unitario · USD" value={newItemCost} onChangeText={setNewItemCost} placeholder="0,00" keyboardType="numeric" /></View></View><View style={styles.formActions}><View style={styles.flex}><Field label="Unidad" value={newItemUnit} onChangeText={setNewItemUnit} placeholder="unidad" /></View><View style={styles.flex}><Field label="Stock mínimo" value={newItemMinimum} onChangeText={setNewItemMinimum} placeholder="2" keyboardType="numeric" /></View></View>{inventoryKind === 'PRODUCTO' ? <Field label="Precio de venta · USD" value={newItemSalePrice} onChangeText={setNewItemSalePrice} keyboardType="numeric" /> : <Field label="Uso del insumo" value={newItemUse} onChangeText={setNewItemUse} />}<Button title="Guardar ítem" onPress={() => { if (!newItemName.trim() || !newItemCode.trim() || !newItemStock.trim() || !newItemCost.trim() || (newItemMinimum && !Number.isFinite(Number(newItemMinimum.replace(',', '.'))))) { Alert.alert('Revisa los datos', 'Completa nombre, código, stock y costo con valores válidos.'); return; } const stock = Number(newItemStock.replace(',', '.')); const cost = Number(newItemCost.replace(',', '.')); const minimumStock = Number(newItemMinimum.replace(',', '.')) || 0; const saved = addInventoryItem({ name: newItemName, code: newItemCode, category: newItemCategory, unit: newItemUnit, stock, cost, minimumStock, kind: inventoryKind, salePrice: inventoryKind === 'PRODUCTO' ? Number(newItemSalePrice.replace(',','.')) || 0 : undefined, use: inventoryKind === 'INSUMO' ? newItemUse : undefined }); if (!saved) { Alert.alert('Revisa los datos', 'El código debe ser único y stock/costo no pueden ser negativos.'); return; } setNewItemName(''); setNewItemCode(''); setNewItemCategory(''); setNewItemUnit('unidad'); setNewItemStock(''); setNewItemCost(''); setNewItemMinimum(''); setNewItemSalePrice(''); setNewItemUse(''); setShowAddInventory(false); }} /></Card> : null}
      <Card><Text style={styles.cardTitle}>Importar desde Excel</Text><Text style={styles.smallCopy}>Descarga el formato de {inventoryFilter === 'PRODUCTO' ? 'productos' : 'insumos'}, complétalo en Excel y guárdalo como CSV para cargarlo aquí.</Text><View style={styles.formActions}><Button compact title="Descargar plantilla" variant="secondary" onPress={() => { void downloadInventoryTemplate(); }} /><Button compact title="Cargar CSV" onPress={() => { void importInventoryFile(); }} /></View>{inventoryStatus ? <Notice>{inventoryStatus}</Notice> : null}<Text style={styles.smallCopy}>Se validan todas las filas y los códigos antes de importar.</Text></Card>
      <Field label="Buscar por código, nombre o categoría" value={inventorySearch} onChangeText={setInventorySearch} placeholder="Buscar en inventario" />
      {inventory.filter((item) => ((item.kind ?? 'PRODUCTO') === inventoryFilter) && `${item.code} ${item.name} ${item.category ?? ''}`.toLowerCase().includes(inventorySearch.trim().toLowerCase())).map((item) => <Card key={item.id} style={styles.productCard}><View style={styles.activityRow}><View style={styles.productIcon}><Package size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.code} · {item.category ?? ((item.kind ?? 'PRODUCTO') === 'PRODUCTO' ? 'Producto' : 'Insumo')} · {item.unit ?? 'unidades'}</Text></View><View style={styles.stockBox}><Text style={styles.stockValue}>{item.stock}</Text><Text style={styles.stockLabel}>{item.stock <= (item.minimumStock ?? 2) ? 'Reponer' : item.unit ?? 'unidades'}</Text></View></View><View style={styles.accountingRow}><Text style={styles.accountingLabel}>Costo promedio</Text><Text style={styles.accountingAmount}>${item.cost.toFixed(2)}</Text></View><Text style={styles.smallCopy}>{(item.kind ?? 'PRODUCTO') === 'PRODUCTO' ? `Precio de venta: $${(item.salePrice ?? 0).toFixed(2)}` : `Uso: ${item.use || '—'}`}</Text><Text style={styles.smallCopy}>Último ingreso: {item.lastSource || 'Carga inicial'}</Text></Card>)}
      {!inventory.some((item) => (item.kind ?? 'PRODUCTO') === inventoryFilter && `${item.code} ${item.name} ${item.category ?? ''}`.toLowerCase().includes(inventorySearch.trim().toLowerCase())) ? <Notice>No hay {inventoryFilter === 'PRODUCTO' ? 'productos' : 'insumos'} para esta búsqueda. Puedes agregar uno o importar la plantilla.</Notice> : null}
      <Button title="Registrar compra con OCR" onPress={() => openModule('purchases')} icon={<ScanLine size={17} color="#fff" />} />
    </> : area === 'calendar' ? <>
      <View style={styles.calendarControls}><View style={styles.calendarToggle}>{([['month', 'Mes'], ['agenda', 'Agenda']] as const).map(([key, label]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: calendarView === key }} onPress={() => setCalendarView(key)} style={[styles.calendarToggleItem, calendarView === key && styles.calendarToggleActive]}><Text style={[styles.calendarToggleText, calendarView === key && styles.calendarToggleTextActive]}>{label}</Text></Pressable>)}</View><View style={styles.calendarNav}><Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => { setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)); setCalendarDay(1); }} style={styles.calendarNavButton}><Text style={styles.calendarToggleText}>‹</Text></Pressable><Text style={styles.calendarMonthTitle}>{calendarMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => { setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)); setCalendarDay(1); }} style={styles.calendarNavButton}><Text style={styles.calendarToggleText}>›</Text></Pressable></View></View>
      {getDueDayFromRuc(taxpayerProfile.ruc) === null ? <Notice tone="warning">Carga y confirma un RUC de 13 dígitos para calcular el calendario.</Notice> : <Notice>Fechas base según el noveno dígito del RUC ({taxpayerProfile.ruc[8]}): vence el día {getDueDayFromRuc(taxpayerProfile.ruc)}. Confirma ajustes en el calendario oficial del SRI.</Notice>}
      {calendarView === 'month' ? <Card><View style={styles.weekHeader}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekLabel}>{day}</Text>)}</View><View style={styles.calendarGrid}>{Array.from({ length: (calendarMonth.getDay() + 6) % 7 }, (_, index) => <View key={`blank-${index}`} style={styles.calendarBlank} />)}{Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, index) => { const day = index + 1; const dueDay = getDueDayFromRuc(taxpayerProfile.ruc); const due = dueDay === day; const selected = calendarDay === day; return <Pressable key={day} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setCalendarDay(day)} style={[styles.calendarDate, due && styles.calendarDateDue, selected && styles.calendarDateSelected]}><Text style={[styles.calendarDateText, selected && styles.calendarDateTextSelected]}>{day}</Text>{due ? <View style={styles.calendarEventDot} /> : null}</Pressable>; })}</View><View style={styles.selectedDate}><Text style={styles.cardTitle}>Detalle del {calendarDay} de {calendarMonth.toLocaleDateString('es-EC', { month: 'long' })}</Text>{getDueDayFromRuc(taxpayerProfile.ruc) === calendarDay ? taxpayerProfile.obligaciones.map((obligation) => <View key={obligation} style={styles.deadlineRow}><CalendarClock size={16} color={theme.warning} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{obligation}</Text><Text style={styles.muted}>Vencimiento base · {formatDueDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), calendarDay))}</Text></View><Pill tone="warning">Pendiente</Pill></View>) : <Text style={styles.muted}>Sin obligaciones registradas para este día.</Text>}</View></Card> : <Card><SectionTitle title="Agenda de obligaciones" />{taxpayerProfile.obligaciones.map((obligation) => <View key={obligation} style={styles.agendaRow}><View style={styles.calendarIcon}><CalendarClock size={17} color={theme.warning} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{obligation}</Text><Text style={styles.muted}>Vencimiento según noveno dígito · {formatDueDate(getNextDueDate(obligation, taxpayerProfile.ruc))}</Text></View><Pill tone="warning">Próxima</Pill></View>)}</Card>}
      <Card><SectionTitle title="Referencia de vencimientos SRI" />{[['1', '10'], ['2', '12'], ['3', '14'], ['4', '16'], ['5', '18'], ['6', '20'], ['7', '22'], ['8', '24'], ['9', '26'], ['0', '28']].map(([digit, date]) => <View key={digit} style={[styles.referenceRow, taxpayerProfile.ruc[8] === digit && styles.referenceRowActive]}><Text style={styles.muted}>Noveno dígito {digit}</Text><Text style={styles.referenceDate}>Día {date}{taxpayerProfile.ruc[8] === digit ? ' · Tu RUC' : ''}</Text></View>)}<Text style={styles.smallCopy}>Fechas base; revisa feriados y ajustes en el calendario oficial del SRI.</Text></Card>
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
  flex: { flex: 1 },
  hero: { backgroundColor: theme.brandDark, borderColor: theme.brandDark, gap: 11 },
  heroHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff20' },
  heroEyebrow: { color: '#bfd8d8', fontSize: 9, fontWeight: '800', letterSpacing: 1.15 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroCopy: { color: '#d8e6e4', fontSize: 13 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calendarIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.warningSoft },
  calendarControls: { gap: 9 }, calendarToggle: { flexDirection: 'row', alignSelf: 'flex-start', padding: 3, gap: 3, borderRadius: 11, backgroundColor: theme.surfaceMuted }, calendarToggleItem: { minHeight: 34, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8 }, calendarToggleActive: { backgroundColor: theme.surface }, calendarToggleText: { color: theme.muted, fontSize: 12, fontWeight: '700' }, calendarToggleTextActive: { color: theme.brandDark }, calendarNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, calendarNavButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }, calendarMonthTitle: { color: theme.ink, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' }, weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 7 }, weekLabel: { width: '13%', textAlign: 'center', color: theme.muted, fontSize: 11, fontWeight: '700' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', rowGap: 5 }, calendarBlank: { width: '14.28%', height: 42 }, calendarDate: { width: '14.28%', height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', borderRadius: 9 }, calendarDateDue: { backgroundColor: theme.warningSoft, borderColor: '#fcd34d' }, calendarDateSelected: { borderColor: theme.brand, backgroundColor: theme.brandSoft }, calendarDateText: { color: theme.ink, fontSize: 13, fontWeight: '600' }, calendarDateTextSelected: { color: theme.brandDark, fontWeight: '800' }, calendarEventDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: theme.warning }, selectedDate: { gap: 9, paddingTop: 13, borderTopWidth: 1, borderTopColor: theme.line }, deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 12, backgroundColor: theme.surfaceMuted }, agendaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, borderTopWidth: 1, borderTopColor: theme.line }, referenceRow: { minHeight: 38, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: theme.line }, referenceRowActive: { backgroundColor: theme.brandSoft }, referenceDate: { color: theme.ink, fontSize: 12, fontWeight: '700' },
  cardTitle: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 17 },
  smallCopy: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  compactCard: { padding: 13, gap: 9 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, minWidth: 0 },
  activityIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: theme.brandSoft },
  amount: { maxWidth: '36%', flexShrink: 1, color: theme.ink, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'right' },
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
  filterScroll: { gap: 7, paddingRight: 4 }, filterChip: { minHeight: 35, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }, filterChipActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft }, filterChipText: { color: theme.muted, fontSize: 12, fontWeight: '600' }, filterChipTextActive: { color: theme.brandDark },
  historyDetails: { gap: 6, padding: 11, borderRadius: 12, backgroundColor: theme.surfaceMuted },
  invoiceLine: { gap: 10, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surfaceMuted }, invoiceLineHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, removeLine: { color: theme.danger, fontSize: 12, fontWeight: '700' }, taxSelector: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 6 }, invoiceTotals: { gap: 6, padding: 12, borderRadius: 12, backgroundColor: theme.brandSoft }, invoiceTotal: { color: theme.brandDark, fontSize: 16, fontWeight: '800', textAlign: 'right' },
  inventoryFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filter: { minHeight: 35, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  filterActive: { backgroundColor: theme.surface, shadowColor: '#203239', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  filterText: { color: theme.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: theme.brandDark },
  documentCard: { gap: 11, padding: 14 },
  inventoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  documentFoot: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  documentId: { flex: 1, minWidth: 145, flexShrink: 1, color: theme.muted, fontSize: 12, lineHeight: 18 },
  accountingRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.line, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 5 },
  accountingLabel: { flex: 1, minWidth: 155, flexShrink: 1, color: theme.muted, fontSize: 11, lineHeight: 16 },
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
  radio: { width: 19, height: 19, borderWidth: 1, borderColor: theme.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, radioActive: { borderWidth: 6, borderColor: theme.brand },
  checkboxActive: { backgroundColor: theme.brand, borderColor: theme.brand },
  avatar: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.brandSoft },
  avatarText: { color: theme.brandDark, fontSize: 16, fontWeight: '800' },
});
