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
    const highlightA = getTag<number>(musicA.tags, 'highlight')?.value ?? 0;
    const highlightB = getTag<number>(musicB.tags, 'highlight')?.value ?? 0;
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
    moreLink: '/browse?sortBy=random&tags=VGM',
    tags: ['VGM'],
    sortBy: 'random',
    limit: 6,
  },
  {
    title: 'Want some funk',
    moreLink: '/browse?sortBy=random&tags=funk',
    tags: ['funk'],
    sortBy: 'random',
    limit: 6,
  },
  {
    title: 'Getting experimental',
    moreLink: '/browse?sortBy=random&tags=experimental',
    tags: ['experimental'],
    sortBy: 'random',
    limit: 6,
  },
];

const views = [highlightView, ...tagViews, recentlyUploadedView];
</script>

<style lang="scss" scoped>
h2 {
  margin-bottom: 4rem;
}
</style>
