"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, RefreshCw, Search, Trash2, Users, Undo2 } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { createClient } from "@/lib/supabase/client";
import { normalizePlanAbbreviation } from "@/lib/mgb-plan";

type Person = { id: string; display_name: string; role: string; active: boolean };
type Mapping = { id: string; abbreviation: string; normalized_abbreviation: string; profile_id: string };
type ImportBatch = { id: string; source_file_name: string | null; service_count: number; status: "active" | "rolled_back"; is_demo: boolean; created_at: string; rolled_back_at: string | null };

const roleLabels: Record<string, string> = {
  messdiener: "Messdiener",
  leiter: "Leiter",
  planschreiber: "Planschreiber",
  admin: "Admin",
};

export default function NameMappingsPage() {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Alle");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newProfileId, setNewProfileId] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canManage = hasPermission("manage_schedule");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [{ data: profileRows, error: profileError }, { data: mappingRows, error: mappingError }, { data: batchRows, error: batchError }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, active").eq("active", true).order("display_name"),
      supabase.from("plan_name_mappings").select("id, abbreviation, normalized_abbreviation, profile_id").order("abbreviation"),
      supabase.from("plan_import_batches").select("id, source_file_name, service_count, status, is_demo, created_at, rolled_back_at").order("created_at", { ascending: false }).limit(50),
    ]);
    if (profileError || mappingError) {
      setError(profileError?.message ?? mappingError?.message ?? "Die Zuordnungen konnten nicht geladen werden.");
      setLoading(false);
      return;
    }
    setPeople((profileRows ?? []) as Person[]);
    setMappings((mappingRows ?? []) as Mapping[]);
    setBatches((batchRows ?? []) as ImportBatch[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { if (canManage) void load(); }, [canManage, load]);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("de-DE");
    return people.filter((person) => {
      const ownMappings = mappings.filter((mapping) => mapping.profile_id === person.id);
      const matchesSearch = !query || [person.display_name, roleLabels[person.role] ?? person.role, ...ownMappings.map((mapping) => mapping.abbreviation)].join(" ").toLocaleLowerCase("de-DE").includes(query);
      const matchesRole = roleFilter === "Alle" || (roleFilter === "leitung" ? ["leiter", "planschreiber", "admin"].includes(person.role) : person.role === roleFilter);
      const matchesStatus = statusFilter === "Alle" || (statusFilter === "Zugeordnet" ? ownMappings.length > 0 : ownMappings.length === 0);
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      const aMapped = mappings.some((mapping) => mapping.profile_id === a.id);
      const bMapped = mappings.some((mapping) => mapping.profile_id === b.id);
      return Number(bMapped) - Number(aMapped) || a.display_name.localeCompare(b.display_name, "de");
    });
  }, [people, mappings, search, roleFilter, statusFilter]);

  async function saveMapping(mapping: Mapping) {
    const profileId = editing[mapping.id] ?? mapping.profile_id;
    if (!profileId || profileId === mapping.profile_id) return;
    setSaving(true); setError(""); setMessage("");
    const { error: updateError } = await supabase.from("plan_name_mappings").update({ profile_id: profileId }).eq("id", mapping.id);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setEditing((current) => { const next = { ...current }; delete next[mapping.id]; return next; });
    setMessage("Zuordnung wurde aktualisiert.");
    await load();
  }

  async function createMapping() {
    if (!user || !newAbbreviation.trim() || !newProfileId) return;
    const normalized = normalizePlanAbbreviation(newAbbreviation);
    if (!normalized) { setError("Bitte gib ein gültiges Kürzel ein."); return; }
    setSaving(true); setError(""); setMessage("");
    const { error: insertError } = await supabase.from("plan_name_mappings").upsert({
      abbreviation: newAbbreviation.trim(),
      normalized_abbreviation: normalized,
      profile_id: newProfileId,
      created_by: user.id,
    }, { onConflict: "normalized_abbreviation" });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setNewAbbreviation(""); setNewProfileId("");
    setMessage("Kürzel wurde gespeichert und wird bei künftigen Importen automatisch verwendet.");
    await load();
  }

  async function rollbackBatch(batch: ImportBatch) {
    const label = batch.source_file_name || "Messdienerplan";
    if (!window.confirm("Den Import „" + label + "“ wirklich vollständig rückgängig machen? Die damit angelegten Dienste werden aus den Konten entfernt.")) return;
    setSaving(true); setError(""); setMessage("");
    const { data, error: rollbackError } = await supabase.rpc("rollback_plan_import", { p_batch_id: batch.id });
    setSaving(false);
    if (rollbackError) { setError(rollbackError.message); return; }
    setMessage(String(data ?? batch.service_count) + " Dienste wurden entfernt. Die dauerhaften Namenszuordnungen bleiben erhalten.");
    await load();
  }

  async function deleteMapping(mapping: Mapping) {
    if (!window.confirm(`Die Zuordnung „${mapping.abbreviation}“ wirklich entfernen?`)) return;
    setSaving(true); setError(""); setMessage("");
    const { error: deleteError } = await supabase.from("plan_name_mappings").delete().eq("id", mapping.id);
    setSaving(false);
    if (deleteError) { setError(deleteError.message); return; }
    setMessage("Zuordnung wurde entfernt.");
    await load();
  }

  if (!canManage) {
    return <main className="relative min-h-screen"><Background /><section className="relative z-10 mx-auto max-w-xl px-6 pt-40 text-center"><h1 className="text-2xl font-bold text-white">Kein Zugriff</h1><p className="mt-3 text-white/50">Nur Planschreiber und Admins können Namenszuordnungen verwalten.</p><Link href="/leader" className="mt-6 inline-flex text-amber-300">Zum Leiterbereich</Link></section></main>;
  }

  const mappedCount = people.filter((person) => mappings.some((mapping) => mapping.profile_id === person.id)).length;
  const unmappedCount = people.length - mappedCount;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
        <Link href="/leader/plan-import" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-amber-300"><ArrowLeft size={16} />Zurück zum Planimport</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Verwaltung</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Namenszuordnungen</h1><p className="mt-3 max-w-2xl leading-7 text-white/55">Hier verwaltest du dauerhaft, welches Kürzel aus dem Messdienerplan zu welchem Benutzerkonto gehört.</p></div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:text-amber-200 disabled:opacity-40"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Aktualisieren</button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Aktive Benutzer" value={people.length} />
          <Stat label="Mit Zuordnung" value={mappedCount} />
          <Stat label="Noch ohne Zuordnung" value={unmappedCount} />
        </div>

        <div className="mt-6 rounded-3xl border border-amber-300/15 bg-amber-300/[0.045] p-5">
          <h2 className="font-semibold text-white">Neues Kürzel zuordnen</h2>
          <p className="mt-1 text-sm text-white/45">Du kannst eine Zuordnung auch unabhängig von einem Import vorbereiten.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
            <input value={newAbbreviation} onChange={(event) => setNewAbbreviation(event.target.value)} placeholder="Kürzel, z. B. Mustermann M." className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-amber-300/30" />
            <select value={newProfileId} onChange={(event) => setNewProfileId(event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white outline-none focus:border-amber-300/30"><option value="">Benutzer auswählen…</option>{people.map((person) => <option key={person.id} value={person.id}>{person.display_name} · {roleLabels[person.role] ?? person.role}</option>)}</select>
            <button onClick={() => void createMapping()} disabled={saving || !newAbbreviation.trim() || !newProfileId} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200 disabled:opacity-40"><Plus size={16} />Speichern</button>
          </div>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200">{message}</p>}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-xl font-bold text-white">Importierte Pläne</h2><p className="mt-1 text-sm text-white/45">Hier kannst du nachvollziehen, welche Pläne hochgeladen wurden, und einen Import bei Bedarf zurücknehmen.</p></div>
            <Link href="/leader/plan-import" className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200">Neuen Plan importieren</Link>
          </div>
          <div className="mt-4 space-y-3">
            {batches.length === 0 ? <p className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm text-white/40">Noch keine protokollierten Planimporte vorhanden.</p> : batches.map((batch) => (
              <article key={batch.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{batch.source_file_name || "Messdienerplan"}</p>
                  <p className="mt-1 text-xs text-white/40">{new Date(batch.created_at).toLocaleString("de-DE")} · {batch.service_count} Dienste · {batch.is_demo ? "Demo" : "Echte Daten"}</p>
                  <p className={"mt-1 text-xs " + (batch.status === "active" ? "text-emerald-300" : "text-white/35")}>{batch.status === "active" ? "Import aktiv" : "Rückgängig gemacht"}</p>
                </div>
                {batch.status === "active" ? <button onClick={() => void rollbackBatch(batch)} disabled={saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-2.5 text-xs font-semibold text-red-200 disabled:opacity-40"><Undo2 size={15} />Import rückgängig machen</button> : <span className="text-xs text-white/30">Bereits zurückgenommen</span>}
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-white/30">Ein Import kann nur zurückgenommen werden, solange seine Dienste noch unverändert im Status „Eingeplant“ sind. Bereits bearbeitete Dienste werden zum Schutz vor Datenverlust nicht automatisch gelöscht. Namenszuordnungen bleiben beim Rückgängigmachen erhalten.</p>
        </section>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nach Name oder Kürzel suchen…" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-300/30" /></div>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white"><option value="Alle">Alle Rollen</option><option value="messdiener">Messdiener</option><option value="leitung">Leitung (inkl. Admin/Planschreiber)</option><option value="leiter">Nur Leiter</option><option value="planschreiber">Planschreiber</option><option value="admin">Admin</option></select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white"><option value="Alle">Alle Status</option><option value="Zugeordnet">Zugeordnet</option><option value="Nicht zugeordnet">Noch nicht zugeordnet</option></select>
          </div>
          <p className="mt-3 text-xs text-white/35">{filteredPeople.length} Benutzer werden angezeigt. Aktive Filter wirken nur auf diese Übersicht.</p>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? <p className="p-8 text-center text-sm text-white/40">Zuordnungen werden geladen…</p> : filteredPeople.map((person) => {
            const ownMappings = mappings.filter((mapping) => mapping.profile_id === person.id);
            return <article key={person.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-semibold text-white">{person.display_name || "Ohne Namen"}</h3><p className="mt-1 text-xs text-white/40">{roleLabels[person.role] ?? person.role}</p></div>
                {ownMappings.length ? <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><Check size={14} />Zugeordnet</span> : <span className="text-xs text-amber-200">Noch nicht zugeordnet</span>}
              </div>
              {ownMappings.length ? <div className="mt-4 space-y-3">{ownMappings.map((mapping) => <div key={mapping.id} className="grid gap-2 rounded-xl border border-white/10 bg-black/15 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto_auto] md:items-center">
                <div><p className="text-xs text-white/35">Kürzel</p><p className="mt-1 font-medium text-white">{mapping.abbreviation}</p></div>
                <select value={editing[mapping.id] ?? mapping.profile_id} onChange={(event) => setEditing((current) => ({ ...current, [mapping.id]: event.target.value }))} className="min-w-0 rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white">{people.map((option) => <option key={option.id} value={option.id}>{option.display_name} · {roleLabels[option.role] ?? option.role}</option>)}</select>
                <button onClick={() => void saveMapping(mapping)} disabled={saving || !(editing[mapping.id] && editing[mapping.id] !== mapping.profile_id)} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2.5 text-xs font-semibold text-amber-200 disabled:opacity-30">Ändern</button>
                <button onClick={() => void deleteMapping(mapping)} disabled={saving} aria-label={`Zuordnung ${mapping.abbreviation} entfernen`} className="inline-flex items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 py-2.5 text-red-300/80 hover:text-red-200 disabled:opacity-30"><Trash2 size={15} /></button>
              </div>)}</div> : <div className="mt-3 flex items-center gap-2 text-xs text-white/35"><Users size={14} />Für diesen Benutzer ist noch kein Kürzel hinterlegt.</div>}
            </article>;
          })}
          {!loading && filteredPeople.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-10 text-center text-sm text-white/40">Keine Benutzer für diese Suche oder Filter gefunden.</div>}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><p className="text-xs text-white/40">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div>;
}
