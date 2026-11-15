"use client";import Link from"next/link";import{useEffect,useState}from"react";import{usePathname,useRouter}from"next/navigation";import{LayoutDashboard,ClipboardList,PlusCircle,ShieldCheck,LogOut,Wallet,Truck,BarChart3,FileDown,Settings,Mail,Calculator,Menu,X}from"lucide-react";
import ThemeToggle from"./ThemeToggle";import{sbBrowser}from"@/lib/supabase";
export default function Shell({profile,children}){const p=usePathname(),r=useRouter(),[open,setOpen]=useState(false);useEffect(()=>setOpen(false),[p]);
const N=[["/","Dashboard",LayoutDashboard],["/calculator","Calculator",Calculator],["/orders","Orders",ClipboardList],["/orders/new","New order",PlusCircle],["/payments","Payments",Wallet],["/shipping","Shipping",Truck],["/woosh","Woosh emails",Mail],...(profile.role=="admin"?[["/reports","Reports",BarChart3]]:[]),["/tools","Import / export",FileDown],...(profile.role=="admin"?[["/settings","Settings",Settings],["/admin","Admin",ShieldCheck]]:[])];
const on=h=>h=="/"?p=="/":p==h||(h=="/orders"&&p.startsWith("/orders")&&p!="/orders/new"),cur=N.find(([h])=>on(h)),CI=cur?.[2];
const out=async()=>{await sbBrowser().auth.signOut();r.replace("/login");r.refresh()};
return<div className="shell"><aside className={"side"+(open?" open":"")}><div className="top"><Link href="/" className="brand">Memo</Link>
<button className="mt" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="nav">{CI&&<CI size={18}/>}<span className="grow">{cur?.[1]||"Menu"}</span>{open?<X size={18}/>:<Menu size={18}/>}</button></div>
<nav id="nav" className="nav">{N.map(([h,l,I])=><Link key={h} href={h} className={"nl "+(on(h)?"on":"")}><I size={18}/>{l}</Link>)}
<div className="me"><div className="grow"><b>{profile.name}</b><small>{profile.role}</small></div><ThemeToggle/><button className="ic" onClick={out} aria-label="Sign out" title="Sign out"><LogOut size={18}/></button></div></nav></aside><main className="main">{children}</main></div>}
