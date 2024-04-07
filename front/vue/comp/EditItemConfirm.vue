<script setup lang="ts">
import AddTemplateForm from "./AddTemplateForm.vue";
import store from "@chromane/ts/extensions/chromane/vue/ext_store";
import { onMounted, reactive, watch } from "vue";

const emits = defineEmits(["edit-item", "cancel-action"]);

const props = defineProps({
  item_id: {
    type: String,
    required: true,
  },
});

const data = reactive({
  form_state: {},
});

function handle_click_save(form_state) {
  emits("edit-item", form_state);
}
function handle_click_cancel(form_state) {
  emits("cancel-action");
}

onMounted(async () => {
  data.form_state = store.app_templates.find((item) => item.id === props.item_id);
});
</script>

<template>
  <AddTemplateForm
    @click-save="handle_click_save"
    @click-cancel="handle_click_cancel"
    :form_state="data.form_state"
  ></AddTemplateForm>
</template>

<style></style>
