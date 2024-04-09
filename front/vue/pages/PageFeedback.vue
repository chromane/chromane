<script setup lang="ts">
import type CloudIframe from "../../ts/CloudIframe";
const props = defineProps<{
  ctrl: CloudIframe;
}>();

import MessageSimple from "@chromane/front/vue/comp/MessageSimple.vue";
import Form from "@chromane/front/vue/form/Form.vue";
import Button from "@chromane/front/vue/comp/Button.vue";

import { reactive } from "vue";
// todo:
// add form validation here
// and required fields ( message )
// name and email - optional
let model = reactive({
  stage_name: "initial",
  //
  form_state: {} as any,
  form_fields: [
    {
      name: "name",
      title: "Your name",
      type: "text",
    },
    {
      name: "email",
      title: "Your email",
      type: "text",
    },

    {
      name: "message",
      title: "Message",
      type: "textarea",
    },
  ],
});

async function send_feedback() {
  props.ctrl.blocking_inc();
  await props.ctrl.firebase_manager.backend_proxy.common.send_user_feedback({
    client_id: "website",
    hostname: "Bloom chrome extension",
    name: model.form_state.name,
    email: model.form_state.email,
    message: model.form_state.message,
  });
  model.form_state = {};
  model.stage_name = "message_sent";
  props.ctrl.blocking_dec();
}
function continue_click() {
  model.stage_name = "initial";
}
</script>

<template>
  <div class="page popup">
    <div
      class="page-inner"
      v-if="model.stage_name === 'initial'"
    >
      <MessageSimple
        class="mb-4"
        :model="{
          type: 'info',
          title: 'Send us a message',
          text: 'Thank you for installing and using this extension. You can use the form below to send us a message with your thoughts about this plugin. If you have any issues, or suggestions - we would be happy to work on them.',
        }"
      ></MessageSimple>
      <Form
        :form_fields="model.form_fields"
        :form_state="model.form_state"
      ></Form>
      <Button
        :model="{
          text: 'Send',
        }"
        v-on:button_click="send_feedback"
      ></Button>
    </div>
    <div
      class="page-inner"
      v-if="model.stage_name === 'message_sent'"
    >
      <MessageSimple
        class="mb-4"
        :model="{
          type: 'positive',
          title: 'Message sent',
          text: 'Thank you for sending us your message. We will try work on it as soon as possible.',
        }"
      ></MessageSimple>
      <Button
        :model="{
          text: 'Continue',
        }"
        v-on:button_click="continue_click"
      ></Button>
    </div>
  </div>
</template>

<style></style>
