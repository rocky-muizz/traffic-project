import React, { useState, useMemo } from 'react';
import {
  generateCorridor24HourData,
  generateWeeklyHeatmap,
  calculateWebstersCycle,
  generateTrafficCSV,
  CORRIDORS,
  CorridorId,
  ExtendedHourlyData,
  getLevelOfService,
} from '../utils/trafficAnalytics';
import {
  BarChart,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  AlertTriangle,
  Calculator,
  Layers,
  Sparkles,
  Info,
  Sliders,
  CheckCircle,
  CloudRain,
  Sun,
  Cone,
  Car,
  Zap,
  Gauge,
  Activity,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const HistoricalAnalytics: React.FC = () => {
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorId>('silk_board');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'delay' | 'speed' | 'spillback'>('volume');
  const [selectedHour, setSelectedHour] = useState<number>(17); // 5:00 PM default peak
  const [forecastScenario, setForecastScenario] = useState<'clear' | 'monsoon' | 'metro_work' | 'friday_rush'>('clear');

  // Webster parameters
  const [lostTime, setLostTime] = useState<number>(16);
  const [saturationY, setSaturationY] = useState<number>(0.74);

  // Corridor data
  const currentCorridor = CORRIDORS.find((c) => c.id === selectedCorridor) || CORRIDORS[0];
  const rawHourlyData = useMemo(() => generateCorridor24HourData(selectedCorridor), [selectedCorridor]);
  const weeklyCells = useMemo(() => generateWeeklyHeatmap(selectedCorridor), [selectedCorridor]);

  // Apply scenario multiplier for predictive forecasting
  const hourlyData: ExtendedHourlyData[] = useMemo(() => {
    let multiplier = 1.0;
    if (forecastScenario === 'monsoon') multiplier = 1.28;
    else if (forecastScenario === 'metro_work') multiplier = 1.38;
    else if (forecastScenario === 'friday_rush') multiplier = 1.22;

    return rawHourlyData.map((d) => ({
      ...d,
      predictedVolumeTomorrow: Math.round(d.predictedVolumeTomorrow * multiplier),
    }));
  }, [rawHourlyData, forecastScenario]);

  const selectedData = hourlyData.find((h) => h.hour === selectedHour) || hourlyData[17];
  const webstersCycle = calculateWebstersCycle(lostTime, saturationY);

  // Peak metrics calculation
  const amPeakData = hourlyData.find((h) => h.hour === 8) || hourlyData[8];
  const pmPeakData = hourlyData.find((h) => h.hour === 17) || hourlyData[17];
  const middayData = hourlyData.find((h) => h.hour === 12) || hourlyData[12];

  // CSV Export
  const handleDownloadCSV = () => {
    const csvContent = generateTrafficCSV(hourlyData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historical_Peak_Analytics_${selectedCorridor}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Corridor Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>URBAN TRANSPORTATION SYSTEMS • DIURNAL PEAK HOURS ANALYTICS</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <span>Historical Peak Hours Analytics & Time-Series Forecasting</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Quantitative analysis of multi-modal traffic accumulation, Peak Hour Factor (PHF), recurrent bottleneck apex windows, and automated signal retiming schedules calibrated for Bengaluru arterial corridors.
          </p>
        </div>

        {/* Actions: Corridor Switcher & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value as CorridorId)}
            className="bg-slate-950 border border-slate-700 text-cyan-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono cursor-pointer shadow"
          >
            {CORRIDORS.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-semibold border border-slate-700 shadow transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Telemetry (.CSV)
          </button>
        </div>
      </div>

      {/* 3 Executive Peak Window Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AM Peak Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              MORNING PEAK WINDOW (AM)
            </span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
              07:30 - 09:30 AM
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{amPeakData.volumeVehicles}</span>
              <span className="text-xs text-slate-400">veh/hr ({amPeakData.pcuVolume} PCU)</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-300">
              <span>Avg Speed: <strong className="text-amber-400">{amPeakData.avgSpeedKmh} km/h</strong></span>
              <span>PHF: <strong className="text-cyan-400">{amPeakData.peakHourFactor}</strong></span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">AI Delay Saving:</span>
            <span className="text-emerald-400 font-bold">
              {amPeakData.avgDelayAI}s vs {amPeakData.avgDelayFixed}s (-71%)
            </span>
          </div>
        </div>

        {/* Midday Lunch Surge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              MIDDAY COMMERCIAL SURGE
            </span>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
              12:00 - 01:30 PM
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{middayData.volumeVehicles}</span>
              <span className="text-xs text-slate-400">veh/hr ({middayData.pcuVolume} PCU)</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-300">
              <span>Avg Speed: <strong className="text-amber-400">{middayData.avgSpeedKmh} km/h</strong></span>
              <span>PHF: <strong className="text-cyan-400">{middayData.peakHourFactor}</strong></span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Primary Flow:</span>
            <span className="text-amber-300 font-bold">Commercial & Delivery Platoons</span>
          </div>
        </div>

        {/* PM Peak Apex Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-rose-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              EVENING PEAK APEX (PM)
            </span>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
              17:00 - 19:30 PM
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-rose-400">{pmPeakData.volumeVehicles}</span>
              <span className="text-xs text-slate-400">veh/hr ({pmPeakData.pcuVolume} PCU)</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-300">
              <span>Gridlock Speed: <strong className="text-rose-400">{pmPeakData.avgSpeedKmh} km/h</strong></span>
              <span>Spillback: <strong className="text-rose-400">{pmPeakData.queueSpillbackRiskPct}%</strong></span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Bottleneck Rating:</span>
            <span className="text-rose-400 font-bold">CRITICAL HCM BREAKDOWN</span>
          </div>
        </div>
      </div>

      {/* Main 24-Hour Diurnal Telemetry Curve with Interactive Metric Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              24-Hour Inbound Telemetry Profile ({currentCorridor.name})
            </h3>
            <span className="text-xs text-slate-400">
              Click any hourly column below to inspect detailed vehicle mix, delay breakdown, and Webster's retiming
            </span>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'volume', label: 'Inbound Flow (veh/hr)' },
              { id: 'delay', label: 'Control Delay Comparison' },
              { id: 'speed', label: 'Speed Profile (km/h)' },
              { id: 'spillback', label: 'Spillback Risk (%)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedMetric === m.id
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 24-Hour Interactive Bar & Wave Visualization */}
        <div className="h-64 flex items-end gap-1.5 pt-6 pb-2 px-1 overflow-x-auto">
          {hourlyData.map((d) => {
            const isSelected = d.hour === selectedHour;

            // Height calculation according to selected metric
            let heightPct = 10;
            let barValueLabel = '';
            let barColor = 'bg-cyan-600/70';

            if (selectedMetric === 'volume') {
              const maxVol = 4000;
              heightPct = Math.round((d.volumeVehicles / maxVol) * 100);
              barValueLabel = `${d.volumeVehicles}`;
              barColor = d.isPeak
                ? isSelected
                  ? 'bg-rose-400 shadow-lg shadow-rose-900/50'
                  : 'bg-rose-600/80 hover:bg-rose-500'
                : isSelected
                ? 'bg-cyan-400 shadow-lg shadow-cyan-900/50'
                : 'bg-cyan-700/70 hover:bg-cyan-600';
            } else if (selectedMetric === 'delay') {
              heightPct = Math.min(100, Math.round((d.avgDelayFixed / 100) * 100));
              barValueLabel = `${d.avgDelayFixed}s`;
              barColor = isSelected ? 'bg-amber-400' : 'bg-amber-600/80 hover:bg-amber-500';
            } else if (selectedMetric === 'speed') {
              heightPct = Math.min(100, Math.round((d.avgSpeedKmh / 55) * 100));
              barValueLabel = `${d.avgSpeedKmh}k`;
              barColor = d.avgSpeedKmh < 15 ? 'bg-rose-600' : d.avgSpeedKmh < 30 ? 'bg-amber-500' : 'bg-emerald-500';
            } else if (selectedMetric === 'spillback') {
              heightPct = Math.max(8, d.queueSpillbackRiskPct);
              barValueLabel = `${d.queueSpillbackRiskPct}%`;
              barColor = d.queueSpillbackRiskPct > 70 ? 'bg-rose-600' : d.queueSpillbackRiskPct > 30 ? 'bg-amber-500' : 'bg-teal-600';
            }

            return (
              <div
                key={d.hour}
                onClick={() => setSelectedHour(d.hour)}
                className={`flex-1 min-w-[32px] flex flex-col items-center cursor-pointer transition-all duration-200 group relative ${
                  isSelected ? 'scale-105' : 'hover:opacity-90'
                }`}
              >
                {/* Floating Peak Badge */}
                {d.isPeak && (
                  <span className="absolute -top-7 text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-1 py-0.5 rounded whitespace-nowrap shadow z-10">
                    PEAK
                  </span>
                )}

                {/* The Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 flex items-end justify-center ${barColor}`}
                  style={{ height: `${Math.max(6, heightPct)}%` }}
                >
                  <span className="text-[9px] font-mono font-bold text-white mb-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {barValueLabel}
                  </span>
                </div>

                {/* Hour label */}
                <span
                  className={`text-[10px] font-mono mt-1.5 transition ${
                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {d.label.split(':')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Hour Deep Dive & Vehicle Composition Panel */}
        <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-cyan-400 font-bold text-sm">
                Slot {selectedData.label} ({selectedData.hour}:00 - {selectedData.hour + 1}:00)
              </span>
              {selectedData.isPeak ? (
                <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  {selectedData.peakLabel}
                </span>
              ) : (
                <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                  Off-Peak Fluid Flow
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span>
                Flow: <strong className="text-white">{selectedData.volumeVehicles} veh/hr</strong> ({selectedData.pcuVolume} PCU)
              </span>
              <span>
                Speed: <strong className={selectedData.avgSpeedKmh < 15 ? 'text-rose-400' : 'text-emerald-400'}>{selectedData.avgSpeedKmh} km/h</strong>
              </span>
              <span>
                PHF: <strong className="text-cyan-400">{selectedData.peakHourFactor}</strong>
              </span>
            </div>
          </div>

          {/* Vehicle Modal Breakdown for this selected hour */}
          <div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
              <span>Traffic Modal Split for this Time Slot (Bangalore Commuter Distribution):</span>
              <span className="text-cyan-400">Total: 100% Volume</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🛵 2-Wheelers</span>
                <strong className="text-cyan-400">{selectedData.modalSplit.twoWheelers}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🛺 Auto-Rickshaws</span>
                <strong className="text-yellow-400">{selectedData.modalSplit.autoRickshaws}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🚗 Cars / Cabs</span>
                <strong className="text-blue-400">{selectedData.modalSplit.cars}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🚌 BMTC Buses</span>
                <strong className="text-emerald-400">{selectedData.modalSplit.buses}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🚛 Freight/LCVs</span>
                <strong className="text-orange-400">{selectedData.modalSplit.commercial}%</strong>
              </div>
            </div>
          </div>

          {/* Timing Comparison for this Hour */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span>
                Legacy Fixed Delay: <strong className="text-amber-400">{selectedData.avgDelayFixed} s/veh</strong>
              </span>
              <span>
                SmartFlow AI Delay: <strong className="text-emerald-400">{selectedData.avgDelayAI} s/veh</strong> (-{Math.round(((selectedData.avgDelayFixed - selectedData.avgDelayAI) / selectedData.avgDelayFixed) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Allocated Green Split:</span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                {selectedData.recommendedGreenSec}s Dynamic (vs 45s fixed)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Learning 24-Hour Peak Forecast Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Machine Learning Next-Day Peak Forecasting & Scenario Stress Simulator
            </h3>
            <span className="text-xs text-slate-400">
              LSTM time-series model forecasting tomorrow's peak intensity under exogenous weather & municipal conditions
            </span>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {[
              { id: 'clear', label: '☀️ Clear Weather', icon: Sun },
              { id: 'monsoon', label: '🌧️ Monsoon Downpour (+28%)', icon: CloudRain },
              { id: 'metro_work', label: '🚧 Metro Construction (+38%)', icon: Cone },
              { id: 'friday_rush', label: '🎆 Friday Surge (+22%)', icon: Flame },
            ].map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => setForecastScenario(sc.id as any)}
                  className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                    forecastScenario === sc.id
                      ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Forecast Output Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono mb-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Predicted Peak Inflow</span>
            <strong className="text-cyan-300 text-base">
              {Math.max(...hourlyData.map((d) => d.predictedVolumeTomorrow))} veh/hr
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Confidence: 94.6%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Apex Bottleneck Period</span>
            <strong className="text-rose-400 text-base">17:15 - 19:45 PM</strong>
            <span className="text-[10px] text-rose-300 block mt-0.5">Extended +24 min duration</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Pre-Emptive Cycle Length</span>
            <strong className="text-emerald-400 text-base">
              {forecastScenario === 'monsoon' ? '112s' : forecastScenario === 'metro_work' ? '124s' : '96s'}
            </strong>
            <span className="text-[10px] text-emerald-300 block mt-0.5">Automated Pre-Timing</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Upstream Spillback Risk</span>
            <strong
              className={`text-base ${
                forecastScenario === 'clear' ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {forecastScenario === 'clear' ? 'High (82%)' : 'Critical (98%)'}
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Flyover Ramp Buffering</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <strong>Autonomous Preventive Strategy:</strong> {forecastScenario === 'monsoon' ? 'Rain sensors detected reduced tire friction and 32% lower acceleration. Controller pre-extends yellow intervals from 4.0s to 5.5s and deploys 58s arterial green platooning.' : forecastScenario === 'metro_work' ? 'Lane bottleneck detected at Silk Board ramp. Controller truncates conflicting pedestrian crosswalk phases to single-stage on-demand and coordinates with upstream HSR Layout signals.' : 'Standard diurnal recurrent rush hour anticipated. Dynamic green extension will flush high-volume BMTC bus queues on Hosur Road.'}
        </p>
      </div>

      {/* 7-Day x 24-Hour Congestion Heatmap Matrix & Webster Formulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weekly Heatmap (8 Columns) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Day-of-Week Hourly Congestion Heatmap (7 Days × 24 Hours)
            </h3>
            <span className="text-xs font-mono text-slate-400">Bangalore Historical Density</span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Dark red cells indicate recurrent traffic breakdown requiring proactive signal intervention:
          </p>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[550px] space-y-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const dayCells = weeklyCells.filter((c) => c.day === day);
                return (
                  <div key={day} className="flex items-center gap-1">
                    <span className="w-8 text-[11px] font-mono text-slate-400 font-semibold">{day}</span>
                    <div className="flex-1 flex gap-1">
                      {dayCells.map((cell) => {
                        let bgClass = 'bg-slate-950';
                        if (cell.density < 25) bgClass = 'bg-emerald-950/40 hover:bg-emerald-800';
                        else if (cell.density < 50) bgClass = 'bg-cyan-950/60 hover:bg-cyan-700';
                        else if (cell.density < 75) bgClass = 'bg-amber-900/70 hover:bg-amber-600';
                        else bgClass = 'bg-rose-900/90 hover:bg-rose-600';

                        return (
                          <div
                            key={`${cell.day}-${cell.hour}`}
                            className={`flex-1 h-6 rounded-sm transition cursor-pointer relative group ${bgClass}`}
                            title={`${day} ${cell.hour}:00 — Density: ${cell.density}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Hour X-Axis footer */}
              <div className="flex items-center gap-1 pt-1">
                <span className="w-8" />
                <div className="flex-1 flex justify-between text-[9px] font-mono text-slate-500">
                  <span>12AM</span>
                  <span>4AM</span>
                  <span>8AM (AM Peak)</span>
                  <span>12PM</span>
                  <span>5PM (PM Peak)</span>
                  <span>9PM</span>
                  <span>11PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400">
            <span>Low (0-25%)</span>
            <span className="w-3 h-2 rounded bg-emerald-950/40" />
            <span className="w-3 h-2 rounded bg-cyan-950/60" />
            <span className="w-3 h-2 rounded bg-amber-900/70" />
            <span className="w-3 h-2 rounded bg-rose-900/90" />
            <span>Severe Gridlock (75-100%)</span>
          </div>
        </div>

        {/* Webster Formulation & Signal Retiming Calculator (4 Columns) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                Webster's Cycle Optimization
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Highway engineering formulation for delay-minimizing cycle length vs continuous AI adaptive control:
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 mb-4 text-center">
              C₀ = (1.5 · L + 5) / (1 - Y)
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Total Lost Time (L):</span>
                  <span className="text-cyan-400 font-bold">{lostTime} sec</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={lostTime}
                  onChange={(e) => setLostTime(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Critical Saturation Ratio (Y):</span>
                  <span className="text-cyan-400 font-bold">{saturationY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.88"
                  step="0.02"
                  value={saturationY}
                  onChange={(e) => setSaturationY(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Webster's Optimal Cycle:</span>
              <strong className="text-emerald-400 text-base">{webstersCycle} Seconds</strong>
            </div>
            <span className="block text-[10px] text-slate-500 font-mono mt-1">
              SmartFlow AI dynamically adapts splits around this baseline with ±18s elastic boundary.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
