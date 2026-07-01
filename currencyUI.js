"use strict";
import {notation} from "./notation.js";
import {Formulas} from "./formulas.js";
import {Upg, Cc} from "./playerData.js";
import {UpdResetDisplay} from "./reset.js";

export const CurrencyUI = {
    point() {
        document.getElementById("score").textContent = notation(Cc.get("point"), "point");
        if (UpdResetDisplay.point) UpdResetDisplay.point();
    },

    resetPoint() {
        document.getElementById("subtraction-points").textContent = notation(Cc.get("resetPoint"), "resetPoint");
    },

    xp() {
        const unlocked = Upg.get("unlockLevelBar") >= 1;
        document.getElementById("level-bar-section").style.display = unlocked ? "block" : "none";
        if (!unlocked) return;

        const progress = Cc.get("xp");
        const nextReq = Formulas.levelUpReq();

        document.getElementById("level").textContent = Cc.get("level");
        document.getElementById("level-progress-text").textContent = `${notation(progress, "xp")} / ${notation(nextReq, "xp")} Xp`;

        const pct = Math.max(0, Math.min(1, progress / nextReq));
        document.getElementById("level-bar-fill").style.width = `${Math.round(pct * 1000) / 10}%`;
    },

    point2() {
        document.getElementById("point2-display").textContent = notation(Cc.get("point2"), "point2");
    },
}

export function globalUpdateUI() {
    for (const [key, value] of Object.entries(CurrencyUI)) {
        value();
    }
}
