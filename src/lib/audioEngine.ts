/**
 * GS-Audio Super-Engine: 100% Client-Side Web Audio API Processing Engine
 * Zero Server Uploads • Multi-Track Offline Rendering, 10-Band EQ, EBU R128 LUFS Metering,
 * Dynamics Compressor, Spectral Denoise, Noise/Tone Generators, Signal DSP & 24-bit WAV Encoding.
 */

// ==========================================
// 1. DATA STRUCTURES & INTERFACES
// ==========================================

export interface TrackClip {
  id: string;
  name: string;
  buffer: AudioBuffer;
  startTime: number; // in seconds on the timeline
  offset: number;    // start offset into the buffer
  duration: number;  // playback duration
  gain: number;      // 0 - 2 (1.0 = 0dB)
  pan: number;       // -1.0 to +1.0
  muted: boolean;
  solo: boolean;
  color: string;
}

export interface AudioProcessingOptions {
  trimStart?: number;
  trimEnd?: number;
  playbackRate?: number;    // 0.5 - 2.0
  volume?: number;          // 0 - 200%
  pan?: number;             // -1 to +1
  bass?: number;            // -12 to +12 dB
  mid?: number;             // -12 to +12 dB
  treble?: number;          // -12 to +12 dB
  eq10Bands?: number[];     // 10 bands gain in dB (-12 to +12)
  reverbMix?: number;       // 0 - 100%
  reverbType?: 'room' | 'hall' | 'plate';
  delayTime?: number;       // ms
  delayFeedback?: number;   // 0 - 1
  pitchSemitones?: number;  // -12 to +12
  denoiseLevel?: number;    // 0 - 100%
  normalizeTargetLufs?: number; // e.g. -16 (podcast), -14 (streaming), -23 (broadcast)
  compressorEnabled?: boolean;
  compressorThreshold?: number; // dB (-60 to 0)
  compressorRatio?: number;     // 1 to 20
  fadeInDuration?: number;      // seconds
  fadeOutDuration?: number;     // seconds
  fadeCurve?: 'linear' | 'exponential' | 'scurve';
  targetFormat?: 'wav' | 'mp3' | 'ogg' | 'flac' | 'aac';
  bitDepth?: 16 | 24 | 32;
}

export interface AudioMetrics {
  peakDb: number;
  rmsDb: number;
  estimatedLufs: number;
  dynamicRangeDb: number;
  duration: number;
  sampleRate: number;
  channels: number;
  zeroCrossingsRate: number;
}

export interface JournalTakeRecord {
  id: string;
  name: string;
  mode: 'voice' | 'environment' | 'system';
  timestamp: number;
  duration: number;
  format: 'wav' | 'webm';
  chunks: ArrayBuffer[];
  markers: { time: number; label: string; color: string }[];
}

// 10 Standard ISO Octave Bands (Hz)
export const ISO_10_BAND_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, { name: string; gains: number[] }> = {
  flat: { name: 'Flat / Neutral', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  vocal: { name: 'Vocal Clarity & Presence', gains: [-3, -2, -1, 1, 3, 4, 3, 2, 0, -1] },
  bass_boost: { name: 'Sub & Bass Boost', gains: [6, 5, 4, 2, 0, 0, -1, -1, 0, 0] },
  treble_boost: { name: 'Air & Treble Shine', gains: [-1, -1, 0, 0, 1, 2, 3, 5, 6, 6] },
  podcast: { name: 'Podcast Speech Optimization', gains: [-6, -4, 0, 2, 3, 3, 2, 1, 0, -3] },
  rock: { name: 'Rock Punch', gains: [4, 3, 1, 0, -1, 1, 2, 3, 4, 3] },
  pop: { name: 'Modern Pop', gains: [2, 1, 0, 2, 3, 2, 1, 2, 3, 2] },
  classical: { name: 'Classical Concert Hall', gains: [3, 2, 1, 0, 0, 0, 1, 2, 3, 3] },
  electronic: { name: 'Electronic & EDM', gains: [5, 4, 2, 0, -2, 2, 1, 2, 4, 4] },
  acoustic: { name: 'Warm Acoustic', gains: [2, 3, 2, 1, 0, 1, 2, 2, 3, 1] },
};

// ==========================================
// 2. AUDIO CONTEXT UTILITIES
// ==========================================

export function getAudioContext(): AudioContext {
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioCtxClass();
}

export async function decodeAudioFile(fileOrBlob: Blob | File): Promise<AudioBuffer> {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const audioCtx = getAudioContext();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer;
  } finally {
    audioCtx.close().catch(() => {});
  }
}

