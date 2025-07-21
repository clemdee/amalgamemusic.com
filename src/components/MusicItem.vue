<template>
  <div
    class="music-item"
    :class="{
      current: isCurrent,
      playing: isPlaying,
    }"
  >
    <div class="top-part">
      <MusicCover
        class="cover"
        :music="props.music"
        :shadow="true"
        :rotate="isCurrent"
        :float="isPlaying"
      />
      <MusicItemPlayButton
        class="play"
        :loading="isLoading"
        :playing="isPlaying"
        @click="play"
      />
    </div>

    <div class="bottom-part">
      <div class="info-container">
        <span
          class="title"
          :title="props.music.title"
        >
          {{ props.music.title }}
        </span>

        <MusicTags :tags="props.music.tags" />
      </div>

      <div class="controls-container" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Music } from '~/composables/music';
import { computed } from 'vue';
import { usePlayer } from '~/composables/player';
import { usePlaylist } from '~/composables/playlist';
import MusicCover from './MusicCover.vue';
import MusicTags from './MusicTags.vue';
import MusicItemPlayButton from './PlayButton.vue';

const props = defineProps<{
  music: Music
}>();

const player = usePlayer();
const playlist = usePlaylist();

const isCurrent = computed(() => player.current?.id === props.music.id);
const isLoading = computed(() => isCurrent.value && player.isLoading);
const isPlaying = computed(() => isCurrent.value && player.isPlaying);

const play = () => {
  if (!player.current) {
    playlist.queue(props.music);
    playlist.playAtIndex(playlist.items.length - 1);
  }
  else if (!isCurrent.value) {
    playlist.queueNext(props.music);
    playlist.playNext();
  }
  else {
    player.togglePlay();
  }
};
</script>

<style lang="scss" scoped>
.music-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  border: 0.1rem solid #ffffff09;
  border-radius: 1rem;
  backdrop-filter: blur(0.2rem);
  // box-shadow: 0 0.3rem 2rem #0002;
  transition: background-color 100ms ease;

  .top-part {
    display: grid;
    place-items: center;
    padding: 2rem;

    .cover {
      width: 5rem;
      grid-row: 1;
      grid-column: 1;
    }

    .play-button {
      --_size: 6rem;
      grid-row: 1;
      grid-column: 1;
      z-index: 1;
      box-shadow: none;
      color: white;
      mix-blend-mode: soft-light;
      background: none;
    }
  }

  .bottom-part {
    flex-grow: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;

    .info-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      text-align: center;

      .title {
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .controls-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin-top: -1rem;
      overflow: hidden;
      width: 0rem;
      opacity: 0;
      transition: opacity 200ms ease-out;
    }
  }

  & .play-button:hover,
  &.current,
  &:has(.play:focus-visible) {
    .play-button {
      mix-blend-mode: normal;
      filter: drop-shadow(0rem 0rem 0.2rem #3338);
    }
  }

  &:hover,
  &:has(.play:focus-visible) {
    background-color: #eeeeff18;
  }
}
</style>
