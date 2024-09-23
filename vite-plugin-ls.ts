/**
 * Lists directory file paths as JSON array
 */
import type { Plugin } from 'vite';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const getLsPath = (source: string) => {
  try {
    const url = new URL(source);
    if (url.protocol !== 'virtual:')
      return null;
    if (url.pathname !== 'ls')
      return null;
    return url.searchParams.get('path');
  }
  catch {
    return null;
  }
};

export default function lsPlugin (): Plugin {
  return {
    name: 'vite-plugin-ls',
    enforce: 'pre',

    resolveId (source) {
      if (getLsPath(source)) {
        return `\0${source}`;
      }
    },

    load (id) {
      const path = getLsPath(id);
      if (path) {
        const absolutePath = join(__dirname, path);
        const files = readdirSync(absolutePath);
        return `export default ${JSON.stringify(files)}`;
      }
    },
  };
}
