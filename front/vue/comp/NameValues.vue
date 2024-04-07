<script setup lang="ts">
const props = defineProps<{
  model: any;
}>();
</script>

<template>
  <div class="name-value-cont">
    <div
      class="name-value"
      v-for="(value, key) in props.model"
    >
      <div class="name">
        <span v-text="key"></span>
        <span>: </span>
      </div>
      <div
        class="value"
        v-text="value"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
.name-value {
  font-size: 14px;
  margin-bottom: 4px;
  .name {
    display: inline;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.95);
  }
  .value {
    display: inline;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.85);
  }
}
</style>
