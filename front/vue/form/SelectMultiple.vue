<script lang="ts" setup>
import icon_close_thick from "@mdi/svg/svg/close-thick.svg?raw";

import { reactive, onMounted, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: [],
  },
  initial_value: {
    type: [Object, String],
  },
});

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

let m: any = {
  icon_close_thick,
  text_input_value: "",
  placeholder: "Select tag",

  active: false,
  results_available_flag: true,
  tag_already_exists_flag: false,
  results_available_number: 0,
  selected_option_data: null,
  model: {},

  option_data_arr: [],
  selected_option_data_arr: [],
};
const data = reactive(m);

watch(
  () => props.options,
  () => {
    data.text_input_value = "";
    data.option_data_arr = props.options.map((option: any) => {
      return {
        value: option.value,
        title: option.title,
        status: "idle",
      };
    });
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  document.addEventListener("click", () => {
    data.active = false;
    data.text_input_value = "";
  });
  // if (props.initial_value) {
  //   select(props.initial_value);
  // }
});

// watch(
//   () => props.initial_value,
//   (value) => {
//     if (props.initial_value) {
//       select(props.initial_value);
//     }
//   }
// );

const select_tag = async function ({ tag, $event }) {
  $event.stopPropagation();
  data.active = false;

  data.text_input_value = "";
  data.selected_option_data = tag;
  data.selected_option_data_arr.push(tag);

  emit(
    "change",
    data.selected_option_data_arr.map((item) => item.value)
  );
};

// internal
// const select = function (value) {
//   try {
//     data.selected_option_data = data.option_data_arr.find((item) => item.value === value);
//     data.selected_option_data_arr.push(data.selected_option_data);
//     console.log("data.selected_option_data_arr", data.selected_option_data_arr);
//     data.value = data.selected_option_data.value;
//   } catch (error) {
//     console.log("error", error);
//   }
// };

const filter_option_data_arr = function () {
  var value = data.text_input_value.toLowerCase();
  var option_data: any = null;
  var results_available_flag = false;
  var tag_already_exists_flag = false;
  var results_available_number = 0;

  for (var i = 0; i < data.option_data_arr.length; i++) {
    option_data = data.option_data_arr[i];

    if (option_data.title.toLowerCase() === value) {
      tag_already_exists_flag = true;
    }

    if (option_data.title.toLowerCase().indexOf(value) === -1) {
      option_data.visible = false;
    } else {
      option_data.visible = true;
      results_available_flag = true;
      results_available_number += 1;
    }
  }

  data.tag_already_exists_flag = tag_already_exists_flag;
  data.results_available_number = results_available_number;
  data.results_available_flag = results_available_flag;
};

const chromane_select_input = function () {
  filter_option_data_arr();
};

const chromane_select_click = function (event) {
  data.text_select_value = "";
  data.active = true;
  filter_option_data_arr();
  event.stopPropagation();
  // emit("change", data.value);
};

function unselect_option(option, event) {
  event.stopPropagation();
  let index = data.selected_option_data_arr.indexOf(option);
  data.selected_option_data_arr.splice(index, 1);
  //
  emit(
    "change",
    data.selected_option_data_arr.map((item) => item.value)
  );
  //
}
</script>

