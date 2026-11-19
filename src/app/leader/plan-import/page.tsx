"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileUp, Loader2, ShieldCheck, Upload } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { useServices } from "@/context/ServiceContext";
import {
  DEFAULT_PLAN_SERVICE_POINTS,
  decodeMgbPlan,
  encodeMgbPlan,
  findDuplicateMgbAppointments,
  getPlanNameMatchScore,
  normalizePlanAbbreviation,
  type MgbPlanFile,
} from "@/lib/mgb-plan";
import { createClient } from "@/lib/supabase/client";
import { parsePdfPlan, parseXlsxPlan } from "@/lib/plan-source-parsers";

type Person = { id: string; display_name: string; role: string; active: boolean };
type Mapping = { abbreviation: string; normalized_abbreviation: string; profile_id: string };
type Selection = { profileId: string; confirmed: boolean; existing: boolean };

export default function PlanImportPage() {
  const { user } = useAuth();
  const { refreshServices } = useServices();
  const { hasPermission } = useRole();
  const { enabled: demoMode, loading: demoLoading } = useDemoMode();
  const supabase = useMemo(() => createClient(), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plan, setPlan] = useState<MgbPlanFile | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const canManage = hasPermission("manage_schedule");
  const abbreviations = useMemo(
    () => [...new Set(plan?.appointments.flatMap((appointment) => appointment.assignedNames) ?? [])],
    [plan]
  );
  const unresolved = abbreviations.filter((name) => !selections[normalizePlanAbbreviation(name)]?.confirmed);
  const openAbbreviations = [...unresolved].sort((a, b) => {
    const score = (name: string) => Math.max(0, ...people.map((person) => getPlanNameMatchScore(name, person.display_name)));
    return score(b) - score(a) || a.localeCompare(b, "de");
  });
  const duplicates = useMemo(() => plan ? findDuplicateMgbAppointments(plan.appointments) : [], [plan]);

  async function loadProfilesAndMappings(names: string[]) {
    const [{ data: profileRows, error: profileError }, { data: mappingRows, error: mappingError }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, active").eq("active", true).order("display_name"),
      supabase.from("plan_name_mappings").select("abbreviation, normalized_abbreviation, profile_id"),
    ]);
    if (profileError) throw profileError;
    if (mappingError) throw mappingError;
    const activePeople = (profileRows ?? []) as Person[];
    const savedMappings = (mappingRows ?? []) as Mapping[];
    setPeople(activePeople);
    const next: Record<string, Selection> = {};
    for (const name of names) {
      const key = normalizePlanAbbreviation(name);
      const saved = savedMappings.find((mapping) => mapping.normalized_abbreviation === key);
      if (saved && activePeople.some((person) => person.id === saved.profile_id)) {
        next[key] = { profileId: saved.profile_id, confirmed: true, existing: true };
        continue;
      }
      const matches = activePeople.filter((person) => getPlanNameMatchScore(name, person.display_name) > 0);
      next[key] = { profileId: matches.length === 1 ? matches[0].id : "", confirmed: false, existing: false };
    }
    setSelections(next);
    setLoaded(true);
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setMessage("");
    setWarnings([]);
    setPlan(null);
    setLoaded(false);
    setSelections({});
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError("Die Datei ist größer als 20 MB. Bitte verkleinere sie oder teile den Plan auf.");
      return;
    }
    try {
      const extension = file.name.toLowerCase().split(".").pop();
      let parsedPlan: MgbPlanFile;
      if (extension === "mgb") {
        const result = decodeMgbPlan(await file.text());
        if (!result.ok) {
          setError(result.issues.map((issue) => issue.path + ": " + issue.message).join(" · "));
          return;
        }
        parsedPlan = { ...result.plan, sourceFileName: result.plan.sourceFileName || file.name };
      } else if (extension === "xlsx" || extension === "xls") {
        const result = await parseXlsxPlan(file);
        parsedPlan = result.plan;
        setWarnings(result.warnings);
      } else if (extension === "pdf") {
        const result = await parsePdfPlan(file);
        parsedPlan = result.plan;
        setWarnings(result.warnings);
      } else {
        setError("Bitte wähle eine .mgb-, .xlsx-, .xls- oder .pdf-Datei aus.");
        return;
      }
      setPlan(parsedPlan);
      await loadProfilesAndMappings([...new Set(parsedPlan.appointments.flatMap((appointment) => appointment.assignedNames))]);
      setMessage(file.name + " wurde eingelesen. Bitte kontrolliere alle Termine und Namenszuordnungen.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Die Datei konnte nicht gelesen werden.");
    }
  }

  function updateAppointment(index: number, field: "title" | "dateISO" | "time" | "notes" | "points", value: string | number) {
    setPlan((current) => current ? {
      ...current,
      appointments: current.appointments.map((appointment, i) => {
        if (i !== index) return appointment;
        if (field === "notes" && typeof value === "string") {
          return { ...appointment, notes: value.split(/[·\n]/).map((note) => note.trim()).filter(Boolean) };
        }
        if (field === "points" && typeof value === "number") {
          return { ...appointment, points: value };
        }
        if ((field === "title" || field === "dateISO" || field === "time") && typeof value === "string") {
          return { ...appointment, [field]: value };
        }
        return appointment;
      }),
    } : current);
  }

  function removeAppointment(index: number) {
    setPlan((current) => current ? { ...current, appointments: current.appointments.filter((_, i) => i !== index) } : current);
  }

  function confirmMapping(name: string) {
    const key = normalizePlanAbbreviation(name);
    const current = selections[key];
    if (!current?.profileId) return;
    setSelections((previous) => ({ ...previous, [key]: { ...current, confirmed: true, existing: false } }));
  }

  function downloadPlan() {
    if (!plan) return;
    const blob = new Blob([encodeMgbPlan(plan)], { type: "application/vnd.mgb-connect.plan+json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "messdienerplan-" + new Date().toISOString().slice(0, 10) + ".mgb";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importPlan() {
    if (!plan || !user) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const mappings = abbreviations
        .filter((abbreviation) => selections[normalizePlanAbbreviation(abbreviation)]?.confirmed)
        .map((abbreviation) => ({
          abbreviation,
          normalized_abbreviation: normalizePlanAbbreviation(abbreviation),
          profile_id: selections[normalizePlanAbbreviation(abbreviation)].profileId,
          created_by: user.id,
        }));
      if (mappings.length) {
        const { error: mappingError } = await supabase
          .from("plan_name_mappings")
          .upsert(mappings, { onConflict: "normalized_abbreviation" });
        if (mappingError) throw mappingError;
      }

      const services: Array<{ title: string; dateISO: string; time: string; location: string; leaderId: null; meeting: string; points: number; assignedTo: string | null }> = [];
      for (const appointment of plan.appointments) {
        const base = {
          title: appointment.title,
          dateISO: appointment.dateISO,
          time: appointment.time,
          location: "",
          leaderId: null,
          meeting: appointment.notes.join(" · "),
          points: appointment.points ?? DEFAULT_PLAN_SERVICE_POINTS,
        };
        if (!appointment.assignedNames.length) {
          services.push({ ...base, assignedTo: null });
        } else {
          for (const name of appointment.assignedNames) {
            const selected = selections[normalizePlanAbbreviation(name)];
            if (selected?.confirmed && selected.profileId) {
              services.push({ ...base, assignedTo: selected.profileId });
            }
          }
        }
      }
      if (!services.length) {
        throw new Error("Es gibt noch keinen Dienst mit einer bestätigten Person oder einem offenen Termin. Bitte ordne mindestens ein Kürzel zu oder prüfe Termine ohne Namen.");
      }
      const { data, error: importError } = await supabase.rpc("import_plan_services", {
        p_services: services,
        p_demo: demoMode,
        p_source_plan: plan,
        p_source_file_name: plan.sourceFileName ?? "Messdienerplan",
      });
      if (importError) throw importError;
      await refreshServices();
      const importedCount = typeof data === "object" && data !== null && "service_count" in data ? Number(data.service_count) : services.length;
      const skippedCount = abbreviations.filter((name) => !selections[normalizePlanAbbreviation(name)]?.confirmed).length;
      setMessage(importedCount + " Dienste wurden " + (demoMode ? "im Demo-Modus" : "in der echten Datenwelt") + " importiert. " + (skippedCount ? skippedCount + " Kürzel ohne Zuordnung wurden ausgelassen. Du kannst sie später im Zuordnungsmanager ergänzen." : "Alle verwendeten Namenszuordnungen wurden gespeichert.") + " Den Import kannst du im Zuordnungsmanager rückgängig machen.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Der Import ist fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  if (!canManage) {
    return <main className="relative min-h-screen"><Background /><section className="relative z-10 mx-auto max-w-xl px-6 pt-40 text-center"><h1 className="text-2xl font-bold text-white">Kein Zugriff</h1><p className="mt-3 text-white/50">Nur berechtigte Personen können Messdienerpläne importieren.</p><Link href="/leader" className="mt-6 inline-flex text-amber-300">Zurück zum Leiterbereich</Link></section></main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
        <Link href="/leader/schedule" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-amber-300"><ArrowLeft size={16} />Zur Dienstverwaltung</Link>
        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Planung</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Messdienerplan importieren</h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/55">Eine vorbereitete .mgb-Datei einlesen, Termine prüfen und Abkürzungen einmalig echten Benutzerkonten zuordnen.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-300/15 bg-amber-300/[0.045] p-5">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={20} /><div><p className="font-semibold text-white">{demoMode ? "Demo-Modus aktiv" : "Echte Datenwelt"}</p><p className="mt-1 text-sm leading-6 text-white/50">{demoMode ? "Der Import landet ausschließlich in den Demo-Diensten." : "Der Import legt echte Dienste an und ist für berechtigte Planer sichtbar."} Jeder Termin wird pro zugewiesener Person als eigener Dienst gespeichert.</p></div></div>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.035] px-6 py-10 text-center transition hover:border-amber-300/30 hover:bg-white/[0.055]">
          <FileUp size={30} className="text-amber-300" />
          <span className="mt-4 font-semibold text-white">PDF-, Excel- oder .mgb-Datei auswählen</span>
          <span className="mt-1 text-sm text-white/40">PDF · XLSX · XLS · MGB · maximal 20 MB</span>
          <input type="file" accept=".pdf,.xlsx,.xls,.mgb,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/json" onChange={onFileChange} className="sr-only" />
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 transition hover:border-amber-300/40 hover:bg-amber-300/[0.09]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-amber-300"><Upload size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-white">Gespeicherte .mgb-Datei importieren</span>
            <span className="mt-1 block text-sm text-white/45">Einen zuvor exportierten MGB-Plan auswählen und mit denselben Namenszuordnungen weiterarbeiten.</span>
          </span>
          <span className="shrink-0 rounded-xl border border-amber-300/20 px-3 py-2 text-xs font-semibold text-amber-200">Datei wählen</span>
          <input type="file" accept=".mgb,application/json" onChange={onFileChange} className="sr-only" />
        </label>

        {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200">{message}</p>}
        {warnings.map((warning, index) => <p key={index} className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-200">{warning}</p>)}

        {plan && (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-bold text-white">Vorschau</h2><p className="mt-1 text-sm text-white/40">{plan.appointments.length} Termine · {abbreviations.length} verschiedene Namensabkürzungen</p></div>
              <button onClick={downloadPlan} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:text-amber-300"><Download size={16} />.mgb speichern</button>
            </div>

            {duplicates.length > 0 && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-200">Mögliche doppelte Termine in der Datei: {duplicates.map((index) => index + 1).join(", ")}. Bitte vor dem Import prüfen.</p>}

            <div className="mt-4 space-y-3">
              {plan.appointments.map((appointment, index) => (
                <article key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between"><span className="text-xs text-white/30">Termin {index + 1}</span><button type="button" disabled={plan.appointments.length <= 1} onClick={() => removeAppointment(index)} className="text-xs text-red-300/70 hover:text-red-300 disabled:opacity-30">Termin entfernen</button></div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_170px_120px_110px]">
                    <label className="text-xs text-white/40">Titel<input value={appointment.title} onChange={(event) => updateAppointment(index, "title", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/30" /></label>
                    <label className="text-xs text-white/40">Datum<input type="date" value={appointment.dateISO} onChange={(event) => updateAppointment(index, "dateISO", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/30" /></label>
                    <label className="text-xs text-white/40">Uhrzeit<input type="time" value={appointment.time} onChange={(event) => updateAppointment(index, "time", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/30" /></label><label className="text-xs text-white/40">Punkte<input type="number" min={0} max={1000} value={appointment.points ?? DEFAULT_PLAN_SERVICE_POINTS} onChange={(event) => updateAppointment(index, "points", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/30" /></label>
                  </div>
                  <label className="mt-3 block text-xs text-white/40">Hinweise<textarea value={appointment.notes.join(" · ")} onChange={(event) => updateAppointment(index, "notes", event.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/30" /></label>
                  <p className="mt-2 text-xs text-white/35">{appointment.assignedNames.length ? appointment.assignedNames.join(" · ") : "Kein Name zugewiesen – wird als offener Dienst angelegt."}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Offene Namenszuordnungen</h2>
                  <p className="mt-1 text-sm leading-6 text-white/45">Nur noch nicht bestätigte Kürzel werden angezeigt. Treffer stehen zuerst; bestätigte Zuordnungen werden automatisch ausgeblendet.</p>
                </div>
                <Link href="/leader/name-mappings" className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-300/15">Alle Zuordnungen verwalten</Link>
              </div>
              <p className="mt-3 text-xs text-white/35">{abbreviations.length - unresolved.length} von {abbreviations.length} Kürzeln bereits zugeordnet · {unresolved.length} noch offen. Offene Kürzel werden beim Import übersprungen.</p>
              {!loaded ? <p className="mt-4 text-sm text-white/40">Benutzer werden geladen…</p> : (
                <div className="mt-5 space-y-3">
                  {openAbbreviations.length === 0 ? <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4 text-sm text-emerald-200">Alle Kürzel sind bereits zugeordnet. Du kannst die Zuordnungen jederzeit in der zentralen Übersicht bearbeiten.</p> : openAbbreviations.map((name) => {
                    const key = normalizePlanAbbreviation(name);
                    const selection = selections[key] ?? { profileId: "", confirmed: false, existing: false };
                    const suggestions = people.filter((person) => getPlanNameMatchScore(name, person.display_name) > 0);
                    return (
                      <div key={key} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-white">{name}</p><span className={`text-xs ${suggestions.length ? "text-emerald-300" : "text-amber-200"}`}>{suggestions.length ? `${suggestions.length} mögliche Treffer` : "Kein Treffer gefunden"}</span></div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <select value={selection.profileId} onChange={(event) => setSelections((previous) => ({ ...previous, [key]: { profileId: event.target.value, confirmed: false, existing: false } }))} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white outline-none focus:border-amber-300/30">
                            <option value="">Benutzer auswählen…</option>
                            {[...people].sort((a, b) => getPlanNameMatchScore(name, b.display_name) - getPlanNameMatchScore(name, a.display_name) || a.display_name.localeCompare(b.display_name, "de")).map((person) => <option key={person.id} value={person.id}>{person.display_name} · {person.role}</option>)}
                          </select>
                          <button disabled={!selection.profileId || selection.confirmed} onClick={() => confirmMapping(name)} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200 disabled:opacity-40">Zuordnung bestätigen</button>
                        </div>
                        {suggestions.length > 1 && <p className="mt-2 text-xs text-white/35">{suggestions.length} mögliche Treffer – bitte anhand des Vornamens/Kürzels manuell auswählen.</p>}
                        {suggestions.length === 0 && <p className="mt-2 text-xs text-white/35">Kein passender Vorschlag gefunden. Bitte den Benutzer manuell auswählen.</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={downloadPlan} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70"><Download size={16} />.mgb herunterladen</button>
              <button onClick={importPlan} disabled={busy || demoLoading || !loaded} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-6 py-3 text-sm font-semibold text-amber-200 disabled:cursor-not-allowed disabled:opacity-40">{busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}{busy ? "Import läuft…" : demoLoading ? "Datenmodus wird geprüft…" : unresolved.length ? "Plan teilweise importieren (" + unresolved.length + " offen)" : "Plan in MGB Connect importieren"}</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
