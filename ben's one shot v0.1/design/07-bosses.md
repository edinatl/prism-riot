# 07 · Bosses & Giant Fights

Bosses are giant, absurd and readable: huge telegraphs, destructible parts,
interactive stage objects, and a phase structure that rewards panic.

Boss universal rules:
* Bosses have a **Poise bar** (below HP). Enough hits stagger it → 3 s of
  bonus damage ("BREAK!").
* **Multiple players are expected.** Boss HP scales: 60% (1 fighter) →
  100% (3–4 fighters).
* Fighters can transform during boss fights; Power Fusions deal 2× to bosses.
* Boss attacks never hard-kill: max 45 damage per hit, always survivable.

---

## 1. SPHINX-9 — "The Masked Men's War Machine"

**Where:** Arcade Round 3 / Adventure floor 5 / Pyramid of the Masked Men.
**What:** a colossal stone-and-brass sphinx robot with masked cultist pilots
riding in the head, chest and paws. Think stone lion tank with laser eyes.

| Stats | Value |
|---|---|
| HP | 4000 (scales 60–100%) |
| Poise | 800 (stagger every ~15 s of focus fire) |
| Size | 18 m long, 12 m tall |

**Phases**

| Phase | HP threshold | New moves |
|---|---|---|
| 1 · PROWL | 100–70% | **Paw Swipe** (35 dmg, 8 m cone), **Sand Blast** (25 dmg line), **Pounce** (jump & crash, 40 dmg, 6 m) |
| 2 · UNLEASHED | 70–35% | **Laser Eyes** (sweeping 20 dmg/s beams), **Tail Sweep** (30 dmg), **Rocket Paws** (fires 4 rockets) |
| 3 · OVERDRIVE | <35% | **Sand Vortex** (pulls fighters in), **Self-Repair** (heals unless masked pilots are thrown off), **Mega Beam** (charge 2 s → 45 dmg across the arena) |

**Interactive parts (break for damage & loot)**
* **Head (mask pilots)** — break = Laser Eyes disabled + 300 dmg + card drop.
* **Front paws** — break = Paw Swipe disabled + 250 dmg each.
* **Chest core** — exposed after 3 staggers: 2× damage, cannot regenerate.
* **Tail** — break = Tail Sweep disabled + 200 dmg + gold burst.

**Stage gimmicks**
* 4 pillars for cover during Mega Beam (pillars shatter after 2 uses each).
* **Ballista stations** (2): 40 dmg per bolt to boss parts; essential for
  staggering without transforming.
* Falling hieroglyph blocks (boss-attack telegraphs double as player weapons:
  throw the blocks back for 20 dmg).

**Gimmick moments**
* After each phase change the Sphinx **roars** and all fighters get blown
  back — Stone scramble on the floor resets the rhythm.
* Masked pilots can be **grabbed and thrown** (Action near a damaged head) for
  big damage and comedy ("MY MASK!").

**Rank thresholds (Adventure boss medals)**
S: <150 s clear · A: <240 s · B: clear.

---

## 2. DR. VALERIUS — "The Monstrous Scientist"

**Where:** Adventure floor 10 / Chaos Lab finale / 1-on-1 Story chapter 8.
**What:** the scientist injects himself with unstable Prism serum and mutates
into a towering bio-mechanical monster fused with lab machinery (arms like
pipes, one giant prism eye, coat fused into hide). Still monologuing.

| Stats | Value |
|---|---|
| HP | 6000 (scales 60–100%) |
| Poise | 1200 |
| Size | 20 m tall (arms reach 14 m) |

**Phases**

| Phase | HP threshold | New moves |
|---|---|---|
| 1 · MELTING POINT | 100–70% | **Slam** (38 dmg), **Chemical Spray** (25 dmg cone + slow), **Lab Grab** (seizes a fighter, chomp 40 dmg total; mash to escape) |
| 2 · PRISM HEART | 70–35% | **Laser Sweep** (20 dmg/s beams from the prism eye), **Black Hole Generator** (pulls fighters toward the reactor), **Minion Spawn** (6 lab drones, 40 HP each) |
| 3 · ECLIPSE FORM | <35% | **Meteor Vomit** (marked zones, 30 dmg each), **Floor Collapse** (walkways fall; the arena shrinks), **Desperation Beam** (3 s charge, 45 dmg line, must hide behind blast shutters) |

**Interactive parts**
* **Prism Eye** — 1500 HP; destroy it to stop laser sweeps and open a 2×
  damage window on the chest (core phase).
* **Pipes/arms** — break each arm to end that arm's grab/slam set (250 HP).
* **Blast Shutters** — Action raises a shutter (cover for Desperation Beam).
* **Overload Console** — 3 consoles on the catwalks; activate all 3 during
  Phase 3 to force a 6 s stun ("SYSTEM FAILURE!") for a burst-damage window.

**Stage gimmicks**
* Two-tier arena (lab floor + catwalks) so vertical play matters.
* Tesla columns zap random fighters (and the boss for 50 dmg if it's near).
* Dr. Valerius's ego: taunts every 45 s; interrupting him with a Power Fusion
  during a taunt grants +100 score and a secret voice line.

**Rank thresholds:** S: <200 s · A: <320 s · B: clear.

---

## 3. Mid-Bosses & Stage Guardians

| Boss | Stage | Size gimmick | Signature attacks |
|---|---|---|---|
| **BLAZE BOMBER** (bomber plane) | Sky Galleon | Fights while flying, loops | Carpet bombs, strafing runs; shoot it with turret shells (30 dmg) or thrown items |
| **DREADNOUGHT KRAKEN** | Submarine Bay | Tentacles grab platforms | Tentacle slam (30), ink blind, torpedo barrage; cut tentacles with weapons |
| **ICE WHALE** | Glacier Rumble | Whole arena is its back | Tail sweep (wave), blowhole launch, breach (arena tilts!) |
| **TOMB GUARDIAN** | Tomb | Sarcophagus golem | Boulder roll, hieroglyph beam, scarab swarm; break its crown |
| **STATION AI CORE** | Space Station | Rotating ring arena | Laser grid choreography, drone swarms, gravity flips |
| **SANDWORM EMPRESS** | Desert | Erupts from below | Bite, sand geyser, swallow (KO unless you mash); lure her into the mine carts |

Mid-bosses are 2-minute set pieces: low HP (1500–2500), one gimmick each, and
they always drop a Rare+ item and a card.

---

## 4. Boss Fight Design Rules

1. **Telegraphs:** every attack has a 0.7–1.2 s wind-up with a colored ground
   marker (red = hit zone, amber = wind-up, blue = safe shift).
2. **Never off-screen:** the boss's biggest attacks force camera pull-back.
3. **Interactivity first:** at least 3 stage objects affect the boss
   (ballista, consoles, thrown debris, vehicles).
4. **Comeback:** at <25% boss HP, item drop rate doubles; Prisms appear.
5. **Anti-frustration:** if all fighters are knocked down simultaneously, the
   boss skips its next attack (breather).
6. **Co-op beats greed:** many boss attacks punish clustering; Stone thefts
   still work between players — the boss is the common enemy, but winning the
   boss floor still has an individual ranking.