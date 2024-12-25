import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import routes from './router/routes';
import './assets/styles/reset.scss';
import './assets/styles/base.scss';
import 'iconify-icon';

export const createApp = ViteSSG(
  App,
  {
    routes,
  },

  ({ isClient }) => {
    if (isClient) {
      tsParticles.load('tsparticles', {
        preset: 'stars',
        background: {
          color: '#00001b',
        },
      });
    }
  },
);
