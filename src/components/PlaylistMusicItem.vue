<template>
  <div
    class="playlist-music-item"
    :class="{
      current: isCurrent,
      playing: isPlaying,
    }"
  >
    <div class="left-part">
      <DragHandle>
        <div class="handle" />
      </DragHandle>

      <div class="cover-container">
        <MusicCover
          class="cover"
          :music="props.music"
          :rotate="isCurrent"
          :shadow="true"
        />

        <div class="controls-container">
          <MusicItemPlayButton
            class="play"
            :playing="isPlaying"
            @click="play"
          />
        </div>
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
        @click="playlist.unqueueAtIndex(props.index)"
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
import { DragHandle } from 'vue-slicksort';
import type { Music } from '~/composables/music';
import { usePlayer } from '~/composables/player';
import { usePlaylist } from '~/composables/playlist';
import MusicCover from './MusicCover.vue';
import MusicItemPlayButton from './PlayButton.vue';

const props = defineProps<{
  index: number
  music: Music
}>();

const player = usePlayer();
const playlist = usePlaylist();

const isCurrent = computed(() => {
  const isCurrentId = playlist.currentItem?.music.id === props.music.id;
  const isCurrentIndex = playlist.currentIndex === props.index;
  return isCurrentId && isCurrentIndex;
});
const isPlaying = computed(() => isCurrent.value && player.isPlaying);

const play = () => {
  if (!isCurrent.value) {
    playlist.playAtIndex(props.index);
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

    .cover-container {
      position: relative;

      .cover {
        width: 3rem;
        padding: 0.25rem;
      }

      .controls-container {
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        width: 0rem;
        opacity: 0;
        transition: opacity 200ms ease-out;
        --size: 3rem;

        .play {
          background-color: transparent;
          box-shadow: none;
        }
      }
    }
  }

  &:hover,
  &:has(.play:focus-visible) {
    .cover {
      filter: brightness(0.5);
    }

    .cover-container .controls-container {
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

  .handle {
    opacity: 0;
    padding: 0.5rem;
    margin-left: -1rem;
    cursor: grab;

    &::before {
      content: '';
      display: block;
      width: 0.4rem;
      height: 1.7rem;
      border-inline: 0.08rem solid #fffd;
    }
  }

  &:hover {
    .handle {
      opacity: 1;
    }

    .right-part {
      display: flex;
    }
  }
}
</style>
