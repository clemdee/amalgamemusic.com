import { hashicon } from '@emeraldpay/hashicon';
import { computed } from 'vue';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

export const useCoverUrl = (hash: string) => computed(() => {
  const canvas = hashicon(hash);
  return canvas.toDataURL();
});

export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.download = filename ?? 'file';
  link.href = url;
  link.click();
};
