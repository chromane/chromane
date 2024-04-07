<script setup lang="ts">
const props = defineProps(["action_model"]);

import { watch, reactive } from "vue";
import icons from "../../ts/icons";
let model = reactive({
  text: "",
  items: [],
});

watch(
  () => props.action_model,
  () => {
    // console.log("props.action_model", props.action_model);
    if (!props.action_model) {
      return;
    }
    model.text = props.action_model.action[0];
    if (props.action_model.action[0] === "append_actions_for_each_element") {
      // model.items = [props.action_model.action[0]];
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
      ];
    } else if (props.action_model.action[0] === "make_sure_url_is") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "url", text: props.action_model.action[1] },
      ];
    } else if (props.action_model.action[0] === "repeat_steps") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "number", text: props.action_model.action[1] },
        { type: "number", text: props.action_model.action[2] },
      ];
    } else if (props.action_model.action[0] === "find_elements" || props.action_model.action[0] === "wait_for_element") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "selector", text: props.action_model.action[1] },
      ];
    } else if (props.action_model.action[0] === "wait_for_element_by_text") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "selector", text: props.action_model.action[1] },
        { type: "text", text: props.action_model.action[2] },
      ];
    } else if (props.action_model.action[0] === "find_element_by_text") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "selector", text: props.action_model.action[1] },
        { type: "text", text: props.action_model.action[2] },
      ];
    } else if (props.action_model.action[0] === "wait") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "number", text: props.action_model.action[1] },
      ];
    } else if (props.action_model.action[0] === "take_element_from_state_by_index") {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "variable", text: props.action_model.action[1] },
      ];
    } else if (!props.action_model.action[1]) {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
      ];
    } else {
      model.items = [
        //
        { type: "name", text: props.action_model.action[0] },
        { type: "url", text: props.action_model.action[1] },
      ];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="action-header">
    <div class="action-header-text">
      <span
        v-for="item in model.items"
        v-text="item.text"
        v-bind:class="{
          url: item.type === 'url',
          name: item.type === 'name',
          text: item.type === 'text',
          selector: item.type === 'selector',
          number: item.type === 'number',
          variable: item.type === 'variable',
        }"
      ></span>
    </div>
    <div
      class="action-header-status"
      v-if="props.action_model.status === 'progress'"
    >
      <div class="action-header-spinner"></div>
    </div>
    <div
      class="action-header-status"
      v-if="props.action_model.status === 'success'"
    >
      <div
        class="svg"
        v-html="icons.mdi_check"
      ></div>
    </div>
  </div>
</template>

<style>
.action-header {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 40px;
  width: 100%;
  padding: 0px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.action-header span {
  padding: 2px 6px;
  border-radius: 2px;
}
.action-header span.name {
  background-color: #b3d1ff;
}
.action-header span.url {
  background-color: #ffcb6b;
}
.action-header span.text {
  background-color: #d8ff6b;
}
.action-header span.selector {
  background-color: #ffbef1;
}
.action-header span.number {
  background-color: #83c5df;
}
.action-header span.variable {
  background-color: #c00000;
  color: white;
}
.action-header-text > span {
  margin-right: 4px;
}
/*  */
.action-header-status {
  position: absolute;
  background-color: #eeeff2;
  height: 100%;
  width: 40px;
  top: 0px;
  right: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}
.action-header-status svg {
  width: 24px;
  height: 24px;
  fill: green;
}
.action-header-spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 14px;
  height: 14px;
  animation: action-header-spinner 0.75s linear infinite;
}
@keyframes action-header-spinner {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
