"use client";

import { useCallback, useContext, useEffect, useMemo, useState, createContext, type ReactNode } from "react";
import { initialAnnouncements, type Announcement, type AnnouncementCategory } from "@/data/announcements";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";

type CreateAnnouncementInput = { title: string; content: string; category: AnnouncementCategory };
type AnnouncementContextType = {
  announcements: Announcement[];
  activeAnnouncements: Announcement[];
  loading: boolean;
  createAnnouncement: (input: CreateAnnouncementInput) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
};

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);
const STORAGE_KEY = "mgb-connect-announcements";

function isCategory(value: string): value is AnnouncementCategory {
  return value === "general" || value === "service" || value === "event" || value === "important";
}

function mapDatabaseAnnouncement(row: { id: string; title: string; content: string; priority: string; published: boolean; created_at: string }): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: isCategory(row.priority) ? row.priority : "general",
    createdAt: row.created_at.slice(0, 10),
    active: row.published,
  };
}

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const { enabled: demoMode, loading: demoLoading } = useDemoMode();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = useCallback(async () => {
    if (authLoading || demoLoading) return;

    if (!user) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Announcement[];
          if (Array.isArray(parsed)) setAnnouncements(parsed);
          else setAnnouncements(initialAnnouncements);
        } else {
          setAnnouncements(initialAnnouncements);
        }
      } catch {
        setAnnouncements(initialAnnouncements);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const table = demoMode ? "demo_announcements" : "announcements";
    const { data, error } = await supabase
      .from(table)
      .select("id, title, content, priority, published, created_at")
      .order("created_at", { ascending: false });

    setAnnouncements(!error && data ? data.map(mapDatabaseAnnouncement) : []);
    setLoading(false);
  }, [authLoading, demoLoading, user, demoMode]);

  useEffect(() => { void loadAnnouncements(); }, [loadAnnouncements]);

  useEffect(() => {
    if (!user && announcements.length) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements)); } catch { /* optional fallback */ }
    }
  }, [announcements, user]);

  const createAnnouncement = async (input: CreateAnnouncementInput) => {
    const title = input.title.trim();
    const content = input.content.trim();
    if (!title || !content || !user || profile?.role !== "admin") return;

    const supabase = createClient();
    const table = demoMode ? "demo_announcements" : "announcements";
    const { data, error } = await supabase
      .from(table)
      .insert({ title, content, priority: input.category, published: true, created_by: user.id })
      .select("id, title, content, priority, published, created_at")
      .single();

    if (!error && data) setAnnouncements((current) => [mapDatabaseAnnouncement(data), ...current]);
  };

  const toggleAnnouncement = async (id: string) => {
    if (!user || profile?.role !== "admin") return;
    const current = announcements.find((announcement) => announcement.id === id);
    if (!current) return;

    const supabase = createClient();
    const table = demoMode ? "demo_announcements" : "announcements";
    const { error } = await supabase.from(table).update({ published: !current.active }).eq("id", id);
    if (!error) setAnnouncements((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item));
  };

  const deleteAnnouncement = async (id: string) => {
    if (!user || profile?.role !== "admin") return;
    const supabase = createClient();
    const table = demoMode ? "demo_announcements" : "announcements";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) setAnnouncements((items) => items.filter((item) => item.id !== id));
  };

  const activeAnnouncements = useMemo(() => announcements.filter((announcement) => announcement.active), [announcements]);
  const value = useMemo(() => ({ announcements, activeAnnouncements, loading, createAnnouncement, toggleAnnouncement, deleteAnnouncement }), [announcements, activeAnnouncements, loading, demoMode]);

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error("useAnnouncements must be used inside an AnnouncementProvider");
  return context;
}
