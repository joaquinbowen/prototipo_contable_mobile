import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BriefcaseBusiness, FileCheck2, FileUp, ShieldAlert, UserRound, Users } from 'lucide-react-native';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, TitleBlock } from '../components/ui/primitives';
import { clientPortfolio, opportunities, useApp } from '../state/AppState';
import type { EvidenceType } from '../state/types';
import { theme } from '../theme';

const obligationTypes: EvidenceType[] = ['IVA mensual', 'Impuesto a la renta', 'ATS / anexo', 'Otra obligación'];

export function AccountantOpportunitiesScreen() {
  const { sentProposals, sendProposal, marketplaceRequests, chatMessages, sendChatMessage } = useApp();
  const [filter, setFilter] = useState<'open' | 'sent'>('open');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [price, setPrice] = useState('45');
  const [estimatedTime, setEstimatedTime] = useState('2 días');
  const [proposalMessage, setProposalMessage] = useState('Revisaré los comprobantes y te compartiré el resumen del trámite.');
  const [chatDraft, setChatDraft] = useState('');
  const selectedRequest = marketplaceRequests.find((item) => item.id === requestId) ?? null;

  function submitOffer() {
    const amount = Number(price.replace(',', '.'));
    if (!selectedRequest || !Number.isFinite(amount) || amount <= 0 || !estimatedTime.trim() || !proposalMessage.trim()) {
      Alert.alert('Revisa la propuesta', 'Completa una tarifa válida, el tiempo estimado y un mensaje.');
      return;
    }
    sendProposal(selectedRequest.id, { price: amount, estimatedTime: estimatedTime.trim(), message: proposalMessage.trim() });
    setRequestId(null);
    Alert.alert('Propuesta enviada · demo', 'El cliente podrá revisarla en su apartado de propuestas recibidas.');
  }

  return <Screen><TitleBlock eyebrow="MARKETPLACE PROFESIONAL" title={filter === 'open' ? 'Oportunidades' : 'Mis propuestas'} subtitle={filter === 'open' ? 'Encargos publicados por contribuyentes. Envía tu cotización para iniciar el contacto.' : 'Aquí solo ves las propuestas que tú enviaste a tus clientes.'} />
    <View style={styles.segment}><Pressable onPress={() => setFilter('open')} style={[styles.segmentButton, filter === 'open' && styles.segmentActive]}><Text style={[styles.segmentText, filter === 'open' && styles.segmentTextActive]}>Oportunidades</Text></Pressable><Pressable onPress={() => setFilter('sent')} style={[styles.segmentButton, filter === 'sent' && styles.segmentActive]}><Text style={[styles.segmentText, filter === 'sent' && styles.segmentTextActive]}>Mis propuestas ({sentProposals.length})</Text></Pressable></View>
    {filter === 'open' ? <>
      <Notice>Esta vista es del contador: solo aparecen encargos de clientes, no propuestas recibidas por contribuyentes.</Notice>
      {marketplaceRequests.map((item) => <Card key={item.id}><View style={styles.opportunityHead}><View style={styles.opportunityIcon}><BriefcaseBusiness size={17} color={theme.brand} /></View><Pill tone="warning">{item.offers.length} propuestas</Pill></View><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.description}</Text><View style={styles.metaRow}><Pill>Solicitud de contribuyente</Pill><Text style={styles.price}>{item.budget} USD</Text></View><Button title={sentProposals.includes(item.id) ? 'Propuesta enviada' : 'Preparar propuesta'} variant={sentProposals.includes(item.id) ? 'secondary' : 'primary'} disabled={sentProposals.includes(item.id)} onPress={() => setRequestId(item.id)} /></Card>)}
    </> : sentProposals.length ? sentProposals.map((id) => { const item = marketplaceRequests.find((request) => request.id === id); const offer = item?.offers.find((entry) => entry.accountantName === 'Estudio contable demo'); return item && offer ? <Card key={id}><Pill tone={offer.accepted ? 'good' : 'warning'}>{offer.accepted ? 'Aceptada · demo' : 'Enviada · pendiente'}</Pill><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>Tu propuesta para la solicitud del contribuyente</Text><View style={styles.metaRow}><Text style={styles.muted}>{offer.estimatedTime}</Text><Text style={styles.price}>${offer.price.toFixed(2)}</Text></View><Text style={styles.muted}>{offer.message}</Text><Notice>{offer.accepted ? 'El cliente aceptó esta propuesta.' : 'Esperando la respuesta del cliente · estado simulado.'}</Notice></Card> : null; }) : <Card><Text style={styles.cardTitle}>Aún no has enviado propuestas</Text><Text style={styles.muted}>Elige un encargo en “Oportunidades” y envía tu cotización.</Text><Button title="Ver oportunidades" onPress={() => setFilter('open')} /></Card>}
    {filter === 'sent' && sentProposals.some((id) => marketplaceRequests.find((request) => request.id === id)?.acceptedOfferId) ? <Card><Text style={styles.cardTitle}>Conversación con el cliente</Text>{chatMessages.length ? chatMessages.map((message) => <View key={message.id} style={styles.chatMessage}><Text style={styles.muted}>{message.sender === 'CONTADOR' ? 'Tú' : 'Contribuyente'} · {message.sentAt}</Text><Text style={styles.cardTitle}>{message.text}</Text></View>) : <Text style={styles.muted}>Aún no hay mensajes. Coordina aquí el trabajo aceptado.</Text>}<Field label="Mensaje" value={chatDraft} onChangeText={setChatDraft} placeholder="Escribe un mensaje" /><Button title="Enviar mensaje" disabled={!chatDraft.trim()} onPress={() => { sendChatMessage(chatDraft); setChatDraft(''); }} /><Notice>La conversación es local y de demostración.</Notice></Card> : null}
    <Modal visible={Boolean(selectedRequest)} animationType="slide" transparent onRequestClose={() => setRequestId(null)}><View style={styles.modalBackdrop}><View style={styles.proposalSheet}><Text style={styles.cardTitle}>Tu propuesta</Text><Text style={styles.muted}>{selectedRequest?.title}</Text><Field label="Tarifa · USD" value={price} onChangeText={setPrice} keyboardType="numeric" /><Field label="Tiempo estimado" value={estimatedTime} onChangeText={setEstimatedTime} placeholder="Ej. 2 días" /><Field label="Mensaje al cliente" value={proposalMessage} onChangeText={setProposalMessage} multiline /><View style={styles.metaRow}><Button compact title="Cancelar" variant="secondary" onPress={() => setRequestId(null)} /><Button compact title="Enviar propuesta" onPress={submitOffer} /></View><Notice>La propuesta queda visible al contribuyente en esta demostración.</Notice></View></View></Modal>
  </Screen>;
}

