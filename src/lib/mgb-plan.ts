/**
 * Versioned, portable MGB Connect plan format.
 * Names remain source abbreviations; Supabase profile IDs never enter the file.
 */
export const MGB_PLAN_FORMAT = "mgb-connect-plan" as const;
export const MGB_PLAN_VERSION = 2 as const;
export const MGB_PLAN_MIME_TYPE = "application/vnd.mgb-connect.plan+json";
export const MGB_PLAN_EXTENSION = ".mgb";
export const MGB_PLAN_MAX_APPOINTMENTS = 500;
export const DEFAULT_PLAN_SERVICE_TITLE = "Messdienerdienst";
export const DEFAULT_PLAN_SERVICE_POINTS = 10;
export type MgbPlanSourceFormat = "pdf" | "xlsx" | "manual" | "mgb";
export type MgbPlanAppointment = {
  title: string;
  dateISO: string;
  time: string;
  notes: string[];
  assignedNames: string[];
  points?: number;
};
export type MgbPlanFile = {
  format: typeof MGB_PLAN_FORMAT;
  schemaVersion: typeof MGB_PLAN_VERSION;
  createdAt: string;
  sourceFileName?: string;
  sourceFormat: MgbPlanSourceFormat;
  appointments: MgbPlanAppointment[];
};
export type MgbPlanValidationIssue = { path: string; message: string };
export type MgbPlanValidationResult =
  | { ok: true; plan: MgbPlanFile }
  | { ok: false; issues: MgbPlanValidationIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readText(value: unknown, path: string, issues: MgbPlanValidationIssue[], required = false): string {
  if (typeof value !== "string") {
    if (required) issues.push({ path, message: "Dieses Feld muss Text enthalten." });
    return "";
  }
  const text = value.trim();
  if (required && !text) issues.push({ path, message: "Dieses Feld darf nicht leer sein." });
  if (text.length > 240) issues.push({ path, message: "Maximal 240 Zeichen erlaubt." });
  return text;
}
function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function validateAppointment(value: unknown, index: number, issues: MgbPlanValidationIssue[]): MgbPlanAppointment {
  const path = `appointments[${index}]`;
  if (!isRecord(value)) {
    issues.push({ path, message: "Der Termineintrag muss ein Objekt sein." });
    return { title: "", dateISO: "", time: "", notes: [], assignedNames: [] };
  }
  const title = readText(value.title, path + ".title", issues, true);
  const dateISO = readText(value.dateISO, path + ".dateISO", issues, true);
  if (dateISO && !isRealDate(dateISO)) issues.push({ path: path + ".dateISO", message: "Ungültiges Datum (JJJJ-MM-TT)." });
  const time = readText(value.time, path + ".time", issues, true);
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) issues.push({ path: path + ".time", message: "Ungültige Uhrzeit (HH:MM)." });
  const list = (input: unknown, field: "notes" | "assignedNames", optional = false): string[] => {
    if (input === undefined && optional) return [];
    if (!Array.isArray(input)) {
      issues.push({ path: path + "." + field, message: "Dieses Feld muss eine Liste sein." });
      return [];
    }
    const max = field === "notes" ? 40 : 80;
    if (input.length > max) issues.push({ path: path + "." + field, message: "Zu viele Einträge." });
    return input.slice(0, max).map((v, i) => readText(v, path + "." + field + "[" + i + "]", issues, true)).filter(Boolean);
  };
  const points = value.points === undefined ? DEFAULT_PLAN_SERVICE_POINTS : value.points;
  if (typeof points !== "number" || !Number.isInteger(points) || points < 0 || points > 1000) {
    issues.push({ path: path + ".points", message: "Punkte müssen eine ganze Zahl zwischen 0 und 1000 sein." });
  }
  return { title, dateISO, time, notes: list(value.notes, "notes", true), assignedNames: list(value.assignedNames, "assignedNames"), points: typeof points === "number" && Number.isInteger(points) && points >= 0 && points <= 1000 ? points : DEFAULT_PLAN_SERVICE_POINTS };
}
export function validateMgbPlan(value: unknown): MgbPlanValidationResult {
  const issues: MgbPlanValidationIssue[] = [];
  if (!isRecord(value)) return { ok: false, issues: [{ path: "$", message: "Ungültiges MGB-Planobjekt." }] };
  if (value.format !== MGB_PLAN_FORMAT) issues.push({ path: "format", message: "Keine gültige MGB-Connect-Plan-Datei." });
  if (value.schemaVersion !== MGB_PLAN_VERSION) issues.push({ path: "schemaVersion", message: "Nicht unterstützte Dateiversion. Erwartet wird Version 2." });
  const createdAt = readText(value.createdAt, "createdAt", issues, true);
  if (createdAt && Number.isNaN(Date.parse(createdAt))) issues.push({ path: "createdAt", message: "Ungültiger Erstellungszeitpunkt." });
  const formats: MgbPlanSourceFormat[] = ["pdf", "xlsx", "manual", "mgb"];
  const sourceFormat = formats.includes(value.sourceFormat as MgbPlanSourceFormat) ? value.sourceFormat as MgbPlanSourceFormat : "manual";
  if (!formats.includes(value.sourceFormat as MgbPlanSourceFormat)) issues.push({ path: "sourceFormat", message: "Ungültiges Quelldateiformat." });
  const sourceFileName = value.sourceFileName === undefined ? undefined : readText(value.sourceFileName, "sourceFileName", issues);
  if (!Array.isArray(value.appointments) || value.appointments.length < 1 || value.appointments.length > MGB_PLAN_MAX_APPOINTMENTS) {
    issues.push({ path: "appointments", message: "Der Plan muss 1 bis 500 Termine enthalten." });
  }
  const appointments = Array.isArray(value.appointments) ? value.appointments.slice(0, MGB_PLAN_MAX_APPOINTMENTS).map((v, i) => validateAppointment(v, i, issues)) : [];
  if (issues.length) return { ok: false, issues };
  return { ok: true, plan: { format: MGB_PLAN_FORMAT, schemaVersion: MGB_PLAN_VERSION, createdAt, ...(sourceFileName ? { sourceFileName } : {}), sourceFormat, appointments } };
}
export function encodeMgbPlan(value: unknown): string {
  const result = validateMgbPlan(value);
  if (!result.ok) throw new Error(result.issues.map((x) => x.path + ": " + x.message).join("\n"));
  return JSON.stringify(result.plan, null, 2);
}
export function decodeMgbPlan(contents: string): MgbPlanValidationResult {
  try { return validateMgbPlan(JSON.parse(contents) as unknown); }
  catch { return { ok: false, issues: [{ path: "$", message: "Datei beschädigt oder kein gültiges JSON." }] }; }
}
export function createMgbPlanFileName(date = new Date()): string {
  return "messdienerplan-" + date.toISOString().slice(0, 10) + ".mgb";
}
export function normalizePlanAbbreviation(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[.]/g, "").replace(/\s+/g, " ").trim();
}
/** Candidate suggestion only. A human confirmation is always required before saving. */
export function getPlanNameMatchScore(abbreviation: string, displayName: string): number {
  const parts = abbreviation.trim().replace(/\.$/, "").split(/\s+/);
  if (parts.length < 2) return 0;
  const surnamePrefix = parts.slice(0, -1).join(" ").toLocaleLowerCase("de-DE");
  const initial = parts.at(-1)!.replace(/[^\p{L}]/gu, "").slice(0, 1).toLocaleLowerCase("de-DE");
  const nameParts = displayName.trim().split(/\s+/);
  if (nameParts.length < 2 || !initial) return 0;
  const surname = nameParts.at(-1)!.toLocaleLowerCase("de-DE");
  const firstInitial = nameParts[0].replace(/[^\p{L}]/gu, "").slice(0, 1).toLocaleLowerCase("de-DE");
  return firstInitial === initial && surname.startsWith(surnamePrefix) ? 2 : 0;
}
export function findDuplicateMgbAppointments(appointments: MgbPlanAppointment[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  appointments.forEach((a, i) => {
    const key = [a.dateISO, a.time, a.title.toLocaleLowerCase("de-DE")].join("|");
    if (seen.has(key)) duplicates.push(i); else seen.add(key);
  });
  return duplicates;
}
