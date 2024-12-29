import VAbout from '../pages/VAbout.vue';
import VHome from '../pages/VHome.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: VHome,
  },
  {
    path: '/about',
    name: 'about',
    component: VAbout,
  },
];

export default routes;
