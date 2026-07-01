"use strict";
import {RESETS, CURRENCIES} from "./config.js";
import {Cc, Upg, Unl} from "./playerData.js";
import {resetUpgUI, resetUpgData} from "./upgrades.js";
import {Cooldown} from "./cooldown.js";
import {CurrencyUI} from "./currencyUI.js";
import {persistPlayerData} from "./saveData.js";
import {notation} from "./notation.js";

export const UpdResetDisplay = {};

function createCostWrap(item, currInfo) {
    const costWrap = document.createElement("div");
    costWrap.className = "upgrade-cost";

    const costLabel = document.createElement("span");
    costLabel.className = "cost-value";
    costLabel.textContent = notation(item.reqValue, item.reqCurrency, 4);

    const currencyIcon = document.createElement("span");
    currencyIcon.className = `cost-currency ${item.reqCurrency}`;
    currencyIcon.textContent = currInfo.symbol;
    currencyIcon.title = currInfo.name;

    costWrap.appendChild(costLabel);
    costWrap.appendChild(currencyIcon);

    return {costWrap};
}

function createGainWrap(item, currInfo) {
    const gainWrap = document.createElement("div");
    gainWrap.className = "row";

    const resetGainLabel = document.createElement("p");
    resetGainLabel.className = "upgrade-level";
    resetGainLabel.textContent = "Next reset:";

    const resetGain = document.createElement("p");
    resetGain.className = "next-reset-gain";

    const currencyIcon = document.createElement("span");
    currencyIcon.className = `cost-currency ${item.gainCurrency}`;
    currencyIcon.textContent = currInfo.symbol;
    currencyIcon.title = currInfo.name;

    gainWrap.appendChild(resetGainLabel);
    gainWrap.appendChild(resetGain);
    gainWrap.appendChild(currencyIcon);

    return {gainWrap, resetGain};
}

function createResetCard(item) {
    const wrap = document.createElement("div");
    wrap.className = "upgrade-card";

    const upgBtn = document.createElement("button");
    upgBtn.className = "reset-reset";
    upgBtn.textContent = item.text;

    const costWrap = createCostWrap(item, CURRENCIES[item.reqCurrency]);
    const gainWrap = createGainWrap(item, CURRENCIES[item.gainCurrency]);

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = item.description ?? "";

    wrap.appendChild(upgBtn);
    wrap.appendChild(costWrap.costWrap);
    wrap.appendChild(desc);
    wrap.appendChild(gainWrap.gainWrap);
    document.getElementById("resets").appendChild(wrap);

    return {...costWrap, ...gainWrap, upgBtn};
}

function createResetNode(item) {
    const upgCard = createResetCard(item);

    UpdResetDisplay[item.reqCurrency] = () => {
        upgCard.resetGain.textContent = notation(item.gainValue(item.reqValue), item.gainCurrency);
    }

    UpdResetDisplay[item.reqCurrency]();

    upgCard.upgBtn.addEventListener("click", () => {
        if (Cc.get(item.reqCurrency) < item.reqValue) return;

        // Earn subtraction points from current score
        Cc.inc(item.gainCurrency, item.gainValue(item.reqValue));
        Unl.set("resetPoint", true);

        // Reset player data
        for (const currency of item.reset) {
            Cc.set(currency, 0);
            resetUpgData(currency);
        }
        Cooldown.stop("count");

        // Update UI
        CurrencyUI.point();
        CurrencyUI.resetPoint();

        // Rebuild upgrade nodes so button labels/costs update to reflect reset
        persistPlayerData();
        resetUpgUI();
        resetResetUI();
    });
}

function shouldShowReset(item) {
    if (item.reqCurrency === "point2" && !Unl.get("point2")) return false;
    if (item.reqCurrency === "resetPoint" && !Unl.get("resetPoint")) return false;
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
