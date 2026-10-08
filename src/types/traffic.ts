export type Direction = 'north' | 'south' | 'east' | 'west';

export type TurnType = 'straight' | 'left' | 'right';

export type VehicleType = 'car' | 'bus' | 'truck' | 'motorcycle' | 'ambulance';

export type SignalColor = 'red' | 'yellow' | 'green';

export interface Vehicle {
  id: string;
  type: VehicleType;
  approach: Direction;
  laneIndex: number; // 0: left turn, 1: through/right
  turn: TurnType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  length: number;
  width: number;
  color: string;
  distanceToStopLine: number;
  isStopped: boolean;
  waitingTime: number; // in seconds
  hasPassedIntersection: boolean;
  isEmergency: boolean;
  trackingId: number;
}

export interface Pedestrian {
  id: string;
  crosswalk: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

export type SignalPhase = 
  | 'NS_STRAIGHT' // North-South straight & right green
  | 'NS_LEFT'     // North-South protected left green
  | 'EW_STRAIGHT' // East-West straight & right green
  | 'EW_LEFT'     // East-West protected left green
  | 'ALL_RED'     // Clearance interval
  | 'EMERGENCY';  // Preemption green corridor

export interface PhaseTiming {
  phase: SignalPhase;
  greenDuration: number;
  minGreen: number;
  maxGreen: number;
  yellowDuration: number;
  redClearance: number;
  elapsedTime: number;
  remainingTime: number;
  isExtendedByAI: boolean;
}

export interface IntersectionMetrics {
  avgWaitTime: number; // seconds
  totalVehiclesPassed: number;
  flowRate: number; // PCU per hour
  congestionIndex: number; // 0-100
  levelOfService: 'LOS A' | 'LOS B' | 'LOS C' | 'LOS D' | 'LOS E' | 'LOS F';
  co2SavedKg: number;
  fuelSavedLiters: number;
  emergencyDelaySec: number;
  queueCounts: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  approachDelays: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  pedestriansWaiting: number;
}

export interface FixedComparisonMetrics {
  fixedWaitTime: number;
  fixedCongestionIndex: number;
  fixedLevelOfService: string;
  fixedCo2WastedKg: number;
  fixedTotalCleared: number;
}

export interface CameraDetection {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h] in %
  speedKmh: number;
  trackId: number;
  lane: string;
}

export interface HourlyTrafficData {
  hour: number;
  label: string;
  volumeVehicles: number;
  avgDelayFixed: number;
  avgDelayAI: number;
  congestionIndex: number;
  isPeak: boolean;
  peakLabel?: string;
  predictedVolumeTomorrow: number;
}

export interface DayCongestionCell {
  day: string;
  hour: number;
  density: number; // 0 to 100
  isCongested: boolean;
}

export type ScenarioType = 
  | 'normal'
  | 'am_rush'
  | 'pm_rush'
  | 'ambulance_run'
  | 'rain_weather'
  | 'pedestrian_rush'
  | 'gridlock_test';

export interface SignalState {
  north: { straight: SignalColor; left: SignalColor };
  south: { straight: SignalColor; left: SignalColor };
  east: { straight: SignalColor; left: SignalColor };
  west: { straight: SignalColor; left: SignalColor };
}
