"use client";import{useEffect,useState}from"react";import{Sun,Moon}from"lucide-react";
export default function ThemeToggle(){const[d,setD]=useState(false);useEffect(()=>setD(document.documentElement.dataset.theme=="dark"),[]);
const t=()=>{const n=d?"light":"dark";document.documentElement.dataset.theme=n;localStorage.setItem("theme",n);setD(!d)};
return<button className="ic" onClick={t} aria-label={d?"Switch to day mode":"Switch to night mode"} title={d?"Day mode":"Night mode"}>{d?<Sun size={18}/>:<Moon size={18}/>}</button>}
