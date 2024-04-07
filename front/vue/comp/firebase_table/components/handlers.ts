import { allowed_filter_columns } from "./Filter.vue";

export const handlers = {
  handle_change_field_select(e: any, index: number) {
    console.log(e.target.value, "E T V");
    const value = e.target.value;

    const config = allowed_filter_columns.value.find((item) => item.name === value);

    //     model.rules[index].config =
  },
};
