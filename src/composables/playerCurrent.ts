import type { Music } from './music';
import { watchImmediate } from '@vueuse/core';
import { computed, type MaybeRef, readonly, ref, toRef } from 'vue';
import { usePartsPlayer } from './partsPlayer';
import { useTimer } from './timer';

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

  const loopStart = computed(() => current.value?.time.loopStart ?? 0);
  const loopEnd = computed(() => current.value?.time.loopEnd ?? 0);
  const duration = computed(() => current.value?.time?.duration ?? Number.NaN);

  const timer = useTimer({
    timeout: 200,
    duration,
    loop: hasRepeat,
    loopStart,
    loopEnd,
    onLoop: () => {
      // eslint-disable-next-line ts/no-use-before-define
      partsPlayer.planExtraLoop();
    },
    onEnd: () => parameters.onEnd(),
  });

  const currentTime = computed({
    get: () => timer.time,
    set: value => void timer.update(value),
  });

  const partsPlayer = usePartsPlayer({
    current,
    currentTime,
    hasRepeat,
  });

  const isLoading = ref(false);
  const isPlaying = computed(() => timer.running);

  const pause = () => {
    partsPlayer.pause();
    timer.pause();
  };

  const play = async () => {
    if (!current.value) return;
    if (isLoading.value) return;
    isLoading.value = true;
    await partsPlayer.play();
    isLoading.value = false;
    timer.resume();
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
    currentTime.value = seconds;
    if (isPlaying.value) {
      play();
    }
  };

  watchImmediate(hasRepeat, () => {
    if (!isPlaying.value) return;
    play();
  });

  watchImmediate(current, () => {
    currentTime.value = 0;
    pause();
  });

  return {
    isLoading: readonly(isLoading),
    isPlaying: readonly(isPlaying),
    currentTime: readonly(currentTime),
    currentDuration: readonly(duration),
    setTime,
    play,
    pause,
    togglePlay,
    hasRepeat,
    toggleRepeat,
  };
};
