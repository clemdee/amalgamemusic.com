import type { Music } from './music';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const element = ref<HTMLAudioElement>();

const playlist = ref<Music[]>([]);
const currentIndex = ref(-1);

const current = computed<Music | undefined>(() => playlist.value[currentIndex.value]);
const previous = computed<Music | undefined>(() => playlist.value[currentIndex.value - 1]);
const next = computed<Music | undefined>(() => playlist.value[currentIndex.value + 1]);

const playIndex = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return;
  currentIndex.value = index;
};

const playPrevious = () => {
  playIndex(currentIndex.value - 1);
};

const playNext = () => {
  playIndex(currentIndex.value + 1);
};

const _queueAtIndex = (music: Music, index: number) => {
  playlist.value.splice(index, 0, music);
};

const queue = (music: Music) => {
  _queueAtIndex(music, playlist.value.length);
};

const queueNext = (music: Music) => {
  _queueAtIndex(music, currentIndex.value + 1);
};

const unqueueAtIndex = (index: number) => {
  playlist.value.splice(index, 1);
  if (currentIndex.value >= index) {
    currentIndex.value--;
  }
};

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

const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  }
  else {
    play();
  }
};

const hasRepeat = ref(false);

const toggleRepeat = (state?: boolean) => {
  state ??= !hasRepeat.value;
  hasRepeat.value = state;
};

const onEnded = () => {
  if (!hasRepeat.value) {
    playNext();
  }
  else {
    play();
  }
};

watch(current, () => {
  if (!current.value) return;
  if (!element.value) return;
  element.value.src = current.value.src;
  play();
});

watch(element, () => {
  if (!element.value) return;
  element.value.addEventListener('pause', () => {
    isPlaying.value = false;
  });

  element.value.addEventListener('ended', () => {
    onEnded();
  });
});

const currentDuration = ref(0);
const currentTime = ref(0);
const currentTimePercentage = ref(0);

watch(element, () => {
  if (!element.value) return;
  element.value.addEventListener('loadedmetadata', () => {
    currentDuration.value = element.value?.duration ?? Number.NaN;
  });

  element.value.addEventListener('timeupdate', () => {
    currentTime.value = element.value?.currentTime ?? 0;
    currentTimePercentage.value = Number.isNaN(currentDuration.value)
      ? 0
      : currentTime.value / currentDuration.value;
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
    playIndex,
    playPrevious,
    playNext,
    queue,
    queueNext,
    unqueueAtIndex,
    isPlaying,
    play,
    pause,
    togglePlay,
    hasRepeat,
    toggleRepeat,
    currentDuration,
    currentTime,
    currentTimePercentage,
    setTime,
    setTimePercentage,
  });
};
