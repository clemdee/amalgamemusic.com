<template>
  <div
    class="music-item"
    :class="{
      current: isCurrent,
      playing: isPlaying,
    }"
  >
    <div class="top-part">
      <div class="cover" />
    </div>

    <div class="bottom-part">
      <div class="info-container">
        <span
          class="title"
          :title="props.music.title"
        >
          {{ props.music.title }}
        </span>
      </div>

      <div class="controls-container">
        <MusicItemPlayButton
          class="play"
          :playing="isPlaying"
          @click="play"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Music } from '~/composables/music';
import { usePlayer } from '~/composables/player';
import MusicItemPlayButton from './PlayButton.vue';

const props = defineProps<{
  music: Music
}>();

const player = usePlayer();

const cssUrl = computed(() => `url(${props.music.coverUrl})`);

const isCurrent = computed(() => player.current?.id === props.music.id);
const isPlaying = computed(() => isCurrent.value && player.isPlaying);

const play = () => {
  if (!isCurrent.value) {
    player.queueNext(props.music);
    player.playNext();
  }
  else {
    player.togglePlay();
  }
};
</script>

<style lang="scss" scoped>
.music-item {
  width: 16rem;
  border: 0.1rem solid #fff2;
  border-radius: 1rem;
  backdrop-filter: blur(0.2rem);
  background-color: #fff2;
  box-shadow: 0 0.3rem 2rem #0002;
  transition: background-color 100ms ease;

  .top-part {
    display: grid;
    place-items: center;
    padding: 2rem;

    .cover {
      width: 8rem;
      aspect-ratio: 1;
      background-image: v-bind('cssUrl');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      max-height: 5rem;
      filter: drop-shadow(0.05rem 1rem 0.4rem #fff4);

      img {
        width: 100%;
      }
    }
  }

  .bottom-part {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;

    .info-container {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .controls-container {
      display: flex;
      margin-top: -1rem;
      overflow: hidden;
      width: 0rem;
      opacity: 0;
      transition: opacity 200ms ease-out;
    }
  }

  &:hover,
  &.current,
  &:has(.play:focus-visible) {
    .controls-container {
      width: auto;
      overflow: visible;
      opacity: 1;
    }
  }

  &:hover,
  &:has(.play:focus-visible) {
    background-color: #eef3;
  }
}
</style>