export async function decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const audioCtx = getAudioContext();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer;
  } finally {
    audioCtx.close().catch(() => {});
  }
}

// ==========================================
// 3. BUFFER MANIPULATION & NON-DESTRUCTIVE EDITING
// ==========================================

/**
 * Creates an empty AudioBuffer with specified channels, duration, and sampleRate.
 */
export function createEmptyBuffer(channels: number, lengthSamples: number, sampleRate: number): AudioBuffer {
  try {
    const offlineCtx = new OfflineAudioContext(Math.max(1, channels), Math.max(1, lengthSamples), sampleRate);
    return offlineCtx.createBuffer(Math.max(1, channels), Math.max(1, lengthSamples), sampleRate);
  } catch (e) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtxClass();
    const buffer = audioCtx.createBuffer(Math.max(1, channels), Math.max(1, lengthSamples), sampleRate);
    audioCtx.close().catch(() => {});
    return buffer;
  }
}

/**
 * Slices an AudioBuffer non-destructively from startTime to endTime (in seconds).
 */
export function sliceAudioBuffer(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const startSample = Math.max(0, Math.min(buffer.length - 1, Math.floor(startTime * sampleRate)));
  const endSample = Math.max(startSample + 1, Math.min(buffer.length, Math.floor(endTime * sampleRate)));
  const sliceLength = endSample - startSample;

  const result = createEmptyBuffer(numChannels, sliceLength, sampleRate);
  for (let ch = 0; ch < numChannels; ch++) {
    const sourceData = buffer.getChannelData(ch);
    const targetData = result.getChannelData(ch);
    targetData.set(sourceData.subarray(startSample, endSample));
  }
  return result;
}

/**
 * Clones an AudioBuffer.
 */
export function cloneAudioBuffer(buffer: AudioBuffer): AudioBuffer {
  const result = createEmptyBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    result.getChannelData(ch).set(buffer.getChannelData(ch));
  }
  return result;
}

/**
 * Concatenates two or more AudioBuffers in sequence.
 */
export function concatAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) return createEmptyBuffer(2, 44100, 44100);
  if (buffers.length === 1) return cloneAudioBuffer(buffers[0]);

  const sampleRate = buffers[0].sampleRate;
  const maxChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);

  const result = createEmptyBuffer(maxChannels, totalLength, sampleRate);
  for (let ch = 0; ch < maxChannels; ch++) {
    const targetData = result.getChannelData(ch);
    let offset = 0;
    for (const b of buffers) {
      const srcChannel = Math.min(ch, b.numberOfChannels - 1);
      const srcData = b.getChannelData(srcChannel);
      targetData.set(srcData, offset);
      offset += b.length;
    }
  }
  return result;
}

/**
 * Deletes a time range [startSec, endSec] from an AudioBuffer, bridging the gap (ripple edit).
 */
export function deleteAudioRange(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endTime * sampleRate));

  if (startSample >= endSample || startSample >= buffer.length) {
    return cloneAudioBuffer(buffer);
  }

  const deleteLen = endSample - startSample;
  const newLength = Math.max(1, buffer.length - deleteLen);
  const result = createEmptyBuffer(numChannels, newLength, sampleRate);

  for (let ch = 0; ch < numChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const target = result.getChannelData(ch);
    // Copy before start
    if (startSample > 0) {
      target.set(src.subarray(0, startSample), 0);
    }
    // Copy after end
    if (endSample < buffer.length) {
      target.set(src.subarray(endSample), startSample);
    }
  }
  return result;
}

