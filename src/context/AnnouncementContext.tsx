"use client";
import {useCallback,useContext,useEffect,useMemo,useState,createContext,type ReactNode} from "react";
import {initialAnnouncements,type Announcement,type AnnouncementCategory,type AnnouncementAudience} from "@/data/announcements";
import {createClient} from "@/lib/supabase/client";import {useAuth} from "@/context/AuthContext";import {useDemoMode} from "@/context/DemoModeContext";
export type CreateAnnouncementInput={title:string;content:string;category:AnnouncementCategory;audience:AnnouncementAudience;pinned:boolean;startsAt:string|null;expiresAt:string|null;eventAt:string|null;location:string|null;linkUrl:string|null};
type Value={announcements:Announcement[];activeAnnouncements:Announcement[];loading:boolean;createAnnouncement:(input:CreateAnnouncementInput)=>Promise<void>;toggleAnnouncement:(id:string)=>Promise<void>;deleteAnnouncement:(id:string)=>Promise<void>};
const C=createContext<Value|null>(null);const KEY="mgb-connect-announcements";
const categoryOk=(v:string):v is AnnouncementCategory=>["general","service","event","important"].includes(v);
const audienceOk=(v:string):v is AnnouncementAudience=>["all","messdiener","leitung"].includes(v);
function mapRow(row:any):Announcement{return{id:row.id,title:row.title,content:row.content,category:categoryOk(row.priority)?row.priority:"general",audience:audienceOk(row.audience)?row.audience:"all",createdAt:row.created_at,active:row.published,pinned:row.pinned??false,startsAt:row.starts_at??null,expiresAt:row.expires_at??null,eventAt:row.event_at??null,location:row.location??null,linkUrl:row.link_url??null}}
const fields="id,title,content,priority,published,created_at,audience,pinned,starts_at,expires_at,event_at,location,link_url";
export function AnnouncementProvider({children}:{children:ReactNode}){
 const {user,profile,loading:authLoading}=useAuth();const {enabled:demoMode,loading:demoLoading}=useDemoMode();const [announcements,setAnnouncements]=useState<Announcement[]>([]);const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{if(authLoading||demoLoading)return;if(!user){try{const s=localStorage.getItem(KEY);const parsed=s?JSON.parse(s):initialAnnouncements;setAnnouncements(Array.isArray(parsed)?parsed:initialAnnouncements)}catch{setAnnouncements(initialAnnouncements)}setLoading(false);return}
  setLoading(true);const supabase=createClient(),table=demoMode?"demo_announcements":"announcements";const {data,error}=await supabase.from(table).select(fields).order("pinned",{ascending:false}).order("created_at",{ascending:false});setAnnouncements(!error&&data?data.map(mapRow):[]);setLoading(false);
 },[authLoading,demoLoading,user,demoMode]);
 useEffect(()=>{void load()},[load]);useEffect(()=>{if(!user&&announcements.length){try{localStorage.setItem(KEY,JSON.stringify(announcements))}catch{}}},[announcements,user]);
 const createAnnouncement=async(input:CreateAnnouncementInput)=>{const title=input.title.trim(),content=input.content.trim();if(!title||!content||!user||!["om","admin"].includes(profile?.role??""))throw new Error("Keine Berechtigung oder unvollständige Angaben.");const supabase=createClient(),table=demoMode?"demo_announcements":"announcements";
  const {data,error}=await supabase.from(table).insert({title,content,priority:input.category,published:true,created_by:user.id,audience:input.audience,pinned:input.pinned,starts_at:input.startsAt,expires_at:input.expiresAt,event_at:input.eventAt,location:input.location,link_url:input.linkUrl}).select(fields).single();
  if(error||!data)throw new Error(error?.message??"Ankündigung konnte nicht gespeichert werden.");setAnnouncements(items=>[mapRow(data),...items]);
 };
 const toggleAnnouncement=async(id:string)=>{if(!user||profile?.role!=="admin")return;const item=announcements.find(x=>x.id===id);if(!item)return;const supabase=createClient(),table=demoMode?"demo_announcements":"announcements";const {error}=await supabase.from(table).update({published:!item.active}).eq("id",id);if(!error)setAnnouncements(items=>items.map(x=>x.id===id?{...x,active:!x.active}:x))};
 const deleteAnnouncement=async(id:string)=>{if(!user||profile?.role!=="admin")return;const supabase=createClient(),table=demoMode?"demo_announcements":"announcements";const {error}=await supabase.from(table).delete().eq("id",id);if(!error)setAnnouncements(items=>items.filter(x=>x.id!==id))};
 const now=Date.now();const activeAnnouncements=useMemo(()=>announcements.filter(x=>{if(!x.active)return false;const start=x.startsAt?new Date(x.startsAt).getTime():0,end=x.expiresAt?new Date(x.expiresAt).getTime():Infinity;const target=x.audience==="all"||(x.audience==="messdiener"&&profile?.role==="messdiener")||(x.audience==="leitung"&&["leiter","om","planschreiber","admin"].includes(profile?.role??""));return target&&start<=now&&end>=now}),[announcements,profile,now]);
 const value=useMemo(()=>({announcements,activeAnnouncements,loading,createAnnouncement,toggleAnnouncement,deleteAnnouncement}),[announcements,activeAnnouncements,loading]);
 return <C.Provider value={value}>{children}</C.Provider>
}
export function useAnnouncements(){const v=useContext(C);if(!v)throw new Error("useAnnouncements must be used inside an AnnouncementProvider");return v}
