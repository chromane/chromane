<script setup lang="ts">
import Message from "@chromane/front/vue/comp/Message.vue";
import ill_ask from "@shared/svg/ill/ask.svg?raw";
import ext_ctrl from "@root/prj_front/vue/ctrl";
</script>

<template>
  <div class="page account">
    <div class="page-inner">
      <Message
        :model="{
          ill: ill_ask,
          title: 'Page reload required',
          text: 'Please reload this page to activate the tool. You can click the button below to do that.',
          button: {
            text: 'Reload',
          },
        }"
        v-on:button_click="
          () => {
            ext_ctrl.proxy_extension_iframe.tabs_reload();
          }
        "
      ></Message>
    </div>
  </div>
</template>

<style lang="scss">
.page.account {
  .name-value-cont {
    padding: 4px 24px 4px 12px;
    border-left: 1px solid var(--color-primary);
  }
  .section {
    width: 100%;
    max-width: 520px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .text {
      margin-bottom: 12px;
      font-size: 14px;
    }
  }
}
</style>
