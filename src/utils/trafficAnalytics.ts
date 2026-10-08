import { HourlyTrafficData, DayCongestionCell } from '../types/traffic';

export interface ExtendedHourlyData extends HourlyTrafficData {
  pcuVolume: number;
  avgSpeedKmh: number;
  peakHourFactor: number; // PHF = V / (4 * V15)
  queueSpillbackRiskPct: number;
  co2EmissionsKg: number;
  modalSplit: {
    twoWheelers: number;
    autoRickshaws: number;
    cars: number;
    buses: number;
    commercial: number;
  };
  recommendedGreenSec: number;
  fixedGreenSec: number;
}

export type CorridorId = 'silk_board' | 'orr_marathahalli' | 'whitefield_itpl' | 'hebbal_flyover';

export interface CorridorProfile {
  id: CorridorId;
  name: string;
  zone: string;
  capacityPCUPerHr: number;
  lanes: number;
  description: string;
}

export const CORRIDORS: CorridorProfile[] = [
  {
    id: 'silk_board',
    name: 'Silk Board Junction (Hosur Rd / Outer Ring Rd)',
    zone: 'South-East Bengaluru',
    capacityPCUPerHr: 3200,
    lanes: 8,
    description: 'Critical flyover interchange connecting Koramangala, BTM Layout, HSR Layout, and Electronic City IT expressway.',
  },
  {
    id: 'orr_marathahalli',
    name: 'Outer Ring Road (ORR) - Marathahalli & Bellandur',
    zone: 'East Bengaluru Tech Corridor',
    capacityPCUPerHr: 3400,
    lanes: 6,
    description: 'High-density tech corridor carrying over 150,000 tech employees daily between Manyata, Marathahalli, and Bellandur.',
  },
  {
    id: 'whitefield_itpl',
    name: 'Whitefield ITPL Main Road & Hope Farm',
    zone: 'East Bengaluru Urban Suburb',
    capacityPCUPerHr: 2600,
    lanes: 4,
    description: 'Arterial road connecting residential townships to International Tech Park Bangalore (ITPB) and metro terminal.',
  },
  {
    id: 'hebbal_flyover',
    name: 'Hebbal Flyover Junction (Airport Expressway)',
    zone: 'North Bengaluru Gateway',
    capacityPCUPerHr: 3600,
    lanes: 8,
    description: 'Major tri-junction connecting Bengaluru City center to Kempegowda International Airport (KIAL) and Tumkur Road.',
  },
];

