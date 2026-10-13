import { Club, Match } from '@prisma/client';
import { compareByNameThenId } from '../players/player-ordering';

const POINTS_FOR_WIN = 3;
const POINTS_FOR_DRAW = 1;

export interface StandingRow {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface ClubRecord {
  club: Club;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export function buildStandings(clubs: Club[], matches: Match[]): StandingRow[] {
  const records = new Map(clubs.map((club) => [club.id, emptyRecord(club)]));
  matches.forEach((match) => {
    registerResult(records.get(match.homeClubId)!, match.homeGoals, match.awayGoals);
    registerResult(records.get(match.awayClubId)!, match.awayGoals, match.homeGoals);
  });
  return [...records.values()]
    .map(toUnrankedRow)
    .sort(compareStandings)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

function emptyRecord(club: Club): ClubRecord {
  return { club, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
}

function registerResult(record: ClubRecord, goalsFor: number, goalsAgainst: number): void {
  record.played++;
  record.goalsFor += goalsFor;
  record.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    record.wins++;
  } else if (goalsFor === goalsAgainst) {
    record.draws++;
  } else {
    record.losses++;
  }
}

function toUnrankedRow(record: ClubRecord): StandingRow {
  return {
    position: 0,
    club_id: record.club.id,
    club_name: record.club.name,
    played: record.played,
    wins: record.wins,
    draws: record.draws,
    losses: record.losses,
    goals_for: record.goalsFor,
    goals_against: record.goalsAgainst,
    goal_difference: record.goalsFor - record.goalsAgainst,
    points: record.wins * POINTS_FOR_WIN + record.draws * POINTS_FOR_DRAW,
  };
}

function compareStandings(left: StandingRow, right: StandingRow): number {
  return (
    right.points - left.points ||
    right.goal_difference - left.goal_difference ||
    right.goals_for - left.goals_for ||
    compareByNameThenId(
      { id: left.club_id, name: left.club_name },
      { id: right.club_id, name: right.club_name },
    )
  );
}
