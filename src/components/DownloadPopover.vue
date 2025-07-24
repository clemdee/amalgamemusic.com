<template>
  <PlayerBarPopover
    v-model="opened"
  >
    <div class="download-popover">
      <h2>
        Download
        <span
          class="title"
          :title="props.music.title"
        >
          {{ props.music.title }}
        </span>
        <span class="extension">.{{ extension }}</span>
      </h2>
      <CC />
      <button
        class="download"
        :disabled="loading"
        @click="download"
      >
        <iconify-icon
          v-if="loading"
          icon="svg-spinners:ring-resize"
          title="download"
        />
        <span v-else>
          Download
        </span>
      </button>
    </div>
  </PlayerBarPopover>
</template>

<script lang="ts" setup>
import type { Music } from '~/composables/music';
import { computed, ref } from 'vue';
import { downloadFile, wait } from '~/composables/utils';
import CC from './CC.vue';
import PlayerBarPopover from './PlayerBarPopover.vue';

const props = defineProps<{
  music: Music
}>();

const opened = defineModel<boolean>();

const loading = ref(false);

const extension = computed(() => {
  return props.music.src.match('[^.]+$')?.[0] ?? '';
});

const downloadName = computed(() => {
  return `${props.music.title}.${extension.value}`;
});

const download = async () => {
  loading.value = true;
  downloadFile(props.music.src, downloadName.value);
  await wait(1000);
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.download-popover {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;

  h2 {
    display: flex;
    align-items: center;
    column-gap: 1ch;

    font-size: 1.2rem;

    .title {
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;

      max-width: 20rem;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;

      font-size: 1rem;
      font-style: italic;
      background-color: #111;
    }

    .extension {
      font-size: 1rem;
      font-style: italic;
    }
  }
  button.download {
    align-self: stretch;
    padding: 1rem 3rem;
    border-radius: 1rem;
    background-color: #111;
  }
}
</style>
