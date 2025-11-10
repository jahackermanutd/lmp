'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, FileCheck2, Layers, Plus, RefreshCw, Tag, Trash2 } from 'lucide-react';
import { PDFDocument, PDFImage, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

type Priority = 'low' | 'normal' | 'high';

type LetterMeta = {
  title: string;
  category: string;
  recipientName: string;
  recipientRole: string;
  organization: string;
  priority: Priority;
  language: string;
  dueDate: string;
  reference: string;
  signatoryName: string;
  signatoryRole: string;
};

type LetterSection = {
  id: string;
  heading: string;
  body: string;
};

type Attachment = {
  id: string;
  name: string;
  description: string;
};

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const today = new Date().toISOString().slice(0, 10);

const defaultMeta: LetterMeta = {
  title: "O'yinchi transferi bo'yicha rasmiy ma'lumotnoma",
  category: 'Transfer',
  recipientName: 'Azizbek Ahmedov',
  recipientRole: 'Sport direktori',
  organization: '"PFK AGMK" MChJ',
  priority: 'normal',
  language: 'uz',
  dueDate: today,
  reference: 'TR-2025-04-18',
  signatoryName: 'Rustam Ganiev',
  signatoryRole: 'Ijrochi direktor',
};

const defaultSections: LetterSection[] = [
  {
    id: createId(),
    heading: 'Maqsad',
    body: "Klubimizning 2025 yilgi transfer rejasiga muvofiq, asosiy yarim himoya chizig'ini kuchaytirish uchun tavsiya etilayotgan o'yinchi haqida ma'lumot taqdim qilinmoqda.",
  },
  {
    id: createId(),
    heading: "Asosiy tafsilotlar",
    body: "Nomzod: Luis Fernandez\nPozitsiya: Markaziy yarim himoyachi\nTransfer qiymati: 4.2 mln yevro\nBonus klauzalari: 0.8 mln yevro\nShartnoma muddati: 3 yil",
  },
  {
    id: createId(),
    heading: 'Keyingi qadamlar',
    body: "Tibbiy ko'rik jadvali 24-aprel kuni soat 9:00ga belgilangan. Yakuniy tasdiq uchun 30-aprelga qadar javob berishingizni so'raymiz.",
  },
];

const defaultAttachments: Attachment[] = [
  { id: createId(), name: 'Moliyaviy hisobot', description: 'Kechiktirilgan tolov va ragbatlantirish shartlari' },
  { id: createId(), name: 'Tibbiy xulosa', description: 'Pre-sezon tibbiy tekshiruv natijalari (2025/02)' },
];

const defaultNotes =
  "Klub yuridik bo'limi bilan to'liq kelishuv tayyor. Homiylik shartlari Marketing bo'limi tomonidan qo'llab-quvvatlanadi.";

// Brand palette sourced from brand-guideline.md
const BRAND_GUIDELINE = {
  colors: {
    midnight: '#1B3C53',
    steel: '#456882',
    sand: '#D2C1B6',
    linen: '#F9F3EF',
  },
  fonts: {
    primary: '"Reddit Sans", "Sora", sans-serif',
    accent: '"Sora", "Reddit Sans", sans-serif',
  },
} as const;

const BRAND_PALETTE = [
  { name: 'Midnight', value: BRAND_GUIDELINE.colors.midnight },
  { name: 'Steel', value: BRAND_GUIDELINE.colors.steel },
  { name: 'Sand', value: BRAND_GUIDELINE.colors.sand },
  { name: 'Linen', value: BRAND_GUIDELINE.colors.linen },
] as const;

type LetterheadDesign = {
  company: string;
  tagline: string;
  contacts: string[];
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
};

type PdfFonts = {
  body: Uint8Array | null;
  heading: Uint8Array | null;
};

const FONT_PATHS = {
  body: '/fonts/RedditSans-Regular.ttf',
  heading: '/fonts/Sora-SemiBold.ttf',
} as const;

const defaultLetterhead: LetterheadDesign = {
  company: '"PFK AGMK" MChJ | "PFK AGMK" LLC',
  tagline: 'OKMK futbol klubi | Football Club OKMK',
  contacts: ['110101, Toshkent vil., Olmaliq sh., Olimpiya k-si, Metallurg stadioni Tel.: 7061-9-59-20, 7061-5-33-08', '110101, Tashkent dist., Almalyk city., Olympia str., Metallurg stadium, Pho.: Tel.: 7061-9-59-20, 7061-5-33-08'],
  primaryColor: BRAND_GUIDELINE.colors.midnight,
  accentColor: BRAND_GUIDELINE.colors.sand,
  backgroundColor: BRAND_GUIDELINE.colors.linen,
  textColor: BRAND_GUIDELINE.colors.midnight,
};

type Rgb = { r: number; g: number; b: number };

const sanitizeHex = (hex: string) => hex.replace('#', '').trim();

const expandHex = (value: string) => (value.length === 3 ? value.split('').map((char) => `${char}${char}`).join('') : value);

const hexToRgbObject = (hex: string): Rgb | null => {
  const sanitized = sanitizeHex(hex);
  if (!/^[\da-f]{3,6}$/i.test(sanitized)) return null;
  const normalized = expandHex(sanitized);
  if (normalized.length !== 6) return null;
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const mixWithWhite = (hex: string, ratio: number) => {
  const color = hexToRgbObject(hex);
  if (!color) return '#A0AEC0';
  const lighten = (channel: number) => Math.round(channel + (255 - channel) * ratio);
  return `#${lighten(color.r).toString(16).padStart(2, '0')}${lighten(color.g).toString(16).padStart(2, '0')}${lighten(color.b)
    .toString(16)
    .padStart(2, '0')}`;
};

const PDF_COLOR_FALLBACK = {
  primary: rgb(17 / 255, 28 / 255, 48 / 255),
  accent: rgb(229 / 255, 166 / 255, 62 / 255),
  ink: rgb(30 / 255, 35 / 255, 48 / 255),
  muted: rgb(102 / 255, 112 / 255, 126 / 255),
};

const hexToPdfColor = (hex: string, fallback: ReturnType<typeof rgb>) => {
  const color = hexToRgbObject(hex);
  if (!color) return fallback;
  return rgb(color.r / 255, color.g / 255, color.b / 255);
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const { buffer, byteOffset, byteLength } = bytes;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  const clone = new Uint8Array(byteLength);
  clone.set(bytes);
  return clone.buffer;
};

const createPseudoQrMatrix = (seed: string, dimension = 21) => {
  const sanitized = seed && seed.trim().length ? seed : 'default';
  const matrix = Array.from({ length: dimension }, () => Array<boolean>(dimension).fill(false));
  let hash = 0;
  for (let index = 0; index < sanitized.length; index += 1) {
    hash = (hash * 33 + sanitized.charCodeAt(index)) & 0xffffffff;
  }
  let state = hash || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return Math.abs(state);
  };
  matrix.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      matrix[rowIndex][colIndex] = (next() % 1000) / 1000 > 0.5;
    });
  });
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const isBorder = x === 0 || y === 0 || x === 6 || y === 6;
        const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[startY + y][startX + x] = isBorder || isCenter;
      }
    }
  };
  if (dimension >= 21) {
    drawFinder(0, 0);
    drawFinder(dimension - 7, 0);
    drawFinder(0, dimension - 7);
  }
  return matrix;
};

