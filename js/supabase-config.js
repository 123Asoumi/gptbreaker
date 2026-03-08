// Configuration Supabase pour gptbreaker
const _supabaseUrl = 'https://gkmijzltxbpgoyncvrix.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWlqemx0eGJwZ295bmN2cml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTIxNjMsImV4cCI6MjA4ODQyODE2M30.iYjRXGeW6K8mTevgwOqr57yBaKVWTKYBGiuJYPqgjd8';

// Initialisation du client Supabase
window.supabaseClient = window.supabase.createClient(_supabaseUrl, _supabaseKey, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'gptbreaker.auth',
    },
});

console.log("Nouveau Supabase gptbreaker initialisé avec succès !");
