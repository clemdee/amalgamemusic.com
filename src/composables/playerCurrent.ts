import type { Music } from './music';
import { watchImmediate } from '@vueuse/core';
import { computed, type MaybeRef, readonly, ref, toRef } from 'vue';
import { usePartsPlayer } from './partsPlayer';

export const usePlayerCurrent = (parameters: {
  current: MaybeRef<Music | undefined>
  onEnd: () => void
}) => {
  const current = toRef(parameters.current);

  const hasRepeat = ref(true);

  const toggleRepeat = (state?: boolean) => {
    state ??= !hasRepeat.value;
    hasRepeat.value = state;
  };

  const duration = computed(() => current.value?.time?.duration ?? Number.NaN);

  const partsPlayer = usePartsPlayer({
    current,
    hasRepeat,
  });

  const isLoading = ref(false);
  const isPlaying = ref(false);

  const pause = () => {
    partsPlayer.pause();
    isPlaying.value = false;
  };

  const play = async () => {
    if (!current.value) return;
    if (isLoading.value) return;
    isLoading.value = true;
    await partsPlayer.play();
    isLoading.value = false;
    isPlaying.value = true;
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

  watchImmediate(hasRepeat, () => {
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
      parameters.onEnd();
    }
  });

  return {
    isLoading: readonly(isLoading),
    isPlaying: readonly(isPlaying),
    currentTime: readonly(toRef(() => partsPlayer.currentTime)),
    currentDuration: readonly(duration),
    setTime,
    play,
    pause,
    togglePlay,
    hasRepeat,
    toggleRepeat,
  };
};
