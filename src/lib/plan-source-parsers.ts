import * as XLSX from "xlsx";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  DEFAULT_PLAN_SERVICE_TITLE,
  MGB_PLAN_FORMAT,
  MGB_PLAN_VERSION,
  type MgbPlanAppointment,
  type MgbPlanFile,
} from "@/lib/mgb-plan";

type PdfTextItem = { str?: string; transform?: number[] };
type ParseResult = { plan: MgbPlanFile; warnings: string[] };

const DATE_RE = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
const TIME_RE = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const ABBREV_RE = /^[\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)*\s+[\p{L}]{1,3}\.?$/u;
const NAME_GLOBAL_RE = /[\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)*\s+[\p{L}]{1,3}\.?/gu;

function clean(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
function unique(values: string[]): string[] {
  return [...new Set(values.map(clean).filter(Boolean))];
}
function toISO(value: string): string | null {
  const match = value.match(DATE_RE);
  if (!match) return null;
  const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}
function normalizeTime(value: string): string | null {
  const match = value.match(TIME_RE);
  return match ? match[1].padStart(2, "0") + ":" + match[2] : null;
}
function isWeekday(value: string): boolean {
  return /^(mo|di|mi|do|fr|sa|so)(ntag|nstag|ttwoch|nnerstag|eitag|mstag|nntag)?\.?$/i.test(value);
}
function stripKnownPlanNotes(value: string): string {
  return value.replace(/\b[12]\.\s*Advent\b/gi, " ");
}
function extractInlineNotes(value: string): string[] {
  return unique(value.match(/\b[12]\.\s*Advent\b/gi) ?? []);
}
function extractNames(value: string): string[] {
  return unique((value.match(NAME_GLOBAL_RE) ?? []).filter((name) => ABBREV_RE.test(name)));
}
function makeAppointment(dateISO: string, time: string, notes: string[] = [], assignedNames: string[] = []): MgbPlanAppointment {
  return { title: DEFAULT_PLAN_SERVICE_TITLE, dateISO, time, notes: unique(notes), assignedNames: unique(assignedNames), points: 0 };
}
function buildPlan(fileName: string, sourceFormat: "pdf" | "xlsx", appointments: MgbPlanAppointment[], warnings: string[]): ParseResult {
  if (!appointments.length) throw new Error("Es wurden keine Termine erkannt. Bitte prüfe, ob die Datei das erwartete Planlayout verwendet.");
  if (appointments.length > 500) throw new Error("Die Datei enthält mehr als 500 Termine. Bitte teile den Plan auf.");
  return {
    plan: { format: MGB_PLAN_FORMAT, schemaVersion: MGB_PLAN_VERSION, createdAt: new Date().toISOString(), sourceFileName: fileName, sourceFormat, appointments },
    warnings,
  };
}

/** Parses the known MGB spreadsheet layout: date/time in A:C, names in D:G. */
export async function parseXlsxPlan(file: File): Promise<ParseResult> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Die Excel-Datei enthält kein Tabellenblatt.");
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" }) as unknown[][];
  const appointments: MgbPlanAppointment[] = [];
  let current: MgbPlanAppointment | null = null;

  for (const row of rows) {
    const cells = Array.from({ length: 7 }, (_, index) => clean(row[index]));
    const dateISO = /^\s*\d{1,2}\.\d{1,2}\.\d{4}\\s*$/.test(cells[1]) ? toISO(cells[1]) : null;
    const time = /^\s*(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\\s*$/.test(cells[2]) ? normalizeTime(cells[2]) : null;
    const rowNotes = cells.slice(0, 3).filter((cell, index) => cell && !(index === 0 && isWeekday(cell)) && !(index === 1 && /^\s*\\d{1,2}\\.\\d{1,2}\\.\\d{4}\\s*$/.test(cell)) && !(index === 2 && /^\s*(?:[01]?\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?\\s*$/.test(cell)));

    if (dateISO && time) {
      if (current) appointments.push(current);
      const notes = rowNotes;
      current = makeAppointment(dateISO, time, notes);
    } else if (current) {
      current.notes = unique([...current.notes, ...rowNotes]);
    }

    if (current) {
      const names = cells.slice(3, 7).flatMap((cell) => cell.split(/[\r\n;]+/).map(clean)).filter((cell) => cell && !isWeekday(cell));
      current.assignedNames = unique([...current.assignedNames, ...names]);
    }
  }
  if (current) appointments.push(current);
  return buildPlan(file.name, "xlsx", appointments, []);
}

/** Parses selectable text in a PDF. Image-only/scanned PDFs require OCR and are rejected clearly. */
export async function parsePdfPlan(file: File): Promise<ParseResult> {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const rows: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    for (const raw of content.items) {
      const item = raw as PdfTextItem;
      if (!item.str?.trim() || !item.transform) continue;
      const x = item.transform[4] ?? 0;
      const y = item.transform[5] ?? 0;
      let row = rows.find((candidate) => Math.abs(candidate.y - y) < 2.5);
      if (!row) { row = { y, items: [] }; rows.push(row); }
      row.items.push({ x, text: clean(item.str) });
    }
  }

  rows.sort((a, b) => b.y - a.y);
  const appointments: MgbPlanAppointment[] = [];
  let current: MgbPlanAppointment | null = null;

  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    const rowText = row.items.map((item) => item.text).join(" ");
    const dateISO = toISO(rowText);
    const time = normalizeTime(rowText);

    if (dateISO && time) {
      if (current) appointments.push(current);
      const names = extractNames(stripKnownPlanNotes(rowText));
      const inlineNotes = extractInlineNotes(rowText);
      const nameWords = names.flatMap((name) => name.split(/\s+/).map((part) => part.toLocaleLowerCase("de-DE")));
      const notes = row.items
        .map((item) => item.text)
        .filter((text) => !DATE_RE.test(text) && !TIME_RE.test(text) && !isWeekday(text) && text !== "1." && text !== "2." && text.toLocaleLowerCase("de-DE") !== "advent")
        .filter((text) => !nameWords.includes(text.toLocaleLowerCase("de-DE")) && !names.some((name) => name.toLocaleLowerCase("de-DE") === text.toLocaleLowerCase("de-DE")));
      current = makeAppointment(dateISO, time, [...notes, ...inlineNotes], names);
      continue;
    }

    if (!current) continue;
    const names = extractNames(stripKnownPlanNotes(rowText));
    const inlineNotes = extractInlineNotes(rowText);
    current.assignedNames = unique([...current.assignedNames, ...names]);
    const nameWords = names.flatMap((name) => name.split(/\s+/).map((part) => part.toLocaleLowerCase("de-DE")));
    const notes = row.items
      .map((item) => item.text)
      .filter((text) => !DATE_RE.test(text) && !TIME_RE.test(text) && !isWeekday(text) && text !== "1." && text !== "2." && text.toLocaleLowerCase("de-DE") !== "advent")
      .filter((text) => !nameWords.includes(text.toLocaleLowerCase("de-DE")) && !names.some((name) => name.toLocaleLowerCase("de-DE") === text.toLocaleLowerCase("de-DE")));
    current.notes = unique([...current.notes, ...notes, ...inlineNotes]);
  }

  if (!appointments.length && current) appointments.push(current);
  if (!appointments.length) {
    throw new Error("Im PDF wurde kein auslesbarer Termin mit Datum und Uhrzeit gefunden. Bei einem Scan ohne Textebene wird OCR benötigt; diese wird derzeit nicht unterstützt.");
  }
  return buildPlan(file.name, "pdf", appointments, [
    "PDF-Texterkennung: Bitte kontrolliere die Vorschau besonders sorgfältig. Handschriftliche Einträge und ungewöhnliche Kürzelformate können fehlen.",
  ]);
}
