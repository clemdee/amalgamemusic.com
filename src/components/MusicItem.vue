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
        :url="props.music.coverUrl"
        :shadow="true"
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
import MusicCover from './MusicCover.vue';
import MusicTags from './MusicTags.vue';
import MusicItemPlayButton from './PlayButton.vue';

const props = defineProps<{
  music: Music
}>();

const player = usePlayer();

const isCurrent = computed(() => player.current?.id === props.music.id);
const isPlaying = computed(() => isCurrent.value && player.isPlaying);

const play = () => {
  if (!player.current) {
    player.queue(props.music);
    player.playAtIndex(player.playlist.length - 1);
  }
  else if (!isCurrent.value) {
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

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
      width: 5rem;
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
