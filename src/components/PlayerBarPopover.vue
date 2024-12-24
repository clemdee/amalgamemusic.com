<template>
  <div
    v-if="opened"
    v-on-click-outside="() => opened = false"
    class="player-bar-popover"
    :class="{
      opened,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { vOnClickOutside } from '@vueuse/components';

const opened = defineModel<boolean>();
</script>

<style lang="scss" scoped>
.player-bar-popover {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  z-index: 100000;

  display: flex;

  padding: 2rem;
  border: 0.1rem solid #fff2;
  border-radius: 1rem;
  backdrop-filter: blur(0.2rem);
  background-color: #fff2;
  box-shadow: 0 0.3rem 2rem #0002;
}
</style>
