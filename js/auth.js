// Logique d'authentification pour GPTBreaker
window.addEventListener('error', (e) => alert('GLOBAL ERROR: ' + e.message + ' at ' + e.filename + ':' + e.lineno));
window.addEventListener('unhandledrejection', (e) => alert('PROMISE REJECTION: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)));

let isSignUpMode = false;
let authSubscription = null;

function isLocalFileContext() {
    return window.location.protocol === 'file:';
}

function isSecureContextAllowed() {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    return window.location.protocol === 'https:' || isLocalhost;
}

function getAuthRedirectUrl() {
    if (isLocalFileContext()) {
        return null;
    }

    const path = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
    return `${window.location.origin}${path}`;
}

function setFormPendingState(isPending) {
    const submitBtn = document.getElementById('submitBtn');
    const googleBtn = document.querySelector('[data-google-auth]');

    if (submitBtn) {
        submitBtn.disabled = isPending;
        submitBtn.style.opacity = isPending ? '0.7' : '1';
        submitBtn.style.cursor = isPending ? 'wait' : 'pointer';
    }

    if (googleBtn) {
        googleBtn.disabled = isPending;
        googleBtn.style.opacity = isPending ? '0.7' : '1';
        googleBtn.style.cursor = isPending ? 'wait' : 'pointer';
    }
}

function requireHostedContext() {
    if (!isLocalFileContext()) {
        return true;
    }

    alert("L'authentification Supabase ne fonctionne pas correctement depuis un fichier local. Lance le site avec un serveur local, par exemple `npx serve .` ou l'extension Live Server.");
    return false;
}

function requireSecureContext() {
    if (isSecureContextAllowed()) {
        return true;
    }

    alert("L'authentification est désactivée hors HTTPS. Utilise HTTPS en production.");
    return false;
}

function validateCredentials(email, password, requireStrongPassword = false) {
    if (!email || !password) {
        return "Renseigne un email et un mot de passe valides.";
    }

    if (requireStrongPassword && password.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    return null;
}

function getFriendlyAuthErrorMessage(error, mode) {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('invalid login credentials')) {
        return "Email ou mot de passe incorrect.";
    }

    if (message.includes('email not confirmed')) {
        return "Ton email n'est pas encore confirmé.";
    }

    if (message.includes('user already registered')) {
        return "Un compte existe déjà avec cet email.";
    }

    if (message.includes('password should be at least')) {
        return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (message.includes('redirect') || message.includes('redirect_to')) {
        return `Le domaine actuel (${window.location.origin}) n'est pas autorisé dans Supabase Auth. Ajoute cette URL exacte dans Site URL et Redirect URLs.`;
    }

    if (mode === 'google') {
        return "La connexion Google a échoué. Vérifie la configuration OAuth et réessaie.";
    }

    return "Une erreur d'authentification est survenue. Réessaie.";
}

async function checkAuthStatus() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Erreur de lecture de session:", error.message);
        return;
    }

    const authButtons = document.querySelectorAll('.auth-buttons');
    const userProfile = document.querySelectorAll('.user-profile');

    if (session) {
        console.log("Utilisateur connecté:", session.user.email);
        authButtons.forEach((btn) => {
            btn.style.display = 'none';
        });
        userProfile.forEach((profile) => {
            profile.style.display = 'flex';
            const emailSpan = profile.querySelector('.user-email');
            if (emailSpan) {
                emailSpan.textContent = session.user.email || 'Connecté';
            }
        });
        return;
    }

    console.log("Aucun utilisateur connecté.");
    authButtons.forEach((btn) => {
        btn.style.display = 'flex';
    });
    userProfile.forEach((profile) => {
        profile.style.display = 'none';
    });
}

async function signIn(email, password) {
    setFormPendingState(true);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Erreur de connexion:", error.message);
            alert(getFriendlyAuthErrorMessage(error, 'signin'));
            return;
        }

        console.log("Connexion réussie.");
        await checkAuthStatus();
        closeLoginModal();
    } finally {
        setFormPendingState(false);
    }
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) {
        return;
    }

    modal.style.display = 'flex';
    const emailInput = document.getElementById('email');
    if (emailInput) {
        window.setTimeout(() => emailInput.focus(), 100);
    }
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.querySelector('[data-auth-toggle]');

    if (isSignUpMode) {
        if (title) title.textContent = "Créer un compte";
        if (submitBtn) submitBtn.textContent = "S'inscrire";
        if (toggleText) toggleText.textContent = "Déjà un compte ?";
        if (toggleBtn) toggleBtn.textContent = "Se connecter";
        return;
    }

    if (title) title.textContent = "Se connecter";
    if (submitBtn) submitBtn.textContent = "Se connecter";
    if (toggleText) toggleText.textContent = "Pas encore de compte ?";
    if (toggleBtn) toggleBtn.textContent = "S'inscrire";
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    if (!requireHostedContext() || !requireSecureContext()) {
        return;
    }

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value || '';

    const validationError = validateCredentials(email, password, isSignUpMode);
    if (validationError) {
        alert(validationError);
        return;
    }

    if (isSignUpMode) {
        await signUp(email, password);
        return;
    }

    await signIn(email, password);
}

