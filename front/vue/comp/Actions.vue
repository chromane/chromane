<script setup lang="ts">
import icons from "@chromane/ts/vue_app/ts/icons";
import store from "@chromane/ts/extensions/chromane/vue/ext_store";
import { reactive } from "vue";

const props = defineProps<{
  action_model_arr: any;
}>();

let model = reactive({
  button_start: {
    icon: icons.mdi_play_circle,
    text: "Start",
    color: "primary",
    status: "idle",
    fit_content: true,
  },
});

import ActionHeader from "./ActionHeader.vue";
</script>
<template>
  <div class="container actions main">
    <div
      class="action"
      v-for="action_model in props.action_model_arr"
    >
      <ActionHeader v-bind:action_model="action_model"></ActionHeader>
      <div
        v-if="action_model.action_model_arr"
        class="action-body"
      >
        <div class="container actions">
          <div
            class="action"
            v-for="action_model_sub in action_model.action_model_arr"
          >
            <ActionHeader v-bind:action_model="action_model_sub"></ActionHeader>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.page.active.actions {
  align-items: flex-start;
}
.actions.container.main {
  margin-top: 24px;
}
.actions.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}
.action-body {
  padding: 12px 24px 24px 24px;
}
.action:last-child > .action-header {
  border-bottom: 0px solid black;
}
</style>
