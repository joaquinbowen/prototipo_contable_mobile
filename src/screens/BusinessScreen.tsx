import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Notice, Screen, SectionTitle, Stat, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { theme } from '../theme';

type ViewKey = 'summary' | 'sales' | 'expenses';
const money = (value: number) => `$${value.toFixed(2)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const dateOf = (dateISO?: string, label?: string) => {
  if (dateISO) return dateISO;
  const match = label?.toLowerCase().match(/(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s+(\d{4})/);
  if (!match) return undefined;
  const month = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'].indexOf(match[2]) + 1;
  return `${match[3]}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}`;
};
const netDocument = (document: { type: string; total: number; subtotal0?: number; subtotal15?: number; iva15?: number }) => {
  const net = document.subtotal0 !== undefined || document.subtotal15 !== undefined
    ? (document.subtotal0 ?? 0) + (document.subtotal15 ?? 0)
    : Math.max(0, document.total - (document.iva15 ?? 0));
  return document.type === 'NOTA_CREDITO' ? -net : net;
};

export function BusinessOverviewScreen() {
  const { documents, expenses, payables, inventory, taxpayerProfile, addExpense, setPayableStatus } = useApp();
  const today = todayISO();
  const [view, setView] = useState<ViewKey>('summary');
  const [from, setFrom] = useState(`${today.slice(0, 7)}-01`);
  const [to, setTo] = useState(today);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customer, setCustomer] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('TODAS');
  const [fixed, setFixed] = useState('600');
  const [variable, setVariable] = useState('40');
  const [adding, setAdding] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Otros gastos');
  const [expenseDate, setExpenseDate] = useState(today);
  const [payableStatus, setPayableFilter] = useState<'PENDIENTE' | 'VENCIDAS' | 'PAGADO' | 'TODAS'>('PENDIENTE');
  const [payableSearch, setPayableSearch] = useState('');
  const [payableFrom, setPayableFrom] = useState('');
  const [payableTo, setPayableTo] = useState('');
  const [notice, setNotice] = useState('');
  const validPeriod = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && from <= to;
  const inPeriod = (date?: string) => !date || (date >= from && date <= to);
  const sales = useMemo(() => validPeriod ? documents.filter((item) => item.status === 'APROBADO_ENVIADO' && (item.type === 'FACTURA' || item.type === 'NOTA_CREDITO') && inPeriod(dateOf(item.dateISO, item.date))) : [], [documents, from, to, validPeriod]);
  const periodExpenses = useMemo(() => validPeriod ? expenses.filter((item) => inPeriod(item.dateISO)) : [], [expenses, from, to, validPeriod]);
  const customers = [...new Set(sales.map((item) => item.customer))].sort();
  const categories = [...new Set(periodExpenses.map((item) => item.category || 'Sin clasificar'))].sort();
  const customerSales = sales.filter((item) => customer === 'TODOS' || item.customer === customer);
  const visibleExpenses = periodExpenses.filter((item) => (category === 'TODAS' || (item.category || 'Sin clasificar') === category) && `${item.supplier} ${item.concept}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const salesNet = sales.reduce((sum, item) => sum + netDocument(item), 0);
  const customerSalesNet = customerSales.reduce((sum, item) => sum + netDocument(item), 0);
  const expenseTotal = periodExpenses.reduce((sum, item) => sum + item.total, 0);
  const pending = payables.filter((item) => item.status === 'PENDIENTE');
  const pendingTotal = pending.reduce((sum, item) => sum + item.total, 0);
  const overdueTotal = pending.filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) && item.dueDate < today).reduce((sum, item) => sum + item.total, 0);
  const visiblePayables = payables.filter((item) => {
    const statusMatches = payableStatus === 'TODAS' || (payableStatus === 'VENCIDAS' ? item.status === 'PENDIENTE' && item.dueDate < today : item.status === payableStatus);
    return statusMatches && item.supplier.toLocaleLowerCase().includes(payableSearch.toLocaleLowerCase()) && (!payableFrom || item.dueDate >= payableFrom) && (!payableTo || item.dueDate <= payableTo);
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const inventoryTotal = inventory.reduce((sum, item) => sum + item.stock * item.cost, 0);
  const fixedNumber = Number(fixed.replace(',', '.'));
  const variableNumber = Number(variable.replace(',', '.'));
  const breakEven = fixed.trim() && variable.trim() && Number.isFinite(fixedNumber) && fixedNumber >= 0 && Number.isFinite(variableNumber) && variableNumber >= 0 && variableNumber < 100 ? fixedNumber / (1 - variableNumber / 100) : null;
  const salesByCustomer = customers.map((name) => ({ name, amount: customerSales.filter((item) => item.customer === name).reduce((sum, item) => sum + netDocument(item), 0) }));
  const expenseByCategory = categories.map((name) => ({ name, amount: periodExpenses.filter((item) => (item.category || 'Sin clasificar') === name).reduce((sum, item) => sum + item.total, 0) }));
  const monthKeys: string[] = [];
  if (validPeriod) { const cursor = new Date(`${from.slice(0, 7)}-01T12:00:00`); const end = to.slice(0, 7); while (cursor.toISOString().slice(0, 7) <= end && monthKeys.length < 12) { monthKeys.push(cursor.toISOString().slice(0, 7)); cursor.setMonth(cursor.getMonth() + 1); } }
  const trend = monthKeys.map((month) => ({ month, sales: sales.filter((item) => dateOf(item.dateISO, item.date)?.startsWith(month)).reduce((sum, item) => sum + netDocument(item), 0), expenses: periodExpenses.filter((item) => item.dateISO?.startsWith(month)).reduce((sum, item) => sum + item.total, 0) }));
  const trendMax = Math.max(...trend.flatMap((item) => [item.sales, item.expenses]), 1);
  const setPreset = (months: number) => { const start = new Date(); start.setDate(1); start.setMonth(start.getMonth() - months + 1); setFrom(start.toISOString().slice(0, 10)); setTo(today); };
  const saveExpense = () => {
    const saved = addExpense({ supplier, concept, total: Number(amount.replace(',', '.')), category: expenseCategory, dateISO: expenseDate });
    if (!saved) { setNotice('Completa proveedor, concepto, fecha y un importe mayor que cero.'); return; }
    setAdding(false); setSupplier(''); setConcept(''); setAmount(''); setExpenseDate(today); setNotice('Gasto guardado. Tus cifras ya incluyen este registro.');
  };

  return <Screen>
    <TitleBlock eyebrow={taxpayerProfile.razonSocial || 'TU NEGOCIO'} title="Mi negocio" subtitle="Tus números en orden, para decidir con más claridad." />
    <View accessibilityRole="tablist" style={styles.tabs}>{([['summary', 'Resumen'], ['sales', 'Ventas'], ['expenses', 'Gastos y pagos']] as const).map(([key, label]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: view === key }} onPress={() => setView(key)} style={[styles.tab, view === key && styles.tabActive]}><Text style={[styles.tabText, view === key && styles.tabTextActive]}>{label}</Text></Pressable>)}</View>
    <Card><View style={styles.row}><View style={styles.grow}><Text style={styles.heading}>Periodo de análisis</Text><Text style={styles.muted}>Aplica a ventas, gastos y gráficos.</Text></View><Button compact title={filtersOpen ? 'Ocultar' : 'Cambiar'} variant="secondary" onPress={() => setFiltersOpen(!filtersOpen)} /></View><Text style={styles.period}>{from} — {to}</Text>{filtersOpen ? <><Field label="Desde · AAAA-MM-DD" value={from} onChangeText={setFrom} placeholder="2026-10-01" /><Field label="Hasta · AAAA-MM-DD" value={to} onChangeText={setTo} placeholder="2026-10-31" /><View style={styles.actions}><Button compact title="Este mes" variant="secondary" onPress={() => setPreset(1)} /><Button compact title="3 meses" variant="secondary" onPress={() => setPreset(3)} /><Button compact title="12 meses" variant="secondary" onPress={() => setPreset(12)} /></View></> : null}</Card>
    {!validPeriod ? <Notice tone="warning">Selecciona ambas fechas y verifica que Desde no sea posterior a Hasta.</Notice> : null}
    {view === 'summary' ? <>
      <View style={styles.stats}><Stat value={validPeriod ? money(salesNet) : '—'} label="Ventas netas · sin IVA y devoluciones" accent /><Stat value={validPeriod ? money(expenseTotal) : '—'} label="Gastos registrados" /><Stat value={validPeriod ? money(salesNet - expenseTotal) : '—'} label="Resultado estimado" /></View>
      <Card><SectionTitle title="Cómo va tu negocio" /><View style={styles.legend}><Legend color={theme.brand} label="Ventas netas" /><Legend color="#f59e0b" label="Gastos registrados" /></View><Text style={styles.muted}>Comparación por mes · USD</Text>{trend.length ? trend.map((item) => <View key={item.month} style={styles.chartMonth}><View style={styles.chartLabel}><Text style={styles.heading}>{new Date(`${item.month}-15T12:00:00`).toLocaleDateString('es-EC', { month: 'short', year: '2-digit' })}</Text><Text style={styles.smallMuted}>{money(item.sales)} · {money(item.expenses)}</Text></View><View style={styles.chartBars}><View accessibilityLabel={`Ventas ${money(item.sales)}`} style={[styles.chartBar, { width: `${Math.max(2, item.sales / trendMax * 100)}%`, backgroundColor: theme.brand }]} /><View accessibilityLabel={`Gastos ${money(item.expenses)}`} style={[styles.chartBar, { width: `${Math.max(2, item.expenses / trendMax * 100)}%`, backgroundColor: '#f59e0b' }]} /></View></View>) : <Text style={styles.emptyChart}>No hay movimientos en este periodo. Prueba con otras fechas.</Text>}</Card>
      <Card><SectionTitle title="En qué estás gastando" />{expenseByCategory.length ? expenseByCategory.map((item) => <Bar key={item.name} label={item.name} value={item.amount} max={expenseTotal || 1} />) : <Text style={styles.muted}>No hay gastos en este periodo.</Text>}</Card>
      <Card><SectionTitle title="Cuánto necesitas vender al mes" /><Text style={styles.muted}>Simulador mensual independiente del periodo.</Text><Field label="Costos fijos al mes · USD" value={fixed} onChangeText={setFixed} keyboardType="numeric" /><Field label="Costo por cada $100 vendidos · %" value={variable} onChangeText={setVariable} keyboardType="numeric" />{breakEven === null ? <Notice tone="warning">Ingresa costos desde cero y un porcentaje menor que 100.</Notice> : <View style={styles.result}><Text style={styles.muted}>Tu meta para cubrir costos</Text><Text style={styles.large}>{money(breakEven)} / mes</Text><Text style={styles.muted}>Fijos: {money(fixedNumber)} · Variables: {money(breakEven - fixedNumber)}</Text></View>}</Card>
      <Card><SectionTitle title="Lo que tienes y lo que debes" /><Metric label="Valor de tu inventario" value={money(inventoryTotal)} /><Metric label="Pagos pendientes" value={money(pendingTotal)} /><Metric label="De esos pagos, ya vencidos" value={money(overdueTotal)} /><Metric label="Cuentas por pagar" value={String(pending.length)} /><Text style={styles.muted}>Balance parcial: faltan caja, bancos y cobros.</Text></Card>
      <Notice>Las cifras usan los registros locales de demostración; el resultado no representa utilidad contable definitiva ni efectivo disponible.</Notice>
    </> : null}
    {view === 'sales' ? <>
      <SectionTitle title="Tus ventas, de un vistazo" /><View style={styles.actions}><Chip label="Todos los clientes" active={customer === 'TODOS'} onPress={() => setCustomer('TODOS')} />{customers.map((name) => <Chip key={name} label={name} active={customer === name} onPress={() => setCustomer(name)} />)}</View>
      <Card><Text style={styles.muted}>Ventas netas del periodo</Text><Text style={styles.large}>{money(customerSalesNet)}</Text><Text style={styles.muted}>{customerSales.length} documentos · sin IVA · devoluciones descontadas</Text>{monthKeys.map((month) => <Bar key={month} label={month} value={customerSales.filter((item) => dateOf(item.dateISO, item.date)?.startsWith(month)).reduce((sum, item) => sum + netDocument(item), 0)} max={Math.max(customerSalesNet, 1)} />)}</Card>
      <Card><SectionTitle title="Ventas por cliente" />{salesByCustomer.length ? salesByCustomer.map((item) => <Bar key={item.name} label={item.name} value={item.amount} max={Math.max(...salesByCustomer.map((entry) => entry.amount), 1)} />) : <Text style={styles.muted}>No hay ventas con estos filtros.</Text>}</Card>
      <SectionTitle title="Detalle de ventas" />{customerSales.length ? customerSales.map((item) => <Card key={item.id}><View style={styles.row}><Text style={[styles.heading, styles.grow]}>{item.customer}</Text><Text style={styles.heading}>{money(netDocument(item))}</Text></View><Text style={styles.muted}>{item.type === 'NOTA_CREDITO' ? 'Nota de crédito' : 'Factura'} · {item.dateISO || item.date} · {item.id}</Text></Card>) : <Notice>No hay ventas con estos filtros.</Notice>}
    </> : null}
    {view === 'expenses' ? <>
      <SectionTitle title="Gastos" action={adding ? 'Cerrar formulario' : 'Agregar gasto manual'} onAction={() => { setAdding(!adding); setNotice(''); }} />
      {notice ? <Notice tone={adding ? 'warning' : 'success'}>{notice}</Notice> : null}
      {adding ? <Card><Field label="Proveedor" value={supplier} onChangeText={setSupplier} /><Field label="Concepto" value={concept} onChangeText={setConcept} /><Field label="Categoría" value={expenseCategory} onChangeText={setExpenseCategory} /><Field label="Fecha · AAAA-MM-DD" value={expenseDate} onChangeText={setExpenseDate} /><Field label="Importe · USD" value={amount} onChangeText={setAmount} keyboardType="numeric" /><Button title="Guardar gasto" onPress={saveExpense} /></Card> : null}
      <Field label="Buscar gasto" value={search} onChangeText={setSearch} placeholder="Proveedor o concepto" /><View style={styles.actions}><Chip label="Todas las categorías" active={category === 'TODAS'} onPress={() => setCategory('TODAS')} />{categories.map((name) => <Chip key={name} label={name} active={category === name} onPress={() => setCategory(name)} />)}</View>
      <Card><Metric label={`${visibleExpenses.length} gastos con estos filtros`} value={money(visibleExpenses.reduce((sum, item) => sum + item.total, 0))} />{visibleExpenses.length ? visibleExpenses.map((item) => <View key={item.id} style={styles.listRow}><View style={styles.grow}><Text style={styles.heading}>{item.supplier}</Text><Text style={styles.muted}>{item.concept} · {item.category || 'Sin clasificar'} · {item.dateISO || 'Sin fecha'}</Text></View><Text style={styles.heading}>{money(item.total)}</Text></View>) : <Text style={styles.muted}>No hay gastos con estos filtros.</Text>}</Card>
      <Card><SectionTitle title="Distribución de estos gastos" />{categories.length ? categories.map((name) => { const total = visibleExpenses.filter((item) => (item.category || 'Sin clasificar') === name).reduce((sum, item) => sum + item.total, 0); return total ? <Bar key={name} label={name} value={total} max={Math.max(visibleExpenses.reduce((sum, item) => sum + item.total, 0), 1)} /> : null; }) : <Text style={styles.muted}>No hay gastos para distribuir.</Text>}</Card>
      <SectionTitle title="Cuentas por pagar" /><Text style={styles.muted}>Organiza tus pagos. Marcar uno como pagado no vuelve a registrar el gasto.</Text><Field label="Buscar proveedor" value={payableSearch} onChangeText={setPayableSearch} /><View style={styles.actions}>{([['PENDIENTE', 'Pendientes'], ['VENCIDAS', 'Vencidas'], ['PAGADO', 'Pagadas'], ['TODAS', 'Todas']] as const).map(([key, label]) => <Chip key={key} label={label} active={payableStatus === key} onPress={() => setPayableFilter(key)} />)}</View><View style={styles.actions}><View style={styles.grow}><Field label="Vence desde" value={payableFrom} onChangeText={setPayableFrom} placeholder="AAAA-MM-DD" /></View><View style={styles.grow}><Field label="Vence hasta" value={payableTo} onChangeText={setPayableTo} placeholder="AAAA-MM-DD" /></View></View>{payableFrom && payableTo && payableFrom > payableTo ? <Notice tone="warning">Revisa el rango de vencimientos.</Notice> : null}<Card><Metric label={`${visiblePayables.length} cuentas en esta vista`} value={money(visiblePayables.reduce((sum, item) => sum + item.total, 0))} /></Card>{visiblePayables.length ? visiblePayables.map((item) => <Card key={item.id}><View style={styles.row}><Text style={[styles.heading, styles.grow]}>{item.supplier}</Text><Text style={styles.heading}>{money(item.total)}</Text></View><Text style={styles.muted}>Vence {item.dueDate} · {item.status === 'PAGADO' ? 'Pagada' : item.dueDate < today ? 'Vencida' : 'Pendiente'}</Text><Button compact title={item.status === 'PAGADO' ? 'Deshacer pago' : 'Marcar pagada'} variant="secondary" onPress={() => setPayableStatus(item.id, item.status !== 'PAGADO')} /></Card>) : <Notice>No hay cuentas con estos filtros.</Notice>}
    </> : null}
  </Screen>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={[styles.muted, styles.grow]}>{label}</Text><Text style={styles.heading}>{value}</Text></View>; }
