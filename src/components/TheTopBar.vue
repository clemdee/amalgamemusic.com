<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div
    class="top-bar"
    :class="{ opened }"
  >
    <div class="single-line">
      <div class="left">
        <img src="/src/assets/images/amalgame.png" />
        <TopBarTitle />
      </div>

      <div class="right">
        <TopBarLinks class="links" :links />

        <button
          class="open"
          @click="opened = !opened"
        >
          <iconify-icon
            icon="line-md:menu"
            title="Menu"
          />
        </button>
      </div>
    </div>
    <div
      ref="fullscreen"
      class="fullscreen"
    >
      <TopBarLinks
        class="links"
        :links
        @navigate="opened = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Link } from './TopBarLinks.vue';
import { useElementSize } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';
import TopBarLinks from './TopBarLinks.vue';
import TopBarTitle from './TopBarTitle.vue';

const links = ref<Link[]>([
  {
    title: 'listen',
    url: '/',
  },
  {
    title: 'about',
    url: 'about',
  },
]);

const opened = ref(false);

const fullscreenElement = useTemplateRef('fullscreen');
const { height } = useElementSize(() => fullscreenElement.value);
</script>

<style lang="scss" scoped>
.top-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 2rem;
  z-index: var(--z-top-bar);

  width: 100dvw;
  background-color: #fff2;
  backdrop-filter: blur(0.2rem);
  box-shadow: 0 0.3rem 2rem #0002;

  .single-line {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    height: 5rem;
    padding: 0.5rem max(2rem, min(5rem, 10%));

    .left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 1rem;
      cursor: default;

      &:hover {
        color: var(--accent-color);
        transition: color 100ms linear;
      }

      img {
        width: 3rem;
        aspect-ratio: 1;
        border-radius: 100%;
      }

      h1 {
        font-size: 1.6rem;
        // Adjust for baseline
        padding-top: 0.15rem;
      }
    }

    button.open {
      padding: 1rem;
      margin: -1rem;
      font-size: 2rem;
      display: none;
      cursor: pointer;
    }
  }

  .fullscreen {
    flex-grow: 1;
    display: none;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
  }

  @media (width < 40rem) {
    .single-line {
      .links {
        display: none;
      }

      button.open {
        display: flex;
      }
    }

    &.opened {
      --fullscreen-height: v-bind('height');
      position: sticky;
      gap: 0rem;
      top: 0rem;
      height: 100%;
      margin-bottom: calc(var(--fullscreen-height) * -1px);

      .fullscreen {
        display: flex;

        .links {
          flex-direction: column;
          padding: 6rem 3rem;
          transition: 500ms ease-out;

          :deep(a) {
            padding: 0.5rem 6rem;
          }
        }
      }

    }
  }
}
</style>

<style lang="scss">
@media (max-width: 40rem) {
  html:has(.top-bar.opened) {
    // Prevent main to scroll
    #main {
      overflow-y: hidden !important;
    }

    // Darken images under menu so that links stay readable
    .music-cover {
      transition: filter 20ms ease;
      filter: grayscale(0.4) brightness(0.45);
    }
  }
}
</style>
