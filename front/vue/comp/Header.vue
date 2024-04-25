<script setup lang="ts">
const props = defineProps<{
  nav_icon: string;
  store: any;
}>();

const emit = defineEmits<{
  (e: "menu_button_click"): void;
  (e: "back_button_click"): void;
  (e: "close_button_click"): void;
}>();

function menu_button_click() {
  emit("menu_button_click");
}
function back_button_click() {
  emit("back_button_click");
}
function close_button_click() {
  emit("close_button_click");
}
</script>

<template>
  <div id="header">
    <div
      class="icon menu"
      style="margin-left: 17px"
      v-on:click="menu_button_click"
      v-if="props.nav_icon === 'menu'"
    >
      <svg viewBox="0 0 24 24">
        <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
      </svg>
    </div>
    <div
      class="icon menu"
      style="margin-left: 17px"
      v-on:click="back_button_click"
      v-if="props.nav_icon === 'arrow'"
    >
      <svg viewBox="0 0 24 24">
        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
      </svg>
    </div>
    <div style="flex-grow: 1"></div>
    <span v-text="props.store.ui_title"></span>
    <div style="flex-grow: 1"></div>

    <div
      class="icon close"
      style="margin-right: 15px; margin-left: 2px"
      v-on:click="close_button_click"
    >
      <svg viewBox="0 0 24 24">
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </svg>
    </div>
  </div>
</template>

<style>
#header {
  user-select: none;
  position: relative;
  z-index: 9999;

  display: flex;
  justify-content: center;
  align-items: center;

  height: 55px;

  /* background-color: #1c1c1c; */
  background: var(--gradient-primary);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  /*border-bottom: 1px solid rgba( 0, 0, 0, 0.12 );*/

  color: white;
  font-size: 16px;
  font-weight: 500;
}

#header .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

#header .icon svg {
  height: 24px;
  width: 24px;
  fill: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
}

#header .icon:hover svg {
  height: 24px;
  width: 24px;
  fill: rgba(255, 255, 255, 0.8);
}

#dropshadow {
  position: absolute;
  bottom: -6px;
  left: 0px;
  height: 6px;
  width: 100%;
  box-shadow: inset 0 5px 6px -3px rgba(0, 0, 0, 0.4);
}

#header img {
  height: 32px;
  width: 32px;

  margin: 0px 12px;
}

.page_headline {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 24px;
  text-align: center;
}
</style>
