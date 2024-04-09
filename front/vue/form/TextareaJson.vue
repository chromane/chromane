<script setup lang="ts">
import util from "@chromane/shared/ts/util";
import { VNodeRef, onMounted, ref, watch } from "vue";
const emit = defineEmits<{
  (e: "change_event", data: any): void;
}>();
const input_ref = ref<VNodeRef | null>(null);
const props = defineProps<{
  form_state: any;
  form_field: any;
}>();

watch(
  () => [props.form_state[props.form_field.name], input_ref.value],
  () => {
    if (input_ref && input_ref.value) {
      input_ref.value.value = JSON.stringify(props.form_state[props.form_field.name], null, "\t") || "";
    }
  },
  {
    immediate: true,
  }
);

function handle_input() {
  props.form_state[props.form_field.name] = util.decode_json(input_ref.value.value);
  input_ref.value.value = JSON.stringify(util.decode_json(input_ref.value.value), null, "\t");
}
</script>

<template>
  <textarea
    ref="input_ref"
    type="text"
    class="form-control form-control-textarea"
    autocomplete="chrome-off"
    v-bind:placeholder="props.form_field.placeholder || props.form_field.title"
    v-on:change="handle_input"
  ></textarea>
</template>

<style>
.form-control-textarea {
  height: 120;
}
</style>
