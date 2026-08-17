import { afterEach, describe, expect, it } from 'vitest';

import { simulationRunCount } from '../simulation-config';
import { rivalrySnapshot } from '../rivalry-snapshot';

afterEach(() => { delete process.env.SIMULATION_RUN_COUNT; });

describe('simulationRunCount', () => {
  it('reads the harness-selected run count from the snapshot model block', () => {
    expect(simulationRunCount()).toBe(rivalrySnapshot.model.simulationRunCount);
    expect(simulationRunCount()).toBeGreaterThanOrEqual(1);
  });

  it('honors a valid operations override', () => {
    process.env.SIMULATION_RUN_COUNT = '250';
    expect(simulationRunCount()).toBe(250);
  });

  it('rejects a broken override instead of guessing', () => {
    process.env.SIMULATION_RUN_COUNT = 'lots';
    expect(() => simulationRunCount()).toThrow('SIMULATION_RUN_COUNT');
    process.env.SIMULATION_RUN_COUNT = '0';
    expect(() => simulationRunCount()).toThrow('SIMULATION_RUN_COUNT');
  });
});
