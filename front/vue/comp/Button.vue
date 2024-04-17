<script setup lang="ts">
const props = defineProps<{
  model: any;
}>();
const emit = defineEmits<{
  (e: "button_click", data: any): void;
}>();
function button_click() {
  emit("button_click", props.model);
}
</script>

<template>
  <div
    class="button"
    v-bind:class="{
      primary: props.model.color === 'primary' || props.model.color === undefined,
      green_outline: props.model.color === 'green_outline',
      'button-fit-content': props.model.fit_content === true,
      hidden: props.model.status === 'hidden',
      green: props.model.color === 'green',
      gray: props.model.color === 'gray',
      red: props.model.color === 'red',
      blue: props.model.color === 'blue',
      white: props.model.color === 'white',
    }"
  >
    <div
      class="button-content"
      v-on:click="button_click"
      v-bind:class="{
        primary: props.model.color === 'primary' || props.model.color === undefined,
        green_outline: props.model.color === 'green_outline',
        green: props.model.color === 'green',
        gray: props.model.color === 'gray',
        red: props.model.color === 'red',
        blue: props.model.color === 'blue',
        white: props.model.color === 'white',
        do_not_invert_icon: props.model.invert_icon === false,
        'button-fit-content': props.model.fit_content === true,
        progress: props.model.status === 'progress',
      }"
    >
      <div
        class="button-bg"
        v-if="props.model.color === 'primary' || props.model.color === undefined"
      ></div>
      <div class="button-fg">
        <div
          class="button-icon"
          v-if="props.model.icon"
        >
          <div
            class="chromane-button-spinner"
            v-if="props.model.status === 'progress'"
          ></div>
          <div
            class="svg-wrap"
            v-if="props.model.status !== 'progress'"
            v-html="props.model.icon"
          ></div>
        </div>
        <div
          class="button-text"
          v-text="props.model.text"
        ></div>
      </div>
    </div>
    <div
      class="button-cover"
      v-if="props.model.status === 'progress'"
    ></div>
    <div
      class="button-cover"
      v-if="props.model.disabled === true"
    ></div>
  </div>
</template>

<style lang="scss">
.button {
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  overflow: hidden;

  width: fit-content;
  min-width: 160px;
  height: 36px;

  border-radius: 4px;

  color: white;
  font-size: 14px;
  font-weight: 500;

  user-select: none;

  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.24);
  transition: all 0.1s ease;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.green_outline {
    box-shadow: none;
    border: 1px solid green;
    color: rgba(0, 0, 0, 0.85);
    .button-fg {
      // border: 1px solid green;
      background-color: #55c90014;
      .button-icon {
        background-color: transparent;
        border-right: 1px solid green;
        svg {
          fill: green;
        }
      }
    }
  }
}

.button.button-fit-content {
  min-width: initial;
}

.button-content {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.button-cover {
  position: absolute;
  z-index: 100;

  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

.button-icon-only {
  width: 36px;
}

.button-bg {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 1;
  transition: filter 0.2s ease;
}
.button-content .button-bg {
  background: var(--gradient-primary);
  filter: brightness(1);
}
.button-content:hover .button-bg {
  filter: brightness(0.9);
}
.button-content:active .button-bg {
  filter: brightness(0.8);
}
.button-fg {
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 2;
  /*  */
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 36px;

  background-color: rgba(0, 0, 0, 0.12);
  .svg-wrap {
    svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
  }
}

.button-text {
  padding: 0px 24px;
  text-align: center;
}
.button-icon .do_not_invert_icon .button-icon img {
  filter: invert(0);
}

.button.red {
  background-color: #db2828;
}
.button.red:hover {
  background-color: #d01919;
}
.button.red:active {
  background-color: #b21e1e;
}

.button.green {
  background-color: #21ba45;
}
.button.green:hover {
  background-color: #16ab39;
}
.button.green:active {
  background-color: #198f35;
}

.button.progress {
  cursor: default;
}
.button.progress:hover {
  background-color: #21ba45;
}
.button.progress:active {
  background-color: #21ba45;
}

.button.blue {
  background: var(--color-primary);
}
.button.blue:hover {
  background-color: rgb(26, 145, 218);
}
.button.blue:active {
  background-color: #1a69a4;
}

.button.gray {
  background-color: hsl(0deg 0% 47%);
}
.button.gray:hover {
  background-color: hsl(0deg 0% 42%);
}
.button.gray:active {
  background-color: hsl(0deg 0% 37%);
}

.button.white {
  background-color: rgb(240, 240, 240);
  color: rgba(0, 0, 0, 0.8) !important;
}
.button.white:hover {
  background-color: rgb(220, 220, 220);
}
.button.white:active {
  background-color: rgb(200, 200, 200);
}

.button .button-text,
.button > span {
  flex-grow: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  white-space: pre;
}

.button-complete {
  border: 1px solid green;
  background-color: white;
  color: green;
}

.button-complete .button-icon {
  background-color: white;
}

.button-complete .button-icon svg path {
  fill: green;
}

.button .button-text,
.button > span {
  flex-grow: 1;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;

  white-space: pre;
}

/* button-spinner */

.chromane-button-spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 18px;
  height: 18px;
  animation: chromane-button-spinner 0.75s linear infinite;
}

@keyframes chromane-button-spinner {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

/**/

/**/
</style>
