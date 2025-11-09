import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import PlayerView from '@/views/PlayerView.vue'
import DeckView from '@/views/DeckView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { useTokenService } from '@/composables/tokenService'
import { fetchWrapper } from '@/composables/fetchWrapper'

const { getAccessToken } = useTokenService();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/player',
      name: 'player',
      component: PlayerView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/decks',
      name: 'decks',
      component: DeckView,
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/deck-browser',
      name: 'deck-browser',
      component: () => import('../views/DeckBrowserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ratings',
      name: 'ratings',
      component: () => import('../views/RatingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*', // Fügen Sie diese Route am Ende hinzu
      name: 'NotFound',
      component: NotFoundView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // Route benötigt keine Authentifizierung
  if (!requiresAuth) {
    next();
    return;
  }

  // Prüfe Token
  const token = getAccessToken();

  if (!token) {
    console.log('Keine Authentifizierung gefunden, leite zu Login weiter');
    next('/login');
    return;
  }

  // Validiere Token beim Backend
  try {
    await fetchWrapper('/auth/validate-role', undefined, 'GET');

    // Admin-Check (User-Daten werden aus Token extrahiert im Backend)
    if (requiresAdmin) {
      // Token decode um Role zu prüfen
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'ADMIN') {
          console.log('Keine Admin-Berechtigung');
          next('/');
          return;
        }
      } catch (error) {
        console.error('Token decode error:', error);
        next('/login');
        return;
      }
    }

    next();
  } catch (error) {
    // Token ungültig oder Session abgelaufen
    console.log('Token-Validierung fehlgeschlagen, leite zu Login weiter',error);
    next('/login');
  }
})

export default router
