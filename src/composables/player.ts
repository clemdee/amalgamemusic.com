import type { Music } from './music';
import { tryOnMounted, useStorage } from '@vueuse/core';
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

const currentSrc = computed<string | undefined>(() => {
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

const hasRepeat = useStorage('hasRepeat', false);

const toggleRepeat = (state?: boolean) => {
  state ??= !hasRepeat.value;
  hasRepeat.value = state;
};

const { on, dispatch } = useOn(['end']);

const onEnded = () => {
  isPlaying.value = false;
  if (hasRepeat.value) {
    play();
  }
  dispatch('end');
};

watch(currentSrc, () => {
  if (!element.value) return;
  element.value.src = currentSrc.value ?? '';
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
const muted = useStorage('muted', false);

watch(volume, (newVolume) => {
  if (!element.value) return;
  element.value.volume = newVolume;
});

watch(muted, (isMuted) => {
  if (!element.value) return;
  element.value.muted = isMuted;
});

const currentDuration = ref(Number.NaN);
const currentTime = ref(0);

const currentTimePercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 0
    : currentTime.value / currentDuration.value;
});

watch(current, () => {
  if (!current.value) {
    currentDuration.value = Number.NaN;
    currentTime.value = 0;
  }
}, { flush: 'sync' });

watch(element, () => {
  if (!element.value) return;
  element.value.addEventListener('loadedmetadata', () => {
    currentDuration.value = element.value?.duration ?? Number.NaN;
  });

  element.value.addEventListener('timeupdate', () => {
    currentTime.value = element.value?.currentTime ?? 0;
  });
});

const setTime = (seconds: number) => {
  if (!element.value) return;
  element.value.currentTime = seconds;
};

const setTimePercentage = (percentage: number) => {
  if (Number.isNaN(currentDuration.value)) {
    setTime(0);
  }
  else {
    setTime(percentage * currentDuration.value);
  }
};

const formattedCurrentDuration = computed(() => {
  if (Number.isNaN(currentDuration.value)) {
    return '-';
  }
  return useFormattedSeconds(currentDuration.value).value;
});

const formattedCurrentTime = computed(() => {
  if (Number.isNaN(currentDuration.value)) {
    return '-';
  }
  return useFormattedSeconds(currentTime.value).value;
});

const currentLoopStart = computed(() => current.value?.loop?.start ?? 0);
const currentLoopStartPercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 0
    : currentLoopStart.value / currentDuration.value;
});

const currentLoopEnd = computed(() => current.value?.loop?.end ?? currentDuration.value);
const currentLoopEndPercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 1
    : currentLoopEnd.value / currentDuration.value;
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
    hasRepeat,
    toggleRepeat,
    volume,
    muted,
    currentDuration,
    currentTime,
    currentTimePercentage,
    setTime,
    setTimePercentage,
    currentLoopStart,
    currentLoopStartPercentage,
    currentLoopEnd,
    currentLoopEndPercentage,
    formattedCurrentDuration,
    formattedCurrentTime,
    on,
  });
};
