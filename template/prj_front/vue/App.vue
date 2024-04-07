<script setup lang="ts">
import ctrl from "./ctrl";
import store from "./store";
import AppDefault from "chromane/front/vue/AppDefault.vue";
// import logo_wide from "@shared/slots/logo-wide.svg?raw";
import config from "@shared/config";
console.log("config", config);
import logo_wide from "@shared/slots/logo-wide.svg?raw";
console.log(111444);
</script>

<template>
  <AppDefault
    :ctrl="ctrl"
    :store="store"
    :logo_wide="logo_wide"
  ></AppDefault>
</template>

<style></style>
