/* ============================================================
   PRISM RIOT · CHAOS ARENA — playable 3D prototype
   (original homage-style arena brawler; see /design for the bible)
   ============================================================ */
import * as THREE from 'three';

/* ---------------- helpers ---------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const damp = (cur, to, lambda, dt) => lerp(cur, to, 1 - Math.exp(-lambda * dt));

/* ---------------- audio (tiny synth) ---------------- */
let actx = null, master = null;
function initAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  actx = new AC();
  master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination);
}
function tone(freq = 440, dur = 0.12, type = 'square', vol = 0.1, slide = 0, delay = 0) {
  if (!actx) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.03);
}
function noiseBurst(dur = 0.18, vol = 0.12, delay = 0, bp = 900) {
  if (!actx) return;
  const t = actx.currentTime + delay;
  const len = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = actx.createBufferSource(); s.buffer = buf;
  const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = bp;
  const g = actx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master); s.start(t);
}
function sfx(name) {
  switch (name) {
    case 'hit': noiseBurst(0.09, 0.16, 0, 700); tone(180, 0.07, 'square', 0.09, -60); break;
    case 'heavy': noiseBurst(0.18, 0.22, 0, 380); tone(110, 0.16, 'sawtooth', 0.12, -60); break;
    case 'hurt': tone(320, 0.1, 'triangle', 0.1, -140); break;
    case 'jump': tone(360, 0.1, 'square', 0.05, 260); break;
    case 'dodge': tone(520, 0.09, 'triangle', 0.06, 320); break;
    case 'pickup': tone(560, 0.07, 'square', 0.07); tone(760, 0.09, 'square', 0.06, 0, 0.06); break;
    case 'stone': tone(660, 0.1, 'triangle', 0.11); tone(880, 0.14, 'triangle', 0.1, 0, 0.08); tone(1180, 0.16, 'triangle', 0.09, 0, 0.16); break;
    case 'transform':
      tone(300, 0.5, 'sawtooth', 0.11, 520); tone(150, 0.7, 'square', 0.09, 300, 0.05);
      noiseBurst(0.5, 0.12, 0, 1600); tone(880, 0.4, 'triangle', 0.1, 420, 0.3); break;
    case 'fuse': tone(180, 0.55, 'sawtooth', 0.14, 900); noiseBurst(0.4, 0.2, 0, 500); break;
    case 'explode': noiseBurst(0.35, 0.24, 0, 260); tone(90, 0.3, 'sawtooth', 0.14, -50); break;
    case 'shoot': tone(880, 0.05, 'square', 0.07, -420); noiseBurst(0.05, 0.07, 0, 2200); break;
    case 'turret': tone(130, 0.22, 'sawtooth', 0.13, -40); noiseBurst(0.2, 0.16, 0, 220); break;
    case 'ko': tone(420, 0.5, 'triangle', 0.13, -260); tone(210, 0.7, 'sawtooth', 0.11, -120, 0.08); break;
    case 'event': tone(240, 0.16, 'square', 0.1); tone(320, 0.16, 'square', 0.1, 0, 0.16); tone(420, 0.34, 'square', 0.11, 60, 0.32); break;
    case 'ui': tone(520, 0.05, 'square', 0.05); break;
    case 'win': [440, 554, 659, 880].forEach((f, i) => tone(f, 0.34, 'triangle', 0.12, 0, i * 0.14)); break;
    case 'pad': tone(200, 0.22, 'sawtooth', 0.12, 620); break;
  }
}

/* ---------------- input ---------------- */
const keys = Object.create(null);
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

const KEYMAPS = {
  k1: { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], attack: ['KeyJ'], jump: ['KeyK'], action: ['KeyL'], discard: ['KeyI'] },
  k2: {
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
    attack: ['Comma', 'Numpad1'], jump: ['Period', 'Numpad2'], action: ['Slash', 'Numpad3'], discard: ['Semicolon', 'Numpad0']
  }
};
const anyDown = list => { for (const k of list) if (keys[k]) return true; return false; };
function readKeyboard(map) {
  return {
    mx: (anyDown(map.right) ? 1 : 0) - (anyDown(map.left) ? 1 : 0),
    my: (anyDown(map.down) ? 1 : 0) - (anyDown(map.up) ? 1 : 0),
    attack: anyDown(map.attack), jump: anyDown(map.jump),
    action: anyDown(map.action), discard: anyDown(map.discard)
  };
}
function readGamepad(idx) {
  const list = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = list[idx];
  if (!gp) return null;
  const dz = v => (Math.abs(v) < 0.22 ? 0 : v);
  return {
    mx: dz(gp.axes[0] || 0), my: dz(gp.axes[1] || 0),
    attack: !!(gp.buttons[2] && gp.buttons[2].pressed),
    jump: !!(gp.buttons[0] && gp.buttons[0].pressed),
    action: !!(gp.buttons[1] && gp.buttons[1].pressed),
    discard: !!(gp.buttons[3] && gp.buttons[3].pressed)
  };
}

/* ---------------- content data ---------------- */
const CHARS = [
  { id: 'rex', name: 'REX CINDER', tag: 'The Red Comet · balanced hero', primary: 0xe23b2e, secondary: 0xffd24a, skin: 0xffc79a, hair: 0x5b2b23, hp: 400, speed: 6.2, power: 1.0, defense: 1.0, jump: 1.0, scale: 1.08, form: 'SOLAR REX', theme: 0xffb347, driveA: 'Sunshot', driveB: 'Flare Fist', fusionA: 'Meteor Barrage', fusionB: 'Nova Cyclone' },
  { id: 'zephyr', name: 'ZEPHER MARU', tag: 'Gale Legs · fastest rushdown', primary: 0x2fb14f, secondary: 0xd6ffd9, skin: 0xf2c9a0, hair: 0x12452a, hp: 330, speed: 7.6, power: 0.95, defense: 0.87, jump: 1.15, scale: 1.06, form: 'GALE FORM', theme: 0x9dffb0, driveA: 'Gale Lance', driveB: 'Tempest Step', fusionA: 'Tempest Rush', fusionB: 'Sky Breaker' },
  { id: 'sable', name: 'SABLE VALE', tag: 'The Lone Edge · swordsman', primary: 0x2b4bd6, secondary: 0xc9d2ff, skin: 0xf7d2b0, hair: 0x101a3c, hp: 370, speed: 6.4, power: 1.08, defense: 1.0, jump: 1.0, scale: 1.1, form: 'PHANTOM BLADE', theme: 0x8fa8ff, driveA: 'Crescent Wave', driveB: 'Phantom Step', fusionA: 'Thousand Cuts', fusionB: 'Moonlit Execution' },
  { id: 'grimjaw', name: 'GRIMJAW IRONS', tag: 'The Walking Wall · tank', primary: 0x6b6f7a, secondary: 0xff9d3c, skin: 0xd9a273, hair: 0x2c2c2c, hp: 520, speed: 4.6, power: 1.2, defense: 1.25, jump: 1.35, scale: 1.2, form: 'MOLTEN COLOSSUS', theme: 0xff7a2f, driveA: 'Iron Charge', driveB: 'Magma Fist', fusionA: 'Tectonic Slam', fusionB: 'Meteor Drop Omega' },
  { id: 'jangle', name: 'PIPPIN "JANGLE"', tag: 'The Clown · item luck', primary: 0xff5fa2, secondary: 0x8ef0ff, skin: 0xffd9c2, hair: 0xffe14a, hp: 360, speed: 6.3, power: 0.92, defense: 0.95, jump: 1.1, scale: 1.05, form: 'CARNIVAL KING', theme: 0xff8ce0, driveA: 'Balloon Barrage', driveB: 'Confetti Cannon', fusionA: 'Big Top Avalanche', fusionB: 'Grand Finale' },
  { id: 'ember', name: 'EMBER ASHCROFT', tag: 'Furnace Witch · fire zoner', primary: 0xd63a1e, secondary: 0xffb020, skin: 0xf6c2a0, hair: 0x7a1d0c, hp: 320, speed: 5.9, power: 1.15, defense: 0.85, jump: 1.0, scale: 1.06, form: 'INFERNO DJINN', theme: 0xff6a2b, driveA: "Dragon's Breath", driveB: 'Fire Orb', fusionA: 'Supernova', fusionB: 'Meteor Shower' },
  { id: 'hanabi', name: 'HANABI', tag: 'Blossom Specter · ninja dancer', primary: 0xf0407c, secondary: 0x2c1c3c, skin: 0xffd2b8, hair: 0x2a1230, hp: 330, speed: 7.1, power: 0.95, defense: 0.95, jump: 1.3, scale: 1.04, form: 'CHERRY PHANTOM', theme: 0xff9ad2, driveA: 'Petal Storm', driveB: 'Shuriken Bloom', fusionA: 'Thousand Petal Waltz', fusionB: 'Final Fan Dance' },
  { id: 'pip', name: 'PIP WARDEN', tag: 'Clockwork Kid · gadgeteer', primary: 0x3aa8c9, secondary: 0xffcf4d, skin: 0xffd6bd, hair: 0x7a4a22, hp: 370, speed: 6.0, power: 1.0, defense: 1.0, jump: 1.0, scale: 0.94, form: 'MECHA-MARCH PIP', theme: 0x6fe3ff, driveA: 'Gear Turret', driveB: 'Rocket Punch', fusionA: 'Puppet Riot', fusionB: 'Clockwork Cannon' },
  { id: 'camellia', name: 'CAMELLIA VEX', tag: 'Two-Faced Rose · stance duelist', primary: 0x8d3fd6, secondary: 0xffe3f2, skin: 0xffdcc9, hair: 0x3b1145, hp: 360, speed: 6.5, power: 1.05, defense: 1.0, jump: 1.05, scale: 1.05, form: 'TWILIGHT SOVEREIGN', theme: 0xd08bff, driveA: 'Parasol Cannon', driveB: 'Shadow Lash', fusionA: 'Masquerade Waltz', fusionB: 'Eclipse Serenade' },
  { id: 'gallus', name: 'CHEF GALLUS', tag: "Devil's Kitchen · dino brute", primary: 0x2e8f4e, secondary: 0xffe8c2, skin: 0xe9b98a, hair: 0x22412a, hp: 450, speed: 5.3, power: 1.12, defense: 1.12, jump: 0.95, scale: 1.16, form: 'TYRANT GALLUS', theme: 0x9dff5b, driveA: 'Searing Skewer', driveB: 'Tail Sweep', fusionA: 'Ravenous Roar', fusionB: 'Extinction Banquet' },
  { id: 'rok', name: 'DEADEYE ROK', tag: 'The Last Bullet · gunman', primary: 0x8a5a2b, secondary: 0xffcf6b, skin: 0xe8b98a, hair: 0x1d1712, hp: 360, speed: 6.6, power: 1.05, defense: 0.95, jump: 1.0, scale: 1.06, form: 'HIGH NOON REVENANT', theme: 0xffc966, driveA: 'Six-Shooter Salvo', driveB: 'Dynamite Bandolier', fusionA: 'Bounty Barrage', fusionB: 'Last Stand Twister' },
  { id: 'bram', name: 'BRAM THE BROKER', tag: 'Winged Merchant · gold engine', primary: 0xc9932b, secondary: 0xfff2c2, skin: 0xf1c79e, hair: 0x6b4a1c, hp: 400, speed: 5.4, power: 1.0, defense: 1.05, jump: 0.95, scale: 1.1, form: 'SERAPH MERCHANT', theme: 0xffe27a, driveA: 'Golden Ledger', driveB: 'Winged Ascent', fusionA: 'Grand Clearance Sale', fusionB: 'Angelic Audit' },
  { id: 'aldric', name: 'ALDRIC CINDER', tag: 'The Lost Champion · power hero', primary: 0xd93b3b, secondary: 0xf2f2ff, skin: 0xe9b98a, hair: 0x777777, hp: 460, speed: 6.0, power: 1.18, defense: 1.1, jump: 1.0, scale: 1.14, form: 'ECLIPSE VANGUARD', theme: 0xffe9c2, driveA: 'Solar Breaker', driveB: 'Crescent Guard', fusionA: 'Morning Star', fusionB: 'Horizon Split' }
];

