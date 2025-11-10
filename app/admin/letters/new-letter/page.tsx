'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, FileCheck2, Layers, Plus, RefreshCw, Tag, Trash2 } from 'lucide-react';
import { PDFDocument, PDFImage, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';

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

const LETTERHEAD = {
  company: '"PFK AGMK" MChJ',
  tagline: 'Professional Futbol Klubi AGMK',
  contacts: [
    'Toshkent viloyati, Olmaliq shahri, 110700',
    'Tel: +998 71 000 00 00',
    'www.agmk.uz · info@agmk.uz',
  ],
  colors: {
    primary: rgb(17 / 255, 28 / 255, 48 / 255),
    accent: rgb(229 / 255, 166 / 255, 62 / 255),
    ink: rgb(30 / 255, 35 / 255, 48 / 255),
    muted: rgb(102 / 255, 112 / 255, 126 / 255),
  },
};

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

async function generateLetterPdf(payload: PdfPayload, logoBytes?: Uint8Array) {
  const doc = await PDFDocument.create();
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
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
  const fontSize = 11;
  const lineGap = 4;
  const paragraphGap = 12;
  const headerHeight = 120;
  const footerHeight = 72;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const textColor = LETTERHEAD.colors.ink;
  const accentColor = LETTERHEAD.colors.accent;

  const {
    meta: { title, recipientName, recipientRole, organization, reference, category, language, priority, dueDate },
    sections,
    notes,
    attachments,
  } = payload;

  let cursorY = 0;
  let pageNumber = 0;
  let page: PDFPage;

  const drawLetterhead = (targetPage: PDFPage) => {
    targetPage.drawRectangle({
      x: 0,
      y: pageHeight - headerHeight,
      width: pageWidth,
      height: headerHeight,
      color: LETTERHEAD.colors.primary,
    });
    targetPage.drawRectangle({
      x: 0,
      y: pageHeight - headerHeight,
      width: 16,
      height: headerHeight,
      color: accentColor,
    });
    targetPage.drawText(LETTERHEAD.company, {
      x: margin,
      y: pageHeight - 36,
      size: 20,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    targetPage.drawText(LETTERHEAD.tagline, {
      x: margin,
      y: pageHeight - 58,
      size: 11,
      font: regularFont,
      color: rgb(0.82, 0.87, 0.94),
    });
    const rightColumnX = pageWidth - margin - 180;
    targetPage.drawText(`Ma'lumotnoma: ${reference}`, {
      x: rightColumnX,
      y: pageHeight - 40,
      size: 10,
      font: regularFont,
      color: rgb(0.9, 0.92, 0.95),
    });
    targetPage.drawText(`Tasdiqlash muddati: ${dueDate}`, {
      x: rightColumnX,
      y: pageHeight - 56,
      size: 10,
      font: regularFont,
      color: rgb(0.9, 0.92, 0.95),
    });
    if (logoImage) {
      const desiredWidth = 90;
      const aspectRatio = logoImage.height / logoImage.width;
      const height = desiredWidth * aspectRatio;
      targetPage.drawImage(logoImage, {
        x: pageWidth - margin - desiredWidth,
        y: pageHeight - headerHeight / 2 - height / 2,
        width: desiredWidth,
        height,
      });
    } else {
      targetPage.drawCircle({
        x: pageWidth - margin - 40,
        y: pageHeight - headerHeight / 2,
        size: 26,
        color: accentColor,
      });
    }
  };

  const drawFooter = (targetPage: PDFPage, currentPageNumber: number) => {
    targetPage.drawLine({
      start: { x: margin, y: footerHeight },
      end: { x: pageWidth - margin, y: footerHeight },
      thickness: 1.2,
      color: accentColor,
    });
    LETTERHEAD.contacts.forEach((contact, index) => {
      targetPage.drawText(contact, {
        x: margin,
        y: footerHeight - 20 - index * 12,
        size: 9,
        font: regularFont,
        color: LETTERHEAD.colors.muted,
      });
    });
    targetPage.drawText(`Sahifa ${currentPageNumber}`, {
      x: pageWidth - margin - 70,
      y: footerHeight - 20,
      size: 9,
      font: boldFont,
      color: LETTERHEAD.colors.muted,
    });
  };

  const createPage = () => {
    pageNumber += 1;
    const nextPage = doc.addPage([pageWidth, pageHeight]);
    drawLetterhead(nextPage);
    drawFooter(nextPage, pageNumber);
    cursorY = pageHeight - headerHeight - margin / 2;
    return nextPage;
  };

  const wrapText = (text: string, font = regularFont, size = fontSize) => {
    const sanitized = text.replace(/\r/g, '');
    const paragraphs = sanitized.split('\n');
    const lines: string[] = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
      } else {
        let line = '';
        words.forEach((word) => {
          const trial = line ? `${line} ${word}` : word;
          const width = font.widthOfTextAtSize(trial, size);
          if (width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = trial;
          }
        });
        if (line) lines.push(line);
      }
      if (paragraphIndex !== paragraphs.length - 1) {
        lines.push('');
      }
    });

    return lines.length ? lines : [''];
  };

  const ensureSpace = (needed: number) => {
    if (cursorY - needed <= footerHeight + margin / 2) {
      page = createPage();
    }
  };

  const drawParagraph = (text: string, options: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gapAfter?: number } = {}) => {
    const { font = regularFont, size = fontSize, color = textColor, gapAfter = paragraphGap } = options;
    const lines = wrapText(text, font, size);
    lines.forEach((line) => {
      ensureSpace(size + lineGap);
      if (line) {
        page.drawText(line, { x: margin, y: cursorY, size, font, color });
      }
      cursorY -= size + lineGap;
    });
    cursorY -= gapAfter;
  };

  const drawHero = () => {
    ensureSpace(60);
    page.drawText(title, { x: margin, y: cursorY, size: 18, font: boldFont, color: textColor });
    cursorY -= 28;
    page.drawText(`${recipientRole} ${recipientName} · ${organization}`, {
      x: margin,
      y: cursorY,
      size: 12,
      font: regularFont,
      color: LETTERHEAD.colors.muted,
    });
    cursorY -= 24;
  };

  const drawSummaryCard = () => {
    const summaryEntries = [
      { label: "Ma'lumotnoma", value: reference },
      { label: 'Kategoriya', value: category },
      { label: 'Til', value: language.toUpperCase() },
      { label: 'Ustuvorlik', value: priorityCopy[priority] },
      { label: 'Tasdiqlash muddati', value: dueDate },
    ].filter((entry) => entry.value);

    if (!summaryEntries.length) return;

    const columns = 2;
    const rows = Math.ceil(summaryEntries.length / columns);
    const boxPadding = 18;
    const rowHeight = 32;
    const boxHeight = boxPadding * 2 + rows * rowHeight;

    ensureSpace(boxHeight + paragraphGap);

    const topY = cursorY;
    page.drawRectangle({
      x: margin,
      y: topY - boxHeight,
      width: maxWidth,
      height: boxHeight,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.85, 0.9, 0.98),
      borderWidth: 1,
    });

    const columnWidth = (maxWidth - boxPadding * 2) / columns;
    summaryEntries.forEach((entry, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const itemX = margin + boxPadding + column * columnWidth;
      const itemY = topY - boxPadding - row * rowHeight;

      page.drawText(entry.label.toUpperCase(), {
        x: itemX,
        y: itemY,
        size: 8,
        font: boldFont,
        color: accentColor,
      });
      page.drawText(entry.value, {
        x: itemX,
        y: itemY - 14,
        size: 11,
        font: regularFont,
        color: textColor,
      });
    });

    cursorY = topY - boxHeight - paragraphGap;
  };

  const drawSectionHeading = (heading: string) => {
    ensureSpace(34);
    page.drawText(heading, { x: margin, y: cursorY, size: 13, font: boldFont, color: textColor });
    cursorY -= 16;
    page.drawRectangle({
      x: margin,
      y: cursorY + 6,
      width: 42,
      height: 2,
      color: accentColor,
    });
    cursorY -= 18;
  };

  page = createPage();
  drawHero();
  drawSummaryCard();

  sections.forEach((section) => {
    drawSectionHeading(section.heading);
    drawParagraph(section.body);
  });

  if (attachments.length) {
    drawSectionHeading('Ilovalar');
    attachments.forEach((attachment, index) => {
      drawParagraph(`${index + 1}. ${attachment.name} — ${attachment.description}`, { gapAfter: 6 });
    });
    cursorY -= paragraphGap;
  }

  if (notes) {
    drawSectionHeading("Qo'shimcha eslatmalar");
    drawParagraph(notes);
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
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
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bo'lim</p>
        <p className="text-sm font-semibold text-slate-900">{section.heading || 'Nomlanmagan bo\'lim'}</p>
      </div>
      <button
        type="button"
        disabled={disableRemove}
        onClick={onRemove}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
        O'chirish
      </button>
    </div>

    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-500">
        Sarlavha
        <input
          type="text"
          value={section.heading}
          onChange={(event) => onChange({ heading: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          placeholder="Masalan, Strategik asos"
        />
      </label>
      <label className="block text-xs font-semibold text-slate-500">
        Matn
        <textarea
          value={section.body}
          onChange={(event) => onChange({ body: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          rows={4}
          placeholder="Bo'lim mazmunini kiriting..."
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
}: {
  meta: LetterMeta;
  sections: LetterSection[];
  notes: string;
  attachments: Attachment[];
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/70">
    <div className="pb-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{LETTERHEAD.company}</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{meta.title}</h1>
      <p className="text-sm text-slate-500">
        {meta.recipientRole} {meta.recipientName} · {meta.organization}
      </p>
      <p className="text-xs text-slate-400">
        {meta.category} · {meta.language.toUpperCase()} · {meta.reference}
      </p>
    </div>

    <div className="space-y-5 text-sm leading-relaxed text-slate-700">
      {sections.map((section) => (
        <Fragment key={section.id}>
          <p className="font-semibold text-slate-900">{section.heading}</p>
          <p className="whitespace-pre-line text-slate-600">{section.body}</p>
        </Fragment>
      ))}
    </div>

    {!!attachments.length && (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ilovalar</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <span className="font-medium text-slate-900">{attachment.name}</span> — {attachment.description}
            </li>
          ))}
        </ul>
      </div>
    )}

    {notes && (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3 text-xs text-slate-500">
        {notes}
      </div>
    )}
  </div>
);

export default function NewLetterPage() {
  const [meta, setMeta] = useState(defaultMeta);
  const [sections, setSections] = useState(defaultSections);
  const [notes, setNotes] = useState(defaultNotes);
  const [attachments, setAttachments] = useState(defaultAttachments);
  const [isExporting, setIsExporting] = useState(false);
  const [logoBytes, setLogoBytes] = useState<Uint8Array | null>(null);

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

  useEffect(() => {
    let active = true;
    const loadLogo = async () => {
      try {
        const response = await fetch('/agmk-logo.png');
        if (!response.ok) return;
        const buffer = await response.arrayBuffer();
        if (active) setLogoBytes(new Uint8Array(buffer));
      } catch (error) {
        console.warn('AGMK logo load failed', error);
      }
    };
    loadLogo();
    return () => {
      active = false;
    };
  }, []);

  const handleMetaChange = (key: keyof LetterMeta, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: createId(),
        heading: "Yangi bo'lim",
        body: "Bo'lim matnini shu yerda davom ettiring.",
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
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await generateLetterPdf(previewData, logoBytes ?? undefined);
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
                <p className="text-base font-semibold text-slate-900">Meta ma'lumotlar</p>
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
                  <span className="text-xs font-semibold text-slate-500">Ma'lumotnoma</span>
                  <input
                    type="text"
                    value={meta.reference}
                    onChange={(event) => handleMetaChange('reference', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">Tasdiqlash muddati</span>
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
              <div className="flex items-center gap-3">
                {(['low', 'normal', 'high'] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleMetaChange('priority', priority)}
                    className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      meta.priority === priority
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kontent</p>
                <p className="text-base font-semibold text-slate-900">Bo'limlar</p>
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
              Bo'lim qo'shish
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <header className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ilova</p>
                <p className="text-base font-semibold text-slate-900">Qo'shimcha hujjatlar</p>
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
              Ilova qo'shish
            </button>
            <label className="mt-6 block text-xs font-semibold text-slate-500">
              Qo'shimcha eslatmalar
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
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Uslubiy yo'riqnomalar</p>
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
                <p className="text-xs font-semibold text-slate-500">Bo'limlar</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.sections}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">So'zlar</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.words}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Muddat</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.dueIn} kun</p>
              </div>
            </div>
          </div>

          <LetterPreview {...previewData} />
        </div>
      </div>
    </div>
  );
}