export function AccountantClientsScreen() {
  const { selectedClient, selectClient, evidence, addEvidence } = useApp();
  const [obligation, setObligation] = useState<EvidenceType>('IVA mensual');
  const [period, setPeriod] = useState('2026-09');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const clientEvidence = evidence.filter((item) => item.clientId === selectedClient?.id);

  async function attachEvidence() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/xml', 'text/xml'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) setFile(result.assets[0].name);
  }

  function saveEvidence() {
    if (!file) { Alert.alert('Adjunta la evidencia', 'Elige el PDF o XML que recibiste del cliente.'); return; }
    if (!period.trim()) { Alert.alert('Indica el período', 'Escribe el mes o año al que corresponde la declaración.'); return; }
    addEvidence({ obligation, period, fileName: file, note: note.trim() });
    setNote(''); setFile(null);
    Alert.alert('Evidencia recibida · demo', 'El archivo quedó registrado en el expediente local del cliente.');
  }

  return <Screen><TitleBlock eyebrow="CARTERA PROFESIONAL" title={selectedClient ? selectedClient.name : 'Mis clientes'} subtitle={selectedClient ? `RUC ${selectedClient.ruc} · ${selectedClient.regime}` : 'Revisa obligaciones y registra la evidencia de lo que presentaste por cada cliente.'} />
    {selectedClient ? <>
      <Button title="Volver a la cartera" variant="secondary" onPress={() => { selectClient(null); setFile(null); }} icon={<Users size={16} color={theme.brand} />} />
      <Notice tone="warning">Expediente de demostración. Adjunta el comprobante de la declaración presentada, como IVA mensual o impuesto a la renta.</Notice>
      <Card><View style={styles.opportunityHead}><FileCheck2 size={18} color={theme.brand} /><Text style={[styles.cardTitle, { flex: 1 }]}>Registrar evidencia presentada</Text></View>
        <Text style={styles.label}>Tipo de obligación</Text><View style={styles.choiceWrap}>{obligationTypes.map((type) => <Pressable key={type} onPress={() => setObligation(type)} style={[styles.choiceChip, obligation === type && styles.choiceChipActive]}><Text style={[styles.choiceChipText, obligation === type && styles.choiceChipTextActive]}>{type}</Text></Pressable>)}</View>
        <Field label="Período de la declaración" value={period} onChangeText={setPeriod} placeholder="Ej. 2026-09 o ejercicio 2025" />
        <Field label="Nota de trabajo (opcional)" value={note} onChangeText={setNote} placeholder="Observación para el expediente" multiline />
        <Button title={file ? `Adjunto · ${file}` : 'Adjuntar archivo PDF o XML'} variant="secondary" onPress={attachEvidence} icon={<FileUp size={16} color={theme.brand} />} />
        <Button title="Guardar evidencia en el expediente" onPress={saveEvidence} />
        <Notice>Archivo guardado solo en el estado de esta demo; no se sube a un servidor.</Notice>
      </Card>
      <SectionTitle title="Evidencia registrada" />
      {clientEvidence.length ? clientEvidence.map((item) => <Card key={item.id}><View style={styles.opportunityHead}><Pill tone="good">Recibida · {item.receivedAt}</Pill><FileCheck2 size={17} color={theme.success} /></View><Text style={styles.cardTitle}>{item.obligation} · {item.period}</Text><Text style={styles.muted}>{item.fileName}</Text>{item.note ? <Text style={styles.muted}>{item.note}</Text> : null}</Card>) : <Card><Text style={styles.cardTitle}>Todavía no hay evidencia</Text><Text style={styles.muted}>Registra aquí el archivo de la última declaración o anexo presentado.</Text></Card>}
    </> : <>
      <View style={styles.statsLine}><Card style={styles.statCard}><Text style={styles.statNumber}>{clientPortfolio.length}</Text><Text style={styles.muted}>Clientes activos · demo</Text></Card><Card style={styles.statCard}><Text style={[styles.statNumber, { color: theme.warning }]}>3</Text><Text style={styles.muted}>Obligaciones próximas</Text></Card></View>
      {clientPortfolio.map((client) => <Card key={client.id}><View style={styles.clientHead}><View style={styles.clientIcon}><UserRound size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{client.name}</Text><Text style={styles.muted}>RUC {client.ruc} · {client.regime}</Text></View><Pill tone="warning">Próximo</Pill></View><View style={styles.clientObligation}><ShieldAlert size={15} color={theme.warning} /><Text style={styles.obligationText}>{client.next} · vence {client.due}</Text></View><Button compact title="Abrir expediente y cargar evidencia" onPress={() => { selectClient(client); setFile(null); }} /></Card>)}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  segment: { padding: 3, flexDirection: 'row', alignSelf: 'flex-start', gap: 3, borderRadius: 13, backgroundColor: theme.surfaceMuted },
  segmentButton: { minHeight: 36, paddingHorizontal: 11, justifyContent: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: theme.surface },
  segmentText: { color: theme.muted, fontSize: 11, fontWeight: '600' },
  segmentTextActive: { color: theme.brandDark },
  opportunityHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  opportunityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.brandSoft },
  cardTitle: { color: theme.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  price: { color: theme.brandDark, fontSize: 15, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0c1b2066' },
  proposalSheet: { gap: 10, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 28, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.canvas },
  chatMessage: { gap: 3, padding: 10, borderRadius: 11, backgroundColor: theme.surfaceMuted },
  statsLine: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, alignItems: 'flex-start' },
  statNumber: { color: theme.brand, fontSize: 24, fontWeight: '800' },
  clientHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  clientIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.brandSoft, alignItems: 'center', justifyContent: 'center' },
  clientObligation: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 5 },
  obligationText: { flex: 1, color: theme.warning, fontSize: 12, fontWeight: '600' },
  label: { color: theme.ink, fontSize: 13, fontWeight: '600' },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choiceChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface },
  choiceChipActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft },
  choiceChipText: { color: theme.muted, fontSize: 11, fontWeight: '600' },
  choiceChipTextActive: { color: theme.brandDark },
});