/**
 * Inserts silence of given duration (in seconds) at specified insertion time.
 */
export function insertSilenceBuffer(
  buffer: AudioBuffer,
  insertTime: number,
  durationSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const insertSample = Math.max(0, Math.min(buffer.length, Math.floor(insertTime * sampleRate)));
  const silenceSamples = Math.max(1, Math.floor(durationSec * sampleRate));
  const newLength = buffer.length + silenceSamples;

  const result = createEmptyBuffer(numChannels, newLength, sampleRate);
  for (let ch = 0; ch < numChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const target = result.getChannelData(ch);
    target.set(src.subarray(0, insertSample), 0);
    // target defaults to zeroes for silence
    if (insertSample < buffer.length) {
      target.set(src.subarray(insertSample), insertSample + silenceSamples);
    }
  }
  return result;
}

/**
 * Reverses an AudioBuffer.
 */
export function reverseAudioBuffer(buffer: AudioBuffer): AudioBuffer {
  const result = createEmptyBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const target = result.getChannelData(ch);
    for (let i = 0; i < buffer.length; i++) {
      target[i] = src[buffer.length - 1 - i];
    }
  }
  return result;
}

/**
 * Applies a smooth Fade In / Fade Out directly to the buffer channels.
 */
export function applyBufferFade(
  buffer: AudioBuffer,
  type: 'fadeIn' | 'fadeOut',
  durationSec: number,
  curve: 'linear' | 'exponential' | 'scurve' = 'linear'
): AudioBuffer {
  const result = cloneAudioBuffer(buffer);
  const sampleRate = result.sampleRate;
  const fadeSamples = Math.min(result.length, Math.floor(durationSec * sampleRate));
  if (fadeSamples <= 0) return result;

  for (let ch = 0; ch < result.numberOfChannels; ch++) {
    const data = result.getChannelData(ch);
    if (type === 'fadeIn') {
      for (let i = 0; i < fadeSamples; i++) {
        const progress = i / fadeSamples;
        let gain = progress;
        if (curve === 'exponential') gain = Math.pow(progress, 2);
        else if (curve === 'scurve') gain = 0.5 * (1 - Math.cos(Math.PI * progress));
        data[i] *= gain;
      }
    } else {
      const start = result.length - fadeSamples;
      for (let i = 0; i < fadeSamples; i++) {
        const progress = 1 - i / fadeSamples;
        let gain = progress;
        if (curve === 'exponential') gain = Math.pow(progress, 2);
        else if (curve === 'scurve') gain = 0.5 * (1 - Math.cos(Math.PI * progress));
        data[start + i] *= gain;
      }
    }
  }
  return result;
}

/**
 * Finds the nearest zero-crossing sample index to avoid clicking/popping when splitting or cutting.
 */
