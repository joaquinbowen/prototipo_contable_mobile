import type { MobileInventoryItem } from '../state/types';

type Kind = 'PRODUCTO' | 'INSUMO';
const shared = ['codigo', 'nombre', 'categoria', 'unidad', 'stock', 'costo_promedio'];
export const inventoryColumns = (kind: Kind) => [...shared, kind === 'PRODUCTO' ? 'precio_venta' : 'uso', 'stock_minimo'];
const examples: Record<Kind, string[]> = {
  PRODUCTO: ['PROD-001', 'Producto de ejemplo', 'Venta', 'unidad', '10', '8.5', '12', '2'],
  INSUMO: ['INS-001', 'Insumo de ejemplo', 'Oficina', 'unidad', '10', '3.5', 'Operación interna', '2'],
};
const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
export const inventoryTemplate = (kind: Kind) => `\uFEFF${inventoryColumns(kind).map(escape).join(',')}\r\n${examples[kind].map(escape).join(',')}\r\n`;

function parseRows(source: string) {
  const text = source.replace(/^\uFEFF/, '');
  const first = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = first.includes(';') && !first.includes(',') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], value = '', quoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') { if (quoted && text[index + 1] === '"') { value += '"'; index++; } else quoted = !quoted; }
    else if (character === delimiter && !quoted) { row.push(value); value = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && text[index + 1] === '\n') index++; row.push(value); if (row.some((cell) => cell.trim())) rows.push(row); row = []; value = ''; }
    else value += character;
  }
  if (quoted) throw new Error('El archivo contiene comillas sin cerrar.');
  row.push(value); if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export function parseInventoryCsv(source: string, kind: Kind, existingCodes: string[]): Omit<MobileInventoryItem, 'id'>[] {
  const rows = parseRows(source);
  const header = (rows.shift() || []).map((cell) => cell.trim().toLowerCase());
  const missing = inventoryColumns(kind).filter((column) => !header.includes(column));
  if (missing.length) throw new Error(`Faltan columnas: ${missing.join(', ')}. Descarga la plantilla correspondiente.`);
  if (!rows.length) throw new Error('El archivo no contiene registros.');
  const seen = new Set(existingCodes.map((code) => code.toLowerCase()));
  return rows.map((row, index) => {
    const get = (column: string) => (row[header.indexOf(column)] || '').trim();
    const code = get('codigo'), name = get('nombre'), unit = get('unidad');
    const stock = Number(get('stock').replace(',', '.'));
    const cost = Number(get('costo_promedio').replace(',', '.'));
    const minimumStock = Number(get('stock_minimo').replace(',', '.'));
    const salePrice = kind === 'PRODUCTO' ? Number(get('precio_venta').replace(',', '.')) : undefined;
    if (!code || !name || !unit) throw new Error(`Fila ${index + 2}: código, nombre y unidad son obligatorios.`);
    if (seen.has(code.toLowerCase())) throw new Error(`Fila ${index + 2}: el código ${code} ya existe o está repetido.`);
    if (![stock, cost, minimumStock, ...(salePrice === undefined ? [] : [salePrice])].every((value) => Number.isFinite(value) && value >= 0)) throw new Error(`Fila ${index + 2}: stock, costos y precios deben ser números no negativos.`);
    seen.add(code.toLowerCase());
    return { kind, code, name, unit, stock, cost, minimumStock, salePrice, use: kind === 'INSUMO' ? get('uso') : undefined, category: get('categoria') || 'General' };
  });
}
