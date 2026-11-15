import{NextResponse}from"next/server";import{sbServer}from"@/lib/server";
export async function GET(req){const{searchParams,origin}=new URL(req.url),code=searchParams.get("code");if(code){const sb=await sbServer();await sb.auth.exchangeCodeForSession(code)}return NextResponse.redirect(origin+"/")}
