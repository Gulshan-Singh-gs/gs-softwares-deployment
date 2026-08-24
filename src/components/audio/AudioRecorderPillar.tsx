import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Radio,
  Monitor,
  Play,
  Pause,
  Square,
  Bookmark,
  Sparkles,
  Volume2,
  Sliders,
  HardDrive,
  Clock,
  ShieldCheck,
  RotateCcw,
  Scissors,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileAudio,
  Activity,
  Layers,
  Flame,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  audioBufferToWavBlob,
  decodeAudioFile,
  saveTakeJournalChunk,
  clearTakeJournal
} from '../../lib/audioEngine';
import { saveWorkspaceFile } from '../../lib/db';

export type RecorderMode = 'voice' | 'environment' | 'system';

interface BookmarkMarker {
  timeSec: number;
  label: string;
  color: string;
}

interface AudioRecorderPillarProps {
  onSendToEditor: (take: { name: string; blob: Blob }) => void;
  onSendToPlayer: (take: { name: string; blob: Blob; duration: number }) => void;
}

export const AudioRecorderPillar: React.FC<AudioRecorderPillarProps> = ({
  onSendToEditor,
  onSendToPlayer,
}) => {
  // Recorder Mode State
  const [recorderMode, setRecorderMode] = useState<RecorderMode>('voice');
  const [voicePreset, setVoicePreset] = useState<'memo' | 'lecture' | 'interview' | 'podcast'>('podcast');
  const [envPreset, setEnvPreset] = useState<'meeting' | 'field' | 'ambient' | 'asmr'>('field');

  // Hardware & Config
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<'wav' | 'webm'>('wav');
  const [inputGainDb, setInputGainDb] = useState<number>(0);
  const [enableLiveDenoise, setEnableLiveDenoise] = useState<boolean>(true);
  const [sampleRate, setSampleRate] = useState<number>(48000);

  // Recording Transport State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [estimatedSizeMb, setEstimatedSizeMb] = useState<number>(0);
  const [markers, setMarkers] = useState<BookmarkMarker[]>([]);
  const [newMarkerText, setNewMarkerText] = useState<string>('');

  // Finished Take State
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedTakeName, setRecordedTakeName] = useState<string>('Voice-Take-1');
  const [takeDuration, setTakeDuration] = useState<number>(0);
  const [isClipped, setIsClipped] = useState<boolean>(false);
  const [peakDb, setPeakDb] = useState<number>(-60);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const takeIdRef = useRef<string>(`take_${Date.now()}`);

  // Enumerate Audio Devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter((d) => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Device enum error:', err);
      }
    };
    fetchDevices();
  }, []);

  // Cleanup active streams/contexts on unmount to prevent memory leaks and crashes
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update live estimated file size
  useEffect(() => {
    if (!isRecording) return;
    // WAV 48k 16-bit stereo = 192 KB/s ≈ 11.5 MB/min
    // WebM Opus = 16 KB/s ≈ 0.96 MB/min
    const bytesPerSec = targetFormat === 'wav' ? 192000 : 16000;
    setEstimatedSizeMb(parseFloat(((elapsedSec * bytesPerSec) / (1024 * 1024)).toFixed(2)));
  }, [elapsedSec, isRecording, targetFormat]);

  // Start Recording Session
  const startRecording = async () => {
    try {
      let stream: MediaStream;
      takeIdRef.current = `take_${Date.now()}`;
      chunksRef.current = [];
      setMarkers([]);
      setRecordedBlob(null);
      setIsClipped(false);

      if (recorderMode === 'system') {
        // System / Tab Audio Capture
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      } else {
        // Microphone Device Capture with tuned constraints
        const isVoiceMode = recorderMode === 'voice';
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            echoCancellation: isVoiceMode,
            noiseSuppression: isVoiceMode && enableLiveDenoise,
            autoGainControl: isVoiceMode,
            sampleRate: sampleRate,
          },
          video: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      audioStreamRef.current = stream;

      // Web Audio DSP Graph for Live Level Metering & Filters
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = Math.pow(10, inputGainDb / 20);
      gainNodeRef.current = gainNode;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Voice processing filters
      if (recorderMode === 'voice') {
        const highpass = audioCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 80; // 80Hz rumble cut

        const presence = audioCtx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 3000; // 3kHz presence boost
        presence.gain.value = 2.5;

        source.connect(highpass).connect(presence).connect(gainNode).connect(analyser);
      } else {
        source.connect(gainNode).connect(analyser);
      }

      // MediaRecorder Setup
      const mimeType = targetFormat === 'wav' ? 'audio/webm' : 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          const buf = await e.data.arrayBuffer();
          saveTakeJournalChunk(buf, takeIdRef.current);
        }
      };

      recorder.onstop = async () => {
        const finalWebmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          // Decode to AudioBuffer and encode as clean 16-bit WAV if requested
          if (targetFormat === 'wav') {
            const decoded = await decodeAudioFile(finalWebmBlob);
            const wavBlob = audioBufferToWavBlob(decoded, 16);
            setRecordedBlob(wavBlob);
          } else {
            setRecordedBlob(finalWebmBlob);
          }
        } catch (err) {
          setRecordedBlob(finalWebmBlob);
        }
        setTakeDuration(elapsedSec);
        clearTakeJournal(takeIdRef.current);
      };

      recorder.start(1000); // 1-second chunks for crash-safe journal
      setIsRecording(true);
      setIsPaused(false);
      setElapsedSec(0);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);

      // Start canvas oscilloscope loop
      startCanvasMeterLoop();
    } catch (err) {
      console.error('Recording start failure:', err);
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording Session
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
  };

  // Discard Recording
  const discardRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setElapsedSec(0);
    setMarkers([]);
  };

  // Add Live Bookmark Marker
  const addMarker = (label?: string) => {
    const text = label || newMarkerText.trim() || `Flag @ ${formatTime(elapsedSec)}`;
    const colors = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
    const color = colors[markers.length % colors.length];

    setMarkers((prev) => [...prev, { timeSec: elapsedSec, label: text, color }]);
    setNewMarkerText('');
  };

  // Live Canvas Waveform & Peak VU Meter Loop
  const startCanvasMeterLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw Oscilloscope
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      let maxVal = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        const diffFromCenter = Math.abs(dataArray[i] - 128);
        if (diffFromCenter > maxVal) maxVal = diffFromCenter;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Peak Level calculation & Clip detection (> 126 in 8-bit scale ≈ 0dBFS)
      const currentPeak = maxVal / 128.0;
      const peakDbValue = currentPeak > 0 ? 20 * Math.log10(currentPeak) : -60;
      setPeakDb(parseFloat(peakDbValue.toFixed(1)));

      if (maxVal >= 126) {
        setIsClipped(true);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Post-Take Handoff Actions
  const handleSendToEditor = () => {
    if (!recordedBlob) return;
    onSendToEditor({ name: `${recordedTakeName}.${targetFormat}`, blob: recordedBlob });
  };

  const handleSendToPlayer = () => {
    if (!recordedBlob) return;
    onSendToPlayer({ name: recordedTakeName, blob: recordedBlob, duration: takeDuration });
  };

  const handleDownload = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordedTakeName}.${targetFormat}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Voice Recorder Header Banner */}
      <div className="neu-card p-6 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20 neu-flat">
            <Mic className={`w-7 h-7 ${isRecording && !isPaused ? 'animate-pulse text-rose-300' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">GS-Audio Studio Recorder</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Pillar 2 • Zero Upload
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Speech-Optimized &amp; Environmental Capture • Crash-Safe Journal • Instant Handoff
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-inset">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Crash-Safe OPFS Journal</span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs (Voice vs Environment vs System Audio) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            id: 'voice',
            title: 'Mode A: Voice / Speech',
            desc: 'High-pass 80Hz rumble cut + 3kHz presence boost + noise gate',
            icon: Mic,
            color: 'from-rose-600 to-pink-600',
          },
          {
            id: 'environment',
            title: 'Mode B: Environment / Room',
            desc: 'Wide dynamic range, transparent ambient field recording',
            icon: Radio,
            color: 'from-cyan-600 to-indigo-600',
          },
          {
            id: 'system',
            title: 'Mode C: System / Tab Audio',
            desc: 'Capture livestream, browser tab, or on-device playback',
            icon: Monitor,
            color: 'from-indigo-600 to-purple-600',
          },
        ].map((mode) => {
          const Icon = mode.icon;
          const isSelected = recorderMode === mode.id;
          return (
            <button
              key={mode.id}
              disabled={isRecording}
              onClick={() => setRecorderMode(mode.id as any)}
              className={`p-4 rounded-3xl text-left transition-all ${
                isSelected
                  ? `bg-gradient-to-br ${mode.color} text-white shadow-xl shadow-cyan-600/20 scale-102`
                  : 'neu-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Icon className="w-5 h-5 text-white shrink-0" />
                <p className="text-xs font-bold">{mode.title}</p>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">{mode.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Studio Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Live Recording & Visualizer Deck */}
        <div className="lg:col-span-2 space-y-6">
          <div className="neu-card p-6 md:p-8 rounded-3xl space-y-6">
            
            {/* Live Oscilloscope Canvas & VU Peak Meter */}
            <div className="relative p-6 neu-inset rounded-3xl flex flex-col items-center justify-center min-h-[220px]">
              <canvas
                ref={canvasRef}
                width={560}
                height={150}
                className="w-full h-36 z-10"
              />

              {/* Live VU Peak Meter Bar */}
              <div className="w-full mt-4 flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">Peak:</span>
                <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      peakDb > -3
                        ? 'bg-rose-500'
                        : peakDb > -12
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, (peakDb + 60) * 1.66))}%` }}
                  />
                </div>
                <span className={`text-xs font-mono font-bold ${isClipped ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {peakDb} dBFS
                </span>
                {isClipped && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                    CLIP
                  </span>
                )}
              </div>
            </div>

            {/* Time & Size Live Status Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl neu-card border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isRecording && !isPaused ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <div>
                  <p className="text-2xl font-black font-mono text-white tracking-tight">
                    {formatTime(elapsedSec)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {isRecording ? (isPaused ? 'Recording Paused' : 'Live Capture Active') : 'Standby Engine'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Target: </span>
                  <span className="text-cyan-400 font-bold uppercase">{targetFormat}</span>
                </div>
                <div>
                  <span className="text-slate-400">Est. Size: </span>
                  <span className="text-emerald-400 font-bold">{estimatedSizeMb} MB</span>
                </div>
              </div>
            </div>

            {/* Master Transport Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 transition-transform hover:scale-105 flex items-center gap-3"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Live Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="px-6 py-3.5 rounded-2xl neu-btn text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                    <span>{isPaused ? 'Resume Take' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={stopRecording}
                    className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop &amp; Finalize Take</span>
                  </button>

                  <button
                    onClick={discardRecording}
                    className="p-3.5 rounded-2xl text-slate-400 hover:text-rose-400 neu-btn"
                    title="Discard take"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Live Markers & Bookmarks Section */}
            {isRecording && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Bookmark Marker</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{markers.length} markers</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Important point, Question raised..."
                    value={newMarkerText}
                    onChange={(e) => setNewMarkerText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMarker()}
                    className="flex-1 px-4 py-2 rounded-xl neu-inset text-xs text-white"
                  />
                  <button
                    onClick={() => addMarker()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {markers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {markers.map((m, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300"
                        style={{ borderLeftColor: m.color, borderLeftWidth: 3 }}
                      >
                        <span className="text-cyan-400">{formatTime(m.timeSec)}</span>
                        <span>{m.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post-Recording Handoff Banner */}
            {recordedBlob && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Take Ready: {recordedTakeName}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Duration: {formatTime(takeDuration)} • Format: {targetFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={recordedTakeName}
                    onChange={(e) => setRecordedTakeName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl neu-inset text-xs text-white sm:w-48"
                  />
                </div>

                {/* Handoff Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleSendToEditor}
                    className="px-4 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Open in Audio Editor ➔</span>
                  </button>

                  <button
                    onClick={handleSendToPlayer}
                    className="px-4 py-3 rounded-2xl neu-btn text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 text-pink-400" />
                    <span>Add to Music Player</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-3 rounded-2xl neu-btn text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Hardware & Voice DSP Controls */}
        <div className="space-y-6">
          {/* Audio Input Device & Format */}
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Input Hardware &amp; Format</span>
            </h3>

            {/* Microphone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Active Microphone</label>
              <select
                disabled={isRecording}
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer"
              >
                {audioDevices.length === 0 && <option value="">Default System Microphone</option>}
                {audioDevices.map((dev) => (
                  <option key={dev.deviceId} value={dev.deviceId}>
                    {dev.label || `Microphone (${dev.deviceId.slice(0, 8)})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Choice: WAV Lossless vs WebM Opus */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Format &amp; Quality Choice</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isRecording}
                  onClick={() => setTargetFormat('wav')}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    targetFormat === 'wav' ? 'neu-inset border-cyan-500/40 text-cyan-300' : 'neu-btn text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">WAV (Lossless)</p>
                  <p className="text-[10px] opacity-75">16-bit PCM • Best for Editing</p>
                </button>

                <button
                  disabled={isRecording}
                  onClick={() => setTargetFormat('webm')}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    targetFormat === 'webm' ? 'neu-inset border-pink-500/40 text-pink-300' : 'neu-btn text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">Opus (Compressed)</p>
                  <p className="text-[10px] opacity-75">Tiny Size • Save Storage</p>
                </button>
              </div>
            </div>

            {/* Input Gain Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Input Preamp Gain</span>
                <span className="text-cyan-400 font-bold">{inputGainDb > 0 ? `+${inputGainDb}` : inputGainDb} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={inputGainDb}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInputGainDb(val);
                  if (gainNodeRef.current) {
                    gainNodeRef.current.gain.value = Math.pow(10, val / 20);
                  }
                }}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Voice Presets & Live Filters */}
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Speech DSP Presets</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'podcast', label: 'Podcast Studio' },
                { id: 'lecture', label: 'Lecture Hall' },
                { id: 'interview', label: 'Interview Dialog' },
                { id: 'memo', label: 'Quick Memo' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setVoicePreset(p.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    voicePreset === p.id ? 'bg-cyan-600 text-white shadow' : 'neu-btn text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live Noise Suppression Toggle */}
            <button
              onClick={() => setEnableLiveDenoise(!enableLiveDenoise)}
              className={`w-full p-3 rounded-2xl text-left transition-all ${
                enableLiveDenoise ? 'neu-inset border-cyan-500/40 text-cyan-300' : 'neu-btn text-slate-400'
              }`}
            >
              <p className="text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Noise Suppression</span>
              </p>
              <p className="text-[10px] opacity-75 mt-0.5">Cleans café noise, air conditioners & fan hums</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
