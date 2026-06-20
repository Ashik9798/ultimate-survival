/**
 * ULTIMATE SURVIVAL — Realistic Sprite Edition
 * Mobile-optimized HTML5 survival game with image-based sprites.
 */
(function() {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const ui = {
        menu: document.getElementById('menu'),
        howTo: document.getElementById('how-to'),
        levelIntro: document.getElementById('level-intro'),
        result: document.getElementById('result'),
        hud: document.getElementById('hud'),
        controls: document.getElementById('controls'),
        health: document.getElementById('health'),
        timer: document.getElementById('timer'),
        level: document.getElementById('level'),
        kills: document.getElementById('kills'),
        progress: document.getElementById('progress-fill'),
        waveWarning: document.getElementById('wave-warning'),
        introTitle: document.getElementById('intro-title'),
        introDesc: document.getElementById('intro-desc'),
        introDiff: document.getElementById('intro-diff'),
        introTime: document.getElementById('intro-time'),
        resultTitle: document.getElementById('result-title'),
        resultMsg: document.getElementById('result-msg'),
        resLevel: document.getElementById('res-level'),
        resKills: document.getElementById('res-kills'),
        resTime: document.getElementById('res-time'),
        btnStart: document.getElementById('btn-start'),
        btnContinue: document.getElementById('btn-continue'),
        btnHow: document.getElementById('btn-how'),
        btnBack: document.getElementById('btn-back'),
        btnBegin: document.getElementById('btn-begin'),
        btnRetry: document.getElementById('btn-retry'),
        btnMenu: document.getElementById('btn-menu')
    };

    const GAME = {
        width: 720, height: 1280, fps: 60,
        state: 'menu', currentLevel: 1, maxUnlockedLevel: 1,
        kills: 0, totalKills: 0, survivalTime: 0, lastFrame: 0,
        shake: 0, slowMotion: 0, screenFlash: 0
    };

    // Image asset loader
    const SPRITES = {};
    const spriteSources = {
        player: 'assets/images/player.png',
        walker: 'assets/images/enemy_walker.png',
        runner: 'assets/images/enemy_runner.png',
        tank: 'assets/images/enemy_tank.png',
        shooter: 'assets/images/enemy_shooter.png',
        invisible: 'assets/images/enemy_invisible.png',
        exploder: 'assets/images/enemy_exploder.png',
        blackhole: 'assets/images/enemy_blackhole.png',
        boss: 'assets/images/boss_butcher.png'
    };

    let spritesLoaded = false;
    let pendingSprites = 0;

    function loadSprites() {
        if (spritesLoaded) return Promise.resolve();
        return new Promise((resolve) => {
            let loaded = 0;
            const total = Object.keys(spriteSources).length;
            for (const [key, src] of Object.entries(spriteSources)) {
                const img = new Image();
                img.onload = () => {
                    loaded++;
                    if (loaded === total) {
                        spritesLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    loaded++;
                    if (loaded === total) {
                        spritesLoaded = true;
                        resolve();
                    }
                };
                img.src = src;
                SPRITES[key] = img;
            }
        });
    }

    // Audio context
    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
        }
    }

    // Better sound synthesis
    function createNoiseBuffer(duration) {
        if (!audioCtx) return null;
        const rate = audioCtx.sampleRate;
        const length = rate * duration;
        const buffer = audioCtx.createBuffer(1, length, rate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / length);
        }
        return buffer;
    }

    function playSound(type) {
        if (!audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            if (type === 'shoot') {
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc1.connect(gain); osc2.connect(gain);
                gain.connect(audioCtx.destination);
                osc1.type = 'sawtooth'; osc2.type = 'square';
                osc1.frequency.setValueAtTime(880, now);
                osc1.frequency.exponentialRampToValueAtTime(110, now + 0.12);
                osc2.frequency.setValueAtTime(440, now);
                osc2.frequency.exponentialRampToValueAtTime(55, now + 0.12);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc1.start(now); osc1.stop(now + 0.12);
                osc2.start(now); osc2.stop(now + 0.12);
            } else if (type === 'hit') {
                const noise = audioCtx.createBufferSource();
                noise.buffer = createNoiseBuffer(0.18);
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass'; filter.frequency.setValueAtTime(600, now);
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                noise.start(now); noise.stop(now + 0.18);
            } else if (type === 'explosion') {
                const noise = audioCtx.createBufferSource();
                noise.buffer = createNoiseBuffer(0.4);
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, now);
                filter.frequency.exponentialRampToValueAtTime(80, now + 0.4);
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                noise.start(now); noise.stop(now + 0.4);
            } else if (type === 'level') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.setValueAtTime(330, now + 0.15);
                osc.frequency.setValueAtTime(440, now + 0.3);
                osc.frequency.setValueAtTime(550, now + 0.45);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                osc.start(now); osc.stop(now + 0.8);
            } else if (type === 'boss') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 1.5);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                osc.start(now); osc.stop(now + 1.5);
            }
        } catch(e) {}
    }

    // Input / Joystick
    const input = {
        moveX: 0, moveY: 0, shooting: false,
        shootDirX: 0, shootDirY: -1,
        joystick: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0, maxR: 50 }
    };

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        GAME.width = window.innerWidth;
        GAME.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Joystick setup
    const joyZone = document.getElementById('joystick-zone');
    const joyKnob = document.getElementById('joystick-knob');

    function getTouchPos(t) { return { x: t.clientX, y: t.clientY }; }
    function startJoystick(e) {
        e.preventDefault();
        const t = e.changedTouches[0];
        const rect = joyZone.getBoundingClientRect();
        input.joystick.active = true;
        input.joystick.id = t.identifier;
        input.joystick.baseX = rect.left + rect.width / 2;
        input.joystick.baseY = rect.top + rect.height / 2;
        updateJoystick(t);
    }
    function moveJoystick(e) {
        if (!input.joystick.active) return;
        for (let t of e.changedTouches) {
            if (t.identifier === input.joystick.id) { updateJoystick(t); break; }
        }
    }
    function endJoystick(e) {
        for (let t of e.changedTouches) {
            if (t.identifier === input.joystick.id) {
                input.joystick.active = false;
                input.joystick.dx = 0; input.joystick.dy = 0;
                input.moveX = 0; input.moveY = 0;
                joyKnob.style.transform = 'translate(0px, 0px)';
                break;
            }
        }
    }
    function updateJoystick(t) {
        const pos = getTouchPos(t);
        let dx = pos.x - input.joystick.baseX;
        let dy = pos.y - input.joystick.baseY;
        const dist = Math.hypot(dx, dy);
        const maxR = input.joystick.maxR;
        if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
        input.joystick.dx = dx; input.joystick.dy = dy;
        input.moveX = dx / maxR; input.moveY = dy / maxR;
        joyKnob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    }
    joyZone.addEventListener('touchstart', startJoystick, { passive: false });
    joyZone.addEventListener('touchmove', moveJoystick, { passive: false });
    joyZone.addEventListener('touchend', endJoystick);
    joyZone.addEventListener('touchcancel', endJoystick);

    // Action buttons
    const btnShoot = document.getElementById('btn-shoot');
    const btnBomb = document.getElementById('btn-bomb');
    btnShoot.addEventListener('touchstart', (e) => { e.preventDefault(); input.shooting = true; }, { passive: false });
    btnShoot.addEventListener('touchend', (e) => { e.preventDefault(); input.shooting = false; });
    btnShoot.addEventListener('mousedown', (e) => { e.preventDefault(); input.shooting = true; });
    btnShoot.addEventListener('mouseup', (e) => { e.preventDefault(); input.shooting = false; });
    btnBomb.addEventListener('touchstart', (e) => { e.preventDefault(); useBomb(); }, { passive: false });
    btnBomb.addEventListener('mousedown', (e) => { e.preventDefault(); useBomb(); });

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    const keys = {};
    window.addEventListener('keydown', (e) => { keys[e.key] = true; if (e.code === 'Space') input.shooting = true; if (e.key === 'b' || e.key === 'B') useBomb(); });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; if (e.code === 'Space') input.shooting = false; });

    // Entities
    let player = null, enemies = [], bullets = [], particles = [], powerups = [], hazards = [], boss = null, levelData = null;
    let spawnTimer = 0, levelTimer = 0, lastTime = 0, combo = 0, comboTimer = 0;

    function createPlayer() {
        return { x: GAME.width / 2, y: GAME.height / 2, radius: 24, speed: 5.5, health: 100, maxHealth: 100,
            fireRate: 180, lastShot: 0, invincible: 0, bombs: 1, weaponLevel: 1, color: '#00e5ff', angle: -Math.PI/2 };
    }

    function spawnEnemy(typeOverride) {
        const lvl = levelData;
        const side = Math.floor(Math.random() * 4);
        let x, y; const pad = 70;
        if (side === 0) { x = Math.random() * GAME.width; y = -pad; }
        else if (side === 1) { x = GAME.width + pad; y = Math.random() * GAME.height; }
        else if (side === 2) { x = Math.random() * GAME.width; y = GAME.height + pad; }
        else { x = -pad; y = Math.random() * GAME.height; }

        const type = typeOverride || lvl.enemyTypes[Math.floor(Math.random() * lvl.enemyTypes.length)];
        const speed = lvl.enemySpeed * (type === 'runner' ? 1.5 : type === 'tank' ? 0.6 : type === 'blackhole' ? 0.8 : 1);
        const health = lvl.enemyHealth * (type === 'tank' ? 3 : type === 'runner' ? 0.6 : type === 'blackhole' ? 5 : 1);
        const damage = lvl.enemyDamage * (type === 'tank' ? 1.5 : type === 'blackhole' ? 2 : 1);
        const radius = type === 'tank' ? 32 : type === 'runner' ? 16 : type === 'blackhole' ? 28 : 22;
        const scale = radius / 60; // approximate sprite size

        enemies.push({
            x, y, type, radius, speed, health, maxHealth: health, damage,
            lastAttack: 0, attackRate: type === 'shooter' ? 1400 : 1000,
            alpha: type === 'invisible' ? 0.45 : 1, pulse: 0, freeze: 0,
            explodeTimer: type === 'exploder' ? 2500 : 0, scale,
            points: Math.floor(10 * lvl.difficulty),
            angle: 0
        });
    }

    function spawnBoss() {
        if (!levelData.boss) return;
        const b = levelData.boss;
        boss = {
            x: GAME.width / 2, y: -100, type: b.type, radius: 65,
            speed: b.speed, health: b.health, maxHealth: b.health,
            damage: b.damage, lastAttack: 0, attackRate: 800, phase: 0,
            points: 1000, scale: 65 / 60, regen: b.regen || 0,
            angle: 0
        };
        GAME.shake = 25; GAME.screenFlash = 0.6;
        showWarning('⚠️ BOSS APPROACHING ⚠️');
        playSound('boss');
    }

    function spawnPowerup(x, y) {
        if (!levelData.powerups) return;
        const kinds = ['health', 'bomb', 'speed', 'rapid'];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        powerups.push({ x, y, kind, radius: 16, life: 6000, born: performance.now() });
    }

    function createBullet(x, y, angle, speed, damage, isEnemy, color) {
        bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            radius: 5, damage, isEnemy, color, life: 2000, born: performance.now() });
    }

    function createParticle(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const sp = Math.random() * speed;
            particles.push({ x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp,
                life: 0.5 + Math.random() * 0.6, color, radius: 2 + Math.random() * 5 });
        }
    }

    function createHazard(kind) {
        if (kind === 'poison') {
            hazards.push({ x: Math.random() * GAME.width, y: Math.random() * GAME.height,
                radius: 70 + Math.random() * 70, kind, life: 7000, damage: 3 });
        } else if (kind === 'ice') {
            hazards.push({ x: Math.random() * GAME.width, y: Math.random() * GAME.height,
                radius: 80 + Math.random() * 80, kind, life: 6000, damage: 0 });
        } else if (kind === 'fire' || kind === 'hellfire') {
            hazards.push({ x: Math.random() * GAME.width, y: Math.random() * GAME.height,
                radius: 60 + Math.random() * 60, kind, life: 5000, damage: kind === 'hellfire' ? 12 : 5 });
        }
    }

    function showWarning(text) {
        ui.waveWarning.textContent = text;
        ui.waveWarning.classList.add('pulse');
        setTimeout(() => { ui.waveWarning.textContent = ''; ui.waveWarning.classList.remove('pulse'); }, 2500);
    }

    function useBomb() {
        if (!player || player.bombs <= 0 || GAME.state !== 'playing') return;
        player.bombs--;
        playSound('explosion');
        GAME.shake = 18; GAME.screenFlash = 0.4;
        const blastRadius = 280;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            const dist = Math.hypot(e.x - player.x, e.y - player.y);
            if (dist < blastRadius) {
                createParticle(e.x, e.y, e.color || '#ff5722', 14, 7);
                GAME.kills++; GAME.totalKills++;
                enemies.splice(i, 1);
            }
        }
        if (boss) {
            const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
            if (dist < blastRadius) { boss.health -= 60; createParticle(boss.x, boss.y, '#ff0000', 24, 9); }
        }
        bullets = [];
    }

    function resetLevel() {
        player = createPlayer();
        enemies = []; bullets = []; particles = []; powerups = []; hazards = []; boss = null;
        spawnTimer = 0; levelTimer = 0; GAME.kills = 0; GAME.survivalTime = 0;
        combo = 0; comboTimer = 0;
        input.moveX = 0; input.moveY = 0; input.joystick.active = false;
    }

    function startLevel(levelId) {
        const lvl = GAME_LEVELS.get(levelId);
        if (!lvl) return;
        levelData = lvl; GAME.currentLevel = levelId; GAME.state = 'intro';
        ui.introTitle.textContent = 'LEVEL ' + lvl.id + ': ' + lvl.name;
        ui.introDesc.textContent = lvl.desc;
        ui.introDiff.textContent = lvl.stars;
        ui.introTime.textContent = lvl.time;
        showScreen('level-intro');
        playSound('level');
    }

    function beginLevel() {
        resetLevel();
        GAME.state = 'playing';
        showScreen(null);
        ui.hud.classList.remove('hidden');
        ui.controls.classList.remove('hidden');
        lastTime = performance.now();
        showWarning('LEVEL ' + GAME.currentLevel + ' START');
        if (levelData.boss) {
            setTimeout(spawnBoss, Math.max(levelData.time * 500, 4000));
        }
    }

    function levelComplete() {
        GAME.state = 'result';
        if (GAME.currentLevel >= GAME.maxUnlockedLevel) {
            GAME.maxUnlockedLevel = Math.min(GAME.currentLevel + 1, GAME_LEVELS.count);
        }
        saveProgress();
        ui.resultTitle.textContent = 'LEVEL COMPLETE!';
        ui.resultMsg.textContent = 'You survived Level ' + GAME.currentLevel + '!';
        ui.resLevel.textContent = GAME.currentLevel;
        ui.resKills.textContent = GAME.kills;
        ui.resTime.textContent = Math.floor(GAME.survivalTime / 1000);
        ui.btnRetry.textContent = GAME.currentLevel < GAME_LEVELS.count ? 'NEXT LEVEL' : 'REPLAY HELL';
        showScreen('result');
        ui.hud.classList.add('hidden');
        ui.controls.classList.add('hidden');
    }

    function gameOver(reason) {
        GAME.state = 'result';
        saveProgress();
        ui.resultTitle.textContent = 'GAME OVER';
        ui.resultMsg.textContent = reason || 'You were consumed...';
        ui.resLevel.textContent = GAME.currentLevel;
        ui.resKills.textContent = GAME.kills;
        ui.resTime.textContent = Math.floor(GAME.survivalTime / 1000);
        ui.btnRetry.textContent = 'RETRY LEVEL';
        showScreen('result');
        ui.hud.classList.add('hidden');
        ui.controls.classList.add('hidden');
    }

    function showScreen(id) {
        ['menu', 'how-to', 'level-intro', 'result'].forEach(s => document.getElementById(s).classList.add('hidden'));
        if (id) document.getElementById(id).classList.remove('hidden');
    }

    function saveProgress() {
        if (window.__SEC) window.__SEC.save({ maxLevel: GAME.maxUnlockedLevel, totalKills: GAME.totalKills, version: '1.0.0-secured' });
        if (GAME.maxUnlockedLevel > 1) ui.btnContinue.classList.remove('hidden');
    }
    function loadProgress() {
        if (window.__SEC) {
            const data = window.__SEC.load();
            if (data) {
                GAME.maxUnlockedLevel = Math.min(data.maxLevel || 1, GAME_LEVELS.count);
                GAME.totalKills = data.totalKills || 0;
            }
        }
        if (GAME.maxUnlockedLevel > 1) ui.btnContinue.classList.remove('hidden');
    }

    function update(dt) {
        if (GAME.state !== 'playing') return;
        const now = performance.now();
        const timeScale = GAME.slowMotion > 0 ? 0.35 : 1;
        const scaledDt = dt * timeScale;

        if (GAME.shake > 0) GAME.shake -= dt * 0.05; if (GAME.shake < 0) GAME.shake = 0;
        if (GAME.slowMotion > 0) GAME.slowMotion -= dt;
        if (GAME.screenFlash > 0) GAME.screenFlash -= dt * 0.8;

        GAME.survivalTime += dt; levelTimer += dt;
        const seconds = GAME.survivalTime / 1000;

        // Level 10 impossible mechanics
        if (levelData.impossible) {
            // Constant health drain after 8 seconds
            if (seconds > 8) player.health -= 0.35 * (dt / 16);
            // Hell storm after 65 seconds
            if (seconds > 65) player.health -= 0.8 * (dt / 16);
            // Black holes spawn constantly
            if (levelTimer > 3000 && Math.random() < 0.02) {
                spawnEnemy('blackhole');
            }
            // Regenerating boss if alive
            if (boss && boss.regen) {
                boss.health = Math.min(boss.maxHealth, boss.health + boss.regen * (dt / 1000));
            }
        }

        // Keyboard movement
        if (!input.joystick.active) {
            input.moveX = (keys['ArrowRight'] || keys['d'] || keys['D'] ? 1 : 0) - (keys['ArrowLeft'] || keys['a'] || keys['A'] ? 1 : 0);
            input.moveY = (keys['ArrowDown'] || keys['s'] || keys['S'] ? 1 : 0) - (keys['ArrowUp'] || keys['w'] || keys['W'] ? 1 : 0);
            if (input.moveX !== 0 || input.moveY !== 0) { const len = Math.hypot(input.moveX, input.moveY); input.moveX /= len; input.moveY /= len; }
        }

        // Player update
        let moveSpeed = player.speed;
        if (levelData.hazard === 'ice') moveSpeed *= 0.55;
        if (player.invincible > 0) player.invincible -= dt;
        player.x += input.moveX * moveSpeed * (scaledDt / 16);
        player.y += input.moveY * moveSpeed * (scaledDt / 16);
        player.x = Math.max(player.radius, Math.min(GAME.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(GAME.height - player.radius, player.y));

        if (input.moveX !== 0 || input.moveY !== 0) {
            player.angle = Math.atan2(input.moveY, input.moveX);
            input.shootDirX = input.moveX; input.shootDirY = input.moveY;
        } else if (!input.joystick.active) {
            const dx = mouseX - player.x, dy = mouseY - player.y, len = Math.hypot(dx, dy);
            if (len > 0) { player.angle = Math.atan2(dy, dx); input.shootDirX = dx / len; input.shootDirY = dy / len; }
        } else {
            player.angle = Math.atan2(input.shootDirY, input.shootDirX);
        }

        // Auto fire
        if (now - player.lastShot > player.fireRate) {
            player.lastShot = now;
            const baseAngle = Math.atan2(input.shootDirY, input.shootDirX);
            if (player.weaponLevel === 1) {
                createBullet(player.x, player.y, baseAngle, 11, 30, false, '#ffeb3b');
            } else if (player.weaponLevel === 2) {
                createBullet(player.x, player.y, baseAngle - 0.12, 11, 24, false, '#ffeb3b');
                createBullet(player.x, player.y, baseAngle + 0.12, 11, 24, false, '#ffeb3b');
            } else {
                createBullet(player.x, player.y, baseAngle, 11, 22, false, '#ffeb3b');
                createBullet(player.x, player.y, baseAngle - 0.25, 11, 22, false, '#ffeb3b');
                createBullet(player.x, player.y, baseAngle + 0.25, 11, 22, false, '#ffeb3b');
            }
            playSound('shoot');
        }

        // Spawn enemies
        const adjustedSpawnRate = levelData.impossible ? Math.max(120, levelData.spawnRate / 2) : levelData.spawnRate;
        spawnTimer += dt;
        if (enemies.length < levelData.maxEnemies && spawnTimer > adjustedSpawnRate) {
            spawnTimer = 0; spawnEnemy();
        }
        if (levelData.hazard && levelTimer > 2000 && Math.random() < 0.012) createHazard(levelData.hazard);

        // Hazards
        for (let i = hazards.length - 1; i >= 0; i--) {
            const h = hazards[i]; h.life -= dt;
            if (h.life <= 0) hazards.splice(i, 1);
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.freeze > 0) e.freeze -= dt;
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.angle = angle;
            let es = e.speed;
            if (e.freeze > 0) es *= 0.5;

            // Blackhole pull effect
            if (e.type === 'blackhole') {
                const dist = Math.hypot(player.x - e.x, player.y - e.y);
                if (dist < 250) {
                    player.x += (e.x - player.x) / dist * 2 * (dt / 16);
                    player.y += (e.y - player.y) / dist * 2 * (dt / 16);
                }
                e.pulse += dt * 0.003;
            } else {
                e.x += Math.cos(angle) * es * (scaledDt / 16);
                e.y += Math.sin(angle) * es * (scaledDt / 16);
                e.pulse += dt * 0.01;
            }

            if (e.type === 'shooter' && now - e.lastAttack > e.attackRate) {
                e.lastAttack = now;
                createBullet(e.x, e.y, angle, 6, e.damage, true, '#ff4081');
            }

            if (e.type === 'exploder') {
                e.explodeTimer -= dt;
                if (e.explodeTimer <= 0) {
                    const dist = Math.hypot(e.x - player.x, e.y - player.y);
                    if (dist < 90) player.health -= e.damage * 2.5;
                    createParticle(e.x, e.y, '#ff1744', 22, 9);
                    playSound('explosion');
                    enemies.splice(i, 1); continue;
                }
            }

            const dist = Math.hypot(e.x - player.x, e.y - player.y);
            if (dist < e.radius + player.radius && player.invincible <= 0) {
                player.health -= e.damage;
                player.invincible = 600;
                createParticle(player.x, player.y, '#ff0000', 8, 5);
                playSound('hit');
                GAME.shake = 12;
                if (e.type !== 'tank') { e.x -= Math.cos(angle) * 20; e.y -= Math.sin(angle) * 20; }
            }
        }

        // Boss
        if (boss) {
            boss.phase += dt * 0.0025;
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            boss.angle = angle;
            boss.x += Math.cos(angle) * boss.speed * (scaledDt / 16);
            boss.y += Math.sin(angle) * boss.speed * (scaledDt / 16);
            if (now - boss.lastAttack > boss.attackRate) {
                boss.lastAttack = now;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
                    createBullet(boss.x, boss.y, a + boss.phase, 5.5, boss.damage, true, '#ff0000');
                }
                createBullet(boss.x, boss.y, angle, 7.5, boss.damage, true, '#ff0000');
            }
            const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
            if (dist < boss.radius + player.radius && player.invincible <= 0) {
                player.health -= boss.damage;
                player.invincible = 900;
                createParticle(player.x, player.y, '#ff0000', 14, 7);
                playSound('hit');
                GAME.shake = 18;
            }
            if (boss.health <= 0) {
                createParticle(boss.x, boss.y, '#ff0000', 60, 14);
                boss = null; GAME.totalKills += 5; playSound('explosion');
                if (levelData.impossible) showWarning('THE HELL KING RETURNS...');
            }
            // Hell King respawns at level 10
            if (levelData.impossible && !boss && Math.random() < 0.002) spawnBoss();
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x += b.vx * (scaledDt / 16); b.y += b.vy * (scaledDt / 16);
            if (b.x < 0 || b.x > GAME.width || b.y < 0 || b.y > GAME.height || now - b.born > b.life) {
                bullets.splice(i, 1); continue;
            }
            if (!b.isEnemy) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    const dist = Math.hypot(b.x - e.x, b.y - e.y);
                    if (dist < e.radius + b.radius) {
                        e.health -= b.damage;
                        createParticle(b.x, b.y, e.color || '#ff5722', 4, 3);
                        bullets.splice(i, 1);
                        if (e.health <= 0) {
                            createParticle(e.x, e.y, e.color || '#ff5722', 12, 6);
                            if (Math.random() < 0.12) spawnPowerup(e.x, e.y);
                            GAME.kills++; GAME.totalKills++; enemies.splice(j, 1); combo++; comboTimer = 2000;
                        }
                        break;
                    }
                }
                if (boss && bullets[i]) {
                    const dist = Math.hypot(b.x - boss.x, b.y - boss.y);
                    if (dist < boss.radius + b.radius) {
                        boss.health -= b.damage;
                        createParticle(b.x, b.y, '#ff0000', 6, 4);
                        bullets.splice(i, 1);
                    }
                }
            } else {
                const dist = Math.hypot(b.x - player.x, b.y - player.y);
                if (dist < player.radius + b.radius && player.invincible <= 0) {
                    player.health -= b.damage;
                    player.invincible = 500;
                    createParticle(player.x, player.y, '#ff0000', 6, 4);
                    playSound('hit'); GAME.shake = 10;
                    bullets.splice(i, 1);
                }
            }
        }

        // Hazard damage
        for (let h of hazards) {
            const dist = Math.hypot(h.x - player.x, h.y - player.y);
            if (dist < h.radius + player.radius && h.damage > 0 && player.invincible <= 0) {
                player.health -= h.damage * (dt / 250);
                player.invincible = 200;
                createParticle(player.x, player.y, '#00ff00', 2, 2);
            }
        }

        // Powerups
        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            if (now - p.born > p.life) { powerups.splice(i, 1); continue; }
            const dist = Math.hypot(p.x - player.x, p.y - player.y);
            if (dist < p.radius + player.radius) {
                if (p.kind === 'health') player.health = Math.min(player.maxHealth, player.health + 35);
                if (p.kind === 'bomb') player.bombs++;
                if (p.kind === 'speed') { player.speed += 2.5; setTimeout(() => player.speed -= 2.5, 5000); }
                if (p.kind === 'rapid') { player.fireRate = 70; setTimeout(() => player.fireRate = 180, 5000); }
                createParticle(p.x, p.y, '#fff', 8, 4);
                powerups.splice(i, 1);
            }
        }

        if (comboTimer > 0) comboTimer -= dt; else combo = 0;

        if (player.health <= 0) { gameOver('You ran out of health!'); return; }
        if (seconds >= levelData.time) { levelComplete(); return; }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * (scaledDt / 16); p.y += p.vy * (scaledDt / 16);
            p.life -= dt / 1000;
            if (p.life <= 0) particles.splice(i, 1);
        }

        ui.health.textContent = Math.max(0, Math.ceil(player.health));
        ui.timer.textContent = Math.max(0, Math.ceil(levelData.time - seconds));
        ui.level.textContent = GAME.currentLevel;
        ui.kills.textContent = GAME.kills;
        ui.progress.style.width = Math.min(100, (GAME.survivalTime / (levelData.time * 1000)) * 100) + '%';

        if (window.__SEC && Math.floor(levelTimer / 1000) % 10 === 0 && levelTimer % 1000 < dt) window.__SEC.check();
    }

    // Drawing helpers
    function drawSprite(ctx, img, x, y, radius, angle, alpha, scale) {
        if (!img || !img.complete || img.naturalWidth === 0) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.globalAlpha = alpha || 1;
        const s = (scale || 1) * (radius * 2.5) / Math.max(img.width, img.height);
        const w = img.width * s;
        const h = img.height * s;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    function draw() {
        ctx.save();
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, GAME.width, GAME.height);

        if (GAME.shake > 0) ctx.translate((Math.random() - 0.5) * GAME.shake, (Math.random() - 0.5) * GAME.shake);
        if (GAME.screenFlash > 0) {
            ctx.fillStyle = 'rgba(255, 30, 0, ' + Math.min(0.5, GAME.screenFlash) + ')';
            ctx.fillRect(0, 0, GAME.width, GAME.height);
        }

        // Background grid with hell tint for level 10
        const isHell = levelData && levelData.impossible;
        ctx.strokeStyle = isHell ? 'rgba(255, 20, 0, 0.08)' : 'rgba(255, 60, 0, 0.06)';
        ctx.lineWidth = 1;
        const grid = 60;
        for (let x = 0; x <= GAME.width; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME.height); ctx.stroke(); }
        for (let y = 0; y <= GAME.height; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GAME.width, y); ctx.stroke(); }

        // Vignette
        const grad = ctx.createRadialGradient(GAME.width/2, GAME.height/2, GAME.width * 0.2, GAME.width/2, GAME.height/2, GAME.width * 0.8);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, isHell ? 'rgba(80,0,0,0.5)' : 'rgba(0,0,0,0.5)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, GAME.width, GAME.height);

        // Hazards
        for (let h of hazards) {
            ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            if (h.kind === 'poison') ctx.fillStyle = 'rgba(0, 255, 0, 0.18)';
            else if (h.kind === 'ice') ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
            else if (h.kind === 'fire') ctx.fillStyle = 'rgba(255, 100, 0, 0.18)';
            else ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
            ctx.fill();
            ctx.strokeStyle = ctx.fillStyle.replace('0.18', '0.5').replace('0.15', '0.4').replace('0.25', '0.6');
            ctx.stroke();
        }

        // Powerups
        for (let p of powerups) {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.kind === 'health' ? '#00e676' : p.kind === 'bomb' ? '#7c4dff' : p.kind === 'speed' ? '#00b0ff' : '#ffea00';
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(p.kind === 'health' ? '+' : p.kind === 'bomb' ? 'B' : p.kind === 'speed' ? '⚡' : 'R', p.x, p.y);
        }

        // Player
        if (player) {
            ctx.save();
            ctx.translate(player.x, player.y);
            const g = ctx.createRadialGradient(0, 0, 5, 0, 0, player.radius + 18);
            g.addColorStop(0, 'rgba(0, 229, 255, 0.7)'); g.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, player.radius + 18, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            drawSprite(ctx, SPRITES.player, player.x, player.y, player.radius, player.angle, player.invincible > 0 && Math.floor(Date.now() / 100) % 2 ? 0.5 : 1, 1.2);
            // Aim line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(player.x + input.shootDirX * 30, player.y + input.shootDirY * 30); ctx.stroke();
        }

        // Enemies
        for (let e of enemies) {
            const sprite = SPRITES[e.type] || SPRITES.walker;
            drawSprite(ctx, sprite, e.x, e.y, e.radius, e.angle, e.alpha, 1.1);
            // Health bar for tank/blackhole
            if (e.type === 'tank' || e.type === 'blackhole') {
                ctx.fillStyle = '#000'; ctx.fillRect(e.x - 20, e.y - e.radius - 10, 40, 6);
                ctx.fillStyle = '#ff0000'; ctx.fillRect(e.x - 20, e.y - e.radius - 10, 40 * (e.health / e.maxHealth), 6);
            }
        }

        // Boss
        if (boss) {
            drawSprite(ctx, SPRITES.boss, boss.x, boss.y, boss.radius, boss.angle, 1, 1.4);
            ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.radius, boss.y - boss.radius - 18, boss.radius * 2, 12);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(boss.x - boss.radius, boss.y - boss.radius - 18, boss.radius * 2 * (boss.health / boss.maxHealth), 12);
            ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2;
            ctx.strokeRect(boss.x - boss.radius, boss.y - boss.radius - 18, boss.radius * 2, 12);
        }

        // Bullets
        for (let b of bullets) {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
        }

        // Particles
        for (let p of particles) {
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    function loop(timestamp) {
        const dt = timestamp - lastTime; lastTime = timestamp;
        update(dt); draw();
        requestAnimationFrame(loop);
    }

    // UI Listeners
    ui.btnStart.addEventListener('click', () => {
        initAudio();
        loadSprites().then(() => { startLevel(1); });
    });
    ui.btnContinue.addEventListener('click', () => {
        initAudio();
        loadSprites().then(() => { startLevel(GAME.maxUnlockedLevel); });
    });
    ui.btnHow.addEventListener('click', () => showScreen('how-to'));
    ui.btnBack.addEventListener('click', () => showScreen('menu'));
    ui.btnBegin.addEventListener('click', () => beginLevel());
    ui.btnRetry.addEventListener('click', () => {
        if (ui.btnRetry.textContent === 'NEXT LEVEL') startLevel(GAME.currentLevel + 1);
        else startLevel(GAME.currentLevel);
    });
    ui.btnMenu.addEventListener('click', () => {
        showScreen('menu'); ui.hud.classList.add('hidden'); ui.controls.classList.add('hidden'); GAME.state = 'menu';
    });

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U' || e.key === 'i' || e.key === 'I')) e.preventDefault();
        if (e.key === 'F12') e.preventDefault();
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    loadProgress();
    loadSprites();
    showScreen('menu');
    requestAnimationFrame(loop);
})();
