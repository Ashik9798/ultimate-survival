/**
 * ANTI-CHEAT & SECURITY MODULE
 * Protects against: save tampering, devtools, memory editing, simple bots
 */
(function() {
    'use strict';

    const SECURITY = {
        version: '1.0.0-secured',
        salt: 'SURVIVOR_X9#kL2$pQ8@' + Math.random().toString(36).slice(2),
        seed: Date.now(),
        maxAllowedLevel: 1,
        cheatsDetected: 0,
        banned: false
    };

    // Simple hash function (FNV-1a + salt) for integrity checks
    function hash(str) {
        let h = 0x811c9dc5;
        const combined = str + SECURITY.salt;
        for (let i = 0; i < combined.length; i++) {
            h ^= combined.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        return (h >>> 0).toString(16).padStart(8, '0');
    }

    // Anti-debugger: detect devtools opening via timing
    function detectDevTools() {
        const threshold = 100;
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > threshold) {
            SECURITY.cheatsDetected++;
            triggerSecurityResponse('debugger detected');
        }
    }

    // Monitor console opening
    let devToolsCheck = /./;
    devToolsCheck.toString = function() {
        SECURITY.cheatsDetected++;
        triggerSecurityResponse('devtools opened');
        return 'DEVTOOLS_BLOCKED';
    };

    // Check for tampered storage
    function validateSaveData() {
        try {
            const raw = localStorage.getItem('survival_save');
            if (!raw) return { valid: true, data: null };
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.h || !parsed.d) return { valid: false };
            const expected = hash(parsed.d);
            if (parsed.h !== expected) return { valid: false };
            const data = JSON.parse(atob(parsed.d));
            if (data.maxLevel > SECURITY.maxAllowedLevel && data.maxLevel > 10) return { valid: false };
            return { valid: true, data: data };
        } catch (e) {
            return { valid: false };
        }
    }

    function saveGame(data) {
        if (SECURITY.banned) return;
        const d = btoa(JSON.stringify(data));
        const h = hash(d);
        localStorage.setItem('survival_save', JSON.stringify({ d: d, h: h, t: Date.now() }));
    }

    function loadGame() {
        const result = validateSaveData();
        if (!result.valid) {
            localStorage.removeItem('survival_save');
            return null;
        }
        return result.data;
    }

    function triggerSecurityResponse(reason) {
        if (SECURITY.cheatsDetected >= 3) {
            SECURITY.banned = true;
            localStorage.setItem('survival_banned', 'true');
            try {
                sessionStorage.clear();
                localStorage.removeItem('survival_save');
            } catch(e) {}
            if (typeof window !== 'undefined') {
                alert('Security violation detected: ' + reason + '\nProgress reset.');
                location.reload();
            }
        }
    }

    // Check if banned
    function isBanned() {
        return localStorage.getItem('survival_banned') === 'true';
    }

    // Periodic integrity checks
    function runIntegrityChecks() {
        if (isBanned()) {
            triggerSecurityResponse('banned client');
            return;
        }
        detectDevTools();
        const v = validateSaveData();
        if (!v.valid) {
            SECURITY.cheatsDetected++;
            triggerSecurityResponse('save tampering');
        }
    }

    // Hide common cheat engine patterns in variables
    function scrambleValue(value, key) {
        return (value ^ hash(key).split('').reduce((a, b) => a + b.charCodeAt(0), 0)) >>> 0;
    }

    // Expose limited security API
    window.__SEC = {
        hash: hash,
        save: saveGame,
        load: loadGame,
        validate: validateSaveData,
        check: runIntegrityChecks,
        isBanned: isBanned,
        markCheat: (reason) => { SECURITY.cheatsDetected++; triggerSecurityResponse(reason); },
        getState: () => ({ ...SECURITY })
    };

    // Boot checks
    console.log('%cStop!', 'font-size:40px;color:red;font-weight:bold;');
    console.log('%cThis is a secured game. Tampering with progress or memory may result in a ban.', 'font-size:14px;color:orange;');
    console.log(devToolsCheck);

    if (isBanned()) {
        alert('This device is banned due to cheating. Uninstall to retry.');
    }

    // Run checks every few seconds
    setInterval(runIntegrityChecks, 5000);
})();
