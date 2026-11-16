/**
 * MGB Connect plan file format.
 *
 * A .mgb file is UTF-8 JSON with a versioned envelope. It intentionally stores
 * names instead of Supabase UUIDs so plans can be moved between installations.
 */

export const MGB_PLAN_FORMAT = "mgb-connect-plan" as const;
export const MGB_PLAN_VERSION = 1 as const;
export const MGB_PLAN_MIME_TYPE = "application/vnd.mgb-connect.plan+json";
export const MGB_PLAN_EXTENSION = ".mgb";
export const MGB_PLAN_MAX_SERVICES = 500;

export type MgbPlanSourceFormat = "pdf" | "docx" | "manual" | "mgb";

export type MgbPlanService = {
  title: string;
  dateISO: string;
  time: string;
  location: string;
  meeting: string;
  points: number;
  leaderName: string;
  assignedName: string;
};

export type MgbPlanFile = {
  format: typeof MGB_PLAN_FORMAT;
  schemaVersion: typeof MGB_PLAN_VERSION;
  createdAt: string;
  sourceFileName?: string;
  sourceFormat: MgbPlanSourceFormat;
  services: MgbPlanService[];
};

export type MgbPlanValidationIssue = {
  path: string;
  message: string;
};

export type MgbPlanValidationResult =
  | { ok: true; plan: MgbPlanFile }
  | { ok: false; issues: MgbPlanValidationIssue[] };

const MAX_TEXT_LENGTH = 240;
const MAX_POINTS = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  value: unknown,
  path: string,
  issues: MgbPlanValidationIssue[],
  required = false
): string {
  if (typeof value !== "string") {
    if (required) issues.push({ path, message: "Dieses Feld muss Text enthalten." });
    return "";
  }

  const trimmed = value.trim();
  if (required && !trimmed) {
    issues.push({ path, message: "Dieses Feld darf nicht leer sein." });
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    issues.push({ path, message: `Maximal ${MAX_TEXT_LENGTH} Zeichen erlaubt.` });
  }
  return trimmed;
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateService(value: unknown, index: number, issues: MgbPlanValidationIssue[]): MgbPlanService {
  const path = `services[${index}]`;
  if (!isRecord(value)) {
    issues.push({ path, message: "Der Diensteintrag muss ein Objekt sein." });
    return { title: "", dateISO: "", time: "", location: "", meeting: "", points: 0, leaderName: "", assignedName: "" };
  }

  const title = readText(value.title, `${path}.title`, issues, true);
  const dateISO = readText(value.dateISO, `${path}.dateISO`, issues, true);
  if (dateISO && !isRealDate(dateISO)) {
    issues.push({ path: `${path}.dateISO`, message: "Bitte ein gültiges Datum im Format JJJJ-MM-TT verwenden." });
  }

  const time = readText(value.time, `${path}.time`, issues, true);
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    issues.push({ path: `${path}.time`, message: "Die Uhrzeit muss im Format HH:MM angegeben sein." });
  }

  const points = value.points;
  if (typeof points !== "number" || !Number.isInteger(points) || points < 0 || points > MAX_POINTS) {
    issues.push({ path: `${path}.points`, message: `Punkte müssen eine ganze Zahl zwischen 0 und ${MAX_POINTS} sein.` });
  }

  return {
    title,
    dateISO,
    time,
    location: readText(value.location, `${path}.location`, issues),
    meeting: readText(value.meeting, `${path}.meeting`, issues),
    points: typeof points === "number" && Number.isInteger(points) ? points : 0,
    leaderName: readText(value.leaderName, `${path}.leaderName`, issues),
    assignedName: readText(value.assignedName, `${path}.assignedName`, issues),
  };
}

export function validateMgbPlan(value: unknown): MgbPlanValidationResult {
  const issues: MgbPlanValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [{ path: "$", message: "Die Datei enthält kein gültiges MGB-Planobjekt." }] };
  }

  if (value.format !== MGB_PLAN_FORMAT) {
    issues.push({ path: "format", message: "Das ist keine gültige MGB-Connect-Plan-Datei." });
  }
  if (value.schemaVersion !== MGB_PLAN_VERSION) {
    issues.push({ path: "schemaVersion", message: `Diese Dateiversion wird nicht unterstützt. Unterstützt wird Version ${MGB_PLAN_VERSION}.` });
  }

  const createdAt = readText(value.createdAt, "createdAt", issues, true);
  if (createdAt && Number.isNaN(Date.parse(createdAt))) {
    issues.push({ path: "createdAt", message: "Das Erstellungsdatum ist ungültig." });
  }

  const sourceFormats: MgbPlanSourceFormat[] = ["pdf", "docx", "manual", "mgb"];
  const sourceFormat = sourceFormats.includes(value.sourceFormat as MgbPlanSourceFormat)
    ? (value.sourceFormat as MgbPlanSourceFormat)
    : "manual";
  if (!sourceFormats.includes(value.sourceFormat as MgbPlanSourceFormat)) {
    issues.push({ path: "sourceFormat", message: "Das Quelldateiformat ist ungültig." });
  }

  const sourceFileName = value.sourceFileName === undefined
    ? undefined
    : readText(value.sourceFileName, "sourceFileName", issues);

  if (!Array.isArray(value.services)) {
    issues.push({ path: "services", message: "Die Datei muss eine Dienste-Liste enthalten." });
  } else if (value.services.length === 0) {
    issues.push({ path: "services", message: "Der Plan enthält noch keine Dienste." });
  } else if (value.services.length > MGB_PLAN_MAX_SERVICES) {
    issues.push({ path: "services", message: `Maximal ${MGB_PLAN_MAX_SERVICES} Dienste pro Plan sind erlaubt.` });
  }

  const services = Array.isArray(value.services)
    ? value.services.slice(0, MGB_PLAN_MAX_SERVICES).map((service, index) => validateService(service, index, issues))
    : [];

  if (issues.length) return { ok: false, issues };

  return {
    ok: true,
    plan: {
      format: MGB_PLAN_FORMAT,
      schemaVersion: MGB_PLAN_VERSION,
      createdAt,
      ...(sourceFileName ? { sourceFileName } : {}),
      sourceFormat,
      services,
    },
  };
}

export function encodeMgbPlan(value: unknown): string {
  const result = validateMgbPlan(value);
  if (!result.ok) {
    throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
  }
  return JSON.stringify(result.plan, null, 2);
}

export function decodeMgbPlan(contents: string): MgbPlanValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    return { ok: false, issues: [{ path: "$", message: "Die Datei ist beschädigt oder enthält kein gültiges JSON." }] };
  }
  return validateMgbPlan(parsed);
}

export function createMgbPlanFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `messdienerplan-${stamp}.mgb`;
}

/** Returns indexes of repeated services. The first occurrence is kept as the reference. */
export function findDuplicateMgbServices(services: MgbPlanService[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  services.forEach((service, index) => {
    const key = [
      service.dateISO,
      service.time,
      service.title.toLocaleLowerCase("de-DE"),
      service.location.toLocaleLowerCase("de-DE"),
    ].join("|");

    if (seen.has(key)) duplicates.push(index);
    else seen.add(key);
  });

  return duplicates;
}
