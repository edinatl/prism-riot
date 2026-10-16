# 04 · Stages — Layouts, Gimmicks, Hazards & Event Timelines

Eight battle arenas plus the Floating Castle hub and two boss arenas. Every
stage has **multi-level vertical play**, **rideable/interactive fixtures**,
**item boxes**, **Power Stone pads**, and a **dynamic event timeline** that
reshapes the fight.

Common conventions used below:

* **Level Y** = height in meters above the stage's reference plane (Y=0).
* **Event times** are seconds from match start; matches run 150–180 s so a
  typical round sees 3–4 stage events.
* **Stone pads** = glowing hexagonal floor markers that spawn Power Stones.

---

## STAGE 1 · SKY GALLEON BREAK-UP *(airship)*
Theme: a giant wooden-and-brass fighter airship under attack. Wings shred,
decks fall, everyone eventually free-falls to a floating platform.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Main deck | 0 | 34 × 26 m slab, tilted 3° | 4 item boxes, 2 stone pads, crate stacks (throwable props), gun battery turrets ×2 |
| Bridge | +5 | 12 × 8 platform w/ ramps | Sniper nest, 1 stone pad, chandelier net (ceiling cling) |
| Wing platforms | +2 | 4 slabs (8 × 5) each side | **Destructible** — collapse at T+45, propellers below (hazard) |
| Cargo deck | −3 | 20 × 12 low deck | Item boxes ×3, bomb racks (explosive props) |
| Rescue rafts | −8 | small floating pads | Where fighters land during Free Fall |

**Fixtures**
* **Gun Batteries (×2)** — Action to board: 360° turn, fires cannon shells
  (25 dmg, 3 m AoE), 12 shots, pilot takes hits at 50% transfer, battery has
  200 HP and can be smashed (explodes for 30 dmg).
* **Propellers** — rotating hitboxes under the wings (20 dmg + launch).
* **Bomb racks** — throwable bombs (18 dmg AoE) that respawn after 8 s.

**Hazards**
* Bombing runs at T+20/70/120: 3 bomber passes, warning shadows then blasts
  (30 dmg each) that also destroy boxes.
* Falling debris after T+45 on the pieces of deck that are still standing.

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+45 | **TAIL BREAK** | Rear 25% of the deck shears off and falls; fighters on it free-fall to cargo deck (15 dmg) |
| T+90 | **FREE FALL LEAGUE** | The whole upper deck collapses; ALL fighters fall — steer left/right in the air to land on rescue rafts or the floating platform (fall damage on miss) |
| T+130 | **GUNSHIP ARRIVES** | A fly-in platform docks on the east side with a fresh turret and 4 item boxes |

**Strategy notes:** hold the bridge for stone control; board the gun battery
during Free Fall to shoot aerial fighters; throw bomb racks at crowd clusters.

---

## STAGE 2 · ABYSSAL SUBMARINE BAY
Theme: a naval bay with two giant submarines that **dive and resurface**,
swamping the deck with waves.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Dock deck | 0 | 30 × 30, wet (power slides) | 4 item boxes, 2 stone pads, crane (Action = swing cargo crate) |
| Sub hull A/B | 0 to +3 | 22 × 8 curved hulls (moving!) | rideable, periscope guns (turrets), dive with the sub! |
| Conning towers | +6 | 6 × 6 each | 1 stone pad each, radar dish (spin hazard) |
| Lower dock | −4 | 18 × 14 | Floods at T+60; torpedo tubes fire torpedoes across |

**Fixtures**
* **Periscope Guns** — boardable turret on each sub (18 dmg shells, 10 shots).
* **Crane** — Action swings a suspended crate as a wrecking ball (22 dmg).
* **Torpedo tubes** — fire torpedoes that skate across the deck (28 dmg AoE).
* **Sonar buoys** — throwable.

**Hazards**
* **Waves**: each surface/dive sloshes water (drift + extinguish + 8 dmg push).
* **Pressure vents**: steam jets on timers (12 dmg).
* **Rising water** at T+60: lower dock becomes swim-only (slow, no dodge-tap).

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+35 | **DIVE!** | Submarine A dives — everyone on its hull slides off; the hull disappears (fall to lower dock, 10 dmg) |
| T+70 | **RESURFACE** | Sub B crashes up through the dock floor, raising a new ramp platform, scattering fighters |
| T+115 | **TIDE SWELL** | Whole bay floods to −1 m; fighters swim; torpedoes fire in salvos |

**Strategy notes:** hulls are safe high ground but transient; periscope guns
control center; water kills dodge-taps — bait people into the lower dock.

---

## STAGE 3 · CRUMBLING SKY CASTLE
Theme: a fairy-tale castle of crumbling stone, drawbridges and chandeliers.
Story-mode home of the villain. **Collapsing sections** and spike courtyards.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Courtyard | 0 | 28 × 28, cracked tiles | 2 item boxes, 2 stone pads, spike pit in the center (16 dmg), ballista turret ×1 |
| Battlements | +4 | 30 m ring walkway | Wall-jump arches, item boxes ×3, boiling cauldron (Action = tip over, 20 dmg cone) |
| Throne balcony | +8 | 14 × 8 | 1 stone pad, chandelier chain (ceiling cling), bell (stun gong) |
| Dungeon mouth | −3 | 12 × 12 pit | Trap: portcullis drops (26 dmg), rats swarm (3 dmg/s) |

