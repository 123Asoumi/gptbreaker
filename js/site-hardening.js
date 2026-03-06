(function () {
    const DEVTOOLS_WIDTH_THRESHOLD = 160;
    const DEVTOOLS_HEIGHT_THRESHOLD = 160;
    const DEBUGGER_DELAY_THRESHOLD = 120;
    const SHIELD_ID = 'security-shield';
    let shieldVisible = false;

    function ensureShield() {
        let shield = document.getElementById(SHIELD_ID);
        if (shield) {
            return shield;
        }

        shield = document.createElement('div');
        shield.id = SHIELD_ID;
        shield.setAttribute('aria-live', 'polite');
        shield.innerHTML = '<div class="security-shield__panel"><strong>Contenu protege</strong><p>L inspection du site est desactivee sur cette version.</p></div>';
        document.body.appendChild(shield);
        return shield;
    }

    function lockInterface() {
        if (!document.body || shieldVisible) {
            return;
        }

        document.body.setAttribute('data-devtools-locked', 'true');
        ensureShield();
        shieldVisible = true;
    }

    function unlockInterface() {
        if (!document.body || !shieldVisible) {
            return;
        }

        document.body.removeAttribute('data-devtools-locked');
        const shield = document.getElementById(SHIELD_ID);
        if (shield) {
            shield.remove();
        }
        shieldVisible = false;
    }

    function looksLikeDevtoolsOpen() {
        const widthGap = window.outerWidth - window.innerWidth;
        const heightGap = window.outerHeight - window.innerHeight;
        return widthGap > DEVTOOLS_WIDTH_THRESHOLD || heightGap > DEVTOOLS_HEIGHT_THRESHOLD;
    }

    function debuggerProbe() {
        const start = Date.now();
        debugger;
        return Date.now() - start > DEBUGGER_DELAY_THRESHOLD;
    }

    function evaluateDevtoolsState() {
        if (looksLikeDevtoolsOpen() || debuggerProbe()) {
            lockInterface();
            return;
        }

        unlockInterface();
    }

    function blockShortcuts(event) {
        const key = event.key.toLowerCase();
        const ctrlOrMeta = event.ctrlKey || event.metaKey;

        if (
            key === 'f12' ||
            (ctrlOrMeta && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
            (ctrlOrMeta && ['u', 's'].includes(key))
        ) {
            event.preventDefault();
            event.stopPropagation();
            lockInterface();
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        document.addEventListener('keydown', blockShortcuts, true);
        document.addEventListener('copy', function (event) {
            event.preventDefault();
        });

        window.setInterval(evaluateDevtoolsState, 1000);
        evaluateDevtoolsState();
    });
})();
