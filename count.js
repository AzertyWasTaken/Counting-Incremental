"use strict";
import {CurrencyUI} from "./currenciesUI.js";
import {Formulas} from "./formulas.js";
import {persistPlayerData} from "./saveData.js";
import {Cc, Unl} from "./playerData.js";
import {Cooldown} from "./cooldown.js";
import {resetUpgUI} from "./upgradesUI.js";

function checkLevelUp() {
    for (let i = 0; i < 100; i++) {
        const requirement = Formulas.levelUpReq();
        if (Cc.get("xp") >= requirement) {
            Cc.inc("level", 1);
            Cc.inc("xp", -requirement);
        } else {
            break;
        }
    }

    // Unlock a new feature if `level` reaches a certain number
    if (Cc.get("level") >= 10 && !Unl.get("point2")) {
        Unl.set("point2", true);
        resetUpgUI();
        document.getElementById("increment-div").style.display = "block";
    }
}

export function count() {
    if (!Cooldown.ended("count")) return;

    Cc.inc("point", Formulas.countBoost());
    CurrencyUI.point();

    if (Unl.get("level")) {
        Cc.inc("xp", Formulas.xpCountBoost());
        checkLevelUp();
        CurrencyUI.xp();
    }

    persistPlayerData();
    Cooldown.start("count");
}

export function increment() {
    if (!Cooldown.ended("increment")) return;

    Cc.inc("point2", Formulas.incrementBoost());
    CurrencyUI.point2();

    if (Unl.get("level")) {
        Cc.inc("xp", Formulas.xpIncrementBoost());
        checkLevelUp();
        CurrencyUI.xp();
    }

    persistPlayerData();
    Cooldown.start("increment");
}
