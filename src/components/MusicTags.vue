<template>
  <div
    class="music-tags"
  >
    <span
      v-for="tag in props.tags"
      :key="tag"
      class="tag"
      :class="[`size-${size}`]"
      :title="tag"
    >
      {{ tag }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { MusicTags } from '~/composables/music';

const props = defineProps<{
  tags: MusicTags
  size?: 'small' | 'normal'
}>();

const size = computed(() => props.size ?? 'normal');
</script>

<style lang="scss" scoped>
.music-tags {
  display: flex;
  flex-flow: row nowrap;

  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  .tag {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 10rem;
    font-size: 1rem;
    background-color: #111;

    &.size-small {
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }

    &::before {
      content: '#';
      display: inline-block;
    }
  }
}
</style>
