"use strict";
import {CurrencyUI, globalUpdateUI, generateCurrencyCards} from "./currenciesUI.js";
import {Formulas} from "./formulas.js";
import {loadPlayerData, persistPlayerData, erasePlayerData} from "./saveData.js";
import {Cc, Unl} from "./playerData.js";
import {globalStopCooldown} from "./cooldown.js";
import {resetUpgUI} from "./upgradesUI.js";
import {resetResetUI} from "./resetsUI.js";
import {initTest} from "./tester.js";
import {count, increment} from "./count.js";

// Gameplay
// ================================================================

document.getElementById("count").addEventListener("click", count);
document.getElementById("increment").addEventListener("click", increment);

setInterval(() => {
    Cc.inc("point", Formulas.autoCountBoost());
    persistPlayerData();
    CurrencyUI.point();
}, 2000)

document.getElementById("erase-player-data").addEventListener("click", () => {
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
    generateCurrencyCards();
    globalUpdateUI();
    updateGainRateUI();
    resetUpgUI();
    resetResetUI();
    updIncrementBtn();
}

loadPlayerData();
initTest();
init();
