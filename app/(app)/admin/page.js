"use client";import{useEffect,useState}from"react";import{UserPlus,KeyRound,UserX,UserCheck,SlidersHorizontal}from"lucide-react";import{PERMS,KEYS,effective}from"@/lib/perms";
const TY=[["member","Team member"],["admin","Admin"]],START=Object.fromEntries(KEYS.map(k=>[k,["dashboard","calculator","orders","new_order"].includes(k)])),none=Object.fromEntries(KEYS.map(k=>[k,false]));
function Grid({v,set}){return<div className="pg">{PERMS.map(([g,l])=>{const on=l.filter(([k])=>v[k]).length;return<div className="grp" role="group" aria-label={g} key={g}><label className="ck gh"><input type="checkbox" checked={on==l.length} ref={el=>{if(el)el.indeterminate=on>0&&on<l.length}} onChange={e=>set(l.map(([k])=>k),e.target.checked)}/>{g}<span className="mute">{on}/{l.length}</span></label>
{l.map(([k,lb])=><label className="ck" key={k}><input type="checkbox" checked={!!v[k]} onChange={e=>set([k],e.target.checked)}/>{lb}</label>)}</div>})}</div>}
export default function Admin(){const[u,setU]=useState(null),[f,setF]=useState({t:"member",perms:START}),[m,setM]=useState(""),[op,setOp]=useState({}),[sv,setSv]=useState({});
const load=()=>fetch("/api/admin/users").then(r=>r.ok?r.json():[]).then(setU);useEffect(()=>{load()},[]);
async function call(method,body){const r=await fetch("/api/admin/users",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),j=await r.json().catch(()=>({}));return{ok:r.ok,error:j.error||(r.ok?"":"Something went wrong.")}}
async function act(method,body){const r=await call(method,body);setM(r.error||"Done.");if(r.ok)load();return r.ok}
async function add(e){e.preventDefault();const{t,perms,...rest}=f;if(await act("POST",{...rest,role:t=="admin"?"admin":"operations",...(t=="admin"?{}:{perms})}))setF({t:"member",perms:START})}
const pw=id=>{const p=prompt("New password (10+ characters)");if(p)act("PATCH",{id,password:p})};
async function save(x,body,label){const prev=u;setU(l=>l.map(y=>y.id==x.id?{...y,...body}:y));setSv(s=>({...s,[x.id]:{t:"Saving…"}}));
 const r=await call("PATCH",{id:x.id,...body});if(!r.ok)setU(prev);setSv(s=>({...s,[x.id]:r.ok?{t:label||"Saved"}:{t:r.error,err:1}}))}
const tick=(x,ks,v)=>save(x,{perms:{...effective(x),...Object.fromEntries(ks.map(k=>[k,v]))}}),
type=(x,t)=>t=="admin"?confirm("Make "+x.name+" an admin? Admins have full access, including this panel.")&&save(x,{role:"admin"},"Now an admin"):save(x,{role:"operations",perms:x.perms||START},"Now a team member");
return<><h1>Admin</h1><div className="card"><h3>Add a team member</h3><form onSubmit={add}><div className="row"><div><label>Name<input required value={f.name||""} onChange={e=>setF({...f,name:e.target.value})}/></label></div><div><label>Gmail / email<input type="email" required value={f.email||""} onChange={e=>setF({...f,email:e.target.value})}/></label></div><div><label>Password (10+ characters)<input type="password" minLength={10} required value={f.password||""} onChange={e=>setF({...f,password:e.target.value})}/></label></div>
<div><label>Type<select value={f.t} onChange={e=>setF({...f,t:e.target.value})}>{TY.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div></div>
{f.t=="member"?<><p className="mute" style={{margin:"14px 0 0"}}>Tick what this person can see and do. You can change it any time.</p><Grid v={f.perms} set={(ks,v)=>setF({...f,perms:{...f.perms,...Object.fromEntries(ks.map(k=>[k,v]))}})}/></>:<p className="mute" style={{margin:"14px 0 0"}}>Admins have full access, including this panel.</p>}
<div className="bar"><button className="p"><UserPlus size={16}/>Create account</button>{m&&<span className={m=="Done."?"mute":"err"} role="status">{m}</span>}</div></form></div>
<div className="card"><h3>Team and access</h3>{u===null?<p className="mute">Loading…</p>:<div className="team">{u.map(x=>{const e=effective(x),n=KEYS.filter(k=>e[k]).length,adm=x.role=="admin",s=sv[x.id];return<div className="mem" key={x.id}>
<div className="mh"><div className="mn"><b>{x.name}</b><span className="mute">{x.email}</span></div>
<select aria-label={"Type for "+x.name} value={adm?"admin":"member"} onChange={ev=>type(x,ev.target.value)}>{TY.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
<span className={"pill "+(x.active?"":"warn")}>{x.active?"Active":"Disabled"}</span>
<div className="ma">{!adm&&<button onClick={()=>setOp({...op,[x.id]:!op[x.id]})} aria-expanded={!!op[x.id]}><SlidersHorizontal size={16}/>Access {n}/{KEYS.length}</button>}<button className="ic" title="Reset password" aria-label="Reset password" onClick={()=>pw(x.id)}><KeyRound size={16}/></button><button className="ic" title={x.active?"Disable":"Enable"} aria-label={x.active?"Disable account":"Enable account"} onClick={()=>act("PATCH",{id:x.id,active:!x.active})}>{x.active?<UserX size={16}/>:<UserCheck size={16}/>}</button></div></div>
{s&&<p className={s.err?"err":"mute"} role="status" style={{margin:"8px 0 0"}}>{s.t}</p>}
{adm?<p className="mute" style={{margin:"8px 0 0"}}>Admins always have full access, including this panel.</p>:op[x.id]&&<div className="acc">
<div className="bar" style={{marginTop:0}}><span className="mute grow">Tick what {x.name} can see and do. Each tick saves straight away.</span><button onClick={()=>save(x,{perms:Object.fromEntries(KEYS.map(k=>[k,true]))})}>Allow all</button><button onClick={()=>save(x,{perms:none})}>Remove all</button></div>
<Grid v={e} set={(ks,v)=>tick(x,ks,v)}/></div>}
</div>})}</div>}</div></>}