<template>
  <div
    class="chromane-select"
    v-on:click="chromane_select_click"
    v-bind:class="{ active: data.active }"
  >
    <div class="chromane-select-main">
      <input
        type="text"
        v-bind:placeholder="props.title"
        v-model="data.text_input_value"
        @input="chromane_select_input"
      />
      <svg
        viewBox="0 0 24 24"
        class="chromane-select-chevron"
      >
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    </div>

    <div
      class="chromane_tag_container"
      v-if="data.selected_option_data_arr.length > 0"
    >
      <div
        class="chromane_tag"
        v-for="tag in data.selected_option_data_arr"
        v-bind:key="tag.value"
        v-bind:class="{ active: true }"
      >
        <span v-text="tag.title"></span>

        <div
          class="svg"
          v-html="icon_close_thick"
          v-if="tag.status === 'idle'"
          v-on:click="unselect_option(tag, $event)"
        ></div>

        <div
          class="chromane-spinner"
          v-if="tag.status === 'progress'"
        ></div>
        <div
          class="chromane_tag-overlay"
          v-if="tag.status === 'progress'"
        ></div>
      </div>
    </div>

    <div class="chromane-select-option_data_arr">
      <div
        class="chromane-select-option active chromane-select-option-no-results"
        v-if="!data.results_available_flag"
      >
        No results found.
      </div>
      <div
        class="chromane-select-option"
        v-for="tag in data.option_data_arr"
        :class="{ active: tag.visible }"
        :key="tag.value"
        v-text="tag.title"
        @click="select_tag({ tag, $event })"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
/* chromane-select */

.chromane-select {
  position: relative;
  width: 100%;
  border-radius: 4px;
  background: transparent;
  // border: 1px solid rgba(0, 0, 0, 0.12);
}

.chromane-select.active {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.chromane-select-main {
  display: flex;
}

.chromane-select input {
  flex-grow: 1;

  padding: 0px;
  background: transparent;

  padding-left: 12px;
  border: none;
  border-radius: inherit;

  outline: none;

  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  font-size: 13px;
}

.chromane-select-chevron {
  position: absolute;

  right: 6px;
  top: 5px;

  width: 24px;
  height: 24px;

  fill: rgba(0, 0, 0, 0.3);
}

.chromane-select-option_data_arr {
  position: absolute;
  display: none;
  overflow: auto;
  z-index: 10000;

  left: 0px;
  top: 36px;
  max-height: 400px;
  width: calc(100% + 0px);

  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);

  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.chromane-select.active .chromane-select-option_data_arr {
  display: block;
}

.chromane-select-option {
  display: none;
  align-items: center;

  width: 100%;
  padding: 8px 12px;

  background-color: white;

  color: rgba(0, 0, 0, 0.8);
  font-size: 13px;
  font-weight: 500;

  cursor: pointer;
}

.chromane-select-option.active {
  display: flex;
}

.chromane-daterange-option-title {
  margin-right: 8px;

  color: rgba(0, 0, 0, 0.8);
}

.chromane-daterange-option-range {
  color: #a0a0a0;
}

.chromane-select-option:hover {
  background-color: rgba(0, 0, 0, 0.12);
}

.chromane-select-option-no-results {
  color: rgba(0, 0, 0, 0.7);
  cursor: default;
  background-color: white;
}

.chromane-select-option-no-results:hover {
  background-color: white;
}

/* chromane-select-icon */

.chromane-select-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 100%;

  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.chromane-select-icon svg {
  width: 20px;
  height: 20px;

  fill: rgba(0, 0, 0, 0.5);
}

/**/

.chromane-select-disabled-cover {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.12);
}

.chromane_tag_container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;

  width: 100%;
  padding: 8px 0px;
}

.chromane_tag {
  position: relative;
  overflow: hidden;

  display: none;
  flex-direction: row;
  align-items: center;

  height: 30px;
  width: fit-content;
  padding: 4px 6px 4px 8px;
  margin-right: 6px;
  margin-bottom: 6px;

  border-radius: 3px;
  background-color: #c2c2c2;
}

.chromane_tag.active {
  display: flex;
}

.chromane_tag span {
  margin-right: 6px;
  flex-shrink: 0;
  max-width: 420px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.chromane_tag svg {
  height: 16px;
  width: 16px;

  cursor: pointer;
  fill: #434242;
}

.chromane_tag .chromane-spinner {
  width: 13px;
  height: 13px;
}

.chromane_tag-overlay {
  position: absolute;
  z-index: 90;

  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.3);
}

.chromane-spinner {
  border: 2px solid rgba(0, 0, 0, 0.9);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 18px;
  height: 18px;
  animation: chromane-spinner 0.75s linear infinite;
}

@keyframes chromane-spinner {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