function Bar({ label, value, max }: { label: string; value: number; max: number }) { return <View style={styles.barSection}><View style={styles.row}><Text style={[styles.muted, styles.grow]}>{label}</Text><Text style={styles.heading}>{money(value)}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value / max * 100))}%` }]} /></View></View>; }

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.line },
  tab: { flex: 1, minHeight: 46, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.brand },
  tabText: { color: theme.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: theme.brand, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  heading: { color: theme.ink, fontSize: 13, fontWeight: '700' },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  period: { color: theme.brandDark, fontSize: 13, fontWeight: '700' },
  large: { color: theme.ink, fontSize: 23, fontWeight: '800' },
  result: { gap: 5, padding: 14, backgroundColor: theme.brandSoft, borderRadius: 12 },
  chip: { minHeight: 37, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface },
  chipActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft },
  chipText: { color: theme.muted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: theme.brand, fontWeight: '800' },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.line },
  barSection: { gap: 6 },
  month: { gap: 8, paddingTop: 9, borderTopWidth: 1, borderTopColor: theme.line },
  track: { height: 9, overflow: 'hidden', borderRadius: 6, backgroundColor: theme.surfaceMuted },
  fill: { height: 9, borderRadius: 6, backgroundColor: theme.brand },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendText: { color: theme.muted, fontSize: 11, fontWeight: '600' },
  chartMonth: { gap: 6, paddingVertical: 9, borderTopWidth: 1, borderTopColor: theme.line },
  chartLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  smallMuted: { color: theme.muted, fontSize: 10, fontVariant: ['tabular-nums'] },
  chartBars: { gap: 4 },
  chartBar: { minWidth: 4, height: 8, borderRadius: 5 },
  emptyChart: { paddingVertical: 24, textAlign: 'center', color: theme.muted, fontSize: 12, lineHeight: 18 },
});

function Legend({ color, label }: { color: string; label: string }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
