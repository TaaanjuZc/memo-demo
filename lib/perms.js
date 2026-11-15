export const PERMS=[
 ["Pages",[["dashboard","Dashboard"],["calculator","Calculator"],["orders","Orders (list and order pages)"],["new_order","New order"],["payments","Payments"],["shipping","Shipping"],["woosh","Woosh emails"],["reports","Reports"],["tools","Import / export"],["settings","Settings"]]],
 ["Order actions",[["move_orders","Move orders to the next stage"],["revise_quote","Revise quotes and weights"],["cancel_orders","Cancel orders"],["cancel_booked","Cancel booked orders"],["override_advance","Book without the full advance"],["delete_orders","Delete orders"]]],
 ["Money",[["verify_payments","Verify payments and approve refunds"],["refunds","Record refunds"]]],
 ["Data",[["import","Import orders from CSV / Excel"],["backup","Download full backup"]]]];
export const KEYS=PERMS.flatMap(([,l])=>l.map(([k])=>k));
const PG=["dashboard","calculator","orders","new_order","payments","shipping","woosh","tools"];
export const DEFAULTS={operations:[...PG,"move_orders","revise_quote","cancel_orders","import"],finance:[...PG,"move_orders","revise_quote","cancel_orders","verify_payments","refunds"]};
export const perm=(p,k)=>!!p&&(p.role=="admin"||(p.perms&&typeof p.perms[k]=="boolean"?p.perms[k]:!!DEFAULTS[p.role]?.includes(k)));
export const effective=p=>Object.fromEntries(KEYS.map(k=>[k,perm(p,k)]));
export const pageKey=path=>path=="/"?"dashboard":path=="/orders/new"?"new_order":path=="/admin"||path.startsWith("/admin/")?"admin":{calculator:"calculator",orders:"orders",payments:"payments",shipping:"shipping",woosh:"woosh",reports:"reports",tools:"tools",settings:"settings"}[path.split("/")[1]];
export const canPage=(p,path)=>{const k=pageKey(path);return k=="admin"?p?.role=="admin":!k||perm(p,k)};
