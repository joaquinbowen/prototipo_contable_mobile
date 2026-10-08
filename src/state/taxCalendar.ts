const dueDayByRucDigit: Record<number, number> = {
  1: 10, 2: 12, 3: 14, 4: 16, 5: 18,
  6: 20, 7: 22, 8: 24, 9: 26, 0: 28,
};

export function getDueDayFromRuc(ruc: string): number | null {
  if (!/^\d{13}$/.test(ruc)) return null;
  return dueDayByRucDigit[Number(ruc[8])] ?? null;
}

export function getNextDueDate(obligation: string, ruc: string, from = new Date()): Date | null {
  const day = getDueDayFromRuc(ruc);
  if (day === null) return null;
  const normalized = obligation.toLowerCase();
  const dueMonths = normalized.includes('semestral') ? [0, 6] : normalized.includes('renta') ? [4] : null;
  if (!dueMonths) {
    const candidate = new Date(from.getFullYear(), from.getMonth(), day);
    if (candidate <= from) candidate.setMonth(candidate.getMonth() + 1);
    return candidate;
  }
  for (let offset = 0; offset <= 12; offset += 1) {
    const month = (from.getMonth() + offset) % 12;
    const year = from.getFullYear() + Math.floor((from.getMonth() + offset) / 12);
    const candidate = new Date(year, month, day);
    if (dueMonths.includes(month) && candidate > from) return candidate;
  }
  return null;
}

export function formatDueDate(date: Date | null): string {
  return date ? new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : 'Configura el RUC';
}
