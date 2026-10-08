import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Direction,
  SignalPhase,
  Vehicle,
  VehicleType,
  TurnType,
  IntersectionMetrics,
  FixedComparisonMetrics,
  ScenarioType,
  SignalColor,
} from '../types/traffic';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Siren,
  Sliders,
  Car,
  ShieldAlert,
  Zap,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface IntersectionSimulationProps {
  scenario: ScenarioType;
  isAiAdaptive: boolean;
  onScenarioChange: (s: ScenarioType) => void;
  onToggleAi: (ai: boolean) => void;
  metrics: IntersectionMetrics;
  onMetricsUpdate: (m: IntersectionMetrics) => void;
  fixedComparison: FixedComparisonMetrics;
}

export const IntersectionSimulation: React.FC<IntersectionSimulationProps> = ({
  scenario,
  isAiAdaptive,
  onScenarioChange,
  onToggleAi,
  metrics,
  onMetricsUpdate,
  fixedComparison,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<SignalPhase>('NS_STRAIGHT');
  const [phaseTimer, setPhaseTimer] = useState<number>(32);
  const [phaseDuration, setPhaseDuration] = useState<number>(35);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [emergencyApproach, setEmergencyApproach] = useState<Direction | null>(null);
  const [showDetectionOverlay, setShowDetectionOverlay] = useState<boolean>(true);
  const [showQueueMetrics, setShowQueueMetrics] = useState<boolean>(true);

  // Vehicles state reference for high-FPS animation loop
  const vehiclesRef = useRef<Vehicle[]>([]);
  const nextVehicleId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(0);
  const phaseTimerRef = useRef<number>(32);
  const phaseDurationRef = useRef<number>(35);
  const currentPhaseRef = useRef<SignalPhase>('NS_STRAIGHT');
  const isAiAdaptiveRef = useRef<boolean>(isAiAdaptive);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const simSpeedRef = useRef<number>(simSpeed);
  const emergencyActiveRef = useRef<boolean>(false);
  const emergencyApproachRef = useRef<Direction | null>(null);
  const metricsRef = useRef<IntersectionMetrics>(metrics);

  useEffect(() => {
    isAiAdaptiveRef.current = isAiAdaptive;
  }, [isAiAdaptive]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    emergencyActiveRef.current = emergencyActive;
    emergencyApproachRef.current = emergencyApproach;
  }, [emergencyActive, emergencyApproach]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Handle Scenario presets
  useEffect(() => {
    if (scenario === 'ambulance_run') {
      spawnEmergencyVehicle('north');
    } else if (scenario === 'am_rush') {
      // Spawn heavy North/South traffic
      for (let i = 0; i < 6; i++) {
        spawnSpecificVehicle('north', 1, 'straight', 'car');
        spawnSpecificVehicle('south', 1, 'straight', 'car');
      }
    } else if (scenario === 'gridlock_test') {
      // Spawn in all approaches
      for (let i = 0; i < 4; i++) {
        spawnSpecificVehicle('north', 1, 'straight', 'car');
        spawnSpecificVehicle('south', 1, 'straight', 'car');
        spawnSpecificVehicle('east', 1, 'straight', 'car');
        spawnSpecificVehicle('west', 1, 'straight', 'car');
      }
    }
  }, [scenario]);

  // Spawn an emergency ambulance
  const spawnEmergencyVehicle = useCallback((approach: Direction = 'north') => {
    const newVehicle: Vehicle = {
      id: `emergency-${Date.now()}`,
      type: 'ambulance',
      approach,
      laneIndex: 1, // center through lane
      turn: 'straight',
      x: approach === 'north' ? 385 : approach === 'south' ? 315 : approach === 'east' ? 700 : 0,
      y: approach === 'north' ? 0 : approach === 'south' ? 700 : approach === 'east' ? 385 : 315,
      targetX: approach === 'north' ? 385 : approach === 'south' ? 315 : approach === 'east' ? 0 : 700,
      targetY: approach === 'north' ? 700 : approach === 'south' ? 0 : approach === 'east' ? 385 : 315,
      speed: 3.2,
      maxSpeed: 4.5,
      acceleration: 0.15,
      length: 36,
      width: 18,
      color: '#ffffff',
      distanceToStopLine: 260,
      isStopped: false,
      waitingTime: 0,
      hasPassedIntersection: false,
      isEmergency: true,
      trackingId: Math.floor(Math.random() * 900) + 100,
    };

    vehiclesRef.current.push(newVehicle);
    setEmergencyActive(true);
    setEmergencyApproach(approach);
    emergencyActiveRef.current = true;
    emergencyApproachRef.current = approach;

    // In AI mode: immediate preemption
    if (isAiAdaptiveRef.current) {
      if (approach === 'north' || approach === 'south') {
        currentPhaseRef.current = 'NS_STRAIGHT';
        setCurrentPhase('NS_STRAIGHT');
        phaseTimerRef.current = 40;
        phaseDurationRef.current = 40;
      } else {
        currentPhaseRef.current = 'EW_STRAIGHT';
        setCurrentPhase('EW_STRAIGHT');
        phaseTimerRef.current = 40;
        phaseDurationRef.current = 40;
      }
    }
  }, []);

  const spawnSpecificVehicle = (
    approach: Direction,
    laneIndex: number,
    turn: TurnType,
    type: VehicleType = 'car'
  ) => {
    const colors = ['#38bdf8', '#fb7185', '#a78bfa', '#34d399', '#facc15', '#94a3b8', '#e2e8f0'];
    const color = type === 'bus' ? '#eab308' : type === 'truck' ? '#f97316' : colors[Math.floor(Math.random() * colors.length)];
    const length = type === 'bus' ? 44 : type === 'truck' ? 42 : type === 'motorcycle' ? 16 : 28;
    const width = type === 'motorcycle' ? 8 : type === 'bus' || type === 'truck' ? 18 : 16;
    const maxSpeed = type === 'motorcycle' ? 3.4 : type === 'bus' ? 2.2 : 2.8;

    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;

    // Center coordinates: 350, 350 on 700x700 canvas
    // Road width: 140px (70px per side, 2 lanes each direction = 35px each lane)
    // Lane 0: inner (left turn)
    // Lane 1: outer (through / right turn)
    if (approach === 'north') {
      startX = laneIndex === 0 ? 368 : 388;
      startY = -30;
      targetX = turn === 'left' ? 730 : turn === 'right' ? -30 : startX;
      targetY = turn === 'straight' ? 730 : 368;
    } else if (approach === 'south') {
      startX = laneIndex === 0 ? 332 : 312;
      startY = 730;
      targetX = turn === 'left' ? -30 : turn === 'right' ? 730 : startX;
      targetY = turn === 'straight' ? -30 : 332;
    } else if (approach === 'east') {
      startX = 730;
      startY = laneIndex === 0 ? 368 : 388;
      targetX = turn === 'straight' ? -30 : 368;
      targetY = turn === 'left' ? -30 : turn === 'right' ? 730 : startY;
    } else if (approach === 'west') {
      startX = -30;
      startY = laneIndex === 0 ? 332 : 312;
      targetX = turn === 'straight' ? 730 : 332;
      targetY = turn === 'left' ? 730 : turn === 'right' ? -30 : startY;
    }

    const v: Vehicle = {
      id: `veh-${nextVehicleId.current++}`,
      type,
      approach,
      laneIndex,
      turn,
      x: startX,
      y: startY,
      targetX,
      targetY,
      speed: 1.5,
      maxSpeed,
      acceleration: 0.1,
      length,
      width,
      color,
      distanceToStopLine: 260,
      isStopped: false,
      waitingTime: 0,
      hasPassedIntersection: false,
      isEmergency: false,
      trackingId: Math.floor(Math.random() * 900) + 100,
    };

    vehiclesRef.current.push(v);
  };

  // Main simulation tick and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlayingRef.current) {
        updateSimulation(dt * simSpeedRef.current);
      }

      drawIntersection(ctx);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Update simulation physics, queues & signal logic
  const updateSimulation = (dt: number) => {
    // 1. Phase timing countdown & switching logic
    phaseTimerRef.current -= dt;
    if (phaseTimerRef.current <= 0) {
      advanceSignalPhase();
    }
    setPhaseTimer(Math.max(0, Math.ceil(phaseTimerRef.current)));

    // 2. Spawn traffic periodically based on scenario
    const now = Date.now();
    let spawnInterval = 1400; // ms
    if (scenario === 'am_rush' || scenario === 'pm_rush') spawnInterval = 750;
    if (scenario === 'gridlock_test') spawnInterval = 500;

    if (now - lastSpawnTime.current > spawnInterval / simSpeedRef.current) {
      lastSpawnTime.current = now;
      spawnRandomVehicle();
    }

    // 3. Update vehicle physics
    const stopLineNorth = 280;
    const stopLineSouth = 420;
    const stopLineEast = 420;
    const stopLineWest = 280;

    const vehicles = vehiclesRef.current;
    let totalWait = 0;
    let stoppedCount = 0;
    const queueMap = { north: 0, south: 0, east: 0, west: 0 };
    const delayMap = { north: 0, south: 0, east: 0, west: 0 };

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];

      // Determine signal for this vehicle's approach and turn
      const signalState = getSignalForVehicle(v, currentPhaseRef.current);

      // Check distance to stop line and leading vehicle in same approach & lane
      let distToStop = 999;
      if (!v.hasPassedIntersection) {
        if (v.approach === 'north') distToStop = stopLineNorth - (v.y + v.length / 2);
        else if (v.approach === 'south') distToStop = (v.y - v.length / 2) - stopLineSouth;
        else if (v.approach === 'east') distToStop = (v.x - v.length / 2) - stopLineEast;
        else if (v.approach === 'west') distToStop = stopLineWest - (v.x + v.length / 2);
      }

      // Find vehicle immediately ahead in the same approach and lane
      let leadingDistance = 999;
      for (let j = 0; j < vehicles.length; j++) {
        if (i === j) continue;
        const other = vehicles[j];
        if (other.approach === v.approach && other.laneIndex === v.laneIndex && !other.hasPassedIntersection) {
          let dist = 999;
          if (v.approach === 'north' && other.y > v.y) dist = other.y - other.length / 2 - (v.y + v.length / 2);
          else if (v.approach === 'south' && other.y < v.y) dist = v.y - v.length / 2 - (other.y + other.length / 2);
          else if (v.approach === 'east' && other.x < v.x) dist = v.x - v.length / 2 - (other.x + other.length / 2);
          else if (v.approach === 'west' && other.x > v.x) dist = other.x - other.length / 2 - (v.x + v.length / 2);

          if (dist > 0 && dist < leadingDistance) {
            leadingDistance = dist;
          }
        }
      }

      // Check if vehicle must stop (red light, yellow light approaching, or vehicle ahead stopped)
      const isRedOrYellow = signalState === 'red' || (signalState === 'yellow' && distToStop > 25);
      const shouldStopAtLight = !v.hasPassedIntersection && isRedOrYellow && distToStop > 0 && distToStop < 45;
      const shouldStopBehindLead = leadingDistance < 18;

      if (shouldStopAtLight || shouldStopBehindLead) {
        // Decelerate
        v.speed = Math.max(0, v.speed - v.acceleration * 2 * simSpeedRef.current);
        v.isStopped = v.speed < 0.1;
      } else {
        // Accelerate
        v.speed = Math.min(v.maxSpeed, v.speed + v.acceleration * simSpeedRef.current);
        v.isStopped = false;
      }

      // Accumulate waiting time
      if (v.isStopped) {
        v.waitingTime += dt;
        stoppedCount++;
        if (!v.hasPassedIntersection) {
          queueMap[v.approach]++;
          delayMap[v.approach] += v.waitingTime;
        }
      }
      totalWait += v.waitingTime;

      // Update position along travel trajectory
      if (!v.hasPassedIntersection) {
        // Move towards stop line
        if (v.approach === 'north') {
          v.y += v.speed;
          if (v.y > stopLineNorth + 10) v.hasPassedIntersection = true;
        } else if (v.approach === 'south') {
          v.y -= v.speed;
          if (v.y < stopLineSouth - 10) v.hasPassedIntersection = true;
        } else if (v.approach === 'east') {
          v.x -= v.speed;
          if (v.x < stopLineEast - 10) v.hasPassedIntersection = true;
        } else if (v.approach === 'west') {
          v.x += v.speed;
          if (v.x > stopLineWest + 10) v.hasPassedIntersection = true;
        }
      } else {
        // Has entered or passed intersection: handle turning or straight trajectory
        if (v.turn === 'straight') {
          if (v.approach === 'north') v.y += v.speed;
          else if (v.approach === 'south') v.y -= v.speed;
          else if (v.approach === 'east') v.x -= v.speed;
          else if (v.approach === 'west') v.x += v.speed;
        } else if (v.turn === 'right') {
          // Sharp right turn
          if (v.approach === 'north') {
            if (v.y < 330) v.y += v.speed;
            else { v.x -= v.speed; v.y = Math.min(332, v.y + 0.2); }
          } else if (v.approach === 'south') {
            if (v.y > 370) v.y -= v.speed;
            else { v.x += v.speed; v.y = Math.max(368, v.y - 0.2); }
          } else if (v.approach === 'east') {
            if (v.x > 370) v.x -= v.speed;
            else { v.y += v.speed; v.x = Math.max(368, v.x - 0.2); }
          } else if (v.approach === 'west') {
            if (v.x < 330) v.x += v.speed;
            else { v.y -= v.speed; v.x = Math.min(332, v.x + 0.2); }
          }
        } else if (v.turn === 'left') {
          // Protected left turn arc
          if (v.approach === 'north') {
            if (v.y < 350) v.y += v.speed;
            else { v.x += v.speed; }
          } else if (v.approach === 'south') {
            if (v.y > 350) v.y -= v.speed;
            else { v.x -= v.speed; }
          } else if (v.approach === 'east') {
            if (v.x > 350) v.x -= v.speed;
            else { v.y -= v.speed; }
          } else if (v.approach === 'west') {
            if (v.x < 350) v.x += v.speed;
            else { v.y += v.speed; }
          }
        }
      }
    }

    // Filter out vehicles that left screen boundary
    const remainingVehicles = vehicles.filter((v) => {
      const isOff = v.x < -60 || v.x > 760 || v.y < -60 || v.y > 760;
      if (isOff && v.isEmergency) {
        setEmergencyActive(false);
        setEmergencyApproach(null);
        emergencyActiveRef.current = false;
        emergencyApproachRef.current = null;
      }
      return !isOff;
    });

    vehiclesRef.current = remainingVehicles;

    // Update real-time metrics periodically
    const passedThisTick = vehicles.length - remainingVehicles.length;
    const currentM = metricsRef.current;
    const avgWait = vehicles.length > 0 ? (totalWait / vehicles.length) : 12;
    const totalPassed = currentM.totalVehiclesPassed + passedThisTick;
    const congIndex = Math.min(99, Math.round((stoppedCount / Math.max(1, vehicles.length)) * 100));

    let losRating: 'LOS A' | 'LOS B' | 'LOS C' | 'LOS D' | 'LOS E' | 'LOS F' = 'LOS B';
    if (avgWait <= 10) losRating = 'LOS A';
    else if (avgWait <= 20) losRating = 'LOS B';
    else if (avgWait <= 35) losRating = 'LOS C';
    else if (avgWait <= 55) losRating = 'LOS D';
    else if (avgWait <= 80) losRating = 'LOS E';
    else losRating = 'LOS F';

    onMetricsUpdate({
      avgWaitTime: Number(avgWait.toFixed(1)),
      totalVehiclesPassed: totalPassed,
      flowRate: Math.round(2100 + Math.random() * 450),
      congestionIndex: congIndex,
      levelOfService: losRating,
      co2SavedKg: Number((currentM.co2SavedKg + passedThisTick * 0.08).toFixed(1)),
      fuelSavedLiters: Number((currentM.fuelSavedLiters + passedThisTick * 0.03).toFixed(1)),
      emergencyDelaySec: emergencyActiveRef.current ? 14.2 : 0,
      queueCounts: queueMap,
      approachDelays: {
        north: queueMap.north > 0 ? Math.round(delayMap.north / queueMap.north) : 0,
        south: queueMap.south > 0 ? Math.round(delayMap.south / queueMap.south) : 0,
        east: queueMap.east > 0 ? Math.round(delayMap.east / queueMap.east) : 0,
        west: queueMap.west > 0 ? Math.round(delayMap.west / queueMap.west) : 0,
      },
      pedestriansWaiting: Math.floor(Math.random() * 6) + 1,
    });
  };

  // Determine signal color for a specific vehicle given current phase
  const getSignalForVehicle = (v: Vehicle, phase: SignalPhase): SignalColor => {
    if (emergencyActiveRef.current && isAiAdaptiveRef.current) {
      if (
        (emergencyApproachRef.current === 'north' || emergencyApproachRef.current === 'south') &&
        (v.approach === 'north' || v.approach === 'south')
      ) {
        return 'green';
      }
      if (
        (emergencyApproachRef.current === 'east' || emergencyApproachRef.current === 'west') &&
        (v.approach === 'east' || v.approach === 'west')
      ) {
        return 'green';
      }
      return 'red';
    }

    if (phase === 'NS_STRAIGHT') {
      if ((v.approach === 'north' || v.approach === 'south') && v.turn !== 'left') return 'green';
      if ((v.approach === 'north' || v.approach === 'south') && v.turn === 'left') return 'yellow';
      return 'red';
    }
    if (phase === 'NS_LEFT') {
      if ((v.approach === 'north' || v.approach === 'south') && v.turn === 'left') return 'green';
      return 'red';
    }
    if (phase === 'EW_STRAIGHT') {
      if ((v.approach === 'east' || v.approach === 'west') && v.turn !== 'left') return 'green';
      if ((v.approach === 'east' || v.approach === 'west') && v.turn === 'left') return 'yellow';
      return 'red';
    }
    if (phase === 'EW_LEFT') {
      if ((v.approach === 'east' || v.approach === 'west') && v.turn === 'left') return 'green';
      return 'red';
    }
    return 'red';
  };

  // Advance to next signal phase (ring-barrier sequencing)
  const advanceSignalPhase = () => {
    let next: SignalPhase = 'NS_STRAIGHT';
    let duration = 30;

    const curr = currentPhaseRef.current;

    // AI Adaptive timing calculation vs Fixed 45s timer
    if (isAiAdaptiveRef.current) {
      // Calculate queue demand
      const qN = vehiclesRef.current.filter((v) => v.approach === 'north' && !v.hasPassedIntersection).length;
      const qS = vehiclesRef.current.filter((v) => v.approach === 'south' && !v.hasPassedIntersection).length;
      const qE = vehiclesRef.current.filter((v) => v.approach === 'east' && !v.hasPassedIntersection).length;
      const qW = vehiclesRef.current.filter((v) => v.approach === 'west' && !v.hasPassedIntersection).length;

      const nsDemand = qN + qS;
      const ewDemand = qE + qW;

      if (curr === 'NS_STRAIGHT') {
        next = 'NS_LEFT';
        duration = 14;
      } else if (curr === 'NS_LEFT') {
        next = 'EW_STRAIGHT';
        // Dynamically scale green based on East-West queue: min 15s, max 60s
        duration = Math.min(55, Math.max(16, 12 + ewDemand * 2.8));
      } else if (curr === 'EW_STRAIGHT') {
        next = 'EW_LEFT';
        duration = 14;
      } else if (curr === 'EW_LEFT') {
        next = 'NS_STRAIGHT';
        // Dynamically scale green based on North-South queue: min 15s, max 60s
        duration = Math.min(55, Math.max(16, 12 + nsDemand * 2.8));
      }
    } else {
      // Fixed-time controller (rigid 45s straight, 15s left)
      if (curr === 'NS_STRAIGHT') {
        next = 'NS_LEFT';
        duration = 15;
      } else if (curr === 'NS_LEFT') {
        next = 'EW_STRAIGHT';
        duration = 45;
      } else if (curr === 'EW_STRAIGHT') {
        next = 'EW_LEFT';
        duration = 15;
      } else if (curr === 'EW_LEFT') {
        next = 'NS_STRAIGHT';
        duration = 45;
      }
    }

    currentPhaseRef.current = next;
    setCurrentPhase(next);
    phaseDurationRef.current = duration;
    phaseTimerRef.current = duration;
    setPhaseDuration(duration);
    setPhaseTimer(duration);
  };

  // Spawn random vehicle according to realistic split
  const spawnRandomVehicle = () => {
    const approaches: Direction[] = ['north', 'south', 'east', 'west'];
    // In AM rush: North/South 70% weighted
    let approach: Direction = approaches[Math.floor(Math.random() * approaches.length)];
    if (scenario === 'am_rush') {
      const r = Math.random();
      approach = r < 0.45 ? 'north' : r < 0.8 ? 'south' : r < 0.9 ? 'east' : 'west';
    } else if (scenario === 'pm_rush') {
      const r = Math.random();
      approach = r < 0.45 ? 'east' : r < 0.8 ? 'west' : r < 0.9 ? 'north' : 'south';
    }

    const laneIndex = Math.random() < 0.35 ? 0 : 1;
    const turn: TurnType = laneIndex === 0 ? 'left' : Math.random() < 0.25 ? 'right' : 'straight';

    // Vehicle type selection
    const randType = Math.random();
    let type: VehicleType = 'car';
    if (randType < 0.08) type = 'bus';
    else if (randType < 0.16) type = 'truck';
    else if (randType < 0.26) type = 'motorcycle';

    spawnSpecificVehicle(approach, laneIndex, turn, type);
  };

  // Draw intersection 2D canvas graphics
  const drawIntersection = (ctx: CanvasRenderingContext2D) => {
    const w = 700;
    const h = 700;

    // Background grass / urban sidewalk
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Urban sidewalk pavement corners
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 280, 280); // NW
    ctx.fillRect(420, 0, 280, 280); // NE
    ctx.fillRect(0, 420, 280, 280); // SW
    ctx.fillRect(420, 420, 280, 280); // SE

    // Curbs & Sidewalk borders
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 280, 280);
    ctx.strokeRect(420, 0, 280, 280);
    ctx.strokeRect(0, 420, 280, 280);
    ctx.strokeRect(420, 420, 280, 280);

    // Asphalt roadway
    ctx.fillStyle = '#171e2e';
    ctx.fillRect(280, 0, 140, h); // North-South road
    ctx.fillRect(0, 280, w, 140); // East-West road

    // Road markings
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);

    // Lane dividers (North-South)
    ctx.beginPath();
    ctx.moveTo(315, 0); ctx.lineTo(315, 275);
    ctx.moveTo(385, 0); ctx.lineTo(385, 275);
    ctx.moveTo(315, 425); ctx.lineTo(315, 700);
    ctx.moveTo(385, 425); ctx.lineTo(385, 700);

    // Lane dividers (East-West)
    ctx.moveTo(0, 315); ctx.lineTo(275, 315);
    ctx.moveTo(0, 385); ctx.lineTo(275, 385);
    ctx.moveTo(425, 315); ctx.lineTo(700, 315);
    ctx.moveTo(425, 385); ctx.lineTo(700, 385);
    ctx.stroke();

    // Double yellow centerlines
    ctx.setLineDash([]);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // North centerline
    ctx.moveTo(350, 0); ctx.lineTo(350, 275);
    // South centerline
    ctx.moveTo(350, 425); ctx.lineTo(350, 700);
    // West centerline
    ctx.moveTo(0, 350); ctx.lineTo(275, 350);
    // East centerline
    ctx.moveTo(425, 350); ctx.lineTo(700, 350);
    ctx.stroke();

    // Solid White Stop lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(350, 280); ctx.lineTo(420, 280); // North approach stop line
    ctx.moveTo(280, 420); ctx.lineTo(350, 420); // South approach stop line
    ctx.moveTo(420, 350); ctx.lineTo(420, 420); // East approach stop line
    ctx.moveTo(280, 280); ctx.lineTo(280, 350); // West approach stop line
    ctx.stroke();

    // Pedestrian Zebra Crosswalks
    drawCrosswalk(ctx, 280, 250, 140, 24, 'horizontal'); // North crosswalk
    drawCrosswalk(ctx, 280, 426, 140, 24, 'horizontal'); // South crosswalk
    drawCrosswalk(ctx, 250, 280, 24, 140, 'vertical');   // West crosswalk
    drawCrosswalk(ctx, 426, 280, 24, 140, 'vertical');   // East crosswalk

    // Lane Direction Arrows
    drawLaneArrows(ctx);

    // Draw Computer Vision Detection Cones if toggled
    if (showDetectionOverlay) {
      drawCameraCones(ctx);
    }

    // Draw Vehicles
    const vehicles = vehiclesRef.current;
    for (const v of vehicles) {
      drawVehicle(ctx, v);
    }

    // Draw Traffic Signal Lights on all 4 corners
    drawTrafficSignals(ctx, currentPhaseRef.current);

    // Draw Emergency Banner if active
    if (emergencyActiveRef.current) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(180, 20, 340, 38);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.strokeRect(180, 20, 340, 38);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`🚨 EMERGENCY PREEMPTION: ${emergencyApproachRef.current?.toUpperCase()} GREEN`, 350, 44);
    }
  };

  const drawCrosswalk = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    orientation: 'horizontal' | 'vertical'
  ) => {
    ctx.fillStyle = '#cbd5e1';
    if (orientation === 'horizontal') {
      const stripeW = 10;
      const gap = 8;
      for (let sx = x + 4; sx < x + w - 8; sx += stripeW + gap) {
        ctx.fillRect(sx, y, stripeW, h);
      }
    } else {
      const stripeH = 10;
      const gap = 8;
      for (let sy = y + 4; sy < y + h - 8; sy += stripeH + gap) {
        ctx.fillRect(x, sy, w, stripeH);
      }
    }
  };

  const drawLaneArrows = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    // North approach lane arrows (y: 240)
    ctx.fillText('↰', 368, 235); // Left turn
    ctx.fillText('↑ ↱', 396, 235); // Straight / Right

    // South approach lane arrows (y: 465)
    ctx.fillText('↰', 332, 475); // Left turn
    ctx.fillText('↑ ↱', 304, 475); // Straight / Right

    // West approach lane arrows (x: 235)
    ctx.fillText('↰', 235, 332);
    ctx.fillText('→ ↱', 235, 304);

    // East approach lane arrows (x: 465)
    ctx.fillText('↰', 465, 368);
    ctx.fillText('← ↱', 465, 396);
  };

  const drawCameraCones = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    // North camera cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.beginPath();
    ctx.moveTo(350, 20);
    ctx.lineTo(280, 275);
    ctx.lineTo(420, 275);
    ctx.closePath();
    ctx.fill();

    // South camera cone
    ctx.beginPath();
    ctx.moveTo(350, 680);
    ctx.lineTo(280, 425);
    ctx.lineTo(420, 425);
    ctx.closePath();
    ctx.fill();

    // East camera cone
    ctx.beginPath();
    ctx.moveTo(680, 350);
    ctx.lineTo(425, 280);
    ctx.lineTo(425, 420);
    ctx.closePath();
    ctx.fill();

    // West camera cone
    ctx.beginPath();
    ctx.moveTo(20, 350);
    ctx.lineTo(275, 280);
    ctx.lineTo(275, 420);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawVehicle = (ctx: CanvasRenderingContext2D, v: Vehicle) => {
    ctx.save();
    ctx.translate(v.x, v.y);

    // Rotate vehicle along direction of travel
    let angle = 0;
    if (v.approach === 'north') angle = Math.PI / 2;
    else if (v.approach === 'south') angle = -Math.PI / 2;
    else if (v.approach === 'east') angle = Math.PI;
    else if (v.approach === 'west') angle = 0;

    // Adjust angle when turning inside intersection
    if (v.hasPassedIntersection) {
      if (v.turn === 'right') {
        if (v.approach === 'north') angle = Math.PI;
        else if (v.approach === 'south') angle = 0;
        else if (v.approach === 'east') angle = Math.PI / 2;
        else if (v.approach === 'west') angle = -Math.PI / 2;
      } else if (v.turn === 'left') {
        if (v.approach === 'north') angle = 0;
        else if (v.approach === 'south') angle = Math.PI;
        else if (v.approach === 'east') angle = -Math.PI / 2;
        else if (v.approach === 'west') angle = Math.PI / 2;
      }
    }

    ctx.rotate(angle);

    // Vehicle Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-v.length / 2 + 2, -v.width / 2 + 2, v.length, v.width);

    // Vehicle Body
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.roundRect(-v.length / 2, -v.width / 2, v.length, v.width, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Windshield & roof
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-v.length / 6, -v.width / 2 + 2, v.length / 3, v.width - 4);

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(v.length / 2 - 2, -v.width / 2 + 2, 2, 3);
    ctx.fillRect(v.length / 2 - 2, v.width / 2 - 5, 2, 3);

    // Brake lights (glow red when stopped)
    ctx.fillStyle = v.isStopped ? '#ef4444' : '#991b1b';
    ctx.fillRect(-v.length / 2, -v.width / 2 + 2, 2, 3);
    ctx.fillRect(-v.length / 2, v.width / 2 - 5, 2, 3);

    // Special: Emergency vehicle flashing lights
    if (v.isEmergency) {
      const flash = Math.floor(Date.now() / 150) % 2 === 0;
      ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Red emergency cross
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, -1, 8, 2);
      ctx.fillRect(-1, -4, 2, 8);
    }

    // Deep Learning Detection Bounding Box Overlay
    if (showDetectionOverlay && !v.hasPassedIntersection) {
      ctx.strokeStyle = v.isEmergency ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-v.length / 2 - 3, -v.width / 2 - 3, v.length + 6, v.width + 6);

      // Label
      ctx.fillStyle = v.isEmergency ? '#ef4444' : '#0284c7';
      ctx.fillRect(-v.length / 2 - 3, -v.width / 2 - 14, 46, 11);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(
        v.isEmergency ? 'AMB:99%' : `${v.type.slice(0, 3)}:${v.trackingId}`,
        -v.length / 2 - 1,
        -v.width / 2 - 5
      );
    }

    ctx.restore();
  };

  const drawTrafficSignals = (ctx: CanvasRenderingContext2D, phase: SignalPhase) => {
    // Traffic signal positions on intersection corners
    // NW corner: controls East-West (W approach) and N-S (N approach)
    drawSignalHead(ctx, 260, 260, getApproachLight('west', phase), 'W');
    drawSignalHead(ctx, 440, 260, getApproachLight('north', phase), 'N');
    drawSignalHead(ctx, 440, 440, getApproachLight('east', phase), 'E');
    drawSignalHead(ctx, 260, 440, getApproachLight('south', phase), 'S');
  };

  const getApproachLight = (approach: Direction, phase: SignalPhase): SignalColor => {
    if (emergencyActiveRef.current && isAiAdaptiveRef.current) {
      if (
        (emergencyApproachRef.current === 'north' || emergencyApproachRef.current === 'south') &&
        (approach === 'north' || approach === 'south')
      ) {
        return 'green';
      }
      if (
        (emergencyApproachRef.current === 'east' || emergencyApproachRef.current === 'west') &&
        (approach === 'east' || approach === 'west')
      ) {
        return 'green';
      }
      return 'red';
    }

    if (approach === 'north' || approach === 'south') {
      if (phase === 'NS_STRAIGHT' || phase === 'NS_LEFT') return 'green';
      return 'red';
    } else {
      if (phase === 'EW_STRAIGHT' || phase === 'EW_LEFT') return 'green';
      return 'red';
    }
  };

  const drawSignalHead = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: SignalColor,
    label: string
  ) => {
    ctx.save();
    // Housing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 10, y - 24, 20, 48);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 10, y - 24, 20, 48);

    // Red Aspect
    ctx.fillStyle = color === 'red' ? '#ef4444' : '#331515';
    ctx.beginPath();
    ctx.arc(x, y - 14, 6, 0, Math.PI * 2);
    ctx.fill();
    if (color === 'red') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    // Yellow Aspect
    ctx.fillStyle = color === 'yellow' ? '#f59e0b' : '#332612';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    if (color === 'yellow') {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    // Green Aspect
    ctx.fillStyle = color === 'green' ? '#10b981' : '#062d1f';
    ctx.beginPath();
    ctx.arc(x, y + 14, 6, 0, Math.PI * 2);
    ctx.fill();
    if (color === 'green') {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    // Label on signal mount
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 32);

    ctx.restore();
  };

  const resetSimulation = () => {
    vehiclesRef.current = [];
    phaseTimerRef.current = 30;
    setPhaseTimer(30);
    setEmergencyActive(false);
    setEmergencyApproach(null);
    emergencyActiveRef.current = false;
    emergencyApproachRef.current = null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Simulation Viewport & Canvas (8 Columns) */}
      <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
        {/* Canvas Header & Status */}
        <div className="w-full flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Grand Avenue & 5th Metro Blvd</span>
              <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                4-Leg Dual-Lane Intersection
              </span>
            </h2>
          </div>

          {/* Controller Mode Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                isAiAdaptive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isAiAdaptive ? 'AI Adaptive DQN Signal' : 'Legacy Pre-Timed (45s Fixed)'}
            </span>

            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
              Phase: <strong className="text-cyan-400">{currentPhase.replace('_', ' ')}</strong> ({phaseTimer}s)
            </span>
          </div>
        </div>

        {/* 2D Canvas Container */}
        <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={700}
            height={700}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Floating Live Overlays */}
          {showQueueMetrics && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-slate-300 shadow-md">
                <div className="text-slate-400 font-semibold mb-0.5">Live Queue Counts:</div>
                <div className="flex items-center gap-3">
                  <span>N: <b className="text-cyan-400">{metrics.queueCounts.north}</b></span>
                  <span>S: <b className="text-cyan-400">{metrics.queueCounts.south}</b></span>
                  <span>E: <b className="text-cyan-400">{metrics.queueCounts.east}</b></span>
                  <span>W: <b className="text-cyan-400">{metrics.queueCounts.west}</b></span>
                </div>
              </div>
            </div>
          )}

          {/* Quick manual spawn buttons floating at corners */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-2 py-1 rounded-lg">
            <span className="text-[10px] text-slate-400 font-mono">Spawn:</span>
            <button
              onClick={() => spawnRandomVehicle()}
              className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 transition"
              title="Spawn standard vehicle"
            >
              + Car
            </button>
            <button
              onClick={() => spawnEmergencyVehicle('north')}
              className="text-[10px] font-mono bg-rose-950 hover:bg-rose-900 text-rose-300 px-1.5 py-0.5 rounded border border-rose-700 transition flex items-center gap-1"
              title="Spawn Ambulance"
            >
              <Siren className="w-2.5 h-2.5" /> Amb
            </button>
          </div>
        </div>

        {/* Simulation Playback & Speed Controls */}
        <div className="w-full flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
              title="Clear all vehicles"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-1 rounded text-xs font-mono transition ${
                    simSpeed === spd ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={advanceSignalPhase}
              className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <FastForward className="w-3 h-3 text-amber-400" /> Next Phase
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetectionOverlay(!showDetectionOverlay)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                showDetectionOverlay
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              YOLO BBoxes
            </button>

            <button
              onClick={() => setShowQueueMetrics(!showQueueMetrics)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                showQueueMetrics
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Queue HUD
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel, Scenarios & AI Timing Diagnostics (4 Columns) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Controller Toggle Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Signal Controller Mode
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleAi(true)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition text-center ${
                isAiAdaptive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 mb-1" />
              <span className="text-xs font-bold">AI Adaptive (RL)</span>
              <span className="text-[10px] opacity-80">Dynamic Splits (12-55s)</span>
            </button>

            <button
              onClick={() => onToggleAi(false)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition text-center ${
                !isAiAdaptive
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 mb-1" />
              <span className="text-xs font-bold">Fixed-Time (Legacy)</span>
              <span className="text-[10px] opacity-80">Rigid 45s Cycles</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {isAiAdaptive
              ? 'Deep Q-Network RL agent continuously observes queue lengths and approach speeds to dynamically compute optimal phase duration, eliminating wasteful green intervals on empty approaches.'
              : 'Traditional electro-mechanical cycle allocating static 45s regardless of demand. Causes idling queues on busy approaches while empty lanes hold green.'}
          </p>
        </div>

        {/* Live Performance Delta Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Real-Time AI Improvement Delta
          </h3>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Average Delay:</span>
                <span className="text-emerald-400 font-bold">
                  {metrics.avgWaitTime}s <span className="text-slate-500 font-normal">vs {fixedComparison.fixedWaitTime}s fixed</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, (1 - metrics.avgWaitTime / fixedComparison.fixedWaitTime) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-right text-emerald-400 font-mono mt-0.5">
                -{Math.round(((fixedComparison.fixedWaitTime - metrics.avgWaitTime) / fixedComparison.fixedWaitTime) * 100)}% Commuter Delay Reduced
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Congestion Index:</span>
                <span className="text-cyan-400 font-bold">
                  {metrics.congestionIndex}/100 <span className="text-slate-500 font-normal">({metrics.levelOfService})</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.congestionIndex < 35
                      ? 'bg-emerald-500'
                      : metrics.congestionIndex < 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${metrics.congestionIndex}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CO2 Saved</span>
                <strong className="text-emerald-400 text-sm">+{metrics.co2SavedKg} kg</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Fuel Conserved</span>
                <strong className="text-cyan-400 text-sm">+{metrics.fuelSavedLiters} L</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Test Scenarios Quick Trigger */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1">
          <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Operational Test Scenarios
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Inject urban traffic edge cases to benchmark adaptive reinforcement learning against legacy controllers:
          </p>

          <div className="space-y-1.5">
            {[
              { id: 'normal', label: 'Balanced Flow (Baseline)', icon: Car },
              { id: 'am_rush', label: 'AM Peak Rush (N/S Dominant)', icon: FastForward },
              { id: 'ambulance_run', label: 'Emergency Vehicle Preemption', icon: Siren },
              { id: 'gridlock_test', label: 'Multi-Leg Gridlock Stress Test', icon: ShieldAlert },
            ].map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => onScenarioChange(sc.id as ScenarioType)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition ${
                    scenario === sc.id
                      ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    {sc.label}
                  </span>
                  {scenario === sc.id && <span className="text-[10px] font-mono text-cyan-400">ACTIVE</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
