<script>
export default {
  components: {},
  props: ["title", "initial_value"],
  data() {
    return {
      value: this.initial_value,
    };
  },
  mounted() {
    document.addEventListener("click", () => {
      this.active = false;
    });
    // console.log("option_data_arr", this.option_data_arr);
  },
  methods: {
    handle_input() {
      let new_value = this.value.replaceAll(/[^0-9]/g, "");

      //   while (new_value.length !== 10) {
      //     new_value = new_value + "x";
      //   }

      let part_1 = new_value.slice(0, 3);
      let part_2 = new_value.slice(3, 6);
      let part_3 = new_value.slice(6, 10);

      //   this.value = `{${part_1})${part_2}-${part_3}`;

      if (new_value.length === 0) {
        this.value = "";
      } else if (new_value.length <= 3) {
        this.value = `(${part_1}`;
      } else if (new_value.length <= 6) {
        this.value = `(${part_1})${part_2}`;
      } else {
        this.value = `(${part_1})${part_2}-${part_3}`;
      }

      this.$emit("change", this.value);
    },
  },
};
</script>

<template>
  <input
    type="text"
    class="form-control"
    autocomplete="chrome-off"
    v-bind:placeholder="title"
    v-model="value"
    v-on:input="handle_input"
  />
</template>

<style></style>
