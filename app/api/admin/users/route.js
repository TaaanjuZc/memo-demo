import{NextResponse}from"next/server";import{createClient}from"@supabase/supabase-js";import{sbServer}from"@/lib/server";import{KEYS}from"@/lib/perms";
const adm=()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
async function guard(){const sb=await sbServer(),{data:{user}}=await sb.auth.getUser();if(!user)return null;const{data:p}=await sb.from("profiles").select("role,active").eq("id",user.id).single();return p&&p.active&&p.role=="admin"?user:null}
const NEED="Access can't be saved yet: run supabase/schema4.sql once in the Supabase SQL Editor.",no=()=>NextResponse.json({error:"Not allowed"},{status:403}),ROLES=["admin","operations","finance"];
export async function GET(){if(!await guard())return no();const a=adm(),{data:ps}=await a.from("profiles").select("*").order("created_at"),{data:{users}}=await a.auth.admin.listUsers({perPage:200});
return NextResponse.json(ps.map(p=>({...p,email:users.find(u=>u.id==p.id)?.email})))}
const badPerms=p=>p!==null&&(typeof p!="object"||Object.entries(p).some(([k,v])=>!KEYS.includes(k)||typeof v!="boolean"));
export async function POST(req){if(!await guard())return no();const{name,email,password,role,perms}=await req.json();
if(!name||!email||!ROLES.includes(role)||!password||password.length<10)return NextResponse.json({error:"Name, email, role and a password of 10+ characters are required."},{status:400});
if(perms!==undefined&&badPerms(perms))return NextResponse.json({error:"Bad permissions"},{status:400});
const a=adm(),{data,error}=await a.auth.admin.createUser({email,password,email_confirm:true});if(error)return NextResponse.json({error:error.message},{status:400});
const{error:e2}=await a.from("profiles").insert({id:data.user.id,name,role,...(perms&&role!="admin"?{perms}:{})});if(e2){await a.auth.admin.deleteUser(data.user.id);return NextResponse.json({error:/perms/.test(e2.message)?NEED:e2.message},{status:400})}return NextResponse.json({ok:true})}
export async function PATCH(req){const me=await guard();if(!me)return no();const{id,role,active,password,perms}=await req.json(),a=adm();
if(perms!==undefined&&badPerms(perms))return NextResponse.json({error:"Bad permissions"},{status:400});
if(id==me.id&&(active===false||(role&&role!="admin")))return NextResponse.json({error:"You cannot remove your own admin access."},{status:400});
if(role&&!ROLES.includes(role))return NextResponse.json({error:"Bad role"},{status:400});if(password&&password.length<10)return NextResponse.json({error:"Password needs 10+ characters."},{status:400});
const u={};if(typeof active=="boolean")u.active=active;if(role)u.role=role;if(perms!==undefined)u.perms=perms;if(Object.keys(u).length){const{error}=await a.from("profiles").update(u).eq("id",id);if(error)return NextResponse.json({error:/perms/.test(error.message)?NEED:error.message},{status:400})}
const au={};if(typeof active=="boolean")au.ban_duration=active?"none":"876000h";if(password)au.password=password;if(Object.keys(au).length)await a.auth.admin.updateUserById(id,au);return NextResponse.json({ok:true})}
