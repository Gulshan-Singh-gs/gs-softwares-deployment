import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Layers,
  Sliders,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Download,
  Activity,
  Zap,
  Wand2,
  SplitSquareHorizontal,
  RefreshCw,
  FolderOpen,
  Music,
  CheckCircle2,
  Radio,
  FileAudio,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Repeat,
  Share2,
  Tag,
  Gauge,
  SlidersHorizontal,
  Flame,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TrackClip,
  AudioProcessingOptions,
  AudioMetrics,
  calculateAudioMetrics,
  normalizeAudioBuffer,
  sliceAudioBuffer,
  deleteAudioRange,
  insertSilenceBuffer,
  reverseAudioBuffer,
  applyBufferFade,
  cloneAudioBuffer,
  concatAudioBuffers,
  renderMultiTrackProject,
  processAudioBufferDSP,
  audioBufferToWavBlob,
  decodeAudioFile,
  generateToneBuffer,
  generateNoiseBuffer,
  generateChirpSweepBuffer,
  generateDTMFBuffer,
  generateStudioDemoTrack,
  findNearestZeroCrossing
} from '../../lib/audioEngine';

interface AudioEditorPillarProps {
  initialTake?: { name: string; blob: Blob } | null;
  onSendToPlayer: (track: { name: string; blob: Blob; duration: number }) => void;
}

