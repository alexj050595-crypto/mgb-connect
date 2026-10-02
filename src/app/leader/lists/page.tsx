"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ListChecks, Plus, RefreshCw, ShieldAlert } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { createClient } from "@/lib/supabase/client";

type ListRow = { id: string; title: string; description: string; active: boolean };
type Member = { id: string; profile_id: string; display_name: string | null; sort_order: number };
type Action = { id: string; label: string; sort_order: number };
type Entry = { id: string; member_id: string; action_id: string; count: number };

export default function LeaderListsPage() {
  const { hasPermission } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lists, setLists] = useState<ListRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = async () => {
    setLoading(true); setError(null);
    const supabase = createClient();
    const { data, error: loadError } = await supabase.from("leader_lists").select("id,title,description,active").eq("active", true).order("created_at");
    if (loadError) { setError(loadError.message); setLoading(false); return; }
    const next = (data ?? []) as ListRow[];
    setLists(next);
    setSelectedId((current) => current && next.some((x) => x.id === current) ? current : next[0]?.id ?? "");
    setLoading(false);
  };

  const loadSelected = async (id: string) => {
    if (!id) { setMembers([]); setActions([]); setEntries([]); return; }
    const supabase = createClient();
    const [m, a, e] = await Promise.all([
      supabase.from("leader_list_members").select("id,profile_id,display_name,sort_order").eq("list_id", id).order("sort_order"),
      supabase.from("leader_list_actions").select("id,label,sort_order").eq("list_id", id).order("sort_order"),
      supabase.from("leader_list_entries").select("id,member_id,action_id,count").eq("list_id", id),
    ]);
    const firstError = m.error ?? a.error ?? e.error;
    if (firstError) { setError(firstError.message); return; }
    setMembers((m.data ?? []) as Member[]);
    setActions((a.data ?? []) as Action[]);
    setEntries((e.data ?? []) as Entry[]);
  };

  useEffect(() => { void loadLists(); }, []);
  useEffect(() => { void loadSelected(selectedId); }, [selectedId]);

  const selected = lists.find((x) => x.id === selectedId);
  const totalFor = (memberId: string) => entries.reduce((sum, e) => sum + (e.member_id === memberId ? e.count : 0), 0);
  const getCount = (memberId: string, actionId: string) => entries.find((e) => e.member_id === memberId && e.action_id === actionId)?.count ?? 0;
  const ranking = useMemo(() => [...members].sort((a, b) => totalFor(b.id) - totalFor(a.id)), [members, entries]);

  async function addTally(memberId: string, actionId: string) {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("increment_leader_list_entry", { p_list_id: selectedId, p_member_id: memberId, p_action_id: actionId });
    if (rpcError) { setError(rpcError.message); return; }
    setEntries((current) => {
      const existing = current.find((e) => e.member_id === memberId && e.action_id === actionId);
      if (existing) return current.map((e) => e.id === existing.id ? { ...e, count: Number(data) } : e);
      return [...current, { id: crypto.randomUUID(), member_id: memberId, action_id: actionId, count: Number(data) }];
    });
  }

  if (!hasPermission("view_lists")) {
    return <main className="relative min-h-screen overflow-hidden"><Background /><section className="relative z-10 flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-center"><ShieldAlert className="mx-auto text-red-300" /><h1 className="mt-4 text-2xl font-bold text-white">Kein Zugriff</h1><p className="mt-2 text-white/50">Dieser Bereich steht nur der Leitung zur Verfügung.</p></div></section></main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <Link href="/leader" className="inline-flex items-center gap-2 text-white/55 transition hover:text-white"><ArrowLeft size={18} />Leiterbereich</Link>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Leitung</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Liste</h1><p className="mt-3 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">Konfigurierbare Strichlisten mit automatischer Rangliste.</p></div>
          <button onClick={() => void loadLists()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/75 transition hover:bg-white/10"><RefreshCw size={16}/>Aktualisieren</button>
        </div>
        {error && <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">{error}</div>}
        {loading ? <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-white/45">Listen werden geladen...</div> : lists.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-center"><ListChecks className="mx-auto text-amber-300" size={30}/><h2 className="mt-4 text-xl font-bold text-white">Noch keine Liste vorhanden</h2><p className="mt-2 text-white/45">Der Administrator kann unter Systemverwaltung eine Liste anlegen.</p></div>
        ) : (
          <>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{lists.map((list) => <button key={list.id} onClick={() => setSelectedId(list.id)} className={list.id === selectedId ? "shrink-0 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200" : "shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/55"}>{list.title}</button>)}</div>
            {selected && <p className="mt-4 text-white/50">{selected.description}</p>}
            <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-2xl">
              <table className="w-full min-w-[680px] border-collapse">
                <thead><tr className="border-b border-white/10"><th className="sticky left-0 z-10 bg-[#111]/95 px-4 py-4 text-left text-xs uppercase tracking-[0.16em] text-white/40">Person</th>{actions.map((action) => <th key={action.id} className="px-3 py-4 text-center text-xs uppercase tracking-[0.12em] text-white/40">{action.label}</th>)}<th className="px-4 py-4 text-right text-xs uppercase tracking-[0.12em] text-white/40">Gesamt</th></tr></thead>
                <tbody>{members.map((member) => <tr key={member.id} className="border-b border-white/5 last:border-0"><td className="sticky left-0 z-10 bg-[#111]/95 px-4 py-4 font-semibold text-white">{member.display_name || "Unbenannt"}</td>{actions.map((action) => <td key={action.id} className="px-3 py-3 text-center"><div className="flex items-center justify-center gap-2"><span className="min-w-6 text-sm font-bold text-white">{getCount(member.id, action.id)}</span><button onClick={() => void addTally(member.id, action.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300 transition hover:bg-amber-400/20" aria-label={"Strich für " + member.display_name + " bei " + action.label + " hinzufügen"}><Plus size={16}/></button></div></td>)}<td className="px-4 py-4 text-right text-lg font-black text-amber-200">{totalFor(member.id)}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-7"><p className="text-sm uppercase tracking-[0.18em] text-white/40">Rangliste</p><div className="mt-4 space-y-2">{ranking.map((member, index) => <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><span className="w-8 text-sm font-bold text-amber-300">{index + 1}.</span><span className="min-w-0 flex-1 truncate font-semibold text-white">{member.display_name || "Unbenannt"}</span><span className="font-black text-white">{totalFor(member.id)}</span></div>)}</div></div>
          </>
        )}
      </section>
    </main>
  );
}