const ITEMS = [
  { id: 'sword', name: 'Sabre', kind: 'melee', dmg: 15, uses: 25, color: 0xcfd8ff },
  { id: 'hammer', name: 'War Hammer', kind: 'melee', dmg: 23, uses: 12, color: 0xa2713f },
  { id: 'mallet', name: 'Giant Mallet', kind: 'melee', dmg: 27, uses: 8, color: 0xff5fa2 },
  { id: 'spoon', name: 'Spoon', kind: 'melee', dmg: 7, uses: 20, color: 0xd8d8d8 },
  { id: 'mag', name: 'Magazine', kind: 'melee', dmg: 9, uses: 15, color: 0xffa3c8 },
  { id: 'gun', name: 'Machine Gun', kind: 'gun', dmg: 8, uses: 30, color: 0x4a5160 },
  { id: 'bazooka', name: 'Bazooka', kind: 'gun', dmg: 30, uses: 3, aoe: 3.2, color: 0x6b7a3b },
  { id: 'raygun', name: 'Ray Gun', kind: 'gun', dmg: 17, uses: 12, color: 0x39e0d0 },
  { id: 'bomb', name: 'Bomb', kind: 'bomb', dmg: 26, uses: 1, aoe: 3.6, color: 0x2a2a2a },
  { id: 'food', name: 'Roast Turkey', kind: 'food', heal: 90, uses: 1, color: 0xd98b3a },
  { id: 'bread', name: 'Bread', kind: 'food', heal: 45, uses: 1, color: 0xd9b26a },
  { id: 'wings', name: 'Wings', kind: 'buff', effect: 'jumps', uses: 1, color: 0xfff2c9 },
  { id: 'shoes', name: 'Roller Blades', kind: 'buff', effect: 'speed', uses: 1, color: 0xff7b3a },
  { id: 'shield', name: 'Shield', kind: 'buff', effect: 'shield', uses: 1, color: 0x88b7ff },
  { id: 'elixir', name: 'Invisibility Elixir', kind: 'buff', effect: 'invis', uses: 1, color: 0xc78bff },
  { id: 'trap', name: 'Bear Trap', kind: 'trap', dmg: 18, uses: 1, color: 0x8a8a8a },
  { id: 'glue', name: 'Adhesive Spray', kind: 'spray', dmg: 3, uses: 4, color: 0x9dff5b }
];
const itemById = id => ITEMS.find(i => i.id === id);

/* ---------------- renderer / scene ---------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.5, 500);
camera.position.set(22, 22, 26);

const hemi = new THREE.HemisphereLight(0xbfe6ff, 0x4c5a2f, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2da, 1.05);
sun.position.set(28, 52, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55;
sun.shadow.camera.far = 160;
scene.add(sun);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- particles ---------------- */
class ParticleSystem {
  constructor(max = 1400) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.size = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geo = geo;
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.42, vertexColors: true, transparent: true, opacity: 0.95,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
  }
  spawn(p, color, speed = 6, life = 0.7, spread = 1, count = 1, up = 3) {
    const c = new THREE.Color(color);
    for (let k = 0; k < count; k++) {
      const i = this.n = (this.n + 1) % this.max;
      this.pos[i * 3] = p.x + rand(-0.2, 0.2);
      this.pos[i * 3 + 1] = p.y + rand(-0.2, 0.2);
      this.pos[i * 3 + 2] = p.z + rand(-0.2, 0.2);
      this.vel[i * 3] = rand(-spread, spread) * speed * 0.35;
      this.vel[i * 3 + 1] = rand(0.3, 1) * speed * 0.22 * up * 0.5;
      this.vel[i * 3 + 2] = rand(-spread, spread) * speed * 0.35;
      this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
      this.life[i] = life * rand(0.7, 1.25);
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      this.vel[i * 3 + 1] -= 12 * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.life[i] <= 0) {
        this.col[i * 3] = this.col[i * 3 + 1] = this.col[i * 3 + 2] = 0;
        this.pos[i * 3 + 1] = -999;
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
  }
}
const particles = new ParticleSystem();

/* ---------------- game state ---------------- */
const game = {
  state: 'title', time: 0, matchTime: 180, stageId: 'galleon', stage: null,
  fighters: [], pickups: [], projectiles: [], hitboxes: [], traps: [],
  hitStop: 0, slowT: 0, shake: 0, bannerT: 0, bannerText: '', flashT: 0,
  camLook: V(0, 2, 0), camPos: V(20, 22, 26), lastStageIndex: 0
};

function banner(text, dur = 1.6) {
  const el = document.getElementById('banner');
  el.textContent = text; el.classList.add('show');
  game.bannerT = dur;
}
function flashScreen(power = 0.6) {
  game.flashT = 0.35;
  document.getElementById('flash').style.opacity = String(power);
}

/* ---------------- stage building ---------------- */
function mat(color, emissive = 0x000000, ei = 0) {
  return new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: ei });
}
function makeBox(stage, x, y, z, w, h, d, color, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts.emissive || 0, opts.ei || 0));
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  stage.group.add(mesh);
  const plat = {
    mesh,
    min: V(x - w / 2, y - h / 2, z - d / 2),
    max: V(x + w / 2, y + h / 2, z + d / 2),
    tag: opts.tag || 'solid', friction: opts.friction ?? 1,
    move: opts.move || null, basePos: V(x, y, z), delta: V(), alive: true
  };
  stage.platforms.push(plat);
  return plat;
}
function addCrate(stage, x, y, z, size = 1.2, contents = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat(0xc98b3f));
  mesh.position.set(x, y + size / 2, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  stage.group.add(mesh);
  stage.crates.push({
    mesh, pos: mesh.position.clone(), home: mesh.position.clone(),
    hp: 3, size, contents, respawnT: 0
  });
}

function buildStage(id) {
  const stage = {
    id, group: new THREE.Group(), platforms: [], crates: [], turrets: [],
    pads: [], events: [], hazards: [], spawn: [V(0, 2, 0)], killY: -16,
    sky: 0x79c7ff, name: 'SKY GALLEON'
  };
  scene.add(stage.group);

  if (id === 'galleon') {
    stage.name = 'SKY GALLEON BREAK-UP';
    stage.sky = 0xffb37a;
    // main deck
    makeBox(stage, 0, -0.6, 0, 34, 1.2, 26, 0xd9843f, { tag: 'deck' });
    // side rails
    makeBox(stage, 0, 0.5, -13.4, 34, 1, 1.2, 0xa34a24);
    makeBox(stage, 0, 0.5, 13.4, 34, 1, 1.2, 0xa34a24);
    // cargo deck (low)
    makeBox(stage, 0, -3.6, 0, 20, 1.2, 12, 0xb96b2f, { tag: 'cargo' });
    // wing platforms (collapsible)
    makeBox(stage, -20, 1.4, -7, 8, 0.9, 5, 0xf2b24c, { tag: 'wing' });
    makeBox(stage, -20, 1.4, 7, 8, 0.9, 5, 0xf2b24c, { tag: 'wing' });
    makeBox(stage, 20, 1.4, -7, 8, 0.9, 5, 0xf2b24c, { tag: 'wing' });
    makeBox(stage, 20, 1.4, 7, 8, 0.9, 5, 0xf2b24c, { tag: 'wing' });
    // bridge (high)
    makeBox(stage, 0, 4.4, -8, 12, 1, 8, 0xffcf6b, { tag: 'bridge' });
    makeBox(stage, -5, 2.2, -3.2, 5, 1, 4, 0xe8a052, { tag: 'ramp' });
    makeBox(stage, 5, 2.2, -3.2, 5, 1, 4, 0xe8a052, { tag: 'ramp' });
    // decorative masts
    for (const [x, z] of [[-14, 0], [14, 0], [0, 10]]) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 9, 10), mat(0x5d3c1e));
      mast.position.set(x, 4.5, z); mast.castShadow = true;
      stage.group.add(mast);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(3, 1.7, 0.14), mat(0xff4757, 0x551015, 0.4));
      flag.position.set(x + 1.5, 8, z);
      stage.group.add(flag);
    }
    // crates
    for (const [x, z] of [[-9, 6], [9, 6], [-6, -8], [6, -8], [0, 8], [12, -2], [-12, -2]])
      addCrate(stage, x, 0, z, 1.3, true);
    for (const [x, z] of [[-8, 2], [8, 2]]) addCrate(stage, x, -3, z, 1.2, true);
    // turrets
    stage.turrets.push(makeTurret(stage, -11, 0, -9, 0x5f6b3a));
    stage.turrets.push(makeTurret(stage, 11, 0, 9, 0x5f6b3a));
    // stone pads
    stage.pads.push({ pos: V(-13, 0.05, 8), t: 0 }, { pos: V(13, 0.05, -8), t: 0 },
      { pos: V(0, 5, -8), t: 3 });
    stage.spawn = [V(0, 2, 2), V(-12, 2, -6), V(12, 2, -6), V(0, 6, -8)];
    stage.killY = -18;

    stage.events = [
      {
        t: 38, banner: 'TAIL BREAK!', fn: () => {
          sfx('event');
          for (const p of stage.platforms) if (p.tag === 'wing') beginCollapse(p);
          banner('TAIL BREAK!');
        }
      },
      {
        t: 78, banner: 'GUNSHIP ARRIVES!', fn: () => {
          sfx('event');
          spawnGunship(stage);
          banner('GUNSHIP ARRIVES!');
        }
      },
      {
        t: 30, banner: 'BOMBING RUN!', fn: () => bombardment(stage), repeat: 30
      }
    ];
    stage.nextBombard = 32;
    stage.bombardStep = -1;
  } else {
    stage.name = 'GLACIER RUMBLE';
    stage.sky = 0x9fd8ff;
    makeBox(stage, 0, -0.6, 0, 26, 1.2, 26, 0xd7f0ff, { tag: 'ice', friction: 0.35 });
    makeBox(stage, -10, -1.2, -10, 9, 1, 9, 0xbfe6ff, { tag: 'ice', friction: 0.35 });
    makeBox(stage, 10, -1.2, 10, 9, 1, 9, 0xbfe6ff, { tag: 'ice', friction: 0.35 });
    // drifting floes
    makeBox(stage, -16, -1.4, 0, 7, 1, 7, 0xc9eeff, {
      tag: 'floe', friction: 0.35,
      move: (p, t) => p.set(-16 + Math.sin(t * 0.22) * 5, -1.4, Math.cos(t * 0.18) * 6)
    });
    makeBox(stage, 16, -1.4, -2, 7, 1, 7, 0xc9eeff, {
      tag: 'floe', friction: 0.35,
      move: (p, t) => p.set(16 + Math.cos(t * 0.2) * 5, -1.4, -2 + Math.sin(t * 0.24) * 6)
    });
    // ice tower
    makeBox(stage, 0, 2.6, -10, 6, 1, 6, 0xe8fbff, { tag: 'ice', friction: 0.35 });
    makeBox(stage, 0, 6.2, -10, 4.5, 1, 4.5, 0xf2ffff, { tag: 'peak', friction: 0.35 });
    // pillars (breakable)
    for (const [x, z] of [[-7, 0], [7, 0], [0, 7], [0, -4], [-6, 8], [6, -8]]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 5, 10), mat(0x9fd6ef, 0x2b6d8f, 0.25));
      m.position.set(x, 2, z); m.castShadow = true; m.receiveShadow = true;
      stage.group.add(m);
      stage.crates.push({
        mesh: m, pos: m.position.clone(), home: m.position.clone(),
        hp: 2, size: 1.6, contents: true, pillar: true, respawnT: 0
      });
    }
    stage.turrets.push(makeTurret(stage, -11, 0, 10, 0x4d7fa8));
    for (const [x, z] of [[-8, -6], [8, 6], [0, 2], [0, -10]])
      stage.pads.push({ pos: V(x, 0.05, z), t: rand(0, 6) });
    stage.spawn = [V(0, 2, 0), V(-10, 2, -8), V(10, 2, 8), V(0, 8, -10)];
    stage.killY = -16;
    stage.events = [
      {
        t: 45, banner: 'TAIL SWEEP!', fn: () => {
          sfx('event'); banner('TAIL SWEEP!');
          for (const f of game.fighters) {
            if (f.pos.y < 1.4 && Math.abs(f.pos.x) < 16 && Math.abs(f.pos.z) < 16) {
              f.vel.x += Math.sign(f.pos.x || 1) * 16;
              f.vel.z += Math.sign(f.pos.z || 1) * 14;
              f.vel.y = 9;
              f.takeHit({ dmg: 18, kb: 0, launch: 8, knockdown: true, attacker: null, name: 'WAVE' });
            }
          }
          particles.spawn(V(0, 1.5, 0), 0xcfeeff, 16, 1.2, 1, 90);
        }
      },
      {
        t: 88, banner: 'ICE SHELF COLLAPSE!', fn: () => {
          sfx('event'); banner('ICE SHELF COLLAPSE!');
          const p = stage.platforms[2];
          if (p) beginCollapse(p);
          for (const p2 of stage.platforms) if (p2.tag === 'floe') beginCollapse(p2);
        }
      },
      {
        t: 115, banner: 'GEYSER STORM!', fn: () => {
          sfx('event'); banner('GEYSER STORM!');
          for (let i = 0; i < 5; i++) {
            const pos = V(rand(-11, 11), 0, rand(-11, 11));
            particles.spawn(pos, 0x8fe8ff, 14, 1.1, 1, 40);
          }
          for (const f of game.fighters) {
            if (!f.ko && f.pos.y < 1.2 && Math.random() < 0.7) {
              f.vel.y = 22; f.state = 'jump'; f.grounded = false;
              f.takeHit({ dmg: 12, kb: 4, launch: 12, knockdown: false, attacker: null, name: 'GEYSER' });
            }
          }
        }
      }
    ];
    stage.nextBombard = 999;
    stage.bombardStep = -1;
  }

  return stage;
}

