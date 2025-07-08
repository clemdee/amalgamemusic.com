<template>
  <div
    class="player-bar"
    :class="{
      playing: player.isPlaying,
      disabled: !player.current,
    }"
  >
    <div class="left">
      <MusicCover
        class="cover"
        :music="player.current"
        :shadow="true"
        :rotate="true"
      />
      <div class="info-container">
        <AutoScrollingText :text="title" />
        <MusicTags
          :tags="tags"
          size="small"
        />
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

      <MusicItemPlayButton
        class="play-button"
        :playing="player.isPlaying"
        :disabled="!player.current"
        @click="player.togglePlay()"
      />

      <div class="current-time">
        {{ player.formattedCurrentTime }}
      </div>

      <div
        class="time"
        @click="setTime"
      >
        <div class="track">
          <div class="current" />
          <div class="handle" />
        </div>

        <div
          v-show="player.hasRepeat"
          class="loop-markers"
        >
          <!-- <div class="loop-marker start" /> -->
          <!-- <div class="loop-marker end" /> -->
        </div>
      </div>

      <div class="current-duration">
        {{ player.formattedCurrentDuration }}
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
      <div class="volume">
        <div class="wrapper">
          <button
            :class="{
              off: player.muted,
            }"
            @click="player.muted = !player.muted"
          >
            <iconify-icon
              :icon="player.muted
                ? 'mdi:volume-off'
                : 'mdi:volume-high'
              "
              :title="player.muted
                ? 'unmute'
                : 'mute'
              "
            />
          </button>
          <div class="volume-slider">
            <input
              v-model="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              orient="vertical"
              :title="`${player.volume}`"
            />
          </div>
        </div>
      </div>

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

      <button
        class="download"
        :class="{
          off: !downloadPopoverOpened,
        }"
        :disabled="!player.current"
        @click="downloadPopoverOpened = !downloadPopoverOpened"
      >
        <!-- <iconify-icon
          icon="mdi:copyright"
          title="copyright"
        /> -->
        <iconify-icon
          icon="mdi:download"
          title="download"
        />
      </button>

      <DownloadPopover
        v-if="player.current"
        v-model="downloadPopoverOpened"
        :music="player.current"
      />

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
import { computed, ref } from 'vue';
import { usePlayer } from '~/composables/player';
import AutoScrollingText from './AutoScrollingText.vue';
import DownloadPopover from './DownloadPopover.vue';
import MusicCover from './MusicCover.vue';
import MusicTags from './MusicTags.vue';
import MusicItemPlayButton from './PlayButton.vue';
import { usePlaylistPanel } from './ThePlaylistPanel.vue';

const player = usePlayer();
const playlistPanel = usePlaylistPanel();

const title = computed(() => player.current?.title ?? '');
const tags = computed(() => player.current?.tags ?? []);
const currentTimePercentage = computed(() => player.currentTimePercentage);

const setTime = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const start = target.offsetLeft;
  const end = start + target.clientWidth;
  const x = event.clientX;
  const percentage = (x - start) / (end - start);
  player.setTimePercentage(percentage);
};

const VOLUME_EXPONENT = 2.5;
const volume = computed({
  get () {
    return player.volume ** (1 / VOLUME_EXPONENT);
  },
  set (sliderVolume: number) {
    player.volume = sliderVolume ** VOLUME_EXPONENT; ;
  },
});

const downloadPopoverOpened = ref(false);
</script>

<style lang="scss" scoped>
.player-bar {
  display: flex;
  width: 100dvw;

  border-top: 0.1rem solid #fff2;
  backdrop-filter: blur(0.2rem);
  background-color: #fff2;
  box-shadow: 0 0.3rem 2rem #0002;

  iconify-icon {
    font-size: 1.5rem;
  }

  button {
    display: grid;
    place-items: center;
    border-radius: 0.1rem;
    outline-offset: 0.2rem;
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

  .cover {
    width: 3rem;
    padding: 0.4rem;
  }

  .play-button {
    --size: 3rem;
    background-color: transparent;
  }

  .current-time,
  .current-duration {
    // Account for font baseline misalignment
    padding-top: 0.3rem;
  }

  .info-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 0.2rem;
    min-width: 0;
    padding-top: 0.3rem;
  }

  .time {
    --percentage: v-bind('currentTimePercentage');
    flex-grow: 1;
    position: relative;
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

    .loop-markers {
      --loop-start-percentage: v-bind('player.currentLoopStartPercentage');
      --loop-end-percentage: v-bind('player.currentLoopEndPercentage');
      width: 100%;
      position: absolute;
      inset-block-start: 0rem;

      .loop-marker {
        position: absolute;
        inset-block-start: 0%;
        height: 0.4rem;
        width: 0.23rem;
        border-radius: 0rem 0rem 0.23rem 0.23rem;
        background-color: var(--accent-color);
        translate: -50%;

        &.start {
          inset-inline-start: calc(100% * var(--loop-start-percentage));
        }

        &.end {
          inset-inline-start: calc(100% * var(--loop-end-percentage));
        }
      }
    }
  }

  .volume {
    --percentage: calc(100% * v-bind('volume'));
    position: relative;
    width: 1.5rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    margin-left: 0.2rem;
    margin-bottom: -0.2rem;

    .wrapper {
      position: absolute;
      bottom: 0rem;

      display: flex;
      flex-direction: column-reverse;
      justify-content: flex-start;
      align-items: center;
      gap: 0.3rem;

      padding: 0.4rem;
      margin: -0.4rem;
      border: 0.1rem solid transparent;
      border-radius: 1rem;
    }

    .volume-slider {
      input[type=range] {
        -webkit-appearance: none;
        height: 6rem;
        margin-top: 0.4rem;
        accent-color: var(--accent-color);
        background-color: transparent;
        cursor: pointer;

        &::-webkit-slider-runnable-track,
        &::-moz-range-track {
          -webkit-appearance: none;
          width: 0.4rem;
          background-color: var(--accent-color);
          background: linear-gradient(to top, var(--accent-color) 0% var(--percentage), #446 var(--percentage) 100%);
          border-radius: 1rem;
        }

        &::-webkit-slider-thumb,
        &::-moz-range-thumb {
          -webkit-appearance: none;
          width: 0.8rem;
          aspect-ratio: 1;
        }
      }
    }

    &:hover {
      .wrapper {
        border-color: #fff2;
        // background-color: #8882;
        // box-shadow: 0 0.3rem 2rem #0002;
      backdrop-filter: blur(0.05rem);
      background-color: #2b2b40aa;
      }
    }

    &:not(:hover) {
      color: gray;

      .volume-slider {
        display: none;
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
      justify-content: flex-start;
      margin-right: auto;
      padding-left: 0.8rem;
      max-width: min(25rem, 30%);
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

    .play-button {
      outline-offset: -0.2rem;
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
      padding-right: 0.5rem;
    }

    &.disabled {
      .left {
        display: none;
      }
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
      padding-right: 0.5rem;
    }

    &.disabled {
      .left {
        display: none;
      }
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
