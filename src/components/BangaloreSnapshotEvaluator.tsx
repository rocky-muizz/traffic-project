import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Zap,
  CheckCircle,
  AlertTriangle,
  Siren,
  Clock,
  Layers,
  BarChart2,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  Info,
  Maximize2,
  Car,
  Bus,
} from 'lucide-react';
import silkBoardImg from '../assets/images/bangalore_silkboard_traffic_1791444670006.jpg';
import orrImg from '../assets/images/bangalore_orr_marathahalli_1791444688564.jpg';
import indiranagarImg from '../assets/images/bangalore_indiranagar_signal_1791444714154.jpg';
import { IntersectionMetrics } from '../types/traffic';

interface SnapshotEvaluationResult {
  junctionName: string;
  totalVehicles: number;
  totalPCU: number;
  vehicleBreakdown: {
    autoRickshaws: number;
    twoWheelers: number;
    cars: number;
    buses: number;
    trucks: number;
    ambulances: number;
  };
  detections: Array<{
    label: string;
    type: 'auto_rickshaw' | 'two_wheeler' | 'bus' | 'car' | 'truck' | 'ambulance';
    confidence: number;
    box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  }>;
  signalAllocation: {
    recommendedGreenTime: number;
    isEmergencyPreemption: boolean;
    priorityPhase: string;
    yellowTransition: number;
    allRedClearance: number;
    websterCycleOptimal: number;
  };
  trafficMetrics: {
    congestionIndex: number;
    levelOfService: string;
    queueLengthMeters: number;
    dischargeRatePCUPerMin: number;
  };
  tacticalRationale: string;
}

interface BangaloreSnapshotEvaluatorProps {
  onApplySignalAllocation?: (timing: {
    greenTime: number;
    isEmergency: boolean;
    queueCount: number;
    junctionName: string;
  }) => void;
}

