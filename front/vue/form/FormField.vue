<script setup lang="ts">
import TextField from "./TextField.vue";

const emit = defineEmits<{
  (e: "change", data: any): void;
}>();

const props = defineProps(["model"]);
</script>

<template>
  <div class="form">
    <div
      class="form-group"
      v-bind:class="{ warning: false }"
    >
      <label
        class="control-label"
        v-text="model.title"
      ></label>
      <TextField
        v-if="model.type === 'text'"
        :model="props.model"
      ></TextField>
    </div>
  </div>
</template>

<style></style>
