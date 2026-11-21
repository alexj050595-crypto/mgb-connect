export type AnnouncementCategory="general"|"service"|"event"|"important";
export type AnnouncementAudience="all"|"messdiener"|"leitung";
export type Announcement={id:string;title:string;content:string;category:AnnouncementCategory;audience:AnnouncementAudience;createdAt:string;active:boolean;pinned:boolean;startsAt:string|null;expiresAt:string|null;eventAt:string|null;location:string|null;linkUrl:string|null};
export const initialAnnouncements:Announcement[]=[];
