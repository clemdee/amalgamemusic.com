import type { Music } from './music';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

const element = ref<HTMLAudioElement>();

// Group playlist and current index data so that we can batch update them
const playlistData = ref({
  list: [] as Music[],
  index: -1,
});

const playlist = computed(() => playlistData.value.list);
const currentIndex = computed(() => playlistData.value.index);

const current = computed<Music | undefined>(() => {
  return playlist.value[currentIndex.value];
});

const previous = computed<Music | undefined>(() => playlist.value[currentIndex.value - 1]);
const next = computed<Music | undefined>(() => playlist.value[currentIndex.value + 1]);

const currentSrc = computed<string | undefined>(() => {
  return current.value?.src;
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

const playIndex = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return;
  playlistData.value.index = index;
};

const playPrevious = () => {
  playIndex(currentIndex.value - 1);
  play();
};

const playNext = () => {
  playIndex(currentIndex.value + 1);
  play();
};

const _queueAtIndex = (music: Music, index: number) => {
  playlistData.value.list.splice(index, 0, music);
};

const queue = (music: Music) => {
  _queueAtIndex(music, playlist.value.length);
};

const queueNext = (music: Music) => {
  _queueAtIndex(music, currentIndex.value + 1);
};

const unqueueAtIndex = (index: number) => {
  const isBefore = index < currentIndex.value;
  const isCurrent = index === currentIndex.value;
  const isLast = index === playlist.value.length - 1;
  const newIndexOffset = isBefore || (isCurrent && isLast) ? -1 : 0;
  const wasPlaying = isPlaying.value;
  if (isCurrent && wasPlaying) {
    // Needed so that audio element does not stop
    pause();
  }
  playlistData.value = {
    list: playlistData.value.list.toSpliced(index, 1),
    index: playlistData.value.index + (newIndexOffset),
  };
  if (isCurrent && wasPlaying) {
    play();
  }
};

const hasRepeat = ref(false);

const toggleRepeat = (state?: boolean) => {
  state ??= !hasRepeat.value;
  hasRepeat.value = state;
};

const onEnded = () => {
  isPlaying.value = false;
  if (!hasRepeat.value) {
    playNext();
  }
  else {
    play();
  }
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

export const usePlayer = () => {
  onMounted(() => {
    if (element.value) return;
    element.value = document.createElement('audio');
  });

  return reactive({
    playlist,
    currentIndex,
    current,
    previous,
    next,
    isPlaying,
    play,
    pause,
    togglePlay,
    playIndex,
    playPrevious,
    playNext,
    queue,
    queueNext,
    unqueueAtIndex,
    hasRepeat,
    toggleRepeat,
    currentDuration,
    currentTime,
    currentTimePercentage,
    setTime,
    setTimePercentage,
    formattedCurrentDuration,
    formattedCurrentTime,
  });
};
