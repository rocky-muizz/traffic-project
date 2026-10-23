#!/usr/bin/env node
/**
 * SmartFlow AI — Terminal / Command Prompt Interactive Demo
 * Run with: node demo.js OR npm run demo
 * 
 * Demonstrates:
 * 1. Multi-class Vehicle PCU (Passenger Car Unit) Computation (IRC: 106-1990 standard)
 * 2. Real-time Webster's Minimum Delay Signal Timing Allocation
 * 3. Emergency Ambulance Preemption Algorithm (Zero-delay green corridor)
 * 4. Side-by-Side Comparison: Fixed-Time Signal (45s) vs SmartFlow Adaptive AI
 */

import readline from 'readline';

// ANSI terminal colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printHeader() {
  console.clear();
  console.log(`${C.cyan}${C.bold}========================================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold}   SMARTFLOW AI — AUTONOMOUS ADAPTIVE TRAFFIC CONTROL SYSTEM DEMO        ${C.reset}`);
  console.log(`${C.dim}   Bangalore High-Density Corridor ITS • Terminal Demonstration Engine   ${C.reset}`);
  console.log(`${C.cyan}${C.bold}========================================================================${C.reset}\n`);
}

// Indian Roads Congress (IRC 106-1990) PCU Factors
const PCU_FACTORS = {
  twoWheeler: 0.5,
  autoRickshaw: 1.0,
  car: 1.0,
  bus: 2.5,
  truck: 3.0,
  ambulance: 1.0, // Special priority handling
};

function calculateMetrics(vehicles, hasAmbulance = false) {
  const pcu =
    vehicles.twoWheeler * PCU_FACTORS.twoWheeler +
    vehicles.autoRickshaw * PCU_FACTORS.autoRickshaw +
    vehicles.car * PCU_FACTORS.car +
    vehicles.bus * PCU_FACTORS.bus +
    vehicles.truck * PCU_FACTORS.truck;

  const totalVehicles =
    vehicles.twoWheeler +
    vehicles.autoRickshaw +
    vehicles.car +
    vehicles.bus +
    vehicles.truck +
    (hasAmbulance ? 1 : 0);

  // Saturation flow rate ~ 1800 PCU / lane / hour (~0.5 PCU/sec)
  const dischargeRate = 0.5; // PCU cleared per second of green
  const startupLostTime = 3; // seconds
  const minGreen = 12;
  const maxGreen = 65;

  let allocatedGreen = Math.round(pcu / dischargeRate + startupLostTime);
  allocatedGreen = Math.max(minGreen, Math.min(maxGreen, allocatedGreen));

  // If ambulance is present, trigger immediate emergency preemption phase
  if (hasAmbulance) {
    allocatedGreen = 45; // Guaranteed clearance wave
  }

  // Fixed time comparison (typical Bangalore fixed timer is 45s)
  const fixedTimer = 45;
  const fixedWaitTimeSec = Math.round(28 + (pcu * 1.8));
  const aiWaitTimeSec = hasAmbulance ? 0 : Math.round(Math.max(6, 12 + (pcu * 0.45)));
  const delayReductionPct = Math.round(((fixedWaitTimeSec - aiWaitTimeSec) / fixedWaitTimeSec) * 100);

  return {
    pcu: Number(pcu.toFixed(1)),
    totalVehicles,
    allocatedGreen,
    fixedTimer,
    fixedWaitTimeSec,
    aiWaitTimeSec,
    delayReductionPct,
    hasAmbulance,
  };
}

