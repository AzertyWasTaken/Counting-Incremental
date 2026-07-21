"use strict";
import {RESETS} from "./config.js";
import {Cc, Upg, Unl} from "./playerData.js";
import {resetUpgUI, resetUpgData} from "./upgradesUI.js";
import {Cooldown} from "./cooldown.js";
import {CurrencyUI, globalUpdateUI} from "./currenciesUI.js";
import {persistPlayerData} from "./saveData.js";
import {notation} from "./notation.js";
import {Elements as El} from "./elementsUI.js";

// Create elements
// ================================================================

function createGainWrap(parent, item) {
    const wrap = El.new("div", parent, "row");

    const resetGainLabel = El.new("p", wrap, "upgrade-level");
    resetGainLabel.textContent = "Next reset:";
    wrap.appendChild(resetGainLabel);

    const gainWrap = El.currLabel(wrap, item.gainCurrency);

    return {gainWrap};
}

function createResetCard(item) {
    const resetsEl = document.getElementById("resets");
    const wrap = El.new("div", resetsEl, "upgrade-card");

    const upgBtn = El.new("button", wrap, "reset-reset")
    upgBtn.textContent = item.text;

    El.currLabel(wrap, item.reqCurrency, item.reqValue);

    const desc = El.new("p", wrap, "description")
    desc.textContent = item.description ?? "";

    const gainWrap = createGainWrap(wrap, item);

    return {gainWrap, upgBtn};
}

// Main functions
// ================================================================

export const UpdResetDisplay = {};

function createResetNode(item) {
    const upgCard = createResetCard(item);

    UpdResetDisplay[item.reqCurrency] = () => {
        upgCard.gainWrap.gainWrap.currLabel.textContent =
        notation(item.gainValue(), item.gainCurrency);
    }

    UpdResetDisplay[item.reqCurrency]();

    upgCard.upgBtn.addEventListener("click", () => {
        if (Cc.get(item.reqCurrency) < item.reqValue) return;

        // Earn subtraction points from current score
        Cc.inc(item.gainCurrency, item.gainValue());
        Unl.set("resetPoint", true);

        // Reset player data
        for (const currency of item.reset) {
            Cc.set(currency, 0);
            resetUpgData(currency);
        }
        Cooldown.stop("count");

        // Update UI
        globalUpdateUI();

        // Rebuild upgrade nodes so button labels/costs update to reflect reset
        persistPlayerData();
        resetUpgUI();
        resetResetUI();
    });
}

function shouldShowReset(item) {
    return !item.unlock || Upg.get(item.unlock) > 0;
}

export function resetResetUI() {
    const upgradesEl = document.getElementById("resets");
    upgradesEl.innerHTML = "";

    for (const item of RESETS) {
        if (!shouldShowReset(item)) continue;
        createResetNode(item);
    }
}
