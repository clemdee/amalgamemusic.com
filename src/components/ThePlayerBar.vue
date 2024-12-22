<template>
  <div
    class="player-bar"
    :class="{
      playing: player.isPlaying,
      disabled: !player.current,
    }"
  >
    <div class="left">
      <MusicItemPlayButton
        class="play-button"
        :playing="player.isPlaying"
        :disabled="!player.current"
        @click="player.togglePlay()"
      />
      <div
        class="title"
        :title="title"
      >
        <span>{{ title }}</span>
      </div>
    </div>

    <div class="middle">
      <button
        :disabled="!player.previous"
        @click="player.playPrevious()"
      >
        <iconify-icon
          icon="mdi:skip-previous"
          title="previous"
        />
      </button>

      <div
        class="time"
        @click="setTime"
      >
        <div class="track">
          <div class="current" />
          <div class="handle" />
        </div>
      </div>

      <button
        :disabled="!player.next"
        @click="player.playNext()"
      >
        <iconify-icon
          icon="mdi:skip-next"
          title="next"
        />
      </button>
    </div>

    <div class="right">
      <button
        :class="{
          off: !player.hasRepeat,
        }"
        @click="player.toggleRepeat()"
      >
        <iconify-icon
          icon="mdi:repeat"
          title="repeat"
        />
      </button>

      <button>
        <iconify-icon
          icon="mdi:copyright"
          title="copyright"
        />
      </button>

      <button>
        <iconify-icon
          icon="mdi:download"
          title="download"
        />
      </button>

      <button
        :class="{
          off: !playlistPanel.opened,
        }"
        @click="playlistPanel.toggle()"
      >
        <iconify-icon
          icon="mdi:playlist-music"
          title="playlist"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePlayer } from '~/composables/player';
import MusicItemPlayButton from './PlayButton.vue';
import { usePlaylistPanel } from './ThePlaylistPanel.vue';

const player = usePlayer();
const playlistPanel = usePlaylistPanel();

const title = computed(() => player.current?.title);
const currentTimePercentage = computed(() => player.currentTimePercentage);

const setTime = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const start = target.offsetLeft;
  const end = start + target.clientWidth;
  const x = event.clientX;
  const percentage = (x - start) / (end - start);
  player.setTimePercentage(percentage);
};
</script>

<style lang="scss" scoped>
.player-bar {
  position: fixed;
  bottom: 0rem;
  left: 0rem;
  right: 0rem;
  z-index: 1000;

  display: flex;

  border-top: 0.1rem solid #fff2;
  backdrop-filter: blur(0.2rem);
  background-color: #fff2;
  box-shadow: 0 0.3rem 2rem #0002;

  iconify-icon {
    font-size: 1.5rem;
  }

  .left,
  .middle,
  .right {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .play-button {
    border-radius: 0.1rem;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;

    span {
      white-space: nowrap;
    }
  }

  .time {
    --percentage: v-bind('currentTimePercentage');
    flex-grow: 1;
    display: inline-grid;
    place-items: center;
    height: 2rem;
    cursor: pointer;

    .track {
      --height: 0.3rem;
      position: relative;
      height: var(--height);
      width: 100%;
      border-radius: 1rem;
      background-color: #446;
      transition: all linear 200ms;

      .current {
        position: absolute;
        inset-block: 0rem;
        inset-inline-start: 0rem;
        width: calc(100% * var(--percentage));
        border-radius: inherit;
        background-color: var(--accent-color);
        transition: all linear 50ms;
      }

      .handle {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: calc(100% * var(--percentage));
        translate: -50% -50%;
        aspect-ratio: 1;
        height: var(--height);
        border: 0rem solid black;
        border-radius: 100%;
        background-color: var(--accent-color);
        transition: all linear 50ms;
      }
    }
  }

  &.disabled {
    .time {
      cursor: default;
      .handle {
        display: none;
      }
    }
  }

  &:not(.disabled) {
    .time:hover {
      .track {
        height: 0.5rem;
      }

      .handle {
        height: 0.9rem;
        border: 0.08rem solid black;
        background-color: #fff;
        transition: all linear 100ms;
        cursor: grab;
      }
    }
  }

  @media (width > 50rem) {
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    height: 4rem;

    .left {
      flex-shrink: 1;
      justify-content: flex-start;
      margin-right: auto;
      min-width: 0;
      max-width: 15rem;
    }

    .middle {
      flex-grow: 1;
      min-width: 15rem;
      max-width: 50rem;
      margin-left: auto;
      margin-right: auto;
    }

    .right {
      justify-content: flex-end;
      margin-left: auto;
      padding-right: 2rem;
    }
  }

  @media (30rem <= width <= 50rem) {
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: stretch;
    gap: 1rem;

    padding: 1rem;

    .left {
      flex-shrink: 1;
      justify-content: flex-start;
      width: 100%;
    }

    .middle {
      flex-grow: 1;
      min-width: 15rem;
    }

    .right {
      justify-content: flex-end;
    }

  }

  @media (width < 30rem) {
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: stretch;
    gap: 1rem;

    padding: 1rem;

    .left {
      flex-shrink: 1;
      justify-content: flex-start;
    }

    .middle {
      flex-grow: 1;
    }

    .right {
      justify-content: flex-end;
    }
  }
}
</style>
