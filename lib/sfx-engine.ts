/**
 * Motioneer Procedural Web Audio + Remotion SFX Engine
 * Zero-latency, zero-dependency broadcast sound effect synthesizer
 * Generates crisp, audible motion audio in the browser for both live preview
 * and frame-baked video rendering.
 */

import { whoosh, whip, mouseClick, shutterModern, pageTurn, ding } from '@remotion/sfx';

export const SFX_URLS: Record<string, string> = {
  whoosh,
  whip,
  mouseClick,
  click: mouseClick,
  shutterModern,
  shutter: shutterModern,
  pageTurn,
  pageturn: pageTurn,
  pop: ding,
  ding,
};

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in browser environments.');
  }

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

/**
 * Creates a white noise audio buffer for procedural synthesis
 */
function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Schedules a procedural sound effect onto any Web Audio node/destination.
 * Used for both live playback to speakers and stream recording to MediaStreamDestinationNode.
 */
export function scheduleSfxOnAudioContext(
  ctx: AudioContext,
  destination: AudioNode,
  sfxType: string,
  startTimeSec: number,
  volume: number = 0.8
) {
  const type = (sfxType || '').toLowerCase().trim();
  if (!type || type === 'none') return;

  const t0 = Math.max(0, startTimeSec);
  const safeVol = Math.max(0, Math.min(1, volume));

  try {
    if (type.includes('whoosh')) {
      // -----------------------------------------------------------------------
      // WHOOSH: Sweeping bandpass filtered noise burst + sub-bass velocity drop
      // -----------------------------------------------------------------------
      const dur = 0.38;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, t0);
      filter.frequency.setValueAtTime(180, t0);
      filter.frequency.exponentialRampToValueAtTime(1400, t0 + 0.16);
      filter.frequency.exponentialRampToValueAtTime(120, t0 + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(safeVol * 0.9, t0 + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(t0);
      noise.stop(t0 + dur);

      // Sub-bass thump
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, t0);
      subOsc.frequency.exponentialRampToValueAtTime(35, t0 + 0.22);

      subGain.gain.setValueAtTime(safeVol * 0.45, t0);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);

      subOsc.connect(subGain);
      subGain.connect(destination);
      subOsc.start(t0);
      subOsc.stop(t0 + 0.22);
    } else if (type.includes('whip')) {
      // -----------------------------------------------------------------------
      // WHIP: Fast high-Q resonant filter sweep with snappy transient envelope
      // -----------------------------------------------------------------------
      const dur = 0.16;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.6, t0);
      filter.frequency.setValueAtTime(320, t0);
      filter.frequency.exponentialRampToValueAtTime(3400, t0 + 0.1);
      filter.frequency.exponentialRampToValueAtTime(500, t0 + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(safeVol * 1.0, t0 + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(t0);
      noise.stop(t0 + dur);
    } else if (type.includes('click') || type.includes('mouse') || type.includes('pop')) {
      // -----------------------------------------------------------------------
      // MOUSE CLICK / POP: Crisp dual-impulse transient pitch drop
      // -----------------------------------------------------------------------
      const dur = 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type.includes('pop') ? 950 : 1850, t0);
      osc.frequency.exponentialRampToValueAtTime(280, t0 + dur);

      gain.gain.setValueAtTime(safeVol * 0.9, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t0);
      osc.stop(t0 + dur);

      // Micro transient burst
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.015);
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.setValueAtTime(2400, t0);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(safeVol * 0.4, t0);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.015);

      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(destination);
      noise.start(t0);
      noise.stop(t0 + 0.015);
    } else if (type.includes('shutter')) {
      // -----------------------------------------------------------------------
      // SHUTTER MODERN: Mechanical double-click camera shutter transient
      // -----------------------------------------------------------------------
      const click = (offset: number) => {
        const dur = 0.035;
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx, dur);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, t0 + offset);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(safeVol * 0.85, t0 + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noise.start(t0 + offset);
        noise.stop(t0 + offset + dur);
      };

      click(0);
      click(0.042);
    } else if (type.includes('page') || type.includes('turn')) {
      // -----------------------------------------------------------------------
      // PAGE TURN: Soft high-passed brushed noise envelope
      // -----------------------------------------------------------------------
      const dur = 0.28;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.2, t0);
      filter.frequency.setValueAtTime(900, t0);
      filter.frequency.exponentialRampToValueAtTime(3200, t0 + 0.12);
      filter.frequency.exponentialRampToValueAtTime(1100, t0 + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(safeVol * 0.7, t0 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(t0);
      noise.stop(t0 + dur);
    } else {
      // -----------------------------------------------------------------------
      // DING / DEFAULT: Harmonic chime
      // -----------------------------------------------------------------------
      const dur = 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t0);

      gain.gain.setValueAtTime(safeVol * 0.7, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t0);
      osc.stop(t0 + dur);
    }
  } catch (err) {
    console.warn('[SFX Engine] Schedule note:', err);
  }
}

/**
 * Instantly triggers an audible sound effect preview in the browser.
 * Safe against autoplay restrictions and un-mutes automatically.
 */
export function playSfxPreview(sfxType: string, volume: number = 0.85): void {
  if (typeof window === 'undefined') return;
  const type = (sfxType || '').toLowerCase().trim();
  if (!type || type === 'none') return;

  try {
    const ctx = getAudioContext();
    scheduleSfxOnAudioContext(ctx, ctx.destination, type, ctx.currentTime, volume);
  } catch (err) {
    console.warn('[SFX Engine] Web Audio preview fallback note:', err);
    // Remote audio file fallback
    const remoteUrl = SFX_URLS[type];
    if (remoteUrl) {
      try {
        const audio = new Audio(remoteUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Returns the remote URL for @remotion/sfx when available
 */
export function getSfxUrl(sfxType?: string): string | null {
  if (!sfxType || sfxType === 'none') return null;
  const norm = sfxType.toLowerCase().trim();
  return SFX_URLS[norm] || null;
}
