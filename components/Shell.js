"use client";import Link from"next/link";import{usePathname,useRouter}from"next/navigation";import{LayoutDashboard,ClipboardList,PlusCircle,ShieldCheck,LogOut,Wallet,Truck,BarChart3,FileDown,Settings,Mail}from"lucide-react";
import ThemeToggle from"./ThemeToggle";import{sbBrowser}from"@/lib/supabase";
export default function Shell({profile,children}){const p=usePathname(),r=useRouter();
const N=[["/","Dashboard",LayoutDashboard],["/orders","Orders",ClipboardList],["/orders/new","New order",PlusCircle],["/payments","Payments",Wallet],["/shipping","Shipping",Truck],["/woosh","Woosh emails",Mail],...(profile.role=="admin"?[["/reports","Reports",BarChart3]]:[]),["/tools","Import / export",FileDown],...(profile.role=="admin"?[["/settings","Settings",Settings],["/admin","Admin",ShieldCheck]]:[])];
const out=async()=>{await sbBrowser().auth.signOut();r.replace("/login");r.refresh()};
return<div className="shell"><aside className="side"><Link href="/" className="brand">Memo</Link>
{N.map(([h,l,I])=><Link key={h} href={h} className={"nl "+((h=="/"?p=="/":p==h||(h=="/orders"&&p.startsWith("/orders")&&p!="/orders/new"))?"on":"")}><I size={18}/>{l}</Link>)}
<div className="me"><div className="grow"><b>{profile.name}</b><small>{profile.role}</small></div><ThemeToggle/><button className="ic" onClick={out} aria-label="Sign out" title="Sign out"><LogOut size={18}/></button></div></aside><main className="main">{children}</main></div>}
