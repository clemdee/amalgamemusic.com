import type { MaybeRef } from 'vue';
import type { MusicPart } from './musicParts';
import { reactive, ref, toRef } from 'vue';
import { createAudioBufferNode, useAudioContext } from './musicParts';

const audioContext = useAudioContext();

export interface PlannedPart {
  part: MusicPart
  when: number
  offset: number
  audioNode?: AudioBufferSourceNode
};

export const usePartsPlanner = (parameters: {
  musicParts: MaybeRef<MusicPart[]>
  currentTime: MaybeRef<number>
  isRepeat: MaybeRef<boolean>
  loopStart: MaybeRef<number>
  loopEnd: MaybeRef<number>
}) => {
  const musicParts = toRef(parameters.musicParts ?? []);
  const currentTime = toRef(parameters.currentTime ?? 0);
  const isRepeat = toRef(parameters.isRepeat ?? false);
  const loopStart = toRef(parameters.loopStart ?? 0);
  const loopEnd = toRef(parameters.loopEnd ?? 0);

  const parts = ref<PlannedPart[]>([]);

  const planNow = () => {
    const nowParts: PlannedPart[] = musicParts.value
      .filter((part) => {
        if (part.offset + part.duration < currentTime.value) return false;
        if (isRepeat.value && part.offset >= loopEnd.value) return false;
        return true;
      })
      .map((part) => {
        const when = audioContext.currentTime + Math.max(0, part.offset - currentTime.value);
        const offset = Math.max(0, currentTime.value - part.offset);
        const audioNode = createAudioBufferNode(part.buffer);
        return { part, when, offset, audioNode };
      });
    parts.value.push(...nowParts);
    return nowParts;
  };

  const planNextLoop = () => {
    const nextLoopParts: PlannedPart[] = musicParts.value
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
      });
    parts.value.push(...nextLoopParts);
    return nextLoopParts;
  };

  const stopPart = (plannedPart: PlannedPart) => {
    try {
      plannedPart.audioNode?.stop();
    }
    catch {}
    plannedPart.audioNode?.disconnect();
  };

  const startPart = (plannedPart: PlannedPart) => {
    stopPart(plannedPart);
    plannedPart.audioNode = createAudioBufferNode(plannedPart.part.buffer);
    plannedPart.audioNode.start(plannedPart.when, plannedPart.offset);
  };

  const startParts = (plannedParts: PlannedPart[] = parts.value) => {
    plannedParts.forEach(startPart);
  };

  const stopParts = (plannedParts: PlannedPart[] = parts.value) => {
    plannedParts.forEach(stopPart);
  };

  const clearParts = () => {
    stopParts();
    parts.value.splice(0, parts.value.length);
  };

  return reactive({
    parts,
    planNow,
    planNextLoop,
    startParts,
    stopParts,
    clearParts,
  });
};
