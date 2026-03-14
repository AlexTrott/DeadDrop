/**
 * Synthesized sound effects using Web Audio API.
 * No audio files needed — all sounds are generated procedurally.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

/** Master volume (0-1) */
let masterVolume = 0.4
let bgVolume = 0.15
let sfxEnabled = true
let bgEnabled = true

export function setMasterVolume(v: number) { masterVolume = Math.max(0, Math.min(1, v)) }
export function setSfxEnabled(v: boolean) { sfxEnabled = v }
export function setBgEnabled(v: boolean) {
  bgEnabled = v
  if (!v) stopBgNoise()
}

// ─── Background ambient noise ────────────────────────────

let bgNodes: { source: AudioBufferSourceNode; gain: GainNode } | null = null

export function startBgNoise() {
  if (!bgEnabled) return
  if (bgNodes) return // already playing

  const ac = getCtx()
  const sampleRate = ac.sampleRate
  const duration = 4 // seconds, will loop
  const bufferSize = sampleRate * duration
  const buffer = ac.createBuffer(1, bufferSize, sampleRate)
  const data = buffer.getChannelData(0)

  // Generate a low rumbling ambient — filtered brown noise
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }

  const source = ac.createBufferSource()
  source.buffer = buffer
  source.loop = true

  // Low-pass filter for deep rumble
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  filter.Q.value = 1

  const gain = ac.createGain()
  gain.gain.value = bgVolume * masterVolume

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  source.start()

  bgNodes = { source, gain }
}

export function stopBgNoise() {
  if (bgNodes) {
    bgNodes.source.stop()
    bgNodes = null
  }
}

// ─── Sound effects ───────────────────────────────────────

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  rampDown = true,
  detune = 0,
) {
  if (!sfxEnabled) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune

  const gain = ac.createGain()
  gain.gain.value = volume * masterVolume

  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  }

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

function playNoise(duration: number, volume: number, highpass = 0, lowpass = 8000) {
  if (!sfxEnabled) return
  const ac = getCtx()
  const bufferSize = ac.sampleRate * duration
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ac.createBufferSource()
  source.buffer = buffer

  const gain = ac.createGain()
  gain.gain.value = volume * masterVolume
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)

  let node: AudioNode = source

  if (highpass > 0) {
    const hp = ac.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = highpass
    node.connect(hp)
    node = hp
  }

  if (lowpass < 8000) {
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = lowpass
    node.connect(lp)
    node = lp
  }

  node.connect(gain)
  gain.connect(ac.destination)
  source.start()
}

// ─── Game sound effects ──────────────────────────────────

/** Punch/hit sound for basic attacks */
export function playAttack() {
  // Low thud
  playTone(80, 0.15, 'sine', 0.5)
  // Impact noise burst
  playNoise(0.08, 0.3, 200, 2000)
  // Click transient
  playTone(400, 0.03, 'square', 0.15)
}

/** Ability activation — energy whoosh */
export function playAbility(isUltimate: boolean) {
  if (isUltimate) {
    // Rising sweep for ultimate
    if (!sfxEnabled) return
    const ac = getCtx()
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 200
    osc.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.3)

    const gain = ac.createGain()
    gain.gain.value = 0.2 * masterVolume
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + 0.4)

    // Sub bass punch
    playTone(60, 0.2, 'sine', 0.4)
    playNoise(0.15, 0.15, 500, 3000)
  } else {
    // Quick zap for basic
    playTone(300, 0.1, 'square', 0.15)
    playTone(450, 0.08, 'sine', 0.1, true, 10)
    playNoise(0.06, 0.1, 1000, 4000)
  }
}

/** Card played — shuffle/snap sound */
export function playCardPlay() {
  // Paper snap
  playNoise(0.05, 0.2, 2000, 6000)
  // Tonal click
  playTone(800, 0.04, 'sine', 0.1)
  playTone(600, 0.06, 'sine', 0.08)
}

