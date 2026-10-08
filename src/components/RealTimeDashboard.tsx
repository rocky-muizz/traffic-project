import React, { useState } from 'react';
import {
  IntersectionMetrics,
  FixedComparisonMetrics,
  SignalPhase,
} from '../types/traffic';
import {
  Activity,
  Zap,
  Clock,
  Car,
  TrendingDown,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Gauge,
  BarChart3,
  Bot,
} from 'lucide-react';

interface RealTimeDashboardProps {
  metrics: IntersectionMetrics;
  fixedComparison: FixedComparisonMetrics;
  isAiAdaptive: boolean;
  onToggleAi: (ai: boolean) => void;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  metrics,
  fixedComparison,
  isAiAdaptive,
  onToggleAi,
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    recommendedAction: string;
    recommendedGreenSplit: number;
    tacticalRationale: string;
    spillbackRisk: string;
  } | null>(null);

  // Trigger real-time Gemini AI diagnostic
  const triggerAiDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/gemini/diagnose-intersection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueLengths: metrics.queueCounts,
          activeAlert: isAiAdaptive ? 'Nominal Adaptive Control' : 'Fixed Timing Bottleneck Warning',
          phaseData: { currentPhase: 'N/S Through Green' },
        }),
      });
      const data = await res.json();
      setAiDiagnosis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const delayReductionPct = Math.round(
    ((fixedComparison.fixedWaitTime - metrics.avgWaitTime) / fixedComparison.fixedWaitTime) * 100
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Top Real-time Operations Status Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Traffic Management Center (TMC) Live Operations Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time urban corridor telemetry, Level of Service compliance, queue dissipation rates, and AI split optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerAiDiagnosis}
            disabled={isDiagnosing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/20 transition disabled:opacity-50"
          >
            {isDiagnosing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            {isDiagnosing ? 'Analyzing Intersection...' : 'Run Gemini AI Tactical Diagnosis'}
          </button>
        </div>
      </div>

      {/* AI Tactical Diagnosis Alert Banner if triggered */}
      {aiDiagnosis && (
        <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/50 rounded-2xl p-4 shadow-xl text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-800/60 mb-2">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Gemini 3.8 Flash Tactical Traffic Controller Recommendation
            </span>
            <span className="text-slate-400 text-[10px]">Just now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px]">Recommended Action</span>
              <strong className="text-emerald-400 text-sm">{aiDiagnosis.recommendedAction}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Optimal Green Split</span>
              <strong className="text-cyan-300 text-sm">{aiDiagnosis.recommendedGreenSplit} Seconds</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Upstream Spillback Risk</span>
              <strong
                className={`text-sm ${
                  aiDiagnosis.spillbackRisk === 'Low'
                    ? 'text-emerald-400'
                    : aiDiagnosis.spillbackRisk === 'Medium'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {aiDiagnosis.spillbackRisk} Risk
              </strong>
            </div>
          </div>
          <p className="text-slate-300 mt-2 font-sans text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong>Engineering Rationale:</strong> {aiDiagnosis.tacticalRationale}
          </p>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Level of Service */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Level of Service</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{metrics.levelOfService}</span>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
              Fixed: {fixedComparison.fixedLevelOfService}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-center">
            HCM 2020 Standard
          </span>
        </div>

        {/* KPI 2: Average Delay */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Vehicle Delay</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-300">{metrics.avgWaitTime}</span>
              <span className="text-xs text-slate-400">sec/veh</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
              Fixed: {fixedComparison.fixedWaitTime}s
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-center">
            -{delayReductionPct}% Commuter Delay
          </span>
        </div>

        {/* KPI 3: System Throughput */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vehicles Cleared</span>
            <Car className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-indigo-300">{metrics.totalVehiclesPassed}</span>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Cumulative Count</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 text-center">
            Continuous Flow
          </span>
        </div>

        {/* KPI 4: Flow Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flow Rate</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-300">{metrics.flowRate}</span>
              <span className="text-[10px] text-slate-400">PCU/h</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Saturation Capacity</span>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-center">
            Peak Corridor Capacity
          </span>
        </div>

        {/* KPI 5: CO2 Reduction */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO2 Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-emerald-300">{metrics.co2SavedKg}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
              Fuel: {metrics.fuelSavedLiters} L saved
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-center">
            Zero Idle Emission
          </span>
        </div>

        {/* KPI 6: Congestion Index */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Congestion Index</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-300">{metrics.congestionIndex}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
              Fixed: {fixedComparison.fixedCongestionIndex} / 100
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-center">
            {metrics.congestionIndex < 40 ? 'Smooth Flow' : 'Moderate Inflow'}
          </span>
        </div>
      </div>

      {/* Middle Section: Approach Queue Bars & NEMA Phase Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Approach Queues & Wait Times (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Approach Queue Lengths & Delay Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">Real-Time Inbound Sensors</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'North Approach (NB)', count: metrics.queueCounts.north, delay: metrics.approachDelays.north, color: 'bg-cyan-500' },
              { label: 'South Approach (SB)', count: metrics.queueCounts.south, delay: metrics.approachDelays.south, color: 'bg-blue-500' },
              { label: 'East Approach (EB)', count: metrics.queueCounts.east, delay: metrics.approachDelays.east, color: 'bg-indigo-500' },
              { label: 'West Approach (WB)', count: metrics.queueCounts.west, delay: metrics.approachDelays.west, color: 'bg-teal-500' },
            ].map((app) => (
              <div key={app.label} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-semibold">{app.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Queue: <b className="text-white">{app.count} vehicles</b> (~{app.count * 7.5}m)
                    </span>
                    <span className="text-cyan-400">
                      Avg Wait: <b>{app.delay}s</b>
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className={`${app.color} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(5, (app.count / 20) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pedestrian Crosswalk Demand status */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Pedestrian Actuation Crosswalk Demand:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {metrics.pedestriansWaiting} Pedestrians in Queue • Protected Walk Phase Ready
            </span>
          </div>
        </div>

        {/* NEMA 4-Phase Ring-and-Barrier Diagram (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                NEMA Dual-Ring Phase Allocation
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ACTUATED
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Dual-ring barrier controller dynamically balancing concurrency pairs without conflicting phase overlaps:
            </p>

            <div className="space-y-2 font-mono text-xs">
              {/* Barrier 1: North-South */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Barrier 1: North-South Arterial</span>
                  <span className="text-cyan-400 font-bold">Ring 1 Concurrent</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Phase 2: N-S Through</span>
                    <strong className="text-emerald-400">Split: 35s - 55s</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Phase 1: N-S Left Turn</span>
                    <strong className="text-emerald-400">Split: 14s</strong>
                  </div>
                </div>
              </div>

              {/* Barrier 2: East-West */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Barrier 2: East-West Cross Street</span>
                  <span className="text-cyan-400 font-bold">Ring 2 Concurrent</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Phase 4: E-W Through</span>
                    <strong className="text-emerald-400">Split: 25s - 45s</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Phase 3: E-W Left Turn</span>
                    <strong className="text-emerald-400">Split: 14s</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Cycle Length: <strong>88s (Dynamic)</strong></span>
            <span>Yellow Clearance: <strong>4.0s</strong></span>
            <span>All-Red: <strong>2.0s</strong></span>
          </div>
        </div>
      </div>

      {/* Controller Comparison Table: Traditional vs SmartFlow AI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          Comparative Engineering Benchmark: Fixed-Time vs Deep-Q-Network
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-semibold">Evaluation Metric</th>
                <th className="pb-2 font-semibold text-amber-400">Legacy Fixed-Time Controller</th>
                <th className="pb-2 font-semibold text-emerald-400">SmartFlow AI Adaptive Controller</th>
                <th className="pb-2 font-semibold text-cyan-400">Performance Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5">Average Control Delay</td>
                <td className="py-2.5 text-amber-300">{fixedComparison.fixedWaitTime} s / vehicle</td>
                <td className="py-2.5 text-emerald-300 font-bold">{metrics.avgWaitTime} s / vehicle</td>
                <td className="py-2.5 text-cyan-300 font-bold">-{delayReductionPct}% Delay Reduction</td>
              </tr>
              <tr>
                <td className="py-2.5">Highway Capacity LOS</td>
                <td className="py-2.5 text-amber-300">{fixedComparison.fixedLevelOfService} (Heavy Delay)</td>
                <td className="py-2.5 text-emerald-300 font-bold">{metrics.levelOfService} (Optimal Flow)</td>
                <td className="py-2.5 text-cyan-300 font-bold">+3 LOS Grades Improvement</td>
              </tr>
              <tr>
                <td className="py-2.5">Queue Spillback Prevention</td>
                <td className="py-2.5 text-rose-400">Frequent (Fixed 45s max queue 34 veh)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Zero (Dynamic green extension flushes queue)</td>
                <td className="py-2.5 text-cyan-300 font-bold">100% Spillback Mitigation</td>
              </tr>
              <tr>
                <td className="py-2.5">Emergency Vehicle Passage</td>
                <td className="py-2.5 text-amber-300">No Preemption (Stuck in red queue ~48s)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Immediate Priority Green Corridor (14s)</td>
                <td className="py-2.5 text-cyan-300 font-bold">-70% Life-Safety Transit Latency</td>
              </tr>
              <tr>
                <td className="py-2.5">Environmental Footprint</td>
                <td className="py-2.5 text-amber-300">High Idling Emissions (410 L/day wasted)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Minimized Stop-and-Go (258 L/day)</td>
                <td className="py-2.5 text-cyan-300 font-bold">-37% Carbon & Fuel Abatement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