async function signUp(email, password) {
    setFormPendingState(true);

    try {
        const redirectTo = getAuthRedirectUrl();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });

        if (error) {
            console.error("Erreur d'inscription:", error.message);
            alert(getFriendlyAuthErrorMessage(error, 'signup'));
            return;
        }

        const hasSession = Boolean(data.session);
        const message = hasSession
            ? "Inscription réussie. Tu es maintenant connecté."
            : "Inscription réussie. Vérifie ton email pour confirmer ton compte avant de te connecter.";

        alert(message);
        await checkAuthStatus();
        closeLoginModal();
    } finally {
        setFormPendingState(false);
    }
}

async function signInWithGoogle() {
    if (!requireHostedContext() || !requireSecureContext()) {
        return;
    }

    setFormPendingState(true);

    try {
        const redirectTo = getAuthRedirectUrl();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: redirectTo ? { redirectTo } : undefined,
        });

        if (error) {
            console.error("Erreur de connexion Google:", error.message);
            alert(getFriendlyAuthErrorMessage(error, 'google'));
        }
    } finally {
        setFormPendingState(false);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }

    const form = document.getElementById('loginForm');
    if (form) {
        form.reset();
    }

    if (isSignUpMode) {
        toggleAuthMode();
    }
}

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Erreur de déconnexion:", error.message);
        alert("La déconnexion a échoué. Réessaie.");
        return;
    }

    console.log("Déconnexion réussie.");
    await checkAuthStatus();
}

function bindAuthControls() {
    document.querySelectorAll('[data-open-login]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openLoginModal();
        });
    });

    document.querySelectorAll('[data-sign-out]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            signOut();
        });
    });

    const googleBtn = document.querySelector('[data-google-auth]');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            signInWithGoogle();
        });
        googleBtn.addEventListener('mouseenter', () => {
            googleBtn.style.backgroundColor = '#F9FAFB';
        });
        googleBtn.addEventListener('mouseleave', () => {
            googleBtn.style.backgroundColor = 'white';
        });
    }

    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleAuthSubmit);
    }

    document.querySelectorAll('#email, #password').forEach((input) => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#3B6DF6';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#D1D5DB';
        });
    });

    const toggleBtn = document.querySelector('[data-auth-toggle]');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleAuthMode();
        });
    }

    const closeBtn = document.querySelector('[data-close-login]');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeLoginModal();
        });
    }
}

function bindModalInteractions() {
    const modal = document.getElementById('loginModal');
    if (!modal) {
        return;
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeLoginModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeLoginModal();
        }
    });
}

function subscribeToAuthChanges() {
    if (authSubscription) {
        authSubscription.unsubscribe();
    }

    const { data } = supabase.auth.onAuthStateChange(async (event) => {
        console.log("Changement d'état d'authentification:", event);
        await checkAuthStatus();

        if (event === 'SIGNED_IN') {
            closeLoginModal();
        }
    });

    authSubscription = data.subscription;
}

document.addEventListener('DOMContentLoaded', async () => {
    bindAuthControls();
    bindModalInteractions();
    subscribeToAuthChanges();
    await checkAuthStatus();
});
