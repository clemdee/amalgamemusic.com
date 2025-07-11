import type { Music } from './music';
import { computed, reactive, ref, watch } from 'vue';
import { usePlayer } from './player';
import { createAutoWeakMap } from './utils';

// Wrap inside computed to avoid ReferenceError from cyclic import
const player = usePlayer();

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

// Update player current based on playlist current
watch(current, (newCurrent) => {
  player.current = newCurrent;
}, { flush: 'sync' });

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

const playAtIndex = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return;
  _playlistData.value.index = index;
  player.play();
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
  const wasPlaying = player.isPlaying;
  if (isCurrent && wasPlaying) {
    // Needed so that audio element does not stop
    player.pause();
  }
  _updatePlaylist(newList, newIndex);
  if (isCurrent && wasPlaying) {
    player.play();
  }
};

const move = (oldIndex: number, newIndex: number) => {
  const musicAtIndex = _playlistData.value.list[oldIndex];
  const newList = _playlistData.value.list
    .toSpliced(oldIndex, 1)
    .toSpliced(newIndex, 0, musicAtIndex);
  _updatePlaylist(newList);
};

player.on('end', () => {
  if (!player.hasRepeat) {
    playNext();
  }
});

export const usePlaylist = () => {
  return reactive({
    playlist,
    currentIndex,
    current,
    getUID,
    previous,
    next,
    playAtIndex,
    playPrevious,
    playNext,
    queue,
    queueNext,
    unqueueAtIndex,
    move,
  });
};
