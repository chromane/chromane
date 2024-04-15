<script setup lang="ts">
import util, { TypedFunction } from "@chromane/shared/ts/util";
import mdi_close from "@mdi/svg/svg/close.svg?raw";

import type FirebaseIframe from "@chromane/ts/vue_app/ts/FirebaseIframe";

import OverlayWrap from "@chromane/ts/vue_app/vue/comp/OverlayWrap.vue";
import Button from "@chromane/front/vue/comp/Button.vue";
import Form from "@chromane/front/vue/form/Form.vue";

import { VNodeRef, reactive, ref } from "vue";
import { BackendCodes } from "../../../types/types";

const props = defineProps<{
  ctrl: FirebaseIframe;
}>();

let state = {
  resolver: null as any,
};

let ref_overlay_wrap = ref(null) as any;

let model = reactive({
  active: false,
  //
  form_state: {} as any,
  form_fields: [
    {
      name: "secret_code",
      type: "text",
      title: "Secret code",
    },
  ],
});

const overlay_inner = ref<VNodeRef | null>(null);
const overlay_root = ref<VNodeRef | null>(null);

function handle_click_icon_close() {
  if (state.resolver) {
    state.resolver(null);
  }
  model.active = false;
}

function handle_click_overlay(event: object) {
  console.log(event);
  if (state.resolver) {
    state.resolver(null);
  }
  model.active = false;
}

function handle_click_card(event) {
  event.stopPropagation();
}

function open(title) {
  ref_overlay_wrap.value.open("Enter code");
}

function close() {
  model.active = false;
}

let methods = {
  trigger_enter_code() {
    ref_overlay_wrap.value.open("Enter code");
  },
  async handle_click_enter() {
    props.ctrl.blocking_inc();
    let r = await props.ctrl.firebase_manager.backend_proxy.modules.chromane.verify_team_code("_token_", model.form_state.secret_code);
    if (r.code === BackendCodes.SUCCESS) {
      await props.ctrl.firebase_manager.refresh_token();
      await props.ctrl.load_user_team();
      props.ctrl.goto("team_access_granted");
      props.ctrl.blocking_dec();
    } else {
      console.log(model.form_state);
      ref_overlay_wrap.value.close();
      props.ctrl.blocking_dec();
    }
  },
  handle_click_cancel() {
    ref_overlay_wrap.value.close();
  },
};

defineExpose({ open, close });
</script>

<template>
  <OverlayWrap ref="ref_overlay_wrap">
    <template v-slot:body>
      <Form
        :form_state="model.form_state"
        :form_fields="model.form_fields"
      ></Form>
    </template>
    <template v-slot:buttons>
      <Button
        v-on:button_click="methods.handle_click_enter"
        :model="{ text: 'Enter' }"
      ></Button>
      <Button
        v-on:button_click="methods.handle_click_cancel"
        :model="{ text: 'Cancel', color: 'white' }"
      ></Button
    ></template>
  </OverlayWrap>
</template>

<style lang="scss">
.overlay {
  position: fixed;
  padding: 130px 20px 20px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 100000000;

  overflow: auto;

  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translate(0, -10px);

  display: flex;
  align-items: flex-start;
  justify-content: center;

  transition-duration: 250ms;
}

.overlay.danger .overlay-header {
  background-color: #f44336;
  color: #fafafa;
}

.overlay.danger .overlay-header__close svg {
  fill: #fafafa;
}

.overlay__content {
  padding: 24px;
  flex: 1 0 auto;
}

.overlay {
  display: none;
}

.overlay.active {
  display: flex;
}

.overlay.active {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translate(0, 0);
}

.overlay-card {
  background-color: #fafafa;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  width: 80%;
  max-width: 600px;
  cursor: auto;
  display: flex;
  flex-direction: column;
  .buttons {
    width: 160px;
    margin-right: 8px;
    margin-top: 24px;
    display: flex;
    .button {
      margin-right: 8px;
    }
  }
}

.overlay-header {
  padding: 24px;
  border-bottom: 1px solid rgba(1, 1, 1, 0.1);
  position: relative;
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.overlay-header__close {
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  right: 20px;
  width: 25px;
  height: 25px;

  cursor: pointer;
}

.overlay-header__close svg {
  display: block;
  width: 100%;
  height: 100%;
}

.overlay-header__title {
  font-size: 17px;
  font-weight: 500;
  text-align: start;
}
</style>
