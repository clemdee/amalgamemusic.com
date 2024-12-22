<template>
  <section class="main">
    <div class="musics">
      <MusicItem
        v-for="music in musics"
        :key="music.id"
        :music
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MusicItem from '~/components/MusicItem.vue';
import { createMusicId, type Music } from '~/composables/music';

const musics = computed<Music[]>(() => [
  {
    id: createMusicId('94'),
    title: '94 stuff',
    src: '/data/94_10.mp3',
  },
  {
    id: createMusicId('130'),
    title: '130 and actually this is a longer title',
    src: '/data/130_7.mp3',
  },
]);

// player.queue(musics.value[0]);
// player.queue(musics.value[1]);
</script>

<style lang="scss" scoped>
.musics {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 2rem;
  width: 100%;
}
</style>
