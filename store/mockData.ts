
import { Player, PlayerRole, Team, Tournament } from '../types';

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Rahul Sharma',
    nickname: 'The Finisher',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right Arm Fast',
    profilePic: 'https://picsum.photos/seed/rahul/200',
    career: {
      matches: 45,
      runs: 1240,
      wickets: 32,
      highestScore: 82,
      bestBowling: '4/12',
      catches: 15,
      strikeRate: 145.5,
      economy: 6.8
    }
  },
  {
    id: 'p2',
    name: 'Sameer Khan',
    nickname: 'Yorker King',
    role: PlayerRole.BOWLER,
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right Arm Pace',
    profilePic: 'https://picsum.photos/seed/sameer/200',
    career: {
      matches: 52,
      runs: 310,
      wickets: 78,
      highestScore: 24,
      bestBowling: '5/10',
      catches: 8,
      strikeRate: 98.2,
      economy: 5.4
    }
  },
  {
    id: 'p3',
    name: 'Vijay Das',
    nickname: 'VJ',
    role: PlayerRole.BATSMAN,
    battingStyle: 'Left Hand',
    bowlingStyle: 'Off Break',
    profilePic: 'https://picsum.photos/seed/vijay/200',
    career: {
      matches: 38,
      runs: 1560,
      wickets: 5,
      highestScore: 104,
      bestBowling: '2/15',
      catches: 12,
      strikeRate: 162.0,
      economy: 8.2
    }
  },
  {
    id: 'p4',
    name: 'Amit Patel',
    nickname: 'Glovey',
    role: PlayerRole.WICKET_KEEPER,
    battingStyle: 'Right Hand',
    bowlingStyle: 'N/A',
    profilePic: 'https://picsum.photos/seed/amit/200',
    career: {
      matches: 41,
      runs: 890,
      wickets: 0,
      highestScore: 65,
      bestBowling: '0/0',
      catches: 34,
      strikeRate: 128.4,
      economy: 0
    }
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Gully Strikers',
    logo: '⚡',
    color: '#fbbf24',
    captainId: 'p1',
    players: ['p1', 'p2']
  },
  {
    id: 't2',
    name: 'Street Warriors',
    logo: '⚔️',
    color: '#ef4444',
    captainId: 'p3',
    players: ['p3', 'p4']
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    name: 'Gully Premier League 2024',
    format: 'League',
    status: 'Ongoing',
    pointsTable: [
      { teamId: 't1', played: 3, won: 2, lost: 1, nrr: 0.450, points: 4 },
      { teamId: 't2', played: 3, won: 1, lost: 2, nrr: -0.210, points: 2 }
    ]
  }
];
