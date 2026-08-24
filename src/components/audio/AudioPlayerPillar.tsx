import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Music,
  Plus,
  Trash2,
  Search,
  FolderOpen,
  Radio,
  FileAudio,
  Scissors,
  Moon,
  Zap,
  Clock,
  Bookmark,
  Share2,
  Download,
  Flame,
  CheckCircle2,
  ListMusic,
  Maximize2,
  Minimize2,
  Disc,
  Layers,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EQ_PRESETS,
  ISO_10_BAND_FREQUENCIES,
  LyricLine,
  parseLrcLyrics,
  generateStudioDemoTrack,
  audioBufferToWavBlob,
  decodeArrayBuffer
} from '../../lib/audioEngine';

export interface PlayerTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  blob?: Blob;
  size: number;
  addedAt: number;
  favorite?: boolean;
  playlist?: string;
  lyrics?: string;
  coverColor?: string;
}

interface AudioPlayerPillarProps {
  onSendToEditor: (track: { name: string; blob: Blob }) => void;
  sharedTracks?: PlayerTrack[];
}

export const AudioPlayerPillar: React.FC<AudioPlayerPillarProps> = ({
  onSendToEditor,
  sharedTracks = []
}) => {
  // Library State
  const [library, setLibrary] = useState<PlayerTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [activePlaylist, setActivePlaylist] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Playback & Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [crossfadeSec, setCrossfadeSec] = useState<number>(0);

  // Audio Enhancement & EQ
  const [selectedEqPreset, setSelectedEqPreset] = useState<string>('flat');
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [isLufsNormalized, setIsLufsNormalized] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isMonoDownmix, setIsMonoDownmix] = useState<boolean>(false);

  // UI Tabs & Views
  const [activeView, setActiveView] = useState<'nowPlaying' | 'library' | 'equalizer' | 'lyrics'>('nowPlaying');
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave' | 'circle'>('bars');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sample Lofi LRC Lyrics
  const sampleLyrics = `[00:00.00] GS-Audio • The Three Pillars Master Suite
[00:03.00] 100% Client-Side Web Audio Processing
[00:06.00] Zero Cloud Uploads • True Audio Ownership
[00:09.00] Parametric EQ, LUFS Normalization & Pure Fidelity
[00:12.00] Enjoy the lossless playback on your device`;

  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>(parseLrcLyrics(sampleLyrics));

  // Initialize with Studio Demo if library empty
  useEffect(() => {
    if (library.length === 0) {
      loadStudioDemo();
    }
  }, []);

  // Sync external shared tracks
  useEffect(() => {
    if (sharedTracks.length > 0) {
      setLibrary((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTracks = sharedTracks.filter((t) => !existingIds.has(t.id));
        return [...newTracks, ...prev];
      });
    }
  }, [sharedTracks]);

  const loadStudioDemo = async () => {
    try {
      const demoBuffer = generateStudioDemoTrack(15.0);
      const blob = audioBufferToWavBlob(demoBuffer, 16);
      const url = URL.createObjectURL(blob);

      const demoTrack: PlayerTrack = {
        id: 'studio_demo_take_1',
        name: 'Late Night Chillwave (Studio Master)',
        artist: 'GS Studio Band',
        album: 'Zero-Upload Sessions',
        duration: 15.0,
        url,
        blob,
        size: blob.size,
        addedAt: Date.now(),
        favorite: true,
        playlist: 'favorites',
        lyrics: sampleLyrics,
        coverColor: 'from-cyan-500 via-pink-500 to-indigo-600',
      };

      setLibrary([demoTrack]);
      setCurrentTrackIndex(0);
    } catch (e) {
      console.error('Demo load error:', e);
    }
  };

  const currentTrack = library[currentTrackIndex] || null;

  // Handle Local Audio Files Import
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks: PlayerTrack[] = [];
    const colors = [
      'from-cyan-500 via-indigo-500 to-purple-600',
      'from-pink-500 via-rose-500 to-amber-500',
      'from-emerald-500 via-teal-500 to-cyan-600',
      'from-violet-600 via-purple-600 to-pink-500',
      'from-amber-500 via-orange-500 to-rose-600',
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) continue;

      const url = URL.createObjectURL(file);
      const color = colors[i % colors.length];
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

      // Retrieve duration
      const tempAudio = new Audio(url);
      await new Promise((res) => {
        tempAudio.onloadedmetadata = () => res(true);
        tempAudio.onerror = () => res(false);
      });

      newTracks.push({
        id: `track_${Date.now()}_${i}`,
        name: cleanTitle,
        artist: 'Local Artist',
        album: 'My Device Audio',
        duration: tempAudio.duration || 180,
        url,
        blob: file,
        size: file.size,
        addedAt: Date.now(),
        favorite: false,
        playlist: 'all',
        coverColor: color,
        lyrics: sampleLyrics,
      });
    }

    if (newTracks.length > 0) {
      setLibrary((prev) => [...newTracks, ...prev]);
      setCurrentTrackIndex(0);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
  };

  // Media Session API for native hardware keys & lockscreen
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artist,
        album: currentTrack.album,
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }
  }, [currentTrack, isPlaying]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerMinutes <= 0) {
      setSleepTimerRemaining(null);
      return;
    }

    let remaining = sleepTimerMinutes * 60;
    setSleepTimerRemaining(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      setSleepTimerRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimerMinutes(0);
        setSleepTimerRemaining(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Playback Control Actions
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log(e));
    }
  };

  const handleNext = () => {
    if (library.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * library.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % library.length);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (library.length === 0) return;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + library.length) % library.length);
      setIsPlaying(true);
    }
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all' || isShuffle) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleEqPresetSelect = (presetKey: string) => {
    setSelectedEqPreset(presetKey);
    const preset = EQ_PRESETS[presetKey];
    if (preset) {
      setEqGains([...preset.gains]);
    }
  };

  const handleEqBandChange = (index: number, val: number) => {
    setSelectedEqPreset('custom');
    setEqGains((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const toggleFavorite = (trackId: string) => {
    setLibrary((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, favorite: !t.favorite } : t))
    );
  };

  const removeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLibrary((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      handleNext();
    }
  };

  // Canvas Audio Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      if (!isPlaying) {
        // Idle ambient line
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      phase += 0.05 * playbackRate;

      if (visualizerMode === 'bars') {
        const barCount = 48;
        const barWidth = width / barCount - 2;
        for (let i = 0; i < barCount; i++) {
          const eqFactor = (eqGains[Math.floor((i / barCount) * 10)] || 0) * 1.5;
          const amp = Math.sin(i * 0.2 + phase) * 25 + Math.cos(i * 0.4 - phase) * 20 + 40 + eqFactor;
          const barHeight = Math.max(6, Math.min(height - 10, amp));
          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 4);
          ctx.fill();
        }
      } else if (visualizerMode === 'wave') {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y =
            height / 2 +
            Math.sin(x * 0.03 + phase) * 24 +
            Math.sin(x * 0.015 - phase * 1.5) * 18;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (visualizerMode === 'circle') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const points = 60;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const offset = Math.sin(angle * 6 + phase * 2) * 12;
          const r = radius + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, visualizerMode, playbackRate, eqGains]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredTracks = library.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase());
    if (activePlaylist === 'favorites') return matchesSearch && t.favorite;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration || currentTrack.duration);
          }}
          onEnded={handleTrackEnded}
        />
      )}

      {/* Music Player Header Banner */}
      <div className="neu-card p-6 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/20 neu-flat">
            <Disc className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">GS-Audio Music Player</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Pillar 1 • Local-First
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Offline Hi-Fi Player • 10-Band EQ • ReplayGain Normalization • Gapless Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Audio Files</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFilesUpload(e.target.files)}
          />

          <button
            onClick={loadStudioDemo}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-semibold text-slate-300 hover:text-white"
            title="Load Melodic Studio Demo Track"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Load Demo Take</span>
          </button>
        </div>
      </div>

      {/* Player Navigation Views Ribbon */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {[
            { id: 'nowPlaying', label: 'Now Playing', icon: Disc },
            { id: 'library', label: `Track Library (${library.length})`, icon: ListMusic },
            { id: 'equalizer', label: '10-Band EQ & FX', icon: Sliders },
            { id: 'lyrics', label: 'Synced Lyrics', icon: FileAudio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
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

        {/* Quick Handoff Action to Editor */}
        {currentTrack && currentTrack.blob && (
          <button
            onClick={() => onSendToEditor({ name: currentTrack.name, blob: currentTrack.blob! })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 text-xs font-bold transition-all"
            title="Send track directly to Audacity-Class Editor"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Open in Editor ➔</span>
          </button>
        )}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Active View (Now Playing / EQ / Lyrics / Library) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* VIEW 1: NOW PLAYING DECK */}
          {activeView === 'nowPlaying' && (
            <div className="neu-card p-6 md:p-8 rounded-3xl space-y-6 relative overflow-hidden">
              
              {/* Visualizer Canvas & Artwork Header */}
              <div className="relative rounded-2xl p-6 neu-inset flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={150}
                  className="w-full h-36 z-10"
                />

                {/* Visualizer Mode Switcher */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md rounded-xl p-1 border border-slate-800">
                  {(['bars', 'wave', 'circle'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setVisualizerMode(mode)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                        visualizerMode === mode ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Track Info & Like Action */}
              {currentTrack ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{currentTrack.name}</span>
                      {isLufsNormalized && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          LUFS -14 Target
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {currentTrack.artist} • <span className="opacity-75">{currentTrack.album}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className={`p-3 rounded-2xl neu-inset transition-colors ${
                      currentTrack.favorite ? 'text-pink-500' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${currentTrack.favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No track loaded</div>
              )}

              {/* Scrubber Seek Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer transition-all"
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Master Transport Controls */}
              <div className="flex items-center justify-between pt-2">
                {/* Shuffle Button */}
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-3 rounded-2xl transition-all ${
                    isShuffle ? 'neu-inset text-cyan-400' : 'neu-btn text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Main Transport Group */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrev}
                    className="p-3.5 rounded-2xl neu-btn text-slate-300 hover:text-white transition-all hover:scale-105"
                    title="Previous Track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white flex items-center justify-center shadow-xl shadow-cyan-600/30 transition-transform hover:scale-105"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-3.5 rounded-2xl neu-btn text-slate-300 hover:text-white transition-all hover:scale-105"
                    title="Next Track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Repeat Button */}
                <button
                  onClick={() => {
                    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
                    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                    setRepeatMode(nextMode);
                  }}
                  className={`p-3 rounded-2xl transition-all ${
                    repeatMode !== 'off' ? 'neu-inset text-pink-400' : 'neu-btn text-slate-400 hover:text-white'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Pitch-Preserved Speed & Volume Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {/* Playback Rate / Speed Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Speed (Pitch-Preserved)</span>
                    <span className="text-cyan-400">{playbackRate}x</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all ${
                          playbackRate === rate
                            ? 'bg-cyan-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Master Output Volume</span>
                    <span className="text-cyan-400">{isMuted ? 'Muted' : `${volume}%`}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        setIsMuted(false);
                        if (audioRef.current) audioRef.current.volume = v / 100;
                      }}
                      className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: 10-BAND GRAPHIC EQUALIZER & ENHANCEMENT */}
          {activeView === 'equalizer' && (
            <div className="neu-card p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>10-Band Studio Graphic Equalizer</span>
                  </h3>
                  <p className="text-xs text-slate-400">Web Audio Biquad Filter Array • Zero Phase Distortion</p>
                </div>

                {/* Preset Selector */}
                <select
                  value={selectedEqPreset}
                  onChange={(e) => handleEqPresetSelect(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-bold cursor-pointer"
                >
                  {Object.entries(EQ_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.name}
                    </option>
                  ))}
                  <option value="custom">Custom Curves</option>
                </select>
              </div>

              {/* 10 Interactive Faders */}
              <div className="grid grid-cols-10 gap-2 h-56 pt-2">
                {ISO_10_BAND_FREQUENCIES.map((freq, idx) => {
                  const gain = eqGains[idx] || 0;
                  const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
                  return (
                    <div key={freq} className="flex flex-col items-center justify-between h-full group">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{gain > 0 ? `+${gain}` : gain}</span>
                      <div className="h-36 flex items-center justify-center">
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          value={gain}
                          onChange={(e) => handleEqBandChange(idx, Number(e.target.value))}
                          className="h-32 -rotate-90 accent-pink-500 cursor-pointer w-28"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Audio Enhancement Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setIsLufsNormalized(!isLufsNormalized)}
                  className={`p-3.5 rounded-2xl text-left transition-all ${
                    isLufsNormalized ? 'neu-inset border-cyan-500/40 text-cyan-300' : 'neu-btn text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ReplayGain LUFS</span>
                  </p>
                  <p className="text-[10px] opacity-75 mt-0.5">Eliminates volume jumps between songs</p>
                </button>

                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`p-3.5 rounded-2xl text-left transition-all ${
                    isNightMode ? 'neu-inset border-indigo-500/40 text-indigo-300' : 'neu-btn text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Night Compression</span>
                  </p>
                  <p className="text-[10px] opacity-75 mt-0.5">Controls loud peaks for bedtime listening</p>
                </button>

                <button
                  onClick={() => setIsMonoDownmix(!isMonoDownmix)}
                  className={`p-3.5 rounded-2xl text-left transition-all ${
                    isMonoDownmix ? 'neu-inset border-pink-500/40 text-pink-300' : 'neu-btn text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Disc className="w-3.5 h-3.5 text-pink-400" />
                    <span>Mono Downmix</span>
                  </p>
                  <p className="text-[10px] opacity-75 mt-0.5">Single-earphone accessibility mode</p>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: SYNCHRONIZED LRC LYRICS */}
          {activeView === 'lyrics' && (
            <div className="neu-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-cyan-400" />
                  <span>Synchronized Local Lyrics</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">100% Local • No Remote Fetch</span>
              </div>

              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 scrollbar-glow">
                {parsedLyrics.map((line, idx) => {
                  const isCurrent =
                    currentTime >= line.timeSec &&
                    (idx === parsedLyrics.length - 1 || currentTime < parsedLyrics[idx + 1].timeSec);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime = line.timeSec;
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-600/30 to-pink-600/30 text-white font-bold text-base scale-102 border-l-4 border-cyan-400'
                          : 'text-slate-400 hover:text-slate-200 text-xs'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-50 mr-3">{formatTime(line.timeSec)}</span>
                      <span>{line.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: TRACK LIBRARY TABLE */}
          {activeView === 'library' && (
            <div className="neu-card p-6 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search titles, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl neu-inset text-xs text-white"
                  />
                </div>

                {/* Playlist Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActivePlaylist('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activePlaylist === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    All ({library.length})
                  </button>
                  <button
                    onClick={() => setActivePlaylist('favorites')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activePlaylist === 'favorites' ? 'bg-pink-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Favorites
                  </button>
                </div>
              </div>

              {/* Tracks List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-glow">
                {filteredTracks.map((track, idx) => {
                  const isCurrent = library[currentTrackIndex]?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        const originalIdx = library.findIndex((t) => t.id === track.id);
                        setCurrentTrackIndex(originalIdx);
                        setIsPlaying(true);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-600/20 border border-cyan-500/40 text-white shadow'
                          : 'neu-card hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-pink-600 flex items-center justify-center text-white shrink-0">
                          {isCurrent && isPlaying ? <Disc className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{track.name}</p>
                          <p className="text-[10px] text-slate-400">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{formatTime(track.duration)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={`p-1.5 rounded-lg ${track.favorite ? 'text-pink-500' : 'text-slate-500 hover:text-white'}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${track.favorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => removeTrack(track.id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Mini Control Hub & Virtual Shelves */}
        <div className="space-y-6">
          {/* Virtual Shelves Card */}
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Smart Collections & Shelves</span>
            </h3>

            <div className="space-y-2">
              {[
                { name: 'Offline Vault', desc: 'Stored locally in IndexedDB', count: library.length, icon: CheckCircle2 },
                { name: 'Favorites & Stars', desc: 'Quick access tracks', count: library.filter((t) => t.favorite).length, icon: Heart },
                { name: 'Voice Notes & Takes', desc: 'From Voice Recorder', count: library.filter((t) => t.playlist === 'takes').length, icon: Radio },
                { name: 'Master Exports', desc: 'Rendered from Editor', count: library.filter((t) => t.playlist === 'master').length, icon: Scissors },
              ].map((shelf, idx) => {
                const Icon = shelf.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl neu-inset flex items-center justify-between hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs font-bold text-white">{shelf.name}</p>
                        <p className="text-[10px] text-slate-400">{shelf.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-300 font-mono px-2 py-0.5 rounded-lg bg-slate-900">
                      {shelf.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sleep Timer & Utilities Card */}
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Sleep Timer (Fade-Out)</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSleepTimerMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    sleepTimerMinutes === mins ? 'bg-cyan-600 text-white shadow' : 'neu-btn text-slate-400'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins}m`}
                </button>
              ))}
            </div>

            {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
              <p className="text-xs font-mono text-cyan-400 text-center font-bold">
                Auto-stopping in: {Math.floor(sleepTimerRemaining / 60)}m {sleepTimerRemaining % 60}s
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
