<template>
  <section>
    <MusicItem
      v-if="music"
      :music
    />

    <div v-else>
      The given track was not found
    </div>

    <div class="more">
      <iconify-icon icon="mdi:chevron-double-right" />
      <RouterLink to="/browse">
        <span class="more-text">Browse more</span>
      </RouterLink>
      <iconify-icon icon="mdi:chevron-double-left" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MusicItem from '~/components/MusicItem.vue';
import { useDiscography } from '~/stores/discography';

const route = useRoute();
const musicId = route.params.id;

const discography = useDiscography();
const music = computed(() => discography.value.find(music => music.id === musicId));
</script>

<style lang="scss" scoped>
section {
  align-items: center;
  gap: 5rem;

  h2 {
    align-self: center;
  }

  .music-item {
    width: min(80dvw, 16rem);
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
