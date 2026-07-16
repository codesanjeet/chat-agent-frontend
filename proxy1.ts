// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/profile"];

// export function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
//   if (!isProtected) return NextResponse.next();

//   const hasSession = request.cookies.get("session_hint");
//   if (!hasSession) {
//     const loginUrl = new URL("/login", request.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*"],
// };