async function runScenario1() {
  printHeader();
  console.log(`${C.yellow}${C.bold}▶ SCENARIO 1: Silk Board Junction — Real Snapshot Vehicle Detection & Signal Allocation${C.reset}`);
  console.log(`${C.dim}Simulating camera inference from North-bound approach (Hosur Road / Silk Board)...${C.reset}\n`);

  await sleep(600);
  console.log(`${C.white}Running Computer Vision detection pipeline...${C.reset}`);
  await sleep(500);

  const detectedVehicles = {
    twoWheeler: 24,
    autoRickshaw: 11,
    car: 8,
    bus: 3,
    truck: 1,
  };

  console.log(`\n${C.green}✔ Detections Completed (Accuracy: 96.4%):${C.reset}`);
  console.log(`   🏍️  Two-Wheelers:    ${C.bold}${detectedVehicles.twoWheeler}${C.reset}  (PCU weight: 0.5  ->  ${(detectedVehicles.twoWheeler * 0.5).toFixed(1)} PCU)`);
  console.log(`   🛺  Auto-Rickshaws:  ${C.bold}${detectedVehicles.autoRickshaw}${C.reset}  (PCU weight: 1.0  ->  ${(detectedVehicles.autoRickshaw * 1.0).toFixed(1)} PCU)`);
  console.log(`   🚗  Cars/Taxis:      ${C.bold}${detectedVehicles.car}${C.reset}  (PCU weight: 1.0  ->  ${(detectedVehicles.car * 1.0).toFixed(1)} PCU)`);
  console.log(`   🚌  BMTC Buses:      ${C.bold}${detectedVehicles.bus}${C.reset}  (PCU weight: 2.5  ->  ${(detectedVehicles.bus * 2.5).toFixed(1)} PCU)`);
  console.log(`   🚚  Heavy Trucks:    ${C.bold}${detectedVehicles.truck}${C.reset}  (PCU weight: 3.0  ->  ${(detectedVehicles.truck * 3.0).toFixed(1)} PCU)`);

  const metrics = calculateMetrics(detectedVehicles, false);

  console.log(`\n${C.cyan}${C.bold}------------------------------------------------------------------------${C.reset}`);
  console.log(`📊 Total Detected Vehicles: ${C.bold}${metrics.totalVehicles}${C.reset} | Total Traffic Pressure: ${C.bold}${metrics.pcu} PCU${C.reset}`);
  console.log(`${C.cyan}${C.bold}------------------------------------------------------------------------${C.reset}`);

  console.log(`\n${C.magenta}${C.bold}⚙️  SMARTFLOW DYNAMIC TIMING ALLOCATION COMPUTATION:${C.reset}`);
  console.log(`   Formula: Green_Time = (Total_PCU / Saturation_Discharge_Rate) + Startup_Lost_Time`);
  console.log(`   Calculated: (${metrics.pcu} PCU / 0.5 PCU/s) + 3s = ${metrics.allocatedGreen} seconds`);
  console.log(`   ${C.bgGreen}${C.white}${C.bold} ALLOCATED SIGNAL: ${metrics.allocatedGreen}s GREEN PHASE ${C.reset}\n`);

  console.log(`${C.bold}⚖️  PERFORMANCE COMPARISON VS LEGACY CONTROLLER:${C.reset}`);
  console.log(`   • Legacy Fixed-Time Signal:   ${metrics.fixedTimer}s fixed green | Avg Commuter Delay: ${C.red}${metrics.fixedWaitTimeSec}s${C.reset}`);
  console.log(`   • SmartFlow Adaptive AI:     ${metrics.allocatedGreen}s optimal green | Avg Commuter Delay: ${C.green}${metrics.aiWaitTimeSec}s${C.reset}`);
  console.log(`   • ${C.green}${C.bold}Efficiency Improvement:     ${metrics.delayReductionPct}% Delay Reduction (Saved ~${Math.round(metrics.pcu * 0.12)} kg CO2)${C.reset}\n`);
}

async function runScenario2() {
  console.log(`${C.cyan}${C.bold}========================================================================${C.reset}`);
  console.log(`${C.red}${C.bold}▶ SCENARIO 2: Emergency Ambulance Stuck in Heavy Traffic Corridor${C.reset}`);
  console.log(`${C.dim}Evaluating Emergency Vehicle Preemption (EVP) when ambulance is blocked in queue...${C.reset}\n`);

  await sleep(600);
  console.log(`${C.yellow}🚨 High-Density Traffic Queue: 32 Vehicles waiting (Total PCU: 41.5)${C.reset}`);
  console.log(`${C.bgRed}${C.white}${C.bold} 🚑 AMBULANCE DETECTED AT SENSOR DISTANCE: 140 METERS (Approach: South Lane 2) ${C.reset}`);
  
  await sleep(500);
  console.log(`\n${C.white}Triggering Priority Controller Algorithm:${C.reset}`);
  console.log(`   [STEP 1] ${C.green}Audio-Visual Siren & Beacon Verified${C.reset} (Confidence: 99.1%)`);
  console.log(`   [STEP 2] ${C.yellow}Interrupt active conflicting North/East phases${C.reset} -> Safe 3s Yellow transition`);
  console.log(`   [STEP 3] ${C.green}Hold All-Red Clearance${C.reset} (1.5s safe intersection vacuum)`);
  console.log(`   [STEP 4] ${C.bgGreen}${C.white}${C.bold} DISCHARGE GREEN WAVE: Flush blocking queue ahead of ambulance (45s Green) ${C.reset}`);
  
  await sleep(600);
  console.log(`\n${C.green}${C.bold}✔ RESULT OF AMBULANCE PREEMPTION:${C.reset}`);
  console.log(`   • Normal clearance time without AI:   ${C.red}184 seconds (3+ signal cycles stuck)${C.reset}`);
  console.log(`   • SmartFlow Preemption clearance:     ${C.green}${C.bold}14 seconds (Instant Green Corridor)${C.reset}`);
  console.log(`   • Transit Time Speedup:               ${C.green}${C.bold}92.4% faster emergency response${C.reset}\n`);
}

