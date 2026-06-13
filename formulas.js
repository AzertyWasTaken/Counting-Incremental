"use strict";
import {RESET_REQUIREMENT} from "./config.js";
import {Cc, Upg} from "./playerData.js";

function getLevelBoost() {
    const isUnlocked = Upg.get("unlockLevelBar") > 0;
    return isUnlocked ? Cc.get("level") + 1 : 0;
}

export const Formulas = {
    autoCountBoost() {
        return Math.floor((
            Upg.get("incAutoCount")
            + Upg.get("incAutoCount2") * 5
        )
        * (getLevelBoost() * 0.05 + 1));
    },

    countBoost() {
        return Math.floor((1
            + Upg.get("incCount")
            + Upg.get("incCount2") * 2
            + Upg.get("incCount3") * 2
        )
        * (Upg.get("addCountAndCooldown") + 1)
        * (Upg.get("addCount") * 0.2 + 1)
        * (Upg.get("addCount2") * 0.1 + 1)
        * (getLevelBoost() * 0.05 + 1));
    },

    incrementBoost() {
        return 1;
    },

    xpCountBoost() {
        return Upg.get("incXp") + 1;
    },

    xpIncrementBoost() {
        return (Upg.get("incXp2") + 1) * 5;
    },

    countCooldown() {
        return (1_000
            - Upg.get("decCountCooldown") * 250
        ) 
        * (Upg.get("addCountAndCooldown") + 1);
    },

    incrementCooldown() {
        return 10_000
        - Upg.get("decIncrementCooldown") * 1_000;
    },

    nextResetPoint() {
        return Math.floor((Cc.get("point") / RESET_REQUIREMENT) ** 0.5);
    },

    levelUpReq() {
        const n = Cc.get("level");
        return [1, 2, 5][n % 3] * 10**Math.floor(n / 3) * 10;
    },
};
