import { type MaybeRef, reactive, ref, toRef } from 'vue';

export const useTimer = (parameters: {
  timeout?: MaybeRef<number>
  duration?: MaybeRef<number>
  loop?: MaybeRef<boolean>
  loopStart?: MaybeRef<number>
  loopEnd?: MaybeRef<number>
  onLoop?: () => void
  onEnd?: () => void
} = {}) => {
  const timeout = toRef(parameters.timeout ?? 200);
  const duration = toRef(parameters.duration ?? Number.POSITIVE_INFINITY);
  const loop = toRef(parameters.loop ?? false);
  const loopStart = toRef(parameters.loopStart ?? 0);
  const loopEnd = toRef(parameters.loopEnd ?? duration);

  let lastTime = 0;
  let intervalId: ReturnType<typeof setInterval>;
  const time = ref(0);
  const running = ref(false);

  const _updateTimer = () => {
    const now = performance.now() / 1000;
    time.value += now - lastTime;
    lastTime = now;

    if (loop.value && time.value > loopEnd.value) {
      const offset = time.value - loopEnd.value;
      time.value = loopStart.value + offset;
      parameters.onLoop?.();
    }

    // End of timer
    if (!loop.value && time.value > duration.value) {
      clearInterval(intervalId);
      time.value = duration.value;
      running.value = false;
      parameters.onEnd?.();
    }
  };

  const resume = () => {
    lastTime = performance.now() / 1000;
    _updateTimer();
    running.value = true;

    clearInterval(intervalId);
    intervalId = setInterval(_updateTimer, timeout.value);
  };

  const pause = () => {
    clearInterval(intervalId);
    _updateTimer();
    running.value = false;
  };

  const update = (value: number) => {
    lastTime = performance.now() / 1000;
    time.value = value;

    clearInterval(intervalId);
    intervalId = setInterval(_updateTimer, timeout.value);
  };

  return reactive({
    time,
    pause,
    resume,
    update,
    running,
  });
};
