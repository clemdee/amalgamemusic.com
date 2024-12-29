<template>
  <div class="links">
    <RouterLink
      v-for="link in props.links"
      :key="link.url"
      :to="link.url"
      @click="emit('navigate', link)"
    >
      {{ link.title }}
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
export interface Link {
  title: string
  url: string
};

const props = defineProps<{
  links: Link[]
}>();

const emit = defineEmits<{
  navigate: [link: Link]
}>();
</script>

<style lang="scss" scoped>
.links {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  font-size: 1.2rem;

  :deep(a) {
    padding: 0.5rem;
    border-radius: 0.2rem;
    text-decoration: none;
  }
}
</style>
