import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router/routes';
import './assets/styles/reset.scss';
import './assets/styles/base.scss';

import 'iconify-icon';

const app = createApp(App);
app.use(router);
app.mount('#app');

tsParticles.load('tsparticles', {
  preset: 'stars',
  background: {
    color: '#00001b',
  },
  particles: {
    size: {
      value: { min: 0.5, max: 1.5 },
    },
  },
});