function makeTurret(stage, x, y, z, color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 0.8, 12), mat(color));
  base.position.y = 0.4; base.castShadow = true; base.receiveShadow = true;
  g.add(base);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 2.2), mat(color));
  head.position.y = 1.15; head.castShadow = true;
  g.add(head);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.8, 10), mat(0x2c2c2c));
  barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 1.2, 1.7);
  g.add(barrel);
  g.position.set(x, y, z);
  stage.group.add(g);
  return { group: g, pos: V(x, y, z), hp: 200, ammo: 12, rider: null, cd: 0, angle: 0 };
}

function beginCollapse(plat) {
  if (!plat || plat.collapsing) return;
  plat.collapsing = true;
  plat.fallV = 0;
}
function spawnGunship(stage) {
  const plat = makeBox(stage, -62, 3.2, 22, 16, 1.4, 12, 0x7c8894, { tag: 'gunship' });
  plat.gunship = true;
  plat.targetX = -14;
  const turret = makeTurret(stage, -62, 4, 22, 0x7c8894);
  stage.turrets.push(turret);
  plat.turret = turret;
}
function bombardment(stage) {
  const marks = [];
  for (let i = 0; i < 4; i++) {
    const pos = V(rand(-13, 13), 0.15, rand(-9, 9));
    marks.push(pos);
    particles.spawn(pos, 0xff4433, 3, 1.1, 1, 22);
  }
  setTimeout(() => {
    if (game.state !== 'fight') return;
    for (const pos of marks) {
      particles.spawn(pos, 0xffa030, 18, 1.1, 1, 46);
      explodeAt(pos, 3.2, 30, null);
    }
  }, 1150);
}

/* ---------------- pickups & items ---------------- */
function spawnPickup(pos, item, isStone = false) {
  let mesh;
  if (isStone) {
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0),
      mat(0x7fe9ff, 0x2bd8ff, 1.1));
  } else {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75),
      mat(item.color, item.color, 0.22));
  }
  mesh.position.copy(pos);
  mesh.castShadow = true;
  scene.add(mesh);
  game.pickups.push({ mesh, pos: pos.clone(), item, isStone, bob: rand(0, 6), alive: true, lock: 0.6 });
}
function spawnStone(pos) {
  spawnPickup(pos, { id: 'stone', name: 'Power Stone', kind: 'stone' }, true);
}
function randomItem() {
  const roll = Math.random();
  const pool = roll < 0.5 ? ITEMS.filter(i => ['melee', 'gun', 'bomb', 'spray', 'trap'].includes(i.kind))
    : roll < 0.85 ? ITEMS : ITEMS.concat(ITEMS);
  return pick(pool);
}

/* ---------------- fighter mesh ---------------- */
function buildFighterMesh(ch) {
  const g = new THREE.Group();
  const bodyMat = mat(ch.primary);
  const accentMat = mat(ch.secondary);
  const skinMat = mat(ch.skin);
  const hairMat = mat(ch.hair);
  const eyeMat = mat(0x1b1020);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.6, 6, 14), bodyMat);
  torso.position.y = 1.02; torso.castShadow = true;
  g.add(torso);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.18, 14), accentMat);
  belt.position.y = 0.76;
  g.add(belt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.37, 18, 14), skinMat);
  head.position.y = 1.8; head.castShadow = true;
  g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.39, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
  hair.position.y = 1.87;
  g.add(hair);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), eyeMat);
    e.position.set(0.14 * s, 1.82, 0.33);
    g.add(e);
  }
  const armGeo = new THREE.CapsuleGeometry(0.135, 0.46, 4, 10);
  const handGeo = new THREE.SphereGeometry(0.17, 10, 8);
  const mkArm = (side) => {
    const grp = new THREE.Group();
    grp.position.set(0.54 * side, 1.34, 0);
    const m = new THREE.Mesh(armGeo, bodyMat); m.position.y = -0.32; m.castShadow = true;
    const hand = new THREE.Mesh(handGeo, skinMat); hand.position.y = -0.62;
    grp.add(m); grp.add(hand);
    g.add(grp);
    return grp;
  };
  const legGeo = new THREE.CapsuleGeometry(0.17, 0.42, 4, 10);
  const mkLeg = (side) => {
    const grp = new THREE.Group();
    grp.position.set(0.22 * side, 0.74, 0);
    const m = new THREE.Mesh(legGeo, accentMat); m.position.y = -0.36; m.castShadow = true;
    grp.add(m);
    g.add(grp);
    return grp;
  };
  const armL = mkArm(-1), armR = mkArm(1);
  const legL = mkLeg(-1), legR = mkLeg(1);

  const weaponSlot = new THREE.Group();
  weaponSlot.position.set(0, -0.72, 0.1);
  armR.add(weaponSlot);

  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 8, 28), mat(ch.theme, ch.theme, 1.2));
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.55;
  aura.visible = false;
  g.add(aura);

  return {
    group: g, armL, armR, legL, legR, head, torso, hair, weaponSlot, aura,
    mats: [bodyMat, accentMat, skinMat, hairMat], bodyMat, accentMat, hairMat
  };
}

/* ---------------- fighter ---------------- */
const ATTACKS = {
  g1: { startup: 0.10, active: 0.09, recovery: 0.15, dmg: 8, kb: 5, r: 1.35, knockdown: false, launch: 0 },
  g2: { startup: 0.11, active: 0.09, recovery: 0.17, dmg: 9, kb: 6, r: 1.4, knockdown: false, launch: 3 },
  g3: { startup: 0.18, active: 0.12, recovery: 0.30, dmg: 14, kb: 12, r: 1.5, knockdown: true, launch: 9 },
  air: { startup: 0.10, active: 0.22, recovery: 0.12, dmg: 11, kb: 8, r: 1.4, knockdown: true, launch: 6 },
  dash: { startup: 0.11, active: 0.16, recovery: 0.22, dmg: 10, kb: 9, r: 1.35, knockdown: true, launch: 5 }
};

class Fighter {
  constructor(char, player) {
    this.char = char; this.player = player;
    this.mesh = buildFighterMesh(char);
    this.pos = V();
    this.vel = V();
    this.yaw = 0;
    this.hp = char.hp; this.maxHp = char.hp;
    this.state = 'idle'; this.stateT = 0;
    this.comboIdx = 0; this.comboT = 0;
    this.atk = null; this.atkHit = false; this.atkKind = '';
    this.grounded = true; this.wallNormal = V();
    this.jumps = 2; this.jumpsMax = 2;
    this.dodgeCd = 0; this.iFrames = 0; this.perfectT = 0;
    this.moveActive = false; this.tapT = -9; this.tapDir = V(0, 0, 1);
    this.stones = []; this.spare = 0;
    this.gauge = 0; this.transformed = false; this.transformT = 0; this.burnoutT = 0;
    this.held = null; this.heldUses = 0; this.pockets = [];
    this.buffs = { speed: 0, shield: 0, invis: 0, glue: 0 };
    this.ko = false; this.respawnT = 0; this.falling = false;
    this.gold = 0; this.kos = 0; this.dmgDealt = 0; this.stonesTaken = 0;
    this.powerCd = 0; this.aiT = 0; this.aiGoal = 'foe'; this.aiTarget = null; this.aiDodge = 0;
    this.ridingTurret = null; this.stun = 0; this.animT = rand(0, 10);
    this.lastHitBy = null;
  }

  get alive() { return !this.ko; }

  setState(s) {
    if (this.state === s) return;
    this.state = s; this.stateT = 0;
    if (s === 'attack' || s === 'airattack') this.atkHit = false;
  }

