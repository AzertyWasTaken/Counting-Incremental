"use strict";
import {CURRENCIES} from "./config.js";
import {notation} from "./notation.js";

function convertHex(hexCode, opacity = 1){
    var hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    
    return `rgba(${r},${g},${b},${opacity})`;
}

export const Elements = {
    new(type, parent, className) {
        const el = document.createElement(type);
        el.className = className;
        parent.appendChild(el);
        return el;
    },

    currIcon(parent, curr) {
        const currInfo = CURRENCIES[curr];

        const currencyIcon = this.new("span", parent, `cost-currency`);
        currencyIcon.textContent = currInfo.symbol;
        currencyIcon.title = currInfo.name;

        currencyIcon.style.color = currInfo.color;
        currencyIcon.style.background = convertHex(currInfo.color, 0.1);
        currencyIcon.style["border-color"] = convertHex(currInfo.color, 0.2);

        return currencyIcon;
    },

    currLabel(parent, curr, value) {
        const wrap = this.new("div", parent, "upgrade-cost");

        const currLabel = this.new("span", wrap, "cost-value"); 
        if (value !== undefined)
            currLabel.textContent = notation(value, curr, 4);

        const currIcon = this.currIcon(wrap, curr);

        return {currLabel, currIcon};
    }
}
