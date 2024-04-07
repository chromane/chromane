<script>
import Button from "./Button.vue";
export default {
  components: { Button },
  props: ["model"],
  data() {
    return {};
  },
  methods: {
    handle_button_click: function (data) {
      this.$emit("button_click", data);
    },
  },
};
</script>

<template>
  <div
    class="chromane_message"
    v-bind:class="{
      active: model.active,
      positive: model.type === 'positive',
      negative: model.type === 'negative',
      info: model.type === 'info',
    }"
  >
    <div
      class="chromane_message-headline"
      v-text="model.headline"
    ></div>
    <div
      class="chromane_message-body"
      v-html="model.body"
    ></div>

    <div
      class="chromane_message-close_button"
      v-if="model.close_button"
    >
      <ChromaneIcon v-bind:model="{ icon_name: 'close-thick' }"></ChromaneIcon>
    </div>

    <Button
      v-on:button_click="handle_button_click"
      v-if="model.button"
      v-bind:model="model.button"
      style="margin-top: 12px"
    ></Button>

    <div
      class="chromane_message-buttons"
      v-if="model.buttons"
    >
      <Button
        v-on:button_click="handle_button_click"
        v-for="button in model.buttons"
        v-bind:model="button"
        v-bind:key="button.name"
      ></Button>
    </div>
  </div>
</template>

<style>
/* chromane-message */

.chromane-message {
  width: 100%;

  border: 1px solid red;
  border-radius: 4px;
  padding: 24px;
  background-color: rgba(255, 0, 0, 0.06);
}

.chromane-message-headline {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-size: 21px;
  color: rgba(0, 0, 0, 0.8);
}

.chromane-message-headline .button-icon {
  margin-right: 16px;

  background-color: red;
  border-radius: 4px;
}

.chromane-message-headline .button-icon svg path {
  fill: white;
}

.chromane-message-body {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.9);
  margin-top: 12px;

  word-break: break-word;
}

.chromane-message-buttons .button {
  width: fit-content;
  margin-top: 12px;
}

/* messages */

.message-red {
  width: 100%;

  padding: 12px;
  border-radius: 4px;
  font-size: 15px;

  background-color: #ffe8e6;
  color: #db2828;
  box-shadow: 0 0 0 1px #db2828 inset, 0 0 0 0 transparent;
}

.message-green {
  width: 100%;

  padding: 12px;
  border-radius: 4px;
  font-size: 15px;

  background-color: #e5f9e7;
  color: #1ebc30;
  box-shadow: 0 0 0 1px #1ebc30 inset, 0 0 0 0 transparent;
}

/**/

/**/

/* chromane_message */

.chromane_message {
  display: none;
  position: relative;

  width: 100%;

  border-radius: 4px;
  padding: 14px 21px;
  background-color: rgba(255, 0, 0, 0.06);
}

.chromane_message.active {
  display: block;
}

.chromane_message-headline {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-size: 21px;
  color: rgba(0, 0, 0, 0.8);

  font-size: 16px;
  font-weight: 700;
}

.chromane_message-headline .button-icon {
  margin-right: 16px;

  background-color: red;
  border-radius: 4px;
}

.chromane_message-headline .button-icon svg path {
  fill: white;
}

.chromane_message-body {
  margin-top: 6px;

  font-size: 14px;
  line-height: 20px;

  word-break: break-word;
}

.chromane_message-buttons .button {
  width: fit-content;
  margin-top: 12px;
}

.chromane_message-close_button {
  position: absolute;

  top: 8px;
  right: 8px;
  height: 20px;
  width: 20px;

  cursor: pointer;
}

/* buttons */

.chromane_message-buttons {
  display: flex;
}

.chromane_message-buttons .chromane_button-wrap {
  margin-right: 8px;
}

/**/

/* info */

.chromane_message.info {
  background-color: #f8ffff;
  color: #276f86;
  border: 1px solid #a9d5de;
}

.chromane_message.info .chromane_message-headline {
  color: #0e566c;
}

.chromane_message.info svg {
  fill: #679aab;
}

.chromane_message.info .chromane_message-close_button:hover svg {
  fill: #276f86;
}

/**/

/* positive */

.chromane_message.positive {
  background-color: #fcfff5;
  color: #2c662d;
  border: 1px solid #a3c293;
}

.chromane_message.positive .chromane_message-headline {
  color: #1a531b;
}

.chromane_message.positive svg {
  fill: #6b9469;
}

.chromane_message.positive .chromane_message-close_button:hover svg {
  fill: #2c662d;
}

/**/

/* negative */

.chromane_message.negative {
  background-color: #fff6f6;
  color: #9f3a38;
  border: 1px solid #e0b4b4;
}

.chromane_message.negative .chromane_message-headline {
  color: #912d2b;
}

.chromane_message.negative svg {
  fill: #bd7172;
}

.chromane_message.negative .chromane_message-close_button:hover svg {
  fill: #9f3a38;
}

/**/

/* messages */

.message-red {
  width: 100%;

  padding: 12px;
  border-radius: 4px;
  font-size: 15px;

  background-color: #ffe8e6;
  color: #db2828;
  box-shadow: 0 0 0 1px #db2828 inset, 0 0 0 0 transparent;
}

.message-green {
  width: 100%;

  padding: 12px;
  border-radius: 4px;
  font-size: 15px;

  background-color: #e5f9e7;
  color: #1ebc30;
  box-shadow: 0 0 0 1px #1ebc30 inset, 0 0 0 0 transparent;
}

/**/

/**/
</style>
