import { PDFDocument, StandardFonts, rgb } from 'pdf-lib/dist/pdf-lib.esm.js';

export type StampPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export async function stampDemoPdf(bytes: Uint8Array | ArrayBuffer, pageIndex: number, position: StampPosition, signer: string) {
  const pdf = await PDFDocument.load(bytes);
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= pdf.getPageCount()) throw new Error('La página seleccionada no existe.');
  const page = pdf.getPage(pageIndex);
  const { width, height } = page.getSize();
  const stampWidth = Math.min(185, width - 20);
  const stampHeight = Math.min(62, height - 20);
  if (stampWidth < 30 || stampHeight < 20) throw new Error('La página es demasiado pequeña para colocar la marca.');
  if (!signer.trim()) throw new Error('Escribe el nombre del firmante.');

  const x = position.endsWith('right') ? width - stampWidth - 10 : 10;
  const y = position.startsWith('bottom') ? 10 : height - stampHeight - 10;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const name = signer.trim().slice(0, 80).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');
  const disclosure = 'FIRMA SIMULADA - SIN VALIDEZ CRIPTOGRAFICA';
  const nameSize = Math.min(11, Math.max(2, (stampWidth - 10) / font.widthOfTextAtSize(name, 1)));
  const disclosureSize = Math.min(7, Math.max(2, (stampWidth - 10) / font.widthOfTextAtSize(disclosure, 1)));
  page.drawRectangle({ x, y, width: stampWidth, height: stampHeight, borderWidth: 1, borderColor: rgb(0.1, 0.35, 0.6), color: rgb(0.94, 0.97, 1) });
  page.drawText(name, { x: x + 5, y: y + stampHeight - nameSize - 5, size: nameSize, font, color: rgb(0.05, 0.2, 0.4) });
  page.drawText(disclosure, { x: x + 5, y: y + 5, size: disclosureSize, font, color: rgb(0.15, 0.35, 0.55) });
  return pdf.save();
}
