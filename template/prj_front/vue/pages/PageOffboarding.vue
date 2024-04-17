<script setup lang="ts">
import MessageSimple from "@chromane/front/vue/comp/MessageSimple.vue";
import Form from "@chromane/front/vue/form/Form.vue";
import Button from "@chromane/front/vue/comp/Button.vue";

import { reactive } from "vue";
import ext_ctrl from "@root/prj_front/vue/ctrl";
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
      title: "Why did you uninstall?",
      type: "checkboxes",
      options: [
        //
        "I didn't understand how it works.",
        "Too expensive",
        "Does not support my website",
        "Doesn't have the features I need",
        "Didn't work on the sites I visited",
        "The extension was crashing",
        "The extension was slowing down my computer",
        "It slows down my browser",
        "I have privacy or security concerns",
        "I can't afford it",
      ],
    },
    {
      name: "message",
      title: "How can we improve?",
      type: "textarea",
    },
  ],
});

async function send_feedback() {
  ext_ctrl.blocking_inc();
  await ext_ctrl.firebase_manager.backend_proxy.modules.chromane.website_message({
    client_id: "website",
    hostname: "Bloom chrome extension",
    name: model.form_state.name,
    email: model.form_state.email,
    message: model.form_state.message,
  });
  model.form_state = {};
  model.stage_name = "message_sent";
  ext_ctrl.blocking_dec();
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
          title: 'We are sorry to see you go',
          text: 'Thank you for installing and using this extension. Can you please share why you decided to uninstall it?',
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
