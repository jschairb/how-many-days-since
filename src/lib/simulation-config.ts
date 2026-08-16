import { rivalrySnapshot } from './rivalry-snapshot';

// The snapshot's model block IS the server configuration: the repeated-game run count was
// selected by the backend test harness and ships with the export. SIMULATION_RUN_COUNT is
// an operations escape hatch only; there is no run-count control in the interface.
export function simulationRunCount(): number {
  const override = process.env.SIMULATION_RUN_COUNT;
  if (override !== undefined) {
    const parsed = Number(override);
    if (!Number.isInteger(parsed) || parsed < 1) throw new Error('SIMULATION_RUN_COUNT must be a positive integer');
    return parsed;
  }
  return rivalrySnapshot.model.simulationRunCount;
}
