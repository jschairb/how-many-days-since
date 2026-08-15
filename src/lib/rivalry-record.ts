export type Team = 'Ohio State' | 'Michigan';

export interface RivalryGame {
  year: number;
  date: string;
  winner: string;
  loser: string;
  wScore: number;
  lScore: number;
}

export interface Drought {
  team: Team;
  priorWin: RivalryGame;
  nextWin: RivalryGame;
  elapsedDays: number;
  elapsedGames: number;
  elapsedSeasons: number;
}

export interface ActiveDrought {
  team: Team;
  startResult: RivalryGame;
  elapsedDays: number;
}

export interface TeamDroughtRecord {
  completedDroughts: Drought[];
  averageDays: number;
  medianDays: number;
  shortest: Drought;
  longest: Drought;
  topFiveLongest: Drought[];
  currentActiveDrought: ActiveDrought | null;
}

export interface DroughtHistoryRow {
  game: RivalryGame;
  losingTeam: Team | null;
  daysSincePriorWin: number | null;
}

export interface RivalryRecord {
  completedDroughts: Drought[];
  byTeam: Record<Team, TeamDroughtRecord>;
  topFiveLongestDroughts: Drought[];
  droughtHistory: DroughtHistoryRow[];
}

const teams: Team[] = ['Ohio State', 'Michigan'];
const monthNumbers: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function calendarDay(game: Pick<RivalryGame, 'year' | 'date'>): number {
  const [, month, day] = game.date.match(/^(\w{3})\s+(\d{1,2})$/) ?? [];
  const monthNumber = monthNumbers[month];

  if (monthNumber === undefined || !day) throw new Error(`Unsupported game date: ${game.date}`);

  return Date.UTC(game.year, monthNumber, Number(day));
}

function newYorkCalendarDay(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]));

  return Date.UTC(values.year, values.month - 1, values.day);
}

function elapsedDays(start: RivalryGame, end: RivalryGame): number {
  return (calendarDay(end) - calendarDay(start)) / 86_400_000;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint];
}

export function calculateRivalryRecord(sourceGames: RivalryGame[], today = new Date()): RivalryRecord {
  const games = [...sourceGames].sort((a, b) => calendarDay(a) - calendarDay(b));
  const completedByTeam: Record<Team, Drought[]> = { 'Ohio State': [], Michigan: [] };
  const previousWins: Partial<Record<Team, { game: RivalryGame; index: number }>> = {};
  const droughtHistory: DroughtHistoryRow[] = [];
  let latestDecisiveGame: RivalryGame | null = null;

  for (const [index, game] of games.entries()) {
    if (game.winner === 'Tie') {
      droughtHistory.push({ game, losingTeam: null, daysSincePriorWin: null });
      continue;
    }

    const winner = game.winner as Team;
    const loser = game.loser as Team;
    const previousWinner = previousWins[winner];
    const previousLoser = previousWins[loser];

    droughtHistory.push({
      game,
      losingTeam: loser,
      daysSincePriorWin: previousLoser ? elapsedDays(previousLoser.game, game) : null,
    });

    if (previousWinner) {
      completedByTeam[winner].push({
        team: winner,
        priorWin: previousWinner.game,
        nextWin: game,
        elapsedDays: elapsedDays(previousWinner.game, game),
        elapsedGames: index - previousWinner.index,
        elapsedSeasons: game.year - previousWinner.game.year,
      });
    }

    previousWins[winner] = { game, index };
    latestDecisiveGame = game;
  }

  const activeTeam = latestDecisiveGame?.loser as Team | undefined;
  const currentDay = newYorkCalendarDay(today);
  const byTeam = Object.fromEntries(
    teams.map((team) => {
      const completedDroughts = completedByTeam[team];
      const days = completedDroughts.map((drought) => drought.elapsedDays);
      const sortedByLength = [...completedDroughts].sort((a, b) => b.elapsedDays - a.elapsedDays);
      const currentActiveDrought = team === activeTeam && latestDecisiveGame
        ? { team, startResult: latestDecisiveGame, elapsedDays: (currentDay - calendarDay(latestDecisiveGame)) / 86_400_000 }
        : null;

      return [team, {
        completedDroughts,
        averageDays: days.reduce((sum, value) => sum + value, 0) / days.length,
        medianDays: median(days),
        shortest: sortedByLength.at(-1)!,
        longest: sortedByLength[0]!,
        topFiveLongest: sortedByLength.slice(0, 5),
        currentActiveDrought,
      }];
    })
  ) as Record<Team, TeamDroughtRecord>;
  const completedDroughts = [...completedByTeam['Ohio State'], ...completedByTeam.Michigan];

  return {
    completedDroughts,
    byTeam,
    topFiveLongestDroughts: [...completedDroughts].sort((a, b) => b.elapsedDays - a.elapsedDays).slice(0, 5),
    droughtHistory: droughtHistory.reverse(),
  };
}
