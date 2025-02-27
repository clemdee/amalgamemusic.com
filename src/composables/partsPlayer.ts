import type { Music } from './music';

import { computed, type MaybeRef, reactive, ref, toRef } from 'vue';
import { createAudioBufferNode, type MusicPart, preloadMusicParts, useAudioContext } from './musicParts';

const audioContext = useAudioContext();

interface PlannedPart {
  part: MusicPart
  when: number
  offset: number
  audioNode?: AudioBufferSourceNode
};

const usePlanner = (parameters: {
  musicParts: MaybeRef<MusicPart[]>
  currentTime: MaybeRef<number>
  hasRepeat: MaybeRef<boolean>
  loopStart: MaybeRef<number>
  loopEnd: MaybeRef<number>
}) => {
  const musicParts = toRef(parameters.musicParts ?? []);
  const currentTime = toRef(parameters.currentTime ?? 0);
  const hasRepeat = toRef(parameters.hasRepeat ?? false);
  const loopStart = toRef(parameters.loopStart ?? 0);
  const loopEnd = toRef(parameters.loopEnd ?? 0);

  const current = () => {
    const plannedParts: PlannedPart[] = [];
    plannedParts.push(...musicParts.value
      .filter((part) => {
        if (part.offset + part.duration < currentTime.value) return false;
        if (hasRepeat.value && part.offset >= loopEnd.value) return false;
        return true;
      })
      .map((part) => {
        const when = audioContext.currentTime + Math.max(0, part.offset - currentTime.value);
        const offset = Math.max(0, currentTime.value - part.offset);
        const audioNode = createAudioBufferNode(part.buffer);
        return { part, when, offset, audioNode };
      }),
    );
    return plannedParts;
  };

  const nextLoop = () => {
    const plannedParts: PlannedPart[] = [];
    plannedParts.push(...musicParts.value
      .filter((part: MusicPart) => {
        if (part.offset + part.duration <= loopStart.value) return false;
        if (part.offset >= loopEnd.value) return false;
        return true;
      })
      .map((part) => {
        const when = audioContext.currentTime + (loopEnd.value - currentTime.value) + Math.max(0, (part.offset - loopStart.value));
        const offset = Math.max(0, loopStart.value - part.offset);
        return {
          part,
          when,
          offset,
        };
      }),
    );
    return plannedParts;
  };

  return {
    current,
    nextLoop,
  };
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

  const musicParts = ref<MusicPart[]>([]);
  const plannedParts: PlannedPart[] = [];

  const getPlannedParts = usePlanner({
    musicParts,
    currentTime,
    hasRepeat,
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
    plannedParts.push(...getPlannedParts.current());
    if (hasRepeat.value) {
      plannedParts.push(...getPlannedParts.nextLoop());
    }
  };

  const planExtraLoop = () => {
    const plannedPartsNextLoop = getPlannedParts.nextLoop();
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
