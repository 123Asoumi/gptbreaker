// Logique de collecte de leads (Demande de GPT personnalisé)

function openRequestModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
    }
}

function closeRequestModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('loginForm');
    if (form) {
        form.reset();
    }
}

function setFormPendingState(isPending) {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = isPending;
        submitBtn.style.opacity = isPending ? '0.7' : '1';
        submitBtn.style.cursor = isPending ? 'wait' : 'pointer';
        submitBtn.textContent = isPending ? 'Envoi en cours...' : "Envoyer ma demande";
    }
}

async function handleRequestSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const requestInput = document.getElementById('request');

    if (!emailInput || !requestInput) {
        console.error("Éléments du formulaire introuvables");
        return;
    }

    const email = emailInput.value.trim();
    const request = requestInput.value.trim();

    if (!email || !request) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    setFormPendingState(true);

    try {
        const { error } = await window.supabaseClient
            .from('gpt_requests')
            .insert([
                { email: email, request: request }
            ]);

        if (error) {
            console.error("Erreur lors de l'enregistrement de la demande:", error.message);
            alert("Une erreur est survenue lors de l'envoi : " + error.message);
        } else {
            console.log("Demande enregistrée avec succès !");
            alert("Merci ! Ta demande a bien été envoyée. On te recontacte très vite.");
            closeRequestModal();
        }
    } catch (err) {
        console.error("Erreur inattendue:", err);
        alert("Une erreur inattendue s'est produite lors de l'envoi.");
    } finally {
        setFormPendingState(false);
    }
}

function bindControls() {
    // Boutons pour ouvrir la modale (on cible à la fois data-open-login et data-open-signup pour la rétrocompatibilité HTML)
    document.querySelectorAll('[data-open-login], [data-open-signup]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openRequestModal();
        });
    });

    // Bouton de fermeture de la modale
    const closeBtn = document.querySelector('[data-close-login]');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeRequestModal();
        });
    }

    // Soumission du formulaire
    const form = document.getElementById('loginForm');
    if (form) {
        // Netlify Forms est désactivé si l'attribut est présent
        form.removeAttribute('data-netlify');
        form.addEventListener('submit', handleRequestSubmit);
    }

    // Effets visuels sur les inputs
    document.querySelectorAll('#email, #request').forEach((input) => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#3B6DF6';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#D1D5DB';
        });
    });
}

function bindModalInteractions() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeRequestModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeRequestModal();
        }
    });
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    bindControls();
    bindModalInteractions();

    // Rendre l'interface cohérente (plus de notion de connexion)
    const userProfileEl = document.querySelector('.user-profile');
    const authButtonsEl = document.querySelector('.auth-buttons');
    if (authButtonsEl) authButtonsEl.style.display = 'flex';
    if (userProfileEl) userProfileEl.style.display = 'none';
});
