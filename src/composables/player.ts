import type { Music } from './music';
import { computed, reactive, ref } from 'vue';
import { usePlayerCurrent } from './player-current';
import { createAutoWeakMap } from './utils';

const useFormattedSeconds = (seconds: number) => computed(() => {
  seconds = Math.floor(seconds);
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
});

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

const {
  isLoading,
  isPlaying,
  pause,
  play,
  togglePlay,
  currentDuration,
  currentTime,
  setTime,
  hasRepeat,
  toggleRepeat,
  // toggleSeamlessRepeat,
  // hasSeamlessRepeat,
} = usePlayerCurrent({
  current,
  onEnd: () => {
    // eslint-disable-next-line ts/no-use-before-define
    playNext();
  },
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
let _playlistNextUID = 0;
const { get: getUID } = createAutoWeakMap<Music, number>(() => _playlistNextUID++);

const previous = computed<Music | undefined>(() => playlist.value[currentIndex.value - 1]);
const next = computed<Music | undefined>(() => playlist.value[currentIndex.value + 1]);

const playAtIndex = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return;
  _playlistData.value.index = index;
  play();
};

const playPrevious = () => {
  playAtIndex(currentIndex.value - 1);
};

const playNext = () => {
  playAtIndex(currentIndex.value + 1);
};

const _queueAtIndex = (music: Music, index: number) => {
  _playlistData.value.list.splice(index, 0, music.clone());
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

const currentTimePercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 0
    : currentTime.value / currentDuration.value;
});

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

const currentLoopStart = computed(() => current.value?.time.loopStart ?? 0);
const currentLoopStartPercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 0
    : currentLoopStart.value / currentDuration.value;
});

const currentLoopEnd = computed(() => current.value?.time.loopEnd ?? 0);
const currentLoopEndPercentage = computed(() => {
  return Number.isNaN(currentDuration.value)
    ? 0
    : currentLoopEnd.value / currentDuration.value;
});

export const usePlayer = () => {
  return reactive({
    playlist,
    currentIndex,
    current,
    getUID,
    previous,
    next,
    isLoading,
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
    currentLoopStart,
    currentLoopStartPercentage,
    currentLoopEnd,
    currentLoopEndPercentage,
    setTime,
    setTimePercentage,
    formattedCurrentDuration,
    formattedCurrentTime,
  });
};
