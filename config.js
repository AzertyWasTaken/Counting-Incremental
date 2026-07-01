"use strict";
import {Formulas} from "./formulas.js";

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
        cost: [20, 50, 150, 500, 2_000],
        max: 5,
        currency: "point",
        description:
            "Increase number by 1 every 2s.",
    },
    {
        name: "decCountCooldown",
        text: "Faster Count",
        cost: [100, 1_000, 10**6],
        max: 3,
        currency: "point",
        description:
            "Decrease count cooldown by 0.25s.",
    },
    {
        name: "incCount2",
        text: "Succession 2",
        cost: [150, 750, 4_000, 20_000, 100_000],
        max: 5,
        currency: "point",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "addCountAndCooldown",
        text: "Addition",
        cost: 20_000,
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
        cost: [10, 50, 1_000],
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
        cost: [10, 100_000],
        max: 2,
        currency: "point2",
        description:
            "Increase count multiplier by 10%.",
    },
    {
        name: "decIncrementCooldown",
        text: "Faster Increment",
        cost: [100, 10_000, 10**6, 10**9, 10**12],
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
    {
        name: "mulCount",
        text: "Multiplication",
        cost: [1, 1_000, 10**6],
        max: 3,
        currency: "reset2Point",
        description:
            "Multiply number by x1.05.",
    },
    {
        name: "incIncrement",
        text: "More Increments",
        cost: [10, 10**12],
        max: 2,
        currency: "reset2Point",
        description:
            "Increase base increment multiplier by 1.",
    },
    {
        name: "boostLevel",
        text: "Boost Levels",
        cost: 10_000,
        max: 1,
        currency: "reset2Point",
        description:
            "Increase level boost by 1% per level.",
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
    "reset2Point": {
        name: "Predecessor",
        symbol: "P",
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

export const RESETS = [
    {
        text: "Reset",
        reqCurrency: "point",
        reqValue: 500,
        gainCurrency: "resetPoint",
        gainValue: (n) => Formulas.nextResetPoint(n),
        reset: ["point"],
        description:
            "Reset Number upgrades.",
    },
    {
        text: "Predecessor",
        reqCurrency: "resetPoint",
        reqValue: 100_000,
        gainCurrency: "reset2Point",
        gainValue: (n) => Formulas.nextReset2Point(n),
        reset: ["point", "resetPoint"],
        description:
            "Reset Number and Negative Number upgrades.",
    },
]
