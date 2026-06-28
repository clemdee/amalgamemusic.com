<template>
  <section>
    <div
      v-for="view in views"
      :key="view.title"
      class="musics"
    >
      <DiscographyView
        :title="view.title"
        :more-link="view.moreLink"
        :tags="view.tags"
        :sort-by="view.sortBy"
        :sort-dir="view.sortDir"
        :limit="view.limit"
      />
    </div>

    <div class="browse-all">
      <h2>
        Not enough?
      </h2>

      <div class="more">
        <iconify-icon icon="mdi:chevron-double-right" />
        <RouterLink to="browse">
          <span class="more-text">Browse all music</span>
        </RouterLink>
        <iconify-icon icon="mdi:chevron-double-left" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { DiscographyViewParameters } from '~/components/DiscographyView.vue';
import DiscographyView from '~/components/DiscographyView.vue';
import { getTag } from '~/composables/tags';

const highlightView: DiscographyViewParameters = {
  title: `Creator's Highlight`,
  moreLink: '/browse?tags=.highlight',
  tags: ['.highlight'],
  sortBy: (musicA, musicB) => {
    const highlightA = getTag<number>(musicA.tags, '.highlight')?.value ?? 0;
    const highlightB = getTag<number>(musicB.tags, '.highlight')?.value ?? 0;
    return Math.random() - (highlightB / (highlightA + highlightB));
  },
  sortDir: 'descending',
  limit: 6,
};

const recentlyUploadedView: DiscographyViewParameters = {
  title: 'Recently Uploaded',
  moreLink: '/browse?sortBy=uploadTime&sortDir=descending',
  sortBy: 'uploadTime',
  sortDir: 'descending',
  limit: 6,
};

const tagViews: DiscographyViewParameters[] = [
  {
    title: 'Video Game Music',
    moreLink: '/browse?tags=VGM',
    tags: ['VGM'],
    sortBy: 'random',
    limit: 6,
  },
  {
    title: 'Want some funk',
    moreLink: '/browse?tags=funk',
    tags: ['funk'],
    sortBy: 'random',
    limit: 6,
  },
  {
    title: 'Getting experimental',
    moreLink: '/browse?tags=experimental',
    tags: ['experimental'],
    sortBy: 'random',
    limit: 6,
  },
];

const views = [highlightView, ...tagViews, recentlyUploadedView];
</script>

<style lang="scss" scoped>
.browse-all {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-block: 2rem 6rem;

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
</style>
