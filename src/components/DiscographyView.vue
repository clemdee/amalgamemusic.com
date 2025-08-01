<template>
  <article class="view">
    <div class="header">
      <div class="title">
        <h2 v-if="props.title">
          {{ props.title }}
        </h2>

        <div
          v-if="props.moreLink"
          class="more"
        >
          <iconify-icon icon="mdi:chevron-double-right" />
          <RouterLink :to="props.moreLink">
            <span class="more-text">View more</span>
          </RouterLink>
        </div>
      </div>

      <div
        v-if="props.description"
        class="description"
      >
        {{ props.description }}
      </div>
    </div>

    <div class="musics">
      <MusicItem
        v-for="music in viewDiscography"
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
import { createTags, hasEveryTags } from '~/composables/tags';
import { useDiscography } from '~/stores/discography';

export type SortBy = 'title' | 'uploadTime' | 'random';
export type SortDir = 'ascending' | 'descending';
export type SortFn<T> = (itemA: T, itemB: T) => number;

export interface DiscographyViewParameters {
  title?: string
  description?: string
  moreLink?: string
  search?: string
  tags?: string[]
  sortBy?: SortBy | SortFn<Music>
  sortDir?: SortDir
  limit?: number
};

const props = defineProps<DiscographyViewParameters>();

const musicSorter: Record<SortBy, SortFn<Music>> = {
  title: (musicA, musicB) => musicA.title.localeCompare(musicB.title),
  uploadTime: (musicA, musicB) => (new Date(musicA.uploadTime)).getTime() - (new Date(musicB.uploadTime)).getTime(),
  random: (_musicA, _musicB) => Math.random() - 0.5,
};

const search = computed(() => props.search ?? '');
const tags = computed(() => createTags(props.tags ?? []));
const sortBy = computed(() => {
  if (typeof props.sortBy === 'function') return props.sortBy;
  return musicSorter[props.sortBy ?? 'uploadTime'] ?? (() => 0);
});
const sortDir = computed(() => props.sortDir ?? 'descending');
const limit = computed(() => props.limit ?? 0);

const allDiscography = useDiscography();

const discographySearched = computed(() => {
  return allDiscography.value.filter(
    music => music.title.toLocaleLowerCase().match(search.value.toLocaleLowerCase()),
  );
});

const discographyFiltered = computed(() => {
  if (tags.value.length === 0) return discographySearched.value;
  return discographySearched.value.filter(
    music => hasEveryTags(music.tags, tags.value),
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

const viewDiscography = computed(() => discographyLimited.value);

const musicCount = computed(() => viewDiscography.value.length);

defineExpose({
  musicCount,
});
</script>

<style lang="scss" scoped>
.view {
  .header {
    margin-bottom: 1rem;

    .title {
      display: flex;
      flex-flow: column wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;

      h2 {
        font-size: 1.4rem;
      }

      .more {
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.03rem;
        font-size: 1rem;
        transition: opacity 200ms;
        backdrop-filter: blur(0.2rem);

        iconify-icon {
          margin-bottom: 0.1rem;
        }

        .more-text {
          color: var(--accent-color);
        }
      }
    }
  }

  .musics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    justify-content: center;
    align-items: stretch;
    gap: 2rem;
    width: 100%;
  }
}
</style>
