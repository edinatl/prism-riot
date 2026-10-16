# 08 · Implementation Notes

How to build PRISM RIOT for real, plus what the playable web prototype in
`../prototype/` already demonstrates.

---

## 1. Engine & Tooling

| Choice | Verdict |
|---|---|
| **Godot 4.x (recommended)** | Cheap for stylized 3D, GDScript iteration speed, great local-multiplayer input map, exports to PC/console. |
| Unity 6 (URP) | Best asset/mocap pipeline, more boilerplate, fine alternative. |
| Unreal 5.4 | Overkill for stylized party look unless art team wants it. |
| **Web prototype (three.js)** | Fastest way to validate camera feel, 4-player chaos and the stone loop. Included in `../prototype/`. |

Build targets: PC first (Steam), consoles second. Local 1–4 shared screen;
online later (see §7).

## 2. Architecture Overview

```
/game
  main.gd                # boot, scene flow (title → select → fight → results)
  core/
    fighter.gd           # entity + state machine + stats
    fighter_states/      # idle, run, jump, attack1..3, air, dodge, knockdown...
    camera_director.gd   # dynamic framing (see §5)
    input_router.gd      # devices → abstract actions (attack/jump/action/discard)
    hitbox.gd            # attack volumes, active windows, hit resolution
    damage.gd            # pipeline, knockback, launch, hit-stop
    item.gd + item_behaviors/  # data-driven items, one script per behavior family
    stage.gd + stage_events/   # platforms, props, hazards, timed events
    stone.gd / gauge.gd  # Power Stone loop, transform sequence
    vehicles.gd          # turrets, tanks, carts (mount/dismount state)
    ai_director.gd       # utility-scored CPU fighters (see §6)
    vfx.gd / audio.gd    # pooled particles, stingers, announcer
  data/
    characters/*.json    # 13 fighters: stats, movesets, frame data
    stages/*.json
    items/*.json
    recipes.json / cards.json
  ui/  (HUD, select, shop, furnace, results, collection)
```

Principles:
* **Everything numeric lives in JSON** and hot-reloads in dev builds.
* Fighters are **kinematic characters** (custom controller), not rigidbodies —
  deterministic feel beats physical accuracy. Props and vehicles are rigidbodies.
* **Fixed simulation step** (60 Hz physics) with render interpolation; this
  also makes optional rollback netcode feasible.

## 3. Fighter State Machine (HFSM)

Layers: `Locomotion` (ground/air/wall) · `Combat` (attack chain/item/vehicle)
· `Condition` (hurt/knockdown/burnout/transform). Higher layers preempt lower.

Key transitions (all timings from `01-controls-and-combat.md`):

```
idle/run --Attack--> attack1 --buffered Attack--> attack2 --> attack3(knockdown)
idle/run --Attack+Item--> item_attack
* --Jump--> jump --Jump--> double_jump | wall_jump
air --Attack--> air_attack (land-cancel 0.1s)
* --tap direction--> dodge (i-frames 0.30s, cd 0.55s)   ← the ONLY defense
hurt --(mash)--> recovery_roll (i-frames 0.35s)
hurt(hard) --> knockdown(1.4s) --> getup(0.25s vulnerable)
transformed --Attack--> power_drive_a (cd 0.35s, gauge -8)
transformed --Attack+Jump--> power_fusion_a (gauge -35, i-frames startup)
transformed --gauge==0--> burnout(0.5s) --> idle
```

**Input buffer & dodge-tap:** per-player input history ring buffer of 12 frames.

```python
# pseudo
if move_tap_started_from_neutral and time_since_tap < 0.15 and dodge_cd <= 0:
    state = DODGE; vel = move_dir * 7.2; iframe = 0.30; dodge_cd = 0.55
if perfect_dodge_absorbed_hit(dmg >= 10):
    timescale = 0.25 @ 0.35s; attacker.flashed = true; buff_next_attack(1.30)
```

## 4. Damage, Hitboxes & Knockback

* Hitboxes are **oriented boxes/spheres authored per attack frame window** with
  a `hit_id` so one swing hits each foe once.
* Collision broadphase: simple spatial hash (cell 4 m) — 4 fighters + ~40
  props + projectiles is tiny.
