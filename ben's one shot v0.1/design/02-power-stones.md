# 02 · Power Stones, Transformation & the Power Gauge

The defining loop: **grab any 3 Power Stones → transform → rampage with Power
Drives and Power Fusions → burn out → scramble for more.** Multiple fighters
can transform at once. Stones can be stolen by knocking them out of people.

---

## 1. Power Stones

| Property | Value |
|---|---|
| Appearance | Floating faceted crystal, ~0.5 m, own color + light glow + hum |
| Colors | Ruby, Topaz, Emerald, Sapphire, Amethyst, Prism (rare) |
| Stack rule | **Any 3 stones** of any color trigger transformation |
| Carry limit | 3 held (a 4th stone overfills your "spare" slot — see §5) |
| Pickup | Auto on contact (0.7 m radius), 0.6 s lockout after being dropped |
| Destroyable | No — stones cannot be destroyed, only dropped, juggled or eaten by stage machines |

### 1.1 Stone colors (flavor, not requirements)

| Stone | Color | Minor passive while carried |
|---|---|---|
| Ruby | red | +5% attack |
| Topaz | yellow | +5% speed |
| Emerald | green | +5% defense |
| Sapphire | blue | +10% jump |
| Amethyst | violet | +5% gold pickup radius |
| Prism | rainbow (rare) | counts as **2 stones** toward the 3 needed |

### 1.2 Where stones come from

| Source | Rate |
|---|---|
| Stage spawn pads | 4 at match start, then 1 every 18 s up to 8 live (12 in Adventure) |
| Item boxes | 12% chance when broken |
| Knockdowns / KOs | one stone pops out of a multi-stone victim; KO drops all |
| Stage gimmicks | treasure chambers (Tomb), fish (Submarine), satellites (Space), gold piles (Desert) |
| Item: Prism Shard | instantly grants 1 stone (Rare item) |

### 1.3 Stealing rules

* Knock down a fighter carrying stones → **1 stone ejects** with a pop sound
  and a bright trail. Anyone may grab it after 0.6 s (victim included).
* Finishers and Power Fusions eject **all** carried stones.
* Grab → throw also ejects 1 stone on landing.
* Steal streaks ("STONE THIEF!") grant bonus gold at results.

---

## 2. Transformation

Trigger: pick up a stone while already carrying 2 → **TRIPLE PRISM TRANSFORM**.

| Phase | Duration | What happens |
|---|---|---|
| **Flash** | 0.25 s | white screen flash, time slows to 30%, all fighters turn to face the transformer |
| **Sequence** | 1.6 s | camera arc around the fighter, ink-splash color wipe, silhouette grows, unique fanfare, voice line ("Three stones... let's GO!") |
| **Reveal** | 0.35 s | powered form (new palette, aura, size +8–35% per character), shockwave that shoves nearby fighters (small damage 8) |
| **Powered play** | until gauge empty | see §3 |
| **Burnout** | 0.5 s + 6 s cooldown | gauge flash-red, brief stun 0.5 s, cannot re-transform for 6 s, gauge slowly auto-refills 2/s after 3 s |

* Transformation is **uninterruptible** once started (it's a showpiece), but the
  fighter takes +50% damage during the Flash and Sequence phases.
* **Multiple simultaneous transforms**: events queue 0.4 s apart, and if two
  fighters transform within 2 s of each other a **RIVAL CLASH** banner shows
  and both get +5% gauge.
* Powered form is lost on KO. Stones are spent (they shatter into particles).

---

## 3. Power Gauge (Overdrive Meter)

| Property | Value |
|---|---|
| Max | 100 |
| Passive drain | 4.5 per second |
| Landing a hit | +2 (Power Drive hit +1, Fusions give none) |
| Taking a hit | −3 |
| Power Drive A/B | −8 / −10 |
| Power Fusion A | −35 |
| Power Fusion B | −45 |
| Gauge pickup item | +30 |
| Holding a spare stone | +1.0 per second |
| Burnout | gauge = 0 → forced de-transform |

Balance intent: ~15–22 seconds of powered play, ~2 Power Fusions per
transformation if you are aggressive, or 3 Power Drives + 1 Fusion if you are
conservative. Aggression is rewarded: getting hits keeps the form alive.

### 3.1 Powered-form stat block

| Stat | Powered modifier |
|---|---|
| Attack power | ×1.40 |
| Defense | +25% damage reduction |
| Speed | +15% |
| Jump | +10% |
| Ground combo | becomes 4 hits with super armor on hits 1–2 |
| Air action | gains **Air Dash** (one, refreshed on hit or wall jump) |
| Hit reaction | light hits do not flinch (only heavy / Fusion hits interrupt) |
| Appearance | unique armor/skin, aura particles, voice echo, trail color |

---

## 4. Powered-Form Move Grammar (per character, see doc 03)

| Input while transformed | Move | Gauge cost |
|---|---|---|
| **Attack** | **Power Drive A** — primary special (projectile, beam, deployable, dash strike…) | 8 |
| **Action** | **Power Drive B** — secondary special (burst, zone, utility, counter…) | 10 |
| **Attack + Jump** | **Power Fusion A** — large AoE / multi-hit super | 35 |
| **Action + Jump** | **Power Fusion B** — finisher super (bigger, slower, more dramatic) | 45 |
| Attack (close, no chip) | powered melee combo still available via Attack tap during cooldown | 0 |

* Power Drives have a shared 0.35 s cooldown so mashing does not machine-gun
  gauge-free damage.
* Fusions have full invulnerability during startup (0.35 s) and 0.5 s recovery —
  excellent as reversals, risky if read.

---

## 5. Spare Stones & Overdrive

Carrying a 4th or 5th stone (from theft or lucky boxes) does not add another
transform, but grants **Overdrive**:

* +1 gauge/s per spare stone.
* Your next transformation starts at +25 gauge.
* If you are KO'd while holding spares, they scatter — a jackpot for the pack.

---

## 6. Anti-Snowball Design Notes

* Burnout is deliberately punishing (0.5 s stun) so transformations cannot
  loop infinitely.
* Stones from knockdowns favor *whoever is closest*, not whoever is winning —
  spawn pads are biased toward trailing fighters (up to 2× spawn weight when
  80+ points behind in Arcade).
* The leader's stones glow brighter (UI tells you who to bully). This is the
  rubber band that keeps 4-player rounds dramatic.

## 7. UI

* Stone slots: 3 crystal icons under each health bar. Filled = held.
* Gauge: a tall bar at the right of the health bar that fills diagonally;
  crackling effect at <25% warns of burnout.
* Global banner on transformation: character name + form name ("REX CINDER →
  SOLAR REX!"), 1.2 s, semi-transparent so fights stay visible.