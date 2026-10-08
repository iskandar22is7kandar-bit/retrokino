import { type NextRequest, NextResponse } from "next/server";

const ADMIN_PREFIX  = "/retrokino-admin";
const LOGIN_PATH    = "/retrokino-admin/login";
const COOKIE_NAME   = "rk_admin_token";

// Parol shu yerda — o'zgartirmoqchi bo'lsangiz shu qatorni o'zgartiring
const ADMIN_PASSWORD = "retrokino2024";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin bo'lmagan yo'llar — tekshiruvsiz o'tadi
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Login sahifasining o'zi — doim ochiq
  if (pathname === LOGIN_PATH) {
    // Agar allaqachon login qilingan bo'lsa → dashboardga
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token === ADMIN_PASSWORD) {
      const url = request.nextUrl.clone();
      url.pathname = "/retrokino-admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Barcha boshqa /retrokino-admin/* yo'llar uchun cookie tekshirish
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token || token !== ADMIN_PASSWORD) {
    // Cookie yo'q yoki noto'g'ri — login sahifasiga
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    // Qaytish uchun yo'lni saqlash
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
