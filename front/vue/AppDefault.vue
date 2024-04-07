<script setup lang="ts">
const props = defineProps<{
  ctrl: any;
  store: any;
  logo_wide: any;
}>();

import Header from "./comp/Header.vue";
import Drawer from "./comp/Drawer.vue";
import PageContainer from "./pages/PageContainer.vue";
import { ref, watch } from "vue";

let ref_drawer = ref(null);

let methods = {
  header_menu_button_click: () => {
    ref_drawer.value.open();
  },
  header_back_button_click: () => {
    props.ctrl.arrow_button_click();
  },
  header_close_button_click: () => {
    props.ctrl.close_button_click();
  },
};
</script>

<template>
  <div id="app">
    <Header
      :nav_icon="props.store.nav_icon"
      v-on:menu_button_click="methods.header_menu_button_click"
      v-on:back_button_click="methods.header_back_button_click"
      v-on:close_button_click="methods.header_close_button_click"
      :store="props.store"
    ></Header>
    <PageContainer
      :ctrl="props.ctrl"
      :store="props.store"
    ></PageContainer>
    <Drawer
      ref="ref_drawer"
      :logo_wide="props.logo_wide"
      :ctrl="props.ctrl"
      :store="props.store"
      v-bind:drawer_items="props.store.drawer_items"
      v-on:drawer_item_click="
        () => {
          props.ctrl.drawer_item_click();
        }
      "
    ></Drawer>
  </div>
</template>
<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700");
@import url("@chromane/shared/css/chromane.scss");
</style>
