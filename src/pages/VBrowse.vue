<template>
  <section>
    <h2>Browse all music</h2>

    <BrowseFilters
      v-model:search="search"
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
      v-model:tags="tags"
      class="browse-filters"
    />

    <div>
      <div class="music-count">
        <span v-if="!musicCount">
          No item matches current filters
        </span>
        <span v-else>
          Displaying {{ musicCount }} / {{ totalMusicCount }} items
        </span>
      </div>

      <DiscographyView
        ref="view"
        :search="search"
        :tags="tags"
        :sort-by="sortBy"
        :sort-dir="sortDir"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { SortBy, SortDir } from '~/components/DiscographyView.vue';
import { computed, useTemplateRef } from 'vue';
import BrowseFilters from '~/components/BrowseFilters.vue';
import DiscographyView from '~/components/DiscographyView.vue';
import { useRouteQuery } from '~/composables/query';
import { useDiscography } from '~/stores/discography';

const viewComponent = useTemplateRef('view');

const search = useRouteQuery<string>('search', '');
const tags = useRouteQuery<string[]>('tags', [], {
  fromQuery: query => query?.split(',').filter(Boolean) ?? [],
  toQuery: names => names.join(','),
});
const sortBy = useRouteQuery<SortBy>('sortBy', 'uploadTime');
const sortDir = useRouteQuery<SortDir>('sortDir', 'descending');

const musicCount = computed((): number | undefined => {
  if (!viewComponent.value) return;
  return viewComponent.value.musicCount ?? 0;
});

const discography = useDiscography();
const totalMusicCount = computed(() => discography.value.length);
</script>

<style lang="scss" scoped>
section {
  gap: 3rem;

  h2 {
    align-self: center;
  }

  .browse-filters {
    max-width: 80rem;
    align-self: center;
  }

  .music-count {
    margin-top: 1rem;
    margin-left: 0.5rem;
  }
}
</style>