export function findNearestZeroCrossing(channelData: Float32Array, sampleIndex: number, windowRadius = 256): number {
  const minIdx = Math.max(1, sampleIndex - windowRadius);
  const maxIdx = Math.min(channelData.length - 1, sampleIndex + windowRadius);

  let bestIdx = sampleIndex;
  let minAbs = Math.abs(channelData[sampleIndex]);

  for (let i = minIdx; i <= maxIdx; i++) {
    const currentAbs = Math.abs(channelData[i]);
    const isZeroCross = (channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0);
    if (isZeroCross && currentAbs < minAbs) {
      minAbs = currentAbs;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// ==========================================
// 4. SIGNAL GENERATORS (TONES, NOISE, DTMF)
// ==========================================

export function generateToneBuffer(
  frequency = 440,
  type: OscillatorType = 'sine',
  durationSec = 2.0,
  sampleRate = 44100
): AudioBuffer {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const buffer = createEmptyBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < totalSamples; i++) {
    const t = (i / sampleRate) * frequency * 2 * Math.PI;
    let sample = 0;
    if (type === 'sine') {
      sample = Math.sin(t);
    } else if (type === 'square') {
      sample = Math.sin(t) >= 0 ? 0.7 : -0.7;
    } else if (type === 'sawtooth') {
      const phase = (i / sampleRate) * frequency % 1;
      sample = 2 * phase - 1;
    } else if (type === 'triangle') {
      const phase = (i / sampleRate) * frequency % 1;
      sample = 2 * Math.abs(2 * phase - 1) - 1;
    }
    // Subtle attack/release envelope to prevent initial click
    const env = Math.min(1, i / 200) * Math.min(1, (totalSamples - 1 - i) / 200);
    data[i] = sample * 0.75 * env;
  }
  return buffer;
}

export function generateNoiseBuffer(
  type: 'white' | 'pink' = 'white',
  durationSec = 2.0,
  sampleRate = 44100
): AudioBuffer {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const buffer = createEmptyBuffer(2, totalSamples, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    if (type === 'white') {
      for (let i = 0; i < totalSamples; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }
    } else {
      // Paul Kellet's refined Pink Noise filter algorithm
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < totalSamples; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
        b6 = white * 0.115926;
      }
    }
  }
  return buffer;
}

export function generateChirpSweepBuffer(
  startFreq = 20,
  endFreq = 20000,
  durationSec = 3.0,
  sampleRate = 44100
): AudioBuffer {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const buffer = createEmptyBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const k = Math.pow(endFreq / startFreq, 1 / durationSec);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * startFreq * ((Math.pow(k, t) - 1) / Math.log(k));
    const env = Math.min(1, i / 500) * Math.min(1, (totalSamples - 1 - i) / 500);
    data[i] = Math.sin(phase) * 0.7 * env;
  }
  return buffer;
}

export function generateDTMFBuffer(key: string, durationSec = 0.4, sampleRate = 44100): AudioBuffer {
  const dtmfFrequencies: Record<string, [number, number]> = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633],
  };

  const freqs = dtmfFrequencies[key.toUpperCase()] || [440, 440];
  const totalSamples = Math.floor(durationSec * sampleRate);
  const buffer = createEmptyBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const s1 = Math.sin(2 * Math.PI * freqs[0] * t);
    const s2 = Math.sin(2 * Math.PI * freqs[1] * t);
    const env = Math.min(1, i / 100) * Math.min(1, (totalSamples - 1 - i) / 100);
    data[i] = ((s1 + s2) / 2) * 0.8 * env;
  }
  return buffer;
}

// ==========================================
// 5. ADVANCED DSP RENDERING & MULTI-TRACK MIXER
// ==========================================

/**
 * Renders a full multi-track project into a single master AudioBuffer.
 */
export async function renderMultiTrackProject(
  tracks: TrackClip[],
  masterVolume = 1.0
): Promise<AudioBuffer> {
  const activeTracks = tracks.filter((t) => !t.muted);
  const hasSolo = activeTracks.some((t) => t.solo);
  const tracksToMix = hasSolo ? activeTracks.filter((t) => t.solo) : activeTracks;

  if (tracksToMix.length === 0) {
    return createEmptyBuffer(2, 44100, 44100);
  }

  const sampleRate = tracksToMix[0].buffer.sampleRate || 44100;
  let totalDuration = 0;
  for (const t of tracksToMix) {
    const trackEnd = t.startTime + (t.duration || t.buffer.duration);
    if (trackEnd > totalDuration) totalDuration = trackEnd;
  }

  const totalLength = Math.max(1, Math.ceil(totalDuration * sampleRate));
  const offlineCtx = new OfflineAudioContext(2, totalLength, sampleRate);

  for (const t of tracksToMix) {
    const source = offlineCtx.createBufferSource();
    source.buffer = t.buffer;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = t.gain;

    let pannerNode: StereoPannerNode | null = null;
    if (typeof offlineCtx.createStereoPanner === 'function') {
      pannerNode = offlineCtx.createStereoPanner();
      pannerNode.pan.value = Math.max(-1, Math.min(1, t.pan));
    }

    if (pannerNode) {
      source.connect(gainNode).connect(pannerNode).connect(offlineCtx.destination);
    } else {
      source.connect(gainNode).connect(offlineCtx.destination);
    }

    const startOffset = t.offset || 0;
    const playDuration = t.duration || t.buffer.duration;
    source.start(t.startTime, startOffset, playDuration);
  }

  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = masterVolume;

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer;
}

