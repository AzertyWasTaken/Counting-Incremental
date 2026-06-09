# TODO

<!-- AGENT-SAFE START -->
This file is a shared task-board. When editing, only:

- Add new items
- Update checkboxes/status lines
- Do NOT delete headings or existing bullet ideas
<!-- AGENT-SAFE END -->

## Code

- [x] Save player data
- [x] Reset player data
- [x] Select upgrade currency cost
- [x] Create currency test tool
- [x] Move upgrades and currencies into a module
- [x] Restore player data after rename

## Gameplay

- [x] Counting upgrades
- [x] Max upgrading system
- [x] Reset for boosts (predecessor & subtraction points)
- [x] Create large numbers notation
- [x] Subtraction upgrades
- [x] Add levels mechanic
- [ ] Upgrade that boost xp gain
  - [ ] Unlock with level bar
- [x] Make negative number actually negative <
- [ ] Currency obtainable by new click button with longer, separate cooldown, unlocked by reaching Level 10, named Successor
- [ ] New reset layer that reset subtractions and levels but not Successor, named Predecessor

### G/Ideas

- Multiply levels boost
- Milestone boosts
- Challenges (boost stuff when completed)
- 0.1s cooldown for buying upgrades
- Upgrades to keep stuff on reset
- Increase count by 10% per Successor upgrades
- Compound boost

## Design

- [x] Reset player data
- [x] Create favicons
- [x] Display score gain rate
- [x] Revamp upgrade card design
- [x] Hide subtractionPoints upgrades before the first Reset
- [x] Show levels boost
- [x] Rename `Subtraction Points` to `Negative Points`
- [ ] Separate score and predecessor upgrades
- [ ] Auto copy currency names in upgrades descriptions

## Adding Upgrades

- Make the game math-based
- Find various ways to speed up points gain
- Start with no constraints then review mechanics
- Pace and numbers gain must be balanced
- Avoid progression bottlenecks
