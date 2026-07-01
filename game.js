"use strict";
import {CurrencyUI, globalUpdateUI} from "./currencyUI.js";
import {Formulas} from "./formulas.js";
import {loadPlayerData, persistPlayerData, erasePlayerData} from "./saveData.js";
import {Upg, Cc, Unl} from "./playerData.js";
import {Cooldown, globalStopCooldown} from "./cooldown.js";
import {resetUpgUI, resetUpgData} from "./upgrades.js";
import {resetResetUI} from "./reset.js";

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
    // `increment` is a separate +1 score mechanic.
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

    if (Cc.get("level") >= 10 && !Unl.get("point2")) {
        Unl.set("point2", true);
        resetUpgUI();
        updIncrementBtn();
    }
}

setInterval(() => {
    Cc.inc("point", Formulas.autoCountBoost());
    CurrencyUI.point();
}, 2000)

document.getElementById("count").addEventListener("click", count);
document.getElementById("increment").addEventListener("click", increment);

document.getElementById("erase-player-data")?.addEventListener("click", () => {
    const ok = confirm("Erase all saved player data? This cannot be undone.");
    if (!ok) return;
    erasePlayerData();
    globalStopCooldown();
    init();
});

// Gain rate UI
// ================================================================

export function updateGainRateUI() {
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

// Init
// ================================================================

function init() {
    globalUpdateUI();
    updateGainRateUI();
    resetUpgUI();
    resetResetUI();
    updIncrementBtn();
}

loadPlayerData();
// initTest();
init();

// Test
// ================================================================

function initTest() {
    document.getElementById("test-warning").textContent =
    "DEV BUILD: debug entrypoints enabled (do not publish this file).";

    Upg.set("unlockLevelBar", 1);
    Unl.set("point2", true);
    Cc.set("point", 1_000);
    Cc.set("level", 10)

    persistPlayerData();
}
