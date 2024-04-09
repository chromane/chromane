<script setup lang="ts">
import ctrl from "./ext_ctrl";
import mdi_star_box from "@mdi/svg/svg/star-box.svg?raw";

import Button from "@common/vue/comp/Button.vue";
import MessageSimple from "@common/vue/comp/MessageSimple.vue";

let methods = {
  async continue() {
    ctrl.go_back();
  },
};
</script>

<template>
  <div class="page-pricing">
    <div class="page-pricing-fg">
      <MessageSimple
        class="mb-6"
        :model="{
          type: 'positive',
          title: 'Thank you for upgrading!',
          text: 'You have successfully subscribed to ChatGPT Prompt Generator for Business Premium. Enjoy unlimited prompts every day.',
          icon: mdi_star_box,
        }"
      ></MessageSimple>
      <Button
        :model="{
          color: 'primary',
          text: 'Continue',
        }"
        v-on:button_click="methods.continue"
      ></Button>
    </div>
  </div>
</template>

<style></style>
