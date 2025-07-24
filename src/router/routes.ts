import { createRouter, createWebHistory } from 'vue-router';
import VAbout from '../pages/VAbout.vue';
import VBrowse from '../pages/VBrowse.vue';
import VHome from '../pages/VHome.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: VHome,
  },
  {
    path: '/browse',
    name: 'browse',
    component: VBrowse,
  },
  {
    path: '/about',
    name: 'about',
    component: VAbout,
  },
];

export const router = createRouter({
  routes,
  history: createWebHistory(),
});
