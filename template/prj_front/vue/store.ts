import { reactive } from "vue";

export default reactive<any>({
  // default
  // todo: move this to a different store
  auth: {},
  ui_number_of_blocking_operations: "",
  active_page_comp_name: "",
  drawer_items: [],
  nav_icon: "menu",
  ui_title: "Title",
  // read_time_estimator
  form_state: {
    original_message: "",
    new_message: "",
  },
});
