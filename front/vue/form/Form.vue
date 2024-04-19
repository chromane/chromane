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

import mdi_info from "@mdi/svg/svg/information-outline.svg?raw";

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
      <div class="label">
        <div v-text="item.title"></div>
        <div
          class="info"
          v-if="item.hint"
          v-html="mdi_info"
          v-tippy="item.hint"
        ></div>
      </div>
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

<style lang="scss">
@import url(./form.css);

.form {
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 14px;
  .label {
    display: flex;
    margin-bottom: 4px;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #1f2d43;
    .info svg {
      display: block;
      width: 18px;
      height: 18px;
      fill: rgba(0, 0, 0, 0.8);
      transform: translate(3px, -2px);
    }
  }
  &.warning {
    .lable {
      color: #db4346;
    }
  }
}

.form-group-select-wrap {
  position: relative;

  width: 100%;
  height: 40px;
  margin-bottom: 5px;

  background-color: #fff;

  border: 1px solid rgba(31, 45, 67, 0.5);
  border-radius: 5px;

  color: #555555;
  line-height: 20px;
  outline: none;

  font-size: 12px;
  box-shadow: none;
}

.form-group-select-wrap svg {
  position: absolute;

  top: 8px;
  right: 8px;
  height: 17px;
  width: 17px;

  fill: rgba(0, 0, 0, 0.3);
}

.form-group input,
.form-group textarea {
  width: 100%;
  height: 38px;
  padding: 9.5px 14px;

  background-color: #fff;

  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 4px;

  font-weight: 300;
  font-size: 14px;
  line-height: 18px;
  color: #1f2d43;

  outline: none;
  box-shadow: none;

  transition: all 0.2s ease;
}

.form-group textarea {
  resize: none;
  height: 140px;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #85b7d9;
}

.form-group select {
  width: 100%;
  height: 100%;
  padding: 3px 15px;

  background-color: transparent;

  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.form-group.warning input {
  border-color: #db4346;
}

.form-group .help-block {
  display: none;
}

.form-group.warning .help-block {
  display: block;

  margin-top: 4px;

  font-weight: 300;
  font-size: 12px;
  line-height: 16px;
  color: #db4346;
}

/**/
</style>
