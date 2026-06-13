"use strict";
export const RESET_REQUIREMENT = 500;

export const UPGRADES = [
    {
        name: "incCount",
        text: "Succession",
        cost: (i) =>
            [5, 10, 30, 75, 200][i % 5] * 100**Math.floor(i / 5),
        max: 10,
        currency: "point",
        description:
            "Increase base count multiplier by 1.",
    },
    {
        name: "incAutoCount",
        text: "Auto Count",
        cost: [20, 50, 150, 500, 2000],
        max: 5,
        currency: "point",
        description:
            "Increase number by 1 every 2s.",
    },
    {
        name: "decCountCooldown",
        text: "Faster Count",
        cost: [100, 1000, 10**6],
        max: 3,
        currency: "point",
        description:
            "Decrease count cooldown by 0.25s.",
    },
    {
        name: "incCount2",
        text: "Succession 2",
        cost: [150, 750, 4000, 20000, 100000],
        max: 5,
        currency: "point",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "addCountAndCooldown",
        text: "Addition",
        cost: 20000,
        max: 1,
        currency: "point",
        description:
            "Increase count multiplier and cooldown by 100%.",
    },
    {
        name: "incXp",
        text: "Lesson",
        cost: [10**6, 10**9, 10**12],
        max: 3,
        currency: "point",
        unlock: "unlockLevelBar",
        description:
            "Increase base Xp multiplier by 1.",
    },
    {
        name: "incCount3",
        text: "Succession 3",
        cost: [1, 2, 5],
        max: 3,
        currency: "resetPoint",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "incAutoCount2",
        text: "Auto Count 2",
        cost: 3,
        max: 1,
        currency: "resetPoint",
        description:
            "Increase base auto count multiplier by 5.",
    },
    {
        name: "addCount",
        text: "Predecession",
        cost: [10, 50, 1000],
        max: 3,
        currency: "resetPoint",
        description:
            "Increase count multiplier by 20%.",
    },
    {
        name: "unlockLevelBar",
        text: "New Feature",
        cost: 100,
        max: 1,
        currency: "resetPoint",
        description:
            "Unlock Level Bar (boost number).",
    },
    {
        name: "addCount2",
        text: "Predecession 2",
        cost: [10, 10**5],
        max: 2,
        currency: "point2",
        description:
            "Increase count multiplier by 10%.",
    },
    {
        name: "decIncrementCooldown",
        text: "Faster Increment",
        cost: [100, 10**4, 10**6, 10**9, 10**12],
        max: 5,
        currency: "point2",
        description:
            "Decrease increment cooldown by 1s.",
    },
    {
        name: "incXp2",
        text: "Lesson 2",
        cost: [10**8],
        max: 1,
        currency: "point2",
        description:
            "Each increment worth 5 Xp.",
    },
];

export const CURRENCIES = {
    "point": {
        name: "Number",
        symbol: "N",
    },
    "resetPoint": {
        name: "Negative Number",
        symbol: "Z",
    },
    "point2": {
        name: "Successor",
        symbol: "S",
    },
    "level": {
        name: "Level",
    },
    "xp": {
        name: "Xp",
    },
};
