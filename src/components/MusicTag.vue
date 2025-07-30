<template>
  <component
    :is="element"
    class="music-tag"
  >
    <span
      class="tag"
      :class="[`size-${size}`]"
      :title="name"
    >
      <span class="hashtag">#</span>{{ name }}
    </span>
  </component>
</template>

<script lang="ts" setup>
import type { Tag } from '~/composables/tags';
import { computed } from 'vue';

export type TagSize = 'small' | 'normal';

const props = defineProps<{
  element?: string
  tag: Tag
  size?: TagSize
}>();

const element = computed(() => props.element ?? 'div');
const size = computed(() => props.size ?? 'normal');
const name = computed(() => props.tag.name.replace(/^\.*/, ''));
</script>

<style lang="scss" scoped>
.music-tag {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  background-color: #111;

  &.size-small {
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
  }

  .hashtag {
    color: #aaa;
  }
}
</style>
