<template>
  <section>
    <h2>Browse all music</h2>

    <DiscographyView
      :tags="tags"
      :sort-by="sortBy"
      :sort-dir="sortDir"
    />
  </section>
</template>

<script lang="ts" setup>
import type { SortBy, SortDir } from '~/components/DiscographyView.vue';
import { ref } from 'vue';
import DiscographyView from '~/components/DiscographyView.vue';

const tags = ref<string[]>();
const sortBy = ref<SortBy>();
const sortDir = ref<SortDir>();
</script>

<style lang="scss" scoped>
h2 {
  align-self: center;
}
</style>
