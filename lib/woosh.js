import{fm}from"./ops";
export const norm=s=>String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const MO=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function evDate(t,recv){const r=new Date(recv||Date.now()),d=isNaN(r)?new Date():r,m=t.match(/Delivered\s+(?:\w{3,9},?\s+)?(\w{3})\w*\s+(\d{1,2})/i);
 if(m){const mi=MO.indexOf(m[1].toLowerCase());if(mi>=0){const x=new Date(Date.UTC(d.getUTCFullYear(),mi,+m[2]));if(x-d>864e5*2)x.setUTCFullYear(x.getUTCFullYear()-1);return x.toISOString().slice(0,10)}}return d.toISOString().slice(0,10)}
export function parseMail(m){const s=m.subject||"",b=m.body||"",t=s+"\n"+b,
 kind=/delivered/i.test(s)?"delivered":/shipped|dispatched|on its way/i.test(s)?"shipped":/confirm/i.test(s)?"confirmed":/^\s*Delivered\s+\w{3},/im.test(b)?"delivered":"other",
 ref=(s.match(/order\s*(?:number|no\.?|#)?\s*[:#]?\s*([A-Za-z]{0,4}-?\d{4,}[A-Za-z0-9-]*)/i)||b.match(/order\s*(?:number|no\.?)\s*[:#]?\s*([A-Za-z]{0,4}-?\d{4,}[A-Za-z0-9-]*)/i))?.[1]||null,
 tracking=t.match(/tracking\s*(?:number|no\.?|id)?\s*[:#]?\s*([A-Za-z0-9-]{8,})/i)?.[1]||null;
 return{kind,ref,tracking,event_date:evDate(t,m.date)}}
export const match=(orders,ev)=>orders.filter(o=>!o.cancelled&&(([o.data.woid,o.data.wref].some(x=>x&&ev.order_ref&&norm(x)==norm(ev.order_ref)))||(ev.tracking&&o.data.ref&&norm(o.data.ref)==norm(ev.tracking))));
export function applyEvent(n,ev,S){const d=n.data;d.sd=d.sd||{};if(n.cancelled)return{err:"Order is cancelled"};
 d.em=[...(d.em||[]),{id:ev.message_id,kind:ev.kind,at:ev.event_date,subject:ev.subject}];if(ev.tracking&&!d.ref){d.ref=ev.tracking;d.sd.ref=ev.tracking}
 if(ev.kind=="delivered"){if(n.status>=5)return{skip:"Already marked received in Pakistan"};if(n.status<4)return{err:"Order is not marked Ordered yet"};n.status=5;d.dates={...d.dates,5:ev.event_date};d.sd.rdate=ev.event_date;d.sdate=Date.now();d.msg=fm(n,"s",S);return{act:"Woosh email: delivered in Pakistan ("+ev.event_date+"). Moved to Pakistan received"}}
 if(n.status<4)return{err:"Order is not marked Ordered yet"};if(n.status>=5)return{skip:"Order is already past this stage"};d.sd.confirmed=d.sd.confirmed||ev.event_date;
 return{act:"Woosh email: "+(ev.kind=="shipped"?"shipped":"confirmed by brand")+" ("+ev.event_date+")"+(ev.tracking?", tracking "+ev.tracking:"")}}
