import { createBrowserClient } from "@supabase/ssr";

// Hardcoded Supabase credentials (faqat test uchun)
const SUPABASE_URL = "https://ztdfmcopfvvjcrmltqad.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGZtY29wZnZ2amNybWx0cWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTIxNjksImV4cCI6MjEwNjA4ODE2OX0.mqoVnTDtu5s0Yfor5oahUFlDr8HywRSrHeXDdxHumgQ";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  );
}
