<template>
  <Teleport to="#content">
    <div
      v-if="opened"
      class="popover-wrapper"
      :class="{
        opened,
      }"
    >
      <div
        v-on-click-outside="clickOutsideHandler"
        class="popover"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { vOnClickOutside } from '@vueuse/components';
import { wait } from '~/composables/utils';

const opened = defineModel<boolean>();

const clickOutsideHandler = async () => {
  // Needed to prevent immediate reopening when clicking on open button
  await wait(10);
  opened.value = false;
};
</script>

<style lang="scss" scoped>
.popover-wrapper {
  position: absolute;
  inset: 0rem;
  z-index: var(--z-popover);
  padding: 1rem;

  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  @media (width < 40rem) {
    backdrop-filter: blur(1rem);
    justify-content: center;
    align-items: center
  }

  .popover {
    display: flex;

    padding: 2rem 3rem;
    border: 0.1rem solid #fff2;
    border-radius: 1rem;
    backdrop-filter: blur(0.2rem);
    background-color: #2b2b40dd;
    box-shadow: 0 0.3rem 2rem #0002;
  }
}
</style>
