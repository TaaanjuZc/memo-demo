import"./globals.css";import{Bricolage_Grotesque}from"next/font/google";
const f=Bricolage_Grotesque({subsets:["latin"],variable:"--font"});
export const metadata={title:"Memo",description:"Pre-order management"};
export default function L({children}){return<html lang="en" className={f.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`}}/></head><body>{children}</body></html>}
