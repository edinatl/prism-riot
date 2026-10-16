# 01 · Controls & Combat

One stick. Four buttons. **No block.** Defense is movement, timing and nerve.

---

## 1. Input Map

### 1.1 Buttons

| Button | Neutral | In air | While transformed | With item in hand |
|---|---|---|---|---|
| **Attack** | Ground combo | Air attack | **Power Drive A** (gauge cost) | Swing / fire weapon |
| **Jump** | Jump, wall jump, double jump | Air step (some chars) | — (combos with others) | — |
| **Action** | Pick up, grab, board, climb, interact | Air throw / air item use | **Power Drive B** (gauge cost) | Use item (eat, throw, deploy) |
| **Discard** | Throw/drop held item; with empty hands: character quirk (e.g. stance change) | Drop/throw downward | Same | Throw item forward |

**Chord inputs** (press within 5 frames / 83 ms of each other):

| Chord | Result |
|---|---|
| **Attack + Jump** | **Power Fusion A** (only while transformed; costs gauge) |
| **Action + Jump** | **Power Fusion B** (only while transformed; costs gauge) |

If not transformed, the chord is a normal Attack + Jump (jump-cancelled
attack). This keeps mashing safe.

### 1.2 Reference bindings

Gamepad (XInput / DualSense): Left Stick = Move, D-pad = Move (digital),
**X/□ = Attack**, **A/✕ = Jump**, **B/○ = Action**, **Y/△ = Discard**.

Keyboard (prototype & PC): P1 `WASD + J/K/L/I`, P2 `Arrows + , . / ;`.

---

## 2. Movement

* **Analog 360° movement.** Speed ramps 0→100% over 0.18 s; release decays in
  0.22 s. Facing snaps to the stick direction with a 0.1 s turn blend.
* **Turn speed** is high (almost instant at low speed) — power-sliding corners
  feel toylike, not sim-like.
* **Jump:** base impulse `vy = 13.5 m/s`, gravity `-34 m/s²`, apex ~2.7 m.
  Hold Jump for +8% height (0.12 s variable window). Most characters get a
  **double jump** at 75% power; heavy characters get a single huge jump.
* **Wall jump:** touching a vertical surface (stage wall, pillar, vehicle
  side) + Jump → kick off at 12 m/s away from wall, 0.25 s invulnerability,
  re-jump available. Wall jumps chain into air attacks, and **wall cling**
  (hold toward the wall) is available to agile characters (Hanabi, Zephyr).
* **Ceiling play:** selected stages have ceiling beams/nets (Tomb, Castle).
  Jump into a cling surface and press Action to hang; Attack drops an air
  attack from above.
* **Falling off the stage:** the arena floats! Falling below the kill plane
  costs 35 damage and respawns you 3 s later on a rescue platform with 1.2 s
  invulnerability — unless it was a ranked match point, where it is a KO.

### 2.1 Stage physics quirks (per stage)

| Friction tag | Effect |
|---|---|
| `normal` | 1.0 grip |
| `ice` | 0.28 grip, momentum slides, longer dodge distance |
| `sand` | 0.8 grip, 15% slower run, no slide |
| `water` | swim = 60% speed, jump = water hop, extinguishes burn |
| `lowgrav` | gravity × 0.62, jumps +40%, floaty dodges |

---

## 3. Defense Without a Block Button

There is **no traditional blocking**. Every fighter has exactly these defensive
tools, all of which cost positioning or timing:

### 3.1 Dodge-Tap ("Flash Step") — the core defensive mechanic

**Tap a direction (stick flick or D-pad tap) from neutral** and your fighter
performs a quick sidestep dash:

| Property | Value |
|---|---|
| Dash distance | 1.6 m (3.0 m on ice) |
| Dash duration | 0.22 s |
| Invulnerability | 0.30 s from dash start |
| Cooldown | 0.55 s (cannot chain infinitely) |
| Cancels | attack recovery, item-use recovery, landing lag |

* The tap must START from neutral within 150 ms — holding a direction and
  then flicking further does **not** dodge; it just runs. This makes "tap the
  instant before it lands" a deliberate, learnable skill.
* **PERFECT DODGE:** if invulnerability absorbs a hit that would have dealt
  ≥10 damage, time slows to 25% for 0.35 s, the attacker is briefly flashed
  ("MISS!"), and the dodger's next attack within 1.5 s gains **+30% damage**.
* Dodge-tap does not work while: bracing (Grimjaw), riding a vehicle, glued to
  the floor (Adhesive Spray), or in burnout.

### 3.2 Other defensive verbs

* **Jump out / air drift** — airborne hurtboxes move with you; air-dodges exist
  only for characters with Air Step.
* **Knockback trading** — some heavy attacks have super armor (take the hit,
  keep attacking).
* **Recovery roll** (see §5) — invulnerable get-up is the reset button.
* **Item defense** — Shield, Mirror Shield, Iron Cape, Smoke Bomb, and simply
  being invisible (Elixir) or far away with a gun.

### 3.3 Attack timing grammar (all normal attacks)

| Phase | Ground jab | Ground finisher | Air attack | Dash attack |
|---|---|---|---|---|
| Startup | 0.10 s | 0.18 s | 0.12 s | 0.14 s |
| Active | 0.08 s | 0.12 s | 0.20 s | 0.16 s |
| Recovery | 0.16 s | 0.30 s | 0.10 s (land-cancel) | 0.24 s |
| Hit-stop | 45 ms | 90 ms | 60 ms | 70 ms |

