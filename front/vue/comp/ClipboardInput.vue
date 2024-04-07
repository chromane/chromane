<script setup lang="ts">
import mdi_copy from "@mdi/svg/svg/content-copy.svg?raw";
import util from "@chromane/shared/ts/util";
import { reactive } from "vue";
const props = defineProps<{
  text: string;
}>();
let model = reactive({
  tippy_text: "Copy to clipboard",
});
async function copy() {
  //   util.copy_to_clipboard(props.text);
  navigator.clipboard.writeText(props.text);
  model.tippy_text = "Copied";
  await util.wait(2000);
  model.tippy_text = "Copy to clipboard";
}
</script>

<template>
  <div class="clipboard-input">
    <input
      readonly
      type="text"
      :value="props.text"
    />
    <div
      v-tippy="{ content: model.tippy_text, hideOnClick: false }"
      class="copy-button"
      v-html="mdi_copy"
      v-on:click="copy"
    ></div>
  </div>
</template>

<style lang="scss">
.clipboard-input {
  display: flex;
  height: 36px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  input {
    height: 100%;
    flex-grow: 1;
    padding: 0px 12px;
  }
  .copy-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 100%;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    cursor: pointer;
    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
