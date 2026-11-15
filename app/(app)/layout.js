import{redirect}from"next/navigation";import{sbServer}from"@/lib/server";import Shell from"@/components/Shell";
export default async function L({children}){const sb=await sbServer(),{data:{user}}=await sb.auth.getUser();if(!user)redirect("/login");
const{data:p}=await sb.from("profiles").select("*").eq("id",user.id).single();
if(!p||!p.active){await sb.auth.signOut();redirect("/login?e=access")}return<Shell profile={p}>{children}</Shell>}
