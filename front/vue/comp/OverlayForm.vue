<script setup lang="ts">
import util, { TypedFunction } from "@chromane/shared/ts/util";
import mdi_close from "@mdi/svg/svg/close.svg?raw";
import { VNodeRef, reactive, ref } from "vue";
import AddItemForm from "./AddItemForm.vue";

let state = {
  resolver: null as TypedFunction<[null | object], void> | null,
};

let model = reactive({
  active: false,
  //
  title: "",
  form_state: {},
  form_fields: [],
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
  console.log(event, "EVENT");
  if (state.resolver) {
    state.resolver(null);
  }
  model.active = false;
}

function handle_click_card(event) {
  event.stopPropagation();
}

function open(title, form_state, form_fields) {
  model.title = title;
  model.form_state = util.clone(form_state);
  model.form_fields = form_fields;

  model.active = true;
  return new Promise((resolve) => {
    state.resolver = resolve;
  });
}

function handle_click_save(event: object) {
  console.log(event);
  if (state.resolver) {
    state.resolver(event);
  }
  model.active = false;
}
function handle_click_cancel(event: object) {
  console.log(event);
  if (state.resolver) {
    state.resolver(null);
  }
  model.active = false;
}

defineExpose({ open });
</script>

<template>
  <div
    ref="overlay_root"
    :class="{
      overlay: true,
      active: model.active,
    }"
    v-on:click="handle_click_overlay"
  >
    <div
      class="overlay__inner overlay-card"
      ref="overlay_inner"
      v-on:click="handle_click_card"
    >
      <div class="overlay__header overlay-header">
        <h4
          class="overlay-header__title"
          v-text="model.title"
        ></h4>
        <div
          class="overlay-header__close"
          v-html="mdi_close"
          @click="handle_click_icon_close"
        ></div>
      </div>
      <div class="overlay__content overlay-content">
        <AddItemForm
          v-if="model.active"
          @click-save="handle_click_save"
          @click-cancel="handle_click_cancel"
          :form_state="model.form_state"
          :form_fields="model.form_fields"
        ></AddItemForm>
      </div>
    </div>
  </div>
</template>

<style>
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