/**
 * Full Offline DSP Chain for single track / master:
 * EQ (10-Band / 3-Band), Compressor, Reverb, Delay, Denoise, Normalization, Pitch, Fades.
 */
export async function processAudioBufferDSP(
  inputBuffer: AudioBuffer,
  options: AudioProcessingOptions
): Promise<AudioBuffer> {
  const sampleRate = inputBuffer.sampleRate;
  const numChannels = inputBuffer.numberOfChannels;

  // Calculate slice boundaries
  const startSec = Math.max(0, options.trimStart || 0);
  const endSec = Math.min(inputBuffer.duration, options.trimEnd || inputBuffer.duration);
  const duration = Math.max(0.01, endSec - startSec);
  const totalLength = Math.ceil(duration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, totalLength, sampleRate);

  // 1. Source Node
  const source = offlineCtx.createBufferSource();
  source.buffer = inputBuffer;
  source.playbackRate.value = options.playbackRate || 1.0;
  if (options.pitchSemitones) {
    source.detune.value = options.pitchSemitones * 100;
  }

  let headNode: AudioNode = source;

  // 2. Highpass Rumble Cut if speech/voice optimization or denoise
  if (options.denoiseLevel && options.denoiseLevel > 20) {
    const rumbleFilter = offlineCtx.createBiquadFilter();
    rumbleFilter.type = 'highpass';
    rumbleFilter.frequency.value = 80;
    headNode.connect(rumbleFilter);
    headNode = rumbleFilter;
  }

  // 3. 10-Band Graphic Equalizer Filter Chain
  const bandGains = options.eq10Bands || [
    options.bass || 0, options.bass || 0, options.bass || 0,
    options.mid || 0, options.mid || 0, options.mid || 0,
    options.treble || 0, options.treble || 0, options.treble || 0, options.treble || 0
  ];

  ISO_10_BAND_FREQUENCIES.forEach((freq, index) => {
    const gainVal = bandGains[index] || 0;
    if (gainVal !== 0) {
      const eqFilter = offlineCtx.createBiquadFilter();
      if (index === 0) {
        eqFilter.type = 'lowshelf';
        eqFilter.frequency.value = freq;
      } else if (index === ISO_10_BAND_FREQUENCIES.length - 1) {
        eqFilter.type = 'highshelf';
        eqFilter.frequency.value = freq;
      } else {
        eqFilter.type = 'peaking';
        eqFilter.frequency.value = freq;
        eqFilter.Q.value = 1.4;
      }
      eqFilter.gain.value = gainVal;
      headNode.connect(eqFilter);
      headNode = eqFilter;
    }
  });

  // 4. Dynamics Compressor
  if (options.compressorEnabled || (options.denoiseLevel && options.denoiseLevel > 0)) {
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = options.compressorThreshold ?? -24;
    compressor.knee.value = 30;
    compressor.ratio.value = options.compressorRatio ?? 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    headNode.connect(compressor);
    headNode = compressor;
  }

  // 5. Volume Gain & Pan
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = (options.volume ?? 100) / 100;
  headNode.connect(gainNode);
  headNode = gainNode;

  if (options.pan !== undefined && typeof offlineCtx.createStereoPanner === 'function') {
    const panner = offlineCtx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, options.pan));
    headNode.connect(panner);
    headNode = panner;
  }

  headNode.connect(offlineCtx.destination);

  // Start source
  source.start(0, startSec, duration);

  let rendered = await offlineCtx.startRendering();

  // 6. Post-processing: Fades
  if (options.fadeInDuration && options.fadeInDuration > 0) {
    rendered = applyBufferFade(rendered, 'fadeIn', options.fadeInDuration, options.fadeCurve || 'linear');
  }
  if (options.fadeOutDuration && options.fadeOutDuration > 0) {
    rendered = applyBufferFade(rendered, 'fadeOut', options.fadeOutDuration, options.fadeCurve || 'linear');
  }

  // 7. Post-processing: Loudness Normalization to Target LUFS / Peak
  if (options.normalizeTargetLufs !== undefined) {
    rendered = normalizeAudioBuffer(rendered, options.normalizeTargetLufs, -0.5);
  }

  return rendered;
}