  forward() {
    return V(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  /* ---------- main update ---------- */
  update(dt) {
    if (this.ko) { this.updateVisuals(dt); return; }
    this.stateT += dt;
    this.animT += dt;
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.iFrames = Math.max(0, this.iFrames - dt);
    this.powerCd = Math.max(0, this.powerCd - dt);
    this.perfectT = Math.max(0, this.perfectT - dt);
    this.comboT = Math.max(0, this.comboT - dt);
    this.stun = Math.max(0, this.stun - dt);
    this.buffs.speed = Math.max(0, this.buffs.speed - dt);
    this.buffs.invis = Math.max(0, this.buffs.invis - dt);
    this.buffs.glue = Math.max(0, this.buffs.glue - dt);

    if (this.falling) {
      this.pos.y += this.vel.y * dt; this.vel.y -= 26 * dt;
      if (this.respawnT <= 0 && this.pos.y < -6) this.doRespawn();
      this.respawnT -= dt;
      this.updateVisuals(dt);
      return;
    }

    // gauge / transformation
    if (this.transformed) {
      this.gauge -= 4.5 * dt;
      if (Math.random() < 0.5) particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), this.char.theme, 3, 0.5, 1, 1);
      if (this.gauge <= 0) {
        this.gauge = 0; this.transformed = false; this.burnoutT = 0.5;
        this.setState('hurt'); this.stun = 0.5;
        banner(`${this.char.name} BURNOUT!`, 1.0);
        particles.spawn(this.pos.clone().add(V(0, 1, 0)), 0xffffff, 10, 0.9, 1, 30);
        sfx('hurt');
      }
    } else if (this.burnoutT > 0) {
      this.burnoutT -= dt;
    } else {
      this.gauge = Math.min(15, this.gauge + 0.6 * dt); // small reserve
    }

    if (this.transformT > 0) {
      this.transformT -= dt;
      this.iFrames = Math.max(this.iFrames, 0.2);
      if (Math.random() < 0.7) particles.spawn(this.pos.clone().add(V(rand(-1, 1), rand(0.2, 2), rand(-1, 1))), this.char.theme, 8, 0.8, 1, 2);
      if (this.transformT <= 0 && !this.transformed) {
        this.transformed = true; this.gauge = 100;
        this.mesh.aura.visible = true;
        flashScreen(0.55); shake(0.7);
        particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), this.char.theme, 22, 1.1, 1, 80);
        sfx('transform');
      }
      // physics keeps running mid-sequence so fighters land where they stood
      this.applyPhysics(dt);
      this.updateVisuals(dt);
      return;
    }

    if (this.stun > 0) { this.applyPhysics(dt); this.updateVisuals(dt); return; }

    const inp = this.player.input;
    const prev = this.player.prevInput || {};
    const pressed = {
      attack: inp.attack && !prev.attack,
      jump: inp.jump && !prev.jump,
      action: inp.action && !prev.action,
      discard: inp.discard && !prev.discard
    };

    // ------- dodge-tap detection -------
    const moveMag = Math.hypot(inp.mx, inp.my);
    if (!this.moveActive && moveMag > 0.45) {
      this.tapT = game.time;
      const { wx, wz } = this.moveWorld(inp.mx, inp.my);
      this.tapDir.set(wx, 0, wz).normalize();
    }
    this.moveActive = moveMag > 0.25;

    const inDodgeState = this.state === 'dodge';

    // ------- POWER FUSION chord: Attack+Jump / Action+Jump (any action state) -------
    let chordUsed = false;
    const canAct = ['idle', 'run', 'jump', 'attack', 'airattack'].includes(this.state);
    if (pressed.jump && this.transformed && (inp.attack || inp.action) && canAct) {
      if (inp.action && this.gauge >= 45) { this.powerFusion('B'); chordUsed = true; }
      else if (this.gauge >= 35) { this.powerFusion('A'); chordUsed = true; }
    }

    // ------- state machine -------
    switch (this.state) {
      case 'dodge':
        this.iFrames = Math.max(this.iFrames, 0.08);
        if (this.stateT > 0.22) this.setState('idle');
        break;
      case 'hurt':
        if (this.stateT > 0.32) this.setState('idle');
        break;
      case 'knockdown':
        if (pressed.jump || (moveMag > 0.6 && this.stateT > 0.35)) {
          this.setState('dodge');
          this.iFrames = 0.42; this.dodgeCd = 0.35;
          this.vel.x = this.tapDir.x * 14; this.vel.z = this.tapDir.z * 14;
          this.stateT = 0;
          sfx('dodge');
        } else if (this.stateT > 1.25) this.setState('idle');
        break;
      case 'attack':
        this.doAttackWindow();
        if (pressed.attack && this.comboIdx < 3 && this.stateT > this.atk.startup) {
          this.startAttack(this.comboIdx === 1 ? 'g2' : this.comboIdx === 2 ? 'g3' : 'g1');
        }
        if (this.stateT > this.atk.startup + this.atk.active + this.atk.recovery) this.setState(this.grounded ? 'idle' : 'jump');
        break;
      case 'airattack':
        this.doAttackWindow();
        if (this.grounded && this.stateT > 0.18) this.setState('idle');
        else if (this.stateT > 0.5) this.setState('jump');
        break;
      default: {
        // ground / air / run
        // jump (chords handled above)
        if (pressed.jump && !chordUsed) this.tryJump();
        if (pressed.attack) {
          if (this.transformed && this.powerCd <= 0 && this.gauge >= 8) {
            this.powerDrive('A');
          } else if (!this.grounded) {
            this.startAttack('air');
          } else if (this.held && this.held.kind === 'gun') {
            this.fireGun();
          } else if (this.state === 'attack' || this.comboT > 0) {
            const next = this.comboIdx === 0 ? 'g1' : this.comboIdx === 1 ? 'g2' : 'g3';
            this.startAttack(this.comboT > 0 ? next : 'g1');
          } else {
            this.startAttack('g1');
          }
        }
        if (pressed.action) {
          if (this.transformed && this.powerCd <= 0 && this.gauge >= 10) this.powerDrive('B');
          else this.tryAction();
        }
        if (pressed.discard) this.tryDiscard();

        // dodge-tap (tap direction from neutral)
        if (!inDodgeState && this.dodgeCd <= 0 && game.time - this.tapT <= 0.15 &&
          (this.state === 'idle' || this.state === 'run') && (this.player.isCPU ? this.aiDodge > 0 : true)) {
          this.startDodge(this.tapDir);
          if (this.player.isCPU) this.aiDodge = 0;
        }
        break;
      }
    }

    // ------- movement -------
    const st = this.state;
    const canMove = st === 'idle' || st === 'run' || st === 'jump' || st === 'attack' || st === 'dodge';
    const { wx, wz } = this.moveWorld(inp.mx, inp.my);
    const speedMax = (this.char.speed * (this.transformed ? 1.15 : 1)) *
      (this.buffs.speed > 0 ? 1.35 : 1) * (this.buffs.glue > 0 ? 0.35 : 1) *
      (stageFriction());
    if (st === 'dodge') {
      // keep the dash velocity; just bleed it off slightly
      this.vel.x = damp(this.vel.x, 0, 2.2, dt);
      this.vel.z = damp(this.vel.z, 0, 2.2, dt);
    } else if (canMove && moveMag > 0.12) {
      const targetVX = wx * speedMax, targetVZ = wz * speedMax;
      const accel = this.grounded ? 16 : 7;
      this.vel.x = damp(this.vel.x, targetVX, accel, dt);
      this.vel.z = damp(this.vel.z, targetVZ, accel, dt);
      if (st !== 'attack' && st !== 'dodge') this.yaw = Math.atan2(wx, wz);
      if (st === 'idle' && moveMag > 0.2) this.setState('run');
    } else if (st !== 'dodge' && st !== 'attack') {
      const fr = this.grounded ? 12 : 1.6;
      this.vel.x = damp(this.vel.x, 0, fr, dt);
      this.vel.z = damp(this.vel.z, 0, fr, dt);
      if (st === 'run' && moveMag < 0.12) this.setState('idle');
    }
    if (st === 'attack' || st === 'airattack') this.yaw = damp(this.yaw, this.yaw, 1, dt);

    this.applyPhysics(dt);
    this.updateVisuals(dt);
  }

  moveWorld(mx, my) {
    const dir = V();
    camera.getWorldDirection(dir); dir.y = 0;
    if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1);
    dir.normalize();
    const right = V(-dir.z, 0, dir.x);
    const wx = right.x * mx + dir.x * -my;
    const wz = right.z * mx + dir.z * -my;
    return { wx, wz };
  }

  /* ---------- actions ---------- */
  tryJump() {
    if (this.grounded || this.jumps > 0) {
      const jp = 13.2 * (this.char.jump) * (this.transformed ? 1.1 : 1);
      this.vel.y = jp;
      if (!this.grounded) this.jumps--;
      this.grounded = false;
      this.setState('jump');
      sfx('jump');
      particles.spawn(this.pos.clone(), 0xffffff, 3, 0.35, 1, 6, 1);
      return;
    }
    // wall jump
    if (this.wallNormal.lengthSq() > 0.1) {
      this.vel.y = 14.5;
      this.vel.x = this.wallNormal.x * 11;
      this.vel.z = this.wallNormal.z * 11;
      this.jumps = Math.max(this.jumps, 1);
      this.iFrames = 0.25;
      this.setState('jump');
      sfx('dodge');
      particles.spawn(this.pos.clone().add(V(0, 1, 0)), 0xbfe6ff, 6, 0.5, 1, 10);
    }
  }

  startDodge(dirV) {
    if (this.dodgeCd > 0 || this.state === 'knockdown') return;
    this.setState('dodge');
    this.dodgeCd = 0.55;
    this.iFrames = 0.30;
    this.vel.x = dirV.x * 15;
    this.vel.z = dirV.z * 15;
    this.yaw = Math.atan2(dirV.x, dirV.z);
    sfx('dodge');
    particles.spawn(this.pos.clone().add(V(0, 0.8, 0)), 0xbfefff, 4, 0.4, 1, 8);
  }

  startAttack(kind) {
    const base = ATTACKS[kind];
    if (!base) return;
    this.setState(kind === 'air' ? 'airattack' : 'attack');
    this.atk = Object.assign({}, base);
    this.atkKind = kind;
    this.atk.dmg = Math.round(base.dmg * this.char.power * (this.transformed ? 1.4 : 1) *
      (this.perfectT > 0 ? 1.3 : 1));
    if (this.held && this.held.kind === 'melee') {
      this.atk.dmg = Math.round((base.dmg + this.held.dmg * 0.7) * this.char.power);
      this.atk.r = 1.9; this.atk.kb *= 1.25;
      this.heldUses--;
      if (this.heldUses <= 0) this.dropHeld();
    }
    this.atkHit = false;
    this.comboIdx = kind === 'g1' ? 1 : kind === 'g2' ? 2 : kind === 'g3' ? 3 : this.comboIdx;
    this.comboT = 0.65;
    sfx(kind === 'g3' || kind === 'air' ? 'heavy' : 'hit');
  }

  doAttackWindow() {
    const a = this.atk;
    if (!a || this.atkHit) return;
    if (this.stateT < a.startup || this.stateT > a.startup + a.active) return;
    const center = this.pos.clone().add(this.forward().multiplyScalar(1.0)).add(V(0, 1.15, 0));
    const r = a.r + (this.held && this.held.kind === 'melee' ? 0.5 : 0);
    particles.spawn(center, this.transformed ? this.char.theme : 0xffe07a, 5, 0.28, 1, 6);
    for (const f of game.fighters) {
      if (f === this || f.ko || f.falling) continue;
      const d = f.pos.clone().add(V(0, 1, 0)).distanceTo(center);
      if (d < r + 0.55) {
        this.atkHit = true;
        f.takeHit({
          dmg: a.dmg, kb: a.kb, launch: a.launch, knockdown: a.knockdown,
          attacker: this, dir: this.forward(), name: this.atkKind.toUpperCase()
        });
        f.stonesEjectIf(a.knockdown && (this.atkKind === 'g3' || this.atkKind === 'air'));
        game.hitStop = a.knockdown ? 0.08 : 0.04;
        shake(a.knockdown ? 0.5 : 0.22);
      }
    }
    // hit crates / turrets too
    for (const c of game.stage.crates) {
      if (!c.mesh.visible) continue;
      if (c.pos.distanceTo(center) < r + c.size * 0.5) {
        this.atkHit = true;
        damageCrate(c, this.atk.dmg);
      }
    }
  }

  fireGun() {
    if (this.powerCd > 0) return;
    this.powerCd = 0.16;
    this.heldUses--;
    spawnProjectile(this, this.forward().multiplyScalar(30), this.held.dmg, {
      color: this.held.color, r: 0.28, life: 2.2, name: this.held.name
    });
    sfx('shoot');
    this.atk = null;
    this.setState('attack'); this.stateT = 0.6; // brief recoil
    this.atk = { startup: 0.02, active: 0.01, recovery: 0.1, dmg: 0, kb: 0, r: 0, knockdown: false, launch: 0 };
    this.atkHit = true;
    if (this.heldUses <= 0) this.dropHeld();
  }

  tryAction() {
    // 1. board turret
    const t = nearestTurret(this.pos, 2.6);
    if (t && !t.rider && this.state !== 'attack') {
      if (this.ridingTurret) return this.dismount();
      this.ridingTurret = t; t.rider = this;
      this.iFrames = 0.4;
      banner('TURRET ONLINE', 0.9);
      sfx('pad');
      return;
    }
    if (this.ridingTurret) return this.dismount();
    // 2. pick up item/stone
    const pk = nearestPickup(this.pos, 2.6);
    if (pk) return this.pickUp(pk);
    // 3. use held consumable
    if (this.held && ['food', 'buff', 'trap', 'spray'].includes(this.held.kind)) return this.useHeld();
    // 4. grab & throw foe
    const foe = nearestFoe(this, 2.0);
    if (foe && !foe.transformed && foe.state !== 'knockdown') {
      const dir = this.forward();
      foe.takeHit({
        dmg: 14, kb: 16, launch: 6, knockdown: true, attacker: this,
        dir: dir.clone(), name: 'THROW'
      });
      foe.stonesEjectIf(true);
      foe.vel.add(dir.multiplyScalar(10));
      game.hitStop = 0.08;
      shake(0.4);
      sfx('heavy');
      return;
    }
    // 5. nothing to do = small shove
    this.startAttack('g1');
  }

  tryDiscard() {
    if (this.held) {
      spawnProjectile(this, this.forward().multiplyScalar(20).add(V(0, 5, 0)),
        Math.round(this.held.dmg ? this.held.dmg * 0.8 : 10), {
        color: this.held.color, r: 0.42, life: 2.2, item: this.held, name: 'THROWN ITEM'
      });
      sfx('shoot');
      this.held = null; this.heldUses = 0;
    } else if (this.char.id === 'jangle') {
      this.hp = Math.min(this.maxHp, this.hp + 5);
      particles.spawn(this.pos.clone().add(V(0, 2, 0)), 0xff8ce0, 6, 0.7, 1, 18);
    }
  }

  pickUp(pk) {
    if (!pk.alive) return;
    if (pk.isStone) {
      pk.alive = false; scene.remove(pk.mesh);
      this.collectStone();
      return;
    }
    if (!this.held) {
      this.held = pk.item; this.heldUses = pk.item.uses || 1;
    } else if (this.pockets.length < 2) {
      this.pockets.push(pk.item);
    } else {
      spawnPickup(this.pos.clone().add(this.forward().multiplyScalar(1.4)), pk.item);
    }
    pk.alive = false; scene.remove(pk.mesh);
    sfx('pickup');
    particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), 0xfff2a0, 4, 0.4, 1, 8);
  }

  dropHeld() {
    if (!this.held) return;
    spawnPickup(this.pos.clone().add(V(0, 1, 0)), this.held);
    this.held = null; this.heldUses = 0;
  }

  useHeld() {
    const it = this.held;
    if (!it) return;
    if (it.kind === 'food') {
      this.hp = Math.min(this.maxHp, this.hp + it.heal);
      particles.spawn(this.pos.clone().add(V(0, 1.4, 0)), 0x8dff9e, 5, 0.7, 1, 16);
      sfx('pickup');
    } else if (it.kind === 'buff') {
      if (it.effect === 'jumps') { this.jumpsMax = 4; this.buffs.speed = Math.max(this.buffs.speed, 6); }
      if (it.effect === 'speed') this.buffs.speed = 16;
      if (it.effect === 'shield') this.buffs.shield = 120;
      if (it.effect === 'invis') { this.buffs.invis = 8; }
      particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), it.color, 6, 0.7, 1, 18);
      sfx('stone');
    } else if (it.kind === 'trap') {
      game.traps.push({
        pos: this.pos.clone().add(this.forward().multiplyScalar(2.2)),
        owner: this, life: 20, mesh: null
      });
      sfx('pad');
    } else if (it.kind === 'spray') {
      const dir = this.forward();
      spawnProjectile(this, dir.multiplyScalar(24), it.dmg, {
        color: 0x9dff5b, r: 0.5, life: 0.6, glue: true, name: 'GLUE'
      });
      sfx('shoot');
      this.heldUses--;
      if (this.heldUses <= 0) { this.held = null; }
      return;
    } else if (it.kind === 'bomb') {
      spawnProjectile(this, this.forward().multiplyScalar(18).add(V(0, 8, 0)), it.dmg, {
        color: it.color, r: 0.5, life: 1.6, aoe: it.aoe || 3, name: 'BOMB'
      });
      this.held = null; this.heldUses = 0;
      sfx('shoot');
      return;
    }
    this.held = null; this.heldUses = 0;
    if (this.pockets.length) { this.held = this.pockets.shift(); this.heldUses = this.held.uses || 1; }
  }

  /* ---------- power stone loop ---------- */
  collectStone() {
    sfx('stone');
    this.stonesTaken++;
    particles.spawn(this.pos.clone().add(V(0, 1.4, 0)), 0x7fe9ff, 7, 0.6, 1, 20);
    if (this.stones.length < 3) {
      this.stones.push(1);
      if (this.stones.length >= 3) this.startTransform();
    } else {
      this.spare++;
      this.gauge += 12;
    }
  }

  stonesEjectIf(force) {
    if (this.stones.length === 0 && this.spare === 0) return;
    if (!force && Math.random() > 0.55) return;
    const n = force ? this.stones.length + this.spare : 1;
    for (let i = 0; i < n; i++) {
      const p = this.pos.clone().add(V(rand(-1, 1), 1.6, rand(-1, 1)));
      spawnStone(p);
    }
    this.stones = []; this.spare = 0;
  }

  startTransform() {
    if (this.transformed || this.transformT > 0) return;
    this.transformT = 1.7;
    banner(`${this.char.name} → ${this.char.form}!`, 1.8);
    flashScreen(0.5);
    sfx('pad');
    shake(0.5);
  }

  powerDrive(which) {
    this.powerCd = 0.38;
    const dir = this.forward();
    if (which === 'A') {
      this.gauge -= 8;
      spawnProjectile(this, dir.clone().multiplyScalar(26), 20, {
        color: this.char.theme, r: 0.55, life: 2.4, sparkle: true, name: this.char.driveA
      });
      sfx('shoot');
    } else {
      this.gauge -= 10;
      spawnProjectile(this, dir.clone().multiplyScalar(17), 25, {
        color: this.char.theme, r: 0.95, life: 1.3, aoe: 2.6, sparkle: true, name: this.char.driveB
      });
      sfx('heavy');
    }
  }

  powerFusion(which) {
    const cost = which === 'A' ? 35 : 45;
    if (this.gauge < cost) return;
    this.gauge -= cost;
    this.powerCd = 0.5;
    const dmg = which === 'A' ? 45 : 58;
    const radius = which === 'A' ? 9 : 11.5;
    const center = this.pos.clone().add(V(0, 1, 0));
    banner(`${this.char.form}: ${which === 'A' ? this.char.fusionA : this.char.fusionB}!`, 1.5);
    sfx('fuse');
    flashScreen(0.65);
    shake(1.0);
    game.hitStop = 0.14;
    particles.spawn(center, this.char.theme, 26, 1.2, 1, 140);
    particles.spawn(center, 0xffffff, 18, 0.8, 1, 60);
    for (const f of game.fighters) {
      if (f === this || f.ko) continue;
      const d = f.pos.distanceTo(this.pos);
      if (d < radius) {
        const dir = f.pos.clone().sub(this.pos).setY(0).normalize().multiplyScalar(1 - d / radius);
        f.takeHit({
          dmg, kb: 20 * (1 - d / radius) + 8, launch: 12, knockdown: true,
          attacker: this, dir, name: 'FUSION'
        });
        f.stonesEjectIf(true);
        f.vel.add(dir.multiplyScalar(16));
      }
    }
    for (const c of game.stage.crates) if (c.mesh.visible && c.pos.distanceTo(this.pos) < radius) damageCrate(c, 999);
  }

  /* ---------- damage ---------- */
  takeHit(info) {
    if (this.ko || this.falling) return;
    if (this.iFrames > 0) {
      if (info.dmg >= 10) {
        this.perfectT = 1.5;
        game.slowT = 0.32;
        flashScreen(0.35);
        banner('PERFECT DODGE!', 0.7);
        sfx('dodge');
        shake(0.35);
      }
      return;
    }
    if (this.ridingTurret) this.dismount();

    let dmg = info.dmg / this.char.defense * (this.transformed ? 0.78 : 1);
    if (this.buffs.shield > 0) {
      this.buffs.shield -= dmg;
      particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), 0x88b7ff, 8, 0.5, 1, 14);
      dmg *= 0.25;
    }
    this.hp -= Math.max(1, Math.round(dmg));
    this.lastHitBy = info.attacker;
    if (info.attacker) info.attacker.dmgDealt += dmg;

    const dir = info.dir ? info.dir.clone().setY(0).normalize() : V(0, 0, 1);
    const kb = info.kb || 6;
    if (this.state !== 'knockdown') {
      this.vel.x = dir.x * kb;
      this.vel.z = dir.z * kb;
    }
    if (info.launch) this.vel.y = Math.max(this.vel.y, info.launch);

    particles.spawn(this.pos.clone().add(V(0, 1.2, 0)), 0xffe07a, 12, 0.45, 1, 16);
    sfx(info.dmg >= 18 ? 'heavy' : 'hit');
    game.hitStop = Math.max(game.hitStop, 0.05);

    if (this.hp <= 0) {
      this.hp = 0;
      this.koOut(info);
      return;
    }
    if (info.knockdown || info.dmg >= 18) {
      this.setState('knockdown');
      this.stonesEjectIf(info.dmg >= 22);
      this.gold = Math.max(0, this.gold - 5);
    } else {
      this.setState('hurt');
    }
    this.gauge = Math.max(this.transformed ? 0 : this.gauge, this.gauge - 3);
    if (this.transformed && this.gauge <= 0) { this.gauge = 0; }
  }

  koOut(info) {
    this.ko = true;
    this.setState('knockdown');
    this.stonesEjectIf(true);
    this.dropHeld();
    if (info.attacker) {
      info.attacker.kos++;
      banner(`${info.attacker.char.name} K.O. ${this.char.name}!`, 1.6);
    } else {
      banner(`${this.char.name} K.O.!`, 1.4);
    }
    sfx('ko');
    flashScreen(0.5);
    shake(0.9);
    game.slowT = 0.45;
    particles.spawn(this.pos.clone().add(V(0, 1, 0)), 0xffffff, 24, 1.1, 1, 70);
    for (let i = 0; i < 6; i++) spawnPickup(this.pos.clone().add(V(rand(-2, 2), 1, rand(-2, 2))), { id: 'coin', name: 'Gold', kind: 'gold', color: 0xffd23d });
  }

  doRespawn() {
    this.falling = false;
    const sp = pick(game.stage.spawn);
    this.pos.copy(sp);
    this.vel.set(0, 0, 0);
    this.iFrames = 1.3;
    this.setState('jump');
    particles.spawn(this.pos.clone(), 0x7fe9ff, 8, 0.7, 1, 20);
    sfx('pad');
  }

  /* ---------- physics & collision ---------- */
  applyPhysics(dt) {
    if (this.ridingTurret) {
      const t = this.ridingTurret;
      this.pos.copy(t.pos).add(V(0, 0.8, 0));
      this.vel.set(0, 0, 0);
      this.grounded = true;
      // aim at nearest foe
      const foe = nearestFoe(this, 999);
      if (foe) {
        const d = foe.pos.clone().sub(t.pos);
        t.angle = Math.atan2(d.x, d.z);
        t.group.rotation.y = t.angle;
        this.yaw = t.angle;
      }
      t.cd -= dt;
      if (this.player.input.attack && t.cd <= 0 && t.ammo > 0) {
        t.cd = 0.55; t.ammo--;
        spawnProjectile(this, V(Math.sin(t.angle), 0.06, Math.cos(t.angle)).multiplyScalar(30), 25, {
          color: 0xffb648, r: 0.55, life: 2.4, aoe: 3, name: 'CANNON'
        });
        sfx('turret');
        shake(0.35);
        if (t.ammo <= 0) this.dismount();
      }
      return;
    }

    this.vel.y -= 34 * dt;
    this.pos.addScaledVector(this.vel, dt);

    // platform collision (AABB vs AABB, feet-based)
    this.grounded = false;
    this.wallNormal.set(0, 0, 0);
    const hx = 0.5, h = 1.85;
    for (const p of game.stage.platforms) {
      if (!p.alive) continue;
      const fminX = this.pos.x - hx, fmaxX = this.pos.x + hx;
      const fminY = this.pos.y, fmaxY = this.pos.y + h;
      const fminZ = this.pos.z - hx, fmaxZ = this.pos.z + hx;
      const ox = Math.min(fmaxX, p.max.x) - Math.max(fminX, p.min.x);
      const oy = Math.min(fmaxY, p.max.y) - Math.max(fminY, p.min.y);
      const oz = Math.min(fmaxZ, p.max.z) - Math.max(fminZ, p.min.z);
      if (ox <= 0 || oy <= 0 || oz <= 0) continue;

      if (oy <= ox && oy <= oz) {
        const cx = (p.min.x + p.max.x) / 2, cy = (p.min.y + p.max.y) / 2, cz = (p.min.z + p.max.z) / 2;
        if (this.pos.y + h / 2 > cy) {
          this.pos.y = p.max.y;
          if (this.vel.y < 0) {
            if (this.vel.y < -16 && this.state !== 'knockdown') {
              particles.spawn(this.pos.clone(), 0xffffff, 6, 0.4, 1, 12);
            }
            this.vel.y = 0;
          }
          this.grounded = true;
          this.jumpsMax = this.transformed ? 3 : 2;
          this.jumps = this.jumpsMax;
          if (this.state === 'jump') this.setState('idle');
          this.ridingPlat = p;
        } else {
          this.pos.y = p.min.y - h;
          this.vel.y = Math.min(this.vel.y, 0);
        }
      } else if (ox <= oz) {
        const cx = (p.min.x + p.max.x) / 2;
        const s = this.pos.x > cx ? 1 : -1;
        this.pos.x += s * ox;
        this.vel.x = 0;
        this.wallNormal.set(s, 0, 0);
      } else {
        const cz = (p.min.z + p.max.z) / 2;
        const s = this.pos.z > cz ? 1 : -1;
        this.pos.z += s * oz;
        this.vel.z = 0;
        this.wallNormal.set(0, 0, s);
      }
    }

    // arena bounds (soft)
    const r = Math.hypot(this.pos.x, this.pos.z);
    const bound = game.stage.id === 'galleon' ? 34 : 26;
    if (r > bound) {
      const s = bound / r;
      this.pos.x *= s; this.pos.z *= s;
    }

    // kill plane
    if (this.pos.y < game.stage.killY) {
      if (!this.ko) {
        this.hp -= 35;
        particles.spawn(V(this.pos.x, -6, this.pos.z), 0x8fd8ff, 14, 0.9, 1, 26);
        sfx('hurt');
        if (this.hp <= 0) {
          this.hp = 0;
          this.koOut({ attacker: null });
          return;
        }
        this.stonesEjectIf(true);
        this.falling = true;
        this.respawnT = 1.0;
        this.vel.set(0, 0, 0);
      }
    }

    // traps
    for (const tr of game.traps) {
      if (tr.hit) continue;
      if (tr.pos.distanceTo(this.pos) < 1.6 && tr.owner !== this) {
        tr.hit = true;
        this.takeHit({ dmg: 18, kb: 8, launch: 0, knockdown: true, attacker: tr.owner, dir: V(0, 1, 0), name: 'TRAP' });
        this.stun = 1.2;
        sfx('heavy');
        particles.spawn(tr.pos, 0xffe07a, 10, 0.7, 1, 22);
      }
    }
  }

  dismount() {
    if (!this.ridingTurret) return;
    this.ridingTurret.rider = null;
    this.ridingTurret = null;
    this.pos.y += 1.2;
    this.vel.y = 8;
    this.iFrames = 0.5;
  }

  /* ---------- visuals ---------- */
  updateVisuals(dt) {
    const g = this.mesh.group;
    g.position.copy(this.pos);
    const speed = Math.hypot(this.vel.x, this.vel.z);

    // facing
    let targetYaw = this.yaw;
    const st = this.state;
    if (st === 'knockdown') {
      g.rotation.x = damp(g.rotation.x, -1.35, 8, dt);
      g.position.y += 0.55;
    } else {
      g.rotation.x = damp(g.rotation.x, 0, 8, dt);
    }
    g.rotation.y = damp(g.rotation.y, targetYaw, 12, dt);

    // idle / run cycle
    const runAmt = clamp(speed / 7, 0, 1.2);
    const phase = this.animT * (5.5 + speed * 1.1);
    if (st !== 'knockdown' && st !== 'attack' && st !== 'airattack') {
      this.mesh.legL.rotation.x = Math.sin(phase) * 0.85 * runAmt;
      this.mesh.legR.rotation.x = -Math.sin(phase) * 0.85 * runAmt;
      this.mesh.armL.rotation.x = -Math.sin(phase) * 0.6 * runAmt;
      this.mesh.armR.rotation.x = Math.sin(phase) * 0.6 * runAmt;
      this.mesh.armL.rotation.z = 0.12; this.mesh.armR.rotation.z = -0.12;
    }

    // jump tuck
    if (!this.grounded && st !== 'attack' && st !== 'airattack') {
      this.mesh.legL.rotation.x = lerp(this.mesh.legL.rotation.x, -0.6, 0.15);
      this.mesh.legR.rotation.x = lerp(this.mesh.legR.rotation.x, 0.35, 0.15);
      this.mesh.armL.rotation.x = lerp(this.mesh.armL.rotation.x, -1.2, 0.15);
      this.mesh.armR.rotation.x = lerp(this.mesh.armR.rotation.x, -1.4, 0.15);
    }

    // attack swing
    if (st === 'attack' || st === 'airattack') {
      const a = this.atk || ATTACKS.g1;
      const t = clamp(this.stateT / (a.startup + a.active + a.recovery), 0, 1);
      const swing = Math.sin(t * Math.PI);
      this.mesh.armR.rotation.x = lerp(-1.8, 1.9, swing);
      this.mesh.armL.rotation.x = lerp(0.4, -0.7, swing);
      this.mesh.torso.rotation.y = Math.sin(t * Math.PI * 2) * 0.45;
      if (st === 'airattack') {
        this.mesh.legL.rotation.x = -0.8; this.mesh.legR.rotation.x = 0.6;
        g.rotation.x = 0.25 + swing * 0.6;
      }
    } else {
      this.mesh.torso.rotation.y = damp(this.mesh.torso.rotation.y, 0, 8, dt);
    }

    // squash on landing
    if (this.grounded && st === 'idle') {
      const squash = 1 + Math.sin(this.animT * 2) * 0.012;
      g.scale.set(squash, 1 / squash, squash);
    } else g.scale.set(1, 1, 1);

    // transformation visuals
    const theme = this.char.theme;
    const here = this.pos.clone().add(V(0, 1, 0));
    if (this.transformed) {
      const s = this.char.scale;
      g.scale.setScalar(s);
      this.mesh.aura.visible = true;
      this.mesh.aura.rotation.z += dt * 2;
      for (const m of this.mesh.mats) m.emissive.setHex(theme), m.emissiveIntensity = 0.32;
    } else if (this.transformT > 0) {
      const pulse = 1 + Math.sin(this.transformT * 25) * 0.12;
      g.scale.setScalar(1.1 * pulse);
      for (const m of this.mesh.mats) m.emissive.setHex(0xffffff), m.emissiveIntensity = 0.6;
    } else {
      this.mesh.aura.visible = this.buffs.invis > 0 || this.buffs.shield > 0;
      this.mesh.aura.material.color.setHex(this.buffs.shield > 0 ? 0x88b7ff : theme);
      for (const m of this.mesh.mats) m.emissive.setHex(0x000000), m.emissiveIntensity = 0;
    }

    // invisibility
    const invis = this.buffs.invis > 0;
    g.visible = !invis || this.state === 'attack' || this.state === 'airattack';
    if (invis) {
      for (const m of this.mesh.mats) { m.transparent = true; m.opacity = 0.28; }
    } else {
      for (const m of this.mesh.mats) { m.transparent = false; m.opacity = 1; }
    }

    // weapon in hand
    this.updateWeaponModel();

    // hurt flash
    if (this.state === 'hurt') {
      for (const m of this.mesh.mats) { m.emissive.setHex(0xff3333); m.emissiveIntensity = 0.5; }
    }
  }

  updateWeaponModel() {
    const slot = this.mesh.weaponSlot;
    if (slot.userData.kind === (this.held ? this.held.id : 'none')) return;
    while (slot.children.length) slot.remove(slot.children[0]);
    slot.userData.kind = this.held ? this.held.id : 'none';
    if (!this.held) return;
    const it = this.held;
    let mesh;
    if (it.kind === 'melee') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.25, 0.3), mat(it.color));
    } else if (it.kind === 'gun') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 1.15), mat(it.color));
    } else if (it.kind === 'bomb') {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), mat(it.color, 0xff4422, 0.6));
    } else {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), mat(it.color, it.color, 0.3));
    }
    mesh.castShadow = true;
    slot.add(mesh);
  }
}

