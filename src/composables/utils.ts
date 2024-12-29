import { computed } from 'vue';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
export const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.download = filename ?? 'file';
  link.href = url;
  link.click();
};

export function createAutoMap<K, V> (
  autoMake: (key: K) => V,
) {
  const map = new Map<K, V>();
  const get = (key: K) => {
    if (!map.has(key)) {
      map.set(key, autoMake(key));
    }
    return map.get(key) as V;
  };

  const use = (key: K) => computed(() => get(key));

  return { get, use };
};

export function createAutoWeakMap<K extends WeakKey, V> (
  autoMake: (key: K) => V,
) {
  const map = new WeakMap<K, V>();
  const get = (key: K) => {
    if (!map.has(key)) {
      map.set(key, autoMake(key));
    }
    return map.get(key) as V;
  };

  const use = (key: K) => computed(() => get(key));

  return { get, use };
};
