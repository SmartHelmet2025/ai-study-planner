import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fhhaoswweneiqcjpyhad.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaGFvc3d3ZW5laXFjanB5aGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzUwODksImV4cCI6MjA5NDM1MTA4OX0.FkEm-DwoHR07j-KZTDv9qfqhNWOAzDdM-mrvwWYO4F8";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);