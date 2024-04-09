<script setup lang="ts">
import Text from "./Text.vue";
import TextReadonly from "./TextReadonly.vue";
import Number from "./Number.vue";
import Time from "./Time.vue";
import Date from "./Date.vue";
import PhoneNumber from "./PhoneNumber.vue";
import Textarea from "./Textarea.vue";
import TextareaJson from "./TextareaJson.vue";
import Select from "./Select.vue";
import SelectMultiple from "./SelectMultiple.vue";
import Checkboxes from "./Checkboxes.vue";
import Address from "./Address.vue";
import SelectTeams from "./select_teams/SelectTeams.vue";

const emit = defineEmits<{
  (e: "change", data: any): void;
}>();

const props = defineProps<{
  form_state: any;
  form_fields: any;
}>();

let methods = {
  handle_change(name, value) {
    if (value instanceof Event === false) {
      props.form_state[name] = value;
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
      v-for="item in props.form_fields"
    >
      <label
        class="control-label"
        for="title"
        v-text="item.title"
      ></label>
      <Text
        v-if="item.type === 'text'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Text>
      <TextReadonly
        v-if="item.type === 'text_readonly'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></TextReadonly>
      <Address
        v-if="item.type === 'address'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Address>
      <Number
        v-if="item.type === 'number'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Number>
      <Time
        v-if="item.type === 'time'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Time>
      <Date
        v-if="item.type === 'date'"
        v-bind:key="item.name"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Date>
      <PhoneNumber
        v-if="item[1] === 'phone_number'"
        v-bind:title="item[2]"
        v-bind:initial_value="props.form_state[item[0]]"
        v-on:change="methods.handle_change(item.name, $event)"
      ></PhoneNumber>
      <Textarea
        v-if="item.type === 'textarea'"
        v-bind:title="item.title"
        v-bind:initial_value="props.form_state[item.name]"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></Textarea>
      <TextareaJson
        v-if="item.type === 'json_arr'"
        v-bind:title="item.title"
        :form_field="item"
        :form_state="props.form_state"
        v-on:change_event="methods.handle_change(item.name, $event)"
      ></TextareaJson>
      <SelectTeams
        v-if="item.type === 'teams'"
        :init_teams="props.form_state[item.name]"
        v-on:my_change="methods.handle_change(item.name, $event)"
      ></SelectTeams>
      <Select
        v-if="item.type === 'select'"
        v-bind:options="item.options"
        v-bind:initial_value="props.form_state[item.name]"
        v-bind:title="'Select option'"
        v-on:change="methods.handle_change(item.name, $event)"
      ></Select>
      <SelectMultiple
        v-if="item.type === 'select_multiple'"
        v-bind:options="item.options"
        v-bind:initial_value="props.form_state[item.name]"
        v-bind:title="'Select option'"
        v-on:change="methods.handle_change(item.name, $event)"
      ></SelectMultiple>
      <Checkboxes
        v-if="item.type === 'checkboxes'"
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
