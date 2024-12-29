<template>
  <h1 title="Amalgame">
    Amalgame
  </h1>

  <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
      <filter id="scribble">
        <feTurbulence id="turbulence" :baseFrequency="baseFrequency" :numOctaves="numOctaves" result="noise" :seed="seed" />
        <feDisplacementMap in="SourceGraphic" in2="noise" :scale="scale" />
      </filter>
    </defs>
  </svg>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { randomFloat, randomInt, wait } from '~/composables/utils';

const baseFrequency = ref(0.01);
const numOctaves = ref(3);
const scale = ref(3);
const seed = ref(0);
const waitTime = ref(100);

const updateScribble = async () => {
  baseFrequency.value = randomFloat(0.005, 0.015);
  numOctaves.value = randomInt(1, 3);
  scale.value = randomFloat(0.5, 1.2);
  seed.value = randomInt(0, 999999);
  waitTime.value = randomInt(200, 280);
  await wait(waitTime.value);
  updateScribble();
};

updateScribble();
</script>

<style lang="scss" scoped>
h1 {
  font-family: 'California';
  filter: url("#scribble");
}

svg {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
