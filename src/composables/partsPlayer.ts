import type { MaybeRef } from 'vue';
import type { Music } from './music';
import type { MusicPart } from './musicParts';
import { syncRefs } from '@vueuse/core';
import { computed, reactive, ref, toRef } from 'vue';
import { preloadMusicParts } from './musicParts';
import { usePartsPlanner } from './partsPlanner';
import { useTimer } from './timer';

export const usePartsPlayer = (parameters: {
  current?: MaybeRef<Music | undefined>
  isRepeat?: MaybeRef<boolean>
} = {}) => {
  const current = toRef(parameters.current);
  const isRepeat = toRef(parameters.isRepeat ?? false);
  // Sometimes, music should not repeat even if the option is on
  // e.g. when manually setting time after loopEnd
  const shouldRepeat = ref(isRepeat.value);
  syncRefs(isRepeat, shouldRepeat);

  const duration = computed(() => current.value?.time?.duration ?? Number.NaN);
  const loopStart = computed(() => current.value?.time.loopStart ?? 0);
  const loopEnd = computed(() => current.value?.time.loopEnd ?? 0);

  const timer = useTimer({
    timeout: 200,
    duration,
    isRepeat: shouldRepeat,
    loopStart,
    loopEnd,
  });

  const currentTime = computed({
    get: () => timer.time,
    set: (value) => {
      shouldRepeat.value = value >= loopEnd.value
        ? false
        : isRepeat.value;
      timer.update(value);
    },
  });

  const musicParts = ref<MusicPart[]>([]);

  const partsPlanner = usePartsPlanner({
    musicParts,
    currentTime,
    isRepeat: shouldRepeat,
    loopEnd,
    loopStart,
  });

  const loadMusicParts = async () => {
    if (!current.value) {
      musicParts.value = [];
    }
    else {
      musicParts.value = await preloadMusicParts(current.value);
    }
  };

  const planParts = () => {
    partsPlanner.clearParts();
    partsPlanner.planNow();
    if (shouldRepeat.value) {
      partsPlanner.planNextLoop();
    }
  };

  const planExtraLoop = () => {
    const plannedPartsNextLoop = partsPlanner.planNextLoop();
    partsPlanner.startParts(plannedPartsNextLoop);
  };

  timer.on('loop', planExtraLoop);

  const play = async () => {
    partsPlanner.stopParts();
    await loadMusicParts();
    planParts();
    partsPlanner.startParts();
    timer.resume();
  };

  const pause = () => {
    partsPlanner.stopParts();
    timer.pause();
  };

  timer.on('end', pause);

  return reactive({
    currentTime,
    isPlaying: computed(() => timer.running),
    play,
    pause,
  });
};
