<template>
  <section>
    <h2>Browse all music</h2>

    <BrowseFilters
      v-model:search="search"
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
      v-model:tags="tags"
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
import { computed, useTemplateRef } from 'vue';
import BrowseFilters from '~/components/BrowseFilters.vue';
import DiscographyView from '~/components/DiscographyView.vue';
import { useRouteQuery } from '~/composables/query';

const viewComponent = useTemplateRef('view');

const search = useRouteQuery<string>('search', '');
const tags = useRouteQuery<string[]>('tags', [], {
  fromQuery: query => query?.split(',').filter(Boolean) ?? [],
  toQuery: names => names.join(','),
});
const sortBy = useRouteQuery<SortBy>('sortBy', 'title');
const sortDir = useRouteQuery<SortDir>('sortDir', 'ascending');

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
