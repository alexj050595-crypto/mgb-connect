export type AnnouncementCategory =
  | "general"
  | "service"
  | "event"
  | "important";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  createdAt: string;
  active: boolean;
};

// Real announcements come from Supabase. Demo announcements are generated
// only by the administrator-controlled demo mode.
export const initialAnnouncements: Announcement[] = [];
