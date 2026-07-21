"use strict";
import {Cc, Upg, Unl} from "./playerData.js";
// Formulas for gaining currencies
// Excludes resets gains and upgrades costs

function getLevelBoost() {
    return Unl.get("level") ? Cc.get("level") + 1 : 0;
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
        return Math.floor(
            (
                1
                + Upg.get("incCount")
                + Upg.get("incCount2") * 2
                + Upg.get("incCount3") * 2
            )
            * (Upg.get("addCountAndCooldown") + 1)
            * (Upg.get("addCount") * 0.2 + 1)
            * (Upg.get("addCount2") * 0.1 + 1)
            * (getLevelBoost() * (0.05 + Upg.get("boostLevel") * 0.01) + 1)
            * 1.05**Upg.get("mulCount")
        );
    },

    incrementBoost() {
        return (Upg.get("incIncrement") + 1)
        * 2**Upg.get("mulIncrement");
    },

    xpCountBoost() {
        return Upg.get("incXp") + 1;
    },

    xpIncrementBoost() {
        return Upg.get("incXp2") * 5;
    },

    countCooldown() {
        return Math.max(0,
            1_000
            - Upg.get("decCountCooldown") * 250
        )
        * (Upg.get("addCountAndCooldown") + 1);
    },

    incrementCooldown() {
        return Math.max(0,
            10_000
            - Upg.get("decIncrementCooldown") * 1_000
        );
    },

    levelUpReq() {
        const n = Cc.get("level");
        return [1, 2, 5][n % 3] * 10**Math.floor(n / 3) * 10;
    },
};
