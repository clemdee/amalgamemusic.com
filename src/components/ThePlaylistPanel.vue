<template>
  <div
    class="playlist-panel"
    :class="{
      opened,
      moving: isMoving,
    }"
    :inert="!opened"
  >
    <template v-if="player.playlist.length > 0">
      <ClientOnly>
        <SlickList
          class="list"
          :list="player.playlist"
          axis="y"
          lock-axis="y"
          append-to="#app"
          helper-class="moving-item"
          use-drag-handle
          @sort-start="onSortStart"
          @sort-end="onSortEnd"
        >
          <SlickItem
            v-for="(music, index) in player.playlist"
            :key="player.getUID(music)"
            :index
          >
            <PlaylistMusicItem
              :music
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
import { usePlayer } from '~/composables/player';
import PlaylistMusicItem from './PlaylistMusicItem.vue';

const player = usePlayer();

const isMoving = ref(false);

const onSortStart = () => {
  isMoving.value = true;
};

const onSortEnd = ({ event, oldIndex, newIndex }: {
  event: Event
  oldIndex: number
  newIndex: number
}) => {
  isMoving.value = false;
  player.move(oldIndex, newIndex);
};
</script>

<script lang="ts">
const opened = ref(false);

const open = () => {
  opened.value = true;
};

const close = () => {
  opened.value = false;
};

const toggle = () => {
  opened.value = !opened.value;
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
  width: 30rem;
  max-width: 100dvw;
  max-height: 100%;
  overflow: auto;

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
  }
}
</style>

<style lang="scss">
.moving-item {
  z-index: var(--z-playlist-panel);
}
</style>
