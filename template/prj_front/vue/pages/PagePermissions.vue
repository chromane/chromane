<script setup lang="ts">
import Message from "@chromane/front/vue/comp/Message.vue";
import ill_ask from "@shared/svg/ill/ask.svg?raw";
</script>

<template>
  <div class="page account">
    <div class="page-inner">
      <Message
        :model="{
          ill: ill_ask,
          title: 'Additional permissions required',
          text: 'This tool needs the permission to read and change data on a specific website in order to be enabled.',
          permissions_button: {
            permissions: {
              origins: ['https://www.realestate.com.au/*'],
            },
            text: 'Grant permissions',
          },
        }"
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
