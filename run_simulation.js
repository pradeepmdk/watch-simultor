/**
 * run_simulation.js - Main Simulation Entry Point
 *
 * Purpose: Main launcher for the watch simulation
 * - Loads configuration from config.json
 * - Initializes Simulator
 * - Provides CLI interface for testing
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Simulator } from './backend/simulation/Simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load configuration from config.json
 */
function loadConfig() {
  try {
    const configPath = join(__dirname, 'config.json');
    const configData = readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading config.json:', error);
    return null;
  }
}

/**
 * Main simulation launcher
 */
function main() {
  console.log('🚀 Watch Simulator - Starting...\n');

  // Load configuration
  const config = loadConfig();
  if (!config) {
    console.error('❌ Failed to load configuration. Exiting.');
    process.exit(1);
  }

  console.log('📋 Configuration loaded:');
  console.log(`   Duration: ${config.simulation.duration} days`);
  console.log(`   Speed: ${config.simulation.speed}x`);
  console.log(`   Archetype: ${config.simulation.archetype}`);
  console.log(`   Start Date: ${config.simulation.startDate}\n`);

  // Create simulator instance
  const simulator = new Simulator({
    startDate: new Date(config.simulation.startDate),
    archetype: config.simulation.archetype,
    speed: config.simulation.speed,
    duration: config.simulation.duration,
  });

  // Subscribe to events for logging
  simulator.addEventListener('NEW_SECOND', (event) => {
    // Log every 10 seconds
    const rtc = simulator.getRTC();
    if (rtc.second % 10 === 0) {
      console.log(`⏰ ${event.simulatedTime.toISOString()} - Steps: ${simulator.getState().totalSteps}`);
    }
  });

  simulator.addEventListener('NEW_MINUTE', (event) => {
    const rtc = simulator.getRTC();
    console.log(`⏱️  Minute ${rtc.hour}:${String(rtc.minute).padStart(2, '0')} - Progress: ${simulator.getProgress().toFixed(1)}%`);
  });

  simulator.addEventListener('NEW_STEP', (event) => {
    // Optional: Log step events (can be verbose)
    // console.log(`👟 Steps: +${event.data.steps} (Total: ${event.data.totalSteps})`);
  });

  simulator.addEventListener('NEW_STATE', (event) => {
    console.log(`🔄 State change: ${event.data.from} → ${event.data.to} (${event.data.reason})`);
  });

  simulator.addEventListener('SIMULATION_COMPLETE', (event) => {
    console.log('\n✅ Simulation complete!');
    console.log(`   Total Steps: ${event.data.totalSteps}`);
    console.log(`   Duration: ${event.data.duration} days simulated`);
    process.exit(0);
  });

  // Start simulation
  console.log('▶️  Starting simulation...\n');
  simulator.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏸️  Pausing simulation...');
    simulator.pause();
    console.log('📊 Final state:');
    const state = simulator.getState();
    console.log(`   Progress: ${state.progress.toFixed(2)}%`);
    console.log(`   Total Steps: ${state.totalSteps}`);
    console.log(`   Current Time: ${state.currentTime.toISOString()}`);
    simulator.destroy();
    process.exit(0);
  });
}

// Run the simulation
main();
