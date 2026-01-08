
export enum PlayerRole {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-rounder',
  WICKET_KEEPER = 'WK'
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  role: PlayerRole;
  battingStyle: string;
  bowlingStyle: string;
  profilePic: string;
  career: {
    matches: number;
    runs: number;
    wickets: number;
    highestScore: number;
    bestBowling: string;
    catches: number;
    strikeRate: number;
    economy: number;
  };
}

export interface Ball {
  id: string;
  over: number;
  ballNo: number;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  isWicket: boolean;
  wicketType?: 'Bowled' | 'Caught' | 'Run-out' | 'LBW' | 'Stumped';
  batsmanId: string;
  bowlerId: string;
}

export interface MatchState {
  id: string;
  battingTeamId: string;
  bowlingTeamId: string;
  target: number | null;
  innings: 1 | 2;
  overs: number;
  balls: Ball[];
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  isComplete: boolean;
  playingXIA?: string[];
  playingXIB?: string[];
}

export interface MatchSetupConfig {
  teamAId: string;
  teamBId: string;
  overs: number;
  playingXIA: string[];
  playingXIB: string[];
  tossWinnerId?: string;
  tossChoice?: 'Bat' | 'Bowl';
}

export interface CompletedMatch {
  id: string;
  teamAName: string;
  teamBName: string;
  scoreA: string;
  scoreB: string;
  result: string;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  color: string;
  captainId: string;
  players: string[];
}

export interface PointsTableEntry {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  nrr: number;
  points: number;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'League' | 'Knockout';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  pointsTable: PointsTableEntry[];
}
