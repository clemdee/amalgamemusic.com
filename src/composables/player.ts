import type { Music } from './music';
import { useStorage } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';
import { usePlayerCurrent } from './playerCurrent';

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

const current = ref<Music | undefined>(undefined);

const {
  isLoading,
  isPlaying,
  pause,
  play,
  togglePlay,
  duration,
  currentTime,
  setTime,
  isRepeat,
  toggleRepeat,
  on,
} = usePlayerCurrent({
  current,
});

const volume = useStorage('volume', 1);
const isMuted = useStorage('isMuted', false);

// watchImmediate(volume, (newVolume) => {
//   if (!element.value) return;
//   element.value.volume = newVolume;
// });

// watchImmediate(isMuted, (isMuted) => {
//   if (!element.value) return;
//   element.value.muted = isMuted;
// });

const durationFormatted = computed(() => {
  if (Number.isNaN(duration.value)) {
    return '-';
  }
  return useFormattedSeconds(duration.value).value;
});

const currentTimePercentage = computed(() => {
  return Number.isNaN(duration.value)
    ? 0
    : currentTime.value / duration.value;
});

const currentTimeFormatted = computed(() => {
  if (Number.isNaN(duration.value)) {
    return '-';
  }
  return useFormattedSeconds(currentTime.value).value;
});

const setTimePercentage = (percentage: number) => {
  if (Number.isNaN(duration.value)) {
    setTime(0);
  }
  else {
    setTime(percentage * duration.value);
  }
};

const loopStart = computed(() => current.value?.time?.loopStart ?? 0);
const loopStartPercentage = computed(() => {
  return Number.isNaN(duration.value)
    ? 0
    : loopStart.value / duration.value;
});

const loopEnd = computed(() => current.value?.time?.loopEnd ?? duration.value);
const loopEndPercentage = computed(() => {
  return Number.isNaN(duration.value)
    ? 1
    : loopEnd.value / duration.value;
});

export const usePlayer = () => {
  return reactive({
    current,
    isLoading,
    isPlaying,
    play,
    pause,
    togglePlay,
    isRepeat,
    toggleRepeat,
    volume,
    isMuted,
    duration,
    durationFormatted,
    currentTime,
    currentTimePercentage,
    currentTimeFormatted,
    setTime,
    setTimePercentage,
    loopStart,
    loopStartPercentage,
    loopEnd,
    loopEndPercentage,
    on,
  });
};
