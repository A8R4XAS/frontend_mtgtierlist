export const API_URL = import.meta.env.VITE_API_BASE_URL;

import type {
  Game,
  Participation,
  Rating,
  User,
  Deck,
  UserDeck,
  CreateGameRequest,
  CreateParticipationRequest,
  CreateRatingRequest,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  CreateUserDeckRequest,
  MonthlyStatistics,
  UserChartData,
  UserStatisticsSummary
} from '../types';
import { fetchWrapper } from './fetchWrapper';

// Auth API
export const authApi = {
  validateRole: async () => {
    try {
      const response = await fetchWrapper('/auth/validate-role');
      return response.role;
    } catch (error) {
      console.error('Error validating role:', error);
      return null;
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
    return fetchWrapper('/game');
  },

  // Ein spezifisches Spiel abrufen
  get: async (id: number): Promise<Game> => {
    return fetchWrapper(`/game/${id}`);
  },

  // Neues Spiel erstellen
  create: async (data?: CreateGameRequest): Promise<Game> => {
    return fetchWrapper('/game', data, 'POST');
  },

  // Spiel löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/game/${id}`, undefined, 'DELETE');
  },

  // Spiele eines Benutzers abrufen
  getByUser: async (userId: number): Promise<Game[]> => {
    return fetchWrapper(`/game/user/${userId}`);
  }
};

/**
 * Participation API
 * Verwaltet die Teilnahmen an Spielen
 */
export const participationApi = {
  // Alle Teilnahmen abrufen
  getAll: async (): Promise<Participation[]> => {
    return fetchWrapper('/participation');
  },

  // Eine spezifische Teilnahme abrufen
  get: async (id: number): Promise<Participation> => {
    return fetchWrapper(`/participation/${id}`);
  },

  // Neue Teilnahme erstellen
  create: async (data: CreateParticipationRequest): Promise<Participation> => {
    return fetchWrapper('/participation', data, 'POST');
  },

  // Teilnahme aktualisieren
  update: async (id: number, data: Partial<CreateParticipationRequest>): Promise<Participation> => {
    return fetchWrapper(`/participation/${id}`, data, 'PUT');
  },

  // Mehrere Teilnahmen auf einmal erstellen
  createBulk: async (data: CreateParticipationRequest[]): Promise<Participation[]> => {
    return fetchWrapper('/participation/bulk', data, 'POST');
  },

  // Teilnahme löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/participation/${id}`, undefined, 'DELETE');
  },

  // Teilnahmen eines bestimmten Spiels abrufen
  getByGame: async (gameId: number): Promise<Participation[]> => {
    return fetchWrapper(`/participation/game/${gameId}`);
  },

  // Teilnahmen eines bestimmten Benutzers abrufen
  getByUser: async (userId: number): Promise<Participation[]> => {
    return fetchWrapper(`/participation/user/${userId}`);
  },

  // Teilnahmen mit einem bestimmten Deck abrufen
  getByDeck: async (deckId: number): Promise<Participation[]> => {
    return fetchWrapper(`/participation/deck/${deckId}`);
  },

  // Gewinner einer Teilnahme setzen
  setWinner: async (id: number): Promise<Participation> => {
    return fetchWrapper(`/participation/${id}/winner`, undefined, 'PUT');
  }
};

/**
 * Rating API
 * Verwaltet die Bewertungen von Spielen
 */
export const ratingApi = {
  // Alle Bewertungen abrufen
  getAll: async (): Promise<Rating[]> => {
    return fetchWrapper('/rating');
  },

  // Eine spezifische Bewertung abrufen
  get: async (id: number): Promise<Rating> => {
    return fetchWrapper(`/rating/${id}`);
  },

  // Neue Bewertung erstellen
  create: async (data: CreateRatingRequest): Promise<Rating> => {
    return fetchWrapper('/rating', data, 'POST');
  },

  // Bewertung aktualisieren
  update: async (id: number, data: Partial<CreateRatingRequest>): Promise<Rating> => {
    return fetchWrapper(`/rating/${id}`, data, 'PUT');
  },

  // Bewertung löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/rating/${id}`, undefined, 'DELETE');
  },

  // Bewertungen für eine bestimmte Teilnahme abrufen
  getByParticipation: async (participationId: number): Promise<Rating[]> => {
    return fetchWrapper(`/rating/participation/${participationId}`);
  },

  // Bewertungen von einem bestimmten Benutzer abrufen
  getByRater: async (raterId: number): Promise<Rating[]> => {
    return fetchWrapper(`/rating/rater/${raterId}`);
  }
};