const drawPseudoQrCode = (
  page: PDFPage,
  x: number,
  topY: number,
  size: number,
  matrix: boolean[][],
  color: ReturnType<typeof rgb>
) => {
  const modules = matrix.length;
  if (!modules) return;
  const moduleSize = size / modules;
  matrix.forEach((row, rowIndex) => {
    row.forEach((isFilled, colIndex) => {
      if (!isFilled) return;
      page.drawRectangle({
        x: x + colIndex * moduleSize,
        y: topY - (rowIndex + 1) * moduleSize,
        width: moduleSize,
        height: moduleSize,
        color,
      });
    });
  });
  page.drawRectangle({
    x,
    y: topY - size,
    width: size,
    height: size,
    borderColor: color,
    borderWidth: 1,
  });
};

const priorityCopy: Record<Priority, string> = {
  low: 'Past',
  normal: 'Normal',
  high: 'Yuqori',
};

const priorityStyles: Record<Priority, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  normal: 'border-blue-200 bg-blue-50 text-blue-700',
  high: 'border-red-200 bg-red-50 text-red-700',
};

const categoryOptions = ['Transfer', 'Shartnoma', 'Tadbir', 'Homiylik', 'Rasmiy murojaat'];
const languageOptions = [
  { value: 'uz', label: "O'zbek (Lotin)" },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

const writingGuides = [
  'Kirish qismini muammo va maqsadni aniqlashdan boshlang.',
  "Har bir bo'limni 2-5 gap oralig'ida saqlang.",
  'Raqamlar uchun bir xil formatdan foydalaning (valyuta, sanalar).',
  "Keyingi qadamlar bo'limida javob muddatini eslatib o'ting.",
];

const daysUntil = (dateString: string) => {
  const due = new Date(dateString);
  const diff = due.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

type PdfPayload = {
  meta: LetterMeta;
  sections: LetterSection[];
  notes: string;
  attachments: Attachment[];
};

async function generateLetterPdf(payload: PdfPayload, letterhead: LetterheadDesign, fonts: PdfFonts, logoBytes?: Uint8Array) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fallbackRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fallbackBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const embedCustomFont = async (bytes: Uint8Array | null, fallback: PDFFont) => {
    if (!bytes || !bytes.length) return fallback;
    try {
      return await doc.embedFont(bytes, { subset: true });
    } catch (error) {
      console.warn('Custom font embed failed, falling back to Helvetica', error);
      return fallback;
    }
  };
  const bodyFont = await embedCustomFont(fonts.body, fallbackRegular);
  const headingFont = await embedCustomFont(fonts.heading, fallbackBold);
  let logoImage: PDFImage | null = null;
  if (logoBytes && logoBytes.length) {
    try {
      logoImage = await doc.embedPng(logoBytes);
    } catch (error) {
      try {
        logoImage = await doc.embedJpg(logoBytes);
      } catch (secondaryError) {
        console.warn('AGMK logo embedding failed', { error, secondaryError });
      }
    }
  }

  const margin = 48;
  const paragraphGap = 14;
  const lineGap = 4;
  const headerReservedHeight = 145;
  const footerHeight = 40;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const textColor = hexToPdfColor(letterhead.textColor, PDF_COLOR_FALLBACK.ink);
  const mutedColor = hexToPdfColor(mixWithWhite(letterhead.textColor, 0.35), PDF_COLOR_FALLBACK.muted);
  const accentColor = hexToPdfColor(letterhead.accentColor, PDF_COLOR_FALLBACK.accent);
  const footerContacts = letterhead.contacts.length ? letterhead.contacts : defaultLetterhead.contacts;

  const {
    meta: { title, recipientName, recipientRole, organization, reference, language, dueDate, signatoryName, signatoryRole },
    sections,
    notes,
    attachments,
  } = payload;

  let cursorY = 0;
  let page: PDFPage;
  const pages: PDFPage[] = [];

  const drawLetterhead = (targetPage: PDFPage) => {
    const logoPlaceholderWidth = 88;
    const logoMaxWidth = 120;
    const logoMaxHeight = 80;
    const columnGap = 20;
    const contactColumnWidth = 220;
    const topY = pageHeight - margin;

    let logoBoxWidth = logoPlaceholderWidth;
    let logoBoxHeight = logoMaxHeight;

    if (logoImage) {
      const naturalWidth = logoImage.width;
      const naturalHeight = logoImage.height;
      const widthScale = logoMaxWidth / naturalWidth;
      const heightScale = logoMaxHeight / naturalHeight;
      const scale = Math.min(widthScale, heightScale, 1);
      const renderWidth = naturalWidth * scale;
      const renderHeight = naturalHeight * scale;

      logoBoxWidth = Math.max(renderWidth, logoPlaceholderWidth);
      logoBoxHeight = Math.max(renderHeight, 0);

      targetPage.drawImage(logoImage, {
        x: margin,
        y: topY - renderHeight,
        width: renderWidth,
        height: renderHeight,
      });
    } else {
      targetPage.drawRectangle({
        x: margin,
        y: topY - logoMaxHeight,
        width: logoPlaceholderWidth,
        height: logoMaxHeight,
        borderColor: accentColor,
        borderWidth: 1,
      });
      targetPage.drawText('LOGO', {
        x: margin + 16,
        y: topY - logoMaxHeight / 2 - 4,
        size: 12,
        font: headingFont,
        color: accentColor,
      });
    }

    const contactStartX = pageWidth - margin - contactColumnWidth;
    const detailX = margin + logoBoxWidth + columnGap;
    const detailWidth = Math.max(contactStartX - detailX - columnGap, 120);
    const headingSize = 16;
    let detailY = topY - headingSize;

    targetPage.drawText(letterhead.company, {
      x: detailX,
      y: detailY,
      size: headingSize,
      font: headingFont,
      color: textColor,
    });
    detailY -= headingSize + 2;
    if (letterhead.tagline) {
      targetPage.drawText(letterhead.tagline, {
        x: detailX,
        y: detailY,
        size: 11,
        font: bodyFont,
        color: mutedColor,
      });
      detailY -= 16;
    }

    const logoAreaBottom = topY - logoBoxHeight;
    const rowBottom = Math.min(logoAreaBottom, detailY - 12);

    let contactY = topY - 10;
    footerContacts.slice(0, 4).forEach((contact) => {
      if (contactY <= rowBottom + 8) return;
      const textWidth = bodyFont.widthOfTextAtSize(contact, 10);
      const xPosition = contactStartX + Math.max(contactColumnWidth - textWidth, 0);
      targetPage.drawText(contact, {
        x: xPosition,
        y: contactY,
        size: 10,
        font: bodyFont,
        color: mutedColor,
        maxWidth: contactColumnWidth,
      });
      contactY -= 13;
    });

    // targetPage.drawLine({
    //   start: { x: margin, y: pageHeight - headerReservedHeight },
    //   end: { x: pageWidth - margin, y: pageHeight - headerReservedHeight },
    //   thickness: 2,
    //   color: accentColor,
    // });

    const barY = pageHeight - headerReservedHeight - 6;

    targetPage.drawRectangle({
      x: margin,
      y: barY,
      width: pageWidth - margin * 2,
      height: 3,
      color: rgb(0.10, 0.18, 0.48),
      opacity: 0.9,
    });

  };

  const createPage = (includeLetterhead = false) => {
    const nextPage = doc.addPage([pageWidth, pageHeight]);
    pages.push(nextPage);
    if (includeLetterhead) {
      drawLetterhead(nextPage);
      cursorY = pageHeight - headerReservedHeight - 24;
    } else {
      cursorY = pageHeight - margin;
    }
    return nextPage;
  };

  const ensureSpace = (needed: number) => {
    if (cursorY - needed <= footerHeight + margin / 2) {
      page = createPage(false);
    }
  };

  const splitParagraphs = (text: string) =>
    text
      .replace(/\r/g, '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

  const wrapParagraph = (paragraph: string, font: PDFFont, size: number) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, size);
      if (width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  };

  const drawJustifiedParagraph = (
    text: string,
    {
      font = bodyFont,
      size = 11,
      color = textColor,
      justify = true,
      gapAfter = paragraphGap,
    }: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      justify?: boolean;
      gapAfter?: number;
    } = {}
  ) => {
    const paragraphs = splitParagraphs(text);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = wrapParagraph(paragraph, font, size);
      lines.forEach((line, lineIndex) => {
        ensureSpace(size + lineGap);
        const trimmed = line.trim();
        const words = trimmed.split(/\s+/);
        const isLastLine = lineIndex === lines.length - 1;
        const lineWidth = font.widthOfTextAtSize(trimmed, size);
        const remainingWidth = maxWidth - lineWidth;
        const canJustify = justify && !isLastLine && words.length > 2 && remainingWidth > 0;

        if (canJustify) {
          const baseSpaceWidth = font.widthOfTextAtSize(' ', size);
          const extraSpacing = Math.min(remainingWidth / (words.length - 1), size * 2);
          const gapWidth = baseSpaceWidth + extraSpacing;
          let cursorX = margin;
          words.forEach((word, wordIndex) => {
            page.drawText(word, { x: cursorX, y: cursorY, size, font, color });
            cursorX += font.widthOfTextAtSize(word, size);
            if (wordIndex !== words.length - 1) {
              cursorX += gapWidth;
            }
          });
        } else {
          page.drawText(trimmed, {
            x: margin,
            y: cursorY,
            size,
            font,
            color,
          });
        }
        cursorY -= size + lineGap;
      });
      if (paragraphIndex !== paragraphs.length - 1 || gapAfter) {
        cursorY -= gapAfter;
      }
    });
  };

  const drawLetterNumberAndDate = () => {
    ensureSpace(32);
    const numberText = reference ? `Ma'lumotnoma No. ${reference}` : "Ma'lumotnoma No. —";
    const dateValue = dueDate || new Date().toISOString().slice(0, 10);
    const dateLabel = `Sana: ${dateValue}`;
    const dateWidth = bodyFont.widthOfTextAtSize(dateLabel, 11);
    page.drawText(numberText, { x: margin, y: cursorY, size: 11, font: headingFont, color: textColor });
    page.drawText(dateLabel, { x: pageWidth - margin - dateWidth, y: cursorY, size: 11, font: bodyFont, color: textColor });
    cursorY -= 24;
    // page.drawLine({
    //   start: { x: margin, y: cursorY },
    //   end: { x: pageWidth - margin, y: cursorY },
    //   thickness: 0.5,
    //   color: mutedColor,
    // });
    cursorY -= 16;
  };

  const drawRecipientBlock = () => {
    if (recipientName) {
      ensureSpace(30);
      page.drawText(recipientName, { x: margin, y: cursorY, size: 12, font: headingFont, color: textColor });
      cursorY -= 18;
    }
    const recipientMeta = [recipientRole, organization].filter(Boolean).join(' · ');
    if (recipientMeta) {
      page.drawText(recipientMeta, { x: margin, y: cursorY, size: 10, font: bodyFont, color: mutedColor });
      cursorY -= 20;
    }
  };

  const drawLetterTitle = () => {
    if (!title) return;
    ensureSpace(26);
    page.drawText(title, { x: margin, y: cursorY, size: 14, font: headingFont, color: textColor });
    cursorY -= 24;
  };

  const drawBody = () => {
    sections.forEach((section) => {
      if (section.heading) {
        ensureSpace(20);
        page.drawText(section.heading, { x: margin, y: cursorY, size: 11.5, font: headingFont, color: textColor });
        cursorY -= 16;
      }
      if (section.body) {
        drawJustifiedParagraph(section.body, { justify: true });
      }
    });
  };

  const drawAttachments = () => {
    if (!attachments.length) return;
    ensureSpace(attachments.length * 18 + 30);
    page.drawText('Ilovalar:', { x: margin, y: cursorY, size: 11, font: headingFont, color: textColor });
    cursorY -= 18;
    attachments.forEach((attachment, index) => {
      const line = `${index + 1}. ${attachment.name} — ${attachment.description}`;
      drawJustifiedParagraph(line, { justify: false, gapAfter: 6 });
    });
  };

  const drawNotes = () => {
    if (!notes) return;
    ensureSpace(40);
    page.drawText("Qo'shimcha eslatma:", { x: margin, y: cursorY, size: 11, font: headingFont, color: textColor });
    cursorY -= 18;
    drawJustifiedParagraph(notes, { font: bodyFont, color: mutedColor, justify: true });
  };

  const drawSignatureBlock = () => {
    const qrSize = 96 / 1.5;
    let textHeight = 20;
    if (signatoryRole) textHeight += 16;
    if (signatoryName) textHeight += 18;
    const blockHeight = Math.max(qrSize + 24, textHeight + 24);
    ensureSpace(blockHeight);
    const startY = cursorY;
    const qrMatrix = createPseudoQrMatrix(reference || letterhead.company, 21);
    drawPseudoQrCode(page, pageWidth - margin - qrSize, startY, qrSize, qrMatrix, textColor);
    page.drawText(organization, { x: margin, y: startY, size: 12, font: headingFont, color: textColor });
    cursorY -= 20;
    if (signatoryRole) {
      page.drawText(signatoryRole, { x: margin, y: cursorY, size: 10, font: bodyFont, color: mutedColor });
      cursorY -= 16;
    }
    if (signatoryName) {
      page.drawText(signatoryName, { x: margin, y: cursorY, size: 11, font: headingFont, color: textColor });
      cursorY -= 18;
    }
    cursorY = startY - blockHeight;
  };

  const drawFooter = (targetPage: PDFPage) => {
    const footerY = footerHeight - 10;
    targetPage.drawLine({
      start: { x: margin, y: footerY + 24 },
      end: { x: pageWidth - margin, y: footerY + 24 },
      thickness: 0.8,
      color: mutedColor,
    });
    footerContacts.forEach((contact, index) => {
      targetPage.drawText(contact, {
        x: margin,
        y: footerY + 10 - index * 12,
        size: 9,
        font: bodyFont,
        color: mutedColor,
      });
    });
    const signature = `${letterhead.company} · ${language.toUpperCase()}`;
    const signatureWidth = bodyFont.widthOfTextAtSize(signature, 9);
    targetPage.drawText(signature, {
      x: pageWidth - margin - signatureWidth,
      y: footerY - 2,
      size: 9,
      font: bodyFont,
      color: mutedColor,
    });
  };

  page = createPage(true);
  drawLetterNumberAndDate();
  drawRecipientBlock();
  drawLetterTitle();
  drawBody();
  drawAttachments();
  drawNotes();
  drawSignatureBlock();
  const lastPage = pages.at(-1);
  if (lastPage) {
    drawFooter(lastPage);
  }

  const pdfBytes = await doc.save();
  return new Blob([toArrayBuffer(pdfBytes)], { type: 'application/pdf' });
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const SectionEditor = ({
  section,
  onChange,
  onRemove,
  disableRemove,
}: {
  section: LetterSection;
  onChange: (patch: Partial<LetterSection>) => void;
  onRemove: () => void;
  disableRemove: boolean;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Paragraf</p>
        <p className="text-sm font-semibold text-slate-900">{section.heading || 'Nomlanmagan paragraf'}</p>
      </div>
      <button
        type="button"
        disabled={disableRemove}
        onClick={onRemove}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
        O’chirish
      </button>
    </div>

    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-500">
        Sarlavha (ixtiyoriy)
        <input
          type="text"
          value={section.heading}
          onChange={(event) => onChange({ heading: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          placeholder="Masalan, Kirish"
        />
      </label>
      <label className="block text-xs font-semibold text-slate-500">
        Paragraf matni
        <textarea
          value={section.body}
          onChange={(event) => onChange({ body: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          rows={4}
          placeholder="Matnni shu yerga yozing..."
        />
      </label>
    </div>
  </div>
);

const LetterPreview = ({
  meta,
  sections,
  notes,
  attachments,
  letterhead,
  logoPreviewUrl,
}: {
  meta: LetterMeta;
  sections: LetterSection[];
  notes: string;
  attachments: Attachment[];
  letterhead: LetterheadDesign;
  logoPreviewUrl?: string | null;
}) => {
  const contactLines = letterhead.contacts.length ? letterhead.contacts : defaultLetterhead.contacts;
  const qrMatrix = createPseudoQrMatrix(meta.reference || letterhead.company, 17);

  return (
    <div className="a4-letter rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreviewUrl} alt="Klub logotipi" className="h-full w-full rounded-2xl object-contain" />
            ) : (
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Logo</span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{letterhead.company}</p>
            {letterhead.tagline && <p className="text-sm text-slate-500">{letterhead.tagline}</p>}
          </div>
        </div>
        <div className="text-xs text-slate-500 md:text-right">
          {contactLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>Ma’lumotnoma No. {meta.reference || '—'}</span>
        <span>Sana: {meta.dueDate}</span>
      </div>

      <div className="mt-6 text-sm">
        <p className="text-base font-semibold text-slate-900">{meta.recipientName}</p>
        <p className="text-slate-500">
          {[meta.recipientRole, meta.organization].filter(Boolean).join(' · ')}
        </p>
      </div>

      {meta.title && <h2 className="mt-6 text-xl font-semibold text-slate-900">{meta.title}</h2>}

      <div className="letter-body mt-4 text-sm leading-relaxed text-slate-700">
        {sections.map((section) => (
          <div key={section.id} className="letter-paragraph">
            {section.heading && <p className="letter-heading font-semibold text-slate-900">{section.heading}</p>}
            {section.body && <p className="letter-text whitespace-pre-line">{section.body}</p>}
          </div>
        ))}
      </div>

      {!!attachments.length && (
        <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ilovalar</p>
          <ul className="mt-2 space-y-1">
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <span className="font-semibold text-slate-900">{attachment.name}</span> — {attachment.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {notes && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {notes}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{meta.organization}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{meta.signatoryRole}</p>
          <p className="text-sm text-slate-700">{meta.signatoryName}</p>
        </div>
        <div
          className="grid w-24 gap-[2px] rounded-lg border border-slate-200 bg-white p-2 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${qrMatrix.length}, minmax(0, 1fr))` }}
        >
          {qrMatrix.flatMap((row, rowIndex) =>
            row.map((filled, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square ${filled ? 'bg-slate-900' : 'bg-slate-200'}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-500">
        {contactLines.map((line) => (
          <p key={`footer-${line}`}>{line}</p>
        ))}
      </div>
    </div>
  );
};

const BrandColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {BRAND_PALETTE.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`h-9 w-9 rounded-2xl border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400 ${option.value.toLowerCase() === value.toLowerCase() ? 'border-slate-900' : 'border-transparent'
            }`}
          style={{ backgroundColor: option.value }}
          aria-label={`${label} ${option.name}`}
        />
      ))}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
        <span>Maxsus</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-6 w-10 cursor-pointer border-none bg-transparent p-0"
        />
      </label>
      <span className="text-xs font-semibold text-slate-400">{value.toUpperCase()}</span>
    </div>
  </div>
);

export default function NewLetterPage() {
  const [meta, setMeta] = useState(defaultMeta);
  const [sections, setSections] = useState(defaultSections);
  const [notes, setNotes] = useState(defaultNotes);
  const [attachments, setAttachments] = useState(defaultAttachments);
  const [letterhead, setLetterhead] = useState(defaultLetterhead);
  const [isExporting, setIsExporting] = useState(false);
  const [logoBytes, setLogoBytes] = useState<Uint8Array | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [pdfFonts, setPdfFonts] = useState<PdfFonts>({ body: null, heading: null });
  const logoPreviewUrlRef = useRef<string | null>(null);
  const defaultLogoRef = useRef<{ bytes: Uint8Array; mimeType: string } | null>(null);
  const fontLoadPromiseRef = useRef<Promise<PdfFonts> | null>(null);

  const stats = useMemo(() => {
    const bodyWordCount = sections.reduce((sum, section) => sum + countWords(section.body), 0);
    return {
      sections: sections.length,
      words: bodyWordCount + countWords(notes),
      dueIn: daysUntil(meta.dueDate),
    };
  }, [sections, notes, meta.dueDate]);

  const previewData = useMemo(
    () => ({ meta, sections, notes, attachments }),
    [meta, sections, notes, attachments]
  );

  const updateLogoPreview = useCallback((bytes: Uint8Array | null, mimeType = 'image/png') => {
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
      logoPreviewUrlRef.current = null;
    }
    if (!bytes) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(new Blob([toArrayBuffer(bytes)], { type: mimeType }));
    logoPreviewUrlRef.current = url;
    setLogoPreviewUrl(url);
  }, []);

  const loadDefaultLogo = useCallback(async () => {
    try {
      const response = await fetch('/agmk-logo.png');
      if (!response.ok) {
        setLogoBytes(null);
        updateLogoPreview(null);
        return;
      }
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const mimeType = response.headers.get('content-type') ?? 'image/png';
      setLogoBytes(bytes);
      updateLogoPreview(bytes, mimeType);
      defaultLogoRef.current = { bytes, mimeType };
    } catch (error) {
      console.warn('AGMK logo load failed', error);
    }
  }, [updateLogoPreview]);

  useEffect(() => {
    loadDefaultLogo();
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
    };
  }, [loadDefaultLogo]);

  const fetchFontBytes = useCallback(async (path: string) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Font load failed: ${path}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }, []);

  const loadPdfFonts = useCallback(async () => {
    const [body, heading] = await Promise.all([fetchFontBytes(FONT_PATHS.body), fetchFontBytes(FONT_PATHS.heading)]);
    return { body, heading };
  }, [fetchFontBytes]);

  const ensurePdfFonts = useCallback(async (): Promise<PdfFonts> => {
    if (pdfFonts.body && pdfFonts.heading) {
      return pdfFonts;
    }
    if (!fontLoadPromiseRef.current) {
      fontLoadPromiseRef.current = loadPdfFonts()
        .then((loaded) => {
          setPdfFonts(loaded);
          return loaded;
        })
        .finally(() => {
          fontLoadPromiseRef.current = null;
        });
    }
    return fontLoadPromiseRef.current;
  }, [pdfFonts, loadPdfFonts]);

  useEffect(() => {
    ensurePdfFonts().catch((error) => {
      console.warn('Font preload failed', error);
    });
  }, [ensurePdfFonts]);

  const handleLetterheadChange = (patch: Partial<LetterheadDesign>) => {
    setLetterhead((prev) => ({ ...prev, ...patch }));
  };

  const handleLetterheadContactsChange = (value: string) => {
    const normalized = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length);
    handleLetterheadChange({ contacts: normalized });
  };

  const handleLetterheadReset = () => {
    setLetterhead(defaultLetterhead);
    if (defaultLogoRef.current) {
      setLogoBytes(defaultLogoRef.current.bytes);
      updateLogoPreview(defaultLogoRef.current.bytes, defaultLogoRef.current.mimeType);
    } else {
      setLogoBytes(null);
      updateLogoPreview(null);
    }
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setLogoBytes(bytes);
      updateLogoPreview(bytes, file.type || 'image/png');
    } catch (error) {
      console.error('Logo upload failed', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleLogoRemove = () => {
    setLogoBytes(null);
    updateLogoPreview(null);
  };

  const handleMetaChange = (key: keyof LetterMeta, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: createId(),
        heading: 'Yangi paragraf',
        body: 'Paragraf matnini shu yerda davom ettiring.',
      },
    ]);
  };

  const handleSectionChange = (id: string, patch: Partial<LetterSection>) => {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  };

  const handleSectionRemove = (id: string) => {
    if (sections.length === 1) return;
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  const handleAttachmentAdd = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: createId(),
        name: 'Yangi ilova',
        description: "Mazkur ilovaga izoh kiriting.",
      },
    ]);
  };

  const handleAttachmentChange = (id: string, patch: Partial<Attachment>) => {
    setAttachments((prev) => prev.map((attachment) => (attachment.id === id ? { ...attachment, ...patch } : attachment)));
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleReset = () => {
    setMeta(defaultMeta);
    setSections(defaultSections);
    setNotes(defaultNotes);
    setAttachments(defaultAttachments);
    setLetterhead(defaultLetterhead);
    if (defaultLogoRef.current) {
      setLogoBytes(defaultLogoRef.current.bytes);
      updateLogoPreview(defaultLogoRef.current.bytes, defaultLogoRef.current.mimeType);
    } else {
      setLogoBytes(null);
      updateLogoPreview(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fontsForExport = await ensurePdfFonts();
      const blob = await generateLetterPdf(previewData, letterhead, fontsForExport, logoBytes ?? undefined);
      const safeRecipient = meta.recipientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `${meta.reference || 'letter'}-${safeRecipient || 'recipient'}.pdf`;
      triggerDownload(blob, filename);
    } catch (error) {
      console.error('PDF export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div>
            <nav className="text-xs uppercase tracking-[0.3em] text-slate-400">
              <Link href="/admin" className="hover:text-slate-600">
                Boshqaruv
              </Link>
              <span className="mx-2 text-slate-300">/</span>
              <Link href="/admin/letters" className="hover:text-slate-600">
                Xatlar
              </Link>
              <span className="mx-2 text-slate-300">/</span>
              Yangi xat
            </nav>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">Yangi rasmiy xat</h1>
              <span className={`rounded-full border px-3 py-1 text-xs ${priorityStyles[meta.priority]}`}>
                {priorityCopy[meta.priority]} ustuvorlik
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white"
            >
              <RefreshCw className="h-4 w-4" />
              Shablonni tiklash
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'PDF tayyorlanmoqda...' : 'PDF eksport qilish'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 lg:grid-cols-[420px,1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <header className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Xat parametrlari</p>
                <p className="text-base font-semibold text-slate-900">Meta ma’lumotlar</p>
              </div>
              <Tag className="h-4 w-4 text-slate-400" />
            </header>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Sarlavha</span>
                <input
                  type="text"
                  value={meta.title}
                  onChange={(event) => handleMetaChange('title', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Kategoriya</span>
                  <select
                    value={meta.category}
                    onChange={(event) => handleMetaChange('category', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Til</span>
                  <select
                    value={meta.language}
                    onChange={(event) => handleMetaChange('language', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Ma’lumotnoma</span>
                  <input
                    type="text"
                    value={meta.reference}
                    onChange={(event) => handleMetaChange('reference', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Sana</span>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={meta.dueDate}
                      onChange={(event) => handleMetaChange('dueDate', event.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none"
                    />
                  </div>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Qabul qiluvchi</span>
                  <input
                    type="text"
                    value={meta.recipientName}
                    onChange={(event) => handleMetaChange('recipientName', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Lavozimi</span>
                  <input
                    type="text"
                    value={meta.recipientRole}
                    onChange={(event) => handleMetaChange('recipientRole', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Tashkilot</span>
                <input
                  type="text"
                  value={meta.organization}
                  onChange={(event) => handleMetaChange('organization', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Imzolovchi (lavozimi)</span>
                  <input
                    type="text"
                    value={meta.signatoryRole}
                    onChange={(event) => handleMetaChange('signatoryRole', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Masalan, Ijrochi direktor"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Imzolovchi (ism-familya)</span>
                  <input
                    type="text"
                    value={meta.signatoryName}
                    onChange={(event) => handleMetaChange('signatoryName', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Masalan, Rustam Ganiev"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                {(['low', 'normal', 'high'] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleMetaChange('priority', priority)}
                    className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${meta.priority === priority
                        ? `${priorityStyles[priority]} border-transparent`
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    {priorityCopy[priority]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <header className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Letterhead</p>
                <p className="text-base font-semibold text-slate-900">Vizual dizayner</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Palitra: 1B3C53 · 456882 · D2C1B6 · F9F3EF</p>
                <p>Fontlar: Reddit Sans / Sora</p>
              </div>
            </header>
            <p className="mt-2 text-xs text-slate-500">
              Klub uslubiyati uchun brand-guideline.md dagi rang va shrift talablariga mos ravishda shablonni sozlang.
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Klub nomi</span>
                <input
                  type="text"
                  value={letterhead.company}
                  onChange={(event) => handleLetterheadChange({ company: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  placeholder='"PFK AGMK" MChJ'
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Taglayn</span>
                <input
                  type="text"
                  value={letterhead.tagline}
                  onChange={(event) => handleLetterheadChange({ tagline: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Professional Futbol Klubi"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Kontaktlar (har bir satr alohida ko’rsatiladi)</span>
                <textarea
                  value={letterhead.contacts.join('\n')}
                  onChange={(event) => handleLetterheadContactsChange(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  rows={3}
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <BrandColorField label="Asosiy rang" value={letterhead.primaryColor} onChange={(value) => handleLetterheadChange({ primaryColor: value })} />
                <BrandColorField label="Aksent rang" value={letterhead.accentColor} onChange={(value) => handleLetterheadChange({ accentColor: value })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <BrandColorField label="Fon" value={letterhead.backgroundColor} onChange={(value) => handleLetterheadChange({ backgroundColor: value })} />
                <BrandColorField label="Matn rangi" value={letterhead.textColor} onChange={(value) => handleLetterheadChange({ textColor: value })} />
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Klub logotipi</p>
                  <p className="text-sm font-semibold text-slate-900">Grafik belgini yuklang</p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="letterhead-logo-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                  >
                    <Plus className="h-4 w-4" />
                    Logoni yuklash
                  </label>
                  <input
                    id="letterhead-logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="sr-only"
                    onChange={handleLogoUpload}
                  />
                  {logoPreviewUrl && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300"
                    >
                      Tozalash
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-2">
                  {logoPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreviewUrl} alt="Yuklangan logo" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Logo</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  SVG yoki fon transparent PNG tavsiya etiladi. Maksimal hajm: 1MB. Yuklangan logo darhol preview va PDF’ga qo’llanadi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLetterheadReset}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
              Letterheadni tiklash
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <header className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kontent</p>
                <p className="text-base font-semibold text-slate-900">Bo’limlar</p>
              </div>
              <Layers className="h-4 w-4 text-slate-400" />
            </header>

            <div className="mt-4 space-y-4">
              {sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onChange={(patch) => handleSectionChange(section.id, patch)}
                  onRemove={() => handleSectionRemove(section.id)}
                  disableRemove={sections.length === 1 && index === 0}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Bo’lim qo’shish
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <header className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ilova</p>
                <p className="text-base font-semibold text-slate-900">Qo’shimcha hujjatlar</p>
              </div>
              <FileCheck2 className="h-4 w-4 text-slate-400" />
            </header>
            <div className="mt-4 space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={attachment.name}
                      onChange={(event) => handleAttachmentChange(attachment.id, { name: event.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ilova nomi"
                    />
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(attachment.id)}
                      className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-slate-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={attachment.description}
                    onChange={(event) =>
                      handleAttachmentChange(attachment.id, { description: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                    rows={2}
                    placeholder="Izoh"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAttachmentAdd}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Ilova qo’shish
            </button>
            <label className="mt-6 block text-xs font-semibold text-slate-500">
              Qo’shimcha eslatmalar
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                rows={4}
                placeholder="Masalan, yuridik tahlil yakuniga doir izoh"
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Uslubiy yo’riqnomalar</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {writingGuides.map((guide) => (
                <li key={guide} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                  <p>{guide}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 p-6 shadow-sm shadow-slate-100">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Monitoring</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Bo’limlar</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.sections}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">So’zlar</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.words}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Muddat</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.dueIn} kun</p>
              </div>
            </div>
          </div>

          <LetterPreview {...previewData} letterhead={letterhead} logoPreviewUrl={logoPreviewUrl ?? undefined} />
        </div>
      </div>
    </div>
  );
}
