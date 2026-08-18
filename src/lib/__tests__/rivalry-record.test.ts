import { describe, expect, it } from 'vitest';
import games from '../../data/rivalry-games.json';
import { calculateRivalryRecord } from '../rivalry-record';

const record = calculateRivalryRecord(games);

describe('calculateRivalryRecord', () => {
  it("derives Ohio State's known 1944-to-1952 longest completed drought", () => {
    const ohioState = record.byTeam['Ohio State'];

    expect(ohioState.longest.priorWin.year).toBe(1944);
    expect(ohioState.longest.nextWin.year).toBe(1952);
    expect(ohioState.longest.elapsedGames).toBe(8);
    expect(ohioState.longest.elapsedDays).toBeGreaterThan(2_900);
  });

  it('keeps ties from resetting a team drought', () => {
    const tie = games.find((game) => game.winner === 'Tie');
    const ohioStateDrought = record.completedDroughts.find(
      (drought) => drought.team === 'Ohio State' && drought.priorWin.year < tie!.year && drought.nextWin.year > tie!.year
    );

    expect(tie).toBeDefined();
    expect(ohioStateDrought).toBeDefined();
  });

  it('sorts the public top-five list by elapsed calendar days', () => {
    expect(record.topFiveLongestDroughts).toHaveLength(5);
    expect(record.topFiveLongestDroughts.map((drought) => drought.elapsedDays)).toEqual(
      [...record.topFiveLongestDroughts.map((drought) => drought.elapsedDays)].sort((a, b) => b - a)
    );
  });
});