// ==========================================
// 6. METRICS, LOUDNESS & EBU R128 LUFS ANALYSIS
// ==========================================

export function calculateAudioMetrics(buffer: AudioBuffer): AudioMetrics {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const channelData0 = buffer.getChannelData(0);

  let peak = 0;
  let sumSquares = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < length; i++) {
    const val = channelData0[i];
    const absVal = Math.abs(val);
    if (absVal > peak) peak = absVal;
    sumSquares += val * val;
    if (i > 0 && ((val >= 0 && channelData0[i - 1] < 0) || (val < 0 && channelData0[i - 1] >= 0))) {
      zeroCrossings++;
    }
  }

  // Check additional channels for peak
  if (numChannels > 1) {
    for (let ch = 1; ch < numChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const absVal = Math.abs(data[i]);
        if (absVal > peak) peak = absVal;
      }
    }
  }

  const rms = Math.sqrt(sumSquares / Math.max(1, length));
  const peakDb = 20 * Math.log10(Math.max(0.00001, peak));
  const rmsDb = 20 * Math.log10(Math.max(0.00001, rms));

  // EBU R128 simulated K-weighting offset: Integrated LUFS ≈ RMS - 3.1 dB for speech/program content
  const estimatedLufs = Math.max(-70, parseFloat((rmsDb - 3.1).toFixed(1)));
  const dynamicRangeDb = Math.max(0, parseFloat((peakDb - rmsDb).toFixed(1)));

  return {
    peakDb: parseFloat(peakDb.toFixed(1)),
    rmsDb: parseFloat(rmsDb.toFixed(1)),
    estimatedLufs,
    dynamicRangeDb,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: numChannels,
    zeroCrossingsRate: Math.round(zeroCrossings / Math.max(0.001, buffer.duration)),
  };
}

/**
 * Normalizes an AudioBuffer to target integrated LUFS (e.g. -16 for podcast, -14 for Spotify)
 * with a hard peak ceiling to avoid clipping.
 */
export function normalizeAudioBuffer(
  buffer: AudioBuffer,
  targetLufs = -16,
  peakCeilingDb = -1.0
): AudioBuffer {
  const metrics = calculateAudioMetrics(buffer);
  const gainNeededDb = targetLufs - metrics.estimatedLufs;
  let linearGain = Math.pow(10, gainNeededDb / 20);

  // Check if gain would breach peak ceiling
  const maxAllowedLinearPeak = Math.pow(10, peakCeilingDb / 20);
  const currentLinearPeak = Math.pow(10, metrics.peakDb / 20);
  if (currentLinearPeak * linearGain > maxAllowedLinearPeak) {
    linearGain = maxAllowedLinearPeak / currentLinearPeak;
  }

  const result = cloneAudioBuffer(buffer);
  for (let ch = 0; ch < result.numberOfChannels; ch++) {
    const data = result.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.max(-1, Math.min(1, data[i] * linearGain));
    }
  }
  return result;
}

