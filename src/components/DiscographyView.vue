<template>
  <article>
    <h2 v-if="props.title">
      {{ props.title }}
    </h2>

    <div
      v-if="props.description"
      class="description"
    >
      {{ props.description }}
    </div>

    <div class="musics">
      <MusicItem
        v-for="music in discographyLimited"
        :key="music.id"
        :music
      />
    </div>
  </article>
</template>

<script lang="ts" setup>
import type { Music } from '~/composables/music';
import { computed } from 'vue';
import MusicItem from '~/components/MusicItem.vue';
import { createTags, hasSomeTags } from '~/composables/tags';
import { useDiscography } from '~/stores/discography';

export type SortBy = 'title' | 'uploadTime' | 'random';
export type SortDir = 'ascending' | 'descending';
export type SortFn<T> = (itemA: T, itemB: T) => number;

export interface DiscographyViewParameters {
  title?: string
  description?: string
  limit?: number
  tags?: string[]
  sortBy?: SortBy | SortFn<Music>
  sortDir?: SortDir
};

const props = defineProps<DiscographyViewParameters>();

const musicSorter: Record<SortBy, SortFn<Music>> = {
  title: (musicA, musicB) => musicA.title.localeCompare(musicB.title),
  uploadTime: (musicA, musicB) => (new Date(musicA.uploadTime)).getTime() - (new Date(musicB.uploadTime)).getTime(),
  random: (_musicA, _musicB) => Math.random() - 0.5,
};

const limit = computed(() => props.limit ?? 0);
const tags = computed(() => createTags(props.tags ?? []));
const sortBy = computed(() => {
  if (typeof props.sortBy === 'function') return props.sortBy;
  return musicSorter[props.sortBy ?? 'uploadTime'] ?? (() => 0);
});
const sortDir = computed(() => props.sortDir ?? 'ascending');

const discography = useDiscography();

const discographyFiltered = computed(() => {
  if (tags.value.length === 0) return discography.value;
  return discography.value.filter(
    music => hasSomeTags(music.tags, tags.value),
  );
});

const discographySorted = computed(() => {
  const discographySorted = discographyFiltered.value.toSorted(sortBy.value);
  if (sortDir.value === 'descending') {
    discographySorted.reverse();
  }
  return discographySorted;
});

const discographyLimited = computed(() => {
  if (!limit.value) return discographySorted.value;
  return discographySorted.value.slice(0, limit.value);
});
</script>

<style lang="scss" scoped>
.musics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  justify-content: center;
  align-items: stretch;
  gap: 2rem;
  width: 100%;
}
</style>
