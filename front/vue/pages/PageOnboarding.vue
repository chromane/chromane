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
    <div class="page-inner">
      <MessageSimple
        class="mb-4"
        :model="{
          type: 'success',
          title: 'Thank you for installing Patch Tagger',
          text: 'Thank you for installing and using this extension. On this page you can find basic instructions on how to use this browser plugin, along with simple videos that show off functionality.',
        }"
      ></MessageSimple>
      <div class="section">
        <div class="title">1. Adding tags to new videos</div>
        <div class="text">
          Thank you for installing and using this extension. On this page you can find basic instructions on how to use this browser plugin, along
          with simple videos that show off functionality.
        </div>
        <video
          class="explainer-video"
          autoplay
          muted
          loop
          src="https://chromane-bloom.web.app/static/video/add_camera_blom.webm"
        ></video>
      </div>
      <div class="section">
        <div class="title">2. Searching for videos in your collection</div>
        <div class="text">
          Thank you for installing and using this extension. On this page you can find basic instructions on how to use this browser plugin, along
          with simple videos that show off functionality.
        </div>
        <video
          class="explainer-video"
          autoplay
          muted
          loop
          src="https://chromane-bloom.web.app/static/video/add_mic_bloom.webm"
        ></video>
      </div>
      <div class="section">
        <div class="title">3. Sharing collections with others</div>
        <div class="text">
          Thank you for installing and using this extension. On this page you can find basic instructions on how to use this browser plugin, along
          with simple videos that show off functionality.
        </div>
        <video
          class="explainer-video"
          autoplay
          muted
          loop
          src="https://chromane-bloom.web.app/static/video/add_mic_bloom.webm"
        ></video>
      </div>
      <div class="section">
        <div class="title">4. Renaming a tag</div>
        <div class="text">
          Thank you for installing and using this extension. On this page you can find basic instructions on how to use this browser plugin, along
          with simple videos that show off functionality.
        </div>
        <video
          class="explainer-video"
          autoplay
          muted
          loop
          src="https://chromane-bloom.web.app/static/video/add_mic_bloom.webm"
        ></video>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.explainer-video {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
