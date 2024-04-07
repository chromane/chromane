<script setup lang="ts">
import Button from "./Button.vue";
const emit = defineEmits(["remove-item", "cancel-action"]);

function handle_click_remove() {
  emit("remove-item");
}

function handle_click_cancel() {
  emit("cancel-action");
}
</script>

<template>
  <div class="page-confirm remove-item-confirm">
    <div class="page-confirm__text">
      <h3 class="page-confirm__title">Are you sure?</h3>
      <p class="page-confirm__subtitle">By clicking "Delete" you will remove this template forever.</p>
    </div>
    <div class="page-confirm__action">
      <button
        class="page-confirm__button page-confirm__button--danger"
        @click="handle_click_remove"
      >
        Delete
      </button>
      <button
        @click="handle_click_cancel"
        class="page-confirm__button page-confirm__button--danger page-confirm__button--cancel"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<style></style>
