"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME    = "rk_admin_token";
const ADMIN_PASSWORD = "retrokino2024";

// Parol to'g'ri bo'lsa cookie saqlaydi, noto'g'ri bo'lsa qayta login ga yuboradi
export async function adminLogin(formData: FormData) {
  const password = (formData.get("password") as string ?? "").trim();

  if (!password || password !== ADMIN_PASSWORD) {
    redirect("/retrokino-admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,                                      // JS dan o'qib bo'lmaydi
    secure:   process.env.NODE_ENV === "production",     // HTTPS da majburiy
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30,                        // 30 kun
    path:     "/",
  });

  redirect("/retrokino-admin");
}

// Cookie ni o'chiradi → login sahifasiga qaytaradi
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/retrokino-admin/login");
}
