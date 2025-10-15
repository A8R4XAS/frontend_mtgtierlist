// Entity Types
export interface Game {
  id: number;
  createdAt: string;
  user_deck1: GameUserDeck;
  user_deck2: GameUserDeck;
  winner?: {
    user: User;
  };
}

export interface GameUserDeck {
  id: number;
  user: User;
  deck: Deck;
}

export interface Participation {
  id: number;
  user_deck: UserDeck;
  game: Game;
  is_winner: boolean;
  ratings?: Rating[];
}

export interface UserDeck {
  id: number;
  user: User;
  deck: Deck;
}

export interface Rating {
  id: number;
  participation: Participation;
  rater: User;
  value: number;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Deck {
  id: number;
  commander: string;
  thema?: string;
  gameplan?: string;
  tempo?: string;
  tier?: number;
  weaknesses?: string;
  owner?: User;
}

// Request Types
export interface CreateGameRequest {
  date?: string;
}

export interface CreateDeckRequest {
  commander: string;
  thema?: string;
  gameplan?: string;
  tempo?: string;
  tier?: number;
  weaknesses?: string;
  owner: number;
}

export interface UpdateDeckRequest {
  commander?: string;
  thema?: string;
  gameplan?: string;
  tempo?: string;
  tier?: number;
  weaknesses?: string;
  owner?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserDeckRequest {
  user: number;
  deck: number;
}

export interface CreateParticipationRequest {
  user: number;
  deck: number;
  game: number;
  is_winner?: boolean;
}

export interface CreateRatingRequest {
  participation: number;
  rater: number;
  value: number;
}

// Statistics Types
export interface MonthlyStatistics {
  month: string;
  wins: number;
  losses: number;
  total: number;
}

export interface UserChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export interface UserStatisticsSummary {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}