function stageFriction() {
  return game.stage ? 1 : 1;
}

/* ---------------- projectiles ---------------- */
function spawnProjectile(owner, vel, dmg, opts = {}) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(opts.r || 0.35, 12, 10),
    mat(opts.color || 0xffe07a, opts.color || 0xffe07a, opts.sparkle ? 1.2 : 0.55)
  );
  mesh.castShadow = true;
  const start = owner.pos.clone().add(V(0, 1.15, 0)).add(vel.clone().normalize().multiplyScalar(1.1));
  mesh.position.copy(start);
  scene.add(mesh);
  game.projectiles.push({
    mesh, pos: start.clone(), vel: vel.clone(), dmg, owner,
    life: opts.life || 2.0, r: opts.r || 0.35, aoe: opts.aoe || 0,
    glue: !!opts.glue, item: opts.item || null, name: opts.name || 'SHOT', t: 0
  });
}
function explodeAt(pos, radius, dmg, owner) {
  particles.spawn(pos, 0xffb030, 22, 0.9, 1, 60);
  particles.spawn(pos, 0xffffff, 12, 0.6, 1, 30);
  sfx('explode');
  shake(0.6);
  for (const f of game.fighters) {
    if (f.ko) continue;
    const d = f.pos.distanceTo(pos);
    if (d < radius) {
      const dir = f.pos.clone().sub(pos).setY(0).normalize();
      const scale = 1 - d / radius;
      f.takeHit({
        dmg: dmg * (owner === f ? 0.5 : 1) * (0.5 + scale * 0.5), kb: 14 * scale + 4,
        launch: 8, knockdown: true, attacker: owner === f ? null : owner,
        dir, name: 'EXPLOSION'
      });
    }
  }
}
function updateProjectiles(dt) {
  for (const p of game.projectiles) {
    if (p.life <= 0) continue;
    p.life -= dt; p.t += dt;
    if (p.item && p.item.kind === 'bomb') p.vel.y -= 18 * dt;
    p.pos.addScaledVector(p.vel, dt);
    p.mesh.position.copy(p.pos);
    p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 6;

    if (p.t > 0.02) {
      for (const f of game.fighters) {
        if (f === p.owner || f.ko) continue;
        if (f.pos.clone().add(V(0, 1.1, 0)).distanceTo(p.pos) < p.r + 0.85) {
          if (p.aoe) {
            explodeAt(p.pos, p.aoe, p.dmg, p.owner);
          } else {
            f.takeHit({
              dmg: p.dmg, kb: 9, launch: 4, knockdown: p.dmg >= 18,
              attacker: p.owner, dir: p.vel.clone().setY(0).normalize(), name: p.name
            });
            if (p.glue) f.buffs.glue = 2.5;
            particles.spawn(p.pos, 0xffe07a, 9, 0.4, 1, 14);
            sfx('hit');
          }
          p.life = 0;
          break;
        }
      }
    }
    // crate hits
    for (const c of game.stage.crates) {
      if (!c.mesh.visible) continue;
      if (c.pos.distanceTo(p.pos) < p.r + c.size * 0.6) {
        damageCrate(c, p.dmg);
        if (p.aoe) explodeAt(p.pos, p.aoe, p.dmg, p.owner);
        p.life = 0;
      }
    }
    if (p.pos.y < (game.stage.killY + 20) || p.pos.y < -12) {
      if (p.aoe) explodeAt(p.pos, p.aoe, p.dmg, p.owner);
      p.life = 0;
    }
    if (p.life <= 0) scene.remove(p.mesh);
  }
  game.projectiles = game.projectiles.filter(p => p.life > 0);
}

