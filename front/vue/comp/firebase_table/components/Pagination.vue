<script setup lang="ts">
import mdi_chevron_left from "@mdi/svg/svg/chevron-left.svg?raw";
import mdi_chevron_right from "@mdi/svg/svg/chevron-right.svg?raw";
import { PaginationData, PaginationDataRowPerPage } from "../types";
import { onMounted, reactive, watch } from "vue";

interface IModel {
  displayed_rows: string;
  last_row_number_page: number;
}

const props = defineProps<{ pagination_data: PaginationData }>();
const emit = defineEmits<{
  (e: "on_click_page_btn", type: "next" | "prev"): void;
  (e: "on_change_row_per_page", value: PaginationDataRowPerPage): void;
}>();

const model: IModel = reactive({
  displayed_rows: "",
  last_row_number_page: 0,
});

const methods = {
  manage_pagination_data_input(value: PaginationData) {
    const start = value.start_current_page;

    let last = start + value.row_per_page - 1;
    if (last > value.total) {
      last = value.total;
    }

    model.last_row_number_page = last;
    model.displayed_rows = `${start} - ${last}`;
  },

  handle_change_row_per_page(e: any) {
    const value: any = +e.target.value;

    emit("on_change_row_per_page", value);
  },
};

watch(
  () => props.pagination_data,
  (new_value) => {
    methods.manage_pagination_data_input(new_value);
  },
  { deep: true }
);

onMounted(() => {
  methods.manage_pagination_data_input(props.pagination_data);
});
</script>
<template>
  <div class="table-pagination">
    <div class="table-pagination__rows">
      Rows per page
      <select
        :value="props.pagination_data.row_per_page"
        @change="methods.handle_change_row_per_page"
      >
        <option>10</option>
        <option>20</option>
        <option>30</option>
      </select>
    </div>

    <div
      class="table-pagination__state"
      v-if="props.pagination_data.total > 0"
    >
      <div class="table-pagination__curr">{{ model.displayed_rows }} of {{ props.pagination_data.total }}</div>
      <div class="table-pagination__nav">
        <button
          class="svg"
          v-html="mdi_chevron_left"
          :disabled="props.pagination_data.start_current_page <= 1"
          @click="emit('on_click_page_btn', 'prev')"
        ></button>
        <button
          class="svg"
          v-html="mdi_chevron_right"
          :disabled="model.last_row_number_page >= props.pagination_data.total"
          @click="emit('on_click_page_btn', 'next')"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #ebebeb;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  height: 60px;

  &__state {
    display: flex;
    align-items: center;
    margin: 0px 0px 0px 20px;
  }

  &__nav {
    display: flex;
    align-items: center;
    & button {
      width: 24px;
      height: 24px;

      &:disabled {
        opacity: 0.5;
      }
    }

    & :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
