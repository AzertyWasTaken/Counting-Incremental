"use strict";
const PREFIXES = ["K", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "D"];

function writeCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function toNotation(num, digits = 6) {
    const magnitude = Math.log10(num);
    if (magnitude < digits + 2) return writeCommas(num);

    const illion = Math.floor(magnitude / 3);
    const postfix = PREFIXES[illion - 1] ?? "?";
    const number = Math.floor(num / 10**(illion * 3 - digits)) / 10**digits

    return number.toString() + postfix;
}
