<script setup lang="ts">
import { VNodeRef, onMounted, ref, watch } from "vue";
const emit = defineEmits<{
  (e: "change_event", data: any): void;
}>();
const input_ref = ref<VNodeRef | null>(null);
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
  // console.log("change_event", input_ref.value.value);
  emit("change_event", input_ref.value.value);
}
</script>

<template>
  <textarea
    ref="input_ref"
    type="text"
    class="form-control form-control-textarea"
    autocomplete="chrome-off"
    v-bind:placeholder="title"
    v-on:input="handle_input"
  ></textarea>
</template>

<style>
.form-control-textarea {
  height: 120;
}
</style>
