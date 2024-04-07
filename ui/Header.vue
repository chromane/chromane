<script>
import menu_icon from "@mdi/svg/svg/menu.svg";
import close_icon from "@mdi/svg/svg/close.svg";
import manifest from "~/src/manifest.json";

export default {
  emits: ["menu_click", "close_click"],
  data() {
    return { menu_icon, close_icon, manifest };
  },
};
</script>

<template>
  <header class="header">
    <div class="icon" v-on:click="$emit('menu_click')">
      <img :src="menu_icon" />
    </div>
    <div class="space"></div>
    <div class="headline" v-text="manifest.name"></div>
    <div class="space"></div>
    <div class="icon" v-on:click="$emit('close_click')">
      <img :src="close_icon" />
    </div>
    <div class="dropshadow"></div>
  </header>
</template>

<style scoped>
header {
  user-select: none;
  position: relative;
  z-index: 80000;
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  height: 50px;
  padding: 0px 12px;

  color: rgb(0, 0, 0, 0.9);
  font-size: 16px;
  font-weight: 500;
}

.space {
  flex-grow: 1;
}
header .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
.icon img {
  height: 24px;
  width: 24px;
  opacity: 0.5;
  transition: all 0.2s ease;
}
.icon:hover img {
  height: 24px;
  width: 24px;
  opacity: 0.8;
}
.icon img {
  width: 24px;
  height: 24px;
}
.dropshadow {
  position: absolute;
  bottom: -6px;
  left: 0px;
  height: 6px;
  width: 100%;
  box-shadow: inset 0 5px 6px -3px rgba(0, 0, 0, 0.4);
}
</style>
