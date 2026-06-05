# Counting Incremental

A browser-based incremental/clicker game.

> ⚠️ **Warning:** this game is still in early development. Expect updates, bugs and potential data loss. ⚠️

## Run

Just open the page in a browser:

- `Incremental/index.html`

The game loads `game.js` as an ES module.

## How it works (high level)

### Core loop

- **Count**: manually increases **Score** (with a cooldown).
- **Auto Count**: adds score automatically every ~2 seconds.
- **Levels**: when unlocked, each manual **Count** adds XP; leveling increases the gains.

### Subtraction Points + reset

- When **Score** reaches the reset threshold, you can **Reset** to convert score into **Subtraction Points**.
- **RESET_REQUIREMENT** is defined in `config.js`.
- Reset clears **score-based** upgrades only; some upgrade types depend on Subtraction Points.

### Currencies

- **Number** (`score`)
  - Increased by **Count** and **Auto Count**.
  - Spent on score-based upgrades.
- **Negative Number** (`subtractionPoints`)
  - Earned when you **Reset**.
  - Spent on Subtraction Points upgrades.
- **XP** (`xp`) and **Level** (`level`)
  - Used for the Level Bar mechanic once unlocked.

### Upgrades

Upgrades are rendered dynamically from `config.js` (`UPGRADES`).  
Each upgrade has:

- a name + description
- a currency type
- a cost (number, array or formula)
- a max level/cap

### Save data

Player progress is persisted using `localStorage` under:

- `incremental.player`

The stored data includes:

- `playerCurrencies` (e.g. `score`, `subtractionPoints`, `xp`, `level`)
- `playerUpgrades`

You can erase saved data via the **Erase player data** button.

## Code map

- `index.html`: UI skeleton + loads `game.js`
- `style.css`: styling page
- `game.js`: gameplay logic, UI updates, save/load, upgrades rendering
- `config.js`: `RESET_REQUIREMENT` and the `UPGRADES` table
