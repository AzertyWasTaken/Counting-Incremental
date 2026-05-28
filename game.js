"use strict";
let canClick = true;

let countCooldownEnd = 0;
let countCooldownInterval = null;

const RESET_REQUIREMENT = 500;

const UPGRADES = [
    {
        name: "successor",
        text: "Successor",
        cost: (i) =>
            [5, 10, 30, 75, 200][i % 5] * 100**Math.floor(i / 5),
        max: 10,
        currency: "score",
        description:
            "Increase base count multiplier by 1.",
    },
    {
        name: "autoCount",
        text: "Auto Count",
        cost: [20, 50, 150, 500, 2000],
        max: 5,
        currency: "score",
        description:
            "Increase score by 1 every 2s.",
    },
    {
        name: "fastCounting",
        text: "Fast Counting",
        cost: [100, 1000, 1000000],
        max: 3,
        currency: "score",
        description:
            "Decrease count cooldown by 0.25 seconds.",
    },
    {
        name: "addition",
        text: "Addition",
        cost: [150, 750, 4000, 20000, 100000],
        max: 5,
        currency: "score",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "multiplication",
        text: "Multiplication",
        cost: 20000,
        max: 1,
        currency: "score",
        description:
            "Increase count multiplier and cooldown by 100%.",
    },
    {
        name: "betterAutoCount",
        text: "Better Auto Count",
        cost: 3,
        max: 1,
        currency: "subtractionPoints",
        description:
            "Increase base auto count multiplier by 5.",
    },
    {
        name: "predecessor",
        text: "Predecessor",
        cost: [5, 100],
        max: 2,
        currency: "subtractionPoints",
        description:
            "Increase count multiplier by 20%.",
    },
    {
        name: "unlockLevelBar",
        text: "Level Bar",
        cost: 10000,
        max: 1,
        currency: "subtractionPoints",
        description:
            "Unlock Level Bar",
    },
];

// Persisted player data
// ================================================================

const LS_KEY_PLAYER = "incremental.player";

const playerUpgrades = {};
const playerCurrencies = {};

