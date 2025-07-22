import { watchImmediate } from '@vueuse/core';
import { watch } from 'vue';
import { usePlayer } from './player';
import { usePlaylist } from './playlist';

const player = usePlayer();
const playlist = usePlaylist();

// Use a dummy Audio so that mediaSession can be used
const dummyAudioSrc = '/src/assets/audio/dummy.m4a';
const dummyAudio = new Audio(dummyAudioSrc);
dummyAudio.loop = true;
dummyAudio.volume = 0.000001;

export const useMediaSession = () => {
  if (!navigator.mediaSession) return;

  watchImmediate(() => player.isPlaying, () => {
    if (!player.current) {
      navigator.mediaSession.playbackState = 'none';
      return;
    }
    if (player.isPlaying) {
      dummyAudio.play();
      navigator.mediaSession.playbackState = 'playing';
    }
    else {
      dummyAudio.pause();
      navigator.mediaSession.playbackState = 'paused';
    }
  });

  watch(() => player.current, () => {
    if (!player.current) {
      dummyAudio.src = '';
      navigator.mediaSession.metadata = null;
      return;
    }
    dummyAudio.src = dummyAudio.src = dummyAudioSrc;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: player.current.title,
      artist: 'Amalgame',
      artwork: [
        {
          src: '/src/assets/images/amalgame.png',
          sizes: '1024x1024',
          type: 'image/png',
        },
      ],
    });
  });

  watchImmediate(() => player.currentTime, () => {
    if (!player.current) {
      navigator.mediaSession.setPositionState();
      return;
    }
    navigator.mediaSession.setPositionState({
      duration: player.duration,
      playbackRate: 1,
      position: player.currentTime,
    });
  });

  navigator.mediaSession.setActionHandler('play', () => {
    player.play();
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    player.pause();
  });

  navigator.mediaSession.setActionHandler('stop', () => {
    dummyAudio.src = '';
    player.pause();
  });

  navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
    seekOffset ??= 5;
    player.setTime(player.currentTime - seekOffset);
  });

  navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
    seekOffset ??= 5;
    player.setTime(player.currentTime - seekOffset);
  });

  navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
    if (!seekTime) return;
    player.setTime(seekTime);
  });

  watchImmediate(() => playlist.previous, () => {
    navigator.mediaSession.setActionHandler(
      'previoustrack',
      playlist.previous
        ? () => { playlist.playPrevious(); }
        : null,
    );
  });

  watchImmediate(() => playlist.next, () => {
    navigator.mediaSession.setActionHandler(
      'nexttrack',
      playlist.next
        ? () => { playlist.playNext(); }
        : null,
    );
  });
};
