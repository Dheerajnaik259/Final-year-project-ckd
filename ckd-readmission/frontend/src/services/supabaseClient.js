import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://axoxfkxiselcxjceushg.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4b3hma3hpc2VsY3hqY2V1c2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTU4MjgsImV4cCI6MjEwMzM3MTgyOH0.satiGwxXZP761wI2s3cgVBdXukqX8-OuoRafUKmTs6E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
