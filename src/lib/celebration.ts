import confetti from 'canvas-confetti';

/**
 * Checks whether a given choice ID represents the best / virtuous choice (Choice 1)
 */
export function isBestChoice(choiceId?: string | null): boolean {
  if (!choiceId) return false;
  const normalized = choiceId.toLowerCase().trim();
  return normalized === 'choice1' || normalized === '1';
}

/**
 * Plays a rich, celebratory Web Audio victory fanfare with brass harmonics and shimmer chimes.
 */
export function playVictorySound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Victory fanfare notes: C5 -> E5 -> G5 -> C6 (with sustain and harmonics)
    const fanfareNotes = [
      { freq: 523.25, time: 0.0, dur: 0.16, gain: 0.22 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.16, gain: 0.24 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.20, gain: 0.26 }, // G5
      { freq: 1046.5, time: 0.46, dur: 0.95, gain: 0.32 }, // C6
      { freq: 1318.5, time: 0.50, dur: 0.85, gain: 0.20 }, // E6
      { freq: 1567.98, time: 0.54, dur: 0.80, gain: 0.18 }, // G6
    ];

    fanfareNotes.forEach(({ freq, time, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = freq > 1100 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(0.0001, now + time);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + time + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });

    // Shimmering bell/chime sparkles
    const chimes = [
      { freq: 1567.98, delay: 0.48 },
      { freq: 1760.0, delay: 0.58 },
      { freq: 2093.0, delay: 0.68 },
      { freq: 2637.0, delay: 0.78 },
      { freq: 3135.96, delay: 0.88 },
    ];

    chimes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.32);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  } catch {
    // AudioContext blocked or unsupported in environment
  }
}

/**
 * Fires a dual-side and center celebratory confetti burst
 */
export function fireVictoryConfetti(): void {
  try {
    // Left side burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#ffe81f', '#d4af37', '#ffffff', '#38bdf8', '#4ade80', '#f43f5e'],
      zIndex: 99999,
    });

    // Right side burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#ffe81f', '#d4af37', '#ffffff', '#38bdf8', '#4ade80', '#f43f5e'],
      zIndex: 99999,
    });

    // Center fountain of gold and bright stars
    setTimeout(() => {
      confetti({
        particleCount: 85,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ffe81f', '#d4af37', '#f59e0b', '#fbbf24', '#ffffff'],
        scalar: 1.15,
        zIndex: 99999,
      });
    }, 180);
  } catch {
    // Ignore if canvas-confetti cannot run
  }
}
