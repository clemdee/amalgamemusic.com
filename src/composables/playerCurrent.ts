import type { MaybeRef } from 'vue';
import type { Music } from './music';
import { watchImmediate } from '@vueuse/core';
import { computed, readonly, ref, toRef } from 'vue';
import { useOn } from './event';
import { usePartsPlayer } from './partsPlayer';

export const usePlayerCurrent = (parameters: {
  current: MaybeRef<Music | undefined>
}) => {
  const current = toRef(parameters.current);

  const { on, dispatch } = useOn(['end']);

  const isRepeat = ref(true);

  const toggleRepeat = (state?: boolean) => {
    state ??= !isRepeat.value;
    isRepeat.value = state;
  };

  const duration = computed(() => current.value?.time?.duration ?? Number.NaN);

  const partsPlayer = usePartsPlayer({
    current,
    isRepeat,
  });

  const isLoading = ref(false);
  const isPlaying = computed(() => partsPlayer.isPlaying);

  const pause = () => {
    partsPlayer.pause();
  };

  const play = async () => {
    if (!current.value) return;
    if (isLoading.value) return;
    isLoading.value = true;
    await partsPlayer.play();
    isLoading.value = false;
  };

  const togglePlay = (state?: boolean) => {
    state ??= !isPlaying.value;
    if (!state) {
      pause();
    }
    else {
      play();
    }
  };

  const setTime = (seconds: number) => {
    if (!current.value) return;
    if (isLoading.value) return;
    partsPlayer.currentTime = seconds;
    if (isPlaying.value) {
      play();
    }
  };

  watchImmediate(isRepeat, () => {
    if (!isPlaying.value) return;
    play();
  });

  watchImmediate(current, () => {
    partsPlayer.currentTime = 0;
    pause();
  });

  watchImmediate(() => partsPlayer.currentTime, (currentTime) => {
    if (currentTime >= duration.value) {
      pause();
      partsPlayer.currentTime = 0;
      dispatch('end');
    }
  });

  return {
    isLoading: readonly(isLoading),
    isPlaying: readonly(isPlaying),
    currentTime: readonly(toRef(() => partsPlayer.currentTime)),
    duration: readonly(duration),
    setTime,
    play,
    pause,
    togglePlay,
    isRepeat,
    toggleRepeat,
    on,
  };
};
