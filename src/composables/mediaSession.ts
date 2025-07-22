import { watch } from 'vue';
import { usePlayer } from './player';
import { usePlaylist } from './playlist';

const player = usePlayer();
const playlist = usePlaylist();

export const useMediaSession = () => {
  if (!('mediaSession' in navigator)) return;

  watch(() => player.isPlaying, (isPlaying) => {
    if (!player.current) {
      navigator.mediaSession.playbackState = 'none';
      return;
    }
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  });

  watch(() => player.current, () => {
    if (!player.current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: player.current.title,
      artist: 'Amalgame',
      artwork: [
        {
          src: '../assets/images/amalgame.png',
          sizes: '1024x1024',
          type: 'image/png',
        },
      ],
    });
  });

  watch(() => player.currentTime, () => {
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

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    playlist.playPrevious();
  });

  navigator.mediaSession.setActionHandler('nexttrack', () => {
    playlist.playNext();
  });
};
