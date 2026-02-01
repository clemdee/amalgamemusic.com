<template>
  <div
    class="player-bar"
    :class="{
      loading: player.isLoading,
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
        :disabled="!playlist.previous"
        @click="playlist.playPrevious()"
      >
        <iconify-icon
          icon="mdi:skip-previous"
          title="previous"
        />
      </button>

      <MusicItemPlayButton
        class="play-button"
        :loading="player.isLoading"
        :playing="player.isPlaying"
        :disabled="!player.current"
        @click="player.togglePlay()"
      />

      <div class="current-time">
        {{ player.currentTimeFormatted }}
      </div>

      <div class="time">
        <InputRange
          :model-value="player.currentTime"
          :min="0"
          :max="player.duration"
          :step="5"
          :disabled="!player.current"
          @update:model-value="player.setTime"
        />

        <div
          v-show="player.isRepeat && player.current?.hasLoop"
          class="loop-markers"
        >
          <div class="loop-marker start" />
          <div class="loop-marker end" />
        </div>
      </div>

      <div class="current-duration">
        {{ player.durationFormatted }}
      </div>

      <button
        :disabled="!playlist.next"
        @click="playlist.playNext()"
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
              off: player.isMuted,
            }"
            @keydown.space.enter="player.toggleMute"
            @pointerdown="muteHandler"
          >
            <iconify-icon
              :icon="player.isMuted
                ? 'mdi:volume-off'
                : 'mdi:volume-high'
              "
              :title="player.isMuted
                ? 'unmute'
                : 'mute'
              "
            />
          </button>

          <InputRange
            v-model="volume"
            class="volume-slider"
            :min="0"
            :max="1"
            :step="0.05"
            vertical
          />
        </div>
      </div>

      <button
        :class="{
          off: !player.isRepeat,
        }"
        @click="player.toggleRepeat()"
      >
        <iconify-icon
          icon="mdi:repeat"
          title="repeat"
        />
      </button>

      <button
        class="share"
        :class="{
          off: !sharePopoverOpened,
        }"
        :disabled="!player.current"
        @click="sharePopoverOpened = !sharePopoverOpened"
      >
        <iconify-icon
          icon="mdi:share-variant-outline"
          title="share"
        />
      </button>

      <SharePopover
        v-if="player.current"
        v-model="sharePopoverOpened"
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
import { onKeyStroke } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useMediaSession } from '~/composables/mediaSession';
import { usePlayer } from '~/composables/player';
import { usePlaylist } from '~/composables/playlist';
import { clamp } from '~/composables/utils';
import AutoScrollingText from './AutoScrollingText.vue';
import InputRange from './InputRange.vue';
import MusicCover from './MusicCover.vue';
import MusicTags from './MusicTags.vue';
import MusicItemPlayButton from './PlayButton.vue';
import SharePopover from './SharePopover.vue';
import { usePlaylistPanel } from './ThePlaylistPanel.vue';

const player = usePlayer();
const playlist = usePlaylist();
const playlistPanel = usePlaylistPanel();

const title = computed(() => player.current?.title ?? '');
const tags = computed(() => player.current?.tags ?? []);

const muteHandler = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') {
    player.toggleMute();
  }
  else {
    const popoverOpened = !!document.querySelector('.volume:is(:focus, :focus-within)');
    if (popoverOpened) {
      player.toggleMute();
    }
  }
};

const VOLUME_EXPONENT = 2.5;
const volume = computed({
  get () {
    return player.volume ** (1 / VOLUME_EXPONENT);
  },
  set (sliderVolume: number) {
    player.volume = clamp(sliderVolume ** VOLUME_EXPONENT, 0, 1);
  },
});

const sharePopoverOpened = ref(false);

const hasModifiers = (event: KeyboardEvent) => {
  return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
};

const hasFocusVisible = () => !!document.querySelector('#app:has(:focus-visible)');
const hasTimeFocusVisible = () => !!document.querySelector('#app .time:has(:focus-visible)');
const hasInputFocus = () => !!document.querySelector('#app input:focus');

onKeyStroke(' ', (event) => {
  if (hasModifiers(event)) return;
  // Don't allow to play/pause shortcut when another element is focused
  // So that is doesn't interfere with focused element action
  // Still allow when time range is focused because in that case it makes sense
  if (hasFocusVisible() && !hasTimeFocusVisible()) return;
  event.preventDefault();
  player.togglePlay();
}, { dedupe: true });

onKeyStroke('p', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  event.preventDefault();
  playlist.playPrevious();
}, { dedupe: true });

onKeyStroke('n', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  event.preventDefault();
  playlist.playNext();
}, { dedupe: true });

onKeyStroke('ArrowUp', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  volume.value += 0.05;
  event.preventDefault();
}, { dedupe: true });

onKeyStroke('ArrowDown', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  volume.value -= 0.05;
  event.preventDefault();
}, { dedupe: true });

onKeyStroke('ArrowLeft', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  player.setTime(player.currentTime - 5);
  event.preventDefault();
}, { dedupe: true });

onKeyStroke('ArrowRight', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  player.setTime(player.currentTime + 5);
  event.preventDefault();
}, { dedupe: true });

onKeyStroke('m', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  event.preventDefault();
  player.toggleMute();
}, { dedupe: true });

onKeyStroke('l', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  event.preventDefault();
  player.toggleRepeat();
}, { dedupe: true });

onKeyStroke('q', (event) => {
  if (hasInputFocus()) return;
  if (hasModifiers(event)) return;
  event.preventDefault();
  playlistPanel.toggle();
}, { dedupe: true });

useMediaSession();
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
    // Ensure width does not change based on characters width
    min-width: 1.6rem;
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
    flex-grow: 1;
    position: relative;

    .loop-markers {
      --loop-start-percentage: v-bind('player.loopStartPercentage');
      --loop-end-percentage: v-bind('player.loopEndPercentage');
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

      border: 0.1rem solid transparent;
      border-radius: 1rem;
    }

    .volume-slider {
      height: 5.5rem;
      margin-top: 0.7rem;
      margin-bottom: 0.4rem;
      width: 1.5rem;
    }

    &:is(:hover, :focus, :focus-within) {
      .wrapper {
        padding: 0.4rem;
        margin: -0.4rem;
        border-color: #fff2;
        backdrop-filter: blur(0.05rem);
        background-color: #2b2b40aa;
      }
    }

    &:not(:is(:hover, :focus, :focus-within)) {
      color: gray;

      .volume-slider {
        display: none;
      }
    }
  }

  &.disabled {
    .time {
      .loop-markers {
        display: none;
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
