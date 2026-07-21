"use strict";
const playerData = {
    upgrades: {},
    currencies: {},
    unlocked: {}
};

export const Upg = {
    get(key) {
        return playerData.upgrades[key] ?? 0;
    },

    set(key, value) {
        playerData.upgrades[key] = value;
    },

    inc(key, value) {
        this.set(key, this.get(key) + value);
    }
}

export const Cc = {
    get(key) {
        return playerData.currencies[key] ?? 0;
    },

    set(key, value) {
        playerData.currencies[key] = value;
    },

    inc(key, value) {
        this.set(key, this.get(key) + value);
    }
}

export const Unl = {
    get(key) {
        return playerData.unlocked[key] ?? false;
    },

    set(key, value) {
        playerData.unlocked[key] = value;
    }
}

export function getData() {
    return playerData;
}
