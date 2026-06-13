"use strict";
import {namesHistory} from "./namesHistory.js";
import {getData, Upg, Cc} from "./playerData.js";

const LS_KEY_PLAYER = "incremental.player";

function safeParseJSON(raw) {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function loadObject(savedData, playerData, key, prevKey = key) {
    const savedObj = savedData[key] ?? savedData[prevKey];
    const playerObj = playerData[key];

    if (!savedObj || typeof savedObj !== "object") return;

    for (const [k, vRaw] of Object.entries(savedObj)) {
        const alt = vRaw ?? savedObj?.[namesHistory[key]?.[k]];
        if (alt === undefined || alt === null) continue;

        if (key === "unlocked") {
            // `unlocked` values are booleans (default should remain false).
            // Accept booleans, and also tolerate numeric 0/1.
            playerObj[k] = Boolean(alt);
        } else {
            // `upgrades` and `currencies` are numeric (non-negative integers).
            if (Number.isFinite(alt) && alt >= 0)
                playerObj[k] = Math.floor(alt);
        }
    }
}

export function loadPlayerData() {
    const raw = localStorage.getItem(LS_KEY_PLAYER);
    if (!raw) return;

    const parsed = safeParseJSON(raw);
    if (!parsed || typeof parsed !== "object") return;

    const pData = getData();
    if (!pData) return;

    loadObject(parsed, pData, "upgrades", "playerUpgrades");
    loadObject(parsed, pData, "currencies", "playerCurrencies");
    loadObject(parsed, pData, "unlocked");
}

export function persistPlayerData() {
    const pData = getData();
    if (!pData) return;

    try {
        localStorage.setItem(
            LS_KEY_PLAYER,
            JSON.stringify(pData)
        );

    } catch {
        // ignore
    }
}

function clearObject(obj) {
    for (const key of Object.keys(obj)) {
        delete obj[key];
    }
}

export function erasePlayerData() {
    const pData = getData();
    if (!pData) return;

    try {
        localStorage.removeItem(LS_KEY_PLAYER);
    } catch {
        // ignore
    }

    // Reset in-memory state
    clearObject(pData.currencies);
    clearObject(pData.upgrades);
    clearObject(pData.unlocked);

    // Rebuild upgrade nodes so button labels reset
    const upgradesEl = document.getElementById("upgrades");
    upgradesEl.innerHTML = "";
}