* Damage pipeline exactly as in `01-controls-and-combat.md` §5.
* Knockdown detection: `damage >= finisher_threshold or attacks.knockdown flag`.
* Hit-stop implemented as per-entity `freeze_timer` (not global) so simultaneous
  hits keep going while the victim freezes.

## 5. Camera Director (the angled overhead zoom)

Shared-screen camera that frames all living fighters and zooms with spread.

```python
def update_camera(dt):
    targets = [f for f in fighters if f.alive and not f.respawning]
    centroid = average(targets.pos)
    spread   = max(distance(t.pos, centroid) for t in targets)   # horizontal

    desired_dist = clamp(BASE_DIST + spread * 1.25 + vertical_spread*0.6,
                         16.0, 42.0)
    # fixed overhead-angled direction, slight azimuth drift toward action
    dir = normalize(vec3(0.55, 0.95, 1.0))
    zoom_focus = mix(centroid, leader.pos, 0.25)   # bias to the front-runner

    cam.pos = damp(cam.pos, zoom_focus + dir*desired_dist, 4.0, dt)
    cam.look = damp(cam.look, centroid + vec3(0,1.6,0), 6.0, dt)
    cam.fov  = damp(cam.fov, 55 + spread*0.35, 3.0, dt)   # 55..70 deg
    cam.pos += shake.offset()
```

Rules that keep 4 players readable:
* Hard clamps on distance and FOV so players are never < 2% of screen height.
* On transformation: priority cutscene camera (arc around fighter, 1.6 s).
* On stage events: scripted camera shake + a 1 s "event framing" shot.
* The camera never goes under the stage (`cam.pos.y = max(cam.pos.y, 4)`).
* Split-screen is OFF by design — arena is always small enough to frame.

## 6. AI Director (CPU fighters)

Utility scoring, evaluated every 0.15–0.25 s:

| Behavior | Score drivers |
|---|---|
| Attack nearest | distance, own HP advantage, weapon range, enemy invuln |
| Collect stone | stones_needed (0..3), distance, crowd fighting over it |
| Grab item | item tier, empty hand, distance |
| Use ranged | has gun, foe distance, line of sight |
| Dodge | incoming attack timer, own dodge cooldown, skill level |
| Boss objective | break part HP, ballista available |
| Flee/burnout | HP low, transformed, cornered |

Difficulty = noise added to scores + reaction delay (0.35 s at level 3 →
0.12 s at level 5) + perfect-dodge chance (0% → 35%). CPU fighters are
explicitly *not* omniscient: they lose track of invisible foes and are fooled
by Mirage duplicates.

## 7. Netcode (optional stretch)

* Deterministic fixed-step sim + **rollback (GGPO-style)** for 2 players.
* 4-player online: delay-based with input prediction, or rollback with
  lockstep-friendly data (byte-quantized positions).
* Stone and item RNG must be seeded and serialized (`rng_state` in the state
  snapshot). Stage events run on the sim clock.

## 8. Data Schemas

### character.json (excerpt)
```json
{
  "id": "rex",
  "name": "Rex Cinder",
  "hp": 400, "speed": 6.2, "power": 1.0, "defense": 1.0, "jump": 1.0,
  "quirks": ["comeback"],
  "moves": {
    "g1": {"startup": 0.10, "active": 0.08, "recovery": 0.16, "dmg": 6,
           "kb": 4.0, "hitbox": {"type": "sphere", "r": 1.1, "offset": [0,1.1,0.9]}},
    "g3": {"startup": 0.18, "active": 0.12, "recovery": 0.30, "dmg": 11,
           "kb": 9.5, "launch": 9.5, "knockdown": true},
    "air": {"dmg": 12, "shockwave": {"r": 1.2, "dmg": 4}},
    "power_drive_a": {"dmg": 20, "gauge": 8, "projectile": "sunshot"},
    "power_fusion_a": {"dmg": 45, "gauge": 35, "aoe": 9.0}
  },
  "form": {"id": "solar_rex", "scale": 1.08, "color": "#ffb347",
           "atlas": "chars/rex_solar", "fanfare": "rex_transform"}
}
```

