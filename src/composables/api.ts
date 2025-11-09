export const API_URL = import.meta.env.VITE_API_BASE_URL;

import {
  type Game,
  type Participation,
  type Rating,
  type User,
  type Deck,
  type UserDeck,
  type CreateGameRequest,
  type CreateParticipationRequest,
  type CreateRatingRequest,
  type CreateDeckRequest,
  type UpdateDeckRequest,
  type CreateUserRequest,
  type UpdateUserRequest,
  type LoginRequest,
  type CreateUserDeckRequest,
  type MonthlyStatistics,
  type UserChartData,
  type UserStatisticsSummary,
  UserRole
} from '../types';
import { fetchWrapper } from './fetchWrapper';

// Auth API
export const authApi = {
  validateRole: async () => {
    try {
      const response = await fetchWrapper('/auth/validate-role') as { role: string };

      // Konvertiere String zu Enum
      const roleString = response.role;
      const role = roleString === 'admin' ? UserRole.ADMIN : UserRole.USER;

      return role;

    } catch (error) {
      console.error('❌ Error validating role:', error);
      return UserRole.USER; // Fallback zu USER statt nul
    }
  }
};

/**
 * Game API
 * Verwaltet Spieleinträge im System
 */
export const gameApi = {
  // Alle Spiele abrufen
  getAll: async (): Promise<Game[]> => {
    return await fetchWrapper('/game') as Game[];
  },

  // Ein spezifisches Spiel abrufen
  get: async (id: number): Promise<Game> => {
    return await fetchWrapper(`/game/${id}`) as Game;
  },

  // Neues Spiel erstellen
  create: async (data?: CreateGameRequest): Promise<Game> => {
    return await fetchWrapper('/game', data, 'POST') as Game;
  },

  // Spiel löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/game/${id}`, undefined, 'DELETE');
  },

  // Spiele eines Benutzers abrufen
  getByUser: async (userId: number): Promise<Game[]> => {
    return await fetchWrapper(`/game/user/${userId}`) as Game[];
  }
};

/**
 * Participation API
 * Verwaltet die Teilnahmen an Spielen
 */
export const participationApi = {
  // Alle Teilnahmen abrufen
  getAll: async (): Promise<Participation[]> => {
    return await fetchWrapper('/participation') as Participation[];
  },

  // Eine spezifische Teilnahme abrufen
  get: async (id: number): Promise<Participation> => {
    return await fetchWrapper(`/participation/${id}`) as Participation;
  },

  // Neue Teilnahme erstellen
  create: async (data: CreateParticipationRequest): Promise<Participation> => {
    return await fetchWrapper('/participation', data, 'POST') as Participation;
  },

  // Teilnahme aktualisieren
  update: async (id: number, data: Partial<CreateParticipationRequest>): Promise<Participation> => {
    return await fetchWrapper(`/participation/${id}`, data, 'PUT') as Participation;
  },

  // Mehrere Teilnahmen auf einmal erstellen
  createBulk: async (data: CreateParticipationRequest[]): Promise<Participation[]> => {
    return await fetchWrapper('/participation/bulk', data, 'POST') as Participation[];
  },

  // Teilnahme löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/participation/${id}`, undefined, 'DELETE');
  },

  // Teilnahmen eines bestimmten Spiels abrufen
  getByGame: async (gameId: number): Promise<Participation[]> => {
    return await fetchWrapper(`/participation/game/${gameId}`) as Participation[];
  },

  // Teilnahmen eines bestimmten Benutzers abrufen
  getByUser: async (userId: number): Promise<Participation[]> => {
    return await fetchWrapper(`/participation/user/${userId}`) as Participation[];
  },

  // Teilnahmen mit einem bestimmten Deck abrufen
  getByDeck: async (deckId: number): Promise<Participation[]> => {
    return await fetchWrapper(`/participation/deck/${deckId}`) as Participation[];
  },

  // Gewinner einer Teilnahme setzen
  setWinner: async (id: number): Promise<Participation> => {
    return await fetchWrapper(`/participation/${id}/winner`, undefined, 'PUT') as Participation;
  }
};

/**
 * Rating API
 * Verwaltet die Bewertungen von Spielen
 */
export const ratingApi = {
  // Alle Bewertungen abrufen
  getAll: async (): Promise<Rating[]> => {
    return await fetchWrapper('/rating') as Rating[];
  },

  // Eine spezifische Bewertung abrufen
  get: async (id: number): Promise<Rating> => {
    return await fetchWrapper(`/rating/${id}`) as Rating;
  },

  // Neue Bewertung erstellen
  create: async (data: CreateRatingRequest): Promise<Rating> => {
    return await fetchWrapper('/rating', data, 'POST') as Rating;
  },

  // Bewertung aktualisieren
  update: async (id: number, data: Partial<CreateRatingRequest>): Promise<Rating> => {
    return await fetchWrapper(`/rating/${id}`, data, 'PUT') as Rating;
  },

  // Bewertung löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/rating/${id}`, undefined, 'DELETE');
  },

  // Bewertungen für eine bestimmte Teilnahme abrufen
  getByParticipation: async (participationId: number): Promise<Rating[]> => {
    return await fetchWrapper(`/rating/participation/${participationId}`) as Rating[];
  },

  // Bewertungen von einem bestimmten Benutzer abrufen
  getByRater: async (raterId: number): Promise<Rating[]> => {
    return await fetchWrapper(`/rating/rater/${raterId}`) as Rating[];
  }
};

