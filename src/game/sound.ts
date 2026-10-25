/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sonidos arcade y música de boda generados con Web Audio API (100% nativo, sin archivos).
 */

const STEP_DUR = 60 / 132 / 2; // corchea a 132 bpm

// Progresión C - G - Am - F
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 523.25],
  [196.0, 246.94, 293.66, 392.0],
  [220.0, 261.63, 329.63, 440.0],
  [174.61, 220.0, 261.63, 349.23],
];
const ARP = [0, 1, 2, 3, 2, 1, 2, 3];
const MELODY: (number | null)[][] = [
  [659.25, null, 783.99, null, 880.0, null, 783.99, null],
  [783.99, null, 698.46, null, 659.25, null, 587.33, null],
  [659.25, null, 698.46, null, 659.25, null, 523.25, null],
  [587.33, null, 659.25, 698.46, 659.25, null, null, null],
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private _enabled = true;

  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private step = 0;

  private thrustGain: GainNode | null = null;
  private thrustWanted = false;

  get enabled() {
    return this._enabled;
  }
  set enabled(v: boolean) {
    this._enabled = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 1 : 0, this.ctx.currentTime, 0.02);
    }
    if (!v) this.stopThrust();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this._enabled ? 1 : 0;
        this.master.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private tone(
    type: OscillatorType,
    f0: number,
    f1: number,
    dur: number,
    vol: number,
    delay = 0
  ) {
    if (!this._enabled) return;
    this.initCtx();
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /* ---------------- Efectos ---------------- */

  playCoin() {
    this.tone('sine', 987.77, 987.77, 0.1, 0.13);
    this.tone('sine', 1318.51, 1318.51, 0.22, 0.13, 0.07);
  }

  playPowerup() {
    [330, 440, 554, 659, 880].forEach((f, i) => this.tone('triangle', f, f, 0.18, 0.14, i * 0.06));
  }

  playShieldBreak() {
    this.tone('square', 400, 120, 0.3, 0.18);
  }

  playHit() {
    this.tone('sawtooth', 150, 40, 0.4, 0.3);
    this.tone('square', 90, 50, 0.3, 0.2);
  }

  playWarning() {
    this.tone('square', 880, 880, 0.08, 0.07);
    this.tone('square', 660, 660, 0.08, 0.07, 0.11);
  }

  playLaunch() {
    this.tone('sawtooth', 300, 90, 0.35, 0.1);
  }

  playExplosion() {
    this.tone('sawtooth', 260, 50, 0.3, 0.2);
    this.tone('triangle', 900, 300, 0.2, 0.12);
  }

  playGameOver() {
    [440, 415, 392, 330].forEach((f, i) => this.tone('sawtooth', f, f, 0.25, 0.16, i * 0.18));
  }

  playZone() {
    [523, 659, 784].forEach((f, i) => this.tone('triangle', f, f, 0.25, 0.12, i * 0.09));
  }

  /* ---------------- Propulsor (ruido filtrado) ---------------- */

  startThrust() {
    this.thrustWanted = true;
    if (!this._enabled) return;
    this.initCtx();
    if (!this.ctx || !this.master) return;
    if (!this.thrustGain) {
      const len = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 0.6;
      this.thrustGain = this.ctx.createGain();
      this.thrustGain.gain.value = 0;
      src.connect(filter);
      filter.connect(this.thrustGain);
      this.thrustGain.connect(this.master);
      src.start();
    }
    this.thrustGain.gain.setTargetAtTime(0.1, this.ctx.currentTime, 0.03);
  }

  stopThrust() {
    this.thrustWanted = false;
    if (this.thrustGain && this.ctx) {
      this.thrustGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  /* ---------------- Música ---------------- */

  startMusic() {
    if (this.musicTimer !== null) return;
    this.initCtx();
    if (!this.ctx || !this.master) return;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(this.master);
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 90);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      const g = this.musicGain;
      g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      setTimeout(() => g.disconnect(), 600);
      this.musicGain = null;
    }
  }

  private scheduleMusic() {
    if (!this.ctx || !this.musicGain) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.35) {
      this.playStep(this.step, this.nextNoteTime);
      this.nextNoteTime += STEP_DUR;
      this.step++;
    }
  }

  private note(type: OscillatorType, freq: number, time: number, dur: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private playStep(step: number, time: number) {
    const bar = Math.floor(step / 8) % CHORDS.length;
    const i = step % 8;
    const chord = CHORDS[bar];
    this.note('triangle', chord[ARP[i]], time, 0.2, 0.05);
    if (i === 0 || i === 4) this.note('sine', chord[0] / 2, time, 0.38, 0.1);
    const m = MELODY[bar][i];
    if (m) this.note('sine', m, time, 0.4, 0.055);
  }
}

export const sound = new SoundManager();