### item.json (excerpt)
```json
{ "id": "giant_mallet", "class": "melee", "rarity": "rare",
  "dmg": 26, "uses": 8, "kb": 14.0, "pickup_model": "items/mallet",
  "behavior": "melee_heavy", "throw_dmg": 18 }
```

## 9. Animation & VFX Approach

* **Animation:** layered procedural + authored clips. Core locomotion is
  procedural (squash/stretch, run cycle parameterized by speed), combat uses
  short authored clips with strict beat windows (anticipation → contact →
  follow-through). Additive layers for hurt leans, wind push, item hold.
* **Transformation sequence:** timeline track (camera arc + material color
  wipe + scale + particles + audio) reused per character with per-char accent
  props; max 2 s so other players keep playing.
* **VFX:** GPU instanced particles (one draw call per system), pooled.
  Impact "comic stamps" are screen-space billboards with texture atlas.
* **Outline/chibi readability:** inverted-hull outline shader on fighters,
  distinct silhouette props (hats, weapons) per character.

## 10. Audio

* Middleware: FMOD or Wwise (dynamic music layers: intensity = fighters
  clustered + transformations active).
* Announcer lines for: transformation, stage events, double KO, boss phase,
  final 30 s ("SURVIVAL MODE!"), perfect dodge.
* Music: one battle theme per stage with a "chaos layer" that fades in with
  item density and a "hero layer" during transformations.

## 11. Performance Budgets (console-class target)

| Metric | Budget |
|---|---|
| Sim entities | 4 fighters + 60 props + 30 projectiles + 4 vehicles |
| Draw calls | < 450 (atlas materials, instancing) |
| Particles | 3000 live (pooled 6000) |
| Frame time | 16.6 ms at 1080p/60 (sim 3 ms, render 10 ms, UI 2 ms) |
| Local players | 4 at 60 fps; split logic-check with 4 pads always in CI |

## 12. Milestones

| Milestone | Scope | Exit criteria |
|---|---|---|
| M0 Vertical slice | 1 stage (Sky Galleon), 2 fighters, items core 6, stone loop, camera director | 4-player local fun for 20 min |
| M1 Content spine | 8 stages, 13 fighters data-complete, 40 items | All modes playable end-to-end (stub UI) |
| M2 Systems depth | Adventure economy (shop/furnace/cards), bosses 1&2, AI 1–5 | Adventure run completes, no crashes |
| M3 Juice & polish | FX/audio pass, transformation sequences, comic FX, balancing | Blind playtest: 80% "would play again" |
| M4 Ship | Optimization, cert, online (opt), localization | Gold |

## 13. QA / Balance Checklist

* [ ] Dodge-tap window feels fair at 30/60/120 fps (frame-based, not time-float).
* [ ] No infinite air combo (juggle limit 2 + burnout immunity).
* [ ] Transformation never blocks gameplay longer than 2 s.
* [ ] Stone snowball check: leader win-rate in 4P AI sims < 40%.
* [ ] All 70 items usable in all 8 stages without soft-locks.
* [ ] Stage events never KO all fighters simultaneously.
* [ ] Colorblind-safe hazard markers (shape + color, not color alone).
* [ ] 4 wireless pads + 1 keyboard simultaneously (device churn handling).

## 14. Prototype → Full Game Mapping

The web prototype in `../prototype/` implements (in compressed form):

| Prototype feature | Full-game equivalent |
|---|---|
| `Fighter` FSM (idle/run/jump/attack/dodge/knockdown/transform) | §3 HFSM |
| Tap-to-dodge with i-frames and perfect-dodge slow-mo | §3 / doc 01 |
| 3-hit ground combo + air attack + knockdown drops | doc 01 §4 |
| Power Stones ×3 → transform, gauge, Power Drives/Fusions | doc 02 |
| Dynamic framing camera with spread zoom | §5 above |
| Item boxes, 12+ items, throw/use/discard | doc 05 |
| Stage events (collapse, gunship, bombardment) | doc 04 |
| Boardable turret, throwable props, hazard zones | doc 04/05 |
| 4 players local (keyboard ×2 + gamepads + CPU) | doc 06 |
| HP/stone/gauge HUD, timer, results screen | all docs |