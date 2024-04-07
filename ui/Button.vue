<script>
export default {
  components: {},
  props: ["model"],
  data() {
    return {
      status: "idle",
    };
  },
  methods: {
    button_click: function () {
      this.$emit("button_click", this.model);
    },
  },
};
</script>

<template>
  <div
    class="chromane_button-wrap"
    v-bind:class="{
      'button-fit-content': model.fit_content === true,
      hidden: status === 'hidden',
    }"
  >
    <div
      class="chromane_button button"
      v-on:click="button_click(model)"
      v-bind:class="{
        green: model.color === 'green',
        gray: model.color === 'gray',
        red: model.color === 'red',
        blue: model.color === 'blue',

        'button-fit-content': model.fit_content === true,

        progress: status === 'progress',
      }"
    >
      <div
        class="button-icon"
        v-if="model.icon"
      >
        <div
          class="chromane-button-spinner"
          v-if="status === 'progress'"
        ></div>
        <img
          v-if="status === 'idle'"
          v-bind:src="model.icon"
        />
      </div>
      <span v-text="model.text"></span>
    </div>

    <div
      class="button-cover"
      v-if="status === 'progress'"
    ></div>
  </div>
</template>

<style>
/* general */

.chromane_button-wrap {
  position: relative;

  width: 100%;
  height: fit-content;
}

.chromane_button-wrap.hidden {
  display: none;
}

.chromane_button-wrap.button-fit-content {
  width: fit-content;
}

.chromane_button-wrap.fit-content {
  width: fit-content;
}

.button {
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  overflow: hidden;

  width: 100%;
  height: 36px;

  border-radius: 4px;

  color: white;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
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

.button-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 36px;

  background-color: rgba(0, 0, 0, 0.12);
}

.button-icon img {
  width: 24px;
  height: 24px;

  filter: invert(1);
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
  background-color: rgb(29, 161, 242);
}
.button.blue:hover {
  background-color: rgb(26, 145, 218);
}
.button.blue:active {
  background-color: #1a69a4;
}

.button.blue {
  filter: brightness(1);
  background: linear-gradient(9deg, rgb(26 128 205) 0%, rgb(6 216 232) 100%);
}
.button.blue:hover {
  filter: brightness(0.9);
}
.button.blue:active {
  filter: brightness(0.8);
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
