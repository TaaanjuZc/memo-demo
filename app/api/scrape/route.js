import{NextResponse}from"next/server";import{lookup}from"node:dns/promises";import{isIP}from"node:net";import{sbServer}from"@/lib/server";
export const dynamic="force-dynamic";
const UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
priv=a=>/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(a)||/^(::1?$|f[cd]|fe80|::ffff:(127|10|192\.168|169\.254)\.)/i.test(a);
async function safe(u){if(!/^https?:$/.test(u.protocol)||/^(localhost|.*\.local|.*\.internal)$/i.test(u.hostname))return false;const h=u.hostname.replace(/^\[|\]$/g,"");if(isIP(h))return!priv(h);try{return(await lookup(h,{all:true})).every(x=>!priv(x.address))}catch{return false}}
async function get(url,accept){let u=new URL(url);for(let i=0;i<4;i++){if(!await safe(u))throw new Error("This address is not allowed.");
 const r=await fetch(u,{headers:{"user-agent":UA,accept},redirect:"manual",signal:AbortSignal.timeout(10000)});
 if(r.status>=300&&r.status<400&&r.headers.get("location")){u=new URL(r.headers.get("location"),u);continue}return r}throw new Error("Too many redirects.")}
const pick=(opts,vals,re)=>{const i=(opts||[]).findIndex(o=>re.test(typeof o=="string"?o:o.name));return i<0?undefined:vals[i]},
txt=s=>String(s??"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim()||undefined;
async function shopify(u){const m=u.pathname.match(/^(.*\/products\/[^/?#.]+)/);if(!m)return null;
 const r=await get(u.origin+m[1]+".js","application/json").catch(()=>null);if(!r?.ok)return null;const j=await r.json().catch(()=>null);if(!j?.variants?.length)return null;
 const vid=u.searchParams.get("variant"),v=j.variants.find(x=>String(x.id)==vid)||j.variants.find(x=>x.available)||j.variants[0],vals=[v.option1,v.option2,v.option3];
 return{brand:txt(j.vendor),name:txt(j.title),size:pick(j.options,vals,/size/i),colour:pick(j.options,vals,/colou?r/i),sku:v.sku||undefined,pkr:v.price!=null?v.price/100:undefined,stock:v.available===false?"Out of stock":undefined}}
function html(h){const meta=k=>h.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']*)`,"i"))?.[1]||h.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${k}["']`,"i"))?.[1];
 let P;for(const s of h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)){try{const walk=x=>{if(!x||typeof x!="object"||P)return;if([].concat(x["@type"]).includes("Product")){P=x;return}Object.values(x).forEach(walk)};walk(JSON.parse(s[1]))}catch{}}
 const of=[].concat(P?.offers?.offers||P?.offers||[])[0]||{},cur=of.priceCurrency||meta("product:price:currency")||meta("og:price:currency"),price=of.price??of.lowPrice??meta("product:price:amount")??meta("og:price:amount");
 return{brand:txt(typeof P?.brand=="object"?P.brand.name:P?.brand)||txt(meta("og:site_name")),name:txt(P?.name)||txt(meta("og:title")),size:txt(P?.size),colour:txt(P?.color),sku:txt(P?.sku),
  pkr:price!=null&&(!cur||/PKR/i.test(cur))&&+String(price).replace(/,/g,"")>=0?+String(price).replace(/,/g,""):undefined,stock:/OutOfStock/i.test(of.availability||"")?"Out of stock":undefined}}
export async function GET(req){const sb=await sbServer(),{data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"Not allowed"},{status:403});
 let u;try{u=new URL(req.nextUrl.searchParams.get("url"))}catch{return NextResponse.json({error:"Enter a full product URL."},{status:400})}
 try{let d=await shopify(u);if(!d){const r=await get(u,"text/html");if(!r.ok)return NextResponse.json({error:"The website answered "+r.status+"."},{status:502});d=html((await r.text()).slice(0,2e6))}
  d=Object.fromEntries(Object.entries(d).filter(([,v])=>v!==undefined&&v!==""));return NextResponse.json(d)}
 catch(e){return NextResponse.json({error:e.name=="TimeoutError"?"The website took too long to answer.":e.message},{status:502})}}
