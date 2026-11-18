import * as XLSX from "xlsx";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  DEFAULT_PLAN_SERVICE_TITLE,
  MGB_PLAN_FORMAT,
  MGB_PLAN_VERSION,
  type MgbPlanAppointment,
  type MgbPlanFile,
} from "@/lib/mgb-plan";

type PdfTextItem = { str?: string; transform?: number[]; width?: number };
type ParseResult = { plan: MgbPlanFile; warnings: string[] };

const DATE_RE = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
const TIME_RE = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const ABBREV_RE = /^[\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*)*\s+[\p{L}]\.?$/u;

function clean(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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
function extractNames(value: string): string[] {
  const matches = value.match(/[\\p{L}][\\p{L}'’-]*(?:\\s+[\\p{L}][\\p{L}'’-]*)*\\s+[\\p{L}]\\.?/gu) ?? [];
  return unique(matches.filter((match) => ABBREV_RE.test(match)));
}
function unique(values: string[]): string[] {
  return [...new Set(values.map(clean).filter(Boolean))];
}
function buildPlan(fileName: string, sourceFormat: "pdf" | "xlsx", appointments: MgbPlanAppointment[], warnings: string[]): ParseResult {
  if (!appointments.length) throw new Error("Es wurden keine Termine erkannt. Bitte prüfe, ob die Datei Text enthält und das erwartete Planlayout verwendet.");
  if (appointments.length > 500) throw new Error("Die Datei enthält mehr als 500 Termine. Bitte teile den Plan auf.");
  return {
    plan: { format: MGB_PLAN_FORMAT, schemaVersion: MGB_PLAN_VERSION, createdAt: new Date().toISOString(), sourceFileName: fileName, sourceFormat, appointments },
    warnings,
  };
}

export async function parseXlsxPlan(file: File): Promise<ParseResult> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Die Excel-Datei enthält kein Tabellenblatt.");
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
  const appointments: MgbPlanAppointment[] = [];
  const warnings: string[] = [];
  let current: MgbPlanAppointment | null = null;

  for (const row of rows) {
    const cells = Array.from({ length: 7 }, (_, index) => clean(row[index]));
    const headerText = cells.slice(0, 3).join(" ");
    const dateISO = toISO(headerText);
    const time = normalizeTime(headerText);

    if (dateISO && time) {
      if (current) appointments.push(current);
      const notes = cells.slice(0, 3).filter((cell) => cell && !DATE_RE.test(cell) && !TIME_RE.test(cell) && !isWeekday(cell));
      current = { title: DEFAULT_PLAN_SERVICE_TITLE, dateISO, time, notes: unique(notes), assignedNames: [], points: 0 };
    } else if (current) {
      const rowNotes = cells.slice(0, 3).filter((cell) => cell && !DATE_RE.test(cell) && !TIME_RE.test(cell) && !isWeekday(cell));
      current.notes = unique([...current.notes, ...rowNotes]);
    }

    if (current) {
      const names = cells.slice(3, 7).filter((cell) => cell && !isWeekday(cell));
      current.assignedNames = unique([...current.assignedNames, ...names]);
    }
  }
  if (current) appointments.push(current);
  if (!appointments.length) warnings.push("Keine Datums-/Uhrzeitzeilen im erwarteten Bereich A:C erkannt.");
  return buildPlan(file.name, "xlsx", appointments, warnings);
}

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
  const warnings: string[] = [];
  let current: MgbPlanAppointment | null = null;

  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    const allText = row.items.map((item) => item.text).join(" ");
    const dateISO = toISO(allText);
    const time = normalizeTime(allText);

    if (dateISO && time) {
      if (current) appointments.push(current);
      const notes: string[] = [];
      const assignedNames: string[] = [];
      for (const item of row.items) {
        if (ABBREV_RE.test(item.text)) assignedNames.push(item.text);
        else if (!DATE_RE.test(item.text) && !TIME_RE.test(item.text) && !isWeekday(item.text)) notes.push(item.text);
      }
      current = { title: DEFAULT_PLAN_SERVICE_TITLE, dateISO, time, notes: unique(notes), assignedNames: unique(assignedNames), points: 0 };
      continue;
    }

    if (!current) continue;
    for (const item of row.items) {
      if (ABBREV_RE.test(item.text)) current.assignedNames = unique([...current.assignedNames, item.text]);
      else if (!DATE_RE.test(item.text) && !TIME_RE.test(item.text) && !isWeekday(item.text)) {
        current.notes = unique([...current.notes, item.text]);
      }
    }
  }
  if (current) appointments.push(current);

  if (!appointments.length) {
    throw new Error("Im PDF wurde kein auslesbarer Termin mit Datum und Uhrzeit gefunden. Falls es ein Scan ist, wird OCR benötigt; diese wird noch nicht unterstützt.");
  }
  if (rows.length === 0) warnings.push("Das PDF enthält keine auslesbare Textebene.");
  else warnings.push("Bitte kontrolliere die PDF-Vorschau besonders sorgfältig: handschriftliche Einträge und ungewöhnliche Kürzelformate können nicht sicher erkannt werden.");
  return buildPlan(file.name, "pdf", appointments, warnings);
}
