<script setup lang="ts">
import Button from "@chromane/front/vue/comp/Button.vue";
import Actions from "@chromane/ts/vue_app/vue/comp/Actions.vue";

import icons from "@chromane/ts/vue_app/ts/icons";

import mdi_icon_stop from "@mdi/svg/svg/stop-circle-outline.svg?raw";

import { onMounted, reactive, vModelRadio, watch } from "vue";
import util from "@chromane/shared/ts/util";
import type FirebaseIframe from "../../ts/FirebaseIframe";

const props = defineProps<{
  ctrl: FirebaseIframe;
  name?: string;
  tool?: any;
}>();

let model = reactive({
  status: "not_active",
  current_action_index: 0,

  button_start: {
    icon: icons.mdi_play_circle,
    text: "Start",
    color: "primary",
    status: "idle",
    fit_content: true,
  },
  button_stop: {
    icon: mdi_icon_stop,
    text: "Stop",
    color: "red",
    status: "idle",
    fit_content: true,
  },
  action_model_arr: [],
});

function actions_to_action_model_arr(actions) {
  return actions.map((action) => {
    let model: any = {
      status: "idle",
      name: action[0],
      action,
    };
    if (model.name === "append_actions_for_each_element") {
      model.action_model_arr = actions_to_action_model_arr(action[1]);
    }
    return model;
  });
}

let state = {
  delay: 1,
};

onMounted(async () => {
  let storage: any = await props.ctrl.proxy_extension_iframe.storage_get([props.name]);
  storage = util.decode_json(storage[props.name]);
  console.log("mounted_storage", storage);
  if (storage) {
    model.action_model_arr = storage.action_model_arr;
    if (storage.status === "active" && storage.current_action_index) {
      model.current_action_index = storage.current_action_index;
      methods.continue();
    }
  } else {
    model.action_model_arr = actions_to_action_model_arr(props.tool.actions);
  }
});

function save_storage() {
  props.ctrl.proxy_extension_iframe.storage_set({
    [props.name]: util.encode_json({
      //
      status: model.status,
      current_action_index: model.current_action_index,
      actions: props.tool.actions,
      action_model_arr: model.action_model_arr,
    }),
  });
}

let methods = {
  async run_actions() {
    //
    model.status = "active";
    save_storage();
    await util.wait(100);
    //
    for (let i = model.current_action_index; i < model.action_model_arr.length; i++) {
      if (model.status !== "active") {
        return;
      }
      model.current_action_index = i;
      save_storage();
      await util.wait(100);
      let action_model = model.action_model_arr[i];
      let action = action_model.action;
      if (action[0] === "repeat") {
        action_model.status = "success";
        let new_actions = util.clone(props.tool.actions);
        model.action_model_arr = model.action_model_arr.concat(actions_to_action_model_arr(new_actions));
        save_storage();
      } else if (action[0] === "repeat_steps") {
        let new_actions = util.clone(props.tool.actions).slice(action[1] - 1, action[2] - 1 + 1);
        action_model.status = "success";
        model.action_model_arr = model.action_model_arr.concat(actions_to_action_model_arr(new_actions));
        save_storage();
      } else {
        action_model.status = "progress";
        if (action[0] === "make_sure_url_is") {
          model.action_model_arr[model.current_action_index].status = "success";
          model.current_action_index += 1;
          action_model.status = "success";
          save_storage();
          await util.wait(100);
          await props.ctrl.proxy_content.action_run(util.clone(action));
          return;
        }
        let result: any = await props.ctrl.proxy_content.action_run(util.clone(action));
        await util.wait(state.delay);
        action_model.status = "success";
        if (action[0] === "append_actions_for_each_element") {
          console.log("number", result);
          for (let j = 0; j < result; j++) {
            let new_actions = util.clone(action[1]);
            for (let action of new_actions) {
              if (action[0] === "take_element_from_state_by_index") {
                action[1] = j;
              }
            }
            model.action_model_arr = model.action_model_arr.concat(actions_to_action_model_arr(new_actions));
          }
        }
        save_storage();
      }
    }
    //
  },
  async start() {
    model.current_action_index = 0;
    model.action_model_arr = actions_to_action_model_arr(props.tool.actions);
    save_storage();
    methods.run_actions();
  },
  async continue() {
    methods.run_actions();
  },
  start_click() {
    state.delay = 1000;
    methods.start();
  },
  stop_click() {
    model.status = "not_active";
    model.action_model_arr = actions_to_action_model_arr(props.tool.actions);
    save_storage();
  },
};
</script>
<template>
  <div class="page active actions">
    <div class="button-container">
      <Button
        v-if="model.status === 'not_active'"
        v-bind:model="model.button_start"
        v-on:button_click="methods.start_click"
      ></Button>
      <Button
        v-if="model.status === 'active'"
        v-bind:model="model.button_stop"
        v-on:button_click="methods.stop_click"
      ></Button>
    </div>
    <Actions v-bind:action_model_arr="model.action_model_arr"></Actions>
  </div>
</template>
<style>
.button-container {
  display: flex;
  flex-direction: column;
}
.button-container .button {
  margin-bottom: 8px;
}
</style>
