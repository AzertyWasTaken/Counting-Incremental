"use strict";
import {Formulas} from "./formulas.js";

const data = {
    count: {
        canClick: true,
        endTime: 0,
        interval: null,
        button: () => document.getElementById("count"),
        display: () => document.getElementById("count-cooldown"),
        getDuration: () => Formulas.countCooldown()
    },

    increment: {
        canClick: true,
        endTime: 0,
        interval: null,
        button: () => document.getElementById("increment"),
        display: () => document.getElementById("increment-cooldown"),
        getDuration: () => Formulas.incrementCooldown()
    }
};

export const Cooldown = {
    start(key) {
        const config = data[key];

        config.canClick = false;
        config.button().disabled = true;
        config.endTime = Date.now() + config.getDuration();

        if (config.interval) clearInterval(config.interval);

        // Immediate update for responsiveness
        config.display().textContent =
        (Math.ceil((config.endTime - Date.now()) / 100) / 10).toString();

        config.interval = setInterval(() => {
            const remainingMs = config.endTime - Date.now();
            if (remainingMs <= 0) {
                this.stop(key);
                return;
            }

            // Display seconds with one decimal place
            const remainingSec = Math.ceil(remainingMs / 100) / 10;
            config.display().textContent = remainingSec.toString();
        }, 50);
    },

    stop(key) {
        const config = data[key];

        config.canClick = true;
        config.button().disabled = false;
        config.endTime = 0;

        if (config.interval) clearInterval(config.interval);
        config.interval = null;

        config.display().textContent = "0";
    },

    ended(key) {
        return data[key]?.canClick;
    },
}

export function globalStopCooldown() {
    for (const [key, value] of Object.entries(data)) {
        Cooldown.stop(key);
    }
}
