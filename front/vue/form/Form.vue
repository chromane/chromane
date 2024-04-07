<script setup lang="ts">
import Text from "./Text.vue";
import PhoneNumber from "./PhoneNumber.vue";
import Textarea from "./Textarea.vue";
import Select from "./Select.vue";
import Checkboxes from "./Checkboxes.vue";

const emit = defineEmits<{
  (e: "change", data: any): void;
}>();

const props = defineProps(["state", "model"]);

let methods = {
  handle_change(name, value) {
    // console.log(name, value);
    if (value instanceof Event === false) {
      emit("change", { name, value });
    }
  },
};
</script>

<template>
  <div class="form">
    <div
      class="form-group"
      v-bind:class="{ warning: false }"
      v-for="item in model"
    >
      <label
        class="control-label"
        for="title"
        v-text="item.title"
      ></label>
      <Text
        v-if="item.type === 'text'"
        v-bind:key="item.name"
        v-bind:title="item.title"
        v-bind:initial_value="state[item.name]"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Text>
      <Number
        v-if="item.type === 'number'"
        v-bind:key="item.name"
        v-bind:title="item.title"
        v-bind:initial_value="state[item.name]"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Number>
      <PhoneNumber
        v-if="item[1] === 'phone_number'"
        v-bind:title="item[2]"
        v-bind:initial_value="state[item[0]]"
        v-on:change="methods.handle_change(item.name, $event)"
      ></PhoneNumber>
      <Textarea
        v-if="item.type === 'textarea'"
        v-bind:title="item.title"
        v-bind:initial_value="state[item.name]"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Textarea>
      <Select
        v-if="item.type === 'select'"
        v-bind:options="item.options"
        v-bind:initial_value="state[item.name]"
        v-bind:title="'Select option'"
        v-on:change="methods.handle_change(item.name, $event)"
      ></Select>
      <Checkboxes
        v-if="item.name === 'checkboxes'"
        v-bind:initial_options="item.options"
        v-on:change="methods.handle_change(item.name, $event)"
      ></Checkboxes>
      <div class="help-block">Required</div>
    </div>
  </div>
</template>

<style>
@import url(./form.css);
</style>
