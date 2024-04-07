<script>
import svg_chevron_up from "@mdi/svg/svg/chevron-up.svg?raw";
import svg_chevron_down from "@mdi/svg/svg/chevron-down.svg?raw";
import svg_checkbox_blank_outline from "@mdi/svg/svg/checkbox-blank-outline.svg?raw";
import svg_checkbox_marked_outline from "@mdi/svg/svg/checkbox-marked.svg?raw";
export default {
  components: {},
  props: ["title", "initial_options"],
  data() {
    return {
      //
      svg_checkbox_blank_outline,
      svg_checkbox_marked_outline,
      //
      value: "",
      options: this.initial_options.map((text) => {
        return {
          text,
          selected: false,
        };
      }),
    };
  },
  mounted() {},
  methods: {
    option_click(option) {
      option.selected = !option.selected;
      this.value = this.get_value();
      this.$emit("change", this.value);
    },
    get_value() {
      return this.options
        .filter((option) => {
          return option.selected;
        })
        .map((option) => {
          return option.text;
        });
      // .join("\n");
    },
  },
};
</script>

<template>
  <div class="chromane-checkboxes">
    <div
      class="chromane-checkbox"
      v-for="option in options"
      :key="option.text"
      v-on:click="option_click(option)"
    >
      <div
        class="svg"
        v-html="svg_checkbox_blank_outline"
        v-if="!option.selected"
      ></div>
      <div
        class="svg"
        v-html="svg_checkbox_marked_outline"
        v-if="option.selected"
      ></div>
      <span v-text="option.text"></span>
    </div>
  </div>
</template>

<style>
.form-control-textarea {
  height: 120;
}
.chromane-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  opacity: 0.8;
  height: 32px;
  width: fit-content;

  font-size: 14px;
  font-weight: 500;
}
.chromane-checkbox:hover {
  opacity: 1;
}
.chromane-checkbox .svg {
  margin-right: 8px;
}
.chromane-checkbox svg {
  display: flex;
  width: 24px;
  height: 24px;
}
</style>