**Fixtures**
* **Ballista** — boardable pierce-shot turret (35 dmg line, 6 shots).
* **Cauldron** — Action tips a bubbling pot onto the ring below.
* **Drawbridge** — rotating platform (Action) that can knock fighters off.
* **Chandelier** — Action on the throne balcony drops it (32 dmg in 3 m).

**Hazards**
* Spike pit and portcullis trap.
* Falling masonry at random after T+45 (warning dust puffs).

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+50 | **COLLAPSE** | The east battlement section breaks away — creates new ramps and removes cover |
| T+95 | **CHANDELIER STORM** | Three chandeliers drop in sequence on marked floor zones |
| T+140 | **THRONE FALL** | The throne balcony crashes into the courtyard, flattening the spike pit and forming a ramp |

**Strategy notes:** vertical control wins here; bell spam stuns stone carriers;
throw enemies into the portcullis for stylish KOs.

---

## STAGE 4 · TOMB OF THE SUN KING
Theme: an Egyptian mega-tomb. Sand, sarcophagi, scarab swarms and rolling
boulders. **Collapsing floors** and a hidden treasure chamber.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Grand hall | 0 | 32 × 24, sand piles | 3 item boxes, 2 stone pads, 2 obelisks (climbable pillars) |
| Upper galleries | +5 | two 24 × 6 ledges | Wall jump columns, 2 stone pads, boulder launcher pits |
| Sarcophagus tier | +2 | 8 × 8 shelves ×4 | Throwable stone lids (20 dmg), scarab jars (Poison Jar item) |
| Treasure vault | −2 | sealed room | Opens at T+75: gold x10, 2 stones, legendary item box |

**Fixtures**
* **Boulder pits** — Action rolls a boulder (30 dmg sweep, hits everyone).
* **Sun disc mirrors** — beams that rotate and burn (10 dmg + knockback).
* **Sarcophagus lids** — throwable slabs, great improvised weapons.
* **Obelisks** — tall climbable columns: Action to shimmy up, jump off with
  a dive attack.

**Hazards**
* **Scarab swarms**: roaming 2 m clouds (4 dmg/s, slow) that chase the leader.
* **Gas vents** at T+60 (confusion — controls reversed 4 s).
* **Sand waterfalls** that push fighters.

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+40 | **CEILING CRACK** | Debris falls; part of the upper gallery breaks |
| T+75 | **VAULT OPENS** | Secret vault unlocks with gold/stones — gold rush panic |
| T+110 | **SAND FLOOD** | Sand rises to +1 m; slow movement, buried item boxes rise to the surface |
| T+150 | **TOMB QUAKE** | Two obelisks topple as new ramps/hazards |

---

## STAGE 5 · GLACIER RUMBLE *(iceberg)*
Theme: a floating iceberg cracking apart, with a whale under the waves.
Slippery movement and drifting platforms.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Ice shelf | 0 | 26 × 26, `ice` friction | 3 item boxes, 2 stone pads, ice pillars (shatterable) |
| Floes | −1 drifting | 3 moving platforms | Ride them to flank; they tilt (slide off!) |
| Ice tower | +7 | 5 × 5 peak | 1 stone pad, geyser elevator (Action = ride the geyser up) |
| Underwater shelf | −4 | 20 × 10 | Swim zone; whale blowhole blasts |

**Fixtures**
* **Geyser** — periodic eruption: ride up 8 m or take 14 dmg and get launched.
* **Ice pillars** — shatter on heavy hits (3 shard projectiles each).
* **Snowball pile** — Action rolls an escalating snowball (grows to 30 dmg).
* **Icicle rails** — slide rails across the arena (Action to grind).

**Hazards**
* Ice friction (0.28) — dodges go further, turns are slippery.
* **Crevasse** at T+60 (falling = free-fall damage + water respawn).

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+45 | **TAIL SWEEP** | The whale's tail sweeps a wave across the shelf: 18 dmg + knockback to the edges |
| T+85 | **ICE SHELF COLLAPSE** | Half the main shelf breaks and drifts away |
| T+125 | **WHITEOUT** | Snow squall: reduced visibility 15 s, snowballs fall from the sky |

---

## STAGE 6 · ORBITAL PRISM STATION *(space station)*
Theme: a rotating space station with **low gravity**, laser grids and airlocks.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Ring deck | 0 | 32 diameter ring | 3 item boxes, 2 stone pads, rotating carousel segment |
| Zero-G core | +6 | open cylinder | `lowgrav` zone, tether poles (Action = swing), laser grid switches |
| Solar wings | +2 | 2 × (14 × 6) | Solar panels (shatter), sat-dish turrets ×2 |
| Airlocks | 0 | 2 chambers | Decompression blasts (30 dmg + team launch) |

**Fixtures**
* **Tether poles** — Action grabs and swings; release to launch (flying
  dropkick opportunity).
