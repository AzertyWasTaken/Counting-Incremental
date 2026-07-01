"use strict";
const PREFIXES = ["K", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "D"];

function commas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function prefix(num, digits) {
    const magnitude = Math.log10(num);
    if (magnitude < digits + 2) return commas(num);

    const illion = Math.floor(magnitude / 3);
    const postfix = PREFIXES[illion - 1];
    if (!postfix) return scientific(num, digits);

    const number = Math.floor(num / 10**(illion * 3 - digits)) / 10**digits
    return number.toString() + postfix;
}

function scientific(num, digits) {
    const magnitude = Math.log10(num);
    if (magnitude < digits + 2) return commas(num);

    const postfix = `e${magnitude}`;
    const number = Math.floor(num / 10**(magnitude - digits)) / 10**digits

    return number.toString() + postfix;
}

export function notation(num, currency, digits = 6) {
    let costText = prefix(num, digits);
    if (currency === "resetPoint" && num > 0)
        costText = "-" + costText;
    return costText;
}