/** Retreat — dramatic descending tone */
export function playRetreat() {
  if (!sfxEnabled) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 500
  osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.4)

  const gain = ac.createGain()
  gain.gain.value = 0.25 * masterVolume
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + 0.5)

  // Thud
  playTone(50, 0.3, 'sine', 0.3)
}

/** Unit KO — explosion/crash */
export function playKO() {
  // Heavy impact
  playTone(40, 0.4, 'sine', 0.5)
  playNoise(0.2, 0.35, 100, 3000)
  // Crumble
  setTimeout(() => {
    playNoise(0.3, 0.15, 500, 2000)
    playTone(60, 0.25, 'triangle', 0.2)
  }, 100)
}

/** New unit enters — ascending fanfare */
export function playUnitEnter() {
  playTone(300, 0.15, 'sine', 0.15)
  setTimeout(() => playTone(400, 0.15, 'sine', 0.15), 80)
  setTimeout(() => playTone(500, 0.2, 'sine', 0.2), 160)
}

/** Turn start — subtle chime */
export function playTurnStart() {
  playTone(600, 0.1, 'sine', 0.08)
  setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 60)
}

/** End turn — muted click */
export function playEndTurn() {
  playTone(200, 0.08, 'triangle', 0.08)
}

/** Game over — win fanfare or lose dirge */
export function playGameOver(won: boolean) {
  if (won) {
    playTone(400, 0.2, 'sine', 0.2)
    setTimeout(() => playTone(500, 0.2, 'sine', 0.2), 120)
    setTimeout(() => playTone(600, 0.2, 'sine', 0.25), 240)
    setTimeout(() => playTone(800, 0.4, 'sine', 0.3), 360)
  } else {
    playTone(300, 0.3, 'sine', 0.2)
    setTimeout(() => playTone(250, 0.3, 'sine', 0.2), 200)
    setTimeout(() => playTone(200, 0.5, 'sine', 0.25), 400)
  }
}

/** Damage dealt — quick thud, scaled by damage */
export function playDamage(amount: number) {
  const intensity = Math.min(1, amount / 15)
  playTone(60 + intensity * 40, 0.1 + intensity * 0.1, 'sine', 0.2 + intensity * 0.2)
  playNoise(0.05 + intensity * 0.05, 0.1 + intensity * 0.15, 300, 1500 + intensity * 1500)
}

/** Heal — soft rising shimmer */
export function playHeal() {
  playTone(500, 0.15, 'sine', 0.1)
  setTimeout(() => playTone(700, 0.15, 'sine', 0.1), 70)
  setTimeout(() => playTone(900, 0.2, 'sine', 0.08), 140)
}

/** Status effect applied — zap/buzz */
export function playStatusEffect(type: 'POISON' | 'SHIELD' | 'BOOST' | 'SLOW') {
  switch (type) {
    case 'POISON':
      playTone(200, 0.2, 'sawtooth', 0.08)
      playTone(250, 0.15, 'sawtooth', 0.06, true, 20)
      break
    case 'SHIELD':
      playTone(400, 0.15, 'sine', 0.1)
      playTone(600, 0.2, 'sine', 0.1)
      break
    case 'BOOST':
      playTone(500, 0.1, 'square', 0.06)
      setTimeout(() => playTone(700, 0.15, 'square', 0.06), 60)
      break
    case 'SLOW':
      playTone(150, 0.2, 'triangle', 0.1)
      playTone(120, 0.25, 'triangle', 0.08, true, -10)
      break
  }
}

/** Card draw — soft whoosh */
export function playDraw() {
  playNoise(0.06, 0.08, 3000, 8000)
  playTone(1000, 0.04, 'sine', 0.05)
}

/**
 * Initialize audio context on first user interaction.
 * Must be called from a click/touch handler to satisfy browser autoplay policy.
 */
export function initAudio() {
  getCtx()
}
