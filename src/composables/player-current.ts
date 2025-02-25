import type { Music, ResolvedMusicPart } from './music';
import { computed, type MaybeRef, readonly, ref, toRef, watch } from 'vue';
import { useTimer } from './timer';

interface PlannedPart {
  part: ResolvedMusicPart
  when: number
  offset: number
  audioNode?: AudioBufferSourceNode
};

const audioContext = new AudioContext();

const createAudioBufferNode = (buffer: AudioBuffer) => {
  const audioNode = audioContext.createBufferSource();
  audioNode.buffer = buffer;
  audioNode.connect(audioContext.destination);
  return audioNode;
};

const partFiles: Record<string, any> = {};

const resolvePart = async (music: Music, partIndex: number): Promise<ResolvedMusicPart> => {
  const part = music.parts[partIndex];
  const partId = `${music.id}-${partIndex}`;
  if (!partFiles[partId]) {
    // If part has not already been loaded
    // Fetch, create and cache buffer
    const response = await fetch(part.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const resolvedPart = {
      src: part.src,
      offset: part.offset ?? 0,
      duration: part.duration,
      buffer: audioBuffer,
    };
    partFiles[partId] = resolvedPart;
  }
  return partFiles[partId];
};

const resolveParts = async (music: Music) => {
  return await Promise.all(
    music.parts.map((_part, index) => resolvePart(music, index)),
  );
};

export const usePlayerCurrent = (parameters: {
  current: MaybeRef<Music | undefined>
  onEnd: () => void
}) => {
  // console.debug('USE PLAYER PARTS COMPOSABLE');

  const current = toRef(parameters.current);

  const hasRepeat = ref(true);

  const toggleRepeat = (state?: boolean) => {
    state ??= !hasRepeat.value;
    hasRepeat.value = state;
  };

  const loopStart = computed(() => current.value?.time.loopStart ?? 0);
  const loopEnd = computed(() => current.value?.time.loopEnd ?? 0);
  const duration = computed(() => current.value?.time?.duration ?? Number.NaN);

  const timer = useTimer({
    timeout: 200,
    duration,
    loop: hasRepeat,
    loopStart,
    loopEnd,
    onLoop: () => {
      // eslint-disable-next-line ts/no-use-before-define
      const plannedPartsNextLoop = getPlannedPartsNextLoop();
      // eslint-disable-next-line ts/no-use-before-define
      plannedPartsNextLoop.forEach(startPlannedPart);
      // eslint-disable-next-line ts/no-use-before-define
      plannedParts.push(...plannedPartsNextLoop);
    },
    onEnd: () => parameters.onEnd(),
  });

  const currentTime = computed({
    get: () => timer.time,
    set: value => void timer.update(value),
  });

  const isLoading = ref(false);
  const isPlaying = computed(() => timer.running);

  let resolvedParts: ResolvedMusicPart[] = [];

  const loadParts = async () => {
    if (!current.value) {
      isLoading.value = false;
      return [];
    }
    isLoading.value = true;
    resolvedParts = await resolveParts(current.value);
    isLoading.value = false;
  };

  const plannedParts: PlannedPart[] = [];

  const getPlannedPartsCurrent = (): PlannedPart[] => {
    const plannedParts: PlannedPart[] = [];
    plannedParts.push(...resolvedParts
      .filter(part => part.offset + part.duration >= currentTime.value)
      .map((part) => {
        const when = audioContext.currentTime + Math.max(0, part.offset - currentTime.value);
        const offset = Math.max(0, currentTime.value - part.offset);
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

  const getPlannedPartsNextLoop = (): PlannedPart[] => {
    const plannedParts: PlannedPart[] = [];
    plannedParts.push(...resolvedParts
      .map((part) => {
        const when = audioContext.currentTime + Math.max(0, part.offset + loopEnd.value - currentTime.value);
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

  const play = async () => {
    if (!current.value) return;
    if (isLoading.value) return;
    plannedParts.forEach(stopPlannedPart);
    await loadParts();
    plannedParts.splice(0, plannedParts.length);
    plannedParts.push(...getPlannedPartsCurrent());
    if (hasRepeat.value) {
      plannedParts.push(...getPlannedPartsNextLoop());
    }
    plannedParts.forEach(startPlannedPart);
    timer.resume();
  };

  const pause = () => {
    plannedParts.forEach(stopPlannedPart);
    timer.pause();
  };

  watch(hasRepeat, () => void (isPlaying.value && play()));

  const togglePlay = (state?: boolean) => {
    state ??= !isPlaying.value;
    if (!state) {
      pause();
    }
    else {
      play();
    }
  };

  const setTime = (seconds: number) => {
    if (!current.value) return;
    if (isLoading.value) return;
    currentTime.value = seconds;
    play();
  };

  return {
    isLoading: readonly(isLoading),
    isPlaying: readonly(isPlaying),
    currentTime: readonly(currentTime),
    currentDuration: readonly(duration),
    setTime,
    play,
    pause,
    togglePlay,
    hasRepeat,
    toggleRepeat,
  };
};
