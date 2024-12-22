<template>
  <RouterView />
  <ThePlayerBar />
  <ThePlaylistPanel />
</template>

<script setup lang="ts">
import ThePlayerBar from './components/ThePlayerBar.vue';
import ThePlaylistPanel from './components/ThePlaylistPanel.vue';
</script>

<style scoped>
</style>
