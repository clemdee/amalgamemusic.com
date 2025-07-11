export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
export const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.download = filename ?? 'file';
  link.href = url;
  link.click();
};
