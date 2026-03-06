// Configuration Supabase pour GPTBreaker (Relié au projet Jobreaker)
const _supabaseUrl = 'https://udychrmqcmjdofebdvof.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkeWNocm1xY21qZG9mZWJkdm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjUyNTQsImV4cCI6MjA4MTk0MTI1NH0.X7SEnddtzRQgnyFRFckM_IdAbWxdG3eGDxM4YQt1L5s';

// Initialisation du client Supabase
const supabase = window.supabase.createClient(_supabaseUrl, _supabaseKey, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'gptbreaker.auth',
    },
});

console.log("Supabase initialisé avec succès !");
