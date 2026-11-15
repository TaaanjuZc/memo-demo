import{NextResponse}from"next/server";import{createClient}from"@supabase/supabase-js";import{timingSafeEqual}from"node:crypto";
import{getSettings,persist,clone}from"@/lib/ops";import{parseMail,match,applyEvent}from"@/lib/woosh";
export const dynamic="force-dynamic";
const eq=(a,b)=>{const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length==y.length&&x.length>0&&timingSafeEqual(x,y)};
export async function POST(req){if(!process.env.WOOSH_WEBHOOK_SECRET||!eq(req.headers.get("x-woosh-secret"),process.env.WOOSH_WEBHOOK_SECRET))return NextResponse.json({error:"Unauthorized"},{status:401});
 let body;try{body=await req.json()}catch{return NextResponse.json({error:"Bad JSON"},{status:400})}const msgs=(Array.isArray(body.messages)?body.messages:[]).slice(0,50);
 const a=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),S=await getSettings(a),sys={name:"System (Woosh email)",role:"system"},st={applied:0,review:0,ignored:0,duplicate:0};
 const{data:orders}=await a.from("orders").select("id,status,cancelled,data");
 for(const m of msgs){const mid=String(m.id||"").slice(0,200);if(!mid)continue;const{data:ex}=await a.from("woosh_events").select("id").eq("message_id",mid).maybeSingle();if(ex){st.duplicate++;continue}
  const p=parseMail(m);if(p.kind=="other"||!(p.ref||p.tracking)){st.ignored++;continue}
  const ev={message_id:mid,received_at:m.date||null,sender:String(m.from||"").slice(0,200),subject:String(m.subject||"").slice(0,300),kind:p.kind,order_ref:p.ref,tracking:p.tracking,event_date:p.event_date},c=match(orders||[],ev);ev.order_ids=c.map(o=>o.id);
  if(c.length==1&&S.wooshAuto){const n=clone(c[0]),r=applyEvent(n,ev,S);if(r.act){const e=await persist(a,n,r.act,sys);if(e){ev.status="review";ev.reason="Could not save: "+e.message}else{Object.assign(c[0],n);ev.status="applied";ev.applied_order=n.id}}else if(r.skip){ev.status="ignored";ev.reason=r.skip}else{ev.status="review";ev.reason=r.err}}
  else{ev.status="review";ev.reason=c.length>1?"Several orders match":c.length?"Review-first mode is on":"No order matches"}
  await a.from("woosh_events").insert(ev);st[ev.status]=(st[ev.status]||0)+1}
 await a.from("settings").upsert({key:"woosh",value:{last_sync:new Date().toISOString(),...st}});return NextResponse.json({ok:true,...st})}
