<template>
  <div
    class="playlist-panel"
    :class="{
      opened,
    }"
  >
    <template v-if="player.playlist.length > 0">
      <PlaylistMusicItem
        v-for="(music, index) in player.playlist"
        :key="music.id"
        :music
        :index
      />
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
import { usePlayer } from '~/composables/player';
import PlaylistMusicItem from './PlaylistMusicItem.vue';

const player = usePlayer();
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
  position: fixed;
  top: 0rem;
  bottom: 4rem;
  right: 0rem;
  z-index: 1000;
  width: 30rem;
  max-width: 100dvw;

  padding: 2rem;
  border-left: 0.1rem solid #111d;
  backdrop-filter: blur(0.2rem);
  background-color: #111d;
  box-shadow: 0 0.3rem 2rem #0002;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;

  transition: translate 200ms ease;

  &:not(.opened) {
    translate: 100% 0rem;
  }
}
</style>
