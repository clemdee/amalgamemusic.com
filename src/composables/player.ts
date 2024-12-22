import type { Music } from './music';
import { computed, reactive, ref, watch } from 'vue';

const element = document.createElement('audio');

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
  // if (currentIndex.value === -1) {
  //   currentIndex.value = 0;
  // }
};

const queue = (music: Music) => {
  _queueAtIndex(music, playlist.value.length);
};

const queueNext = (music: Music) => {
  _queueAtIndex(music, currentIndex.value + 1);
};

const isPlaying = ref(false);

const play = () => {
  if (!current.value) return;
  isPlaying.value = true;
  element.play();
};

const pause = () => {
  isPlaying.value = false;
  element.pause();
};

const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  }
  else {
    play();
  }
};

watch(current, () => {
  if (!current.value) return;
  element.src = current.value.src;
  play();
});

element.addEventListener('pause', () => {
  isPlaying.value = false;
});

element.addEventListener('onended', () => {
  playNext();
});

const currentDuration = ref(0);
const currentTime = ref(0);
const currentTimePercentage = ref(0);

element.addEventListener('loadedmetadata', () => {
  currentDuration.value = element.duration;
});

element.addEventListener('timeupdate', () => {
  currentTime.value = element.currentTime;
  currentTimePercentage.value = Number.isNaN(currentDuration.value)
    ? 0
    : element.currentTime / currentDuration.value;
});

const setTime = (seconds: number) => {
  element.currentTime = seconds;
};

const setTimePercentage = (percentage: number) => {
  if (Number.isNaN(currentDuration.value)) {
    setTime(0);
  }
  else {
    setTime(percentage * currentDuration.value);
  }
};

export const player = reactive({
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
  isPlaying,
  play,
  pause,
  togglePlay,
  currentDuration,
  currentTime,
  currentTimePercentage,
  setTime,
  setTimePercentage,
});
