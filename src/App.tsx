/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Camera,
  BarChart3,
  TrendingUp,
  FileText,
  GraduationCap,
  Sliders,
  Zap,
  Clock,
  Car,
  Siren,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { BangaloreSnapshotEvaluator } from './components/BangaloreSnapshotEvaluator';
import { IntersectionSimulation } from './components/IntersectionSimulation';
import { CameraFeedsPanel } from './components/CameraFeedsPanel';
import { RealTimeDashboard } from './components/RealTimeDashboard';
import { HistoricalAnalytics } from './components/HistoricalAnalytics';
import { UrbanPlannerReports } from './components/UrbanPlannerReports';
import { FYPArchitecture } from './components/FYPArchitecture';
import {
  IntersectionMetrics,
  FixedComparisonMetrics,
  ScenarioType,
} from './types/traffic';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'bangalore_eval' | 'sim' | 'cameras' | 'dashboard' | 'historical' | 'reports' | 'fyp'
  >('bangalore_eval');

  const [scenario, setScenario] = useState<ScenarioType>('normal');
  const [isAiAdaptive, setIsAiAdaptive] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  // Real-time metrics updated continuously by simulation
  const [metrics, setMetrics] = useState<IntersectionMetrics>({
    avgWaitTime: 14.2,
    totalVehiclesPassed: 284,
    flowRate: 2480,
    congestionIndex: 28,
    levelOfService: 'LOS B',
    co2SavedKg: 46.8,
    fuelSavedLiters: 19.4,
    emergencyDelaySec: 0,
    queueCounts: { north: 8, south: 9, east: 4, west: 3 },
    approachDelays: { north: 14, south: 16, east: 12, west: 11 },
    pedestriansWaiting: 3,
  });

  // Fixed controller comparison metrics
  const fixedComparison: FixedComparisonMetrics = {
    fixedWaitTime: 38.6,
    fixedCongestionIndex: 76,
    fixedLevelOfService: 'LOS D/E',
    fixedCo2WastedKg: 128.4,
    fixedTotalCleared: 196,
  };

  const handleApplySnapshotAllocation = (timing: {
    greenTime: number;
    isEmergency: boolean;
    queueCount: number;
    junctionName: string;
  }) => {
    // Update queues & scenarios in the simulation based on snapshot evaluation
    if (timing.isEmergency) {
      setScenario('ambulance_run');
    }

    setMetrics((prev) => ({
      ...prev,
      queueCounts: {
        north: Math.max(2, Math.round(timing.queueCount * 0.45)),
        south: Math.max(2, Math.round(timing.queueCount * 0.35)),
        east: prev.queueCounts.east,
        west: prev.queueCounts.west,
      },
      congestionIndex: timing.isEmergency ? 85 : Math.min(95, timing.queueCount * 3),
      avgWaitTime: Number((timing.greenTime * 0.35).toFixed(1)),
    }));

    setAppliedBanner(
      `Applied ${timing.greenTime}s Green Split & ${timing.queueCount} vehicles from "${timing.junctionName}" to Live Intersection Controller!`
    );
    setTimeout(() => setAppliedBanner(null), 5000);

    // Switch to simulation tab so user sees it in action
    setActiveTab('sim');
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Operations Center Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-lg px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>SmartFlow</span>
                  <span className="text-cyan-400">AI</span>
                </h1>
                <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  FYP EDITION
                </span>
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Autonomous Adaptive Traffic Signal Control System • Computer Vision & DQN
              </p>
            </div>
          </div>

          {/* Real-time System Status Badges */}
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Edge AI: <strong className="text-emerald-400">30.2 FPS</strong></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            {/* Quick Scenario Selector */}
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as ScenarioType)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="normal">Scenario: Balanced Flow</option>
              <option value="am_rush">Scenario: AM Peak Surge (N/S)</option>
              <option value="ambulance_run">Scenario: Ambulance Priority Run</option>
              <option value="gridlock_test">Scenario: Multi-Leg Gridlock</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {[
            { id: 'bangalore_eval', label: '📸 Bangalore Snapshot Evaluator', icon: Camera },
            { id: 'sim', label: 'Live Intersection Simulation', icon: Activity },
            { id: 'cameras', label: 'Computer Vision Cameras', icon: Layers },
            { id: 'dashboard', label: 'Real-Time Operations Dashboard', icon: BarChart3 },
            { id: 'historical', label: 'Historical & Peak Hour Analytics', icon: TrendingUp },
            { id: 'reports', label: 'Urban Planning Reports (AI)', icon: FileText },
            { id: 'fyp', label: 'FYP Architecture & Viva Kit', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Applied Banner Toast if signal allocation was applied from snapshot */}
      {appliedBanner && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2.5 text-center text-xs font-mono text-emerald-300 flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{appliedBanner}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'bangalore_eval' && (
          <BangaloreSnapshotEvaluator onApplySignalAllocation={handleApplySnapshotAllocation} />
        )}

        {activeTab === 'sim' && (
          <IntersectionSimulation
            scenario={scenario}
            isAiAdaptive={isAiAdaptive}
            onScenarioChange={setScenario}
            onToggleAi={setIsAiAdaptive}
            metrics={metrics}
            onMetricsUpdate={setMetrics}
            fixedComparison={fixedComparison}
          />
        )}

        {activeTab === 'cameras' && (
          <CameraFeedsPanel queueCounts={metrics.queueCounts} />
        )}

        {activeTab === 'dashboard' && (
          <RealTimeDashboard
            metrics={metrics}
            fixedComparison={fixedComparison}
            isAiAdaptive={isAiAdaptive}
            onToggleAi={setIsAiAdaptive}
          />
        )}

        {activeTab === 'historical' && <HistoricalAnalytics />}

        {activeTab === 'reports' && (
          <UrbanPlannerReports
            metrics={metrics}
            fixedComparison={fixedComparison}
            scenario={scenario}
          />
        )}

        {activeTab === 'fyp' && <FYPArchitecture />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            SmartFlow AI • Final Year Project on Smart Traffic Signal Using AI & Deep Learning
          </span>
          <span>
            Standards: Highway Capacity Manual (HCM 2020) • NEMA TS-2 • Edge AI
          </span>
        </div>
      </footer>
    </div>
  );
}
