"use client";

import { useEffect, useState } from "react";
import { ListChecks, Plus, Save, Trash2, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; display_name: string; role: string; active: boolean };
type ListRow = { id: string; title: string; description: string; active: boolean };
type Member = { id: string; profile_id: string; display_name: string | null; sort_order: number };
type Action = { id: string; label: string; sort_order: number };

export default function LeaderListSettings() {
  const [lists, setLists] = useState<ListRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newAction, setNewAction] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const [l, p] = await Promise.all([
      supabase.from("leader_lists").select("id,title,description,active").order("created_at"),
      supabase.from("profiles").select("id,display_name,role,active").eq("active", true).order("display_name"),
    ]);
    if (l.error || p.error) { setMessage((l.error ?? p.error)?.message ?? "Laden fehlgeschlagen."); setLoading(false); return; }
    setLists((l.data ?? []) as ListRow[]);
    setProfiles((p.data ?? []) as Profile[]);
    setSelectedId((current) => current || l.data?.[0]?.id || "");
    setLoading(false);
  };

  const loadSelected = async (id: string) => {
    if (!id) { setMembers([]); setActions([]); return; }
    const supabase = createClient();
    const [m, a, l] = await Promise.all([
      supabase.from("leader_list_members").select("id,profile_id,display_name,sort_order").eq("list_id", id).order("sort_order"),
      supabase.from("leader_list_actions").select("id,label,sort_order").eq("list_id", id).order("sort_order"),
      supabase.from("leader_lists").select("title,description").eq("id", id).single(),
    ]);
    if (m.error || a.error || l.error) { setMessage((m.error ?? a.error ?? l.error)?.message ?? "Laden fehlgeschlagen."); return; }
    setMembers((m.data ?? []) as Member[]);
    setActions((a.data ?? []) as Action[]);
    setTitle(l.data?.title ?? "");
    setDescription(l.data?.description ?? "");
    setSelectedProfiles((m.data ?? []).map((x) => x.profile_id));
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => { void loadSelected(selectedId); }, [selectedId]);

  async function createList() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.from("leader_lists").insert({ title: cleanTitle, description: description.trim() }).select("id").single();
    if (error) setMessage(error.message);
    else { await load(); setSelectedId(data.id); }
    setSaving(false);
  }

  async function saveList() {
    if (!selectedId || !title.trim()) return;
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("leader_lists").update({ title: title.trim(), description: description.trim(), updated_at: new Date().toISOString() }).eq("id", selectedId);
    if (error) { setMessage(error.message); setSaving(false); return; }

    await supabase.from("leader_list_members").delete().eq("list_id", selectedId);
    if (selectedProfiles.length) {
      const rows = selectedProfiles.map((profileId, index) => ({
        list_id: selectedId,
        profile_id: profileId,
        display_name: profiles.find((p) => p.id === profileId)?.display_name ?? "",
        sort_order: index,
      }));
      const memberResult = await supabase.from("leader_list_members").insert(rows);
      if (memberResult.error) { setMessage(memberResult.error.message); setSaving(false); return; }
    }
    await load();
    await loadSelected(selectedId);
    setMessage("Liste gespeichert.");
    setSaving(false);
  }

  async function addAction() {
    const label = newAction.trim();
    if (!selectedId || !label) return;
    const supabase = createClient();
    const { error } = await supabase.from("leader_list_actions").insert({ list_id: selectedId, label, sort_order: actions.length });
    if (error) { setMessage(error.message); return; }
    setNewAction("");
    await loadSelected(selectedId);
  }

  async function removeAction(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("leader_list_actions").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    await loadSelected(selectedId);
  }

  async function deleteList() {
    if (!selectedId || !window.confirm("Diese Liste und ihre Strichdaten wirklich löschen?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("leader_lists").delete().eq("id", selectedId);
    if (error) { setMessage(error.message); return; }
    setSelectedId("");
    setTitle(""); setDescription("");
    await load();
  }

  const addAllLeaders = () => {
    const leaderIds = profiles.filter((p) => ["leiter", "planschreiber", "admin"].includes(p.role)).map((p) => p.id);
    setSelectedProfiles((current) => Array.from(new Set([...current, ...leaderIds])));
  };

  const toggleProfile = (id: string) => setSelectedProfiles((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  if (loading) return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/45">Listenverwaltung wird geladen...</div>;

  return (
    <div className="space-y-5">
      {message && <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">{message}</div>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {lists.map((list) => <button key={list.id} onClick={() => setSelectedId(list.id)} className={list.id === selectedId ? "shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-200" : "shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/55"}>{list.title}</button>)}
        <button onClick={() => { setSelectedId(""); setTitle(""); setDescription(""); setMembers([]); setActions([]); setSelectedProfiles([]); }} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65"><Plus size={15}/>Neue Liste</button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/50">Name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Gruppenpunkte" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-amber-400/40"/></label>
          <label className="text-sm text-white/50">Beschreibung<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Wofür wird die Liste genutzt?" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-amber-400/40"/></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {selectedId ? <button onClick={() => void saveList()} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 disabled:opacity-40"><Save size={16}/>{saving ? "Speichern..." : "Liste speichern"}</button> : <button onClick={() => void createList()} disabled={saving || !title.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 disabled:opacity-40"><Plus size={16}/>Liste erstellen</button>}
          {selectedId && <button onClick={() => void deleteList()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 text-sm font-semibold text-red-200"><Trash2 size={16}/>Liste löschen</button>}
        </div>
      </div>

      {selectedId && <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.16em] text-white/35">Ereignisse</p><h3 className="mt-1 font-bold text-white">Striche auslösen</h3></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{actions.map((action) => <span key={action.id} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">{action.label}<button onClick={() => void removeAction(action.id)} aria-label={action.label + " löschen"} className="text-white/35 hover:text-red-300"><X size={14}/></button></span>)}</div>
          <div className="mt-4 flex gap-2"><input value={newAction} onChange={(e) => setNewAction(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void addAction(); }} placeholder="Neues Ereignis, z. B. Hilfe" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-amber-400/40"/><button onClick={() => void addAction()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><Plus size={17}/></button></div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.16em] text-white/35">Teilnehmer</p><h3 className="mt-1 font-bold text-white">Wer erscheint in der Liste?</h3></div><button onClick={addAllLeaders} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/70"><Users size={15}/>Alle Leiter</button></div>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{profiles.map((profile) => <label key={profile.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"><input type="checkbox" checked={selectedProfiles.includes(profile.id)} onChange={() => toggleProfile(profile.id)} className="accent-amber-400"/><span className="min-w-0 flex-1 truncate text-sm text-white">{profile.display_name || "Ohne Namen"}</span><span className="text-[11px] uppercase text-white/30">{profile.role}</span></label>)}</div>
        </div>
      </div>}
    </div>
  );
}
