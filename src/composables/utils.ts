import { hashicon } from '@emeraldpay/hashicon';
import { computed } from 'vue';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

export const useCoverUrl = (hash: string) => computed(() => {
  const canvas = hashicon(hash);
  return canvas.toDataURL();
});
