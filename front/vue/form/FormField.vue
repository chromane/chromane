<script setup lang="ts">
import TextField from "./TextField.vue";
import TextareaField from "./TextareaField.vue";
import Number from "./Number.vue";

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
      <TextareaField
        v-if="model.type === 'textarea'"
        :model="props.model"
      ></TextareaField>
    </div>
  </div>
</template>

<style></style>
