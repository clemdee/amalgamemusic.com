// This file contains code licensed under the Apache 2.0 License
// Copyright https://github.com/emeraldpay/hashicon
// See https://www.apache.org/licenses/LICENSE-2.0 for more details

// Generates a 3d rotating cube instead of a canvas image

import { BLAKE2s } from '@stablelib/blake2s';
import Color from 'colorjs.io';
import { standardFigures } from '~/stores/coverFigures';

export interface Range {
  min: number
  max: number
}

export type Light = 'top' | 'front' | 'right' | 'bottom' | 'back' | 'left';

export interface OptionalParam {
  enabled: boolean
}

export interface Params {
  hue: Range
  saturation: Range
  lightness: Range
  variation: Range & OptionalParam
  shift: Range
  figureAlpha: Range
  light: Partial<Record<Light, number>> & OptionalParam
}

export const defaultCubeParams: Params = {
  hue: { min: 0, max: 360 },
  saturation: { min: 70, max: 100 },
  lightness: { min: 45, max: 65 },
  variation: { min: 5, max: 20, enabled: true },
  shift: { min: 30, max: 60 },
  figureAlpha: { min: 0.7, max: 1.2 },
  light: { top: 10, right: -8, left: -4, enabled: true },
};

export function processParam (param: Range, value: number): number {
  return param.min + (value % (param.max - param.min));
}

const enc = new TextEncoder();
const key = new Uint8Array(enc.encode('emerald/hashicon'));

function hashBlake2 (hash: string): Uint8Array {
  const hasher = new BLAKE2s(16, { key });
  hasher.update(enc.encode(hash));
  return hasher.digest();
}

export function getFaces (hash: string, params: Params) {
  const hashValues = new Uint16Array(hashBlake2(hash));

  const hue = processParam(params.hue, hashValues[0]);
  const saturation = processParam(params.saturation, hashValues[1]);
  const lightness = processParam(params.lightness, hashValues[2]);
  const shift = processParam(params.shift, hashValues[3]);
  const figureAlpha = processParam(params.figureAlpha, hashValues[4]);
  const figureIndex = hashValues[5] % standardFigures.length;
  const figure = standardFigures[figureIndex];

  const faceNames = ['top', 'front', 'right', 'bottom', 'back', 'left'] as const;

  return faceNames.map((faceName, faceIndex) => {
    const face = {
      name: faceName,
      colors: [] as string[],
    };
    for (let i = 0; i < 8; i++) {
      const figureFace = figure[faceIndex % 3];

      const light = params.light.enabled ? (params.light[faceName] ?? 1) : 1;

      // Variations
      const x = Math.round(hashValues[6] / (i + 1));
      const variation = params.variation.enabled ? processParam(params.variation, x) : 0;

      const baseColor = `hsl(${hue + variation}, ${saturation}%, ${lightness + light}%)`;
      if (figureFace[i] > 0) {
        // Accent color
        const alpha = figureFace[i] * figureAlpha / 10;
        const accentColor = `hsl(${hue + shift + variation}, ${saturation}%, ${lightness + light}%)`;
        const _baseColor = new Color(baseColor);
        const _accentColor = _baseColor.mix(accentColor, alpha, { space: 'hsl', outputSpace: 'hsl' });
        face.colors.push(_accentColor.toString());
      }
      else {
        // Base color
        face.colors.push(baseColor);
      }
    }
    return face;
  });
}
