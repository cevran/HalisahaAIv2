const CONFIG = {
    SUPABASE_URL: "https://rquhkilfwppdfxxaxysb.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWhraWxmd3BwZGZ4eGF4eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTQ5MDYsImV4cCI6MjEwNjg3MDkwNn0.8JaCqSA-tuXZBLkObPqencFMvav8uny0bEuUwbbzU_A"
};

const supabaseClient = supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);