<script setup lang="ts">
import util from "@chromane/shared/ts/util";
import { watch, reactive, onUnmounted } from "vue";

const model = reactive({
  data_id: util.get_id(),
});

const props = withDefaults(
  defineProps<{
    is_open: boolean;
    need_close_on_popup_click?: boolean;
  }>(),
  { need_close_on_popup_click: true }
);

const emits = defineEmits<{
  (e: "on_close"): void;
}>();

onUnmounted(() => {
  document.removeEventListener("click", methods.handle_click);
});

const methods = {
  handle_click(e: any) {
    if (!props.need_close_on_popup_click) {
      const target = e.target;
      const selector = `[data-id='${model.data_id}']`;
      if (!target.isConnected) return;
      if (target.closest(selector)) {
        return;
      }
    }
    emits("on_close");
  },
};

watch(
  () => props.is_open,

  (value: boolean) => {
    if (value) {
      setTimeout(() => {
        document.addEventListener("click", methods.handle_click);
      }, 10);
    } else {
      document.removeEventListener("click", methods.handle_click);
    }
  }
);
</script>

<template>
  <div
    :data-id="model.data_id"
    class="popup-custom"
    :class="{ hide: !props.is_open }"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.popup-custom {
  z-index: 99999999999;
  position: absolute;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.24), 0 0 2px rgba(0, 0, 0, 0.16), 0 3px 4px rgba(0, 0, 0, 0.06), 0 6px 8px rgba(0, 0, 0, 0.06),
    0 12px 16px rgba(0, 0, 0, 0.08), 0 18px 32px rgba(0, 0, 0, 0.06);
  background: white;
  bottom: 0px;
  right: 0px;
  transform: translate(0px, calc(100% + 10px));
  border-radius: 4px;
  visibility: visible;
  opacity: 1;
  transition: all 0.1s ease;
}
.popup-custom.hide {
  visibility: hidden;
  opacity: 0;
}
</style>