function damageCrate(c, dmg) {
  c.hp -= dmg / 12;
  c.mesh.position.y += 0.045;
  if (c.hp <= 0 && c.mesh.visible) {
    c.mesh.visible = false;
    c.respawnT = 24;
    particles.spawn(c.pos.clone(), 0xd9a24c, 12, 0.7, 1, 24);
    sfx('explode');
    if (c.contents) {
      if (Math.random() < 0.14) spawnStone(c.pos.clone().add(V(0, 1, 0)));
      else spawnPickup(c.pos.clone().add(V(0, 1, 0)), randomItem());
    }
    shake(0.25);
  }
}

/* ---------------- item update ---------------- */
function updatePickups(dt) {
  for (const pk of game.pickups) {
    if (!pk.alive) continue;
    pk.bob += dt;
    pk.lock = Math.max(0, pk.lock - dt);
    pk.mesh.position.y = pk.pos.y + 0.65 + Math.sin(pk.bob * 2.2) * 0.16;
    pk.mesh.rotation.y += dt * (pk.isStone ? 2.6 : 1.1);
    if (pk.isStone && Math.random() < 0.12) {
      particles.spawn(pk.mesh.position.clone(), 0x7fe9ff, 1.6, 0.6, 1, 1, 1);
    }
    if (pk.item.kind === 'gold') {
      for (const f of game.fighters) {
        if (f.ko) continue;
        if (f.pos.distanceTo(pk.pos) < 1.5) {
          pk.alive = false; scene.remove(pk.mesh);
          f.gold += 5;
          sfx('pickup');
          particles.spawn(pk.pos, 0xffd23d, 5, 0.4, 1, 8);
        }
      }
    }
  }
  game.pickups = game.pickups.filter(p => p.alive);
}

