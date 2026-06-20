/**
 * LEVEL DEFINITIONS
 * 10 levels of increasing difficulty. Level 10 is mathematically near-impossible.
 */
(function() {
    'use strict';

    const LEVELS = [
        {
            id: 1,
            name: "The Awakening",
            desc: "They are coming. Run.",
            time: 25,
            difficulty: 1,
            stars: "⭐",
            spawnRate: 1800,
            enemySpeed: 1.2,
            enemyHealth: 1,
            enemyDamage: 8,
            maxEnemies: 6,
            enemyTypes: ["walker"],
            boss: false,
            powerups: true
        },
        {
            id: 2,
            name: "Blood Moon",
            desc: "Faster enemies. Faster death.",
            time: 30,
            difficulty: 2,
            stars: "⭐⭐",
            spawnRate: 1500,
            enemySpeed: 1.6,
            enemyHealth: 1.5,
            enemyDamage: 10,
            maxEnemies: 10,
            enemyTypes: ["walker", "runner"],
            boss: false,
            powerups: true
        },
        {
            id: 3,
            name: "Toxic Swamp",
            desc: "Poison clouds slow you down.",
            time: 35,
            difficulty: 3,
            stars: "⭐⭐⭐",
            spawnRate: 1300,
            enemySpeed: 1.8,
            enemyHealth: 2,
            enemyDamage: 12,
            maxEnemies: 14,
            enemyTypes: ["walker", "runner", "tank"],
            boss: false,
            hazard: "poison",
            powerups: true
        },
        {
            id: 4,
            name: "Frozen Wasteland",
            desc: "Ice patches make movement slippery.",
            time: 40,
            difficulty: 4,
            stars: "⭐⭐⭐⭐",
            spawnRate: 1100,
            enemySpeed: 2.0,
            enemyHealth: 2.5,
            enemyDamage: 14,
            maxEnemies: 18,
            enemyTypes: ["runner", "tank", "shooter"],
            boss: false,
            hazard: "ice",
            powerups: true
        },
        {
            id: 5,
            name: "Shadow Realm",
            desc: "Invisible hunters stalk you.",
            time: 45,
            difficulty: 5,
            stars: "⭐⭐⭐⭐⭐",
            spawnRate: 950,
            enemySpeed: 2.2,
            enemyHealth: 3,
            enemyDamage: 16,
            maxEnemies: 22,
            enemyTypes: ["runner", "shooter", "invisible"],
            boss: false,
            hazard: "darkness",
            powerups: true
        },
        {
            id: 6,
            name: "Demon Horde",
            desc: "Hordes surround you from all sides.",
            time: 50,
            difficulty: 6,
            stars: "⭐⭐⭐⭐⭐⭐",
            spawnRate: 800,
            enemySpeed: 2.4,
            enemyHealth: 3.5,
            enemyDamage: 18,
            maxEnemies: 30,
            enemyTypes: ["walker", "runner", "tank", "shooter"],
            boss: false,
            hazard: "fire",
            powerups: true
        },
        {
            id: 7,
            name: "Boss Arrival",
            desc: "The Butcher has entered the arena.",
            time: 55,
            difficulty: 7,
            stars: "⭐⭐⭐⭐⭐⭐⭐",
            spawnRate: 750,
            enemySpeed: 2.6,
            enemyHealth: 4,
            enemyDamage: 20,
            maxEnemies: 28,
            enemyTypes: ["runner", "tank", "shooter"],
            boss: { type: "butcher", health: 150, speed: 1.8, damage: 25 },
            powerups: true
        },
        {
            id: 8,
            name: "Endless Nightmare",
            desc: "Survival is no longer expected.",
            time: 60,
            difficulty: 8,
            stars: "⭐⭐⭐⭐⭐⭐⭐⭐",
            spawnRate: 600,
            enemySpeed: 2.8,
            enemyHealth: 5,
            enemyDamage: 22,
            maxEnemies: 40,
            enemyTypes: ["runner", "tank", "shooter", "invisible"],
            boss: { type: "nightmare", health: 250, speed: 2.2, damage: 30 },
            hazard: "darkness",
            powerups: true
        },
        {
            id: 9,
            name: "The Gauntlet",
            desc: "Too hard. Too fast. Too many.",
            time: 65,
            difficulty: 9,
            stars: "⭐⭐⭐⭐⭐⭐⭐⭐⭐",
            spawnRate: 450,
            enemySpeed: 3.2,
            enemyHealth: 6,
            enemyDamage: 25,
            maxEnemies: 55,
            enemyTypes: ["runner", "tank", "shooter", "invisible", "exploder"],
            boss: { type: "deathlord", health: 400, speed: 2.5, damage: 35 },
            hazard: "fire",
            powerups: false
        },
        {
            id: 10,
            name: "HELL ITSELF",
            desc: "NO ONE HAS EVER COMPLETED THIS. NO ONE EVER WILL.",
            time: 90,
            difficulty: 10,
            stars: "💀💀💀💀💀💀💀💀💀💀",
            spawnRate: 220,
            enemySpeed: 5.5,
            enemyHealth: 15,
            enemyDamage: 45,
            maxEnemies: 120,
            enemyTypes: ["runner", "tank", "shooter", "invisible", "exploder", "blackhole"],
            boss: { type: "hellking", health: 9999, speed: 4.0, damage: 65, regen: 80 },
            hazard: "hellfire",
            powerups: false,
            impossible: true
        }
    ];

    // Compute a checksum for each level to detect modification
    function generateLevelChecksums() {
        const checksums = {};
        LEVELS.forEach(l => {
            const str = JSON.stringify(l);
            checksums[l.id] = window.__SEC ? window.__SEC.hash(str) : '0';
        });
        return checksums;
    }

    function validateLevel(id) {
        if (!window.__SEC) return false;
        const level = LEVELS.find(l => l.id === id);
        if (!level) return false;
        return true;
    }

    window.GAME_LEVELS = {
        list: LEVELS,
        get: (id) => LEVELS[id - 1] || null,
        checksums: generateLevelChecksums,
        validate: validateLevel,
        count: LEVELS.length
    };
})();
