<template>
  <ContextMenu
    ref="contextmenu"
    class="context-menu"
    :model="theContextMenuItems"
    append-to="#app"
  >
    <template #itemicon="slot">
      <iconify-icon :icon="slot.item.icon" :class="slot.class" />
    </template>
  </ContextMenu>
</template>

<script lang="ts" setup>
import type { MenuItem } from 'primevue/menuitem';
import type { ComponentPublicInstance, MaybeRef } from 'vue';
// Using primevue library for custom context menu so that I can style it
// Because context menu component logic is a pain I don't want to deal with
import ContextMenu from 'primevue/contextmenu';
import { ref, toValue, useTemplateRef } from 'vue';

const contextMenu = useTemplateRef('contextmenu');

defineExpose({
  show: (event: MouseEvent) => contextMenu.value?.show(event),
  hide: () => contextMenu.value?.hide(),
  toggle: (event: MouseEvent) => contextMenu.value?.toggle(event),
});
</script>

<script lang="ts">
const theContextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const theContextMenuItems = ref<MenuItem[]>([]);

export const registerContextMenu = (instance: Element | ComponentPublicInstance | null) => {
  theContextMenu.value = instance as unknown as InstanceType<typeof ContextMenu>;
};

export const useContextMenu = (items: MaybeRef<MenuItem[]>) => {
  return {
    show: (event: MouseEvent) => {
      theContextMenuItems.value = toValue(items);
      theContextMenu.value?.show(event);
    },
    toggle: (event: MouseEvent) => {
      theContextMenuItems.value = toValue(items);
      theContextMenu.value?.toggle(event);
    },
    hide: () => theContextMenu.value?.hide(),
  };
};
</script>

<style lang="scss">
.context-menu {
  background-color: #2b2b40aa;
  backdrop-filter: blur(0.4rem);
  box-shadow: 0 0.3rem 2rem #0005;
  border-radius: 1rem;
  font-family: inherit;
  padding-block: 0.5rem;

  ul {
    outline: none;
  }

  li {
    display: flex;
    list-style-type: none;
    cursor: pointer;

    &:hover {
      background-color: #fff2;
      color: var(--accent-color);
    }

    [data-pc-section="itemcontent"] {
      padding: 0.75rem 1.75rem;
      width: 100%;

      [data-pc-section="itemlink"] {
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        gap: 1rem;

        iconify-icon {
          font-size: 1.5rem;
        }
      }
    }
  }
}
</style>
