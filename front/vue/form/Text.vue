<script setup lang="ts">
import { VNodeRef, onMounted, ref, watch } from "vue";
let emit = defineEmits<{
  (e: "change_event", data: any): void;
}>();
let input_ref = ref<VNodeRef | null>(null);

const props = defineProps<{
  title: string;
  initial_value: any;
}>();

onMounted(() => {
  if (props.initial_value) {
    input_ref.value.value = props.initial_value;
  }
});

watch(
  () => props.initial_value,
  () => {
    if (props.initial_value) {
      input_ref.value.value = props.initial_value;
    }
  }
);
function handle_input() {
  emit("change_event", input_ref.value.value);
}
</script>

<template>
  <input
    ref="input_ref"
    type="text"
    class="form-control"
    autocomplete="chrome-off"
    v-bind:placeholder="props.title"
    v-on:input="handle_input"
  />
</template>

<style></style>
