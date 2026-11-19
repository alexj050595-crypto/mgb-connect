"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Check, Clock3, RefreshCw, Search, UserRound, X } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { createClient } from "@/lib/supabase/client";

type AttendanceStatus = "present" | "excused" | "unexcused" | null;
type AttendanceRow = {
  id: string;
  title: string;
  date_iso: string;
  time: string;
  status: string;
  assigned_to: string | null;
  taken_by: string | null;
  excuse_reason: string | null;
  attendance_status: AttendanceStatus;
  attendance_reason: string | null;
};
type Person = { id: string; display_name: string | null };

const statusText: Record<Exclude<AttendanceStatus, null>, string> = {
  present: "Anwesend",
  excused: "Entschuldigt",
  unexcused: "Unentschuldigt",
};

export default function LeaderAttendancePage() {
  const { hasPermission } = useRole();
  const { user } = useAuth();
  const { enabled: demoMode, loading: demoLoading } = useDemoMode();
  const canManage = hasPermission("manage_attendance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    if (!user || !canManage || demoLoading) return;
    setLoading(true);
    setError("");
    const table = demoMode ? "demo_services" : "services";
    const [{ data: serviceData, error: serviceError }, { data: profileData, error: profileError }] = await Promise.all([
      supabase.from(table)
        .select("id,title,date_iso,time,status,assigned_to,taken_by,excuse_reason,attendance_status,attendance_reason")
        .order("date_iso", { ascending: false })
        .limit(500),
      supabase.from("profiles").select("id,display_name").eq("active", true),
    ]);
    if (serviceError || profileError) {
      setError(serviceError?.message ?? profileError?.message ?? "Die Daten konnten nicht geladen werden.");
      setRows([]);
      setPeople([]);
    } else {
      setRows((serviceData ?? []) as AttendanceRow[]);
      setPeople((profileData ?? []) as Person[]);
    }
    setLoading(false);
  }, [user, canManage, demoLoading, demoMode, supabase]);

  useEffect(() => { void load(); }, [load]);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person.display_name || "Ohne Namen"])), [people]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const memberId = row.taken_by ?? row.assigned_to;
      const memberName = memberId ? peopleById.get(memberId) ?? "" : "Nicht zugewiesen";
      const haystack = [row.title, row.date_iso, row.time, memberName].join(" ").toLowerCase();
      const now = new Date();
      const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      return Boolean(memberId) && (!q || haystack.includes(q)) && row.date_iso <= todayISO;
    });
  }, [rows, search, peopleById]);

  const counts = useMemo(() => ({
    present: filtered.filter((row) => row.attendance_status === "present").length,
    excused: filtered.filter((row) => row.attendance_status === "excused").length,
    unexcused: filtered.filter((row) => row.attendance_status === "unexcused").length,
    open: filtered.filter((row) => !row.attendance_status).length,
  }), [filtered]);

  const mark = async (row: AttendanceRow, status: AttendanceStatus) => {
    if (!user) return;
    setSavingId(row.id);
    setError("");
    setNotice("");
    const { data, error: rpcError } = await supabase.rpc("mark_service_attendance", {
      p_service_id: row.id,
      p_attendance_status: status,
      p_reason: row.attendance_reason ?? null,
      p_demo: demoMode,
    });
    setSavingId(null);
    if (rpcError || data !== true) {
      setError(rpcError?.message ?? "Die Anwesenheit konnte nicht gespeichert werden.");
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, attendance_status: status } : item));
    setNotice("Anwesenheit gespeichert.");
  };

  if (!canManage) {
    return <main className="relative min-h-screen overflow-hidden"><Background /><section className="relative z-10 flex min-h-screen items-center justify-center px-6"><div className="text-center"><h1 className="text-2xl font-bold text-white">Kein Zugriff</h1><Link href="/leader" className="mt-5 inline-flex items-center gap-2 text-white/50 hover:text-white"><ArrowLeft size={16} />Leiterbereich</Link></div></section></main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <Link href="/leader" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-amber-300"><ArrowLeft size={16} />Leiterbereich</Link>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Nach der Messe</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Anwesenheit</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/55">Markiere mit wenigen Klicks, wer beim jeweiligen Dienst tatsächlich da war.</p>
          </div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 disabled:opacity-40"><RefreshCw size={16} />Aktualisieren</button>
        </div>
        {demoMode && <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-200">Demo-Modus aktiv – Änderungen betreffen ausschließlich Demodaten.</div>}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Summary label="Noch offen" value={counts.open} tone="text-white" />
          <Summary label="Anwesend" value={counts.present} tone="text-emerald-300" />
          <Summary label="Entschuldigt" value={counts.excused} tone="text-sky-300" />
          <Summary label="Unentschuldigt" value={counts.unexcused} tone="text-red-300" />
        </div>
        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Messe, Datum oder Messdiener suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" />
          </div>
        </div>
        {error && <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">{error}</div>}
        {notice && <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200">{notice}</div>}
        <div className="mt-7 space-y-3">
          {loading ? <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center text-white/40">Dienste werden geladen...</div> : filtered.map((row) => {
            const memberId = row.taken_by ?? row.assigned_to;
            const memberName = memberId ? peopleById.get(memberId) ?? "Unbekannter Messdiener" : "Nicht zugewiesen";
            const current = row.attendance_status;
            const isSaving = savingId === row.id;
            return (
              <article key={row.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/40"><CalendarCheck size={14} />{new Date(row.date_iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}<span>·</span><Clock3 size={13} />{row.time}</div>
                    <h2 className="mt-2 text-lg font-bold text-white">{row.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-white/55"><UserRound size={14} />{memberName}</p>
                    {row.attendance_reason && <p className="mt-1 text-xs text-white/35">Hinweis: {row.attendance_reason}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MarkButton active={current === "present"} disabled={isSaving} tone="green" onClick={() => void mark(row, "present")}><Check size={15} />Da</MarkButton>
                    <MarkButton active={current === "excused"} disabled={isSaving} tone="blue" onClick={() => void mark(row, "excused")}><Check size={15} />Entschuldigt</MarkButton>
                    <MarkButton active={current === "unexcused"} disabled={isSaving} tone="red" onClick={() => void mark(row, "unexcused")}><X size={15} />Fehlt</MarkButton>
                    {current && <MarkButton active={false} disabled={isSaving} tone="neutral" onClick={() => void mark(row, null)}>Zurücksetzen</MarkButton>}
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && filtered.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-12 text-center"><CalendarCheck size={30} className="mx-auto text-white/20" /><h2 className="mt-4 text-lg font-bold text-white">Keine vergangenen Dienste gefunden</h2><p className="mt-2 text-sm text-white/40">Sobald Dienste stattgefunden haben, erscheinen sie hier.</p></div>}
        </div>
        <p className="mt-7 text-xs leading-5 text-white/35">Die Anwesenheit wird getrennt vom Dienststatus gespeichert. Eine Übernahme oder Abmeldung wird dadurch nicht überschrieben.</p>
      </section>
    </main>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="text-xs text-white/40">{label}</p><p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p></div>;
}
function MarkButton({ children, active, disabled, tone, onClick }: { children: React.ReactNode; active: boolean; disabled: boolean; tone: "green" | "blue" | "red" | "neutral"; onClick: () => void }) {
  const styles = {
    green: active ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200" : "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-200/65 hover:bg-emerald-400/10",
    blue: active ? "border-sky-400/40 bg-sky-400/15 text-sky-200" : "border-sky-400/15 bg-sky-400/[0.04] text-sky-200/65 hover:bg-sky-400/10",
    red: active ? "border-red-400/40 bg-red-400/15 text-red-200" : "border-red-400/15 bg-red-400/[0.04] text-red-200/65 hover:bg-red-400/10",
    neutral: "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07]",
  };
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:opacity-40 ${styles[tone]}`}>{children}</button>;
}
