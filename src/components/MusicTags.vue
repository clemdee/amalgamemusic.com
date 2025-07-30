<template>
  <div
    class="music-tags"
  >
    <MusicTag
      v-for="tag in tags"
      :key="tag.name"
      :tag="tag"
      :size="size"
    />
  </div>
</template>

<script lang="ts" setup>
import type { TagSize } from './MusicTag.vue';
import type { MusicTags } from '~/composables/music';
import { computed } from 'vue';
import { isTagHidden } from '~/composables/tags';
import MusicTag from './MusicTag.vue';

const props = defineProps<{
  tags: MusicTags
  size?: TagSize
}>();

const tags = computed(() => {
  return props.tags.filter(tag => !isTagHidden(tag));
});

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
}
</style>
