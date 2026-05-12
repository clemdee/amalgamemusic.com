import type { UseRafFnCallbackArguments, UseRafFnOptions } from '@vueuse/core';
import { useRafFn } from '@vueuse/core';

type UseRafFnCallback = (args: UseRafFnCallbackArguments) => void;

export const createSharedRaf = (options?: UseRafFnOptions) => {
  const callbacks = new Set<UseRafFnCallback>();

  const globalCallback: UseRafFnCallback = (args) => {
    callbacks.forEach(callback => callback(args));
  };

  const { isActive: _isActive, pause, resume } = useRafFn(globalCallback, options);

  const request = (callback: UseRafFnCallback) => {
    callbacks.add(callback);
    resume();
  };

  const cancel = (callback: UseRafFnCallback) => {
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      pause();
    }
  };

  const isActive = (callback?: UseRafFnCallback) => {
    if (callback) {
      return callbacks.has(callback);
    }
    return _isActive;
  };

  return {
    request,
    cancel,
    isActive,
    pause,
    resume,
  };
};
