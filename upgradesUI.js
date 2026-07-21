"use strict";
import {UPGRADES, CURRENCIES} from "./config.js";
import {CurrencyUI} from "./currenciesUI.js";
import {notation} from "./notation.js";
import {Upg, Cc, Unl, getData} from "./playerData.js";
import {persistPlayerData} from "./saveData.js";
import {updateGainRateUI} from "./game.js";
import {Elements as El} from "./elementsUI.js";

// Create elements
// ================================================================

function createUpgCard(item) {
    const upgradesEl = document.getElementById("upgrades");
    const wrap = El.new("div", upgradesEl, "upgrade-card");

    const upgBtn = El.new("button", wrap, "upgrade-buy");
    upgBtn.textContent = item.text;
    upgBtn.title = "Buy upgrade";

    const costWrap = El.currLabel(wrap, item.currency);

    const levelLabel = El.new("div", wrap, "upgrade-level");

    const desc = El.new("p", wrap, "description");
    desc.textContent = item.description ?? "";

    return {costWrap, upgBtn, levelLabel};
}

// Helpers
// ================================================================

function executeKey(obj, key) {
    if (obj[key]) obj[key]();
}

function getUpgCost(item) {
    const count = Upg.get(item.name);
    const cost = item.cost;

    return typeof cost === "function" ? cost(count)
    : typeof cost === "number" ? cost
    : cost[count];
}

function getMax(item) {
    return item.max ?? (
        typeof item.cost === "object" ?
        item.cost.length : 1
    );
}

function isMaxed(item) {
    return Upg.get(item.name) >= getMax(item);
}

function getLevelText(item) {
    return `Level: ${Upg.get(item.name)} / ${getMax(item)}`;
}

function shouldShowUpgrade(item) {
    if (item.currency === "point2" && !Unl.get("point2")) return false;
    if (item.currency === "resetPoint" && !Unl.get("resetPoint")) return false;
    return !item.unlock || Unl.get(item.unlock);
}

// Main functions
// ================================================================

function updateUpg(item, upgCard) {
    const maxed = isMaxed(item);

    // When maxed: show MAXED without the negative sign and hide the currency icon.
    upgCard.costWrap.currLabel.textContent = maxed
    ? "MAXED"
    : notation(getUpgCost(item), item.currency, 4);

    upgCard.costWrap.currIcon.style.display = maxed ? "none" : "inline-flex";
    upgCard.levelLabel.textContent = getLevelText(item);
    upgCard.upgBtn.disabled = maxed;
}

function createUpgNode(item) {
    const upgCard = createUpgCard(item);
    updateUpg(item, upgCard);

    if (item.name === "unlockLevel" && Upg.get(item.name) > 0) {
        Unl.set("level", true);
    }

    upgCard.upgBtn.addEventListener("click", () => {
        if (isMaxed(item)) return;

        if (Cc.get(item.currency) >= getUpgCost(item)) {
            Cc.inc(item.currency, -getUpgCost(item));
            executeKey(CurrencyUI, item.currency);

            // Buy the upgrade.
            Upg.inc(item.name, 1);
            updateGainRateUI();
            updateUpg(item, upgCard);

            if (item.name === "unlockLevel" && Upg.get(item.name) > 0) {
                Unl.set("level", true);
                resetUpgUI();
                CurrencyUI.xp();
            }

            persistPlayerData();
        }
    });
}

export function resetUpgData(cc) {
    const pData = getData();

    for (const item of UPGRADES) {
        if (item.currency === cc)
            delete pData.upgrades[item.name];
    }
}

export function resetUpgUI() {
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";

    for (const item of UPGRADES) {
        if (!shouldShowUpgrade(item)) continue;
        createUpgNode(item);
    }
}
