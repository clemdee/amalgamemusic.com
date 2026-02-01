<template>
  <PlayerBarPopover
    v-model="opened"
  >
    <div class="share-popover">
      <h2>
        <iconify-icon
          icon="mdi:share-variant-outline"
          title="share"
        />

        <span
          class="title"
          :title="props.music.title"
        >
          {{ props.music.title }}
        </span>
      </h2>

      <div
        class="share-url"
        type="text"
      >
        <div class="share-url-link">
          {{ props.music.url }}
        </div>

        <button
          class="copy-link"
          @click="copyLink"
        >
          <iconify-icon
            icon="mdi:content-copy"
            title="copy url"
          />
        </button>
      </div>

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
          <iconify-icon
            icon="mdi:download"
            title="download"
          />

          Download track
        </span>
      </button>

      <CC />
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

const copyLink = () => {
  navigator.clipboard.writeText(`${props.music.url}`);
};

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
.share-popover {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;

  h2 {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    font-size: 1.2rem;

    iconify-icon {
      font-size: 1.4rem;
      margin-bottom: 0.1rem;
    }

    .title {
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 20rem;
    }
  }

  .share-url {
    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 0.5rem;
    overflow: clip;

    .share-url-link {
      display: flex;
      align-items: center;
      padding: 1rem 1rem;
      background-color: #111;
    }

    button.copy-link {
      position: relative;
      display: grid;
      place-items: center;
      padding: 0.5rem 1rem;
      background-color: #111;

      &::before {
        position: absolute;
        left: 0;
        content: '';
        height: 50%;
        border-left: 0.1rem solid #2b2b40dd;
      }

      iconify-icon {
        font-size: 1.2rem;
      }
    }
  }

  button.download {
    align-self: stretch;
    display: grid;
    place-content: center;

    padding: 1rem 3rem;
    border-radius: 1rem;
    background-color: #111;
    height: 3rem;

    iconify-icon {
      font-size: 1.2rem;
    }

    span {
      display: flex;
      justify-content: center;
      align-items: center;
      column-gap: 1ch;
    }
  }
}
</style>