/**
 * User API
 * Verwaltet Benutzerkonten und Authentifizierung
 */
export const userApi = {
  // Alle Benutzer abrufen
  getAll: async (): Promise<User[]> => {
    return await fetchWrapper('/user') as User[];
  },

  // Einen spezifischen Benutzer abrufen
  get: async (id: number): Promise<User> => {
    return await fetchWrapper(`/user/${id}`) as User;
  },

  // Neuen Benutzer registrieren
  create: async (data: CreateUserRequest): Promise<User> => {
    return await fetchWrapper('/auth/signup', data, 'POST') as User;
  },

  // Benutzer einloggen
  login: async (data: LoginRequest): Promise<{ user: User; token: string }> => {
    return await fetchWrapper('/auth/login', data, 'POST') as { user: User; token: string };
  },

  // Benutzer ausloggen
  logout: async (): Promise<void> => {
    await fetchWrapper('/auth/logout', undefined, 'POST');
  },

  // Benutzer aktualisieren
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    return await fetchWrapper(`/user/${id}`, data, 'PUT') as User;
  },

  // Benutzerrolle aktualisieren
  updateRole: async (id: number, role: UserRole): Promise<User> => {
    return await fetchWrapper(`/user/${id}/role`, { role }, 'PUT') as User;
  },

  // Benutzer löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/user/${id}`, undefined, 'DELETE');
  },

  // Benutzerpasswort ändern
  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await fetchWrapper(`/user/${id}/password`, { password: newPassword }, 'PUT');
  }
};

/**
 * Deck API
 * Verwaltet die Deck-Einträge im System
 */
export const deckApi = {
  // Alle Decks abrufen
  getAll: async (): Promise<Deck[]> => {
    return await fetchWrapper('/deck') as Deck[];
  },

  // Ein spezifisches Deck abrufen
  get: async (id: number): Promise<Deck> => {
    return await fetchWrapper(`/deck/${id}`) as Deck;
  },

  // Neues Deck erstellen
  create: async (data: CreateDeckRequest): Promise<Deck> => {
    return await fetchWrapper('/deck', data, 'POST') as Deck;
  },

  // Deck aktualisieren
  update: async (id: number, data: UpdateDeckRequest): Promise<Deck> => {
    return await fetchWrapper(`/deck/${id}`, data, 'PUT') as Deck;
  },

  // Deck löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/deck/${id}`, undefined, 'DELETE');
  },

  // Decks eines bestimmten Besitzers abrufen
  getByOwner: async (ownerId: number): Promise<Deck[]> => {
    return await fetchWrapper(`/deck/owner/${ownerId}`) as Deck[];
  },

  // Decks mit bestimmtem Commander abrufen
  getByCommander: async (commander: string): Promise<Deck[]> => {
    return await fetchWrapper(`/deck/commander/${commander}`) as Deck[];
  }
};

/**
 * UserDeck API
 * Verwaltet die Zuordnung von Decks zu Benutzern
 */
export const userDeckApi = {
  // Alle Deck-Zuordnungen abrufen
  getAll: async (): Promise<UserDeck[]> => {
    return await fetchWrapper('/user_deck') as UserDeck[];
  },

  // Eine spezifische Deck-Zuordnung abrufen
  get: async (id: number): Promise<UserDeck> => {
    return await fetchWrapper(`/user_deck/${id}`) as UserDeck;
  },

  // Neue Deck-Zuordnung erstellen
  create: async (data: CreateUserDeckRequest): Promise<UserDeck> => {
    return await fetchWrapper('/user_deck', data, 'POST') as UserDeck;
  },

  // Deck-Zuordnung löschen
  delete: async (id: number): Promise<void> => {
    await fetchWrapper(`/user_deck/${id}`, undefined, 'DELETE');
  }
};

// Statistics API
export const statisticsApi = {
  // Monatliche Statistiken für einen Benutzer abrufen
  getUserMonthlyStats: async (userId: number): Promise<MonthlyStatistics[]> => {
    return await fetchWrapper(`/statistics/user/${userId}/monthly`) as MonthlyStatistics[];
  },

  // Chart-Daten für einen Benutzer abrufen
  getUserChartData: async (userId: number): Promise<UserChartData> => {
    return await fetchWrapper(`/statistics/user/${userId}/chart-data`) as UserChartData;
  },

  // Zusammenfassung der Statistiken für einen Benutzer abrufen
  getUserSummary: async (userId: number): Promise<UserStatisticsSummary> => {
    return await fetchWrapper(`/statistics/user/${userId}/summary`) as UserStatisticsSummary;
  }
};
