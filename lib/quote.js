export const STAGES=["Enquiry","Product verified","Quoted","Booked","Ordered","Pakistan received","In transit","Bangladesh received","Delivered","Closed"];
export const bdt=n=>{const v=+n||0,w=Math.abs(v-Math.round(v))<.005;return"৳"+v.toLocaleString("en",{minimumFractionDigits:w?0:2,maximumFractionDigits:w?0:2})};
// ag = grams the advance is based on, fixed when the order is created so later weight changes never move the advance.
export const advPct=Q=>Q.ap===null?null:Q.ap??40,advOf=Q=>Q.ap===null?{amt:Q.am}:{pct:Q.ap,ag:Q.ag??Q.g};
export function quote(pk,sh,g,del,round=true,av={}){pk=+pk||0;sh=+sh||0;g=+g||0;del=+del||0;const base=pk+sh+100,div=base<5000?1.8:base<=10000?1.9:base<=20000?1.95:base<=30000?1.98:1.99,ceil=Math.ceil(base/div),dress=ceil*1.01,wc=g*1.65,
man=av.pct==null&&"amt"in av,ap=man?null:+(av.pct??40),am=man?Math.max(0,+av.amt||0):undefined,ag=man?undefined:av.ag==null?g:+av.ag||0;
let total=dress+wc+del,ta=dress+ag*1.65+del;if(round){total=Math.ceil(total-1e-9);ta=Math.ceil(ta-1e-9)}const adv=man?am:round?Math.ceil(ta*ap/100-1e-9):ta*ap/100;
return{base,div,ceil,dress,wc,del,g,total,adv,ap,am,ag}}