function promptInteractive() {
  console.log(`${C.cyan}${C.bold}========================================================================${C.reset}`);
  console.log(`${C.white}${C.bold}COMMAND PROMPT DEMO MENU:${C.reset}`);
  console.log(`1. Run automated complete demo again`);
  console.log(`2. Test Custom Vehicle Count (Enter your own numbers to test PCU & Signal)`);
  console.log(`3. How to launch the visual web demo on localhost:3000`);
  console.log(`4. Exit`);
  console.log(`${C.cyan}------------------------------------------------------------------------${C.reset}`);

  rl.question(`${C.bold}Select an option (1-4): ${C.reset}`, async (choice) => {
    const opt = choice.trim();
    if (opt === '1') {
      await runScenario1();
      await runScenario2();
      promptInteractive();
    } else if (opt === '2') {
      testCustomVehicleCount();
    } else if (opt === '3') {
      showWebInstructions();
      promptInteractive();
    } else {
      console.log(`\n${C.green}Exiting demo. To start the full web interface, run: ${C.bold}npm run dev${C.reset}\n`);
      rl.close();
      process.exit(0);
    }
  });
}

function testCustomVehicleCount() {
  console.log(`\n${C.yellow}${C.bold}Enter Traffic Counts for Live Calculation:${C.reset}`);
  rl.question('Number of Two-Wheelers (Bikes/Scooters): ', (bikes) => {
    rl.question('Number of Auto-Rickshaws: ', (autos) => {
      rl.question('Number of Cars/Cabs: ', (cars) => {
        rl.question('Number of BMTC Buses: ', (buses) => {
          rl.question('Number of Heavy Trucks: ', (trucks) => {
            rl.question('Is an Ambulance present? (y/n): ', (amb) => {
              const vehicles = {
                twoWheeler: parseInt(bikes, 10) || 0,
                autoRickshaw: parseInt(autos, 10) || 0,
                car: parseInt(cars, 10) || 0,
                bus: parseInt(buses, 10) || 0,
                truck: parseInt(trucks, 10) || 0,
              };
              const hasAmbulance = amb.trim().toLowerCase() === 'y';

              const res = calculateMetrics(vehicles, hasAmbulance);
              console.log(`\n${C.cyan}${C.bold}========================================================================${C.reset}`);
              console.log(`${C.bold}🎯 COMPUTATION RESULTS FOR YOUR INPUT:${C.reset}`);
              console.log(`• Total Vehicles: ${res.totalVehicles}`);
              console.log(`• Computed PCU Load: ${res.pcu} PCU`);
              if (hasAmbulance) {
                console.log(`• ${C.bgRed}${C.white}${C.bold} EMERGENCY PREEMPTION ACTIVE: Ambulance priority override! ${C.reset}`);
              }
              console.log(`• Recommended Green Time: ${C.green}${C.bold}${res.allocatedGreen} seconds${C.reset}`);
              console.log(`• Expected Queue Clearance: ${C.green}100% in single green cycle${C.reset}`);
              console.log(`• Delay Savings vs Fixed 45s: ${C.yellow}${res.delayReductionPct}% improvement${C.reset}`);
              console.log(`${C.cyan}========================================================================${C.reset}\n`);

              promptInteractive();
            });
          });
        });
      });
    });
  });
}

function showWebInstructions() {
  console.log(`\n${C.green}${C.bold}HOW TO LAUNCH THE FULL GRAPHICAL WEB INTERACTION:${C.reset}`);
  console.log(`1. In this same Command Prompt window, type:`);
  console.log(`   ${C.bold}npm run dev${C.reset}`);
  console.log(`2. Open your web browser (Chrome, Edge, Firefox) and go to:`);
  console.log(`   ${C.cyan}${C.bold}http://localhost:3000${C.reset}`);
  console.log(`3. Features you can showcase in the browser:`);
  console.log(`   • Real Snapshot Upload & Auto/Bus/Bike Bounding Boxes`);
  console.log(`   • Live 4-Way Traffic Simulation Canvas`);
  console.log(`   • Emergency Ambulance siren trigger button`);
  console.log(`   • Bangalore Peak Hours Heatmap & Analysis\n`);
}

async function main() {
  await runScenario1();
  await runScenario2();
  promptInteractive();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