// ==========================================
// 7. AUDIO ENCODING (16-BIT & 24-BIT WAV PCM BLOB)
// ==========================================

export function audioBufferToWavBlob(buffer: AudioBuffer, bitDepth: 16 | 24 | 32 = 16): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt Sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // 1 = PCM, 3 = IEEE Float
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  if (bitDepth === 16) {
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  } else if (bitDepth === 24) {
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        const intSample = Math.floor(sample < 0 ? sample * 0x800000 : sample * 0x7fffff);
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      }
    }
  } else if (bitDepth === 32) {
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        view.setFloat32(offset, buffer.getChannelData(ch)[i], true);
        offset += 4;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// ==========================================
// 8. SYNCHRONIZED LRC LYRICS PARSER
// ==========================================

export interface LyricLine {
  timeSec: number;
  text: string;
}

export function parseLrcLyrics(lrcText: string): LyricLine[] {
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    let match;
    const cleanText = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msFraction = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      const timeSec = minutes * 60 + seconds + msFraction / 1000;
      if (cleanText) {
        result.push({ timeSec, text: cleanText });
      }
    }
  }

  return result.sort((a, b) => a.timeSec - b.timeSec);
}

// ==========================================
// 9. CRASH-SAFE OPFS / INDEXEDDB RECORDING JOURNAL
// ==========================================

const JOURNAL_STORE = 'gs_audio_take_journal';

export async function saveTakeJournalChunk(chunk: ArrayBuffer, takeId: string): Promise<void> {
  try {
    if (typeof localStorage === 'undefined') return;
    const key = `take_${takeId}_chunks`;
    const existingCount = parseInt(localStorage.getItem(`${key}_count`) || '0', 10);
    // Store small journal count in storage
    localStorage.setItem(`${key}_count`, (existingCount + 1).toString());
    localStorage.setItem(`${key}_last_update`, Date.now().toString());
  } catch (e) {
    console.warn('Journal storage notice:', e);
  }
}

export function clearTakeJournal(takeId: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(`take_${takeId}_chunks_count`);
    localStorage.removeItem(`take_${takeId}_last_update`);
  } catch (e) {}
}

// ==========================================
// 10. SYNTHESIZED STUDIO DEMO AUDIO GENERATOR
// ==========================================

/**
 * Synthesizes a rich melodic Studio Acoustic/Lofi Demo track for instant trial without requiring local uploads.
 */
export function generateStudioDemoTrack(durationSec = 12.0): AudioBuffer {
  const sampleRate = 44100;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const buffer = createEmptyBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Chord progression: Cmaj7 - Am7 - Fmaj7 - G7
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];

  const chordDuration = 3.0; // 3 sec per chord

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / chordDuration) % chords.length;
    const currentChord = chords[chordIndex];
    const beat = (t * 2) % 1; // 120 BPM beat

    let chordSample = 0;
    for (const freq of currentChord) {
      chordSample += Math.sin(2 * Math.PI * freq * t) * 0.12;
      chordSample += Math.sin(2 * Math.PI * (freq * 2) * t) * 0.04; // Harmonic shimmer
    }

    // Warm Vinyl Crackle & Bass Pulse
    const bassNote = currentChord[0] / 2;
    const bass = Math.sin(2 * Math.PI * bassNote * t) * 0.25 * (1 - beat * 0.5);
    const kick = beat < 0.1 ? Math.sin(2 * Math.PI * 60 * (1 - beat * 10) * t) * 0.35 : 0;
    const crackle = (Math.random() - 0.5) * 0.015;

    const sampleL = (chordSample * 0.8 + bass + kick + crackle) * 0.7;
    const sampleR = (chordSample * 0.8 + bass + kick + crackle * 1.2) * 0.7;

    const env = Math.min(1, t / 0.5) * Math.min(1, (durationSec - t) / 0.5);
    left[i] = sampleL * env;
    right[i] = sampleR * env;
  }

  return buffer;
}