function safeParseJSON(raw) {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function loadPlayerData() {
    const raw = localStorage.getItem(LS_KEY_PLAYER);
    if (!raw) return;

    const data = safeParseJSON(raw);
    if (!data || typeof data !== "object") return;

    if (data.playerCurrencies && typeof data.playerCurrencies === "object") {
        for (const [k, v] of Object.entries(data.playerCurrencies)) {
            if (!Number.isFinite(v)) continue;
            if (v < 0) continue;
            playerCurrencies[k] = Math.floor(v);
        }
    }

    if (data.playerUpgrades && typeof data.playerUpgrades === "object") {
        for (const [k, v] of Object.entries(data.playerUpgrades)) {
            if (!Number.isFinite(v)) continue;
            if (v < 0) continue;
            playerUpgrades[k] = Math.floor(v);
        }
    }

    document.getElementById("score").textContent = toNotation(playerCurrencies.score);
    document.getElementById("subtraction-points").textContent = toNotation(playerCurrencies.subtractionPoints);
}

function persistPlayerData() {
    try {
        localStorage.setItem(
            LS_KEY_PLAYER,
            JSON.stringify({
                playerCurrencies,
                playerUpgrades
            })
        );
    } catch {
        // ignore
    }
}

// Helpers
// ================================================================

function getUpgCount(name) {
    return playerUpgrades[name] ?? 0;
}

function incUpgCount(name, inc) {
    playerUpgrades[name] = getUpgCount(name) + inc;
}

function getCurrCount(name) {
    return playerCurrencies[name] ?? 0;
}

function incCurrencyCount(name, inc) {
    playerCurrencies[name] = getCurrCount(name) + inc;
}

function getUpgCost(item) {
    const count = getUpgCount(item.name);
    const cost = item.cost;

    return typeof cost === "function"
    ? cost(count)
    : typeof cost === "number"
    ? cost
    : cost[count];
}

function isMaxed(item) {
    return getUpgCount(item.name) >= item.max;
}

function incNumber(currency, inc) {
    incCurrencyCount(currency, inc);
    updateScoreUI();
    updateNextResetSubtractionPointsUI();
    persistPlayerData();
}

function buyUpg(cost, currency, callback) {
    if (getCurrCount(currency) >= cost) {
        incNumber(currency, -cost);
        callback();
    }
}

function getCostText(item) {
    return isMaxed(item)
    ? "MAXED"
    : toNotation(getUpgCost(item));
}

function getLevelText(item) {
    return `Level: ${getUpgCount(item.name)} / ${item.max}`;
}

function toNotation(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toString() + "K";
    return (Math.floor(num / 1000) / 1000).toString() + "M";
}

// Formulas
// ================================================================

function getAutoCountBoost() {
    return getUpgCount("autoCount")
    + getUpgCount("betterAutoCount") * 5;
}

function getScoreBoost() {
    return Math.floor((1
        + getUpgCount("addition") * 2
        + getUpgCount("successor")
        + playerCurrencies.subtractionPoints
    )
    * (getUpgCount("multiplication") + 1)
    * (getUpgCount("predecessor") * 0.2 + 1))
    * (getUpgCount("level") * 0.05 + 1);
}

function getCountCooldown() {
    return (1000
        - getUpgCount("fastCounting") * 250
    ) 
    * (getUpgCount("multiplication") + 1);
}

function getSubtractionPoints() {
    if (getCurrCount("score") < RESET_REQUIREMENT) return 0;
    return Math.floor((getCurrCount("score") / RESET_REQUIREMENT) ** 0.5);
}

const LEVEL_UNLOCK_UPGRADE = "unlockLevelBar";

function getLevelUpReq() {
    return 10 ** getCurrCount("level");
}

// Display
// ================================================================

function updateLevelBarUI() {
    const section = document.getElementById("level-bar-section");
    const levelEl = document.getElementById("level");
    const levelProgressTextEl = document.getElementById("level-progress-text");
    const fillEl = document.getElementById("level-bar-fill");

    if (!section || !levelEl || !levelProgressTextEl || !fillEl) return;

    const unlocked = getUpgCount(LEVEL_UNLOCK_UPGRADE) >= 1;
    section.style.display = unlocked ? "block" : "none";
    if (!unlocked) return;

    const progress = toNotation(getCurrCount("xp"));
    const nextReq = toNotation(getLevelUpReq());

    levelEl.textContent = getCurrCount("level");
    levelProgressTextEl.textContent = `${progress} / ${nextReq}`;

    const pct = Math.max(0, Math.min(1, progress / nextReq));
    fillEl.style.width = `${Math.round(pct * 1000) / 10}%`;
}

function updateNextResetSubtractionPointsUI() {
    const el = document.getElementById("next-reset-subtraction-points");
    if (!el) return;
    el.textContent = toNotation(getSubtractionPoints());
}

function updateScoreUI() {
    document.getElementById("score").textContent = toNotation(playerCurrencies.score);
}

function updateGainRateUI() {
    const manualEl = document.getElementById("gain-rate-manual");
    const autoEl = document.getElementById("gain-rate-auto");
    if (!manualEl || !autoEl) return;

    manualEl.textContent = parseInt(getScoreBoost());
    autoEl.textContent = parseInt(getAutoCountBoost());
}

// Erase Data
// ================================================================

function erasePlayerData() {
    try {
        localStorage.removeItem(LS_KEY_PLAYER);
    } catch {
        // ignore
    }

    // Reset in-memory state.
    playerCurrencies.score = 0;
    playerCurrencies.subtractionPoints = 0;

    for (const key of Object.keys(playerUpgrades)) {
        delete playerUpgrades[key];
    }

    // Update UI.
    document.getElementById("score").textContent = "0";
    document.getElementById("subtraction-points").textContent = "0";
    updateNextResetSubtractionPointsUI();

    stopCountCooldown();

    // Rebuild upgrade nodes so button labels reset.
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";
    init();
}

// Gameplay
// ================================================================

function stopCountCooldown() {
    canClick = true;
    countCooldownEnd = 0;

    if (countCooldownInterval) clearInterval(countCooldownInterval);
    countCooldownInterval = null;

    const cooldownEl = document.getElementById("count-cooldown");
    cooldownEl.textContent = "0";
}

function resetForSubtractionPoints() {
    if (playerCurrencies.score < RESET_REQUIREMENT) return;

    // Earn subtraction points from current score
    playerCurrencies.subtractionPoints += getSubtractionPoints();
    playerCurrencies.score = 0;

    // Reset ONLY score-based upgrades
    for (const item of UPGRADES) {
        if (item.currency !== "score") continue;
        delete playerUpgrades[item.name];
    }

    // Update UI.
    document.getElementById("score").textContent = "0";
    document.getElementById("subtraction-points").textContent = toNotation(playerCurrencies.subtractionPoints);
    updateNextResetSubtractionPointsUI();
    updateGainRateUI();

    stopCountCooldown();

    // Rebuild upgrade nodes so button labels/costs update to reflect reset.
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";
    init();

    persistPlayerData();
}

function startCountCooldown() {
    canClick = false;
    countCooldownEnd = Date.now() + getCountCooldown();

    const cooldownEl = document.getElementById("count-cooldown");
    if (countCooldownInterval) clearInterval(countCooldownInterval);

    // Immediate update for responsiveness
    cooldownEl.textContent = (Math.ceil((countCooldownEnd - Date.now()) / 100) / 10).toString();

    countCooldownInterval = setInterval(() => {
        const remainingMs = countCooldownEnd - Date.now();
        if (remainingMs <= 0) {
            if (countCooldownInterval) clearInterval(countCooldownInterval);
            countCooldownInterval = null;
            canClick = true;
            cooldownEl.textContent = "0";
            return;
        }

        // Display seconds with one decimal place
        const remainingSec = Math.ceil(remainingMs / 100) / 10;
        cooldownEl.textContent = remainingSec.toString();
    }, 50);
}

function checkLevelUp() {
    for (let i = 0; i < 100; i++) {
        const requirement = getLevelUpReq();
        if (getCurrCount("xp") >= requirement) {
            incCurrencyCount("level", 1);
            incCurrencyCount("xp", -requirement);
        }
        else break;
    }
}

function count() {
    if (!canClick) return;

    incNumber("score", getScoreBoost());

    const levelUnlocked = getUpgCount(LEVEL_UNLOCK_UPGRADE) >= 1;

    if (levelUnlocked) {
        incCurrencyCount("xp", 1);
        checkLevelUp();
        updateLevelBarUI();
    }

    persistPlayerData();
    startCountCooldown();
}

setInterval(() => {
    incNumber("score", getAutoCountBoost());
}, 2000)

document.getElementById("count").addEventListener("click", count);

document.getElementById("reset-subtraction").addEventListener("click", () => {
    resetForSubtractionPoints();
});

document.getElementById("erase-player-data")?.addEventListener("click", () => {
    const ok = confirm("Erase all saved player data? This cannot be undone.");
    if (!ok) return;
    erasePlayerData();
});

// Create HTML Elements
// ================================================================

function createUpgButton(item) {
    const wrap = document.createElement("div");
    wrap.className = "upgrade-card";

    const costWrap = document.createElement("div");
    costWrap.className = "upgrade-cost";

    const costEl = document.createElement("span");
    costEl.className = "cost-value";
    costEl.textContent = getCostText(item);

    const currencyIcon = document.createElement("span");
    currencyIcon.className = `cost-currency ${item.currency}`;
    currencyIcon.textContent = item.currency === "score" ? "P" : "S";
    currencyIcon.title = item.currency === "score" ? "Score" : "Subtraction Points";

    costWrap.appendChild(costEl);
    costWrap.appendChild(currencyIcon);

    const upgBtn = document.createElement("button");
    upgBtn.className = "upgrade-buy";
    upgBtn.textContent = item.text;
    upgBtn.disabled = isMaxed(item);

    const levelEl = document.createElement("p");
    levelEl.className = "upgrade-level";
    levelEl.textContent = getLevelText(item);

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = item.description ?? "";

    wrap.appendChild(upgBtn);
    wrap.appendChild(costWrap);
    wrap.appendChild(levelEl);
    wrap.appendChild(desc);
    document.getElementById("upgrades").appendChild(wrap);

    return [upgBtn, costEl, levelEl];
}

// Init
// ================================================================

function createUpgNode(item) {
    const [upgBtn, costEl, levelEl] = createUpgButton(item);

    upgBtn.addEventListener("click", () => {
        if (isMaxed(item)) return;

        buyUpg(getUpgCost(item), item.currency, () => {
            incUpgCount(item.name, 1);
            updateGainRateUI();

            // UI refresh
            costEl.textContent = getCostText(item);
            levelEl.textContent = getLevelText(item);
            upgBtn.disabled = isMaxed(item);

            if (item.name === "unlockLevelBar") {
                playerCurrencies.level = Math.max(1, playerCurrencies.level);
            }

            persistPlayerData();
        });
    });
}

function init() {
    updateNextResetSubtractionPointsUI();
    updateScoreUI();
    updateGainRateUI();
    updateLevelBarUI();

    for (const item of UPGRADES) {
        createUpgNode(item);
    }

    // Used for testing (ignore)
    if (false) {
        playerCurrencies.subtractionPoints = 10**6;
    }
}

loadPlayerData();
init();
