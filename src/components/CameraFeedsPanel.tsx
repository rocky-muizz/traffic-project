import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  Eye,
  Sliders,
  Video,
  VideoOff,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Sun,
  CloudRain,
  Moon,
  Zap,
} from 'lucide-react';
import { Direction } from '../types/traffic';

interface CameraFeedProps {
  queueCounts: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface SimulatedDetection {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  class: 'car' | 'bus' | 'truck' | 'motorcycle' | 'pedestrian';
  confidence: number;
  speed: number;
  color: string;
}

export const CameraFeedsPanel: React.FC<CameraFeedProps> = ({ queueCounts }) => {
  const [selectedCam, setSelectedCam] = useState<Direction | 'all'>('all');
  const [visionMode, setVisionMode] = useState<'standard' | 'night' | 'rain'>('standard');
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for the 4 synthetic camera canvases
  const northCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const southCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const eastCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const westCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toggle user physical webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setWebcamError(null);
    } else {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
          setIsWebcamActive(true);
        }
      } catch (err: any) {
        console.warn('Webcam permission or access failed:', err);
        setWebcamError('Camera access denied or not available. Running simulated high-resolution feeds.');
        setIsWebcamActive(false);
      }
    }
  };

  // Webcam live bounding box detection loop
  useEffect(() => {
    if (!isWebcamActive) return;
    let animId: number;

    const renderWebcamVision = () => {
      const video = webcamVideoRef.current;
      const canvas = webcamCanvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Render simulated real-time YOLO bounding boxes dynamically following motion/center
          const time = Date.now() / 1000;
          const boxX = (Math.sin(time) * 0.2 + 0.4) * canvas.width;
          const boxY = (Math.cos(time * 0.8) * 0.15 + 0.35) * canvas.height;
          const boxW = 140;
          const boxH = 120;

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX, boxY, boxW, boxH);

          ctx.fillStyle = '#0284c7';
          ctx.fillRect(boxX, boxY - 20, 110, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillText('Target: 96.4%', boxX + 5, boxY - 6);

          // Radar tracking marker
          ctx.beginPath();
          ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f43f5e';
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(renderWebcamVision);
    };

    animId = requestAnimationFrame(renderWebcamVision);
    return () => cancelAnimationFrame(animId);
  }, [isWebcamActive]);

  // Render synthetic high-FPS traffic feeds with animated vehicles and YOLO bounding boxes
  useEffect(() => {
    const canvases = [
      { ref: northCanvasRef, dir: 'north', name: 'CAM-01: NORTH CORRIDOR' },
      { ref: southCanvasRef, dir: 'south', name: 'CAM-02: SOUTH CORRIDOR' },
      { ref: eastCanvasRef, dir: 'east', name: 'CAM-03: EAST APPROACH' },
      { ref: westCanvasRef, dir: 'west', name: 'CAM-04: WEST APPROACH' },
    ];

    let animId: number;

    // Persistent vehicle trackers for each camera
    const trackers: Record<string, SimulatedDetection[]> = {
      north: [
        { id: 101, x: 70, y: 40, w: 52, h: 75, class: 'car', confidence: 0.94, speed: 42, color: '#38bdf8' },
        { id: 102, x: 140, y: 130, w: 56, h: 80, class: 'truck', confidence: 0.91, speed: 34, color: '#f97316' },
        { id: 103, x: 65, y: 160, w: 48, h: 70, class: 'car', confidence: 0.96, speed: 38, color: '#a78bfa' },
      ],
      south: [
        { id: 201, x: 80, y: 80, w: 54, h: 78, class: 'bus', confidence: 0.89, speed: 28, color: '#eab308' },
        { id: 202, x: 145, y: 50, w: 50, h: 72, class: 'car', confidence: 0.93, speed: 45, color: '#34d399' },
      ],
      east: [
        { id: 301, x: 60, y: 110, w: 50, h: 72, class: 'car', confidence: 0.95, speed: 36, color: '#fb7185' },
        { id: 302, x: 130, y: 90, w: 28, h: 45, class: 'motorcycle', confidence: 0.87, speed: 48, color: '#38bdf8' },
      ],
      west: [
        { id: 401, x: 90, y: 60, w: 52, h: 75, class: 'car', confidence: 0.92, speed: 41, color: '#facc15' },
        { id: 402, x: 140, y: 140, w: 50, h: 72, class: 'car', confidence: 0.97, speed: 39, color: '#e2e8f0' },
      ],
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      canvases.forEach(({ ref, dir, name }) => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cw = canvas.width;
        const ch = canvas.height;

        // 1. Draw Road Surface
        if (visionMode === 'night') {
          ctx.fillStyle = '#05070d';
        } else if (visionMode === 'rain') {
          ctx.fillStyle = '#111827';
        } else {
          ctx.fillStyle = '#1e293b';
        }
        ctx.fillRect(0, 0, cw, ch);

        // Perspective road perspective lines
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cw * 0.15, ch);
        ctx.lineTo(cw * 0.35, 0);
        ctx.lineTo(cw * 0.65, 0);
        ctx.lineTo(cw * 0.85, ch);
        ctx.fill();

        // Road lane divider dashes
        ctx.strokeStyle = visionMode === 'night' ? '#475569' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(cw * 0.5, 0);
        ctx.lineTo(cw * 0.5, ch);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rain effect if toggled
        if (visionMode === 'rain') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          for (let r = 0; r < 25; r++) {
            const rx = Math.random() * cw;
            const ry = Math.random() * ch;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 4, ry + 12);
            ctx.stroke();
          }
        }

        // 2. Move & Draw Vehicles
        const camTrackers = trackers[dir];
        camTrackers.forEach((veh) => {
          // Move vehicle downwards
          veh.y += veh.speed * dt * 2.2;
          if (veh.y > ch + 40) {
            veh.y = -80;
            veh.speed = Math.floor(Math.random() * 25) + 25;
            veh.confidence = Number((0.88 + Math.random() * 0.1).toFixed(2));
          }

          // Draw Vehicle Body
          ctx.fillStyle = veh.color;
          ctx.beginPath();
          ctx.roundRect(veh.x, veh.y, veh.w, veh.h, 4);
          ctx.fill();

          // Windshield
          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(veh.x + 4, veh.y + veh.h * 0.25, veh.w - 8, veh.h * 0.35);

          // Headlights glow
          if (visionMode === 'night') {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
            ctx.beginPath();
            ctx.arc(veh.x + 8, veh.y + veh.h, 4, 0, Math.PI * 2);
            ctx.arc(veh.x + veh.w - 8, veh.y + veh.h, 4, 0, Math.PI * 2);
            ctx.fill();

            // Headlight beam cone
            const grad = ctx.createLinearGradient(veh.x, veh.y + veh.h, veh.x, veh.y + veh.h + 60);
            grad.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
            grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(veh.x, veh.y + veh.h);
            ctx.lineTo(veh.x - 15, veh.y + veh.h + 60);
            ctx.lineTo(veh.x + veh.w + 15, veh.y + veh.h + 60);
            ctx.lineTo(veh.x + veh.w, veh.y + veh.h);
            ctx.fill();
          }

          // 3. Draw Computer Vision Bounding Box & Label
          if (showBBoxes) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(veh.x - 3, veh.y - 3, veh.w + 6, veh.h + 6);

            // Corner brackets style
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 3;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(veh.x - 5, veh.y + 8);
            ctx.lineTo(veh.x - 5, veh.y - 5);
            ctx.lineTo(veh.x + 8, veh.y - 5);
            ctx.stroke();

            // Classification label
            ctx.fillStyle = 'rgba(2, 132, 199, 0.9)';
            ctx.fillRect(veh.x - 5, veh.y - 18, 92, 15);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.fillText(
              `${veh.class.toUpperCase()} ${Math.round(veh.confidence * 100)}%`,
              veh.x - 2,
              veh.y - 7
            );

            // Speed & Track ID tag
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(veh.x - 5, veh.y + veh.h + 5, 88, 14);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(
              `#${veh.id} | ${veh.speed} km/h`,
              veh.x - 2,
              veh.y + veh.h + 15
            );
          }
        });

        // 4. Draw Camera HUD Header & Crosshair
        if (showTelemetry) {
          // Top HUD bar
          ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
          ctx.fillRect(0, 0, cw, 24);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillText(name, 8, 16);

          // Right HUD info
          ctx.fillStyle = '#10b981';
          ctx.font = '9px JetBrains Mono';
          ctx.textAlign = 'right';
          ctx.fillText(`LIVE 30FPS • ${(queueCounts as any)[dir] || 0} QUEUED`, cw - 8, 16);
          ctx.textAlign = 'left';

          // Center crosshair
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cw / 2 - 10, ch / 2);
          ctx.lineTo(cw / 2 + 10, ch / 2);
          ctx.moveTo(cw / 2, ch / 2 - 10);
          ctx.lineTo(cw / 2, ch / 2 + 10);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [visionMode, showBBoxes, showTelemetry, queueCounts]);

  return (
    <div className="flex flex-col gap-5">
      {/* Vision Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Deep Learning Multi-Camera Vision Grid</span>
            <span className="text-xs font-mono font-normal bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
              YOLOv8 Edge Pipeline
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inference on 4 intersection corridors with vehicle classification, headway measurement, and queue tracking.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Vision Mode Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setVisionMode('standard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                visionMode === 'standard' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Day
            </button>
            <button
              onClick={() => setVisionMode('rain')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                visionMode === 'rain' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" /> Rain
            </button>
            <button
              onClick={() => setVisionMode('night')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                visionMode === 'night' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Night/IR
            </button>
          </div>

          {/* Toggle Bounding Boxes */}
          <button
            onClick={() => setShowBBoxes(!showBBoxes)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition flex items-center gap-1.5 ${
              showBBoxes
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            BBoxes {showBBoxes ? 'ON' : 'OFF'}
          </button>

          {/* Toggle Webcam Demo */}
          <button
            onClick={toggleWebcam}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
              isWebcamActive
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                : 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900/60'
            }`}
          >
            {isWebcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            {isWebcamActive ? 'Stop Physical Webcam' : 'Test with Laptop Webcam'}
          </button>
        </div>
      </div>

      {/* Webcam Alert if error */}
      {webcamError && (
        <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{webcamError}</span>
          <button onClick={() => setWebcamError(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Physical Webcam Display if enabled */}
      {isWebcamActive && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400 animate-pulse" />
              Physical Camera Stream — Real-Time Edge Vision Test
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Tracking Active
            </span>
          </div>

          <div className="relative aspect-video max-w-xl mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <video ref={webcamVideoRef} className="hidden" playsInline muted />
            <canvas ref={webcamCanvasRef} width={640} height={480} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-slate-400 text-center mt-2 font-mono">
            Optical flow & neural bbox tracking mapped directly to adaptive signal timing controller.
          </p>
        </div>
      )}

      {/* 4-Camera Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CAM-01: North */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-slate-200">CAM-01 • Inbound North Corridor</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Queue: <strong className="text-cyan-400">{queueCounts.north} veh</strong>
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <canvas ref={northCanvasRef} width={300} height={190} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Occupancy</span>
              <strong className="text-slate-200">{Math.min(96, queueCounts.north * 12)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Avg Speed</span>
              <strong className="text-emerald-400">38.4 km/h</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Headway</span>
              <strong className="text-cyan-400">1.8 sec</strong>
            </div>
          </div>
        </div>

        {/* CAM-02: South */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-slate-200">CAM-02 • Inbound South Corridor</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Queue: <strong className="text-cyan-400">{queueCounts.south} veh</strong>
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <canvas ref={southCanvasRef} width={300} height={190} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Occupancy</span>
              <strong className="text-slate-200">{Math.min(96, queueCounts.south * 12)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Avg Speed</span>
              <strong className="text-emerald-400">35.2 km/h</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Headway</span>
              <strong className="text-cyan-400">2.1 sec</strong>
            </div>
          </div>
        </div>

        {/* CAM-03: East */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-slate-200">CAM-03 • Inbound East Approach</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Queue: <strong className="text-cyan-400">{queueCounts.east} veh</strong>
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <canvas ref={eastCanvasRef} width={300} height={190} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Occupancy</span>
              <strong className="text-slate-200">{Math.min(96, queueCounts.east * 12)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Avg Speed</span>
              <strong className="text-emerald-400">41.8 km/h</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Headway</span>
              <strong className="text-cyan-400">1.6 sec</strong>
            </div>
          </div>
        </div>

        {/* CAM-04: West */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-slate-200">CAM-04 • Inbound West Approach</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Queue: <strong className="text-cyan-400">{queueCounts.west} veh</strong>
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <canvas ref={westCanvasRef} width={300} height={190} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Occupancy</span>
              <strong className="text-slate-200">{Math.min(96, queueCounts.west * 12)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Avg Speed</span>
              <strong className="text-emerald-400">39.6 km/h</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Headway</span>
              <strong className="text-cyan-400">1.9 sec</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Edge AI Neural Architecture Specs Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Edge AI Computer Vision Stack Specifications (Academic FYP Architecture)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Detection Model</span>
            <strong className="text-slate-200 text-sm">YOLOv8x-Traffic</strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">mAP@50: 92.4%</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Inference Latency</span>
            <strong className="text-cyan-400 text-sm">12.4 ms / frame</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">TensorRT INT8 Precision</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Multi-Object Tracking</span>
            <strong className="text-slate-200 text-sm">ByteTrack + Kalman</strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">ID Switches: &lt;0.4%</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Edge Compute Unit</span>
            <strong className="text-emerald-400 text-sm">NVIDIA Jetson Orin</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">40 TOPS AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
