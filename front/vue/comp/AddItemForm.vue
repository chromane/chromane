<script setup lang="ts">
import Form from "@chromane/front/vue/form/Form.vue";
//
import Button from "@chromane/front/vue/comp/Button.vue";

import { reactive, onMounted } from "vue";

const emits = defineEmits(["click-save", "click-cancel"]);

const props = defineProps({
  form_state: {
    type: Object,
  },
  form_fields: {
    type: Array,
  },
});

onMounted(() => {
  document.querySelector("input")?.focus();
  if (props.form_state) {
    model.form_state = props.form_state;
  } else {
    model.form_state = {};
  }
});

let model = reactive({
  //
  form_fields: [],
  form_state: {},
  //
});

async function handle_click_save() {
  emits("click-save", model.form_state);
}
async function handle_click_cancel() {
  emits("click-cancel", model.form_state);
}
function handle_form_change(data) {
  console.log(data, "DATA DATA DATA");
  model.form_state[data.name] = data.value;
}
let cancel_button = {
  text: "Cancel",
  color: "white",
};
let save_template_button = {
  text: "Save",
  color: "primary",
};
//
</script>

<template>
  <div class="template-form">
    <Form
      @change="handle_form_change"
      :form_state="props.form_state"
      :form_fields="props.form_fields"
    ></Form>
    <div class="buttons">
      <Button
        @button_click="handle_click_save"
        :model="save_template_button"
      ></Button>
      <Button
        @button_click="handle_click_cancel"
        :model="cancel_button"
      ></Button>
    </div>
  </div>
</template>

<style>
.template-form .chromane_button-wrap {
  width: 160px;
  margin-right: 8px;
}
.template-form .buttons {
  margin-top: 24px;
  display: flex;
}
.template-form .button {
  margin-right: 8px;
}
</style>
