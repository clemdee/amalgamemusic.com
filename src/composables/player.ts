import type { Music } from './music';
import { useStorage, watchImmediate } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';
import { useOn } from './event';
import { connectOutputNode, useAudioContext } from './musicParts';
import { usePartsPlayer } from './partsPlayer';

const { on, dispatch } = useOn(['end']);

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

const current = ref<Music | undefined>(undefined);

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

const currentTime = computed(() => partsPlayer.currentTime);

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

const volume = useStorage('volume', 1);
const isMuted = useStorage('isMuted', false);

const audioContext = useAudioContext();
const volumeNode = new GainNode(audioContext);
connectOutputNode(volumeNode);

watchImmediate([volume, isMuted], () => {
  volumeNode.gain.value = isMuted.value ? 0 : volume.value;
});

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
