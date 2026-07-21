"use strict";
import {notation} from "./notation.js";
import {Formulas} from "./formulas.js";
import {CURRENCIES} from "./config.js";
import {Cc, Unl} from "./playerData.js";
import {UpdResetDisplay} from "./resetsUI.js";

function convertHex(hexCode, opacity = 1) {
    var hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    
    return `rgba(${r},${g},${b},${opacity})`;
}

function setCurrencyIconStyle(iconId, color) {
    const icon = document.getElementById(iconId);
    if (!icon) return;
    icon.style.color = color;
    icon.style.background = convertHex(color, 0.1);
    icon.style.borderColor = convertHex(color, 0.2);
}

function setCurrencyCardBorder(cardId, color) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.style.borderColor = convertHex(color, 0.3);
}

/**
 * Dynamically generate currency cards in the dashboard based on CURRENCIES config.
 * Only currencies with a `symbol` property get a card (excludes level, xp).
 */
export function generateCurrencyCards() {
    const dashboard = document.getElementById("currency-dashboard");
    if (!dashboard) return;

    // Remove any existing dynamically-added currency cards
    const existingCards = dashboard.querySelectorAll(".currency-card");
    existingCards.forEach(c => c.remove());

    for (const [key, info] of Object.entries(CURRENCIES)) {
        if (!info.symbol) continue; // skip non-card currencies (level, xp)

        const card = document.createElement("div");
        card.className = "currency-card";
        card.id = `card-${key}`;

        const header = document.createElement("div");
        header.className = "currency-header";

        const icon = document.createElement("span");
        icon.className = "currency-icon";
        icon.id = `icon-${key}`;
        icon.textContent = info.symbol;

        const name = document.createElement("span");
        name.className = "currency-name";
        name.textContent = info.name;

        header.appendChild(icon);
        header.appendChild(name);

        const value = document.createElement("p");
        value.className = "currency-value";
        value.id = `score-${key}`;
        value.textContent = "0";

        card.appendChild(header);
        card.appendChild(value);
        dashboard.appendChild(card);
    }
}

// Update a single currency card's display value and styling.
function updateCurrencyCard(key) {
    const info = CURRENCIES[key];
    if (!info || !info.symbol) return;

    const scoreEl = document.getElementById(`score-${key}`);
    const iconEl = document.getElementById(`icon-${key}`);
    const cardEl = document.getElementById(`card-${key}`);

    if (scoreEl) {
        scoreEl.textContent = notation(Cc.get(key), key);
    }

    if (iconEl && info.color) {
        iconEl.style.color = info.color;
        iconEl.style.background = convertHex(info.color, 0.1);
        iconEl.style.borderColor = convertHex(info.color, 0.2);
    }

    if (cardEl && info.color) {
        cardEl.style.borderColor = convertHex(info.color, 0.3);
    }

    // Call associated reset display update if exists
    if (UpdResetDisplay[key]) UpdResetDisplay[key]();
}

/** CurrencyUI object with dynamically-built methods for each currency */
export const CurrencyUI = {};

// Dynamically build CurrencyUI methods for each displayable currency
for (const key of Object.keys(CURRENCIES)) {
    if (!CURRENCIES[key].symbol) continue;
    CurrencyUI[key] = function(k) {
        return function() { updateCurrencyCard(k); };
    }(key);
}

// Special handling for XP/Level (has its own section outside the dashboard)
CurrencyUI.xp = function() {
    const isUnlocked = Unl.get("level");
    document.getElementById("level-bar-section").style.display = isUnlocked ? "block" : "none";
    if (!isUnlocked) return;

    const progress = Cc.get("xp");
    const nextReq = Formulas.levelUpReq();

    document.getElementById("level").textContent = Cc.get("level");
    document.getElementById("level-progress-text").textContent = `${notation(progress, "xp")} / ${notation(nextReq, "xp")} Xp`;

    const pct = Math.max(0, Math.min(1, progress / nextReq));
    document.getElementById("level-bar-fill").style.width = `${Math.round(pct * 1000) / 10}%`;

    const levelColor = "#FFE040";
    setCurrencyIconStyle("icon-level", levelColor);
    setCurrencyCardBorder("level-card", levelColor);
};

export function globalUpdateUI() {
    for (const [, value] of Object.entries(CurrencyUI)) {
        value();
    }
}
