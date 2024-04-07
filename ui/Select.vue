<script>
export default {
  components: {},
  props: ["placeholder", "icon_name", "options"],
  data() {
    return {
      selected_value: "",
      value: "",

      active: false,
      disabled: false,
      selected_option: null,

      results_available_flag: true,
    };
  },
  mounted: function () {
    document.body.addEventListener("click", () => {
      this.unfocus();
    });
  },
  watch: {
    options: function () {
      this.select(this.selected_value);
    },
  },
  methods: {
    // methods
    select(value) {
      this.selected_value = value;
      console.log("select11", JSON.parse(JSON.stringify(this.options)), value);
      this.selected_option = window.common.find(this.options, "value", value);
      if (this.selected_option) {
        this.value = this.selected_option.name;
      } else {
        this.value = "";
      }
    },

    disable: function () {
      this.disabled = true;
    },
    enable: function () {
      this.disabled = false;
    },

    filter_options: function () {
      var value = this.value.toLowerCase();
      var option_data = null;
      var results_available_flag = false;

      for (var i = 0; i < this.options.length; i++) {
        option_data = this.options[i];

        if (option_data.name.toLowerCase().indexOf(value) === -1) {
          option_data.visible = false;
        } else {
          option_data.visible = true;
          results_available_flag = true;
        }
      }

      this.results_available_flag = results_available_flag;
    },

    unfocus: async function () {
      this.active = false;
      if (this.selected_option) {
        this.value = this.selected_option.name;
      }
    },

    // event handlers

    chromane_select_disabled_cover_click: (data) => {
      data.event.stopPropagation();
    },

    chromane_select_input: function () {
      this.filter_options();
    },

    chromane_select_click: function (data) {
      this.value = "";
      this.active = true;
      this.filter_options();
      data.event.stopPropagation();
    },

    chromane_select_option_click: function (option, event) {
      console.log("click", option, this.selected_option);
      this.selected_option = option;
      console.log("click", option, this.selected_option);
      this.value = option.name;
      this.active = false;
      event.stopPropagation();
      this.$emit("change", this);
    },
  },
};
</script>

<template>
  <div
    class="chromane-select"
    v-on:click="chromane_select_click({ event: $event })"
    v-bind:class="{ active: active }"
  >
    <div class="chromane-select-main">
      <div
        class="chromane-select-icon"
        v-if="icon_name === 'microphone'"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"></path>
        </svg>
      </div>

      <div
        class="chromane-select-icon"
        v-if="icon_name === 'template'"
      >
        <svg viewBox="0 0 24 24">
          <path d="M16,15H9V13H16M19,11H9V9H19M19,7H9V5H19M21,1H7C5.89,1 5,1.89 5,3V17C5,18.11 5.9,19 7,19H21C22.11,19 23,18.11 23,17V3C23,1.89 22.1,1 21,1M3,5V21H19V23H3A2,2 0 0,1 1,21V5H3Z"></path>
        </svg>
      </div>

      <input
        type="text"
        v-bind:placeholder="placeholder"
        autocomplete="none"
        v-on:input="chromane_select_input"
        v-model="value"
      />

      <svg
        viewBox="0 0 24 24"
        class="chromane-select-chevron"
      >
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    </div>

    <div class="chromane-select-options">
      <div
        class="chromane-select-option chromane-select-option-no-results"
        v-bind:class="{ visible: results_available_flag === false }"
      >
        No results found.
      </div>

      <div
        class="chromane-select-option"
        v-for="option in options"
        v-text="option.name"
        v-on:click="chromane_select_option_click(option, $event)"
        v-bind:key="option.name"
        v-bind:class="{ visible: option.visible }"
      ></div>
    </div>

    <div
      class="chromane-select-disabled-cover"
      v-if="disabled"
      v-on:click="chromane_select_disabled_cover_click({ event: $event })"
    ></div>
  </div>
</template>

<style>
/* chromane-select */

.chromane-select {
  position: relative;

  height: 36px;
  width: 100%;

  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: transparent;
}

.chromane-select.active {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.chromane-select-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  height: 34px;
}

.chromane-select input {
  flex-grow: 1;

  height: 100%;
  width: 10px;
  padding: 8px;
  background: transparent;

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
  top: 6px;

  width: 24px;
  height: 24px;

  fill: rgba(0, 0, 0, 0.3);
}

.chromane-select-options {
  position: relative;
  display: none;
  overflow: auto;
  z-index: 10000;

  left: -1px;
  max-height: 200px;
  width: calc(100% + 2px);

  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);

  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.chromane-select.active .chromane-select-options {
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

.chromane-select-option.visible {
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

/**/
</style>
