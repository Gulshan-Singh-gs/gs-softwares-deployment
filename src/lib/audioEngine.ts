/**
 * GS-Audio Engine: 100% Client-Side Web Audio API Processing Engine
 * Zero Server Uploads • Web Audio Nodes, DSP Filters, EQ, Dynamics & WAV Encoding
 */

export interface AudioProcessingOptions {
  trimStart?: number;
  trimEnd?: number;
  playbackRate?: number; // 0.5 - 2.0
  volume?: number;       // 0 - 200%
  pan?: number;          // -1 to 1
  bass?: number;         // -12 to +12 dB
  mid?: number;          // -12 to +12 dB
  treble?: number;       // -12 to +12 dB
  reverbMix?: number;    // 0 - 100%
  delayTime?: number;    // ms
  pitchSemitones?: number; // -12 to +12
  denoiseLevel?: number;   // 0 - 100%
  targetFormat?: 'mp3' | 'wav' | 'flac' | 'ogg' | 'aac';
}

/**
 * 1. PROCESS & EXPORT AUDIO BUFFER
 */
export async function processAndExportAudio(
  arrayBuffer: ArrayBuffer,
  options: AudioProcessingOptions
): Promise<Blob> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

  const startSample = Math.floor((options.trimStart || 0) * audioBuffer.sampleRate);
  const endSample = Math.min(
    audioBuffer.length,
    Math.floor((options.trimEnd || audioBuffer.duration) * audioBuffer.sampleRate)
  );
  const trimmedLength = Math.max(1, endSample - startSample);

  // Render processed audio via OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    trimmedLength,
    audioBuffer.sampleRate
  );

  // Buffer Source Node
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = options.playbackRate || 1.0;

  // Pitch Semitones Detune
  if (options.pitchSemitones) {
    source.detune.value = options.pitchSemitones * 100;
  }

  // 3-Band Parametric Equalizer Nodes
  const bassFilter = offlineCtx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 250;
  bassFilter.gain.value = options.bass || 0;

  const midFilter = offlineCtx.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1500;
  midFilter.Q.value = 1.0;
  midFilter.gain.value = options.mid || 0;

  const trebleFilter = offlineCtx.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 4000;
  trebleFilter.gain.value = options.treble || 0;

  // Dynamics Compressor Node
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  // Volume Gain Node
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = (options.volume ?? 100) / 100;

  // Stereo Panner Node
  let pannerNode: StereoPannerNode | null = null;
  if (typeof offlineCtx.createStereoPanner === 'function') {
    pannerNode = offlineCtx.createStereoPanner();
    pannerNode.pan.value = options.pan || 0;
  }

  // Audio Node Routing Pipeline
  let currentHead: AudioNode = source;
  currentHead = currentHead.connect(bassFilter);
  currentHead = currentHead.connect(midFilter);
  currentHead = currentHead.connect(trebleFilter);
  currentHead = currentHead.connect(compressor);
  currentHead = currentHead.connect(gainNode);

  if (pannerNode) {
    currentHead = currentHead.connect(pannerNode);
    pannerNode.connect(offlineCtx.destination);
  } else {
    currentHead.connect(offlineCtx.destination);
  }

  // Start rendering slice
  source.start(0, (options.trimStart || 0), (options.trimEnd || audioBuffer.duration) - (options.trimStart || 0));

  const renderedBuffer = await offlineCtx.startRendering();
  audioCtx.close();

  // Encode to WAV PCM Blob
  return bufferToWavBlob(renderedBuffer);
}

/**
 * 2. ENCODE AUDIOBUFFER TO WAV PCM BLOB
 */
function bufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  /* fmt sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  /* data sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleave channels
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * 3. AUDIO ANALYSIS METRICS (LUFS, Peak dB, RMS)
 */
export async function analyzeAudioBuffer(arrayBuffer: ArrayBuffer): Promise<{
  peakDb: number;
  rmsDb: number;
  estimatedLufs: number;
}> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  const channelData = audioBuffer.getChannelData(0);

  let maxAmp = 0;
  let sumSquare = 0;

  for (let i = 0; i < channelData.length; i++) {
    const abs = Math.abs(channelData[i]);
    if (abs > maxAmp) maxAmp = abs;
    sumSquare += abs * abs;
  }

  const rms = Math.sqrt(sumSquare / channelData.length);
  const peakDb = 20 * Math.log10(maxAmp || 0.0001);
  const rmsDb = 20 * Math.log10(rms || 0.0001);
  const estimatedLufs = Math.max(-60, rmsDb - 3.1);

  audioCtx.close();

  return {
    peakDb: parseFloat(peakDb.toFixed(1)),
    rmsDb: parseFloat(rmsDb.toFixed(1)),
    estimatedLufs: parseFloat(estimatedLufs.toFixed(1)),
  };
}
