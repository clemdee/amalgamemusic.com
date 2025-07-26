<template>
  <section>
    <h2>Browse all music</h2>

    <BrowseFilters
      v-model:search="search"
      v-model:tags="tags"
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
    />

    <DiscographyView
      :search="search"
      :tags="tags"
      :sort-by="sortBy"
      :sort-dir="sortDir"
    />
  </section>
</template>

<script lang="ts" setup>
import type { SortBy, SortDir } from '~/components/DiscographyView.vue';
import { ref } from 'vue';
import BrowseFilters from '~/components/BrowseFilters.vue';
import DiscographyView from '~/components/DiscographyView.vue';

const search = ref('');
const tags = ref<string[]>([]);
const sortBy = ref<SortBy>('title');
const sortDir = ref<SortDir>('ascending');
</script>

<style lang="scss" scoped>
h2 {
  align-self: center;
}
</style>
