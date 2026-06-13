"use strict";
import {RESET_REQUIREMENT, UPGRADES, CURRENCIES} from "./config.js";
import {CurrencyUI, globalUpdateUI} from "./currencyUI.js";
import {Formulas} from "./formulas.js";
import {loadPlayerData, persistPlayerData, erasePlayerData} from "./saveData.js";
import {Upg, Cc, Unl, getData} from "./playerData.js";
import {toNotation} from "./notation.js";
import {Cooldown, globalStopCooldown} from "./cooldown.js";

// Helpers
// ================================================================

function getUpgCost(item) {
    const count = Upg.get(item.name);
    const cost = item.cost;

    return typeof cost === "function" ? cost(count)
    : typeof cost === "number" ? cost
    : cost[count];
}

function isMaxed(item) {
    return Upg.get(item.name) >= item.max;
}

function getLevelText(item) {
    return `Level: ${Upg.get(item.name)} / ${item.max}`;
}

// Gameplay
// ================================================================

function count() {
    if (!Cooldown.ended("count")) return;

    Cc.inc("point", Formulas.countBoost());

    const levelUnlocked = Upg.get("unlockLevelBar") >= 1;
    if (levelUnlocked) {
        Cc.inc("xp", Formulas.xpCountBoost());
        checkLevelUp();
        CurrencyUI.xp();
    }

    CurrencyUI.point();
    persistPlayerData();
    Cooldown.start("count");
}

function increment() {
    if (!Cooldown.ended("increment")) return;

    Cc.inc("xp", Formulas.xpIncrementBoost());
    checkLevelUp();
    CurrencyUI.xp();
    
    Cc.inc("point2", Formulas.incrementBoost());
    Cooldown.start("increment");
    CurrencyUI.point2();

    // level/xp from manual clicks is handled by Count only for now;
    // increment is a separate +1 score mechanic.
}

function resetForResetPoint() {
    const pData = getData();
    if (Cc.get("point") < RESET_REQUIREMENT) return;

    // Earn subtraction points from current score
    Cc.inc("resetPoint", Formulas.nextResetPoint());
    Cc.set("point", 0);
    Unl.set("upgResetPoint", true);

    Cooldown.stop("count");

    // Reset ONLY point-based upgrades
    for (const item of UPGRADES) {
        if (item.currency !== "point") continue;
        delete pData.upgrades[item.name];
    }

    // Update UI
    CurrencyUI.point();
    CurrencyUI.resetPoint();

    // Rebuild upgrade nodes so button labels/costs update to reflect reset
    persistPlayerData();
    resetUpgrades();
}

function checkLevelUp() {
    for (let i = 0; i < 100; i++) {
        const requirement = Formulas.levelUpReq();
        if (Cc.get("xp") >= requirement) {
            Cc.inc("level", 1);
            Cc.inc("xp", -requirement);
        }
        else break;
    }

    if (Cc.get("level") >= 10) {
        Unl.set("point2", true);
        updIncrementBtn();
    }
}

setInterval(() => {
    Cc.inc("point", Formulas.autoCountBoost());
    CurrencyUI.point();
}, 2000)

document.getElementById("count").addEventListener("click", count);
document.getElementById("increment").addEventListener("click", increment);

document.getElementById("reset-subtraction").addEventListener("click", () => {
    resetForResetPoint();
});

document.getElementById("erase-player-data")?.addEventListener("click", () => {
    const ok = confirm("Erase all saved player data? This cannot be undone.");
    if (!ok) return;
    erasePlayerData();
    globalStopCooldown();
    init();
});

// Gain rate UI
// ================================================================

function updateGainRateUI() {
    const manualEl = document.getElementById("gain-rate-manual");
    const autoEl = document.getElementById("gain-rate-auto");
    if (!manualEl || !autoEl) return;

    manualEl.textContent = Formulas.countBoost();
    autoEl.textContent = Formulas.autoCountBoost();
}

function updIncrementBtn() {
    document.getElementById("increment-div").style.display =
    Unl.get("point2") ? "block" : "none";
}

// Upgrades UI
// ================================================================

function shouldShowUpgrade(item) {
    return (item.currency !== "resetPoint" || Unl.get("upgResetPoint"))
    && !item.unlock || Upg.get(item.unlock) > 0;
}

function resetUpgrades() {
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";

    for (const item of UPGRADES) {
        if (!shouldShowUpgrade(item)) continue;
        createUpgNode(item);
    }
}

function createCostWrap(item, currInfo) {
    const costWrap = document.createElement("div");
    costWrap.className = "upgrade-cost";

    const costLabel = document.createElement("span");
    costLabel.className = "cost-value";

    const currencyIcon = document.createElement("span");
    currencyIcon.className = `cost-currency ${item.currency}`;
    currencyIcon.textContent = currInfo.symbol;
    currencyIcon.title = currInfo.name;

    costWrap.appendChild(costLabel);
    costWrap.appendChild(currencyIcon);

    return {costWrap, costLabel, currencyIcon};
}

function createUpgradeCard(item) {
    const wrap = document.createElement("div");
    wrap.className = "upgrade-card";

    const upgBtn = document.createElement("button");
    upgBtn.className = "upgrade-buy";
    upgBtn.textContent = item.text;

    const costWrap = createCostWrap(item, CURRENCIES[item.currency]);

    const levelLabel = document.createElement("p");
    levelLabel.className = "upgrade-level";

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = item.description ?? "";

    wrap.appendChild(upgBtn);
    wrap.appendChild(costWrap.costWrap);
    wrap.appendChild(levelLabel);
    wrap.appendChild(desc);
    document.getElementById("upgrades").appendChild(wrap);

    return {...costWrap, upgBtn, levelLabel};
}

function updateUpgrade(item, upgCard) {
    const maxed = isMaxed(item);

    // When maxed: show MAXED without the negative sign and hide the currency icon.
    let costText = maxed ? "MAXED" : toNotation(getUpgCost(item), 4);
    if (!maxed && item.currency === "resetPoint") costText = "-" + costText;

    upgCard.costLabel.textContent = costText;
    upgCard.currencyIcon.style.display = maxed ? "none" : "inline-flex";
    upgCard.levelLabel.textContent = getLevelText(item);
    upgCard.upgBtn.disabled = maxed;
}

function createUpgNode(item) {
    const upgCard = createUpgradeCard(item);
    updateUpgrade(item, upgCard);

    upgCard.upgBtn.addEventListener("click", () => {
        if (isMaxed(item)) return;

        if (Cc.get(item.currency) >= getUpgCost(item)) {
            Cc.inc(item.currency, -getUpgCost(item));
            if (CurrencyUI[item.currency])
                CurrencyUI[item.currency]();

            // Buy the upgrade.
            Upg.inc(item.name, 1);
            updateGainRateUI();
            updateUpgrade(item, upgCard);

            if (item.name === "unlockLevelBar") resetUpgrades();
            persistPlayerData();
        }
    });
}

// Init
// ================================================================

function init() {
    globalUpdateUI();
    updateGainRateUI();
    resetUpgrades();
    updIncrementBtn();
}

loadPlayerData();
init();

// Test
// ================================================================

function initTest() {
    document.getElementById("test-warning").textContent =
    "DEV BUILD: debug entrypoints enabled (do not publish this file).";

    Upg.set("unlockLevelBar", 1);
    Cc.set("point", 10_000);

    persistPlayerData();
}

// initTest();
