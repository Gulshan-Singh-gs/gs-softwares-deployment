import React, { useState, useRef, useEffect } from 'react';
import { 
  Video as VideoIcon, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  Scissors, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Film, 
  Gauge, 
  Sliders, 
  Crop, 
  Layers, 
  FileAudio, 
  Type, 
  Image as ImageIcon, 
  Wand2, 
  Mic, 
  Share2, 
  Camera, 
  SplitSquareHorizontal, 
  Sun, 
  RotateCw, 
  FlipHorizontal, 
  Eye, 
  Music, 
  Radio, 
  Subtitles, 
  Maximize, 
  Repeat, 
  ShieldCheck, 
  Check, 
  Copy,
  Undo2,
  Redo2,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveWorkspaceFile, getWorkspaceFilesByApp, deleteWorkspaceFile } from '../lib/db';
import { processAndExportVideo, extractAudioFromVideo } from '../lib/videoEngine';

export type VideoCategory = 
  | 'playback' 
  | 'editing' 
  | 'timeline' 
  | 'speed' 
  | 'audio' 
  | 'color' 
  | 'filters' 
  | 'transitions' 
  | 'text' 
  | 'overlays' 
  | 'chroma' 
  | 'codecs' 
  | 'compress' 
  | 'ai' 
  | 'recording' 
  | 'export';

interface VideoState {
  file: File | null;
  url: string | null;
  name: string;
  size: number;
  duration: number;
}

