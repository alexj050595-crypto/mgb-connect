"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
type Tier="full"|"reduced";
const C=createContext<{tier:Tier;ready:boolean}>({tier:"full",ready:false});
export function PerformanceProvider({children}:{children:ReactNode}){
 const [tier,setTier]=useState<Tier>("full");const [ready,setReady]=useState(false);
 useEffect(()=>{
  const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean;effectiveType?:string}};
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowMemory=typeof nav.deviceMemory==="number"&&nav.deviceMemory<=2;
  const fewCores=typeof nav.hardwareConcurrency==="number"&&nav.hardwareConcurrency<=2;
  const dataSaver=nav.connection?.saveData===true;
  const slowConnection=["slow-2g","2g"].includes(nav.connection?.effectiveType??"");
  let frames=0,previous=0,total=0,handle=0;
  const sample=(time:number)=>{if(previous)total+=time-previous;previous=time;frames++;if(frames<10){handle=requestAnimationFrame(sample);return;}
   const slowFrames=total/Math.max(1,frames-1)>25;const reduced=reducedMotion||lowMemory||fewCores||dataSaver||slowConnection||slowFrames;
   setTier(reduced?"reduced":"full");document.documentElement.classList.toggle("mgb-performance-lite",reduced);setReady(true);
  };
  handle=requestAnimationFrame(sample);
  return()=>{cancelAnimationFrame(handle);document.documentElement.classList.remove("mgb-performance-lite");};
 },[]);
 const value=useMemo(()=>({tier,ready}),[tier,ready]);return <C.Provider value={value}>{children}</C.Provider>;
}
export function usePerformanceMode(){return useContext(C)}
