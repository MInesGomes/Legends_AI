// Epic Orchestral & Synthesizer Web Audio Engine for Atlantis: Elion's Journey
export class EpicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private timerId: number | null = null;
  private currentScene: number = 0;
  private beatStep: number = 0;

  // Chord progressions for the 6 epic acts:
  // Scene 1: Regal Atlantis Glory (C minor -> Ab major)
  // Scene 2: Tournament Battle & Triumph (G minor -> F minor -> D#)
  // Scene 3: Exhaustion & Solitary Training (D minor -> Bb minor)
  // Scene 4: Medals & Grand Hall (F minor -> C minor -> G)
  // Scene 5: Isolation & Melancholy (C minor -> Eb minor)
  // Scene 6: Nightmare Cataclysm & Deluge (A diminished -> C minor climax)
  private readonly sceneChords: { [key: number]: number[][] } = {
    0: [[130.81, 155.56, 196.00], [103.83, 130.81, 155.56]], // Cm, Ab
    1: [[98.00, 116.54, 146.83], [87.31, 103.83, 130.81], [155.56, 196.00, 233.08]], // Gm, Fm, Eb
    2: [[73.42, 110.00, 146.83], [116.54, 138.59, 174.61]], // Dm, Bbm
    3: [[87.31, 130.81, 174.61], [65.41, 98.00, 130.81]], // Fm, Cm
    4: [[65.41, 98.00, 116.54], [77.78, 116.54, 138.59]], // Cm7, Ebm
    5: [[55.00, 77.78, 110.00, 155.56], [65.41, 98.00, 130.81, 196.00]], // Adim7, Cm Climax
  };

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.35, now + 0.1);
    }
  }

  public setScene(sceneIndex: number) {
    this.currentScene = Math.max(0, Math.min(5, sceneIndex));
    // Trigger special transition SFX
    this.playTransitionStinger(this.currentScene);
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.beatStep = 0;
    this.scheduleLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleLoop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const tempo = this.currentScene === 5 ? 120 : this.currentScene === 1 ? 110 : 88;
    const beatInterval = (60 / tempo) * 1000 * 0.5; // Eighth note resolution

    this.playBeat(this.beatStep);
    this.beatStep = (this.beatStep + 1) % 16;

    this.timerId = window.setTimeout(() => {
      this.scheduleLoop();
    }, beatInterval);
  }

  private playBeat(step: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const chords = this.sceneChords[this.currentScene] || this.sceneChords[0];
    const chordIndex = Math.floor(step / 8) % chords.length;
    const currentNotes = chords[chordIndex];

    // 1. Taiko / War Drum on accent beats (Stronger in battle & nightmare scenes)
    const isTaikoBeat =
      this.currentScene === 1 // Tournament
        ? step % 2 === 0 || step === 7 || step === 15
        : this.currentScene === 5 // Cataclysm
        ? step % 2 === 0 || step % 3 === 0
        : step === 0 || step === 6 || step === 8 || step === 12;

    if (isTaikoBeat) {
      this.triggerTaiko(now, this.currentScene >= 4 ? 1.2 : 0.9);
    }

    // 2. Brass / Horn Drone on measure starts
    if (step === 0 || step === 8) {
      this.triggerBrassChord(now, currentNotes, (60 / 90) * 4);
    }

    // 3. String / Cello Arpeggio
    if (step % 2 === 0) {
      const noteIdx = (step / 2) % currentNotes.length;
      const freq = currentNotes[noteIdx] * (this.currentScene === 5 ? 2 : 1);
      this.triggerStringPluck(now, freq);
    }

    // 4. Shimmer bell / sparkle on peaceful or lonely scenes
    if ((this.currentScene === 0 || this.currentScene === 4) && step === 4) {
      this.triggerCrystalChime(now, currentNotes[0] * 4);
    }
  }

  // Deep Taiko War Drum Synth
  private triggerTaiko(time: number, intensity: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;

    // Sub Bass Oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Pitch sweep downwards
    const startPitch = this.currentScene === 5 ? 180 : 130;
    osc.frequency.setValueAtTime(startPitch, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.35);

    gain.gain.setValueAtTime(0.4 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.45);

    // Punch transient noise
    const bufferSize = this.ctx.sampleRate * 0.05;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.05);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2 * intensity, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start(time);
  }

  // Heroic Orchestral Brass / Horn Chord
  private triggerBrassChord(time: number, freqs: number[], duration: number) {
    if (!this.ctx || !this.masterGain) return;

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // Low pass filter opening with brass swell
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(1400, time + 0.6);
      filter.frequency.exponentialRampToValueAtTime(450, time + duration);

      const amp = 0.12 / freqs.length;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(amp, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // String / Cello Pluck
  private triggerStringPluck(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.4);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  // Crystal Chime
  private triggerCrystalChime(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 1.2);
  }

  // Cinematic Scene Change Stinger (Whoosh, Blade Clash, or Earthquake)
  private playTransitionStinger(sceneIdx: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (sceneIdx === 1) {
      // Blade clash in tournament arena
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (sceneIdx === 5) {
      // Deep earthquake / wave rumble for disaster
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.8);
    } else {
      // Atmospheric horn swell
      this.triggerTaiko(now, 1.4);
    }
  }

  public destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const epicAudio = new EpicAudioEngine();
