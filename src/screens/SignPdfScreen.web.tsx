import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PDFDocument } from 'pdf-lib/dist/pdf-lib.esm.js';
import { ArrowDownToLine, ArrowLeft, ArrowRight, FileCheck2, FileSignature, Share2 } from 'lucide-react-native';
import { Button, Card, Field, Notice, Screen, SectionTitle, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { stampDemoPdf, type StampPosition } from '../features/signing/pdfStamp';
import { theme } from '../theme';

type SelectedPdf = { file: File; bytes: Uint8Array; pages: number; width: number; height: number };
type SignedRecord = { id: string; originalName: string; original: File; signed: File; page: number; position: StampPosition; at: string };
const positions: { id: StampPosition; label: string }[] = [
  { id: 'top-left', label: 'Arriba izquierda' }, { id: 'top-right', label: 'Arriba derecha' },
  { id: 'bottom-left', label: 'Abajo izquierda' }, { id: 'bottom-right', label: 'Abajo derecha' },
];

export default function SignPdfScreen() {
  const { taxpayerProfile } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<SelectedPdf | null>(null);
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState<StampPosition>('bottom-right');
  const [signer, setSigner] = useState(taxpayerProfile.razonSocial || 'EMPRESA DEMO ECUADOR S.A.S.');
  const [history, setHistory] = useState<SignedRecord[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadFile(file?: File) {
    if (!file) return;
    setError('');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setError('Selecciona un PDF.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('El PDF no puede superar 20 MB.'); return; }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      if (pdf.getPageCount() > 100) { setError('El PDF no puede superar 100 páginas.'); return; }
      const size = pdf.getPage(0).getSize();
      setSource({ file, bytes, pages: pdf.getPageCount(), width: size.width, height: size.height });
      setPage(1);
    } catch (cause) { setError(`No se pudo abrir el PDF: ${cause instanceof Error ? cause.message : 'comprueba el archivo.'}`); }
  }

  async function createSignedCopy() {
    if (!source || !signer.trim()) { setError('Elige un PDF y escribe el nombre del firmante.'); return; }
    setBusy(true);
    setError('');
    try {
      const bytes = await stampDemoPdf(source.bytes, page - 1, position, signer);
      const name = `${source.file.name.replace(/\.pdf$/i, '')}-firma-demo.pdf`;
      const signedBytes = Uint8Array.from(bytes);
      const signed = new File([new Blob([signedBytes.buffer as ArrayBuffer], { type: 'application/pdf' })], name, { type: 'application/pdf' });
      const record: SignedRecord = { id: `${Date.now()}`, originalName: source.file.name, original: source.file, signed, page, position, at: new Date().toISOString() };
      setHistory((items) => [record, ...items]);
      download(signed);
    } catch (cause) { setError(`No se pudo crear la copia: ${cause instanceof Error ? cause.message : 'comprueba el PDF.'}`); }
    finally { setBusy(false); }
  }

  function download(file: File) {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  const previewRatio = source ? Math.max(0.58, Math.min(0.92, source.width / source.height)) : 0.72;
  const positionStyle = position.startsWith('top') ? styles.stampTop : styles.stampBottom;
  const horizontalStyle = position.endsWith('left') ? styles.stampLeft : styles.stampRight;

  return <Screen><TitleBlock eyebrow="DOCUMENTOS · DEMOSTRACIÓN" title="Firmar un PDF" subtitle="Coloca una marca visible en una copia del documento y descárgala." />
    <Notice tone="warning">La marca es visual y de demostración. No utiliza el certificado digital ni tiene validez criptográfica.</Notice>
    <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => { void loadFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
    <Card><View style={styles.cardHeading}><View style={styles.iconBox}><FileSignature size={20} color={theme.brand} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{source?.file.name ?? 'Selecciona un documento'}</Text><Text style={styles.muted}>{source ? `${(source.file.size / (1024 * 1024)).toFixed(2)} MB · ${source.pages} páginas` : 'PDF · máximo 20 MB y 100 páginas'}</Text></View></View><Button title={source ? 'Cambiar PDF' : 'Seleccionar PDF'} variant="secondary" onPress={() => input.current?.click()} /></Card>
    {source ? <>
      <Card><SectionTitle title="1 · Elige la página" /><View style={styles.pageControls}><Pressable accessibilityRole="button" disabled={page <= 1} onPress={() => setPage((value) => Math.max(1, value - 1))} style={[styles.pageButton, page <= 1 && styles.disabled]}><ArrowLeft size={17} color={theme.ink} /></Pressable><View style={styles.pageIndicator}><Text style={styles.pageNumber}>{page}</Text><Text style={styles.muted}>de {source.pages}</Text></View><Pressable accessibilityRole="button" disabled={page >= source.pages} onPress={() => setPage((value) => Math.min(source.pages, value + 1))} style={[styles.pageButton, page >= source.pages && styles.disabled]}><ArrowRight size={17} color={theme.ink} /></Pressable></View>
        <View style={[styles.paper, { aspectRatio: previewRatio }]}><View style={styles.paperLines}><View style={styles.paperLineWide} /><View style={styles.paperLine} /><View style={styles.paperLineShort} /><View style={styles.paperGap} /><View style={styles.paperLineWide} /><View style={styles.paperLine} /><View style={styles.paperLine} /><View style={styles.paperLineShort} /></View><View style={[styles.signatureStamp, positionStyle, horizontalStyle]}><Text numberOfLines={1} style={styles.stampSigner}>{signer.trim() || 'Nombre del firmante'}</Text><Text style={styles.stampCaption}>FIRMA SIMULADA</Text></View><Text style={styles.pagePreviewLabel}>Vista de posición · página {page}</Text></View>
        <Text style={styles.muted}>Elige dónde insertar la marca en esta página:</Text><View style={styles.positionGrid}>{positions.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: position === item.id }} onPress={() => setPosition(item.id)} style={[styles.positionOption, position === item.id && styles.positionOptionActive]}><Text style={[styles.positionText, position === item.id && styles.positionTextActive]}>{item.label}</Text></Pressable>)}</View>
      </Card>
      <Card><SectionTitle title="2 · Identifica al firmante" /><Field label="Nombre que aparecerá en la marca" value={signer} onChangeText={setSigner} placeholder="Nombre o razón social" autoCapitalize="words" /><Button title={busy ? 'Creando copia…' : 'Crear y descargar copia'} loading={busy} disabled={!signer.trim()} onPress={() => { void createSignedCopy(); }} icon={<FileCheck2 size={17} color="#fff" />} /></Card>
    </> : null}
    {error ? <Notice tone="warning">{error}</Notice> : null}
    <Card><SectionTitle title="Historial de copias" />{history.length ? history.map((record) => <View key={record.id} style={styles.historyRow}><View style={styles.flex}><Text numberOfLines={2} style={styles.cardTitle}>{record.originalName}</Text><Text style={styles.muted}>Página {record.page} · {new Date(record.at).toLocaleString('es-EC')}</Text></View><View style={styles.historyActions}><Pressable accessibilityRole="button" onPress={() => download(record.signed)} style={styles.historyButton}><ArrowDownToLine size={17} color={theme.brand} /><Text style={styles.historyActionText}>Copia</Text></Pressable><Pressable accessibilityRole="button" onPress={() => download(record.original)} style={styles.historyButton}><Share2 size={17} color={theme.muted} /><Text style={styles.historyActionText}>Original</Text></Pressable></View></View>) : <Text style={styles.muted}>Las copias que generes aparecerán aquí durante esta sesión.</Text>}</Card>
    <Notice>El original no se modifica. Se crea otra copia con un recuadro, el nombre del firmante y la leyenda de demostración.</Notice>
  </Screen>;
}

const styles = StyleSheet.create({
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 }, flex: { flex: 1 }, iconBox: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.brandSoft }, cardTitle: { color: theme.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' }, muted: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  pageControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }, pageButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.line, borderRadius: 14, backgroundColor: theme.surface }, disabled: { opacity: 0.4 }, pageIndicator: { minWidth: 80, alignItems: 'center', gap: 1 }, pageNumber: { color: theme.ink, fontSize: 20, fontWeight: '800' },
  paper: { width: '100%', overflow: 'hidden', position: 'relative', alignSelf: 'center', maxHeight: 430, padding: 18, borderWidth: 1, borderColor: '#d7dfe2', borderRadius: 8, backgroundColor: '#fff', shadowColor: '#203239', shadowOpacity: 0.09, shadowRadius: 8, elevation: 2 }, paperLines: { gap: 8, marginTop: 8 }, paperLineWide: { width: '80%', height: 5, borderRadius: 3, backgroundColor: '#e7ecee' }, paperLine: { width: '68%', height: 4, borderRadius: 3, backgroundColor: '#edf0f1' }, paperLineShort: { width: '42%', height: 4, borderRadius: 3, backgroundColor: '#edf0f1' }, paperGap: { height: 20 }, pagePreviewLabel: { position: 'absolute', bottom: 8, alignSelf: 'center', color: theme.subtle, fontSize: 8 },
  signatureStamp: { position: 'absolute', width: '52%', height: 48, justifyContent: 'center', gap: 2, paddingHorizontal: 6, borderWidth: 1, borderColor: '#1a598f', borderRadius: 3, backgroundColor: '#f0f7ffdd' }, stampTop: { top: 20 }, stampBottom: { bottom: 25 }, stampLeft: { left: 16 }, stampRight: { right: 16 }, stampSigner: { color: '#0d3366', fontSize: 9, fontWeight: '800' }, stampCaption: { color: '#265987', fontSize: 6, fontWeight: '700', letterSpacing: 0.2 },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, positionOption: { width: '48%', minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 1, borderColor: theme.line, borderRadius: 12, backgroundColor: theme.surface }, positionOptionActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft }, positionText: { color: theme.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' }, positionTextActive: { color: theme.brandDark, fontWeight: '800' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.line }, historyActions: { flexDirection: 'row', gap: 7 }, historyButton: { minWidth: 54, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 2 }, historyActionText: { color: theme.muted, fontSize: 9, fontWeight: '700' },
});
