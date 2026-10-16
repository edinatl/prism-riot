# PRISM RIOT — Prototype (three.js)

Playable vertical slice of the arena brawler. No build step.

## Run

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

three.js loads from a CDN (import map in `index.html`).

## Controls

* **P1** `WASD` + `J` attack · `K` jump · `L` action · `I` discard
* **P2** Arrows + `,` `.` `/` `;` (numpad `1 2 3 0` also works)
* **Gamepads** — stick/D-pad + X/A/B/Y, players auto-join in the select screen
* **Tap a direction** = dodge step (i-frames) · **Attack ×3** = combo → knockdown
* **Action** = pick up / throw / grab / board turrets / use item
* **3 Power Stones** = transform · **Attack/Action** = Power Drive ·
  **Attack+Jump / Action+Jump** = Power Fusion

## Files

| File | Contents |
|---|---|
| `index.html` | Shell, HUD/overlay markup, import map |
| `game.js` | Engine: input (keyboard/gamepad), fighters + state machine, combat/hitboxes, items & projectiles, Power Stone loop, stage system + events, dynamic camera, CPU AI, match flow |

## QA / debug hook

```js
PRISM.game                 // live match state
PRISM.tick(1/60)           // advance one sim frame (works in headless browsers
                           // where requestAnimationFrame is paused)
PRISM.startMatch()         // restart
PRISM.spawnStoneAt([0,1,0])
PRISM.itemAt([0,1,0],'sword')
```

## Notes

* Prototype scope: 2 of the 8 designed stages, 17 of ~75 items, shared moveset
  skeleton (per-character damage/speed/defense + unique names/forms/colors).
  Full moveset differentiation is specified in `../design/03-characters.md`.
* Every system named in the design docs is present in playable form — see the
  feature table in `../README.md`.