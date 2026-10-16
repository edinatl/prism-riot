# PRISM RIOT: Chaos Arena — 00 · Game Overview

Working title: **PRISM RIOT: Chaos Arena** (codename "Stone Chaos").
Genre: 3D arena party brawler for 1–4 players, shared screen.
Spirit: chaotic party fun — anime cartoon fighters, vibrant colors, exaggerated
squash-and-stretch animation, constant item mayhem, and a stage that is trying
to kill everyone.

> DESIGN HOMAGE: This is an original game designed in the *style* of classic
> early-2000s Capcom 3D arena brawlers (Power Stone 2 et al.). All characters,
> names, stages, art, audio and assets in this project are original works. Do
> not use Capcom trademarks, character names, or ripped assets.

---

## 1. Design Pillars

1. **Everyone is playing in 30 seconds.** One stick + four buttons. No block
   button, no motion inputs, no menu-diving mid-fight. Depth comes from the
   world, not from the controller.
2. **The stage is the fifth fighter.** Every arena is collapsing, moving,
   flooding, spinning or exploding at all times. Environmental kills are the
   best stories.
3. **The 3-stone loop is the heartbeat.** Scramble → collect 3 Power Stones →
   transform → rampage → burn out → scramble again. The transformation is a
   party moment every time it happens, and several players can pop off at once.
4. **Items are verbs.** Guns, swords, hammers, bombs, roller blades, glue,
   spoons. 70+ items so no two rounds play alike.
5. **Readable chaos.** Big silhouettes, saturated palette, huge hit sparks,
   camera that always frames the action. Four players must stay legible.

## 2. Core Loop (one round)

```
run & jump  →  punch things  →  break item boxes  →  grab gear
     ↑                                                      ↓
re-gather stones ← burnout ← Power Fusion ← transform ← collect 3 stones
     ↓
 knockdowns drop stones + gold  →  KO the leader  →  last 2 (or 1) standing win
```

Match flow: **Select → 150–180 s match → results (KOs, gold, streak, items)
→ next stage / shop / continue.**

## 3. The Five Inputs

| Input | Action | Notes |
|---|---|---|
| **Move** | 360° analog / D-pad | Full analog movement, facing follows stick |
| **Attack** | Punch / weapon swing | Chains into ground combos; while transformed: Power Drive |
| **Jump** | Jump / wall jump / double jump | Cancel windows; combos with Attack & Action |
| **Action** | Pick up, throw, grab, board, climb, interact, use item | The "do anything clever" button |
| **Discard Item** | Throw / drop held item | Frees your hand instantly; thrown items hurt |

Modifier combos (see `01-controls-and-combat.md`):

* **Attack + Jump** → Power Fusion A (consumes Power Gauge)
* **Action + Jump** → Power Fusion B (consumes Power Gauge)

## 4. Signature Systems (links)

| System | Doc |
|---|---|
| Movement, dodging, combos, knockdowns, wall jumps | `01-controls-and-combat.md` |
| Power Stones, transformation, Power Gauge, Drives & Fusions | `02-power-stones.md` |
| Roster, stats, full movesets, powered forms | `03-characters.md` |
| Stage layouts, gimmicks, hazards, event timelines | `04-stages.md` |
| Item list, drop tables, furnace recipes, handy registration | `05-items.md` |
| 1-on-1 / Arcade / Original / Adventure, shop, gold, cards | `06-modes-and-progression.md` |
| Sphinx robot, monstrous scientist and other bosses | `07-bosses.md` |
| Engine, architecture, data schemas, camera code, milestones | `08-implementation-notes.md` |

## 5. Modes at a Glance

| Mode | Players | Structure | Payoff |
|---|---|---|---|
| **1-on-1 Story** | 2 (human/CPU) | Duel through 8 stage chapters vs CPU rivals, escape the Floating Castle | Story cutscenes, per-character ending |
| **Arcade** | 4 | 4-fighter bouts across 5 rounds + 2 boss fights; **top 2 advance** each round | Boss fights, high score, streaks |
| **Original** | 1–4 | Free battle: any character, any stage, FFA or teams (2v2) | Pure chaos, item frequency & hazard sliders |
| **Adventure** | 1–4 co-op/FFA | Runs through the castle with persistent inventory, gold, cards, Item Shop and Furnace | Meta-progression, collection, registered Handy Items |

## 6. Visual & Audio Direction

* **Camera:** angled overhead (approx. 35–50° pitch), dynamic framing: pulls
  back when fighters spread out, dives in on 1v1 moments and transformations.
* **Characters:** 3D anime proportions (heroic 5.5-head chibi-adult hybrid),
  thick outlines in gameplay silhouettes, exaggerated anticipation + follow-
  through, hit-stop 60–90 ms on heavy blows, squash/stretch on landings.
* **Palette:** saturated primaries per character; stages built from 3–4 bright
  hues plus high-contrast hazard colors (warning = amber/red flashes).
* **FX language:** impact starbursts (shape encodes damage level), dust puffs on
  landings, ink-splash color wipe on transformation, comic onomatopoeia stamps
  on big hits ("KRAK!", "BAM!", "WHOMP!").
* **Audio:** whistles, brass stings and marimba chaos; per-character voice
  barks ("Got one!", "Three stones—let's GO!"); transformation fanfares are
  unique per character; announcer calls stage events ("TAIL BREAK!").

## 7. Product Targets

* Platforms: PC / consoles. Shared-screen local 1–4 players first.
* Optional online: rollback netcode for 2 players, delay-based for 4 (see 08).
* Session length: 3-minute matches; Adventure runs 20–40 min.
* Rating target: Everyone 10+ / PEGI 7 — comic violence, no blood, enemies
  poof into sparkles and stars.

## 8. Modes → Rules Quick Table

| Rule | 1-on-1 | Arcade | Original | Adventure |
|---|---|---|---|---|
| Fighter count | 2 | 4 | 2–4 | 2–4 |
| HP pools | 450 | 400 | 400 (slider) | 400 + gear |
| Time limit | 150 s | 180 s | 60–300 s | none (per floor) |
| Advancement | win = next chapter | top 2 of 4 advance | n/a | clear all foes |
| Stones in stage | 6 live | 8 live | 4–12 live | 8 live |
| Items | sparse | normal | 0–200% density | normal + inventory |
| Gold | no | per round | optional | yes, shared wallet |
| Boss | chapter bosses | Round 3 & 5 | optional toggle | floor bosses |
| Friendly fire | on | on | toggle | on (FFA) / off (co-op) |

## 9. What "Winning" Means

* **KO** = last fighter standing wins the match.
* **Time out** = standings by: (1) alive, (2) HP %, (3) KOs, (4) gold grabbed.
* **Arcade / Story 4-fights** = top 2 HP% advance; the other two are eliminated
  but their dropped gold and items go to the winners (chaos tax).
* **Streaks** = consecutive match wins in Original/Adventure grant escalating
  gold multipliers (x1.0 → x2.0 over 5 wins) and a visible crown glow.