import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import PlayerView from '@/views/PlayerView.vue'
import DeckView from '@/views/DeckView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue' // Import der neuen 404-Seite

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

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (!userStr && requiresAuth) {
    next('/login');
    return;
  }

  if (requiresAdmin) {
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'admin') {
      next('/'); // Redirect nicht-Admin User zur Startseite
      return;
    }
  }

  next();
})

export default router
