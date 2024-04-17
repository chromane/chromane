<script setup lang="ts">
import MessageSimple from "@chromane/front/vue/comp/MessageSimple.vue";
</script>

<template>
  <div class="page popup">
    <MessageSimple
      class="mb-4"
      :model="{
        type: 'info',
        title: 'Page not supported',
        text: 'This page is not supported. Please go to https://www.realestate.com.au/ to where the extension is supported.',
      }"
    ></MessageSimple>
  </div>
</template>

<style></style>
