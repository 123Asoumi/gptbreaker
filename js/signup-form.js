(function () {
    const LOCAL_STORAGE_KEY = 'gptbreaker.waitlist.local';

    function getModal() {
        return document.getElementById('signupModal') || document.getElementById('loginModal');
    }

    function getForm() {
        return document.getElementById('signupForm') || document.getElementById('loginForm');
    }

    function getSubmitButton() {
        return document.getElementById('submitSignupBtn') || document.getElementById('submitBtn');
    }

    function ensureFeedbackElement(form) {
        let feedback = document.getElementById('signupFeedback');
        if (feedback) {
            return feedback;
        }

        feedback = document.createElement('div');
        feedback.id = 'signupFeedback';
        feedback.style.display = 'none';
        feedback.style.marginBottom = '1rem';
        feedback.style.padding = '0.75rem';
        feedback.style.borderRadius = '0.5rem';
        feedback.style.fontSize = '0.875rem';

        const submitBtn = getSubmitButton();
        if (submitBtn && submitBtn.parentNode === form) {
            form.insertBefore(feedback, submitBtn);
        } else {
            form.appendChild(feedback);
        }

        return feedback;
    }

    function showFeedback(message, isSuccess) {
        const form = getForm();
        if (!form) {
            return;
        }

        const feedback = ensureFeedbackElement(form);
        feedback.textContent = message;
        feedback.style.display = 'block';
        feedback.style.backgroundColor = isSuccess ? '#ECFDF5' : '#FEF2F2';
        feedback.style.color = isSuccess ? '#065F46' : '#991B1B';
        feedback.style.border = `1px solid ${isSuccess ? '#A7F3D0' : '#FECACA'}`;
    }

    function clearFeedback() {
        const feedback = document.getElementById('signupFeedback');
        if (!feedback) {
            return;
        }

        feedback.style.display = 'none';
        feedback.textContent = '';
    }

    function setPendingState(isPending) {
        const submitBtn = getSubmitButton();
        if (!submitBtn) {
            return;
        }

        submitBtn.disabled = isPending;
        submitBtn.style.opacity = isPending ? '0.7' : '1';
        submitBtn.style.cursor = isPending ? 'wait' : 'pointer';
    }

    function openSignupModal() {
        const modal = getModal();
        if (!modal) {
            return;
        }

        modal.style.display = 'flex';
        const emailInput = document.getElementById('email') || document.getElementById('signup-email');
        if (emailInput) {
            window.setTimeout(() => emailInput.focus(), 100);
        }
    }

    function closeSignupModal() {
        const modal = getModal();
        if (!modal) {
            return;
        }

        modal.style.display = 'none';
        clearFeedback();
    }

    function encode(formData) {
        return new URLSearchParams(formData).toString();
    }

    function saveLocalLead(formData) {
        const existing = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        existing.push({
            email: formData.get('email') || '',
            message: formData.get('message') || formData.get('password') || '',
            createdAt: new Date().toISOString(),
        });
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    }

    function transformModalContent() {
        const title = document.getElementById('modalTitle');
        if (title) {
            title.textContent = 'Inscription rapide';
        }

        const form = getForm();
        if (!form) {
            return;
        }

        form.setAttribute('name', 'waitlist');
        form.setAttribute('method', 'POST');
        form.setAttribute('data-netlify', 'true');
        form.setAttribute('netlify-honeypot', 'bot-field');

        if (!form.querySelector('input[name="form-name"]')) {
            const formNameInput = document.createElement('input');
            formNameInput.type = 'hidden';
            formNameInput.name = 'form-name';
            formNameInput.value = 'waitlist';
            form.insertBefore(formNameInput, form.firstChild);
        }

        if (!form.querySelector('input[name="bot-field"]')) {
            const honeypot = document.createElement('input');
            honeypot.type = 'hidden';
            honeypot.name = 'bot-field';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.insertBefore(honeypot, form.firstChild);
        }

        const intro = document.createElement('p');
        intro.textContent = 'Laisse ton email et explique rapidement ton besoin.';
        intro.style.marginBottom = '1rem';
        intro.style.textAlign = 'center';
        intro.style.color = '#6B7280';
        if (title && !title.nextElementSibling?.matches('[data-signup-intro]')) {
            intro.setAttribute('data-signup-intro', 'true');
            title.insertAdjacentElement('afterend', intro);
        }

        const toggleButton = document.querySelector('[data-auth-toggle]');
        if (toggleButton && toggleButton.parentElement) {
            toggleButton.parentElement.remove();
        }

        const emailLabel = document.querySelector('label[for="email"]');
        if (emailLabel) {
            emailLabel.textContent = 'Email';
        }

        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.name = 'email';
            emailInput.placeholder = 'ton@email.com';
            emailInput.autocomplete = 'email';
        }

        const messageLabel = document.querySelector('label[for="password"]');
        if (messageLabel) {
            messageLabel.textContent = 'Ton besoin';
        }

        const messageInput = document.getElementById('password');
        if (messageInput) {
            messageInput.type = 'text';
            messageInput.name = 'message';
            messageInput.placeholder = 'Explique brièvement ce que tu cherches.';
            messageInput.autocomplete = 'off';
        }

        const submitBtn = getSubmitButton();
        if (submitBtn) {
            submitBtn.textContent = 'Envoyer ma demande';
        }

        ensureFeedbackElement(form);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        clearFeedback();

        const form = getForm();
        if (!form) {
            return;
        }

        const formData = new FormData(form);
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!email || !message) {
            showFeedback('Renseigne ton email et ton besoin.', false);
            return;
        }

        setPendingState(true);

        try {
            if (window.location.protocol === 'file:') {
                saveLocalLead(formData);
                form.reset();
                showFeedback("Test local enregistrÃ©. En ligne, branche l'envoi sur ton hÃ©bergeur ou un service de formulaires.", true);
                return;
            }

            const response = await fetch(window.location.pathname || '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: encode(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            form.reset();
            showFeedback('Demande envoyÃ©e. On te recontacte rapidement.', true);
        } catch (error) {
            console.error('Erreur formulaire:', error);
            showFeedback("L'envoi a Ã©chouÃ©. Si ton site est statique, branche Netlify Forms, Formspree ou un backend.", false);
        } finally {
            setPendingState(false);
        }
    }

    function bindFocusStates() {
        document.querySelectorAll('#email, #password, #signup-email, #signup-name, #signup-message').forEach((input) => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#3B6DF6';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = '#D1D5DB';
            });
        });
    }

    function bindInteractions() {
        const modal = getModal();
        const form = getForm();

        document.querySelectorAll('[data-open-signup], [data-open-login]').forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openSignupModal();
            });
        });

        document.querySelectorAll('[data-close-signup], [data-close-login]').forEach((trigger) => {
            trigger.addEventListener('click', () => {
                closeSignupModal();
            });
        });

        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeSignupModal();
                }
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal && modal.style.display === 'flex') {
                closeSignupModal();
            }
        });

        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        transformModalContent();
        bindFocusStates();
        bindInteractions();
    });
})();
