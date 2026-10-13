import { type NextRequest, NextResponse } from "next/server";

// Admin panel has been moved to a separate project
// Running on http://localhost:3002

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old admin routes to new admin panel
  if (pathname.startsWith("/retrokino-admin")) {
    const url = new URL("http://localhost:3002" + pathname.replace("/retrokino-admin", ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
