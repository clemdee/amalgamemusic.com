import { ViteSSG } from 'vite-ssg';
import './assets/styles/reset.scss';

import './assets/styles/base.scss';
// import { createApp } from 'vue'
import App from './App.vue';
import routes from './router/routes';
import 'iconify-icon';

export const createApp = ViteSSG(
  // the root component
  App,
  // vue-router options
  {
    routes,
  },
  // function to have custom setups
  // eslint-disable-next-line unused-imports/no-unused-vars
  ({ app, router, routes, isClient, initialState }) => {
    // app.use(router)

    if (isClient) {
      tsParticles.load('tsparticles', {
        preset: 'stars',
        background: {
          color: '#00001b',
        },
      });
    }

    // app.mount('#app')
  },
);

// const app = createApp(App)
