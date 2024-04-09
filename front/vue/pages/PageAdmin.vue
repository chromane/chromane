<script setup lang="ts">
import MessageSimple from "@common/vue/comp/MessageSimple.vue";
import Form from "@common/vue/form/Form.vue";
import Button from "@common/vue/comp/Button.vue";

import { reactive } from "vue";
import ext_ctrl from "./ext_ctrl";
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
    <div class="page-inner">PageAdmin</div>
  </div>
</template>

<style></style>
