# TODO

<!-- AGENT-SAFE START -->
This file is a shared task-board. When editing, only:

- Add new items
- Update checkboxes/status lines
- Do NOT delete headings or existing bullet ideas
<!-- AGENT-SAFE END -->

## Code

- [x] Object for upgrades infos
- [x] Object for bought upgrades
- [x] Save player data
- [x] Reset player data
- [x] Object for currencies
- [x] Select upgrade currency cost
- [x] Fix subtraction upgrades resetting
- [ ] Create currency test tool

## Gameplay

- [x] Counting upgrades
- [x] Max upgrading system
- [x] Reset for boosts (predecessor & subtraction points)
- [x] Create large numbers notation
- [x] Increase max upgrades (with functional cost rate)
- [x] Add levels mechanic
- [x] Show level bar
- [x] Make levels boost score

### Subtraction upgrades

- [x] +5 auto count points
- [x] Add 10% to the score (floored)
- [x] Unlock level bar (division & modulo points)

### G/Ideas

- New currency and button (not reseted by subtraction)
- Milestones
- Challenges
- Upgrading function
- 0.1s cooldown for buying upgrades
- Upgrades to keep stuff on reset
- Increase count by 10% per Successor upgrades

## Design

- [x] Reset player data
- [x] Create favicons
- [x] Display gain rate
- [x] Display currency used for cost
- [x] Style whole upgrade card
- [x] Disable upgrades when maxed
- [x] Style reset button
- [x] Style reset data
- [x] Hide subtractionPoints upgrades until after the first Reset
- [ ] Separate score and predecessor upgrades
- [ ] Show levels boost
- [ ] Rename `Subtraction Points` to `Negative Points`

## Adding Upgrades

- Make the game math-based
- Find various ways to speed up points gain
- Start with no constraints then review mechanics
- Pace and numbers gain must be balanced
- Avoid progression bottlenecks