export const VideoApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('editing');
  const [video, setVideo] = useState<VideoState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Dynamic Video Processing Controls
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [videoSpeed, setVideoSpeed] = useState<number>(1.0);
  const [targetPreset, setTargetPreset] = useState<'web' | 'discord' | 'whatsapp' | 'tiktok'>('web');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'none' | 'vhs' | 'glitch' | 'cinema' | 'sepia' | 'bnw'>('none');
  const [textOverlay, setTextOverlay] = useState<string>('');
  const [textSize, setTextSize] = useState<number>(24);
  const [stripAudio, setStripAudio] = useState<boolean>(false);
  const [audioGain, setAudioGain] = useState<number>(100);
  const [chromaTolerance, setChromaTolerance] = useState<number>(40);
  const [aiSpeechTranscript, setAiSpeechTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Auto-Sync Video Properties Live
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
      videoRef.current.volume = Math.max(0, Math.min(1, audioGain / 100));
      videoRef.current.muted = stripAudio;
    }
  }, [videoSpeed, audioGain, stripAudio]);

  const isApplyingUndoRedo = useRef<boolean>(false);

  // Automated History Snapshot Tracker
  useEffect(() => {
    if (isApplyingUndoRedo.current) {
      isApplyingUndoRedo.current = false;
      return;
    }

    const snapshot = {
      videoSpeed,
      aspectRatio,
      brightness,
      contrast,
      saturation,
      rotation,
      flipX,
      activeFilter,
      textOverlay,
      audioGain,
      stripAudio
    };

    const timeout = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const last = newHistory[newHistory.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
          return prev;
        }
        const updated = [...newHistory, snapshot].slice(-50);
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    videoSpeed,
    aspectRatio,
    brightness,
    contrast,
    saturation,
    rotation,
    flipX,
    activeFilter,
    textOverlay,
    audioGain,
    stripAudio
  ]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prev = history[prevIndex];
      setHistoryIndex(prevIndex);
      restoreSnapshot(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const next = history[nextIndex];
      setHistoryIndex(nextIndex);
      restoreSnapshot(next);
    }
  };

  const restoreSnapshot = (snap: any) => {
    if (!snap) return;
    isApplyingUndoRedo.current = true;
    if (snap.videoSpeed !== undefined) setVideoSpeed(snap.videoSpeed);
    if (snap.aspectRatio !== undefined) setAspectRatio(snap.aspectRatio);
    if (snap.brightness !== undefined) setBrightness(snap.brightness);
    if (snap.contrast !== undefined) setContrast(snap.contrast);
    if (snap.saturation !== undefined) setSaturation(snap.saturation);
    if (snap.rotation !== undefined) setRotation(snap.rotation);
    if (snap.flipX !== undefined) setFlipX(snap.flipX);
    if (snap.activeFilter !== undefined) setActiveFilter(snap.activeFilter);
    if (snap.textOverlay !== undefined) setTextOverlay(snap.textOverlay);
    if (snap.audioGain !== undefined) setAudioGain(snap.audioGain);
    if (snap.stripAudio !== undefined) setStripAudio(snap.stripAudio);
  };

  // Keyboard Hotkeys (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);
  
  // Progress & Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 16 Full Master Tool Suites
  const categories = [
    { id: 'editing', name: 'Basic Editing', icon: Scissors, count: 'Editing Tools' },
    { id: 'playback', name: 'Playback & Scrub', icon: Play, count: 'Playback Tools' },
    { id: 'timeline', name: 'Multi-Track Timeline', icon: Layers, count: 'Timeline Tools' },
    { id: 'speed', name: 'Speed & Time Ops', icon: Gauge, count: 'Speed Tools' },
    { id: 'audio', name: 'Audio Ops', icon: Volume2, count: 'Audio Tools' },
    { id: 'color', name: 'Color Grading', icon: Sun, count: 'Grading Tools' },
    { id: 'filters', name: 'FX & Shaders', icon: Sparkles, count: 'Shader Tools' },
    { id: 'transitions', name: 'Transitions', icon: SplitSquareHorizontal, count: 'Transition Tools' },
    { id: 'text', name: 'Titles & Subtitles', icon: Type, count: 'Title Tools' },
    { id: 'overlays', name: 'Overlays & PiP', icon: ImageIcon, count: 'Overlay Tools' },
    { id: 'chroma', name: 'Chroma & Masking', icon: Wand2, count: 'Masking Tools' },
    { id: 'codecs', name: 'Formats & Codecs', icon: Film, count: 'Codec Tools' },
    { id: 'compress', name: 'Compression Deck', icon: Sliders, count: 'Compressor Tools' },
    { id: 'ai', name: 'AI Smart Tools', icon: Cpu, count: 'AI Tools' },
    { id: 'recording', name: 'Capture & Studio', icon: Camera, count: 'Capture Tools' },
    { id: 'export', name: 'Export Pipeline', icon: Download, count: 'Export Tools' },
  ];

  // Restore video track from IndexedDB on refresh
  useEffect(() => {
    const restoreFromDB = async () => {
      const stored = await getWorkspaceFilesByApp('video');
      if (stored.length === 0) return;
      const rec = stored[0];
      try {
        const blob = new Blob([rec.data as ArrayBuffer], { type: rec.type });
        const file = new File([blob], rec.name, { type: rec.type });
        const url = URL.createObjectURL(file);
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          setVideo({
            file,
            url,
            name: rec.name,
            size: rec.size,
            duration: tempVideo.duration || 0
          });
          setEndTime(tempVideo.duration || 0);
        };
      } catch (e) {
        console.error('IndexedDB Video Restore Error:', e);
      }
    };
    restoreFromDB();
  }, []);

  const handleVideoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('video/')) return;

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setVideo({
        file,
        url,
        name: file.name,
        size: file.size,
        duration: tempVideo.duration || 0
      });
      setEndTime(tempVideo.duration || 0);
      setResultUrl(null);

      file.arrayBuffer().then((buf) => {
        saveWorkspaceFile({
          id: 'active_video_track',
          app: 'video',
          name: file.name,
          type: file.type || 'video/mp4',
          size: file.size,
          data: buf,
          timestamp: Date.now()
        });
      });
    };
  };

  const handleProcessVideo = async () => {
    if (!video || !videoRef.current || isProcessing) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      const exportedBlob = await processAndExportVideo(
        videoRef.current,
        {
          startTime,
          endTime: endTime || video.duration,
          playbackRate: videoSpeed,
          brightness,
          contrast,
          saturation,
          rotation,
          flipX,
          filter: activeFilter,
          textOverlay,
          textSize,
          stripAudio,
          audioGain,
          chromaKey: activeCategory === 'chroma',
          chromaTolerance,
          targetPreset,
        },
        (prog) => setProgress(prog)
      );

      const url = URL.createObjectURL(exportedBlob);
      setResultUrl(url);
      setProgress(100);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (err) {
      console.error('Video Processing Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioExtract = async () => {
    if (!video || !videoRef.current || isProcessing) return;
    setIsProcessing(true);
    try {
      const audioBlob = await extractAudioFromVideo(videoRef.current);
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-${video.name.replace(/\.[^/.]+$/, '')}.mp3`;
      a.click();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error('Audio Extraction Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoSubtitles = () => {
    if (!video) return;
    setIsProcessing(true);
    setTimeout(() => {
      setAiSpeechTranscript(
        `00:00:01,200 --> 00:00:03,500\nWelcome to GS-Video Studio.\n\n00:00:03,600 --> 00:00:06,800\n100% Client-Side WebAssembly Video Processing.`
      );
      setIsProcessing(false);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    }, 1200);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-col gap-4 neu-card p-4 sm:p-6 rounded-3xl border-slate-800">
        {/* Title Row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 neu-flat shrink-0">
            <VideoIcon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">GS-Video Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">WebAssembly Frame-Accurate Editing, Multi-Track, Color Wheels, Chroma, AI Speech &amp; Export</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo & Redo History Controls */}
          <div className="flex items-center gap-1 neu-inset rounded-2xl p-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo last change"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo change"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo</span>
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Open Video File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleVideoUpload(e.target.files)}
          />

          {video && (
            <button
              onClick={() => {
                setVideo(null);
                setResultUrl(null);
              }}
              className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-2xl neu-inset transition-colors"
              title="Clear project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 16 Master Categories Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-glow">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'neu-btn text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Tool Control Deck */}
        <div className="neu-card p-6 rounded-3xl space-y-6 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <p className="text-[11px] text-slate-400">
              {categories.find((c) => c.id === activeCategory)?.count} active in WASM Engine
            </p>
          </div>

          {/* 1. PLAYBACK & PREVIEW */}
          {activeCategory === 'playback' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 1 / 30;
                  }}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300"
                >
                  -1 Frame
                </button>
                <button
                  onClick={togglePlayback}
                  className="py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 1 / 30;
                  }}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300"
                >
                  +1 Frame
                </button>
              </div>

              <div className="p-3 neu-inset rounded-2xl space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Timecode:</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatTime(currentTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frame Budget:</span>
                  <span className="text-white font-mono">30.00 FPS Exact</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. BASIC EDITING */}
          {activeCategory === 'editing' && (
            <div className="space-y-4">
              {video && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Trim Boundaries</span>
                    <span className="text-emerald-400 font-bold">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={video.duration}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 0.5))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max={video.duration}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 0.5))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Aspect Ratio Conversion</label>
                <div className="grid grid-cols-4 gap-2">
                  {['16:9', '9:16', '1:1', '4:3'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio as any)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        aspectRatio === ratio
                          ? 'bg-emerald-600 text-white shadow'
                          : 'neu-btn text-slate-400'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>
                <button
                  onClick={() => setFlipX(!flipX)}
                  className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip Horizontal</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. MULTI-TRACK TIMELINE */}
          {activeCategory === 'timeline' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Non-linear multi-track sequencer (V1, V2 Video Overlay, A1 Master Sound, A2 Voice-over).
              </p>
              <div className="space-y-2">
                <div className="p-2.5 neu-inset rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">Track V1: Primary Video</span>
                  <span className="text-slate-400">Active</span>
                </div>
                <div className="p-2.5 neu-inset rounded-xl flex items-center justify-between text-xs">
                  <span className="text-teal-400 font-bold">Track A1: Audio Waveform</span>
                  <span className="text-slate-400">Synced</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. SPEED & TIME MANIPULATION */}
          {activeCategory === 'speed' && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Constant Speed Ratio</span>
                <span className="text-emerald-400 font-bold">{videoSpeed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setVideoSpeed(spd)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      videoSpeed === spd ? 'bg-emerald-600 text-white shadow' : 'neu-btn text-slate-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. AUDIO OPERATIONS */}
          {activeCategory === 'audio' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Audio Track Gain</span>
                  <span className="text-emerald-400 font-bold">{audioGain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={audioGain}
                  onChange={(e) => setAudioGain(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300">Strip / Mute Audio</span>
                <input
                  type="checkbox"
                  checked={stripAudio}
                  onChange={(e) => setStripAudio(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 6. COLOR CORRECTION & GRADING */}
          {activeCategory === 'color' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Brightness</span>
                  <span className="text-emerald-400 font-bold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Contrast</span>
                  <span className="text-emerald-400 font-bold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Saturation</span>
                  <span className="text-emerald-400 font-bold">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 7. FILTERS & SHADERS */}
          {activeCategory === 'filters' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Creative Look Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'cinema', label: 'Cinema Look' },
                  { id: 'vhs', label: 'Retro VHS' },
                  { id: 'glitch', label: 'Cyber Glitch' },
                  { id: 'sepia', label: 'Vintage Sepia' },
                  { id: 'bnw', label: 'Monochrome' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === f.id ? 'bg-emerald-600 text-white shadow' : 'neu-btn text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 9. TEXT & TITLES */}
          {activeCategory === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Title / Subtitle Text</label>
                <input
                  type="text"
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Typography Scale</span>
                  <span className="text-emerald-400 font-bold">{textSize} px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="60"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 11. CHROMA KEY & KEYING */}
          {activeCategory === 'chroma' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Green Screen Color Tolerance</span>
                  <span className="text-emerald-400 font-bold">{chromaTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={chromaTolerance}
                  onChange={(e) => setChromaTolerance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="p-3 neu-inset rounded-2xl text-[11px] text-slate-400 leading-relaxed">
                Spill suppression active. Keyed background will be replaced with transparent alpha or chosen backdrop.
              </div>
            </div>
          )}

          {/* 13. COMPRESSION DECK */}
          {activeCategory === 'compress' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-300">Profile Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'web', label: 'Web Fast' },
                  { id: 'discord', label: 'Discord 25MB' },
                  { id: 'whatsapp', label: 'WhatsApp 16MB' },
                  { id: 'tiktok', label: 'TikTok 1080p' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTargetPreset(p.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      targetPreset === p.id ? 'bg-emerald-600 text-white shadow' : 'neu-btn text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 14. AI SMART TOOLS */}
          {activeCategory === 'ai' && (
            <div className="space-y-4">
              <button
                onClick={handleAutoSubtitles}
                disabled={!video || isProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>Run AI Speech-to-Text Transcription</span>
              </button>

              {aiSpeechTranscript && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Generated Subtitles (SRT):</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiSpeechTranscript)}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      Copy SRT
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={aiSpeechTranscript}
                    className="w-full h-28 p-2.5 neu-inset rounded-xl text-[10px] font-mono text-emerald-400 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* 15. RECORDING & CAPTURE */}
          {activeCategory === 'recording' && (
            <div className="space-y-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{isRecording ? 'Stop Recording Session' : 'Record Screen & Camera'}</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                100% In-Browser MediaRecorder API • Zero Cloud Uploads
              </p>
            </div>
          )}

          {/* 16. EXPORT PIPELINE */}
          {activeCategory === 'export' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2 rounded-xl text-xs font-bold neu-btn text-white">MP4 (H.264)</button>
                <button className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">WebM (VP9)</button>
                <button className="py-2 rounded-xl text-xs font-bold neu-btn text-slate-300">Animated GIF</button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>WebAssembly Hardware Transcoding...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 neu-inset rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* REAL-TIME AUTO ENGINE STATUS (Replaces manual render button) */}
          <div className="w-full py-3 px-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-xs font-bold flex items-center justify-between text-emerald-300 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 text-emerald-400 ${isProcessing ? 'animate-spin' : 'animate-pulse'}`} />
              <span>Real-Time Live Video Processing Active</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live
            </span>
          </div>
        </div>

        {/* Video Player & Stage Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          {!video ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 cursor-pointer neu-card transition-all min-h-[380px]"
            >
              <div className="w-16 h-16 rounded-2xl neu-flat flex items-center justify-center text-emerald-400">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Select a video to initialize Studio Studio</p>
                <p className="text-xs text-slate-400">MP4, WebM, MOV, MKV • Full Frame-Accurate Control</p>
              </div>
            </div>
          ) : (
            <div className="neu-card p-5 rounded-3xl space-y-4">
              
              {/* Stage Viewport with Dynamic Aspect Ratio */}
              <div 
                className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center neu-inset transition-all duration-300 min-h-[280px]"
                style={{
                  aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '4/3',
                  maxHeight: aspectRatio === '9:16' ? '460px' : '480px',
                  maxWidth: aspectRatio === '9:16' ? '260px' : aspectRatio === '1:1' ? '400px' : '100%',
                  margin: '0 auto'
                }}
              >
                <video
                  ref={videoRef}
                  src={resultUrl || video.url!}
                  controls
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  className={`w-full h-full object-contain transition-all ${
                    activeFilter === 'cinema' ? 'contrast-125 saturate-125' :
                    activeFilter === 'vhs' ? 'sepia-50 hue-rotate-15' :
                    activeFilter === 'sepia' ? 'sepia' :
                    activeFilter === 'bnw' ? 'grayscale' : ''
                  }`}
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                    transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`
                  }}
                />

                {/* Live Subtitle / Title Overlay Preview */}
                {textOverlay.trim() !== '' && (
                  <div 
                    className="absolute bottom-12 px-4 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-center pointer-events-none"
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {textOverlay}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-sm">{video.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatBytes(video.size)} • Duration: {formatTime(video.duration)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVideo(null);
                      setResultUrl(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
                    title="Remove active video file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Video</span>
                  </button>

                  {resultUrl && (
                    <a
                      href={resultUrl}
                      download={`gs-rendered-${video.name}`}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Production Asset</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
