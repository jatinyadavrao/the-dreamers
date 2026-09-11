"use client";

// Synthesized rocket-launch whoosh + rumble via the Web Audio API — no asset needed.
export function playLaunchSound(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    const dur = 2.6;

    // Noise buffer (the "whoosh").
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(6000, now + 1.2);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.5, now + 0.6);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);

    // Low sine "rumble" that rises in pitch.
    const rumble = ctx.createOscillator();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(50, now);
    rumble.frequency.exponentialRampToValueAtTime(180, now + 1.4);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.4, now + 0.5);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    rumble.connect(rumbleGain).connect(ctx.destination);

    // Sparkle chime at ignition.
    const chime = ctx.createOscillator();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(880, now + 0.1);
    chime.frequency.exponentialRampToValueAtTime(1760, now + 0.5);
    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.0001, now + 0.1);
    chimeGain.gain.exponentialRampToValueAtTime(0.25, now + 0.2);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    chime.connect(chimeGain).connect(ctx.destination);

    noise.start(now);
    rumble.start(now);
    chime.start(now + 0.1);
    noise.stop(now + dur);
    rumble.stop(now + dur);
    chime.stop(now + 0.9);

    setTimeout(() => ctx.close().catch(() => {}), (dur + 0.3) * 1000);
  } catch {
    /* audio not available */
  }
}
