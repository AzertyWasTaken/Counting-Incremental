"use strict";
import {Cc} from "./playerData.js";

export const UPGRADES = [
    {
        name: "incCount",
        text: "Succession",
        cost: (lvl) =>
            [5, 10, 30, 75, 200][lvl % 5] * 100**Math.floor(lvl / 5),
        max: 10,
        currency: "point",
        description:
            "Increase base count multiplier by 1.",
    },
    {
        name: "incAutoCount",
        text: "Auto Count",
        cost: [20, 50, 150, 500, 2_000],
        currency: "point",
        description:
            "Increase number by 1 every 2s.",
    },
    {
        name: "decCountCooldown",
        text: "Faster Count",
        cost: [100, 1_000, 10**6],
        currency: "point",
        description:
            "Decrease count cooldown by 0.25s.",
    },
    {
        name: "incCount2",
        text: "Succession 2",
        cost: [150, 750, 4_000, 20_000, 100_000],
        currency: "point",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "addCountAndCooldown",
        text: "Addition",
        cost: 20_000,
        currency: "point",
        description:
            "Increase count multiplier and cooldown by 100%.",
    },
    {
        name: "incXp",
        text: "Lesson",
        cost: [10**6, 10**9, 10**12],
        currency: "point",
        unlock: "level",
        description:
            "Increase base Xp multiplier by 1.",
    },
    {
        name: "incCount3",
        text: "Succession 3",
        cost: [1, 2, 5],
        currency: "resetPoint",
        description:
            "Increase base count multiplier by 2.",
    },
    {
        name: "incAutoCount2",
        text: "Auto Count 2",
        cost: 3,
        currency: "resetPoint",
        description:
            "Increase base auto count multiplier by 5.",
    },
    {
        name: "addCount",
        text: "Predecession",
        cost: [10, 50, 1_000],
        currency: "resetPoint",
        description:
            "Increase count multiplier by 20%.",
    },
    {
        name: "unlockLevel",
        text: "New Feature",
        cost: 100,
        currency: "resetPoint",
        description:
            "Unlock Level bar (boost Number).",
    },
    {
        name: "incSuccessor",
        text: "Success",
        cost: [20_000, 100_000, 10**6, 10**8, 10**12],
        currency: "resetPoint",
        unlock: "point2",
        description:
            "Increase base Successor multiplier by 1.",
    },
    {
        name: "addCount2",
        text: "Predecession 2",
        cost: [10, 100_000],
        currency: "point2",
        description:
            "Increase count multiplier by 10%.",
    },
    {
        name: "decIncrementCooldown",
        text: "Faster Increment",
        cost: [100, 10_000, 10**6, 10**9, 10**12],
        currency: "point2",
        description:
            "Decrease increment cooldown by 1s.",
    },
    {
        name: "incXp2",
        text: "Lesson 2",
        cost: 10**8,
        currency: "point2",
        description:
            "Each increment worth 5 Xp.",
    },
    {
        name: "mulCount",
        text: "Multiplication",
        cost: [1, 1_000, 10**6],
        currency: "reset2Point",
        description:
            "Multiply number by x1.05.",
    },
    {
        name: "incIncrement",
        text: "More Increments",
        cost: [10, 10**12],
        currency: "reset2Point",
        description:
            "Increase base increment multiplier by 1.",
    },
    {
        name: "boostLevel",
        text: "Boost Levels",
        cost: 10_000,
        currency: "reset2Point",
        description:
            "Increase level boost by 1% per level.",
    },
    {
        name: "mulIncrement",
        text: "Multiplication 2",
        cost: [1, 10**24],
        currency: "resetPoint2",
        description:
            "Double increments gain.",
    },
];

export const CURRENCIES = {
    "point": {
        name: "Number",
        symbol: "N",
        color: "#40FFA0"
    },
    "resetPoint": {
        name: "Negative Number",
        symbol: "Z",
        color: "#FF6040"
    },
    "reset2Point": {
        name: "Predecessor",
        symbol: "P",
        color: "#FF40A0"
    },
    "point2": {
        name: "Successor",
        symbol: "S",
        color: "#FFE040"
    },
    "resetPoint2": {
        name: "Addend",
        symbol: "A",
        color: "#FFA040"
    },
    "level": {
        name: "Level"
    },
    "xp": {
        name: "Xp"
    },
};

export const RESETS = [
    {
        text: "Reset",
        reqCurrency: "point",
        reqValue: 500,
        gainCurrency: "resetPoint",
        gainValue: () => Math.floor((Cc.get("point") / 500) ** 0.5),
        reset: ["point"],
        description:
            "Reset Number upgrades.",
    },
    {
        text: "Rebirth",
        reqCurrency: "resetPoint",
        reqValue: 10_000,
        gainCurrency: "reset2Point",
        gainValue: () => Math.floor((Cc.get("resetPoint") / 10_000) ** 0.5),
        reset: ["point", "resetPoint"],
        unlock: "resetPoint",
        description:
            "Reset Number & Negative Number upgrades.",
    },
    {
        text: "Ascend",
        reqCurrency: "point2",
        reqValue: 10**12,
        gainCurrency: "resetPoint2",
        gainValue: () => Math.floor((Cc.get("point2") / 10**12) ** 0.5),
        reset: ["point", "point2"],
        unlock: "point2",
        description:
            "Reset Number & Successor upgrades.",
    },
]
