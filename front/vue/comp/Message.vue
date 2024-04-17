<script setup lang="ts">
import PermissionsButton from "./PermissionsButton.vue";
import Button from "./Button.vue";
const props = defineProps<{
  model: any;
  config?: any;
}>();
const emit = defineEmits<{
  (e: "button_click", data: any): void;
}>();
</script>

<template>
  <div
    class="chromane_message"
    v-bind:class="{
      positive: props.model.type === 'positive',
      negative: props.model.type === 'negative',
      info: props.model.type === 'info',
    }"
  >
    <div class="chromane_message-ill">
      <img
        class="svg"
        :src="props.model.ill"
      ></img>
    </div>
    <div class="chromane_message-details">
      <div
        class="chromane_message-headline"
        v-text="props.model.title"
      ></div>
      <div
        class="chromane_message-body"
        v-text="props.model.text"
        :style="{
          marginBottom: '15px',
        }"
      ></div>
      <div class="chromane_message-action">
        <Button
          v-if="props.model.button"
          :model="props.model.button"
          v-on:button_click="emit('button_click', $data)"
        ></Button>
        <PermissionsButton
          v-if="props.model.permissions_button"
          :model="props.model.permissions_button"
          :config="props.config"
        ></PermissionsButton>
      </div>
    </div>
  </div>
</template>

<style>
/* chromane-message */

.chromane_message {
  width: 100%;
  max-width: 600px;
  min-width: 360px;
  display: flex;
  flex-direction: row;

  border-radius: 4px;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.06);
}

.chromane_message {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;

  width: 100%;

  border-radius: 4px;
  padding: 16px 16px 16px 16px;
  background-color: rgba(0, 0, 0, 0.06);
}

.chromane_message-ill {
  margin-right: 24px;
}

.chromane_message-ill img {
  width: 128px;
  height: 128px;
}

.chromane_message-ill svg {
  width: 140px;
  height: 140px;
}
.chromane_message-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: 10px;
  flex-grow: 1;
}

.chromane_message-details .chromane_button-wrap {
  width: fit-content;
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
