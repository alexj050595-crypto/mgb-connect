"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { services as initialServices, type Service, type ExcuseReason } from "@/data/services";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";

type ServiceContextType = { services: Service[]; myServices: Service[]; getService:(id:string)=>Service|undefined; getTotalPoints:()=>number; getCompletedPoints:()=>number; requestExchange:(id:string)=>Promise<void>; takeService:(id:string)=>Promise<void>; rejectTakeover:(id:string)=>Promise<void>; excuseService:(id:string,reason:ExcuseReason)=>Promise<void>; restoreService:(id:string)=>Promise<void> };
type ServiceRow = { id:string; title:string; date_iso:string; time:string; location:string; meeting:string; points:number; status:Service["status"]; excuse_reason:string|null; assigned_to:string|null; taken_by:string|null; leader_id:string|null; assigned_profile?:{display_name:string|null}|null; taken_profile?:{display_name:string|null}|null; leader_profile?:{display_name:string|null}|null };
const ServiceContext=createContext<ServiceContextType|null>(null); const STORAGE_KEY="mgb-connect-services";

function rowToService(row:ServiceRow,userId?:string):Service{
 const date=new Date(`${row.date_iso}T12:00:00`).toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 const assignedName=row.assigned_profile?.display_name ?? (row.assigned_to===userId ? "Du" : "");
 return {id:row.id,title:row.title,dateISO:row.date_iso,date:date.charAt(0).toUpperCase()+date.slice(1),time:row.time,church:row.location,location:row.location,leader:row.leader_profile?.display_name??"",meeting:row.meeting,points:row.points,status:row.status,assignedTo:row.assigned_to??undefined,takenById:row.taken_by??undefined,takenBy:row.taken_profile?.display_name??(row.taken_by?"Anderer Messdiener":undefined),excuseReason:row.excuse_reason&&["Krankheit","Schule","Familie","Urlaub","Sonstiges"].includes(row.excuse_reason)?row.excuse_reason as ExcuseReason:undefined,...(assignedName?{assignedName}: {})} as Service;
}
function loadLocalServices(){try{const stored=window.localStorage.getItem(STORAGE_KEY);if(!stored)return initialServices;const parsed=JSON.parse(stored) as Service[];return Array.isArray(parsed)?parsed:initialServices;}catch{return initialServices;}}

export function ServiceProvider({children}:{children:ReactNode}){
 const {user,loading:authLoading}=useAuth(); const {enabled:demoMode,loading:demoLoading}=useDemoMode(); const [services,setServices]=useState<Service[]>([]); const [usingSupabase,setUsingSupabase]=useState(false); const supabase=useMemo(()=>createClient(),[]);
 async function loadServices(){
  if(!user){setUsingSupabase(false);setServices(loadLocalServices());return;}
  const table=demoMode?"demo_services":"services";
  const select=demoMode
   ? "id, title, date_iso, time, location, meeting, points, status, excuse_reason, assigned_to, taken_by, leader_id, assigned_profile:profiles!demo_services_assigned_to_fkey(display_name), taken_profile:profiles!demo_services_taken_by_fkey(display_name), leader_profile:profiles!demo_services_leader_id_fkey(display_name)"
   : "id, title, date_iso, time, location, meeting, points, status, excuse_reason, assigned_to, taken_by, leader_id, assigned_profile:profiles!services_assigned_to_fkey(display_name), taken_profile:profiles!services_taken_by_fkey(display_name), leader_profile:profiles!services_leader_id_fkey(display_name)";
  const {data,error}=await supabase.from(table).select(select).order("date_iso",{ascending:true}); setUsingSupabase(true);
  if(!error&&data){setServices((data as ServiceRow[]).map(row=>rowToService(row,user.id)));return;} setServices([]);
 }
 useEffect(()=>{if(authLoading||demoLoading)return;void loadServices();},[authLoading,demoLoading,user?.id,demoMode]);
 useEffect(()=>{if(usingSupabase)return;try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(services));}catch{}},[services,usingSupabase]);
 async function runTransition(rpcName:"request_service_exchange"|"take_service"|"reject_service_takeover"|"excuse_service"|"restore_service",id:string,reason?:ExcuseReason){
  if(usingSupabase&&user){const realRpc=demoMode?({request_service_exchange:"demo_request_service_exchange",take_service:"demo_take_service",reject_service_takeover:"demo_reject_service_takeover",excuse_service:"demo_excuse_service",restore_service:"demo_restore_service"} as const)[rpcName]:rpcName;const params=rpcName==="excuse_service"?{p_service_id:id,p_reason:reason}:{p_service_id:id};const {data}=await supabase.rpc(realRpc,params);if(data===true)await loadServices();return;}
  setServices(current=>current.map(service=>{if(service.id!==id)return service;if(rpcName==="request_service_exchange")return service.status==="scheduled"?{...service,status:"exchange_requested",takenBy:undefined,takenById:undefined,excuseReason:undefined}:service;if(rpcName==="take_service")return service.status==="exchange_requested"?{...service,status:"taken_over",takenBy:"Anderer Messdiener"}:service;if(rpcName==="reject_service_takeover")return service.status==="taken_over"?{...service,status:"exchange_requested",takenBy:undefined,takenById:undefined}:service;if(rpcName==="excuse_service")return service.status==="scheduled"?{...service,status:"excused",excuseReason:reason,takenBy:undefined,takenById:undefined}:service;return {...service,status:"scheduled",excuseReason:undefined,takenBy:undefined,takenById:undefined};}));
 }
 const requestExchange=(id:string)=>runTransition("request_service_exchange",id); const takeService=(id:string)=>runTransition("take_service",id); const rejectTakeover=(id:string)=>runTransition("reject_service_takeover",id); const excuseService=(id:string,r:ExcuseReason)=>runTransition("excuse_service",id,r); const restoreService=(id:string)=>runTransition("restore_service",id); const getService=(id:string)=>services.find(s=>s.id===id);
 const myServices=useMemo(()=>user?services.filter(s=>s.assignedTo===user.id||s.takenById===user.id):services,[services,user?.id]); const getTotalPoints=()=>myServices.reduce((t,s)=>s.status==="completed"?t+s.points:t,0); const getCompletedPoints=getTotalPoints;
 const value=useMemo(()=>({services,myServices,getService,getTotalPoints,getCompletedPoints,requestExchange,takeService,rejectTakeover,excuseService,restoreService}),[services,myServices,usingSupabase,user?.id,demoMode]); return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}
export function useServices(){const context=useContext(ServiceContext);if(!context)throw new Error("useServices must be used inside a ServiceProvider");return context;}
