# PRISM RIOT: Chaos Arena

A 4-player 3D arena party brawler in the spirit of early-2000s Capcom arena
fighters — collect **3 Power Stones** to transform, wreck everything in sight
with items and stage gimmicks, and out-chaos your friends on stages that are
falling apart around you.

> **Unofficial original homage.** This project is an original game design.
> All characters, names, stages, art and assets are original works inspired by
> the *style* of the genre. Not affiliated with, endorsed by, or containing
> assets from Capcom or any existing title.

---

## What's in this repo

| Path | What it is |
|---|---|
| `design/` | The complete game design bible (9 documents) |
| `prototype/` | A playable 3D web prototype (three.js) — 4-player local brawling |

### Design documents

| Doc | Contents |
|---|---|
| [`00-overview.md`](design/00-overview.md) | Vision, design pillars, core loop, mode table, art/audio direction |
| [`01-controls-and-combat.md`](design/01-controls-and-combat.md) | 5-button controls, **dodge-tap** defense (no block), combos → knockdowns, wall jumps, recovery rolls, damage math, juice budget |
| [`02-power-stones.md`](design/02-power-stones.md) | The signature system: stones, stealing, transformation, Power Gauge, Power Drives & Power Fusions, anti-snowball rules |
| [`03-characters.md`](design/03-characters.md) | **13 fighters**, stats, full movesets, powered forms, two Power Drives + two Power Fusions each |
| [`04-stages.md`](design/04-stages.md) | **8 multi-level stages** (airship break-up, submarines, castle, tomb, iceberg, space station, desert, final lab) with gimmicks, hazards and timed event timelines |
| [`05-items.md`](design/05-items.md) | ~75 items across 10 categories, drop tables, cards, vehicles, Handy Item registration |
| [`06-modes-and-progression.md`](design/06-modes-and-progression.md) | **1-on-1 Story, Arcade, Original, Adventure** — ladder structure, Item Shop, Furnace mixing (2 items + card), gold, streaks, unlocks |
| [`07-bosses.md`](design/07-bosses.md) | Giant bosses: the Sphinx-9 war machine and the monstrous Dr. Valerius, plus stage guardians |
| [`08-implementation-notes.md`](design/08-implementation-notes.md) | Engine choice, architecture, state machines, camera-director code, AI, data schemas, milestones, QA checklist |

---

## Play the prototype

```bash
cd prototype
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works; the page loads three.js from a CDN, so it needs
network access the first time.)

### Controls

| | P1 | P2 | Gamepad |
|---|---|---|---|
| Move | `WASD` | Arrows | Left stick / D-pad |
| Attack | `J` | `,` or numpad `1` | X / □ |
| Jump | `K` | `.` or numpad `2` | A / ✕ |
| Action | `L` | `/` or numpad `3` | B / ○ |
| Discard item | `I` | `;` or numpad `0` | Y / △ |

* **Tap a direction** → dodge step (invulnerability, the only defense)
* **Attack ×3** → ground combo ending in a knockdown · air attack in the air
* **Jump at a wall** → wall jump · **Action** = pick up / throw / grab / board turrets / use item
* **Collect 3 Power Stones** → transform · then **Attack**/**Action** = Power Drive,
  **Attack+Jump** / **Action+Jump** = Power Fusion
* Pads 3–4 are CPU (or gamepads), configured on the character-select screen.

### What the prototype demonstrates

All core systems from the design docs, verified end-to-end:

* 4-player shared-screen free-for-all (keyboard ×2, gamepads, CPU AI)
* Angled-overhead dynamic camera that zooms with fighter spread
* Dodge-tap i-frames, 3-hit combos → knockdowns, recovery rolls, wall jumps,
  air attacks, grab-and-throw, fall damage + respawn
* **Power Stone loop**: spawn pads, drop-on-knockdown theft, 3-stone transform
  (multiple simultaneous), Power Gauge drain, burnout, Power Drives, Power
  Fusions (chord inputs) with AoE knockback
* Items: boxes, 17 item types (melee/guns/bombs/food/buffs/traps/glue),
  throw, discard, use
* Stages: 2 stages (Sky Galleon Break-Up, Glacier Rumble) with multi-level
  platforms, boardable turrets, collapsing platforms, moving floes, bombing
  runs, tail sweeps and geyser storms
* Full match flow: title → character/stage select → fight → results with
  KOs/damage/gold/stones scoreboard

### QA hook

`window.PRISM` exposes the sim for testing (`PRISM.tick(1/60)`, `PRISM.game`,
`PRISM.spawnStoneAt([x,y,z])`, `PRISM.itemAt([x,y,z],'sword')`) — useful for
headless-browsing the balance knobs in `design/08`.

---

## Suggested production path

1. Vertical slice in Godot 4 (see `design/08` §1–2) — Sky Galleon, 2 fighters,
   stone loop, camera director.
2. Content spine: 13 fighters + 8 stages data-driven, 40 items.
3. Adventure economy (shop/furnace/cards) and both giant bosses.
4. Juice pass (transformation sequences, comic FX, audio), then ship.

The design docs contain tuning targets, frame data, damage formulas, and
JSON schemas ready to drop into a data-driven pipeline.