// Generate 24-Hour historical data calibrated for Bangalore corridors
export const generateCorridor24HourData = (corridorId: CorridorId = 'silk_board'): ExtendedHourlyData[] => {
  const multiplier = corridorId === 'silk_board' ? 1.08 : corridorId === 'hebbal_flyover' ? 1.12 : corridorId === 'whitefield_itpl' ? 0.88 : 1.0;

  const baseHours = [
    { hour: 0, label: '12:00 AM', vol: 320, fixedDelay: 22, aiDelay: 7, cong: 10, speed: 48, phf: 0.72, qRisk: 2 },
    { hour: 1, label: '01:00 AM', vol: 190, fixedDelay: 20, aiDelay: 6, cong: 6, speed: 50, phf: 0.68, qRisk: 1 },
    { hour: 2, label: '02:00 AM', vol: 130, fixedDelay: 19, aiDelay: 5, cong: 4, speed: 52, phf: 0.65, qRisk: 0 },
    { hour: 3, label: '03:00 AM', vol: 150, fixedDelay: 19, aiDelay: 5, cong: 5, speed: 52, phf: 0.66, qRisk: 0 },
    { hour: 4, label: '04:00 AM', vol: 310, fixedDelay: 21, aiDelay: 7, cong: 12, speed: 46, phf: 0.74, qRisk: 2 },
    { hour: 5, label: '05:00 AM', vol: 680, fixedDelay: 26, aiDelay: 10, cong: 24, speed: 42, phf: 0.78, qRisk: 5 },
    { hour: 6, label: '06:00 AM', vol: 1340, fixedDelay: 35, aiDelay: 13, cong: 46, speed: 36, phf: 0.82, qRisk: 14 },
    { hour: 7, label: '07:00 AM', vol: 2480, fixedDelay: 56, aiDelay: 18, cong: 82, speed: 22, phf: 0.88, qRisk: 58, isPeak: true, peakLabel: 'AM Peak Inflow Ramp' },
    { hour: 8, label: '08:00 AM', vol: 3340, fixedDelay: 78, aiDelay: 22, cong: 97, speed: 11, phf: 0.94, qRisk: 88, isPeak: true, peakLabel: 'AM Peak Apex (Commuter Rush)' },
    { hour: 9, label: '09:00 AM', vol: 2950, fixedDelay: 66, aiDelay: 20, cong: 91, speed: 14, phf: 0.92, qRisk: 76, isPeak: true, peakLabel: 'AM Peak Tech Office Wave' },
    { hour: 10, label: '10:00 AM', vol: 1980, fixedDelay: 42, aiDelay: 14, cong: 64, speed: 28, phf: 0.85, qRisk: 32 },
    { hour: 11, label: '11:00 AM', vol: 2110, fixedDelay: 44, aiDelay: 15, cong: 68, speed: 26, phf: 0.86, qRisk: 38 },
    { hour: 12, label: '12:00 PM', vol: 2420, fixedDelay: 50, aiDelay: 16, cong: 76, speed: 22, phf: 0.89, qRisk: 48, isPeak: true, peakLabel: 'Midday Commercial & Delivery Surge' },
    { hour: 13, label: '01:00 PM', vol: 2250, fixedDelay: 47, aiDelay: 15, cong: 72, speed: 24, phf: 0.87, qRisk: 42 },
    { hour: 14, label: '02:00 PM', vol: 2040, fixedDelay: 42, aiDelay: 14, cong: 65, speed: 27, phf: 0.85, qRisk: 34 },
    { hour: 15, label: '03:00 PM', vol: 2390, fixedDelay: 48, aiDelay: 16, cong: 74, speed: 24, phf: 0.87, qRisk: 44 },
    { hour: 16, label: '04:00 PM', vol: 2920, fixedDelay: 68, aiDelay: 21, cong: 88, speed: 17, phf: 0.91, qRisk: 72, isPeak: true, peakLabel: 'PM Return Flow Ramp-Up' },
    { hour: 17, label: '05:00 PM', vol: 3620, fixedDelay: 92, aiDelay: 25, cong: 99, speed: 8, phf: 0.96, qRisk: 96, isPeak: true, peakLabel: 'PM Peak Apex (Severe Bottleneck)' },
    { hour: 18, label: '06:00 PM', vol: 3510, fixedDelay: 88, aiDelay: 24, cong: 98, speed: 9, phf: 0.95, qRisk: 94, isPeak: true, peakLabel: 'PM Peak Sustained Gridlock' },
    { hour: 19, label: '07:00 PM', vol: 2840, fixedDelay: 64, aiDelay: 19, cong: 84, speed: 16, phf: 0.90, qRisk: 68, isPeak: true, peakLabel: 'Evening Shoulder Dissipation' },
    { hour: 20, label: '08:00 PM', vol: 1980, fixedDelay: 40, aiDelay: 14, cong: 60, speed: 27, phf: 0.84, qRisk: 28 },
    { hour: 21, label: '09:00 PM', vol: 1460, fixedDelay: 32, aiDelay: 12, cong: 45, speed: 34, phf: 0.80, qRisk: 16 },
    { hour: 22, label: '10:00 PM', vol: 990, fixedDelay: 28, aiDelay: 10, cong: 32, speed: 39, phf: 0.77, qRisk: 8 },
    { hour: 23, label: '11:00 PM', vol: 590, fixedDelay: 24, aiDelay: 8, cong: 20, speed: 44, phf: 0.73, qRisk: 4 },
  ];

  return baseHours.map((h) => {
    const vol = Math.round(h.vol * multiplier);
    const pcu = Math.round(vol * 1.34);
    const isPeak = !!h.isPeak;

    // Modal split changes: Peak hours have much more 2-wheelers and BMTC buses
    const twoWheelers = isPeak ? 44 : 32;
    const autoRickshaws = isPeak ? 14 : 12;
    const cars = isPeak ? 26 : 38;
    const buses = isPeak ? 12 : 8;
    const commercial = 100 - (twoWheelers + autoRickshaws + cars + buses);

    // Compute green allocation
    const recommendedGreenSec = isPeak
      ? Math.min(65, Math.max(38, Math.round(28 + (vol / 3600) * 32)))
      : Math.min(35, Math.max(14, Math.round(12 + (vol / 2000) * 18)));

    return {
      hour: h.hour,
      label: h.label,
      volumeVehicles: vol,
      pcuVolume: pcu,
      avgDelayFixed: Math.round(h.fixedDelay * multiplier),
      avgDelayAI: Math.round(h.aiDelay * multiplier),
      avgSpeedKmh: h.speed,
      peakHourFactor: h.phf,
      queueSpillbackRiskPct: h.qRisk,
      co2EmissionsKg: Number((vol * (h.fixedDelay / 3600) * 0.28).toFixed(1)),
      congestionIndex: h.cong,
      isPeak,
      peakLabel: h.peakLabel,
      predictedVolumeTomorrow: Math.round(vol * (1 + (Math.sin(h.hour * 0.45) * 0.06 + 0.02))),
      modalSplit: {
        twoWheelers,
        autoRickshaws,
        cars,
        buses,
        commercial,
      },
      recommendedGreenSec,
      fixedGreenSec: 45,
    };
  });
};

export const generate24HourTrafficData = (): HourlyTrafficData[] => {
  return generateCorridor24HourData('silk_board');
};

