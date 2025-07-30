<template>
  <section>
    <h2>Browse all music</h2>

    <BrowseFilters
      v-model:search="search"
      v-model:tags="tags"
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
    />

    <div class="music-count">
      <span v-if="!musicCount">
        No item matches current filters
      </span>
      <span v-else>
        Displaying {{ musicCount }} items
      </span>
    </div>

    <DiscographyView
      ref="view"
      :search="search"
      :tags="tags"
      :sort-by="sortBy"
      :sort-dir="sortDir"
    />
  </section>
</template>

<script lang="ts" setup>
import type { SortBy, SortDir } from '~/components/DiscographyView.vue';
import { computed, ref, useTemplateRef } from 'vue';
import BrowseFilters from '~/components/BrowseFilters.vue';
import DiscographyView from '~/components/DiscographyView.vue';

const viewComponent = useTemplateRef('view');

const search = ref('');
const tags = ref<string[]>([]);
const sortBy = ref<SortBy>('title');
const sortDir = ref<SortDir>('ascending');

const musicCount = computed((): number | undefined => {
  if (!viewComponent.value) return;
  return viewComponent.value.musicCount ?? 0;
});
</script>

<style lang="scss" scoped>
h2 {
  align-self: center;
}
</style>
