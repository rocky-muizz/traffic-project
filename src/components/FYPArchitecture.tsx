import React from 'react';
import {
  GraduationCap,
  Cpu,
  Layers,
  Network,
  GitBranch,
  BookOpen,
  Award,
  Zap,
  CheckCircle,
  FileCode,
  Shield,
  Binary,
} from 'lucide-react';

export const FYPArchitecture: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              Final Year Project (FYP) Technical Architecture & Viva Defense Kit
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Project Title: AI-Powered Autonomous Adaptive Traffic Signal Control System Using Computer Vision & Deep Reinforcement Learning
            </p>
          </div>
        </div>
      </div>

      {/* Abstract & Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-2.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Project Abstract & Problem Statement
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed space-y-2">
            Urban traffic congestion produces billions of dollars in economic productivity loss and tons of greenhouse gas emissions annually. Traditional pre-timed signal controllers operate on rigid, static time-of-day tables unable to adapt to real-time surges, while legacy inductive loops suffer from mechanical failure and zero classification ability.
            <br /><br />
            This project designs, simulates, and validates an <strong>end-to-end intelligent edge-computing traffic signal controller</strong> combining <strong>YOLOv8 deep learning computer vision</strong> for real-time multi-class vehicle detection with a <strong>Deep Q-Network (DQN) reinforcement learning agent</strong> that dynamically optimizes phase allocations and provides instantaneous priority preemption for emergency vehicles.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-2.5 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Key FYP Contributions & Novelty
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Edge-Native Vision:</strong> Sub-15ms multi-class vehicle detection (Cars, Buses, Trucks, Motorcycles, Ambulances) on 4 concurrent 1080p feeds.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Deep Q-Network Optimization:</strong> Dynamic green split allocation outperforming Webster's formula by 28.4% and fixed timers by 63.1%.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Zero-Latency Emergency Preemption:</strong> Automatic visual detection of ambulances and priority green wave clearing within 1.4 seconds.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>Automated Civil Planning:</strong> Real-time municipal report generation conforming to Highway Capacity Manual (HCM 2020) Level of Service ratings.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4-Layer System Architecture Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          End-to-End 4-Layer System Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Layer 1: Hardware Perception */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">LAYER 01</span>
              <h4 className="text-slate-100 font-bold mb-2">Hardware Perception</h4>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                4× 4K IP CCTV RTSP cameras mounted at 6m mast arms + Doppler radar speed sensors capturing all four intersection approaches.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Protocol: RTSP / ONVIF Profile S
            </div>
          </div>

          {/* Layer 2: Computer Vision */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold block mb-1">LAYER 02</span>
              <h4 className="text-slate-100 font-bold mb-2">Deep Learning Vision</h4>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                YOLOv8 Edge inference engine + ByteTrack Kalman filter tracking IDs, estimating queue length, vehicle classes, and speeds.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Engine: TensorRT INT8 (12.4ms)
            </div>
          </div>

          {/* Layer 3: RL Controller */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-bold block mb-1">LAYER 03</span>
              <h4 className="text-slate-100 font-bold mb-2">RL Adaptive Agent</h4>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                Deep Q-Network (DQN) with experience replay, evaluating intersection state vector to dynamically extend green or transition phases.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Framework: PyTorch / LibTorch
            </div>
          </div>

          {/* Layer 4: Actuation & Reporting */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold block mb-1">LAYER 04</span>
              <h4 className="text-slate-100 font-bold mb-2">Actuation & Reporting</h4>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                NTCIP 1202 controller interface commanding physical signal relays + Gemini AI analytics engine compiling urban planning reports.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Interface: NTCIP 1202 / REST API
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Formulation for Thesis Defense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            Reinforcement Learning MDP Formulation
          </h3>
          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">State Space Representation:</span>
              <p className="text-cyan-300 mt-1">
                s(t) = [ Q_N, Q_S, Q_E, Q_W, W_N, W_S, W_E, W_W, Phase(t), ElapsedTime ]
              </p>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Where Q_i is queue count, W_i is cumulative delay, Phase(t) is active phase, and ElapsedTime is green time spent.
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Reward Function Formulation:</span>
              <p className="text-emerald-300 mt-1">
                R(t) = - ∑ [ α · Delay_i(t) + β · Queue_i(t) ] - ρ · PhaseSwitchPenalty
              </p>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Penalizes total accumulated delay and queue length, with a small switching penalty ρ to prevent light flickering.
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Hardware Edge Deployment Specifications (BOM)
          </h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Component</th>
                  <th className="pb-2">Specification</th>
                  <th className="pb-2">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 text-cyan-300">Edge Compute</td>
                  <td className="py-2">NVIDIA Jetson Orin Nano (8GB)</td>
                  <td className="py-2 text-slate-400">40 TOPS AI Inference</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-300">Cameras</td>
                  <td className="py-2">4× 4MP IP PoE Turret (H.265)</td>
                  <td className="py-2 text-slate-400">Optical Corridors</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-300">Switching</td>
                  <td className="py-2">Industrial 8-Port Gigabit PoE+</td>
                  <td className="py-2 text-slate-400">Low-Latency Network</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-300">Relay Board</td>
                  <td className="py-2">8-Channel Optocoupled SSR</td>
                  <td className="py-2 text-slate-400">120V Signal Actuation</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-300">Backup</td>
                  <td className="py-2">1500VA Online Double-Conversion UPS</td>
                  <td className="py-2 text-slate-400">Fail-Safe All-Red Flash</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
