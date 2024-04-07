<script setup lang="ts">
const props = defineProps<{
  model: any;
  config: any;
}>();
let iframe_src = `chrome-extension://${props.config.extension_id}/pages/permissions_button/index.html`;
</script>

<template>
  <div class="permissions-button">
    <iframe
      :src="iframe_src"
      :name="JSON.stringify(props.model)"
    ></iframe>
  </div>
</template>

<style lang="scss">
.permissions-button {
  iframe {
    display: block;
    outline: none;
    width: 180px;
    height: calc(36px + 4px + 4px);
    margin: -4px 0px 0px -4px;
  }
}
</style>