export const BangaloreSnapshotEvaluator: React.FC<BangaloreSnapshotEvaluatorProps> = ({
  onApplySignalAllocation,
}) => {
  const presetJunctions = [
    {
      id: 'silk_board',
      name: 'Silk Board Junction (Hosur Road / ORR)',
      tag: 'Iconic Bottleneck',
      description: 'Dense Bengaluru rush hour queue featuring auto-rickshaws, BMTC transit buses, two-wheelers, and cabs waiting at the flyover underpass.',
      src: silkBoardImg,
    },
    {
      id: 'orr_marathahalli',
      name: 'Outer Ring Road (ORR) - Marathahalli',
      tag: 'IT Tech Corridor',
      description: 'Heavy corporate commuter traffic with high two-wheeler saturation and BMTC Volvo electric buses queuing at the tech park signal.',
      src: orrImg,
    },
    {
      id: 'indiranagar_signal',
      name: 'Indiranagar 100ft Road (Emergency Priority)',
      tag: 'Ambulance Preemption',
      description: 'Active Bengaluru street scene with an emergency ambulance navigating through auto-rickshaws and bikes, requiring immediate green wave.',
      src: indiranagarImg,
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string>('silk_board');
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(silkBoardImg);
  const [currentJunctionName, setCurrentJunctionName] = useState<string>(
    'Silk Board Junction (Hosur Road / ORR)'
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<SnapshotEvaluationResult | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Evaluate the current snapshot
  const evaluateCurrentSnapshot = async (srcToUse = currentImageSrc, nameToUse = currentJunctionName) => {
    setIsEvaluating(true);
    setAppliedFeedback(false);

    try {
      let base64 = srcToUse;
      if (!srcToUse.startsWith('data:')) {
        base64 = await imageUrlToBase64(srcToUse);
      }

      const res = await fetch('/api/gemini/evaluate-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          junctionName: nameToUse,
        }),
      });

      const data = await res.json();
      setEvaluationResult(data);
    } catch (err) {
      console.error('Snapshot evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: typeof presetJunctions[0]) => {
    setSelectedPreset(preset.id);
    setCurrentImageSrc(preset.src);
    setCurrentJunctionName(preset.name);
    evaluateCurrentSnapshot(preset.src, preset.name);
  };

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentImageSrc(result);
        setSelectedPreset('custom');
        const customName = `Uploaded Snapshot: ${file.name.slice(0, 24)}`;
        setCurrentJunctionName(customName);
        evaluateCurrentSnapshot(result, customName);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run initial evaluation on load
  useEffect(() => {
    evaluateCurrentSnapshot(silkBoardImg, 'Silk Board Junction (Hosur Road / ORR)');
  }, []);

  // Draw bounding boxes on canvas overlay when image loads or evaluation updates
  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img || !evaluationResult || !showBoundingBoxes) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas dimensions to displayed image
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detections = evaluationResult.detections || [];

    detections.forEach((det) => {
      if (selectedFilter !== 'all' && det.type !== selectedFilter) return;

      const [ymin, xmin, ymax, xmax] = det.box_2d;
      const x = (xmin / 1000) * canvas.width;
      const y = (ymin / 1000) * canvas.height;
      const w = ((xmax - xmin) / 1000) * canvas.width;
      const h = ((ymax - ymin) / 1000) * canvas.height;

      // Color coding for Bangalore traffic classifications
      let boxColor = '#38bdf8'; // Blue for car
      let badgeColor = 'rgba(2, 132, 199, 0.9)';

      if (det.type === 'auto_rickshaw') {
        boxColor = '#eab308'; // Yellow for auto-rickshaw
        badgeColor = 'rgba(234, 179, 8, 0.9)';
      } else if (det.type === 'two_wheeler') {
        boxColor = '#06b6d4'; // Cyan for bike/scooter
        badgeColor = 'rgba(6, 182, 212, 0.9)';
      } else if (det.type === 'bus') {
        boxColor = '#10b981'; // Green for BMTC bus
        badgeColor = 'rgba(16, 185, 129, 0.9)';
      } else if (det.type === 'ambulance') {
        boxColor = '#ef4444'; // Flashing Red for ambulance
        badgeColor = 'rgba(239, 68, 68, 0.95)';
      }

      // Draw box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = det.type === 'ambulance' ? 3 : 2;
      ctx.strokeRect(x, y, w, h);

      // Label background
      ctx.fillStyle = badgeColor;
      const labelText = `${det.label} ${Math.round(det.confidence * 100)}%`;
      ctx.font = 'bold 10px JetBrains Mono';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(x, Math.max(0, y - 16), textWidth + 8, 16);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x + 4, Math.max(12, y - 4));
    });
  }, [evaluationResult, showBoundingBoxes, selectedFilter]);

  // Apply allocated signal timing to live simulation
  const handleApplyToSimulation = () => {
    if (!evaluationResult) return;
    if (onApplySignalAllocation) {
      onApplySignalAllocation({
        greenTime: evaluationResult.signalAllocation.recommendedGreenTime,
        isEmergency: evaluationResult.signalAllocation.isEmergencyPreemption,
        queueCount: evaluationResult.totalVehicles,
        junctionName: currentJunctionName,
      });
    }
    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BENGALURU ADAPTIVE TRAFFIC MANAGEMENT ENGINE (BTP SPECIFICATION)</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>Real Bangalore Traffic Snapshot Evaluator & Signal Allocator</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Upload any snapshot or pick authentic Bengaluru junction imagery (Silk Board, Marathahalli ORR, Indiranagar). The deep learning vision model detects mixed Indian vehicles (Auto-rickshaws, BMTC buses, 2-wheelers, cabs, ambulances), computes IRC Passenger Car Units (PCU), and dynamically allocates optimal green signal time.
          </p>
        </div>

        {/* Upload Custom Snapshot Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Your Own Snapshot
          </button>
        </div>
      </div>

      {/* Preset Bangalore Junctions Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            Select Bangalore Junction Snapshot Preset
          </h3>
          <span className="text-xs font-mono text-slate-400">High-Resolution Ground Truth Photos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {presetJunctions.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500/80 bg-slate-900 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={preset.src}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-full shadow">
                    {preset.tag}
                  </span>
                  {isSelected && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded shadow">
                      ACTIVE SNAPSHOT
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Evaluator Studio: Image Viewport + Signal Allocation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Snapshot Viewport with Live Bounding Boxes (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
          <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{currentJunctionName}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Visual Deep Learning Inference Viewport
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition flex items-center gap-1 ${
                  showBoundingBoxes
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Eye className="w-3 h-3" />
                Boxes {showBoundingBoxes ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => evaluateCurrentSnapshot()}
                disabled={isEvaluating}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isEvaluating ? 'animate-spin text-cyan-400' : ''}`} />
                Re-scan
              </button>
            </div>
          </div>

          {/* Interactive Image Container */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img
              ref={imageElementRef}
              src={currentImageSrc}
              alt="Bangalore Traffic Snapshot"
              onLoad={() => {
                // Trigger re-render of canvas bounding boxes
                if (evaluationResult) {
                  setEvaluationResult({ ...evaluationResult });
                }
              }}
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasOverlayRef}
              className="absolute inset-0 pointer-events-none w-full h-full"
            />

            {/* Loading Overlay */}
            {isEvaluating && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-cyan-300">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                <div className="text-center font-mono text-xs">
                  <p className="font-bold text-white text-sm">Evaluating Bangalore Snapshot...</p>
                  <p className="text-slate-400 mt-1">Classifying auto-rickshaws, BMTC buses, and computing PCU demand...</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Filter Tabs & Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400">Filter:</span>
              {[
                { id: 'all', label: 'All Vehicles' },
                { id: 'auto_rickshaw', label: '🛺 Auto-Rickshaws' },
                { id: 'bus', label: '🚌 BMTC Buses' },
                { id: 'two_wheeler', label: '🛵 2-Wheelers' },
                { id: 'car', label: '🚗 Cars/Cabs' },
                { id: 'ambulance', label: '🚨 Ambulance' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-2 py-0.5 rounded-md border transition ${
                    selectedFilter === f.id
                      ? 'bg-cyan-600 text-white border-cyan-500 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-yellow-400" /> Auto
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-400" /> Bus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-cyan-400" /> Bike
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-blue-400" /> Car
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500" /> Ambulance
              </span>
            </div>
          </div>
        </div>

        {/* Right: Evaluated Signal Allocation & Technical Results (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {evaluationResult ? (
            <>
              {/* Signal Timing Allocation Result Card */}
              <div
                className={`border rounded-2xl p-4 shadow-xl flex flex-col justify-between ${
                  evaluationResult.signalAllocation.isEmergencyPreemption
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ALLOCATED SIGNAL TIMING
                    </span>
                    {evaluationResult.signalAllocation.isEmergencyPreemption ? (
                      <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <Siren className="w-3 h-3" /> EMERGENCY CORRIDOR OVERRIDE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                        ADAPTIVE SPLIT READY
                      </span>
                    )}
                  </div>

                  {/* Big Recommended Green Time */}
                  <div className="flex items-baseline gap-2 my-2">
                    <span
                      className={`text-4xl font-black font-mono ${
                        evaluationResult.signalAllocation.isEmergencyPreemption
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {evaluationResult.signalAllocation.recommendedGreenTime}s
                    </span>
                    <span className="text-sm font-semibold text-slate-300">
                      Recommended Green Duration
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mb-3">
                    Priority Phase: <strong className="text-cyan-300">{evaluationResult.signalAllocation.priorityPhase}</strong>
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Yellow</span>
                      <strong className="text-amber-400">{evaluationResult.signalAllocation.yellowTransition}s</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">All-Red</span>
                      <strong className="text-rose-400">{evaluationResult.signalAllocation.allRedClearance}s</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Webster Cycle</span>
                      <strong className="text-cyan-400">{evaluationResult.signalAllocation.websterCycleOptimal}s</strong>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div>
                  <button
                    onClick={handleApplyToSimulation}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition shadow-lg ${
                      appliedFeedback
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    }`}
                  >
                    {appliedFeedback ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Allocated Timing Applied to Live Controller!
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Apply Timing to Live Intersection Controller
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-500 text-center block mt-1 font-mono">
                    Directly updates the 4-way intersection simulation and queues with this Bangalore count.
                  </span>
                </div>
              </div>

              {/* Vehicle Counts & IRC PCU Demand Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Vehicle Composition (IRC: 106-1990)
                  </h4>
                  <span className="text-emerald-400 font-bold">
                    {evaluationResult.totalPCU} Total PCU
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🛺 Autos (1.0 PCU)</span>
                    <strong className="text-yellow-400 text-sm">{evaluationResult.vehicleBreakdown.autoRickshaws}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🛵 2-Wheelers (0.5)</span>
                    <strong className="text-cyan-400 text-sm">{evaluationResult.vehicleBreakdown.twoWheelers}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🚌 BMTC Buses (3.0)</span>
                    <strong className="text-emerald-400 text-sm">{evaluationResult.vehicleBreakdown.buses}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🚗 Cars/Cabs (1.0)</span>
                    <strong className="text-blue-400 text-sm">{evaluationResult.vehicleBreakdown.cars}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🚛 Trucks (3.0)</span>
                    <strong className="text-orange-400 text-sm">{evaluationResult.vehicleBreakdown.trucks}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">🚨 Ambulances</span>
                    <strong className={evaluationResult.vehicleBreakdown.ambulances > 0 ? 'text-rose-400 text-sm' : 'text-slate-500 text-sm'}>
                      {evaluationResult.vehicleBreakdown.ambulances}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                  <span>Total Physical Vehicles: <b className="text-white">{evaluationResult.totalVehicles}</b></span>
                  <span>Est. Queue Length: <b className="text-cyan-300">{evaluationResult.trafficMetrics.queueLengthMeters}m</b></span>
                </div>
              </div>

              {/* Tactical Rationale */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                  AI SIGNAL CONTROLLER TACTICAL RATIONALE
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluationResult.tacticalRationale}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-cyan-400 animate-spin" />
              Scanning snapshot telemetry...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