/* ---------------- helpers: nearest X ---------------- */
function nearestPickup(pos, range) {
  let best = null, bd = range;
  for (const pk of game.pickups) {
    if (!pk.alive || pk.lock > 0 || pk.item.kind === 'gold') continue;
    const d = pk.pos.distanceTo(pos);
    if (d < bd) { bd = d; best = pk; }
  }
  return best;
}
function nearestFoe(f, range) {
  let best = null, bd = range;
  for (const o of game.fighters) {
    if (o === f || o.ko || o.falling) continue;
    if (o.buffs.invis > 0 && range < 5) continue;
    const d = o.pos.distanceTo(f.pos);
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function nearestTurret(pos, range) {
  let best = null, bd = range;
  for (const t of game.stage.turrets) {
    const d = t.pos.distanceTo(pos);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

/* ---------------- camera ---------------- */
function updateCamera(dt) {
  const targets = game.fighters.filter(f => !f.ko && !f.falling);
  const cam = camera;
  if (game.state !== 'fight' || targets.length === 0) {
    const t = game.time * 0.11;
    const target = V(Math.sin(t) * 30, 20, Math.cos(t) * 30);
    cam.position.lerp(target, 1 - Math.exp(-1.2 * dt));
    cam.lookAt(game.stage ? V(0, 2, 0) : V(0, 0, 0));
    return;
  }
  const centroid = V();
  for (const f of targets) centroid.add(f.pos);
  centroid.multiplyScalar(1 / targets.length);
  let spread = 0, vSpread = 0;
  for (const f of targets) {
    spread = Math.max(spread, Math.hypot(f.pos.x - centroid.x, f.pos.z - centroid.z));
    vSpread = Math.max(vSpread, Math.abs(f.pos.y - centroid.y));
  }
  const dist = clamp(15 + spread * 1.12 + vSpread * 0.7, 15, 36);
  const dir = V(0.55, 0.92, 1.0).normalize();
  const desired = centroid.clone().add(dir.multiplyScalar(dist));
  desired.y = Math.max(desired.y, 7);
  game.camPos.lerp(desired, 1 - Math.exp(-2.6 * dt));
  game.camLook.lerp(centroid.clone().add(V(0, 1.8, 0)), 1 - Math.exp(-4.2 * dt));
  cam.position.copy(game.camPos);
  if (game.shake > 0.001) {
    cam.position.x += rand(-1, 1) * game.shake;
    cam.position.y += rand(-1, 1) * game.shake * 0.7;
    cam.position.z += rand(-1, 1) * game.shake;
    game.shake = Math.max(0, game.shake - dt * 1.9);
  }
  cam.lookAt(game.camLook);
  const fov = clamp(54 + spread * 0.45, 54, 68);
  cam.fov += (fov - cam.fov) * (1 - Math.exp(-2.4 * dt));
  cam.updateProjectionMatrix();
}
function shake(amount) { game.shake = Math.max(game.shake, amount); }

/* ---------------- AI ---------------- */
function aiThink(f, dt) {
  f.aiT -= dt;
  if (f.buffs.invis > 0) return;
  if (f.aiT > 0) return;
  f.aiT = rand(0.16, 0.3);

  // steal/capture stones first if close by
  let stone = null, sd = 999;
  for (const pk of game.pickups) {
    if (!pk.isStone || !pk.alive) continue;
    const d = pk.pos.distanceTo(f.pos);
    if (d < sd) { sd = d; stone = pk; }
  }
  const foe = nearestFoe(f, 999);
  const item = nearestPickup(f.pos, 8);

  // the stone loop drives the AI: grab crystals whenever fewer than 3
  let goal = null;
  if (f.stones.length < 3 && stone && sd < 30) {
    goal = 'stone'; f.aiTargetPos = stone.pos.clone();
  } else if (!f.held && item && Math.random() < 0.65) {
    goal = 'item'; f.aiTargetPos = item.pos.clone();
  } else if (!f.held && Math.random() < 0.7) {
    // smash item boxes when unarmed
    let crate = null, cdist = 20;
    for (const c of game.stage.crates) {
      if (!c.mesh.visible) continue;
      const d = c.pos.distanceTo(f.pos);
      if (d < cdist) { cdist = d; crate = c; }
    }
    if (crate) { goal = 'crate'; f.aiTargetPos = crate.pos.clone(); }
  }
  if (!goal) {
    if (foe) { goal = 'foe'; f.aiTargetPos = foe.pos.clone(); }
    else { goal = 'wander'; f.aiTargetPos = V(rand(-10, 10), 0, rand(-10, 10)); }
  }
  f.aiGoal = goal;
  f.aiFoe = foe;

  // dodge reaction: attack incoming?
  f.aiDodge = 0;
  for (const hb of game.hitboxes) {
    if (hb.owner === f) continue;
    if (hb.center.distanceTo(f.pos) < hb.r + 2.6 && Math.random() < 0.22) f.aiDodge = 1;
  }
  for (const p of game.projectiles) {
    if (p.owner === f) continue;
    const toFoe = f.pos.clone().sub(p.pos).setY(0).normalize();
    const velDir = p.vel.clone().setY(0).normalize();
    if (p.pos.distanceTo(f.pos) < 12 && toFoe.dot(velDir) > 0.86 && Math.random() < 0.12) f.aiDodge = 1;
  }
}
function aiDrive(f, dt) {
  const inp = { mx: 0, my: 0, attack: false, jump: false, action: false, discard: false };
  if (f.ko || f.transformT > 0) return inp;
  const target = f.aiTargetPos || V(0, 0, 0);
  const d = target.clone().sub(f.pos).setY(0);
  const dist = d.length();
  if (dist > 0.4) {
    const worldDir = d.normalize();
    // convert world dir into camera-relative stick (inverse of moveWorld)
    const camDir = V(); camera.getWorldDirection(camDir); camDir.y = 0; camDir.normalize();
    const right = V(-camDir.z, 0, camDir.x);
    inp.mx = clamp(worldDir.dot(right), -1, 1);
    inp.my = clamp(-worldDir.dot(camDir), -1, 1);
    const mag = Math.hypot(inp.mx, inp.my);
    if (mag > 1) { inp.mx /= mag; inp.my /= mag; }
  }

  const foe = f.aiFoe || nearestFoe(f, 999);
  const foeDist = foe ? foe.pos.distanceTo(f.pos) : 99;

  if (f.aiGoal === 'item' || f.aiGoal === 'stone') {
    const d3 = Math.hypot(dist, target.y - f.pos.y);
    if (d3 < 2.6) inp.action = Math.random() < 0.6;
    // hop up to reach elevated pickups
    if (target.y - f.pos.y > 1.2 && dist < 3.4) inp.jump = true;
    else if (dist < 3.2 && Math.random() < 0.02) inp.jump = true;
    return inp;
  }
  if (f.aiGoal === 'crate') {
    const d3 = Math.hypot(dist, target.y - f.pos.y);
    if (d3 < 3.0) inp.attack = Math.random() < 0.55;
    return inp;
  }
  if (f.aiGoal === 'foe' && foe) {
    if (f.held && f.held.kind === 'gun' && foeDist > 5 && foeDist < 22) {
      if (Math.random() < 0.5) inp.attack = true;
      return inp;
    }
    if (f.transformed) {
      if (foeDist > 6 && foeDist < 20 && Math.random() < 0.4) inp.attack = true;
      if (foeDist < 6 && Math.random() < 0.22) {
        inp.attack = true; inp.jump = true;
      }
      return inp;
    }
    if (foeDist < 2.3) {
      if (Math.random() < 0.42) inp.attack = true;
      if (Math.random() < 0.06) inp.action = true;
    } else if (foeDist < 4 && Math.random() < 0.03) {
      inp.jump = true;
    }
    if (Math.random() < 0.01) inp.attack = true;
    return inp;
  }
  if (Math.random() < 0.01) inp.jump = true;
  return inp;
}

/* ---------------- HUD ---------------- */
const hudPanels = [];
function buildHud() {
  const hud = document.getElementById('hud');
  hudPanels.forEach(p => p.el.remove());
  hudPanels.length = 0;
  game.fighters.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'panel';
    el.style[i % 2 === 0 ? 'left' : 'right'] = '18px';
    el.style.top = (16 + (Math.floor(i / 2) * 128)) + 'px';
    el.innerHTML = `
      <div class="row1"><div class="pname">P${i + 1} · ${f.char.name}</div>
        <div class="php">${Math.ceil(f.hp)}</div></div>
      <div class="hpbar"><div class="hpfill"></div></div>
      <div class="stones">
        <div class="stone"></div><div class="stone"></div><div class="stone"></div>
        <div class="gauge"><div class="gaugefill"></div></div>
        <div class="gbadge"></div>
      </div>
      <div class="held"></div>`;
    hud.appendChild(el);
    hudPanels.push({
      el, f,
      hp: el.querySelector('.hpfill'), php: el.querySelector('.php'),
      stones: el.querySelectorAll('.stone'), gauge: el.querySelector('.gaugefill'),
      badge: el.querySelector('.gbadge'), held: el.querySelector('.held'),
      color: '#' + f.char.primary.toString(16).padStart(6, '0')
    });
  });
}
function updateHud() {
  if (game.state !== 'fight') return;
  const total = Math.max(0, Math.ceil(game.matchTime));
  document.getElementById('timer').textContent =
    `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  document.getElementById('stageName').textContent = game.stage.name;
  for (const p of hudPanels) {
    const f = p.f;
    const pct = clamp(f.hp / f.maxHp, 0, 1) * 100;
    p.hp.style.width = pct + '%';
    p.hp.style.background = f.transformed
      ? `linear-gradient(90deg,#ffe27a,${p.color})`
      : `linear-gradient(90deg,#ff5c6e,${p.color})`;
    p.php.textContent = f.ko ? 'K.O.' : Math.ceil(f.hp);
    p.stones.forEach((s, i) => {
      s.classList.toggle('on', i < f.stones.length);
      s.style.color = p.color;
    });
    p.gauge.style.width = clamp(f.gauge, 0, 100) + '%';
    p.badge.textContent = f.transformed ? 'PRISM' : (f.burnoutT > 0 ? 'BURNOUT' : (f.spare ? 'SPARE×' + f.spare : ''));
    p.held.textContent = f.held ? `ITEM: ${f.held.name}` : (f.pockets.length ? `POCKET: ${f.pockets.map(x => x.name).join(' · ')}` : '');
    p.el.style.opacity = f.ko ? 0.5 : 1;
  }
}

/* ---------------- match flow ---------------- */
function startMatch() {
  // clear
  for (const f of game.fighters) scene.remove(f.mesh.group);
  if (game.stage) scene.remove(game.stage.group);
  game.fighters = []; game.pickups = []; game.projectiles = []; game.traps = [];
  game.time = 0; game.matchTime = 180; game.hitStop = 0;

  const stage = buildStage(game.stageId);
  game.stage = stage;
  scene.background = new THREE.Color(stage.sky);
  scene.fog = new THREE.Fog(stage.sky, 70, 240);

  slots.forEach((slot, i) => {
    const char = CHARS[slot.charIndex];
    const f = new Fighter(char, {
      isCPU: slot.mode === 'cpu',
      keyMap: slot.mode === 'k1' ? KEYMAPS.k1 : slot.mode === 'k2' ? KEYMAPS.k2 : null,
      padIndex: slot.mode === 'pad' ? (slot.padIndex ?? 0) : -1,
      input: { mx: 0, my: 0, attack: false, jump: false, action: false, discard: false },
      prevInput: { attack: false, jump: false, action: false, discard: false }
    });
    f.pos.copy(stage.spawn[i % stage.spawn.length]);
    f.mesh.group.position.copy(f.pos);
    scene.add(f.mesh.group);
    game.fighters.push(f);
  });

  // pre-seeded floor loot (boxes are everywhere, so is the chaos)
  for (const [x, y, z] of [[-8, 1, 4], [8, 1, -4], [0, 1, 6], [-4, 1, -6], [4, 1, 2]]) {
    spawnPickup(V(x, y, z), randomItem());
  }

  buildHud();
  game.state = 'fight';
  showScreen(null);
  document.getElementById('hud').classList.remove('hidden');
  banner('BRAWL!', 1.4);
  sfx('event');
  initAudio();
}

function endMatch() {
  game.state = 'results';
  document.getElementById('hud').classList.add('hidden');
  sfx('win');
  const ranked = [...game.fighters].sort((a, b) =>
    (b.ko ? 0 : 1) - (a.ko ? 0 : 1) || (b.hp / b.maxHp) - (a.hp / a.maxHp) || b.kos - a.kos || b.gold - a.gold);
  const winner = ranked[0];
  document.getElementById('resultsTitle').textContent =
    winner ? `${winner.char.name} WINS!` : 'TIME UP!';
  const rows = game.fighters.map((f, i) => `
    <tr>
      <td class="${f === winner ? 'win' : ''}">${i + 1}. ${f.char.name}</td>
      <td>${f.ko ? 'K.O.' : Math.ceil(f.hp)}</td>
      <td>${f.kos}</td>
      <td>${Math.round(f.dmgDealt)}</td>
      <td>${f.gold}</td>
      <td>${f.stonesTaken}</td>
    </tr>`).join('');
  document.getElementById('resultsBody').innerHTML = `
    <table>
      <tr><th>Fighter</th><th>HP</th><th>KOs</th><th>Damage</th><th>Gold</th><th>Stones</th></tr>
      ${rows}
    </table>`;
  showScreen('results');
}

/* ---------------- screens ---------------- */
const slots = [
  { charIndex: 0, mode: 'k1' },
  { charIndex: 1, mode: 'cpu' },
  { charIndex: 2, mode: 'cpu' },
  { charIndex: 3, mode: 'cpu' }
];
const STAGES = [
  { id: 'galleon', label: 'SKY GALLEON BREAK-UP' },
  { id: 'iceberg', label: 'GLACIER RUMBLE' }
];
function showScreen(id) {
  for (const s of ['title', 'select', 'results']) {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  }
  if (id === null) {
    for (const s of ['title', 'select', 'results']) document.getElementById(s).classList.add('hidden');
  }
}
function buildSelect() {
  const host = document.getElementById('slots');
  host.innerHTML = '';
  const modes = [['cpu', 'CPU'], ['k1', 'KEYBOARD 1'], ['k2', 'KEYBOARD 2'], ['pad', 'GAMEPAD']];
  slots.forEach((slot, i) => {
    const el = document.createElement('div');
    el.className = 'slot';
    const ch = CHARS[slot.charIndex];
    const modeLabel = modes.find(m => m[0] === slot.mode)[1];
    el.innerHTML = `
      <h3>PLAYER ${i + 1}</h3>
      <div class="char">${ch.name}</div>
      <div class="tag">${ch.tag}<br/>${ch.form} · ${ch.fusionA}</div>
      <button class="mini" data-act="prev">◀</button>
      <button class="mini" data-act="next">▶</button>
      <div class="ctl">CONTROL: ${modeLabel} &nbsp;·&nbsp;
        <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#${ch.primary.toString(16).padStart(6, '0')};vertical-align:middle"></span>
      </div>
      <button class="mini" data-act="mode">CHANGE CONTROL</button>`;
    el.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        initAudio(); sfx('ui');
        const act = b.dataset.act;
        if (act === 'prev') slot.charIndex = (slot.charIndex + CHARS.length - 1) % CHARS.length;
        if (act === 'next') slot.charIndex = (slot.charIndex + 1) % CHARS.length;
        if (act === 'mode') {
          const idx = modes.findIndex(m => m[0] === slot.mode);
          slot.mode = modes[(idx + 1) % modes.length][0];
          if (slot.mode === 'pad') slot.padIndex = (slot.padIndex ?? -1) + 1;
        }
        buildSelect();
      });
    });
    host.appendChild(el);
  });
}
document.getElementById('stagePrev').addEventListener('click', () => {
  game.lastStageIndex = (game.lastStageIndex + STAGES.length - 1) % STAGES.length;
  game.stageId = STAGES[game.lastStageIndex].id;
  document.getElementById('stageLabel').textContent = STAGES[game.lastStageIndex].label;
  sfx('ui');
});
document.getElementById('stageNext').addEventListener('click', () => {
  game.lastStageIndex = (game.lastStageIndex + 1) % STAGES.length;
  game.stageId = STAGES[game.lastStageIndex].id;
  document.getElementById('stageLabel').textContent = STAGES[game.lastStageIndex].label;
  sfx('ui');
});
document.getElementById('startBtn').addEventListener('click', () => {
  initAudio(); sfx('ui'); showScreen('select'); buildSelect();
});
document.getElementById('backBtn').addEventListener('click', () => {
  initAudio(); sfx('ui'); showScreen('title');
});
document.getElementById('fightBtn').addEventListener('click', () => {
  initAudio(); sfx('ui'); startMatch();
});
document.getElementById('rematchBtn').addEventListener('click', () => {
  initAudio(); sfx('ui'); startMatch();
});
document.getElementById('selectBtn').addEventListener('click', () => {
  initAudio(); sfx('ui'); showScreen('select'); buildSelect();
});