/**
 * User API
 * Verwaltet Benutzerkonten und Authentifizierung
 */
export const userApi = {
  // Alle Benutzer abrufen
  getAll: async (): Promise<User[]> => {
    return fetchWrapper('/user');
  },

  // Einen spezifischen Benutzer abrufen
  get: async (id: number): Promise<User> => {
    return fetchWrapper(`/user/${id}`);
  },

  // Neuen Benutzer registrieren
  create: async (data: CreateUserRequest): Promise<User> => {
    return fetchWrapper('/auth/signup', data, 'POST');
  },

  // Benutzer einloggen
  login: async (data: LoginRequest): Promise<{ user: User; token: string }> => {
    return fetchWrapper('/auth/login', data, 'POST');
  },

  // Benutzer ausloggen
  logout: async (): Promise<void> => {
    return fetchWrapper('/auth/logout', undefined, 'POST');
  },

  // Benutzer aktualisieren
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    return fetchWrapper(`/user/${id}`, data, 'PUT');
  },

  // Benutzer löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/user/${id}`, undefined, 'DELETE');
  },

  // Benutzerpasswort ändern
  changePassword: async (id: number, newPassword: string): Promise<void> => {
    return fetchWrapper(`/user/${id}/password`, { password: newPassword }, 'PUT');
  }
};

/**
 * Deck API
 * Verwaltet die Deck-Einträge im System
 */
export const deckApi = {
  // Alle Decks abrufen
  getAll: async (): Promise<Deck[]> => {
    return fetchWrapper('/deck');
  },

  // Ein spezifisches Deck abrufen
  get: async (id: number): Promise<Deck> => {
    return fetchWrapper(`/deck/${id}`);
  },

  // Neues Deck erstellen
  create: async (data: CreateDeckRequest): Promise<Deck> => {
    return fetchWrapper('/deck', data, 'POST');
  },

  // Deck aktualisieren
  update: async (id: number, data: UpdateDeckRequest): Promise<Deck> => {
    return fetchWrapper(`/deck/${id}`, data, 'PUT');
  },

  // Deck löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/deck/${id}`, undefined, 'DELETE');
  },

  // Decks eines bestimmten Besitzers abrufen
  getByOwner: async (ownerId: number): Promise<Deck[]> => {
    return fetchWrapper(`/deck/owner/${ownerId}`);
  },

  // Decks mit bestimmtem Commander abrufen
  getByCommander: async (commander: string): Promise<Deck[]> => {
    return fetchWrapper(`/deck/commander/${commander}`);
  }
};

/**
 * UserDeck API
 * Verwaltet die Zuordnung von Decks zu Benutzern
 */
export const userDeckApi = {
  // Alle Deck-Zuordnungen abrufen
  getAll: async (): Promise<UserDeck[]> => {
    return fetchWrapper('/user_deck');
  },

  // Eine spezifische Deck-Zuordnung abrufen
  get: async (id: number): Promise<UserDeck> => {
    return fetchWrapper(`/user_deck/${id}`);
  },

  // Neue Deck-Zuordnung erstellen
  create: async (data: CreateUserDeckRequest): Promise<UserDeck> => {
    return fetchWrapper('/user_deck', data, 'POST');
  },

  // Deck-Zuordnung löschen
  delete: async (id: number): Promise<void> => {
    return fetchWrapper(`/user_deck/${id}`, undefined, 'DELETE');
  }
};

// Statistics API
export const statisticsApi = {
  // Monatliche Statistiken für einen Benutzer abrufen
  getUserMonthlyStats: async (userId: number): Promise<MonthlyStatistics[]> => {
    return fetchWrapper(`/statistics/user/${userId}/monthly`);
  },

  // Chart-Daten für einen Benutzer abrufen
  getUserChartData: async (userId: number): Promise<UserChartData> => {
    return fetchWrapper(`/statistics/user/${userId}/chart-data`);
  },

  // Zusammenfassung der Statistiken für einen Benutzer abrufen
  getUserSummary: async (userId: number): Promise<UserStatisticsSummary> => {
    return fetchWrapper(`/statistics/user/${userId}/summary`);
  }
};
