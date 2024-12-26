<template>
  <section class="main">
    <ClientOnly>
      <div class="musics">
        <MusicItem
          v-for="music in discography"
          :key="music.id"
          :music
        />
      </div>
    </ClientOnly>
  </section>
</template>

<script lang="ts" setup>
import MusicItem from '~/components/MusicItem.vue';
import { useDiscography } from '~/stores/discography';

const discography = useDiscography();
</script>

<style lang="scss" scoped>
.musics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  width: 100%;
}
</style>