/* ---------------- input polling ---------------- */
function pollInputs() {
  for (const f of game.fighters) {
    const p = f.player;
    p.prevInput = Object.assign({}, p.input);
    if (p.isCPU) {
      aiThink(f, game.deltaTime || 0.016);
      p.input = aiDrive(f, game.deltaTime || 0.016);
    } else if (p.padIndex >= 0 && p.padIndex !== undefined) {
      const pad = readGamepad(p.padIndex);
      if (pad) p.input = pad;
      else if (p.keyMap) p.input = readKeyboard(p.keyMap);
    } else if (p.keyMap) {
      p.input = readKeyboard(p.keyMap);
    }
  }
}

/* ---------------- stage events / traps update ---------------- */
function updateStage(dt) {
  const stage = game.stage;
  // moving platforms
  for (const p of stage.platforms) {
    if (p.move && p.alive && !p.collapsing) {
      const np = V();
      p.move(np, game.time);
      p.delta.copy(np).sub(p.basePos);
      p.basePos.copy(np);
      p.mesh.position.copy(np);
      const w = p.max.x - p.min.x, h = p.max.y - p.min.y, d = p.max.z - p.min.z;
      p.min.set(np.x - w / 2, np.y - h / 2, np.z - d / 2);
      p.max.set(np.x + w / 2, np.y + h / 2, np.z + d / 2);
      for (const f of game.fighters) {
        if (f.ridingPlat === p && f.grounded) f.pos.add(p.delta);
      }
    }
    if (p.collapsing && p.alive) {
      p.fallV = (p.fallV || 0) + 22 * dt;
      p.mesh.position.y -= p.fallV * dt;
      p.mesh.rotation.z += dt * 0.35;
      const dy = p.fallV * dt;
      p.min.y -= dy; p.max.y -= dy;
      if (Math.random() < 0.35) particles.spawn(p.mesh.position.clone(), 0xffc46b, 8, 0.5, 1, 3);
      if (p.mesh.position.y < stage.killY - 26) {
        p.alive = false;
        p.mesh.visible = false;
      }
    }
    if (p.gunship && p.alive) {
      const t = clamp((game.time - 78) / 5, 0, 1);
      const x = lerp(-62, -15, t * t * (3 - 2 * t));
      const dx = x - p.mesh.position.x;
      p.mesh.position.x = x;
      p.min.x += dx; p.max.x += dx;
      if (p.turret) {
        p.turret.group.position.x = x;
        p.turret.pos.x = x;
      }
    }
  }
  // stone pads
  for (const pad of stage.pads) {
    pad.t -= dt;
    const live = game.pickups.filter(pk => pk.isStone).length;
    if (pad.t <= 0 && live < 9) {
      pad.t = 17;
      spawnStone(pad.pos.clone().add(V(0, 0.8, 0)));
    }
  }
  // scheduled events
  for (const ev of stage.events) {
    if (ev.done) continue;
    if (ev.repeat) {
      if (game.time > (stage.nextBombard || 999) && game.matchTime > 20) {
        stage.nextBombard = game.time + ev.repeat;
        ev.fn();
      }
    } else if (game.time >= ev.t) {
      ev.done = true;
      ev.fn();
    }
  }
  // traps decay
  for (const tr of game.traps) tr.life -= dt;
  game.traps = game.traps.filter(t => t.life > 0);
  // broken item boxes respawn (boxes everywhere, always something to smash)
  for (const c of stage.crates) {
    if (c.mesh.visible || !c.respawnT) continue;
    c.respawnT -= dt;
    if (c.respawnT <= 0) {
      c.respawnT = 0;
      c.mesh.visible = true;
      c.mesh.position.copy(c.home);
      c.pos.copy(c.home);
      c.hp = 3;
      particles.spawn(c.pos.clone(), 0xffe6a0, 6, 0.6, 1, 14);
    }
  }
}

/* ---------------- main loop ---------------- */
function simulate(dt) {
  if (game.state !== 'fight') return;
  if (game.hitStop > 0) { game.hitStop -= dt; return; }
  pollInputs();
  game.time += dt;
  game.matchTime -= dt;
  for (const f of game.fighters) f.update(dt);
  updateProjectiles(dt);
  updatePickups(dt);
  updateStage(dt);
  const alive = game.fighters.filter(f => !f.ko);
  if ((alive.length <= 1 && game.fighters.length > 1) || game.matchTime <= 0) endMatch();
}

function tick(dt) {
  if (game.bannerT > 0) {
    game.bannerT -= dt;
    if (game.bannerT <= 0) document.getElementById('banner').classList.remove('show');
  }
  if (game.flashT > 0) {
    game.flashT -= dt;
    document.getElementById('flash').style.opacity = String(clamp(game.flashT * 1.8, 0, 0.8));
  }
  if (game.slowT > 0) {
    game.slowT -= dt;
    dt *= 0.32;
  }
  simulate(dt);
  particles.update(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  updateHud();
}

let lastT = performance.now();
function loop() {
  requestAnimationFrame(loop);
  const nowT = performance.now();
  const dt = Math.min(0.05, (nowT - lastT) / 1000);
  lastT = nowT;
  game.deltaTime = dt;
  tick(dt);
}
loop();

/* QA / debug hook (see design/08 ▸ balance knobs & QA checklist) */
window.PRISM = {
  version: '0.1', game, startMatch, endMatch, tick, simulate,
  chars: CHARS, items: ITEMS,
  spawnStoneAt: p => spawnStone(V(p[0], p[1], p[2])),
  itemAt: (p, id) => spawnPickup(V(p[0], p[1], p[2]), itemById(id) || randomItem())
};