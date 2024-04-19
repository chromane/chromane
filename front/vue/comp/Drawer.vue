<script setup lang="ts">
import util from "@chromane/shared/ts/util";

import { reactive } from "vue";

const props = defineProps<{
  drawer_items: any;
  logo_wide: any;
  top_icon?: string;
  ctrl: any;
  store: any;
}>();

let model = reactive({
  status: "closed",
  footer_text: "",
});

// methods
async function open() {
  let drawer_overlay = document.querySelector("#drawer_overlay") as HTMLElement;
  drawer_overlay.style.display = "block";
  await util.wait(20);
  drawer_overlay.classList.add("opened");
}
async function close() {
  let drawer_overlay = document.querySelector("#drawer_overlay") as HTMLElement;
  drawer_overlay.classList.remove("opened");
  await util.wait(200);
  drawer_overlay.style.display = "none";
  model.status = "closed";
}
function drawer_item_click(data) {
  props.ctrl.drawer_item_click(data);
  close();
}
function team_drawer_item_click(team_config, data) {
  props.ctrl.team_drawer_item_click(team_config, data);
  close();
}
function drawer_overlay_click() {
  close();
}
function drawer_click(data) {
  data.event.stopPropagation();
}

defineExpose({
  open,
});
</script>
<template>
  <div
    id="drawer_overlay"
    ref="drawer_overlay"
    v-on:click="drawer_overlay_click"
    v-bind:class="{ opened: model.status === 'opened' }"
  >
    <div
      id="drawer"
      v-on:click="drawer_click({ event: $event })"
    >
      <div id="drawer_header">
        <div
          class="logo-wide"
          v-html="logo_wide"
        ></div>
      </div>
      <div class="drawer_item_container">
        <div
          class="drawer_item"
          :class="{
            hidden: item.hidden,
          }"
          :key="item.name"
          v-for="item in props.drawer_items"
          v-on:click="drawer_item_click(item)"
        >
          <div
            class="svg"
            v-html="item.icon"
          ></div>
          <span v-text="item.title"></span>
        </div>
        <div
          class="section-headline"
          v-if="props.store.team_config && props.store.team_config.drawer_items"
          v-text="props.store.team_config.title"
        ></div>
        <div v-if="props.store.team_config && props.store.team_config.drawer_items">
          <div
            class="drawer_item"
            :key="item.name"
            v-for="item in props.store.team_config.drawer_items"
            v-on:click="team_drawer_item_click(props.store.team_config, item)"
          >
            <div
              class="svg"
              v-html="item.icon"
            ></div>
            <span v-text="item.title"></span>
          </div>
        </div>
      </div>
      <div
        id="drawer_footer"
        v-if="model.footer_text"
        v-text="model.footer_text"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
/* tools_css */

#drawer {
  position: absolute;
  top: 0px;
  left: -257px;
  width: 257px;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.2s ease;
  .section-headline {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.75);
    margin: 8px 0px 0px 0px;
    padding: 16px 12px 8px 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
}

#drawer_header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  height: 56px;
  padding-left: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  font-size: 16px;
}

.logo-wide svg {
  display: block;
  height: 20px;
}

.drawer_item_container {
  padding-top: 8px;
  padding-bottom: 16px;
  height: 10px;
  flex-grow: 1;
  overflow: auto;
}

.drawer_item {
  box-sizing: content-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 20px;
  padding: 10px 0px 10px 24px;
  cursor: pointer;
  user-select: none;
}

.drawer_item.hidden {
  display: none;
}

img.drawer_item_icon {
  width: 20px;
  height: 20px;
  margin-right: 24px;
}

.drawer_item svg {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.drawer_item path {
  fill: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item span {
  font-size: 13px;
  font-weight: 600;
  color: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item:hover path {
  fill: rgb(0, 0, 0);
}

.drawer_item:hover span {
  color: rgb(0, 0, 0);
}

/*  */

#drawer_footer {
  background: #eee;
  padding: 24px;
  font-size: 13px;
  color: #444;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
#drawer_overlay {
  position: absolute;
  display: none;
  z-index: 99999;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.2s ease;
}

#drawer {
  position: absolute;
  top: 0px;
  left: -275px;
  width: 275px;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

#drawer_overlay.opened {
  display: flex;
  background-color: rgba(0, 0, 0, 0.6);
}

#drawer_overlay.opened #drawer {
  left: 0px;
  display: flex;
  flex-direction: column;
}

#drawer_header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  height: 56px;
  padding-left: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 16px;
}

.drawer_item.visible {
  display: flex;
}

.drawer_item.hidden {
  display: none;
}

img.drawer_item_icon {
  width: 20px;
  height: 20px;
  margin-right: 24px;
}

.drawer_item svg {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  display: block;
}

.drawer_item path {
  fill: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item span {
  font-size: 13px;
  font-weight: 600;
  color: rgb(90, 90, 90);
  transition: all 0.2s ease;
}

.drawer_item:hover path {
  fill: rgb(0, 0, 0);
}

.drawer_item:hover span {
  color: rgb(0, 0, 0);
}
</style>
