"use strict";
let score = 0;
let subtractionPoints = 0;

let canClick = true;

let countCooldownEnd = 0;
let countCooldownInterval = null;

const RESET_REQUIREMENT = 1000;

const UPGRADES = [
    {
        name: "successor",
        text: "Successor",
        cost: (i) => [5, 10, 30, 75, 200][i % 5] * 100**Math.floor(i / 5),
        max: 10,
        description:
            "Increase base count multiplier by 1.",
    },
    {
        name: "autoCount",
        text: "Auto Count",
        cost: [15, 50, 500, 10000, 1000000000],
        max: 5,
        description:
            "Increase score by 1 every 2s.",
    },
    {
        name: "fastCounting",
        text: "Fast Counting",
        cost: [100, 1000, 1000000],
        max: 3,
        description:
            "Decrease count cooldown by 0.25 seconds.",
    },
    {
        name: "addition",
        text: "Addition",
        cost: [150, 750, 4000, 20000, 100000],
        max: 5,
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "multiplication",
        text: "Multiplication",
        cost: 20000,
        max: 1,
        description:
            "Increase count multiplier and cooldown by 100%.",
    },
];

// Persisted player data
// ================================================================

const LS_KEY_PLAYER = "incremental.player";

const boughtUpg = {};

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

    if (Number.isFinite(data.score) && data.score >= 0) {
        score = Math.floor(data.score);
    }

    if (Number.isFinite(data.subtractionPoints) && data.subtractionPoints >= 0) {
        subtractionPoints = Math.floor(data.subtractionPoints);
    }

    if (data.boughtUpg && typeof data.boughtUpg === "object") {
        for (const [k, v] of Object.entries(data.boughtUpg)) {
            if (!Number.isFinite(v)) continue;
            if (v < 0) continue;
            boughtUpg[k] = Math.floor(v);
        }
    }

    document.getElementById("score").textContent = score.toString();
    document.getElementById("subtraction-points").textContent = subtractionPoints.toString();
}

function persistPlayerData() {
    try {
        localStorage.setItem(
            LS_KEY_PLAYER,
            JSON.stringify({
                score,
                subtractionPoints,
                boughtUpg,
            })
        );
    } catch {
        // ignore
    }
}

// Helpers
// ================================================================

function getUpgCount(name) {
    return boughtUpg[name] ?? 0;
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

function incUpgCount(name, inc) {
    boughtUpg[name] = getUpgCount(name) + inc;
}

function incNumber(inc) {
    score += inc;
    document.getElementById("score").textContent = toNotation(score);
    persistPlayerData();
}

function buyUpg(cost, callback) {
    if (score >= cost) {
        incNumber(-cost);
        callback();
    }
}

function costText(item) {
    return isMaxed(item)
    ? "maxed"
    : toNotation(getUpgCost(item));
}

function toNotation(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toString() + "K";
    return (num / 1000000).toString() + "M";
}

// Formulas
// ================================================================

function getAutoCountBoost() {
    return getUpgCount("autoCount");
}

function getScoreBoost() {
    return (
        1
        + getUpgCount("addition") * 2
        + getUpgCount("successor")
        + subtractionPoints * 2
    )
    * (getUpgCount("multiplication") + 1);
}

function getCountCooldown() {
    return (
        1000
        - getUpgCount("fastCounting") * 250
    ) 
    * (getUpgCount("multiplication") + 1);
}

function getSubtractionPoints() {
    if (score < RESET_REQUIREMENT) return 0;
    return Math.floor((score / RESET_REQUIREMENT) ** 0.5);
}

// Display
// ================================================================

function updateNextResetSubtractionPointsUI() {
    const el = document.getElementById("next-reset-subtraction-points");
    if (!el) return;
    el.textContent = getSubtractionPoints().toString();
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
    score = 0;
    subtractionPoints = 0;

    for (const key of Object.keys(boughtUpg)) {
        delete boughtUpg[key];
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
    if (score < RESET_REQUIREMENT) return;

    // Earn subtraction points from current score.
    subtractionPoints += getSubtractionPoints();
    score = 0;

    // Clear upgrades.
    for (const key of Object.keys(boughtUpg)) {
        delete boughtUpg[key];
    }

    // Update UI.
    document.getElementById("score").textContent = "0";
    document.getElementById("subtraction-points").textContent = subtractionPoints.toString();
    updateNextResetSubtractionPointsUI();
    updateGainRateUI();

    stopCountCooldown();

    // Rebuild upgrade nodes so button labels reset.
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

setInterval(() => {
    incNumber(getAutoCountBoost());
}, 2000)

document.getElementById("count").addEventListener("click", () => {
    if (!canClick) return;

    incNumber(getScoreBoost());
    startCountCooldown();
});

document.getElementById("reset-subtraction").addEventListener("click", () => {
    resetForSubtractionPoints();
});

document.getElementById("erase-player-data")?.addEventListener("click", () => {
    const ok = confirm("Erase all saved player data? This cannot be undone.");
    if (!ok) return;
    erasePlayerData();
});

// Init
// ================================================================

function createUpgNode(item) {
    const wrap = document.createElement("div");
    wrap.style = "margin-bottom: 16px;";

    const upgBtn = document.createElement("button");
    upgBtn.textContent = `${item.text} (cost: ${costText(item)})`;

    const levelEl = document.createElement("p");
    levelEl.className = "upgrade-level";
    levelEl.textContent = `Level: ${getUpgCount(item.name)} / ${item.max}`;

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = item.description ?? "";

    wrap.appendChild(upgBtn);
    wrap.appendChild(levelEl);
    wrap.appendChild(desc);
    document.getElementById("upgrades").appendChild(wrap);

    upgBtn.addEventListener("click", () => {
        buyUpg(getUpgCost(item), () => {
            incUpgCount(item.name, 1);
            updateGainRateUI();
            upgBtn.textContent = `${item.text} (cost: ${costText(item)})`;
            levelEl.textContent = `Level: ${getUpgCount(item.name)} / ${item.max}`;
        });
    });
}

function init() {
    updateNextResetSubtractionPointsUI();
    updateGainRateUI();

    for (const item of UPGRADES) {
        createUpgNode(item);
    }
}

loadPlayerData();
init();
