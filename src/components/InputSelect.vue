<template>
  <Select
    v-model="option"
    class="select"
    :options="props.options"
    option-label="label"
    option-value="value"
    append-to="#app"
    pt:label:class="select-label"
    pt:overlay:class="select-overlay"
    pt:list:class="select-list"
    pt:option:class="select-option"
  >
    <template #dropdownicon>
      <iconify-icon
        icon="uil:sort"
        title="previous"
      />
    </template>
  </Select>
</template>

<script lang="ts" setup generic="T">
// Using primevue library for custom select so that I can style it
// Because select component logic is a pain I don't want to deal with
import Select from 'primevue/select';

export interface Option<T> {
  label: string
  value: T
}

const props = defineProps<{
  options: Option<T>[]
}>();

const option = defineModel<Option<T>['value']>({ required: true });
</script>

<style lang="scss" scoped>
.select {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  height: 2.5rem;
  padding-inline: 1rem;
  padding-block: 0.7rem 0.5rem;
  border-radius: 0.5rem;
  color: var(--font-color);
  background-color: #111;
  user-select: none;
  cursor: pointer;

  &:has(:focus-visible) {
    outline-style: solid;

    :deep(.select-label) {
      outline-style: none !important;
    }
  }
}
</style>

<style lang="scss">
.select-overlay {
  .select-list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    margin-top: 0.5rem;
    border-radius: 0.5rem;
    list-style-type: none;
    overflow: hidden;
    color: var(--font-color);
    background-color: #111;
    box-shadow: 0 0.3rem 2rem #0002;

    .select-option {
      height: 2.5rem;
      padding: .5rem 1rem;
      align-content: center;
      color: var(--font-color);
      background-color: #111;
      cursor: pointer;

      // Style focused item, or selected item if no other item is being focused
      &[data-p-focused="true"],
      &[data-p-selected="true"][data-p-focused="true"],
      &[data-p-selected="true"][data-p-focused="false"]:is(.select-list:not(:has([data-p-focused="true"])) .select-option) {
        background-color: var(--accent-color);
        color: #111;
      }
    }
  }
}
</style>
