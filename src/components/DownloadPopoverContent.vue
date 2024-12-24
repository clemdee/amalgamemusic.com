<template>
  <div class="download-popover">
    <h2>Download</h2>
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
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { Music } from '~/composables/music';
import { downloadFile, wait } from '~/composables/utils';
import CC from './CC.vue';

const props = defineProps<{
  music: Music
}>();

const loading = ref(false);

const download = async () => {
  loading.value = true;
  downloadFile(props.music.src, props.music.title);
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
    font-size: 1.2rem;
  }
  button.download {
    align-self: stretch;
    padding: 1rem 3rem;
    border-radius: 1rem;
    background-color: #111;
  }
}
</style>
