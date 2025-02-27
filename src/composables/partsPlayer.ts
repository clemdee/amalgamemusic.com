import type { Music } from './music';

import { computed, type MaybeRef, reactive, toRef, toValue } from 'vue';
import { createAudioBufferNode, type MusicPart, preloadMusicParts, useAudioContext } from './musicParts';

const audioContext = useAudioContext();

interface PlannedPart {
  part: MusicPart
  when: number
  offset: number
  audioNode?: AudioBufferSourceNode
};

const getPlannedPartsCurrent = (parameters: {
  musicParts: MusicPart[]
  currentTime: MaybeRef<number>
}): PlannedPart[] => {
  const musicParts = toValue(parameters.musicParts ?? []);
  const currentTime = toValue(parameters.currentTime ?? 0);

  const plannedParts: PlannedPart[] = [];
  plannedParts.push(...musicParts
    .filter(part => part.offset + part.duration >= currentTime)
    .map((part) => {
      const when = audioContext.currentTime + Math.max(0, part.offset - currentTime);
      const offset = Math.max(0, currentTime - part.offset);
      const audioNode = createAudioBufferNode(part.buffer);
      return {
        part,
        when,
        offset,
        audioNode,
      };
    }),
  );
  return plannedParts;
};

const getPlannedPartsNextLoop = (parameters: {
  musicParts: MusicPart[]
  currentTime: MaybeRef<number>
  loopStart: MaybeRef<number>
  loopEnd: MaybeRef<number>
}): PlannedPart[] => {
  const musicParts = toValue(parameters.musicParts ?? []);
  const currentTime = toValue(parameters.currentTime ?? 0);
  const loopStart = toValue(parameters.loopStart ?? 0);
  const loopEnd = toValue(parameters.loopEnd ?? 0);

  const plannedParts: PlannedPart[] = [];
  plannedParts.push(...musicParts
    .map((part) => {
      const when = audioContext.currentTime + Math.max(0, part.offset + loopEnd - currentTime);
      const offset = Math.max(0, loopStart - part.offset);
      return {
        part,
        when,
        offset,
      };
    }),
  );
  return plannedParts;
};

const stopPlannedPart = (plannedPart: PlannedPart) => {
  try {
    plannedPart.audioNode?.stop();
  }
  catch {}
  plannedPart.audioNode?.disconnect();
};

const startPlannedPart = (plannedPart: PlannedPart) => {
  stopPlannedPart(plannedPart);
  plannedPart.audioNode = createAudioBufferNode(plannedPart.part.buffer);
  plannedPart.audioNode.start(plannedPart.when, plannedPart.offset);
};

// ---

export const usePartsPlayer = (parameters: {
  current?: MaybeRef<Music | undefined>
  currentTime?: MaybeRef<number>
  hasRepeat?: MaybeRef<boolean>
} = {}) => {
  const current = toRef(parameters.current);
  const currentTime = toRef(parameters.currentTime ?? 0);
  const hasRepeat = toRef(parameters.hasRepeat ?? false);

  const loopStart = computed(() => current.value?.time.loopStart ?? 0);
  const loopEnd = computed(() => current.value?.time.loopEnd ?? 0);

  let musicParts: MusicPart[] = [];
  const plannedParts: PlannedPart[] = [];

  const loadMusicParts = async () => {
    if (!current.value) {
      musicParts = [];
    }
    else {
      musicParts = await preloadMusicParts(current.value);
    }
  };

  const startPlannedParts = () => {
    plannedParts.forEach(startPlannedPart);
  };

  const stopPlannedParts = () => {
    plannedParts.forEach(stopPlannedPart);
  };

  const clearPlannedParts = () => {
    stopPlannedParts();
    plannedParts.splice(0, plannedParts.length);
  };

  const planParts = () => {
    clearPlannedParts();
    plannedParts.push(...getPlannedPartsCurrent({
      musicParts,
      currentTime,
    }));
    if (hasRepeat.value) {
      plannedParts.push(...getPlannedPartsNextLoop({
        musicParts,
        currentTime,
        loopStart,
        loopEnd,
      }));
    }
  };

  const planExtraLoop = () => {
    const plannedPartsNextLoop = getPlannedPartsNextLoop({
      musicParts,
      currentTime,
      loopStart,
      loopEnd,
    });
    plannedPartsNextLoop.forEach(startPlannedPart);
    plannedParts.push(...plannedPartsNextLoop);
  };

  const play = async () => {
    stopPlannedParts();
    await loadMusicParts();
    planParts();
    startPlannedParts();
  };

  const pause = () => {
    stopPlannedParts();
  };

  return reactive({
    play,
    pause,
    planExtraLoop,
  });
};
