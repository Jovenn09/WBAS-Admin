import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hqrqchwtvmlfvcvigeol.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcnFjaHd0dm1sZnZjdmlnZW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwODkzODQsImV4cCI6MjAyNjY2NTM4NH0.dnEqiJ8YZvg3BjGKaQM7Jekjsy8zhOoLfV8DhmP-ebE";

const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcnFjaHd0dm1sZnZjdmlnZW9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTA4OTM4NCwiZXhwIjoyMDI2NjY1Mzg0fQ.NyV0d9g-hx1tVjkFaEKMzEhNk9YuxPEmzWWuGTdlT4k";

const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;
