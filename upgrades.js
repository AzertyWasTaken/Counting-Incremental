"use strict";
import {UPGRADES, CURRENCIES} from "./config.js";
import {CurrencyUI} from "./currencyUI.js";
import {notation} from "./notation.js";
import {Upg, Cc, Unl, getData} from "./playerData.js";
import {persistPlayerData} from "./saveData.js";
import {updateGainRateUI} from "./game.js";

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

function isMaxed(item) {
    return Upg.get(item.name) >= item.max;
}

function getLevelText(item) {
    return `Level: ${Upg.get(item.name)} / ${item.max}`;
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
    upgCard.costLabel.textContent = maxed ? "MAXED" : notation(getUpgCost(item), item.currency, 4);
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
            executeKey(CurrencyUI, item.currency);

            // Buy the upgrade.
            Upg.inc(item.name, 1);
            updateGainRateUI();
            updateUpgrade(item, upgCard);

            if (item.name === "unlockLevelBar") resetUpgradesUI();
            persistPlayerData();
        }
    });
}

function shouldShowUpgrade(item) {
    if (item.currency === "point2" && !Unl.get("point2")) return false;
    if (item.currency === "resetPoint" && !Unl.get("resetPoint")) return false;
    return !item.unlock || Upg.get(item.unlock) > 0;
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
