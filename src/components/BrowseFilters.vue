<template>
  <div
    class="browse-filters"
    :class="{
      opened,
    }"
  >
    <div class="row-search">
      <div class="search">
        <iconify-icon icon="mdi:magnify" />

        <input
          v-model="search"
          type="search"
          class="search"
          placeholder="Search title..."
        />
      </div>

      <button
        class="toggle"
        @click="opened = !opened"
      >
        <iconify-icon
          :icon="opened ? 'cuida:caret-up-outline' : 'cuida:caret-down-outline'"
        />
        <span>{{ opened ? 'Hide' : 'Show' }} all filters</span>
      </button>
    </div>

    <div
      class="content"
      :inert="!opened"
    >
      <div
        v-for="tagsGroup in [
          { title: 'Filters', tags: customTags },
          { title: 'Tags', tags: normalTags },
        ]"
        :key="tagsGroup.title"
        class="tags"
      >
        <div class="title">
          {{ tagsGroup.title }}
        </div>
        <div class="tags-select default">
          <MusicTag
            v-for="tag in tagsGroup.tags"
            :key="tag.name"
            class="tag"
            :class="{
              on: tags.includes(tag.name),
            }"
            :tag="tag"
            element="button"
            @click="toggleTag(tag.name)"
          />
        </div>
      </div>

      <div class="row-sort">
        <div class="title">
          Sort by
        </div>
        <div class="sort">
          <button
            class="sort-dir"
            :title="sortDir"
            @click="toggleSortDir"
          >
            <iconify-icon :icon="sortDirIcon" />
          </button>

          <div class="sort-by">
            <InputSelect
              v-model="sortBy"
              class="select"
              :options="sortOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SortBy, SortDir } from '~/components/DiscographyView.vue';
import { useStorage } from '@vueuse/core';
import { computed } from 'vue';
import InputSelect from '~/components/InputSelect.vue';
import MusicTag from '~/components/MusicTag.vue';
import { createTags, isTagHidden } from '~/composables/tags';
import { useDiscography } from '~/stores/discography';

const discography = useDiscography();

const opened = useStorage('search-controls-opened', false);

const search = defineModel<string>('search', { default: '' });
const tags = defineModel<string[]>('tags', { default: [] });
const sortBy = defineModel<SortBy>('sortBy', { default: 'title' });
const sortDir = defineModel<SortDir>('sortDir', { default: 'ascending' });

const sortOptions = [
  { label: 'Title', value: 'title' },
  { label: 'Upload Time', value: 'uploadTime' },
  { label: 'Random', value: 'random' },
];

const toggleSortDir = () => {
  sortDir.value = sortDir.value === 'ascending' ? 'descending' : 'ascending';
};

const sortDirIcon = computed(() => {
  if (sortBy.value === 'random') return 'tabler:refresh';
  return sortDir.value === 'ascending' ? 'tabler:sort-ascending' : 'tabler:sort-descending';
});

const customTags = computed(() => createTags(['.highlight', '.loop']));

const normalTags = computed(() => {
  const tagNames = discography.value
    .flatMap(music => music.tags)
    .filter(tag => !isTagHidden(tag))
    .map(tag => tag.name)
    .toSorted();
  const tagNamesUnique = [...new Set(tagNames)];
  return tagNamesUnique
    .map(tagName => ({ name: tagName }));
});

const toggleTag = (toggledTagName: string) => {
  const index = tags.value.indexOf(toggledTagName);
  if (index === -1) {
    tags.value.push(toggledTagName);
  }
  else {
    tags.value.splice(index, 1);
  }
  // Need this for some reason in order to force emitting update
  tags.value = [...tags.value];
};
</script>

<style lang="scss" scoped>
@keyframes overflow-open {
  to { overflow: visible; }
}
@keyframes overflow-close {
  to { overflow: hidden; }
}

.browse-filters {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: stretch;

  padding: 1.3rem 1.5rem;
  border-radius: 0.5rem;
  background-color: #fff2;
  backdrop-filter: blur(0.2rem);

  button.toggle {
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    min-width: 9rem;
    height: 2.5rem;
    padding-inline: 1rem;
    padding-block: 0.7rem 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background-color: #111;
    transition:
      background-color 200ms ease-in-out,
      color 200ms ease-in-out;

    iconify-icon {
      margin-bottom: 0.3rem;
    }
  }

  &.opened button.toggle {
    background-color: var(--accent-color);
    color: #000;
  }

  .title {
    font-size: 0.9rem;
    padding-inline: 0.5rem;
    padding-bottom: 0.3rem;
    color: #ddd;
  }

  .row-search {
    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: stretch;
    gap: 1rem;

    .search {
      position: relative;
      flex-grow: 1;

      iconify-icon {
        position: absolute;
        z-index: 1;
        align-self: center;
        inset-block-start: 0.8rem;
        inset-inline-start: 0.7rem;
      }

      input {
        width: 100%;
        height: 2.5rem;
        padding-inline: 2.3rem 1rem;
        padding-block: 0.7rem 0.5rem;
        border: none;
        border-radius: 0.5rem;
        background-color: #111;
        outline-offset: 0.2rem;
      }
    }
  }

  .content {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: stretch;
    height: 0rem;
    // We have to use `overflow` and not only `overflow-y`
    // because of a chromium bug that makes content scroll y on overflow
    // So play with margins and paddings to not crop anything on x
    margin-inline: -1.5rem;
    padding-inline: 1.5rem;
    margin-bottom: -1rem;
    padding-bottom: 1rem;
    overflow: hidden;
    transition: height 300ms ease-in-out;
    transition-behavior: allow-discrete;
    animation: overflow-close 0ms 0ms forwards;

    & > * {
      margin-top: 1.5rem;
    }
  }

  &.opened .content {
    animation: overflow-open 0ms 300ms forwards;
    height: auto;
  }

  .row-sort {
    .sort {
      display: flex;
      flex-flow: row;
      align-content: flex-start;
      align-items: center;
      gap: 0.3rem;

      button.sort-dir {
        display: grid;
        place-items: center;
        height: 2.5rem;
        width: 2.5rem;
        padding: 0rem;
        border: none;
        border-radius: 0.5rem;
        background-color: #111;
      }

      .sort-by {
        .select {
          min-width: 10rem;
        }
      }
    }
  }

  .tags {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: stretch;

    .tags-select {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-items: center;
      gap: 0.2rem 0.3rem;

      .tag {
        user-select: none;
        cursor: pointer;

        &.on {
          background-color: var(--accent-color);
          color: #000;

          :deep(.hashtag) {
            color: #666;
          }
        }
      }
    }
  }
}
</style>
