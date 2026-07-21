"use strict";
import {persistPlayerData} from "./saveData.js";
import {Upg, Cc, Unl} from "./playerData.js";

// Data is not saved during testing mode
export const ENABLED = false;

export function initTest() {
    if (!ENABLED) return;

    document.getElementById("test-warning").textContent =
    "DEV BUILD: debug entrypoints enabled (do not publish this file).";

    Upg.set("unlockLevel", 1);
    Unl.set("point2", true);
    Cc.set("point", 1_000);
    Cc.set("level", 10)

    persistPlayerData();
}
