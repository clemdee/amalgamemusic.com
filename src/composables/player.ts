import type { Music } from './music';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { createAutoWeakMap } from './utils';

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

const element = ref<HTMLAudioElement>();

// Group playlist and current index data so that we can batch update them
const _playlistData = ref({
  list: [] as Music[],
  index: -1,
});

const playlist = computed(() => _playlistData.value.list);
const currentIndex = computed(() => _playlistData.value.index);

const current = computed<Music | undefined>(() => {
  return playlist.value[currentIndex.value];
});

const _updatePlaylist = (newPlaylist: Music[], newCurrentIndex?: number) => {
  if (!newCurrentIndex) {
    newCurrentIndex = newPlaylist.indexOf(current.value!);
  }
  _playlistData.value = {
    list: newPlaylist,
    index: newCurrentIndex,
  };
};

// Needed to have playlist work with reordering
let __playlistNextUID = 0;
const { get: getUID } = createAutoWeakMap<Music, number>(() => __playlistNextUID++);

const previous = computed<Music | undefined>(() => playlist.value[currentIndex.value - 1]);
const next = computed<Music | undefined>(() => playlist.value[currentIndex.value + 1]);

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

const playAtIndex = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return;
  _playlistData.value.index = index;
};

const playPrevious = () => {
  playAtIndex(currentIndex.value - 1);
  play();
};

const playNext = () => {
  playAtIndex(currentIndex.value + 1);
  play();
};

const _queueAtIndex = (music: Music, index: number) => {
  _playlistData.value.list.splice(index, 0, music);
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
  const newIndex = _playlistData.value.index + (newIndexOffset);
  const newList = _playlistData.value.list.toSpliced(index, 1);
  const wasPlaying = isPlaying.value;
  if (isCurrent && wasPlaying) {
    // Needed so that audio element does not stop
    pause();
  }
  _updatePlaylist(newList, newIndex);
  if (isCurrent && wasPlaying) {
    play();
  }
};

const move = (oldIndex: number, newIndex: number) => {
  const musicAtIndex = _playlistData.value.list[oldIndex];
  const newList = _playlistData.value.list
    .toSpliced(oldIndex, 1)
    .toSpliced(newIndex, 0, musicAtIndex);
  _updatePlaylist(newList);
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
    getUID,
    previous,
    next,
    isPlaying,
    play,
    pause,
    togglePlay,
    playAtIndex,
    playPrevious,
    playNext,
    queue,
    queueNext,
    unqueueAtIndex,
    move,
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
