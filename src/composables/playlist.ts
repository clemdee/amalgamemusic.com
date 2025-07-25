import type { Music } from './music';
import { computed, reactive, ref, watch } from 'vue';
import { usePlayer } from './player';

const player = usePlayer();

interface PlaylistItem {
  id: string
  music: Music
};

let __playlistNextUID = 0;
const createPlaylistItem = (music: Music): PlaylistItem => ({
  id: `${__playlistNextUID++}`,
  music,
});

// Group playlist and current index data so that we can batch update them
const _playlistData = ref({
  items: [] as PlaylistItem[],
  index: -1,
});

const items = computed<PlaylistItem[]>(() => _playlistData.value.items);
const currentIndex = computed(() => _playlistData.value.index);

const currentItem = computed<PlaylistItem | undefined>(() => {
  return items.value[currentIndex.value];
});

// Update player current based on playlist current
watch(currentItem, (newItem) => {
  player.current = newItem?.music;
}, { flush: 'sync' });

const _updatePlaylist = (newItems: PlaylistItem[], newCurrentIndex?: number) => {
  if (!newCurrentIndex) {
    newCurrentIndex = newItems.indexOf(currentItem.value!);
  }
  _playlistData.value = {
    items: newItems,
    index: newCurrentIndex,
  };
};

const previous = computed<PlaylistItem | undefined>(() => items.value[currentIndex.value - 1]);
const next = computed<PlaylistItem | undefined>(() => items.value[currentIndex.value + 1]);

const playAtIndex = (index: number) => {
  if (index < 0 || index >= items.value.length) return;
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
  _playlistData.value.items.splice(index, 0, createPlaylistItem(music));
};

const queue = (music: Music) => {
  _queueAtIndex(music, items.value.length);
};

const queueNext = (music: Music) => {
  _queueAtIndex(music, currentIndex.value + 1);
};

const unqueueAtIndex = (index: number) => {
  const isBefore = index < currentIndex.value;
  const isCurrent = index === currentIndex.value;
  const isLast = index === items.value.length - 1;
  const newIndexOffset = isBefore || (isCurrent && isLast) ? -1 : 0;
  const newIndex = _playlistData.value.index + (newIndexOffset);
  const newList = _playlistData.value.items.toSpliced(index, 1);
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
  const itemAtIndex = _playlistData.value.items[oldIndex];
  const newItems = _playlistData.value.items
    .toSpliced(oldIndex, 1)
    .toSpliced(newIndex, 0, itemAtIndex);
  _updatePlaylist(newItems);
};

player.on('end', () => {
  if (!player.isRepeat) {
    playNext();
  }
});

export const usePlaylist = () => {
  return reactive({
    items,
    currentIndex,
    currentItem,
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