// 7-day x 24-hour congestion matrix for heatmap
export const generateWeeklyHeatmap = (corridorId: CorridorId = 'silk_board'): DayCongestionCell[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells: DayCongestionCell[] = [];

  days.forEach((day, dayIndex) => {
    for (let hour = 0; hour < 24; hour++) {
      let baseDensity = 14;
      const isWeekend = dayIndex >= 5;

      if (!isWeekend) {
        // Weekday morning peak (Tue/Wed highest in Bangalore)
        if (hour >= 7 && hour <= 9) {
          baseDensity += 68 + (dayIndex === 1 || dayIndex === 2 ? 16 : 8);
        }
        // Weekday midday
        else if (hour >= 12 && hour <= 13) {
          baseDensity += 45;
        }
        // Weekday evening peak (Friday evening is legendary Silk Board rush!)
        else if (hour >= 17 && hour <= 19) {
          baseDensity += 72 + (day === 'Fri' ? 22 : 12);
        } else if (hour >= 10 && hour <= 16) {
          baseDensity += 38;
        } else if (hour >= 20 && hour <= 22) {
          baseDensity += 28;
        }
      } else {
        // Weekend pattern: shifted to afternoon/evening shopping & dining
        if (hour >= 12 && hour <= 16) baseDensity += 56;
        else if (hour >= 17 && hour <= 21) baseDensity += 64 + (day === 'Sat' ? 12 : 6);
        else if (hour >= 8 && hour <= 10) baseDensity += 26;
      }

      const density = Math.min(100, Math.max(4, Math.round(baseDensity + Math.sin(hour * 0.8 + dayIndex) * 5)));
      cells.push({
        day,
        hour,
        density,
        isCongested: density >= 70,
      });
    }
  });

  return cells;
};

// Calculate Webster's Optimal Cycle Formula
// C_0 = (1.5 * L + 5) / (1 - Y)
export const calculateWebstersCycle = (lostTimeSec: number = 16, saturationRatioY: number = 0.74) => {
  const effectiveY = Math.min(0.92, Math.max(0.3, saturationRatioY));
  const optimalCycle = (1.5 * lostTimeSec + 5) / (1 - effectiveY);
  return Math.round(optimalCycle);
};

// Level of Service (HCM 2020)
export const getLevelOfService = (delaySeconds: number): { los: string; color: string; description: string } => {
  if (delaySeconds <= 10) {
    return { los: 'LOS A', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', description: 'Free flow, negligible queue formation' };
  } else if (delaySeconds <= 20) {
    return { los: 'LOS B', color: 'text-green-400 bg-green-500/10 border-green-500/30', description: 'Stable flow, minor progression delays' };
  } else if (delaySeconds <= 35) {
    return { los: 'LOS C', color: 'text-lime-400 bg-lime-500/10 border-lime-500/30', description: 'Stable flow, noticeable cycle delays' };
  } else if (delaySeconds <= 55) {
    return { los: 'LOS D', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', description: 'Approaching capacity, substantial queues' };
  } else if (delaySeconds <= 80) {
    return { los: 'LOS E', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', description: 'At capacity, unstable queue build-up' };
  } else {
    return { los: 'LOS F', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', description: 'Forced breakdown, gridlock & spillback' };
  }
};

// Generate Comprehensive CSV export content for Urban Planners
export const generateTrafficCSV = (hourlyData: ExtendedHourlyData[] | HourlyTrafficData[]): string => {
  const headers = [
    'Hour',
    'Time_Slot',
    'Vehicles_PerHour',
    'PCU_Equivalent_PerHour',
    'Avg_Speed_kmh',
    'Peak_Hour_Factor_PHF',
    'Legacy_Fixed_Delay_sec',
    'SmartFlow_AI_Delay_sec',
    'Delay_Reduction_pct',
    'Congestion_Index_100',
    'Queue_Spillback_Risk_pct',
    'Recommended_Green_sec',
    'CO2_Emissions_kg',
    'Peak_Classification',
    'Predicted_Next_Day_Volume',
  ];

  const rows = (hourlyData as ExtendedHourlyData[]).map((d) => {
    const reduction = Math.round(((d.avgDelayFixed - d.avgDelayAI) / d.avgDelayFixed) * 100);
    return [
      d.hour,
      `"${d.label}"`,
      d.volumeVehicles,
      d.pcuVolume || Math.round(d.volumeVehicles * 1.3),
      d.avgSpeedKmh || 25,
      d.peakHourFactor || 0.88,
      d.avgDelayFixed,
      d.avgDelayAI,
      `${reduction}%`,
      d.congestionIndex,
      `${d.queueSpillbackRiskPct || 20}%`,
      d.recommendedGreenSec || 35,
      d.co2EmissionsKg || 50,
      `"${d.isPeak ? d.peakLabel || 'Peak Window' : 'Normal Flow'}"`,
      d.predictedVolumeTomorrow,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