export const AudioEditorPillar: React.FC<AudioEditorPillarProps> = ({
  initialTake,
  onSendToPlayer,
}) => {
  // Mode & Workspace State
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('advanced');
  const [activeTab, setActiveTab] = useState<'timeline' | 'effects' | 'generate' | 'analyze' | 'export'>('timeline');

  // Multi-Track Session State
  const [tracks, setTracks] = useState<TrackClip[]>([]);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [masterVolume, setMasterVolume] = useState<number>(1.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.5x to 4.0x
  const [snapToZeroCross, setSnapToZeroCross] = useState<boolean>(true);

  // Selection & Transport
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Undo / Redo History Stack (Stores Track Snapshots)
  const [history, setHistory] = useState<TrackClip[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Clipboard for Audio Clips
  const [clipboardBuffer, setClipboardBuffer] = useState<AudioBuffer | null>(null);

  // Analysis & Metrics State
  const [analysisMetrics, setAnalysisMetrics] = useState<AudioMetrics | null>(null);

  // Effects Parameters
  const [normalizePreset, setNormalizePreset] = useState<number>(-16); // -16 LUFS (podcast), -14 LUFS (streaming)
  const [fadeType, setFadeType] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const [fadeDuration, setFadeDuration] = useState<number>(1.5);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(40);
  const [reverbMix, setReverbMix] = useState<number>(25);
  const [delayTimeMs, setDelayTimeMs] = useState<number>(180);
  const [eqBass, setEqBass] = useState<number>(0);
  const [eqMid, setEqMid] = useState<number>(0);
  const [eqTreble, setEqTreble] = useState<number>(0);
  const [compressorThreshold, setCompressorThreshold] = useState<number>(-24);
  const [compressorRatio, setCompressorRatio] = useState<number>(4);

  // Generator State
  const [genType, setGenType] = useState<'tone' | 'noise' | 'sweep' | 'dtmf'>('tone');
  const [genFreq, setGenFreq] = useState<number>(440);
  const [genWaveform, setGenWaveform] = useState<OscillatorType>('sine');
  const [genNoiseType, setGenNoiseType] = useState<'white' | 'pink'>('pink');
  const [genDuration, setGenDuration] = useState<number>(3.0);
  const [genDTMFKey, setGenDTMFKey] = useState<string>('5');

  // Export State
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3' | 'flac' | 'ogg'>('wav');
  const [exportBitDepth, setExportBitDepth] = useState<16 | 24 | 32>(16);
  const [projectTitle, setProjectTitle] = useState<string>('Master-Production-Take');

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackSourceRef.current) {
        try {
          playbackSourceRef.current.stop();
          playbackSourceRef.current.disconnect();
        } catch (e) {}
      }
      if (playbackContextRef.current) {
        playbackContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize with Studio Sample or initial take
  useEffect(() => {
    if (initialTake) {
      loadInitialTake(initialTake);
    } else if (tracks.length === 0) {
      loadStudioTemplate();
    }
  }, [initialTake]);

  const loadInitialTake = async (take: { name: string; blob: Blob }) => {
    try {
      const buffer = await decodeAudioFile(take.blob);
      const newTrack: TrackClip = {
        id: `track_${Date.now()}`,
        name: take.name.replace(/\.[^/.]+$/, ''),
        buffer,
        startTime: 0,
        offset: 0,
        duration: buffer.duration,
        gain: 1.0,
        pan: 0,
        muted: false,
        solo: false,
        color: '#06b6d4',
      };
      setTracks([newTrack]);
      pushHistory([newTrack]);
      setSelectionStart(0);
      setSelectionEnd(buffer.duration);
      updateAnalysisMetrics(buffer);
    } catch (e) {
      console.error('Error loading take into editor:', e);
    }
  };

  const loadStudioTemplate = () => {
    try {
      const demoBuffer = generateStudioDemoTrack(4.0);
      const demoTrack: TrackClip = {
        id: 'track_master_demo',
        name: 'Vocal & Acoustic Master',
        buffer: demoBuffer,
        startTime: 0,
        offset: 0,
        duration: demoBuffer.duration,
        gain: 1.0,
        pan: 0,
        muted: false,
        solo: false,
        color: '#ec4899',
      };
      setTracks([demoTrack]);
      pushHistory([demoTrack]);
      setSelectionStart(0);
      setSelectionEnd(demoBuffer.duration);
      updateAnalysisMetrics(demoBuffer);
    } catch (e) {
      console.warn('Demo template load error:', e);
    }
  };

  const updateAnalysisMetrics = (buffer: AudioBuffer) => {
    try {
      const metrics = calculateAudioMetrics(buffer);
      setAnalysisMetrics(metrics);
    } catch (e) {}
  };

  // Push State to Deep Undo / Redo History
  const pushHistory = (newTracksState: TrackClip[]) => {
    const cloned = newTracksState.map((t) => ({
      ...t,
      buffer: cloneAudioBuffer(t.buffer),
    }));
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cloned);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setTracks(
        targetState.map((t) => ({
          ...t,
          buffer: cloneAudioBuffer(t.buffer),
        }))
      );
      stopPlayback();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setTracks(
        targetState.map((t) => ({
          ...t,
          buffer: cloneAudioBuffer(t.buffer),
        }))
      );
      stopPlayback();
    }
  };

  // Active Selected Track
  const activeTrack = tracks[activeTrackIndex] || tracks[0] || null;

  // Add Audio File as New Track
  const handleAddTrackFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const buffer = await decodeAudioFile(file);
      const colors = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
      const newTrack: TrackClip = {
        id: `track_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        buffer,
        startTime: 0,
        offset: 0,
        duration: buffer.duration,
        gain: 1.0,
        pan: 0,
        muted: false,
        solo: false,
        color: colors[tracks.length % colors.length],
      };
      const updated = [...tracks, newTrack];
      setTracks(updated);
      pushHistory(updated);
      setActiveTrackIndex(updated.length - 1);
      setSelectionEnd(Math.max(selectionEnd, buffer.duration));
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (e) {
      console.error('File decode error:', e);
    }
  };

  // Playback Control via Web Audio Buffer Source
  const togglePlayback = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = async () => {
    if (tracks.length === 0) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      playbackContextRef.current = audioCtx;

      // Render mix of active tracks
      const mixBuffer = await renderMultiTrackProject(tracks, masterVolume);

      const source = audioCtx.createBufferSource();
      source.buffer = mixBuffer;
      source.connect(audioCtx.destination);

      const playStart = isLooping ? selectionStart : currentTime;
      const playDuration = isLooping ? Math.max(0.1, selectionEnd - selectionStart) : mixBuffer.duration - playStart;

      source.loop = isLooping;
      if (isLooping) {
        source.loopStart = selectionStart;
        source.loopEnd = selectionEnd;
      }

      playbackStartTimeRef.current = audioCtx.currentTime;
      playbackOffsetRef.current = playStart;

      source.onended = () => {
        if (!isLooping) setIsPlaying(false);
      };

      source.start(0, playStart, isLooping ? undefined : playDuration);
      playbackSourceRef.current = source;
      setIsPlaying(true);

      // Playhead tracker loop
      const updatePlayhead = () => {
        if (playbackContextRef.current && isPlaying) {
          const elapsed = playbackContextRef.current.currentTime - playbackStartTimeRef.current;
          const pos = (playbackOffsetRef.current + elapsed) % mixBuffer.duration;
          setCurrentTime(pos);
          animationFrameRef.current = requestAnimationFrame(updatePlayhead);
        }
      };
      updatePlayhead();
    } catch (e) {
      console.error('Playback start error:', e);
    }
  };

  const stopPlayback = () => {
    if (playbackSourceRef.current) {
      try {
        playbackSourceRef.current.stop();
        playbackSourceRef.current.disconnect();
      } catch (e) {}
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  // Keyboard Shortcuts (Space, Ctrl+Z, Ctrl+Y, S, I, O, Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleTrimToSelection();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSplitAtCursor();
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setSelectionStart(currentTime);
      } else if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setSelectionEnd(currentTime);
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLooping(!isLooping);
      } else if (e.key === '[') {
        setZoomLevel((z) => Math.max(0.5, z - 0.25));
      } else if (e.key === ']') {
        setZoomLevel((z) => Math.min(4.0, z + 0.25));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, selectionStart, selectionEnd, historyIndex, isLooping]);

  // ==========================================
  // NON-DESTRUCTIVE EDIT ACTIONS
  // ==========================================

  // 1. Trim to Selection (Ctrl+T)
  const handleTrimToSelection = () => {
    if (!activeTrack) return;
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    if (start >= end) return;

    const trimmed = sliceAudioBuffer(activeTrack.buffer, start, end);
    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: trimmed, duration: trimmed.duration } : t
    );
    setTracks(updated);
    pushHistory(updated);
    setSelectionStart(0);
    setSelectionEnd(trimmed.duration);
    setCurrentTime(0);
    updateAnalysisMetrics(trimmed);
  };

  // 2. Cut Selection (Ctrl+X)
  const handleCutSelection = () => {
    if (!activeTrack) return;
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    if (start >= end) return;

    const cutClip = sliceAudioBuffer(activeTrack.buffer, start, end);
    setClipboardBuffer(cutClip);

    const afterDelete = deleteAudioRange(activeTrack.buffer, start, end);
    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: afterDelete, duration: afterDelete.duration } : t
    );
    setTracks(updated);
    pushHistory(updated);
    setSelectionStart(start);
    setSelectionEnd(start);
    updateAnalysisMetrics(afterDelete);
  };

  // 3. Copy Selection (Ctrl+C)
  const handleCopySelection = () => {
    if (!activeTrack) return;
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    if (start >= end) return;

    const copied = sliceAudioBuffer(activeTrack.buffer, start, end);
    setClipboardBuffer(copied);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  // 4. Paste Clip (Ctrl+V)
  const handlePasteClipboard = () => {
    if (!activeTrack || !clipboardBuffer) return;
    const insertTime = currentTime;
    const before = sliceAudioBuffer(activeTrack.buffer, 0, insertTime);
    const after = sliceAudioBuffer(activeTrack.buffer, insertTime, activeTrack.buffer.duration);
    const pasted = concatAudioBuffers([before, clipboardBuffer, after]);

    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: pasted, duration: pasted.duration } : t
    );
    setTracks(updated);
    pushHistory(updated);
    updateAnalysisMetrics(pasted);
  };

  // 5. Split at Playhead (S)
  const handleSplitAtCursor = () => {
    if (!activeTrack) return;
    const splitTime = currentTime;
    if (splitTime <= 0 || splitTime >= activeTrack.buffer.duration) return;

    const clip1 = sliceAudioBuffer(activeTrack.buffer, 0, splitTime);
    const clip2 = sliceAudioBuffer(activeTrack.buffer, splitTime, activeTrack.buffer.duration);

    const track1: TrackClip = {
      ...activeTrack,
      name: `${activeTrack.name} (Part 1)`,
      buffer: clip1,
      duration: clip1.duration,
    };
    const track2: TrackClip = {
      ...activeTrack,
      id: `track_${Date.now()}`,
      name: `${activeTrack.name} (Part 2)`,
      buffer: clip2,
      duration: clip2.duration,
      startTime: splitTime,
      color: '#8b5cf6',
    };

    const updated = tracks
      .map((t, idx) => (idx === activeTrackIndex ? track1 : t))
      .concat(track2);
    setTracks(updated);
    pushHistory(updated);
  };

  // 6. Insert Silence
  const handleInsertSilence = (durationSec = 1.0) => {
    if (!activeTrack) return;
    const modified = insertSilenceBuffer(activeTrack.buffer, currentTime, durationSec);
    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: modified, duration: modified.duration } : t
    );
    setTracks(updated);
    pushHistory(updated);
  };

  // 7. Reverse Audio
  const handleReverse = () => {
    if (!activeTrack) return;
    const reversed = reverseAudioBuffer(activeTrack.buffer);
    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: reversed } : t
    );
    setTracks(updated);
    pushHistory(updated);
  };

  // ==========================================
  // DSP FX & NORMALIZATION ACTIONS
  // ==========================================

  // Apply EBU R128 LUFS Loudness Normalization
  const handleApplyNormalize = () => {
    if (!activeTrack) return;
    setIsProcessing(true);
    try {
      const normalized = normalizeAudioBuffer(activeTrack.buffer, normalizePreset, -0.5);
      const updated = tracks.map((t, idx) =>
        idx === activeTrackIndex ? { ...t, buffer: normalized } : t
      );
      setTracks(updated);
      pushHistory(updated);
      updateAnalysisMetrics(normalized);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Normalization error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply Smooth Fades
  const handleApplyFade = () => {
    if (!activeTrack) return;
    const faded = applyBufferFade(activeTrack.buffer, fadeType, fadeDuration, 'linear');
    const updated = tracks.map((t, idx) =>
      idx === activeTrackIndex ? { ...t, buffer: faded } : t
    );
    setTracks(updated);
    pushHistory(updated);
  };

  // Apply Full DSP Master Chain
  const handleApplyFullDSPChain = async () => {
    if (!activeTrack) return;
    setIsProcessing(true);
    try {
      const processed = await processAudioBufferDSP(activeTrack.buffer, {
        bass: eqBass,
        mid: eqMid,
        treble: eqTreble,
        denoiseLevel: denoiseStrength,
        compressorEnabled: true,
        compressorThreshold,
        compressorRatio,
        reverbMix,
        delayTime: delayTimeMs,
      });

      const updated = tracks.map((t, idx) =>
        idx === activeTrackIndex ? { ...t, buffer: processed } : t
      );
      setTracks(updated);
      pushHistory(updated);
      updateAnalysisMetrics(processed);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    } catch (e) {
      console.error('DSP chain execution error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple Mode 4-Step Auto Magic Clean & Normalize
  const handleSimpleModeAutoClean = async () => {
    if (!activeTrack) return;
    setIsProcessing(true);
    try {
      const clean = await processAudioBufferDSP(activeTrack.buffer, {
        denoiseLevel: 50,
        compressorEnabled: true,
        compressorThreshold: -20,
        compressorRatio: 3,
        normalizeTargetLufs: -16, // Standard podcast loudness
      });

      const updated = tracks.map((t, idx) =>
        idx === activeTrackIndex ? { ...t, buffer: clean } : t
      );
      setTracks(updated);
      pushHistory(updated);
      updateAnalysisMetrics(clean);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Simple clean error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // SIGNAL GENERATOR ACTIONS
  // ==========================================

  const handleGenerateSignal = () => {
    let generated: AudioBuffer;
    let trackName = 'Generated Signal';

    if (genType === 'tone') {
      generated = generateToneBuffer(genFreq, genWaveform, genDuration);
      trackName = `Tone (${genFreq}Hz ${genWaveform})`;
    } else if (genType === 'noise') {
      generated = generateNoiseBuffer(genNoiseType, genDuration);
      trackName = `${genNoiseType === 'white' ? 'White' : 'Pink'} Noise`;
    } else if (genType === 'sweep') {
      generated = generateChirpSweepBuffer(20, 20000, genDuration);
      trackName = 'Chirp Sweep (20Hz - 20kHz)';
    } else {
      generated = generateDTMFBuffer(genDTMFKey, genDuration);
      trackName = `DTMF Keypad '${genDTMFKey}'`;
    }

    const newTrack: TrackClip = {
      id: `gen_${Date.now()}`,
      name: trackName,
      buffer: generated,
      startTime: currentTime,
      offset: 0,
      duration: generated.duration,
      gain: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      color: '#10b981',
    };

    const updated = [...tracks, newTrack];
    setTracks(updated);
    pushHistory(updated);
    setActiveTrackIndex(updated.length - 1);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
  };

  // ==========================================
  // EXPORT MASTER & STEMS
  // ==========================================

  const handleExportMaster = async () => {
    if (tracks.length === 0) return;
    setIsProcessing(true);
    try {
      const mixBuffer = await renderMultiTrackProject(tracks, masterVolume);
      const wavBlob = audioBufferToWavBlob(mixBuffer, exportBitDepth);

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle}.${exportFormat}`;
      a.click();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMasterToPlayer = async () => {
    if (tracks.length === 0) return;
    setIsProcessing(true);
    try {
      const mixBuffer = await renderMultiTrackProject(tracks, masterVolume);
      const wavBlob = audioBufferToWavBlob(mixBuffer, 16);
      onSendToPlayer({
        name: projectTitle,
        blob: wavBlob,
        duration: mixBuffer.duration,
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Send to player error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00.00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  // Waveform Canvas Rendering for Active Tracks
  useEffect(() => {
    const canvas = timelineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;

    if (tracks.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No audio tracks in project session', width / 2, height / 2);
      return;
    }

    const maxDuration = Math.max(...tracks.map((t) => t.startTime + t.duration), 1.0);
    const trackHeight = height / Math.max(1, tracks.length);

    tracks.forEach((track, tIdx) => {
      const yOffset = tIdx * trackHeight;
      const channelData = track.buffer.getChannelData(0);
      const step = Math.ceil(channelData.length / width);
      const amp = trackHeight / 2.2;

      // Track background lane
      ctx.fillStyle = tIdx === activeTrackIndex ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, yOffset, width, trackHeight - 2);

      // Track label
      ctx.fillStyle = track.color;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Track ${tIdx + 1}: ${track.name}`, 8, yOffset + 14);

      // Draw Waveform with fast stride
      ctx.fillStyle = track.color;
      const stride = Math.max(1, Math.floor(step / 16)); // Subsample for fast 60fps rendering
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        const startSample = Math.floor((i / width) * channelData.length);
        const endSample = Math.min(channelData.length, startSample + step);

        for (let j = startSample; j < endSample; j += stride) {
          const val = channelData[j];
          if (val < min) min = val;
          if (val > max) max = val;
        }

        if (max >= min) {
          const yCenter = yOffset + trackHeight / 2;
          const barHeight = Math.max(1, (max - min) * amp * track.gain);
          ctx.fillRect(i, yCenter - barHeight / 2, 1, barHeight);
        }
      }
    });

    // Draw In/Out Selection Region
    if (selectionEnd > selectionStart) {
      const selX1 = (selectionStart / maxDuration) * width;
      const selX2 = (selectionEnd / maxDuration) * width;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';
      ctx.fillRect(selX1, 0, selX2 - selX1, height);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(selX1, 0, selX2 - selX1, height);
    }

    // Draw Playhead Line
    const playheadX = (currentTime / maxDuration) * width;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [tracks, activeTrackIndex, currentTime, selectionStart, selectionEnd, zoomLevel]);

  return (
    <div className="space-y-6">
      {/* Global Toolbar */}
      <div className="flex items-center gap-2 neu-card p-3 rounded-xl mb-4">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="neu-btn flex items-center gap-1 text-xs font-bold disabled:opacity-30"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="neu-btn flex items-center gap-1 text-xs font-bold disabled:opacity-30"
        >
          <Redo2 className="w-3.5 h-3.5" /> Redo
        </button>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as any)}
          className="neu-inset text-xs px-2 py-1"
        >
          <option value="wav">WAV</option>
          <option value="mp3">MP3</option>
          <option value="flac">FLAC</option>
          <option value="ogg">OGG</option>
        </select>
        <button
          onClick={handleExportMaster}
          disabled={isProcessing}
          className="neu-btn text-xs font-bold"
        >
          Export Master
        </button>
      </div>
      {/* Editor Header Banner */}
      <div className="neu-card p-6 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/20 neu-flat">
            <Scissors className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">GS-Audio Audacity-Class Editor</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Pillar 3 • Non-Destructive Multitrack
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sample-Accurate Trimming • LUFS Loudness Normalization • Deep Undo Journal • Zero Uploads
            </p>
          </div>
        </div>

        {/* Simple vs Advanced Mode Toggle & File Opener */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Simple vs Advanced Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setEditorMode('simple')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                editorMode === 'simple' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => setEditorMode('advanced')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                editorMode === 'advanced' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Advanced DAW
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Import Track</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleAddTrackFile(e.target.files)}
          />
        </div>
      </div>

      {/* SIMPLE MODE: 4-Step Quick Fix & Polish */}
      {editorMode === 'simple' && (
        <div className="neu-card p-8 rounded-3xl space-y-6 border border-pink-500/20">
          <div className="space-y-1 text-center max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-white">4-Step Simple Audio Polish</h3>
            <p className="text-xs text-slate-400">
              Ideal for students, journalists &amp; quick voice notes. Trim, remove background hum, normalize, and export.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl neu-inset space-y-2 text-center">
              <span className="text-xs font-bold text-cyan-400 font-mono">1. Select Range</span>
              <p className="text-[11px] text-slate-400">Set start and end markers on the waveform below</p>
              <button
                onClick={handleTrimToSelection}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow"
              >
                Trim Selection
              </button>
            </div>

            <div className="p-4 rounded-2xl neu-inset space-y-2 text-center">
              <span className="text-xs font-bold text-indigo-400 font-mono">2. Auto Denoise</span>
              <p className="text-[11px] text-slate-400">Removes 50/60Hz hum, fan noise &amp; room hiss</p>
              <button
                onClick={handleSimpleModeAutoClean}
                disabled={isProcessing}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
              >
                {isProcessing ? 'Cleaning...' : 'Clean Noise'}
              </button>
            </div>

            <div className="p-4 rounded-2xl neu-inset space-y-2 text-center">
              <span className="text-xs font-bold text-pink-400 font-mono">3. Podcast Loudness</span>
              <p className="text-[11px] text-slate-400">Normalizes to standard -16 LUFS podcast target</p>
              <button
                onClick={handleApplyNormalize}
                className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow"
              >
                Normalize -16 LUFS
              </button>
            </div>

            <div className="p-4 rounded-2xl neu-inset space-y-2 text-center">
              <span className="text-xs font-bold text-emerald-400 font-mono">4. Export</span>
              <p className="text-[11px] text-slate-400">Save finished take directly to your device</p>
              <button
                onClick={handleExportMaster}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Export Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tool Tabs Ribbon */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {[
            { id: 'timeline', label: 'Multitrack Timeline', icon: Layers },
            { id: 'effects', label: 'DSP FX & Normalizer', icon: Sliders },
            { id: 'generate', label: 'Signal Generator', icon: Zap },
            { id: 'analyze', label: 'EBU R128 Loudness / LUFS', icon: Activity },
            { id: 'export', label: 'Master Export & Stems', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-pink-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'neu-btn text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Undo & Redo Quick Stack */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
        </div>
      </div>

      {/* Main Multitrack Canvas & Interactive Timeline */}
      <div className="neu-card p-6 rounded-3xl space-y-4">
        {/* Timeline Top Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Transport Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 rounded-xl transition-all ${
                isLooping ? 'bg-pink-600 text-white shadow' : 'neu-btn text-slate-400'
              }`}
              title="Loop Region (L)"
            >
              <Repeat className="w-4 h-4" />
            </button>

            <div className="font-mono text-sm font-bold text-white px-3 py-1.5 rounded-xl neu-inset">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Non-Destructive Edit Ops (Cut, Copy, Paste, Trim, Split, Silence) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleTrimToSelection}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-cyan-400"
              title="Trim to Selection (Ctrl+T)"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Trim</span>
            </button>

            <button
              onClick={handleCutSelection}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-rose-400"
              title="Cut Selection (Ctrl+X)"
            >
              <span>Cut</span>
            </button>

            <button
              onClick={handleCopySelection}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-emerald-400"
              title="Copy Selection (Ctrl+C)"
            >
              <span>Copy</span>
            </button>

            <button
              onClick={handlePasteClipboard}
              disabled={!clipboardBuffer}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-indigo-400 disabled:opacity-40"
              title="Paste at Cursor (Ctrl+V)"
            >
              <span>Paste</span>
            </button>

            <button
              onClick={handleSplitAtCursor}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-amber-400"
              title="Split at Playhead (S)"
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

            <button
              onClick={() => handleInsertSilence(1.0)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-cyan-400"
            >
              <span>+Silence</span>
            </button>

            <button
              onClick={handleReverse}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-pink-400"
            >
              <span>Reverse</span>
            </button>
          </div>
        </div>

        {/* Interactive Waveform Canvas Viewport */}
        <div className="relative p-4 neu-inset rounded-2xl overflow-hidden cursor-crosshair">
          <canvas
            ref={timelineCanvasRef}
            width={720}
            height={Math.max(160, tracks.length * 80)}
            className="w-full h-44 rounded-xl"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const maxDur = Math.max(...tracks.map((t) => t.startTime + t.duration), 1.0);
              setCurrentTime(ratio * maxDur);
            }}
          />
        </div>

        {/* Selection Range Draggers */}
        {activeTrack && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">In / Out Range:</span>
              <span className="text-pink-400 font-bold">
                {formatTime(selectionStart)} ➔ {formatTime(selectionEnd)} (Duration: {formatTime(Math.max(0, selectionEnd - selectionStart))})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="range"
                min="0"
                max={activeTrack.buffer.duration}
                step="0.05"
                value={selectionStart}
                onChange={(e) => setSelectionStart(Math.min(Number(e.target.value), selectionEnd - 0.1))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max={activeTrack.buffer.duration}
                step="0.05"
                value={selectionEnd}
                onChange={(e) => setSelectionEnd(Math.max(Number(e.target.value), selectionStart + 0.1))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB PANELS: EFFECTS / GENERATOR / LOUDNESS / EXPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Selected Tab Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: DSP FX & NORMALIZER */}
          {activeTab === 'effects' && (
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>DSP Effects &amp; Normalization Rack</span>
                </h3>
                <p className="text-xs text-slate-400">Offline Web Audio DSP Engine with Real-Time Parameter Modulation</p>
              </div>

              {/* LUFS Normalizer */}
              <div className="space-y-3 p-4 rounded-2xl neu-inset">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">EBU R128 LUFS Normalizer</span>
                  <span className="text-cyan-400 font-mono font-bold">{normalizePreset} LUFS</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '-16 LUFS (Podcast)', val: -16 },
                    { label: '-14 LUFS (Spotify)', val: -14 },
                    { label: '-23 LUFS (Broadcast)', val: -23 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setNormalizePreset(p.val)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        normalizePreset === p.val ? 'bg-cyan-600 text-white shadow' : 'neu-btn text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleApplyNormalize}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow"
                >
                  Apply Normalization Target
                </button>
              </div>

              {/* Spectral Denoise & EQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Spectral Denoise</span>
                    <span className="text-cyan-400 font-bold">{denoiseStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={denoiseStrength}
                    onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Reverb Space Mix</span>
                    <span className="text-pink-400 font-bold">{reverbMix}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={reverbMix}
                    onChange={(e) => setReverbMix(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Execute Full DSP Master Chain */}
              <button
                onClick={handleApplyFullDSPChain}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-pink-600 to-rose-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>Render &amp; Apply DSP Master Chain</span>
              </button>
            </div>
          )}

          {/* TAB 2: SIGNAL GENERATOR */}
          {activeTab === 'generate' && (
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Precision Signal Generator</span>
                </h3>
                <p className="text-xs text-slate-400">Generate Test Tones, White/Pink Noise, Chirps &amp; DTMF Frequencies</p>
              </div>

              {/* Generator Type Selector */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'tone', label: 'Pure Tone' },
                  { id: 'noise', label: 'Noise' },
                  { id: 'sweep', label: 'Chirp Sweep' },
                  { id: 'dtmf', label: 'DTMF Key' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenType(g.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      genType === g.id ? 'bg-cyan-600 text-white shadow' : 'neu-btn text-slate-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Tone Parameters */}
              {genType === 'tone' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Tone Frequency</span>
                      <span className="text-cyan-400 font-bold font-mono">{genFreq} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="4000"
                      value={genFreq}
                      onChange={(e) => setGenFreq(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((wf) => (
                      <button
                        key={wf}
                        onClick={() => setGenWaveform(wf)}
                        className={`py-1.5 rounded-xl text-xs font-bold uppercase ${
                          genWaveform === wf ? 'bg-pink-600 text-white' : 'neu-btn text-slate-400'
                        }`}
                      >
                        {wf}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Insert to Track Button */}
              <button
                onClick={handleGenerateSignal}
                className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Insert Signal to New Track</span>
              </button>
            </div>
          )}

          {/* TAB 3: EBU R128 LOUDNESS ANALYSIS */}
          {activeTab === 'analyze' && (
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>EBU R128 &amp; True Peak Metering</span>
                </h3>
                <p className="text-xs text-slate-400">Integrated Loudness, RMS Dynamics &amp; Headroom Ceiling</p>
              </div>

              {analysisMetrics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl neu-inset space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Integrated LUFS</span>
                    <p className="text-xl font-bold font-mono text-cyan-400">{analysisMetrics.estimatedLufs} LUFS</p>
                  </div>
                  <div className="p-4 rounded-2xl neu-inset space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">True Peak</span>
                    <p className="text-xl font-bold font-mono text-emerald-400">{analysisMetrics.peakDb} dBFS</p>
                  </div>
                  <div className="p-4 rounded-2xl neu-inset space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">RMS Energy</span>
                    <p className="text-xl font-bold font-mono text-white">{analysisMetrics.rmsDb} dB</p>
                  </div>
                  <div className="p-4 rounded-2xl neu-inset space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Dynamic Range</span>
                    <p className="text-xl font-bold font-mono text-pink-400">{analysisMetrics.dynamicRangeDb} dB</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No analysis data calculated</p>
              )}
            </div>
          )}

          {/* TAB 4: MASTER EXPORT & STEMS */}
          {activeTab === 'export' && (
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Master Mixdown &amp; Stem Exporter</span>
                </h3>
                <p className="text-xs text-slate-400">Zero Cloud Uploads • Lossless PCM 24/16-bit WAV &amp; Stems</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Project File Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleExportMaster}
                    disabled={isProcessing}
                    className="py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master ({exportFormat.toUpperCase()})</span>
                  </button>

                  <button
                    onClick={handleSendMasterToPlayer}
                    disabled={isProcessing}
                    className="py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Add to Music Player</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Active Track List & Channel Strips */}
        <div className="neu-card p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Project Tracks ({tracks.length})</span>
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-glow">
            {tracks.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => setActiveTrackIndex(idx)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer space-y-2 ${
                  idx === activeTrackIndex
                    ? 'neu-inset border-l-4 border-cyan-400'
                    : 'neu-card hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">{t.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{formatTime(t.duration)}</span>
                </div>

                {/* Track Gain Fader */}
                <div className="flex items-center gap-2 text-xs">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={t.gain}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTracks((prev) =>
                        prev.map((tr, i) => (i === idx ? { ...tr, gain: val } : tr))
                      );
                    }}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
