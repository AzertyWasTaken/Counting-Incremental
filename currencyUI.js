"use strict";
import {toNotation} from "./notation.js";
import {Formulas} from "./formulas.js";
import {Upg, Cc} from "./playerData.js";

export const CurrencyUI = {
    point() {
        document.getElementById("score").textContent = toNotation(Cc.get("point"));
        document.getElementById("next-reset-subtraction-points").textContent = "-" + toNotation(Formulas.nextResetPoint());
    },

    resetPoint() {
        const value = Cc.get("resetPoint");
        const sign = value > 0 ? "-" : "";
        document.getElementById("subtraction-points").textContent = sign + toNotation(value);
    },

    xp() {
        const unlocked = Upg.get("unlockLevelBar") >= 1;
        document.getElementById("level-bar-section").style.display = unlocked ? "block" : "none";
        if (!unlocked) return;

        const progress = Cc.get("xp");
        const nextReq = Formulas.levelUpReq();

        document.getElementById("level").textContent = Cc.get("level");
        document.getElementById("level-progress-text").textContent = `${toNotation(progress)} / ${toNotation(nextReq)} Xp`;

        const pct = Math.max(0, Math.min(1, progress / nextReq));
        document.getElementById("level-bar-fill").style.width = `${Math.round(pct * 1000) / 10}%`;
    },

    point2() {
        document.getElementById("point2-display").textContent = toNotation(Cc.get("point2"));
    },
}

export function globalUpdateUI() {
    for (const [key, value] of Object.entries(CurrencyUI)) {
        value();
    }
}
