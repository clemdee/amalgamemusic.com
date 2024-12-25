<template>
  <div
    class="playlist-music-item"
    :class="{
      current: isCurrent,
      playing: isPlaying,
    }"
  >
    <div class="left-part">
      <div class="cover" />

      <div class="controls-container">
        <MusicItemPlayButton
          class="play"
          :playing="isPlaying"
          @click="play"
        />
      </div>
    </div>

    <div class="middle-part">
      <div class="info-container">
        <span
          class="title"
          :title="props.music.title"
        >
          {{ props.music.title }}
        </span>
      </div>
    </div>

    <div class="right-part">
      <button
        @click="player.unqueueAtIndex(props.index)"
      >
        <iconify-icon
          icon="mdi:close"
          title="remove"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Music } from '~/composables/music';
import { usePlayer } from '~/composables/player';
import { useCoverUrl } from '~/composables/utils';
import MusicItemPlayButton from './PlayButton.vue';

const props = defineProps<{
  index: number
  music: Music
}>();

const player = usePlayer();

const url = useCoverUrl(props.music.id);
const cssUrl = computed(() => `url(${url.value})`);

const isCurrent = computed(() => {
  const isCurrentId = player.current?.id === props.music.id;
  const isCurrentIndex = player.currentIndex === props.index;
  return isCurrentId && isCurrentIndex;
});
const isPlaying = computed(() => isCurrent.value && player.isPlaying);

const play = () => {
  if (!isCurrent.value) {
    player.playAtIndex(props.index);
    player.play();
  }
  else {
    player.togglePlay();
  }
};
</script>

<style lang="scss" scoped>
.playlist-music-item {
  height: 5rem;
  width: 100%;
  border: 0.1rem solid #fff2;
  border-radius: 0.5rem;
  backdrop-filter: blur(0.2rem);
  background-color: #8882;
  box-shadow: 0 0.3rem 2rem #0002;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  transition: background-color 100ms ease;

  .left-part {
    display: flex;
    place-items: center;
    padding: 1rem;

    .cover {
      width: 3rem;
      aspect-ratio: 1;
      background-image: v-bind('cssUrl');
      background-size: 80%;
      background-position: center;
      background-repeat: no-repeat;
      max-height: 5rem;
      filter: drop-shadow(0.05rem 0.5rem 0.2rem #fff4);

      img {
        width: 100%;
      }
    }

    .controls-container {
      overflow: hidden;
      width: 0rem;
      opacity: 0;
      transition: opacity 200ms ease-out;
      --size: 3rem;
    }
  }

  &:hover,
  &.current,
  &:has(.play:focus-visible) {
    .cover {
      display: none;
    }
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

  .middle-part {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;
    padding-left: 0.5rem;

    .info-container {
      overflow: hidden;
      text-overflow: ellipsis;

      .title {
        white-space: nowrap;
      }
    }
  }

  .right-part {
    display: none;
    place-items: center;
    gap: 1rem;
    margin-left: auto;
    padding: 1rem;

    button {
      aspect-ratio: 1;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background-color: #0003;
    }

    iconify-icon {
      font-size: 1.5rem;
    }
  }

  &:hover {
    .right-part {
      display: flex;
    }
  }

}
</style>
