<template>
  <div
    class="playlist-panel"
    :class="{
      opened,
      moving: isMoving,
    }"
    :inert="!opened"
  >
    <h2>Play queue</h2>

    <template v-if="playlist.items.length > 0">
      <ClientOnly>
        <SlickList
          class="list"
          :list="playlist.items"
          axis="y"
          lock-axis="y"
          append-to="#app"
          helper-class="moving-item"
          use-drag-handle
          @sort-start="onSortStart"
          @sort-end="onSortEnd"
        >
          <SlickItem
            v-for="(item, index) in playlist.items"
            :key="item.id"
            :index
          >
            <PlaylistMusicItem
              :music="item.music"
              :index
            />
          </SlickItem>
        </SlickList>
      </ClientOnly>
    </template>

    <div
      v-else
    >
      No item in playlist
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, readonly, ref } from 'vue';
import { SlickItem, SlickList } from 'vue-slicksort';
import { usePlaylist } from '~/composables/playlist';
import { wait } from '~/composables/utils';
import PlaylistMusicItem from './PlaylistMusicItem.vue';

const playlist = usePlaylist();

const isMoving = ref(false);

const onSortStart = () => {
  isMoving.value = true;
};

const onSortEnd = ({ oldIndex, newIndex }: {
  event: Event
  oldIndex: number
  newIndex: number
}) => {
  isMoving.value = false;
  playlist.move(oldIndex, newIndex);
};
</script>

<script lang="ts">
const opened = ref(false);

const open = async () => {
  opened.value = true;
  const current = document.querySelector('.playlist-music-item.current');
  if (!current) return;
  // Make sure opening animation is done to prevent scrolling inline
  await wait(300);
  current.scrollIntoView({
    block: 'nearest',
    behavior: 'smooth',
  });
};

const close = () => {
  opened.value = false;
};

const toggle = () => {
  if (opened.value) {
    close();
  }
  else {
    open();
  }
};

export const usePlaylistPanel = () => {
  return reactive({
    opened: readonly(opened),
    open,
    close,
    toggle,
  });
};
</script>

<style lang="scss" scoped>
.playlist-panel {
  position: absolute;
  top: 0rem;
  bottom: 0rem;
  right: 0rem;
  z-index: var(--z-playlist-panel);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 2rem;

  width: 30rem;
  max-width: 100dvw;
  max-height: 100%;

  padding: 2rem;
  border-left: 0.1rem solid #111d;
  backdrop-filter: blur(0.2rem);
  background-color: #111d;
  box-shadow: 0 0.3rem 2rem #0002;

  transition: translate 200ms ease;

  &:not(.opened) {
    translate: 100% 0rem;
  }

  &.moving {
    user-select: none;
    cursor: grabbing;

    .list {
      pointer-events: none;
    }
  }

  .list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 1rem;
    overflow: auto;
  }
}
</style>

<style lang="scss">
.moving-item {
  z-index: var(--z-playlist-panel);
}
</style>
