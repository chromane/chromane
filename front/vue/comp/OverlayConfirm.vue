<script setup lang="ts">
import util from "@chromane/shared/ts/util";
import icons from "@chromane/ts/vue_app/ts/icons";
import { ref, watch, nextTick, reactive } from "vue";
import Button from "@chromane/front/vue/comp/Button.vue";

let state = {
  resolver: null,
};

let model = reactive({
  active: false,
  //
  title: "",
  text: "",
  action_text: "",
});

const props = defineProps(["popup_props"]);
const emit = defineEmits(["popup-close"]);

const popup_inner = ref(null);
const popup_root = ref(null);

function handle_click_icon_close() {
  state.resolver(false);
  model.active = false;
}

function handle_click_overlay(event) {
  state.resolver(false);
  model.active = false;
}

function handle_click_card(event) {
  event.stopPropagation();
}

function open(title, text, action_text) {
  model.title = title;
  model.text = text;
  model.action_text = action_text;
  //
  model.active = true;
  return new Promise((resolve) => {
    state.resolver = resolve;
  });
}

function action_click() {
  state.resolver(true);
  model.active = false;
}

function cancel_click() {
  state.resolver(false);
  model.active = false;
}

defineExpose({ open });
</script>

<template>
  <div
    class="overlay-confirm"
    :class="{
      overlay: true,
      active: model.active,
    }"
    v-on:click="handle_click_overlay"
  >
    <div
      class="overlay-card"
      v-on:click="handle_click_card"
    >
      <div class="page-confirm__text">
        <div
          class="page-confirm__title"
          v-text="model.title"
        ></div>
        <p
          class="page-confirm__subtitle"
          v-text="model.text"
        ></p>
      </div>
      <div class="page-confirm__action">
        <Button
          :model="{
            text: model.action_text,
            color: 'red',
            fit_content: true,
          }"
          v-on:button_click="action_click"
        ></Button>
        <Button
          :model="{
            text: 'Cancel',
            color: 'white',
            fit_content: true,
          }"
          v-on:button_click="cancel_click"
        ></Button>
      </div>
    </div>
  </div>
</template>

<style>
.overlay-confirm .overlay-card {
  padding: 24px;
}
.page-confirm {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.page-confirm__title {
  font-size: 22px;
  font-weight: 700;
  text-align: start;
  margin-bottom: 12px;
}

.page-confirm__action {
  align-self: flex-end;
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.page-confirm__action > * {
  margin-left: 10px;
}

.page-confirm__action > *:first-child {
  margin-left: 0;
}

.page-confirm__button {
  font-size: 14px;
  letter-spacing: inherit;
  font-family: inherit;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  color: #fafafa;
}

.page-confirm__button--danger {
  background-color: #f44336;
}

.page-confirm__button--cancel {
  background: none;
}

.page-confirm__button--cancel.page-confirm__button--danger {
  color: #f44336;
  border: 1px solid #f44336;
}

.title__main {
  margin-bottom: 10px;
  line-height: 140%;
  font-size: 24px;
  font-weight: 700;
}

.title__sub {
  font-size: 16px;
  line-height: 130%;
}
</style>
