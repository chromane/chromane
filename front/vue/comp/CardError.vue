<script lang="ts">
import icon_close from "@mdi/svg/svg/close.svg?raw";

export default {
  props: {
    text: { type: String, required: true },
    is_close: { type: Boolean, default: true },
  },
  data() {
    return {
      icon_close,
    };
  },
  methods: {
    handle_close() {
      this.$emit("my_close", this.text);
    },
  },
  emits: ["my_close"],
};
</script>

<template>
  <div class="notif">
    <p>{{ text }}</p>
    <div
      @click="handle_close"
      class="notif__close"
      v-html="icon_close"
      v-if="is_close"
    ></div>
  </div>
</template>

<style>
.notif {
  width: 100%;
  display: flex;
  justify-content: space-between;
  column-gap: 10px;
  align-items: flex-start;
  padding: 10px 10px 10px 10px;
  border-radius: 4px;
  background: #fca5a5;
  border-left: 3px solid #912d2b;
  word-break: break-word;
}

.notif p {
  flex: 1 1 auto;
  margin: 0px;
  font-size: 15px;
  line-height: 1.4;
  letter-spacing: 0.2px;
  color: #9f3a38;
}

.notif__close {
  flex: 0 0 20px;
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.notif__close svg {
  width: 100%;
  height: 100%;
  fill: #912d2b;
}
.notif__close:hover svg {
  opacity: 0.8;
}
</style>
