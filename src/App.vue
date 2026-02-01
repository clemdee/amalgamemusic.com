<template>
  <div id="content">
    <div id="main">
      <TheTopBar />
      <RouterView />
    </div>
    <ThePlaylistPanel />
  </div>
  <ThePlayerBar />
</template>

<script setup lang="ts">
import TheTopBar from '~/components/TheTopBar.vue';
import ThePlayerBar from './components/ThePlayerBar.vue';
import ThePlaylistPanel from './components/ThePlaylistPanel.vue';
</script>

<style lang="scss">
#app {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
#content {
  width: 100%;
  position: relative;

  #main {
    display: flex;
    flex-flow: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
