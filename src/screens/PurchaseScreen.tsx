import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import type { MobileInventoryDecision, MobileParsedPurchase } from '../state/types';
import { theme } from '../theme';

type Choice = { mode: 'PENDING' | 'EXISTING' | 'NEW'; itemId: string; kind: 'PRODUCTO' | 'INSUMO'; code: string; name: string; category: string; unit: string; salePrice: string; use: string };
type Line = { description: string; quantity: string; unitCost: string };
const empty = (name: string): Choice => ({ mode: 'PENDING', itemId: '', kind: 'INSUMO', code: '', name, category: 'General', unit: 'unidad', salePrice: '', use: '' });
const number = (value: string) => Number(value.replace(',', '.'));

export function PurchaseScreen() {
  const { parsedPurchases, inventory, simulatePurchaseOcr, reconcilePurchase, setActiveModule } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState('');
  const [ruc, setRuc] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dateISO, setDateISO] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [expense, setExpense] = useState(true);
  const [payable, setPayable] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [reconciled, setReconciled] = useState(false);
  const selected = parsedPurchases.find((item) => item.id === selectedId) || null;
  const subtotal = lines.reduce((sum, line) => sum + number(line.quantity) * number(line.unitCost), 0);
  const total = subtotal * 1.15;

  useEffect(() => {
    if (!selected) return;
    setSupplier(selected.supplier); setRuc(selected.supplierRuc); setInvoiceNumber(selected.invoiceNumber); setDateISO(selected.dateISO);
    setLines(selected.items.map((item) => ({ description: item.description, quantity: String(item.quantity), unitCost: String(item.unitCost) })));
    setChoices(selected.items.map((item) => empty(item.description))); setError(''); setReconciled(false);
  }, [selected?.id]);

  const updateChoice = (index: number, patch: Partial<Choice>) => setChoices((current) => current.map((choice, position) => position === index ? { ...choice, ...patch } : choice));
  const updateLine = (index: number, patch: Partial<Line>) => setLines((current) => current.map((line, position) => position === index ? { ...line, ...patch } : line));
  const open = (module: 'business' | 'inventory') => { setActiveModule(module); router.push((module === 'business' ? '/(tabs)/workspace' : '/(tabs)/inventory') as Href); };
  const suggestionFor = (name: string) => inventory.find((item) => item.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase());

  async function loadFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/xml', 'text/xml'], copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    const purchase = simulatePurchaseOcr(result.assets[0].name);
    setSelectedId(purchase.id);
    Alert.alert('Factura leída · demo', 'Revisa los datos sugeridos antes de conciliar. El archivo no se interpreta con un servicio OCR.');
  }

  function reconcile() {
    if (!selected || !supplier.trim() || !invoiceNumber.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !Number.isFinite(total) || total <= 0 || lines.some((line) => !line.description.trim() || !Number.isFinite(number(line.quantity)) || number(line.quantity) <= 0 || !Number.isFinite(number(line.unitCost)) || number(line.unitCost) < 0)) { setError('Revisa proveedor, comprobante, fecha y los importes de cada ítem.'); return; }
    const codes = new Set(inventory.map((item) => item.code.toLowerCase()));
    const decisions: MobileInventoryDecision[] = [];
    for (let index = 0; index < choices.length; index++) {
      const choice = choices[index];
      if (choice.mode === 'EXISTING') {
        if (!inventory.some((item) => item.id === choice.itemId)) { setError(`Ítem ${index + 1}: selecciona un destino de inventario.`); return; }
        decisions.push({ mode: 'EXISTING', itemId: choice.itemId });
      } else if (choice.mode === 'NEW') {
        const code = choice.code.trim().toLowerCase();
        if (!code || codes.has(code) || !choice.name.trim() || !choice.unit.trim() || choice.kind === 'PRODUCTO' && (!Number.isFinite(number(choice.salePrice)) || number(choice.salePrice) < 0)) { setError(`Ítem ${index + 1}: revisa código único, nombre, unidad y precio.`); return; }
        codes.add(code);
        decisions.push({ mode: 'NEW', item: { kind: choice.kind, code: choice.code.trim(), name: choice.name.trim(), category: choice.category.trim() || 'General', unit: choice.unit.trim(), salePrice: choice.kind === 'PRODUCTO' ? number(choice.salePrice) : undefined, use: choice.kind === 'INSUMO' ? choice.use.trim() : undefined } });
      } else { setError(`Ítem ${index + 1}: decide dónde ingresarlo al inventario.`); return; }
    }
    const done = reconcilePurchase(selected.id, { expense, payable, inventory: true }, { supplier, supplierRuc: ruc, concept: `Compra según factura ${invoiceNumber}`, invoiceNumber, dateISO, total, quantity: lines.reduce((sum, line) => sum + number(line.quantity), 0), inventoryItemId: '', dueDate: dueDate || dateISO, lines: lines.map((line, index) => ({ quantity: number(line.quantity), unitCost: number(line.unitCost), decision: decisions[index] })) });
    if (!done) { setError('No se pudo conciliar. Revisa los datos y vuelve a intentar.'); return; }
    setSelectedId(null); setReconciled(true); setError('');
  }

  return <Screen>
    <TitleBlock eyebrow="FACTURACIÓN Y COMPRAS" title="Compras y OCR" subtitle="Revisa cada ítem y decide dónde ingresarlo antes de conciliar la factura." />
    <Notice>Los gastos y las cuentas por pagar conciliados se consultan en Mi negocio → Gastos y pagos.</Notice>
    {reconciled ? <Card><Text style={styles.heading}>Compra conciliada</Text><Text style={styles.muted}>Sus efectos se reflejan en los módulos correspondientes.</Text><View style={styles.actions}><Button compact title="Ver gastos y pagos" variant="secondary" onPress={() => open('business')} /><Button compact title="Ver inventario" variant="secondary" onPress={() => open('inventory')} /></View></Card> : null}
    {!selected ? <>
      <Card><SectionTitle title="Nueva compra" /><Text style={styles.muted}>Lectura simulada de factura PDF o XML para esta demostración.</Text><View style={styles.actions}><Button compact title="Cargar con OCR" onPress={() => { void loadFile(); }} /><Button compact title="Usar factura de ejemplo" variant="secondary" onPress={() => setSelectedId(parsedPurchases[0]?.id || simulatePurchaseOcr('Factura de ejemplo').id)} /></View></Card>
      <SectionTitle title={`Pendientes · ${parsedPurchases.length}`} />
      {parsedPurchases.length ? parsedPurchases.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelectedId(item.id)}><Card><View style={styles.row}><View style={styles.grow}><Text style={styles.heading}>{item.supplier}</Text><Text style={styles.muted}>{item.invoiceNumber} · {item.items.length} ítems</Text></View><Text style={styles.amount}>${item.total.toFixed(2)}</Text></View><Text style={styles.link}>Revisar compra ›</Text></Card></Pressable>) : <Notice>No hay facturas pendientes. Carga un archivo o usa el ejemplo.</Notice>}
    </> : <>
      <Button compact title="← Volver a pendientes" variant="ghost" onPress={() => setSelectedId(null)} />
      <Card><Text style={styles.heading}>Datos extraídos · revisa antes de conciliar</Text><Text style={styles.muted}>{selected.fileName} · Fecha {selected.dateISO}</Text><Field label="Proveedor" value={supplier} onChangeText={setSupplier} /><Field label="RUC del proveedor" value={ruc} onChangeText={setRuc} keyboardType="numeric" /><Field label="Número de factura" value={invoiceNumber} onChangeText={setInvoiceNumber} /><Field label="Fecha · AAAA-MM-DD" value={dateISO} onChangeText={setDateISO} /></Card>
      {lines.map((line, index) => {
        const choice = choices[index] || empty(line.description);
        const suggestion = suggestionFor(line.description);
        return <Card key={`${selected.id}-${index}`}><View style={styles.row}><Text style={[styles.heading, styles.grow]}>Ítem {index + 1}</Text><Pill tone={choice.mode === 'PENDING' ? 'warning' : 'good'}>{choice.mode === 'PENDING' ? 'Sin decidir' : 'Destino elegido'}</Pill></View><Field label="Descripción" value={line.description} onChangeText={(value) => updateLine(index, { description: value })} /><View style={styles.actions}><View style={styles.grow}><Field label="Cantidad" value={line.quantity} onChangeText={(value) => updateLine(index, { quantity: value })} keyboardType="numeric" /></View><View style={styles.grow}><Field label="Costo unitario" value={line.unitCost} onChangeText={(value) => updateLine(index, { unitCost: value })} keyboardType="numeric" /></View></View><Text style={styles.muted}>Subtotal · ${(number(line.quantity) * number(line.unitCost) || 0).toFixed(2)}</Text><View style={styles.decision}><Text style={styles.heading}>{suggestion ? `Sugerencia: ${suggestion.name}` : 'Sin coincidencia confiable'}</Text><View style={styles.actions}>{suggestion ? <Button compact title="Aceptar sugerencia" variant="secondary" onPress={() => updateChoice(index, { mode: 'EXISTING', itemId: suggestion.id })} /> : null}<Button compact title="Elegir existente" variant="secondary" onPress={() => updateChoice(index, { mode: 'EXISTING', itemId: '' })} /><Button compact title="Crear nuevo" variant="secondary" onPress={() => updateChoice(index, { mode: 'NEW', itemId: '' })} /></View></View>
          {choice.mode === 'EXISTING' ? <View style={styles.destinations}><Text style={styles.heading}>Destino en inventario</Text>{inventory.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: choice.itemId === item.id }} onPress={() => updateChoice(index, { itemId: item.id })} style={[styles.destination, choice.itemId === item.id && styles.destinationActive]}><Text style={styles.muted}>{item.code} · {item.name} · {item.kind === 'INSUMO' ? 'Insumo' : 'Producto'}</Text></Pressable>)}</View> : null}
          {choice.mode === 'NEW' ? <View style={styles.destinations}><Text style={styles.heading}>Nuevo ítem de inventario</Text><View style={styles.actions}><Button compact title="Producto" variant={choice.kind === 'PRODUCTO' ? 'primary' : 'secondary'} onPress={() => updateChoice(index, { kind: 'PRODUCTO' })} /><Button compact title="Insumo" variant={choice.kind === 'INSUMO' ? 'primary' : 'secondary'} onPress={() => updateChoice(index, { kind: 'INSUMO' })} /></View><Field label="Código único" value={choice.code} onChangeText={(value) => updateChoice(index, { code: value })} /><Field label="Nombre" value={choice.name} onChangeText={(value) => updateChoice(index, { name: value })} /><Field label="Categoría" value={choice.category} onChangeText={(value) => updateChoice(index, { category: value })} /><Field label="Unidad" value={choice.unit} onChangeText={(value) => updateChoice(index, { unit: value })} />{choice.kind === 'PRODUCTO' ? <Field label="Precio de venta" value={choice.salePrice} onChangeText={(value) => updateChoice(index, { salePrice: value })} keyboardType="numeric" /> : <Field label="Uso previsto" value={choice.use} onChangeText={(value) => updateChoice(index, { use: value })} />}</View> : null}
        </Card>;
      })}
      <Card><SectionTitle title="Conciliación" /><View style={styles.row}><Text style={[styles.muted, styles.grow]}>Subtotal</Text><Text style={styles.heading}>${subtotal.toFixed(2)}</Text></View><View style={styles.row}><Text style={[styles.muted, styles.grow]}>IVA · 15% demo</Text><Text style={styles.heading}>${(total - subtotal).toFixed(2)}</Text></View><View style={styles.row}><Text style={[styles.heading, styles.grow]}>Total</Text><Text style={styles.amount}>${total.toFixed(2)}</Text></View><CheckRow label="Registrar gasto" checked={expense} onPress={() => setExpense(!expense)} /><CheckRow label="Crear cuenta por pagar" checked={payable} onPress={() => setPayable(!payable)} />{payable ? <Field label="Vencimiento · AAAA-MM-DD" value={dueDate} onChangeText={setDueDate} placeholder={dateISO} /> : null}<Text style={styles.muted}>{choices.filter((choice) => choice.mode !== 'PENDING').length} de {lines.length} ítems decididos · se actualizará el inventario al conciliar.</Text>{error ? <Notice tone="warning">{error}</Notice> : null}<Button title="Conciliar compra" onPress={reconcile} /></Card>
    </>}
  </Screen>;
}

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) { return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.checkRow}><View style={[styles.checkbox, checked && styles.checkboxActive]}>{checked ? <Text style={styles.checkmark}>✓</Text> : null}</View><Text style={styles.heading}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 }, grow: { flex: 1 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heading: { color: theme.ink, fontSize: 13, fontWeight: '700' }, muted: { color: theme.muted, fontSize: 12, lineHeight: 18 }, amount: { color: theme.ink, fontSize: 17, fontWeight: '800' }, link: { color: theme.brand, fontSize: 12, fontWeight: '700' },
  decision: { gap: 9, padding: 12, borderRadius: 12, backgroundColor: theme.brandSoft }, destinations: { gap: 9 }, destination: { minHeight: 43, padding: 10, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: theme.line }, destinationActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft },
  checkRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 9 }, checkbox: { width: 21, height: 21, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: theme.line }, checkboxActive: { backgroundColor: theme.brand, borderColor: theme.brand }, checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
