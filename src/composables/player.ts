import type { Music } from './music';
import { tryOnMounted, useStorage, watchImmediate } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';
import { useOn } from './event';

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

const element = ref<HTMLAudioElement>();

const current = ref<Music | undefined>(undefined);

const src = computed<string | undefined>(() => {
  return current.value?.file.src;
});

const isPlaying = ref(false);

const play = () => {
  if (!current.value) return;
  isPlaying.value = true;
  element.value?.play();
};

const pause = () => {
  isPlaying.value = false;
  element.value?.pause();
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

const isRepeat = useStorage('isRepeat', false);

const toggleRepeat = (state?: boolean) => {
  state ??= !isRepeat.value;
  isRepeat.value = state;
};

const { on, dispatch } = useOn(['end']);

const onEnded = () => {
  isPlaying.value = false;
  if (isRepeat.value) {
    play();
  }
  dispatch('end');
};

watch(src, () => {
  if (!element.value) return;
  element.value.src = src.value ?? '';
}, { flush: 'sync' });

watch(element, () => {
  if (!element.value) return;
  element.value.addEventListener('pause', () => {
    isPlaying.value = false;
  });

  element.value.addEventListener('ended', () => {
    onEnded();
  });
});

const volume = useStorage('volume', 1);
const isMuted = useStorage('isMuted', false);

watchImmediate(volume, (newVolume) => {
  if (!element.value) return;
  element.value.volume = newVolume;
});

watchImmediate(isMuted, (isMuted) => {
  if (!element.value) return;
  element.value.muted = isMuted;
});

const duration = ref(Number.NaN);

const durationFormatted = computed(() => {
  if (Number.isNaN(duration.value)) {
    return '-';
  }
  return useFormattedSeconds(duration.value).value;
});

const currentTime = ref(0);

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

const setTime = (seconds: number) => {
  if (!element.value) return;
  element.value.currentTime = seconds;
};

const setTimePercentage = (percentage: number) => {
  if (Number.isNaN(duration.value)) {
    setTime(0);
  }
  else {
    setTime(percentage * duration.value);
  }
};

watch(current, () => {
  if (!current.value) {
    duration.value = Number.NaN;
    currentTime.value = 0;
  }
}, { flush: 'sync' });

watch(element, () => {
  if (!element.value) return;
  element.value.addEventListener('loadedmetadata', () => {
    duration.value = element.value?.duration ?? Number.NaN;
  });

  element.value.addEventListener('timeupdate', () => {
    currentTime.value = element.value?.currentTime ?? 0;
  });
});

const loopStart = computed(() => current.value?.loop?.start ?? 0);
const loopStartPercentage = computed(() => {
  return Number.isNaN(duration.value)
    ? 0
    : loopStart.value / duration.value;
});

const loopEnd = computed(() => current.value?.loop?.end ?? duration.value);
const loopEndPercentage = computed(() => {
  return Number.isNaN(duration.value)
    ? 1
    : loopEnd.value / duration.value;
});

export const usePlayer = () => {
  tryOnMounted(() => {
    if (element.value) return;
    element.value = document.createElement('audio');
  });

  return reactive({
    current,
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
