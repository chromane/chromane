<script setup lang="ts">
import { VNodeRef, onMounted, ref, watch } from "vue";
let emit = defineEmits<{
  (e: "change_event", data: any): void;
}>();
let input_ref = ref<VNodeRef | null>(null);
const props = defineProps<{
  form_state: any;
  form_field: any;
}>();

watch(
  () => [props.form_state[props.form_field.name], input_ref.value],
  () => {
    if (input_ref && input_ref.value) {
      input_ref.value.value = props.form_state[props.form_field.name] || "";
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <input
    ref="input_ref"
    type="text"
    readonly
    class="form-control"
    autocomplete="chrome-off"
    v-bind:placeholder="props.form_field.placeholder || props.form_field.title"
  />
</template>

<style></style>
