<script>
export default {
  props: ["text", "value"],
  data() {
    return {};
  },
  methods: {
    handle_click(data, exec) {
      this.$emit("toggle");
    },
  },
};
</script>

<template>
  <div
    class="chromane-toggle"
    v-bind:class="{ active: value }"
    v-on:click="this.handle_click"
  >
    <div class="chromane-toggle-text" v-text="text"></div>

    <div style="flex-grow: 1"></div>

    <div class="chromane-toggle-bar">
      <div class="chromane-toggle-knob"></div>
    </div>
  </div>
</template>

<style scoped>
/* chromane-toggle */

.chromane-toggle {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  position: relative;

  width: 100%;
  height: 24px;

  user-select: none;
  cursor: pointer;
}

.chromane-toggle-text {
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 24px;
  letter-spacing: 0.15px;
  color: #000000;
}

.chromane-toggle-bar {
  position: relative;

  height: 18px;
  width: 34px;

  border-radius: 80px;
  background-color: #757575;

  transition: all 80ms linear;
}

.chromane-toggle-knob {
  position: absolute;

  top: 4px;
  left: 4px;
  height: 10px;
  width: 10px;

  border-radius: 50%;
  background-color: white;

  transition: all 80ms linear;
}

.chromane-toggle.active .chromane-toggle-bar {
  background-color: #4487ef;
}

.chromane-toggle.active .chromane-toggle-knob {
  left: calc(34px - 10px - 4px);
}

/**/
</style>
