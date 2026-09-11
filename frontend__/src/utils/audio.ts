/**
 * Sleepy Lofi Music & Ambient Synthesizer Engine
 * High-fidelity, boosted audio engine with Dynamics Compressor,
 * adjustable master volume (up to 150% boost), and rich harmonic levels.
 *
 * Chords: Fmaj9 -> Em7 -> Dm9 -> Cmaj7 (68 BPM)
 */

class LofiMusicEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;

  // Master Volume Level (0.0 to 1.5, default 1.0 = 100%)
  private userVolume = 1.0;

  // Track position
  private currentStep = 0;
  private nextNoteTime = 0;
  private tempo = 68; // 68 BPM - deeply relaxing & sleepy
  private secondsPerBeat = 60 / 68;
  private sixteenthTime = (60 / 68) / 4;

  // Lofi Chords: 4-bar progression (16 beats total, 4 beats per chord)
  // Fmaj9 -> Em7 -> Dm9 -> Cmaj7/9
  private chords = [
    // Fmaj9: F2, A3, C4, E4, G4
    { root: 87.31, notes: [220.00, 261.63, 329.63, 392.00] },
    // Em7: E2, G3, B3, D4, G4
    { root: 82.41, notes: [196.00, 246.94, 293.66, 392.00] },
    // Dm9: D2, F3, A3, C4, E4
    { root: 73.42, notes: [174.61, 220.00, 261.63, 329.63] },
    // Cmaj9: C2, E3, G3, B3, D4
    { root: 65.41, notes: [164.81, 196.00, 246.94, 293.66] },
  ];

  // Relaxing sleepy melody note frequencies (Pentatonic chill)
  private melodyNotes = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.userVolume;
  }

  /**
   * Adjust master sound level smoothly with zero latency (supports 0.0 to 1.5)
   */
  public setVolume(level: number): void {
    this.userVolume = Math.max(0.0, Math.min(1.5, level));
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.userVolume <= 0 ? 0.00001 : this.userVolume * 0.85;
      try {
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        // Exponential time-constant ramp provides immediate 15ms natural acoustic transition without clicks
        this.masterGain.gain.setTargetAtTime(targetGain, now, 0.015);
      } catch (err) {
        // Fallback direct assignment
        this.masterGain.gain.value = targetGain;
      }
    }
  }

  public start(): void {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // 1. Dynamics Compressor to maximize loudness and punch without clipping/distortion
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.audioCtx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.audioCtx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.audioCtx.currentTime);
      this.compressor.attack.setValueAtTime(0.004, this.audioCtx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.audioCtx.currentTime);
      this.compressor.connect(this.audioCtx.destination);

      // 2. Master Gain Node (boosted up to 0.88 * userVolume)
      this.masterGain = this.audioCtx.createGain();
      const targetGain = Math.max(0.01, this.userVolume * 0.88);
      this.masterGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      // Smooth fade in
      this.masterGain.gain.exponentialRampToValueAtTime(targetGain, this.audioCtx.currentTime + 0.8);
      this.masterGain.connect(this.compressor);

      // Start realistic vinyl noise layer
      this.startVinylCrackle();

      this.isPlaying = true;
      this.currentStep = 0;
      this.nextNoteTime = this.audioCtx.currentTime + 0.1;
      this.scheduleLoop();
    } catch (e) {
      console.warn('Could not initialize Lofi audio engine:', e);
      this.isPlaying = false;
    }
  }

  public stop(): void {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioCtx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);
      setTimeout(() => {
        this.cleanup();
      }, 650);
    } else {
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.vinylSource) {
      try {
        this.vinylSource.stop();
        this.vinylSource.disconnect();
      } catch {
        // ignore
      }
      this.vinylSource = null;
    }
    this.isPlaying = false;
  }

  /**
   * Warm lofi vinyl crackle & soft tape hiss (balanced so it doesn't mask instruments)
   */
  private startVinylCrackle(): void {
    if (!this.audioCtx || !this.masterGain) return;

    const sampleRate = this.audioCtx.sampleRate;
    const bufferSize = sampleRate * 4; // 4 second seamless loop
    const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let sample = (Math.random() * 2 - 1) * 0.008;
      if (Math.random() < 0.0005) {
        sample += (Math.random() * 2 - 1) * 0.06;
      }
      data[i] = sample;
    }

    this.vinylSource = this.audioCtx.createBufferSource();
    this.vinylSource.buffer = buffer;
    this.vinylSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

    this.vinylGain = this.audioCtx.createGain();
    this.vinylGain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

    this.vinylSource.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);

    this.vinylSource.start(0);
  }

  /**
   * Sequencer loop using lookahead scheduler pattern
   */
  private scheduleLoop = (): void => {
    if (!this.isPlaying || !this.audioCtx) return;

    const lookahead = 0.15;
    while (this.nextNoteTime < this.audioCtx.currentTime + lookahead) {
      this.playStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += this.sixteenthTime;
      this.currentStep = (this.currentStep + 1) % 64; // 4 bars of 16 sixteenths = 64 steps
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 40);
  };

  /**
   * Play instruments on given sixteenth-note step with boosted, rich volume
   */
  private playStep(step: number, time: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const chordIndex = Math.floor(step / 16);
    const stepInChord = step % 16;
    const chord = this.chords[chordIndex];

    // 1. CHORD STABS (Rhodes Electric Piano) - Rich & Audible
    if (stepInChord === 0 || stepInChord === 10) {
      const velocity = stepInChord === 0 ? 0.75 : 0.55;
      const duration = stepInChord === 0 ? this.secondsPerBeat * 2.2 : this.secondsPerBeat * 1.4;
      this.playRhodesChord(chord.notes, time, velocity, duration);
    }

    // 2. SUB BASS - Deep, warm, and audible
    if (stepInChord === 0) {
      this.playSubBass(chord.root, time, this.secondsPerBeat * 2.2, 0.85);
    } else if (stepInChord === 8) {
      this.playSubBass(chord.root, time, this.secondsPerBeat * 1.8, 0.75);
    }

    // 3. SLEEPY LOFI DRUMS
    // Muffled Kick: Punchy low-end presence
    if (stepInChord === 0 || stepInChord === 8 || (stepInChord === 14 && (chordIndex === 1 || chordIndex === 3))) {
      this.playLofiKick(time, stepInChord === 0 ? 0.95 : 0.75);
    }

    // Soft Rimshot / Snare: Crisp yet mellow snap
    if (stepInChord === 4 || stepInChord === 12) {
      this.playLofiSnare(time, 0.65);
    }

    // Swung Hi-Hat: Clearly audible lofi groove
    if (step % 2 === 0) {
      const isOffbeat = step % 4 !== 0;
      const swingDelay = isOffbeat ? 0.022 : 0.0;
      const hatVolume = isOffbeat ? 0.35 : 0.48;
      this.playLofiHat(time + swingDelay, hatVolume);
    }

    // 4. SLEEPY MELODIC CHIMES / BELLS
    if (step % 4 === 2 && Math.random() < 0.45) {
      const note = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
      this.playMelodyPluck(note, time, 0.5);
    }
  }

  /**
   * Warm Rhodes EP Chords with tape flutter (boosted velocity & rich harmonics)
   */
  private playRhodesChord(notes: number[], time: number, velocity: number, duration: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    notes.forEach((freq, idx) => {
      if (!this.audioCtx || !this.masterGain) return;

      const strumTime = time + idx * 0.015;

      const osc = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Sine wave with slight triangle warmth
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, strumTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, strumTime); // detune chorus

      // Tape wow & flutter
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.35, strumTime);
      lfoGain.gain.setValueAtTime(1.2, strumTime);
      lfo.connect(osc.frequency);
      lfo.connect(osc2.frequency);
      lfo.start(strumTime);
      lfo.stop(strumTime + duration + 0.5);

      // Low-pass filter for cozy muffle
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950 + idx * 140, strumTime);
      filter.Q.setValueAtTime(1.2, strumTime);

      // Boosted amplitude envelope
      noteGain.gain.setValueAtTime(0.001, strumTime);
      noteGain.gain.linearRampToValueAtTime(velocity * 0.72, strumTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(velocity * 0.42, strumTime + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, strumTime + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(strumTime);
      osc2.start(strumTime);
      osc.stop(strumTime + duration);
      osc2.stop(strumTime + duration);
    });
  }

  /**
   * Deep sleepy sub bass note (audible low fundamental)
   */
  private playSubBass(freq: number, time: number, duration: number, volume: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume * 0.85, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(volume * 0.5, time + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Soft, muffled lofi kick drum (boosted body and punch)
   */
  private playLofiKick(time: number, volume: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, time);

    gain.gain.setValueAtTime(volume * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  /**
   * Soft lofi rimshot / muffled snare (boosted crispness)
   */
  private playLofiSnare(time: number, volume: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const sampleRate = this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, sampleRate * 0.15, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.038));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(2.0, time);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(volume * 0.72, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  /**
   * Filtered closed hi-hat (boosted groove presence)
   */
  private playLofiHat(time: number, volume: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const sampleRate = this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, sampleRate * 0.06, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.015));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4200, time);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(volume * 0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  /**
   * Floating bell / Rhodes melody note (clear & chime-like)
   */
  private playMelodyPluck(freq: number, time: number, volume: number): void {
    if (!this.audioCtx || !this.masterGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume * 0.65, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 1.7);
  }
}

export const lofiMoodEngine = new LofiMusicEngine();