---

## 4. Offense

### 4.1 Ground combo (3 hits → knockdown)

Every character has the same *shape*, different *flavor*:

| Slot | Timing window to chain | Property | Default damage |
|---|---|---|---|
| **G1** | after G1 active frames, 0.35 s window | quick, low knockback | 6–10 |
| **G2** | 0.40 s window | medium, pulls foe in slightly | 6–11 |
| **G3 (finisher)** | — | **launcher / sweep → hard knockdown** | 10–16 |

* Chaining uses a generous **input buffer** (0.18 s): press Attack before the
  previous hit recovers and the next hit comes out on the first possible frame.
* G3 always produces a **knockdown** (unless the target has super armor or is
  already airborne — airborne targets are spiked to the ground instead).
* Dash attack = pseudo-launcher; running into a G-combo counts as G1.

### 4.2 Air game

* **Air attack:** per character (axe kick, dive kick, plunge, multi-hit spin).
  Landing during the active window creates a small **landing shockwave** (0.6 m,
  4 damage) for heavy characters.
* **Air throw:** press Action near an airborne foe → grab and slam them down
  (13 damage, guaranteed knockdown).
* **Double jump** and **Air Step** (Zephyr, Hanabi) extend air combos;
  wall jumps refresh the air-step counter.

### 4.3 Grabbing & throwing

* **Action near a foe (grounded)** = grab. Struggle for 0.6 s (mash to escape
  earlier). Then:
  * **Attack** while holding → punch flurry (18 damage total).
  * **Action** while holding → character throw (12–18 damage, big knockback).
  * **Move toward a wall / ledge / hazard** = environmental KO potential
    (spike pits, train tracks, lava, propellers).
* **Lasso-style grabs** (Deadeye Rok) work at 5 m and beat dodge-taps if the
  flick happens *after* the rope connects.
* Grabbed fighters cannot dodge; allies with friendly fire on can hit you free.

### 4.4 Knockdown & recovery

| State | Duration | Options |
|---|---|---|
| **Slammed (soft knockdown)** | 0.9 s lie flat | Jump = **recovery roll** (0.35 s, invulnerable, travels 2.2 m) |
| **Hard knockdown** (heavy / spikes) | 1.4 s, stars over head | Direction + Jump = roll; plain get-up has 0.25 s vulnerability |
| **Downed & hit again** | extends lie time | Juggling is limited: max 2 extra hits, then burnout immunity 1.2 s |

**Knockdown drops:** when a fighter is knocked down while carrying Power Stones
or gold, loot pops out and scatters:

* Carried **Power Stones** fly out in an arc and can be picked up by anyone
  (including the victim) after 0.6 s.
* **Gold** coins spill (30–60% of carried gold, capped at 25 coins).
* If the knockdown came from a Power Fusion or a stage hazard, ALL stones drop.

### 4.5 KO

* HP reaches 0 → **dramatic launch** (2× knockback, sparkle poof on landing),
  camera punch-in, slow-mo 0.5 s, then the fighter is out (or respawn in
  endless/Adventure modes).
* On KO: all remaining stones scatter, all gold drops, held items are thrown
  upward and become pickups.

---

## 5. Damage Pipeline (implementation formula)

```
final = base * attacker.power / 100 * (1 - target.defense/50) * stageMult
if attacker.transformed: final *= 1.40
if attacker.perfectDodgeTimer > 0: final *= 1.30
if target.superArmor: final *= 1.0  (no flinch, damage still applies)
if target.shield: absorb first, shield drains by final
hp -= max(1, round(final))
```

Knockback:

```
knock = base_knock * (attacker.power/target.defense) * (1 + hp_missing% * 0.35)
```

Launch height on finishers: `vy = 9 + damage * 0.35`.

---

## 6. "Feel" Budget (juice checklist)

| Effect | Trigger | Spec |
|---|---|---|
| Hit-stop | any hit | 45 ms (light) / 90 ms (heavy) / 140 ms (Fusion) |
| Camera shake | heavy hit, explosion, stage event | amplitude 0.15–0.6, decay 0.35 s |
| Screen flash white | Perfect Dodge, transformation | 0.1 s, 30% opacity |
| Comic impact stamp | finisher, item crit | 0.4 s, 2× size, randomized rotation |
| Slow-mo | Perfect Dodge, KO, boss phase | timescale 0.25 for 0.3–0.6 s |
| Controller rumble | hits, hazards | light 0.1 s / heavy 0.25 s |

---

## 7. Complete Control Reference Card (for the pause menu)

```
MOVE ............ Analog stick / D-pad (360°)
ATTACK .......... Punch / weapon. Ground combo x3 = KNOCKDOWN
JUMP ............ Jump · jump at wall = WALL JUMP · +Jump again = double
ACTION .......... Pick up · throw · grab · board vehicles · climb · use item
DISCARD ......... Throw held item · empty hands = personal quirk
ATTACK+JUMP ..... POWER FUSION A (needs Power Stone form)
ACTION+JUMP ..... POWER FUSION B (needs Power Stone form)
TAP DIRECTION ... DODGE (i-frames) — dodge right before a hit = PERFECT DODGE
```