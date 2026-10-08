import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Hardcoded Supabase credentials (faqat test uchun)
const SUPABASE_URL = "https://ztdfmcopfvvjcrmltqad.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGZtY29wZnZ2amNybWx0cWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTIxNjksImV4cCI6MjEwNjA4ODE2OX0.mqoVnTDtu5s0Yfor5oahUFlDr8HywRSrHeXDdxHumgQ";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server Component ichida chaqirilganda ignore qilinadi
          }
        },
      },
    }
  );
}
