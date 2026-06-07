"use strict";
import {RESET_REQUIREMENT, UPGRADES, CURRENCIES} from "./config.js"
import {namesHistory} from "./save.js"

let canClick = true;
let countCooldownEnd = 0;
let countCooldownInterval = null;

// Persisted player data
// ================================================================

const LS_KEY_PLAYER = "incremental.player";

const playerUpgrades = {};
const playerCurrencies = {};
let reseted = false;

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

    reseted = data.reseted;

    if (data.playerCurrencies && typeof data.playerCurrencies === "object") {
        for (const [k, v] of Object.entries(data.playerCurrencies)) {
            if (!Number.isFinite(v) || v < 0) continue;
            const alt = playerCurrencies[namesHistory.playerCurrencies?.[k]];
            playerCurrencies[k] = Math.floor(v ?? alt);
        }
    }

    if (data.playerUpgrades && typeof data.playerUpgrades === "object") {
        for (const [k, v] of Object.entries(data.playerUpgrades)) {
            if (!Number.isFinite(v) || v < 0) continue;
            const alt = playerUpgrades[namesHistory.playerUpgrades?.[k]];
            playerUpgrades[k] = Math.floor(v ?? alt);
        }
    }

    document.getElementById("score").textContent = toNotation(getCurrCount("point"));
    document.getElementById("subtraction-points").textContent = toNotation(getCurrCount("resetPoint"));
}

function persistPlayerData() {
    try {
        localStorage.setItem(
            LS_KEY_PLAYER,
            JSON.stringify({
                playerCurrencies,
                playerUpgrades,
                reseted
            })
        );
    } catch {
        // ignore
    }
}

// Helpers
// ================================================================

const PREFIXES = ["K", "M", "B", "T"];

function toNotation(num, digits = 6) {
    const magnitude = Math.log10(num);
    if (magnitude < digits + 2) return writeCommas(num);

    const illion = Math.floor(magnitude / 3);
    const prefix = PREFIXES[illion - 1];
    const number = Math.floor(num / 10**(illion * 3 - digits)) / 10**digits

    return number.toString() + prefix;
}

function getCostText(item) {
    return isMaxed(item)
    ? "MAXED"
    : toNotation(getUpgCost(item), 4);
}

function getUpgCount(name) {
    return playerUpgrades[name] ?? 0;
}

function incUpgCount(name, inc) {
    playerUpgrades[name] = getUpgCount(name) + inc;
}

function getCurrCount(name) {
    return playerCurrencies[name] ?? 0;
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

function incCurrency(name, inc) {
    playerCurrencies[name] = getCurrCount(name) + inc;
    updateScoreUI();
    updateNextResetResetPointUI();
    persistPlayerData();
}

function buyUpg(cost, currency, callback) {
    if (getCurrCount(currency) >= cost) {
        incCurrency(currency, -cost);
        callback();
    }
}

function getLevelText(item) {
    return `Level: ${getUpgCount(item.name)} / ${item.max}`;
}

function writeCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Formulas
// ================================================================

function getAutoCountBoost() {
    return Math.floor((
        getUpgCount("incAutoCount")
        + getUpgCount("incAutoCount2") * 5
    )
    * (getCurrCount("level") * 0.05 + 1));
}

function getScoreBoost() {
    return Math.floor((1
        + getUpgCount("incCount")
        + getUpgCount("incCount2") * 2
        + getUpgCount("incCount3") * 2
    )
    * (getUpgCount("addCountAndCooldown") + 1)
    * (getUpgCount("addCount") * 0.2 + 1)
    * (getCurrCount("level") * 0.05 + 1));
}

function getCountCooldown() {
    return (1000
        - getUpgCount("decCountCooldown") * 250
    ) 
    * (getUpgCount("addCountAndCooldown") + 1);
}

function getResetPoint() {
    return Math.floor((getCurrCount("point") / RESET_REQUIREMENT) ** 0.5);
}

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

    const unlocked = getUpgCount("unlockLevelBar") >= 1;
    section.style.display = unlocked ? "block" : "none";
    if (!unlocked) return;

    const progress = toNotation(getCurrCount("xp"));
    const nextReq = getLevelUpReq();

    levelEl.textContent = getCurrCount("level");
    levelProgressTextEl.textContent = `${progress} / ${toNotation(nextReq)}`;

    const pct = Math.max(0, Math.min(1, progress / nextReq));
    fillEl.style.width = `${Math.round(pct * 1000) / 10}%`;
}

