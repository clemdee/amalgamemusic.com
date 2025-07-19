type Handler = EventListenerOrEventListenerObject;

export const useOn = <E extends string>(events: E[]) => {
  const eventTarget = new EventTarget();

  const handlers: Record<E, Handler[]> = {} as Record<E, Handler[]>;
  events.forEach((event) => {
    handlers[event] = [];
  });

  const dispatch = (event: E, detail: unknown = {}) => {
    eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
  };

  const on = (event: E, handler: Handler) => {
    if (!events.includes(event)) return;
    handlers[event].push(handler);
    eventTarget.addEventListener(event, handler);
  };

  const off = (event: E, handler: Handler) => {
    if (!events.includes(event)) return;
    const handlerIndex = handlers[event]?.indexOf(handler);
    if (handlerIndex === -1) return;
    handlers[event].splice(handlerIndex, 1);
    eventTarget.removeEventListener(event, handler);
  };

  return { on, off, dispatch, handlers };
};
