<script>
import manifest from "~/src/manifest.json";
import util from "chromane/js/util_instance";

export default {
  components: {},
  props: ["items", "footer_text"],
  data() {
    return {
      status,
      manifest,
    };
  },
  methods: {
    open: async function () {
      this.$refs.drawer_overlay.style.display = "block";
      await util.wait(20);
      this.$refs.drawer_overlay.classList.add("opened");
    },

    close: async function () {
      this.$refs.drawer_overlay.classList.remove("opened");
      await util.wait(200);
      this.$refs.drawer_overlay.style.display = "none";
    },

    drawer_item_click: function (data) {
      this.$emit("drawer_item_click", data);
      this.close();
    },

    drawer_overlay_click: function () {
      this.close();
    },

    drawer_click: function (data) {
      data.event.stopPropagation();
    },
  },
};
</script>
<template>
  <div
    id="drawer_overlay"
    ref="drawer_overlay"
    v-on:click="drawer_overlay_click"
    v-bind:class="{ opened: status === 'opened' }"
  >
    <div id="drawer" v-on:click="drawer_click({ event: $event })">
      <div id="drawer_header" v-text="manifest.name"></div>
      <div class="drawer_item_container">
        <div
          class="drawer_item"
          :key="item.name"
          v-for="item in this.items"
          v-bind:class="{ visible: item.visible }"
          v-on:click="drawer_item_click(item)"
        >
          <img :src="item.icon" />
          <span v-text="item.title"></span>
        </div>
      </div>
      <div id="drawer_footer" v-if="footer_text" v-text="footer_text"></div>
    </div>
  </div>
</template>

<style>
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
  z-index: 90000;
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

.drawer_item_container {
  margin-top: 8px;
  flex-grow: 1;
}

.drawer_item {
  box-sizing: content-box;
  display: none;
  justify-content: flex-start;
  align-items: center;
  height: 20px;
  padding: 10px 0px 10px 24px;
  cursor: pointer;
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
}

.drawer_item img {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  opacity: 0.6;
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