function updateNextResetResetPointUI() {
    const el = document.getElementById("next-reset-subtraction-points");
    if (!el) return;
    el.textContent = toNotation(getResetPoint());
}

function updateScoreUI() {
    document.getElementById("score").textContent = toNotation(getCurrCount("point"));
}

function updateGainRateUI() {
    const manualEl = document.getElementById("gain-rate-manual");
    const autoEl = document.getElementById("gain-rate-auto");
    if (!manualEl || !autoEl) return;

    manualEl.textContent = getScoreBoost();
    autoEl.textContent = getAutoCountBoost();
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
    playerCurrencies.point = 0;
    playerCurrencies.resetPoint = 0;

    for (const key of Object.keys(playerUpgrades)) {
        delete playerUpgrades[key];
    }

    // Update UI.
    document.getElementById("score").textContent = "0";
    document.getElementById("subtraction-points").textContent = "0";
    updateNextResetResetPointUI();

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

function resetForResetPoint() {
    if (playerCurrencies.point < RESET_REQUIREMENT) return;

    // Earn subtraction points from current score
    incCurrency("resetPoint", getResetPoint());
    playerCurrencies.point = 0;
    reseted = true;

    // Reset ONLY point-based upgrades
    for (const item of UPGRADES) {
        if (item.currency !== "point") continue;
        delete playerUpgrades[item.name];
    }

    // Update UI.
    document.getElementById("score").textContent = "0";
    document.getElementById("subtraction-points").textContent = toNotation(getCurrCount("resetPoint"));
    incUpgCount("resetCount", 1);
    updateNextResetResetPointUI();
    updateGainRateUI();

    stopCountCooldown();

    // Rebuild upgrade nodes so button labels/costs update to reflect reset.
    resetUpgrades();

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
            incCurrency("level", 1);
            incCurrency("xp", -requirement);
        }
        else break;
    }
}

function count() {
    if (!canClick) return;

    incCurrency("point", getScoreBoost());

    const levelUnlocked = getUpgCount("unlockLevelBar") >= 1;

    if (levelUnlocked) {
        incCurrency("xp", 1);
        checkLevelUp();
        updateLevelBarUI();
    }

    persistPlayerData();
    startCountCooldown();
}

setInterval(() => {
    incCurrency("point", getAutoCountBoost());
}, 2000)

document.getElementById("count").addEventListener("click", count);

document.getElementById("reset-subtraction").addEventListener("click", () => {
    resetForResetPoint();
});

document.getElementById("erase-player-data")?.addEventListener("click", () => {
    const ok = confirm("Erase all saved player data? This cannot be undone.");
    if (!ok) return;
    erasePlayerData();
});

// Create HTML Elements
// ================================================================

function shouldShowUpgrade(item) {
    return item.currency !== "resetPoint" || reseted;
}

function resetUpgrades() {
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";

    for (const item of UPGRADES) {
        if (!shouldShowUpgrade(item)) continue;
        createUpgNode(item);
    }
}

function createUpgButton(item) {
    const wrap = document.createElement("div");
    wrap.className = "upgrade-card";

    const costWrap = document.createElement("div");
    costWrap.className = "upgrade-cost";

    const costEl = document.createElement("span");
    costEl.className = "cost-value";
    costEl.textContent = getCostText(item);

    const currInfo = CURRENCIES[item.currency];

    const currencyIcon = document.createElement("span");
    currencyIcon.className = `cost-currency ${item.currency}`;
    currencyIcon.textContent = currInfo.symbol;
    currencyIcon.title = currInfo.name;

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

// Init
// ================================================================

function init() {
    updateNextResetResetPointUI();
    updateScoreUI();
    updateGainRateUI();
    updateLevelBarUI();
    resetUpgrades();
}

loadPlayerData();
init();

// Test
// ================================================================

function initTest() {
    document.getElementById("test-warning").textContent = "DEV BUILD: debug entrypoints enabled (do not publish this file).";

    playerCurrencies.point = 10000;
    playerUpgrades.unlockLevelBar = 1;
}

// initTest();