* **Laser grid** — floor grid toggles on/off (22 dmg + burn).
* **Gravity console** — Action triggers the T+90 event early (with cooldown).
* **Sat-dish turrets** — boardable laser turrets (15 dmg rapid shots).

**Hazards**
* **Decompression**: airlock doors open on a timer, dragging fighters toward
  the void (escape by jumping or wall-jumping).
* **Solar flare** at T+110: everyone in the open takes burn damage.

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+60 | **SYSTEM REBOOT** | Laser grids cycle for 30 s (all on for 3 s pulses) |
| T+90 | **GRAVITY FLIP** | Gravity inverts for 15 s — fight on the ceiling! |
| T+125 | **DEBRIS STORM** | Meteor chunks strike marked zones; solar wing panels crack |

---

## STAGE 7 · MIRAGE DUNE WORKS *(desert)*
Theme: a desert mining operation with mine carts, quicksand and a giant
sandworm. Rides and traps everywhere.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Dune floor | 0 | 36 × 30, `sand` friction | 4 item boxes, 2 stone pads, cactus props (throw, 8 dmg + stun) |
| Ore platform | +4 | 18 × 10 | Conveyor belts (move fighters), 2 stone pads, crane hook |
| Mine tracks | +1 | 2 looping rails | Rideable mine carts (move 12 m/s, 25 dmg collision) |
| Oasis pool | −2 | 12 × 12 | Water zone (heal 5/s while standing, but slippery) |

**Fixtures**
* **Mine carts** — press Action near a cart to board; steer with the stick;
  jump to bail. Carts pop out of the tunnel every 20 s.
* **Quicksand pits** — sink (2 s escape mashing), 10 dmg.
* **Cactus & crates** — throwable props.
* **Water tower** — topple it for a healing/cooling wave (also douses burns).

**Hazards**
* Sandworm eruption warning circles (32 dmg).
* Conveyor belts push into hazard zones.

**Dynamic timeline**

| Time | Event | Effect |
|---|---|---|
| T+50 | **SANDWORM** | The worm erupts through the middle: permanent hole + knockback wave |
| T+95 | **MINE CART EXPRESS** | Four carts run the rails at once (crowd chaos; ram for KOs) |
| T+140 | **MIRAGE** | Item pickups duplicate as illusions for 20 s — grab carefully! |

---

## STAGE 8 · CHAOS LAB — FINAL ARENA *(Dr. Valerius' lair)*
Theme: the villain's laboratory inside the Floating Castle. Tesla columns,
black-hole generators and unstable reactors. Used for the final boss and as a
bonus stage.

| Level | Y | Geometry | Features |
|---|---|---|---|
| Lab floor | 0 | 30 × 30, hex tiles | 4 item boxes, 2 stone pads, 2 Tesla columns |
| Catwalks | +5 | 3 rings | Turrets ×2, movable crates |
| Reactor platform | +10 | 10 × 10 | Boss focus zone, laser emitters |

**Fixtures:** Tesla columns (stun arcs), black-hole generator (Action pulls
all fighters toward it for 6 s), crane magnet (hoists a fighter and drops
them), self-destruct console (final-boss phase trigger).

**Dynamic timeline**

| Time | Event |
|---|---|
| T+40 | **REACTOR SURGE** — random floor tiles electrify for 5 s |
| T+80 | **BLACK HOLE** — generator pulls everything inward |
| T+120 | **MELTDOWN WARNING** — floor sections drop, leaving only rings |

---

## HUB · THE FLOATING CASTLE
A sky castle held aloft by prism engines. Free-roam lobby (1–4 players) with
portals to each stage, the Item Shop, the Furnace, the Trophy Gallery
(collection), and the Arcade cabinet. NPCs here sell hints and taunt you.

## BOSS ARENAS
* **PYRAMID OF THE MASKED MEN** — Sphinx-9 fight (see `07-bosses.md`): wide
  sandy arena, 4 pillar cover points, falling hieroglyph blocks.
* **CHAOX CORE** — Dr. Valerius monstrous form: two-tier reactor arena with
  walkways, blast shutters and a destructible floor.

---

## Stage Authoring Checklist (implementation)

```yaml
stage:
  id: sky_galleon
  gravity: 1.0
  friction_tags: { deck: 1.0, wing: 1.0, wet: 0.75 }
  kill_plane_y: -12
  respawn_points: [ {x: 0, y: 6, z: 0}, ... ]
  bounds_radius: 22
  platforms: [ {min: [...], max: [...], tag, move: none|loop|event} ]
  props: [ {type: crate|turret|crane|cart, pos, hp, action, respawn} ]
  item_boxes: [ {pos, table: standard|rich|stage_specific} ]
  stone_pads: [ {pos, interval: 18} ]
  hazards: [ {type: spikes|laser|water|debris, pos, damage, radius, cadence} ]
  events: [ {t: 45, id: tail_break, banner: "TAIL BREAK!", fn: stage.tailBreak} ]
  music: galleon_battle
  lighting: { key: warm_sunset, fog: 0.6, ambient: 0.45 }
```