<script setup lang="ts">
import { onMounted, watch, reactive, ref, onUnmounted } from "vue";
import { PaginationData, PaginationDataRowPerPage } from "./firebase_table/types";
import { SortDir, TableGetRowsRequestConfig } from "@chromane/shared/types/types";
import { FBTableRow, FBTableConfig, FBTableFilterRule, FBTableMeta } from "@chromane/shared/types/fb_table";

import Button from "@chromane/front/vue/comp/Button.vue";
import OverlayConfirm from "./OverlayConfirm.vue";
import Pagination from "./firebase_table/components/Pagination.vue";
let ref_overlay = ref(null) as any;
let ref_overlay_confirm = ref(null) as any;

import mdi_edit from "@mdi/svg/svg/pencil.svg?raw";
import mdi_trash from "@mdi/svg/svg/delete.svg?raw";
import mdi_info from "@mdi/svg/svg/information-outline.svg?raw";
import mdi_chevron_down from "@mdi/svg/svg/chevron-down.svg?raw";

import svg_ripple from "@common/svg/ripple.svg?raw";
import util from "@chromane/shared/ts/util";
import Filter from "./firebase_table/components/Filter.vue";
import CellTeams from "./CellTeams.vue";
import OverlayForm from "./OverlayForm.vue";

import FirebaseIframe from "../../ts/FirebaseIframe";
import ctrl from "../../ts/app_controller";

import { COLUMN_STATIC_CONFIGURATION } from "./firebase_table/constants";
import { convert_filter_rule_to_fb_query } from "./firebase_table/helpers";

const DEFAULT_SORT_DIR: SortDir = "asc";

const props = defineProps<{
  config: FBTableConfig;
  ctrl: FirebaseIframe;
}>();

interface IModel {
  style_id: string;
  blocking: number;
  data_arr: FBTableRow[];
  handle_coords: any[];
  col_data_arr: any[];
  dragging_flag: boolean;
  table_width: number;
  is_applying_filter: boolean;

  sort_state: {
    dir: SortDir;
    cell_name: string;
  };
  pagination_data: PaginationData;

  start_page_to_id_rel: { [page_number: number]: string };

  filter_rules: FBTableFilterRule[];
}

const model: IModel = reactive({
  // number of blocking operations
  style_id: "",
  blocking: 0,
  data_arr: [],
  handle_coords: [] as any,
  col_data_arr: [] as any,
  dragging_flag: false,
  table_width: 0,
  sort_state: { cell_name: "", dir: DEFAULT_SORT_DIR },

  pagination_data: { start_current_page: 1, row_per_page: 10, total: 0, cursor_id: "" },
  //
  is_applying_filter: false,

  start_page_to_id_rel: {},
  filter_rules: [],
});

watch(
  () => model.col_data_arr,
  () => {
    let offset_x = 0;
    let len = model.col_data_arr.length;
    model.handle_coords = [];
    for (let i = 0; i < len; i++) {
      offset_x += model.col_data_arr[i].width;
      model.handle_coords.push({
        x: offset_x,
        last: i === len - 1,
      });
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => model.table_width,
  () => {
    // model.table_width
    if (model.table_width > 100) {
      let total_width: any = model.col_data_arr
        .map((col) => {
          return col.width;
        })
        .reduce((acc, curr) => {
          return acc + curr;
        }, 0);
      let factor = model.table_width / total_width;
      model.col_data_arr.forEach((data) => {
        data.width = data.width * factor;
      });
    }
  },
  { deep: true, immediate: true }
);

let ref_table = ref(null) as any;
let state: { style: HTMLStyleElement | null; storage_table_key: string } = {
  style: null,
  storage_table_key: `fb_table_config_${props.config.collection}`,
};

onMounted(() => {
  model.style_id = "firebase-table-style-" + util.get_id();
  state.style = document.createElement("style");
  state.style.id = model.style_id;
  state.style.innerHTML = `
      .${model.style_id} .row {
        position: relative;
        display: grid;
        grid-auto-columns: 154px 300px 300px;
        grid-auto-flow: column;
      }
  `;
  document.head.appendChild(state.style);
});

onUnmounted(() => {
  state.style.remove();
});

onMounted(async () => {
  if (props.config.collection === "users") {
    // const resp = await props.ctrl.firebase_manager.backend_proxy.modules.chromane.dev("_token_");
    // console.log("DEV DEV", resp);
  }
  //
  await methods.reload();
});

onMounted(async () => {
  //

  const storage: any = await ctrl.proxy_extension_iframe.storage_get([state.storage_table_key]);
  let cache_data = storage[state.storage_table_key] || null;
  const cached_column_size = cache_data?.column_size || null;
  console.log(props.config, cache_data, "PROPS CONFIG");
  model.col_data_arr = props.config.cell_data_arr.map((i, index: number) => {
    const width = cached_column_size?.at(index)?.width || 100;

    return {
      width,
    };
  });
  //
  let rect = ref_table.value.getBoundingClientRect();
  model.table_width = rect.width;
  let resize_observer = new ResizeObserver(([entry]) => {
    if (entry) {
      model.table_width = entry.contentRect.width;
    }
  });
  resize_observer.observe(ref_table.value);
  //
  //
  // model.col_data_arr = [];
  let offset_x = 0;
  // for (let i = 0; i < model.col_size_arr.length; i++) {
  //   offset_x += model.col_size_arr[i];
  //   model.col_data_arr.push({
  //     x: offset_x,
  //     width: model.col_size_arr[i],
  //   });
  // }
  //
});

watch(
  () => [model.col_data_arr, model.table_width],
  () => {
    //
    let offset = 0;
    let max_width = model.table_width;

    if (state.style) {
      helpers.save_coll_data_arr_to_storage();
      // @ts-ignore
      state.style.sheet.cssRules[0].style.gridAutoColumns = model.col_data_arr
        .map((data) => {
          return `${data.width}px`;
        })
        .join(" ");
    }
  },
  { deep: true, immediate: true }
);

const _emit = defineEmits([
  //
  "cell_value_change_request",
  "remove_row_confirm_request",
  "row_action",
]);

async function edit_cell(data: any, cell_data: any) {
  console.log("data", data);
  console.log("cell_data", cell_data);
  let current_value = data[cell_data.name];
  console.log("current_value", current_value);
  // let new_value = await props.prompt_el.open({
  //   popup_title: "Cell edit",
  //   current_value,
  //   ...cell_data,
  // });
  // _emit("cell_value_change_request", { collection_name: props.config.collection, data, cell_data, new_value: new_value[0].value });
}

let dragging_start_x = 0;
let dragging_cell_data_start_width = 0;

let dragging_cell_data_left = 0 as any;
let dragging_cell_data_right = 0 as any;

let dragging_cell_data_left_width_init = 0 as any;
let dragging_cell_data_right_width_init = 0 as any;

let methods = {
  handle_dragging_mousedown: (event, index) => {
    if (model.col_data_arr[index + 1]) {
      //
      dragging_cell_data_left = model.col_data_arr[index];
      dragging_cell_data_right = model.col_data_arr[index + 1];
      //
      dragging_cell_data_left_width_init = dragging_cell_data_left.width;
      dragging_cell_data_right_width_init = dragging_cell_data_right.width;
      //
      dragging_start_x = event.clientX;
      //
      model.dragging_flag = true;
    }
    // dragging_cell_data = cell_data;
    // dragging_cell_data_start_width = cell_data.width;
    // console.log(cell_data, event);
  },
  handle_dragging_mousemove: (event) => {
    if (model.dragging_flag) {
      //
      let delta = dragging_start_x - event.clientX;
      let width_new_left = dragging_cell_data_left_width_init - delta;
      let width_new_right = dragging_cell_data_right_width_init + delta;
      if (width_new_left > 100 && width_new_right > 100) {
        dragging_cell_data_left.width = width_new_left;
        dragging_cell_data_right.width = width_new_right;
      }
      //
    }
  },
  handle_dragging_mouseup: () => {
    model.dragging_flag = false;
  },
  new_item_click: async () => {
    let data = await ref_overlay.value.open("New Item", {}, props.config.cell_data_arr);
    console.log("data", data);
    if (data) {
      model.blocking += 1;
      await props.ctrl.firebase_manager.backend_proxy.modules.chromane.table_row_add("_token_", props.config.collection, data);
      await methods.reload();
      model.blocking -= 1;
    }
  },
  async reload(config_req: { include_query_meta?: boolean } = { include_query_meta: true }) {
    model.blocking += 1;
    let meta: FBTableMeta;

    const get_rows_body: TableGetRowsRequestConfig = {
      limit: model.pagination_data.row_per_page,
      cursor_id: model.pagination_data.cursor_id,
      pagin_method: "start_after",
    };

    if (model.sort_state.cell_name) {
      get_rows_body.sort = { field: model.sort_state.cell_name, dir: model.sort_state.dir };
    }

    if (model.filter_rules.length > 0) {
      const fb_rules = helpers.convert_filter_rules_to_fb_rules();
      if (fb_rules) {
        get_rows_body.filter = fb_rules;
      }
      // console.log(fb_rules, "FB RULESSS");
    }
    if (config_req.include_query_meta) {
      get_rows_body.include_query_meta = config_req.include_query_meta;
    }

    let rows_data = await props.ctrl.firebase_manager.backend_proxy.modules.chromane.table_get_rows(
      "_token_",
      props.config.collection,
      get_rows_body
    );

    if (config_req.include_query_meta) {
      model.pagination_data.total = rows_data.meta ? rows_data.meta.count : 0;
    }
    console.log("meta", meta);
    console.log("rows", rows_data);
    model.data_arr = rows_data?.docs || [];

    methods.map_start_page_to_id_rel(rows_data?.docs);
    model.blocking -= 1;
  },
  // row actions
  async edit(data) {
    let new_data = await ref_overlay.value.open("Edit Item", data, props.config.cell_data_arr);
    if (new_data) {
      model.blocking += 1;
      await props.ctrl.firebase_manager.backend_proxy.modules.chromane.table_row_edit(
        "_token_",

        props.config.collection,
        new_data
      );
      await methods.reload();
      model.blocking -= 1;
    }
  },
  async delete(data) {
    let result = await ref_overlay_confirm.value.open(
      "Deleting Item",
      "Are you sure you want to delete this row? This action cannot be undone.",
      "Delete"
    );
    if (result) {
      model.blocking += 1;
      await props.ctrl.firebase_manager.backend_proxy.modules.chromane.table_row_delete("_token_", props.config.collection, data.id);
      await methods.reload();
      model.blocking -= 1;
    }
  },
  get_textarea_value(str) {
    if (str) {
      if (str.length > 220) {
        return str.slice(0, 220) + "...";
      } else {
        return str;
      }
    } else {
      return "";
    }
  },

  map_start_page_to_id_rel(rows: FBTableRow[] | null | undefined) {
    if (!rows) return;
    let curr_index = model.pagination_data.start_current_page;
    rows.forEach((item) => {
      model.start_page_to_id_rel[curr_index] = item.id;
      curr_index++;
    });
  },
};

const handlers = {
  async handle_click_page_btn(type: "next" | "prev") {
    if (type === "next") {
      const next_page_number = model.pagination_data.start_current_page + model.pagination_data.row_per_page;
      if (next_page_number >= model.pagination_data.total) {
        return;
      }

      model.pagination_data.start_current_page = next_page_number;
      model.pagination_data.cursor_id = model.data_arr?.at(-1)?.id || "";
    } else {
      helpers.go_to_first_page();
      const prev_curr_page = model.pagination_data.start_current_page - model.pagination_data.row_per_page;

      if (prev_curr_page <= 1) {
        helpers.go_to_first_page();
      } else {
        const prev_cursor_id = model.start_page_to_id_rel[prev_curr_page - 1];
        if (prev_cursor_id) {
          model.pagination_data.start_current_page = prev_curr_page;
          model.pagination_data.cursor_id = prev_cursor_id;
        } else {
          helpers.go_to_first_page();
        }
      }
    }
    await methods.reload({ include_query_meta: false });
  },
  async handle_change_row_per_page(value: PaginationDataRowPerPage) {
    model.pagination_data.row_per_page = value;

    await methods.reload({ include_query_meta: false });
  },

  async handle_click_sort(cell) {
    const allowed_types_sort = ["text", "number", "date"];

    if (!allowed_types_sort.includes(cell.type)) return;

    const first_rule = model.filter_rules[0];

    helpers.go_to_first_page();

    let include_query_meta = false;

    if (first_rule?.config?.name && first_rule?.config?.name !== cell.name) {
      helpers.clear_filter();
      include_query_meta = true;
    }
    if (model.sort_state.cell_name === cell.name) {
      model.sort_state.dir = model.sort_state.dir === "asc" ? "desc" : "asc";
    } else {
      model.sort_state = { cell_name: cell.name, dir: DEFAULT_SORT_DIR };
    }

    methods.reload({ include_query_meta });
    //
  },

  async handle_apply_filter_rules(rules: FBTableFilterRule[]) {
    if (rules.length === 0 && model.filter_rules.length === 0) return;

    try {
      model.is_applying_filter = true;

      const first_rule = rules[0];
      if (first_rule.config.name !== model.sort_state.cell_name) {
        model.sort_state = { cell_name: first_rule.config.name, dir: DEFAULT_SORT_DIR };
      }

      model.filter_rules = util.clone(rules);
      helpers.go_to_first_page();
      await methods.reload();
    } catch (e) {
    } finally {
      model.is_applying_filter = false;
    }
  },
};

const helpers = {
  go_to_first_page() {
    model.start_page_to_id_rel = {};
    model.pagination_data.start_current_page = 1;
    model.pagination_data.cursor_id = "";
  },

  save_coll_data_arr_to_storage() {
    util.debounce(state.storage_table_key, 400, () => {
      ctrl.proxy_extension_iframe.storage_set({ [state.storage_table_key]: { column_size: util.clone(model.col_data_arr) } });
    });
  },

  convert_filter_rules_to_fb_rules(): any[] | null {
    if (model.filter_rules.length === 0) return null;

    let res: any[] = [];

    model.filter_rules.forEach((rule) => {
      const candidate_rule = convert_filter_rule_to_fb_query(rule);
      if (candidate_rule) {
        res = res.concat(candidate_rule);
      }
    });

    if (res.length > 0) {
      return res;
    } else {
      return null;
    }
  },
  clear_filter(): void {
    model.filter_rules = [];
  },
  clear_sort(): void {
    model.sort_state.cell_name = "";
  },
};
</script>

<template>
  <div
    class="table firebase-table"
    :class="{
      [model.style_id]: true,
    }"
    ref="ref_table"
  >
    <!-- Header -->
    <div class="table-header">
      <div class="table-header__config">
        <div class="table-header-title">
          <span v-text="props.config.title"></span>
          <div
            v-if="props.config.hint"
            class="info"
            v-html="mdi_info"
            v-tippy="props.config.hint"
          ></div>
        </div>

        <Filter
          class="table-header-filter"
          :column_configs="config.cell_data_arr"
          :applied_rules="model.filter_rules"
          :is_applying="model.is_applying_filter"
          @on_apply_filter_rules="handlers.handle_apply_filter_rules"
        />
      </div>

      <Button
        :model="{
          text: 'New Item',
        }"
        v-on:button_click="methods.new_item_click"
      ></Button>
    </div>
    <!-- Header -->
    <div class="row row-main">
      <div
        class="cell"
        v-for="cell in props.config.cell_data_arr"
        @click="handlers.handle_click_sort(cell)"
        :data-sort="cell.name === model.sort_state.cell_name ? model.sort_state.dir : 'none'"
      >
        <div
          class="cell-icon"
          v-html="COLUMN_STATIC_CONFIGURATION[cell.type].icon"
        ></div>

        <div
          class="cell-value"
          v-text="cell.title"
        ></div>
        <div
          class="info"
          v-if="cell.hint"
          v-html="mdi_info"
          v-tippy="cell.hint"
        ></div>

        <div
          v-if="cell.name === model.sort_state.cell_name"
          v-html="mdi_chevron_down"
          class="cell-sorter"
        ></div>
      </div>
    </div>
    <!-- Body -->
    <div
      class="row"
      v-for="data in model.data_arr"
      v-if="model.data_arr?.length > 0"
    >
      <div class="row-action-items">
        <div
          class="row-action-item"
          v-on:click="methods.edit(data)"
        >
          <div
            v-html="mdi_edit"
            style="width: 36px"
          ></div>
        </div>
        <div
          class="row-action-item"
          v-on:click="methods.delete(data)"
        >
          <div
            v-html="mdi_trash"
            style="width: 36px"
          ></div>
        </div>
      </div>
      <div
        class="cell"
        v-for="cell in props.config.cell_data_arr"
      >
        <div
          v-if="cell.type === 'json_arr' || cell.type_display === 'json_arr'"
          class="cell-value"
        >
          <div
            class="cell-value-item"
            v-for="item in data[cell.name]"
            v-text="item"
          ></div>
        </div>

        <CellTeams
          v-else-if="cell.type === 'teams'"
          class="cell-value"
          :items="data[cell.name] || []"
        />
        <div
          v-else-if="cell.type === 'json'"
          class="cell-value"
          v-text="JSON.stringify(data[cell.name])"
        ></div>
        <div
          v-else-if="cell.type === 'textarea'"
          class="cell-value"
        >
          {{ methods.get_textarea_value(data[cell.name]) }}
        </div>
        <div
          v-else
          class="cell-value"
        >
          {{ data[cell.name] }}
        </div>
        <div class="cell__action">
          <div
            class="cell-edit"
            v-on:click="edit_cell(data, cell)"
            v-if="cell.editable"
            v-html="mdi_edit"
          ></div>
        </div>
      </div>
    </div>

    <div
      class="row-empty"
      v-else
    >
      Nothing was found
    </div>

    <!-- Footer  -->
    <Pagination
      :pagination_data="model.pagination_data"
      @on_click_page_btn="handlers.handle_click_page_btn"
      @on_change_row_per_page="handlers.handle_change_row_per_page"
    />

    <!-- Dragging hanles -->
    <div
      class="dragging-handle-container"
      v-bind:class="{ wide: model.dragging_flag }"
      v-on:mousemove="methods.handle_dragging_mousemove($event)"
      v-on:mouseup="methods.handle_dragging_mouseup()"
    >
      <div
        class="dragging-handle"
        v-for="(cell_data, index) in model.col_data_arr"
        v-bind:style="{
          left: model.handle_coords[index].x + 'px',
          display: model.handle_coords[index].last ? 'none' : 'block',
        }"
        v-on:mousedown="methods.handle_dragging_mousedown($event, index)"
        v-on:mousemove="methods.handle_dragging_mousemove($event)"
        v-on:mouseup="methods.handle_dragging_mouseup()"
      ></div>
    </div>
    <!-- Blocking overlay -->
    <div
      class="blocking-overlay"
      v-if="model.blocking > 0"
    >
      <div v-html="svg_ripple"></div>
    </div>
    <!-- Popups and Overlays -->
    <Teleport to="#portal">
      <OverlayForm ref="ref_overlay" />
      <OverlayConfirm ref="ref_overlay_confirm"></OverlayConfirm>
    </Teleport>
  </div>
</template>

<style lang="scss">
.svg-wrap {
  display: flex;
  justify-content: center;
  align-items: center;

  & svg {
    width: 100%;
    height: 100%;
  }
}

.table {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}
.blocking-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99000;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.24);
}
.blocking-overlay svg {
  display: block;
  width: 120px;
  height: 120px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ebebeb;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  height: 60px;
  padding: 12px 24px;

  &__config {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  &-title {
    font-size: 18px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
}

.dragging-handle-container {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 0px;
  height: 100%;
}
.dragging-handle-container.wide {
  width: 100%;
}
.dragging-handle {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 3px;
  height: 100%;
  background-color: transparent;
  cursor: col-resize;
}
/* .row,
.row-main {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
} */
.row:last-child,
.row-main:last-child {
  border-bottom: none;
}
.row-main .cell {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.info {
  margin-left: 4px;
}
.info svg {
  display: block;
  width: 16px;
  height: 16px;
  fill: rgba(0, 0, 0, 0.8);
}
.cell {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  padding: 12px;
  position: relative;
  overflow: hidden;

  &-value {
    width: calc(100% - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-icon {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 5px;
    & svg {
      width: 100%;
      height: 100%;
      fill: rgb(102, 102, 102);
    }
  }
}
.cell:last-child {
  border-right: 0px;
}

.row-action-items {
  position: absolute;
  z-index: 100;
  top: 50%;
  transform: translate(0, -50%);
  right: 5px;
  height: 100%;
  z-index: 110;
  transition-duration: 200ms;
  display: flex;
  align-items: center;
  visibility: hidden;
  opacity: 0;
}

.row-action-item {
  cursor: pointer;
}

.cell-edit {
  color: rgb(13, 71, 161);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 2px 8px rgba(20, 20, 20, 0.5);
  border-radius: 50%;
  background-color: #fafafa;
}

.cell-edit svg {
  width: 20px;
  height: 20px;
}
.cell:hover .cell__action {
  visibility: visible;
  opacity: 1;
  cursor: pointer;
}

.row-main .cell {
  font-weight: bold;
  background-color: rgb(245, 245, 245);
  color: #101010;
  cursor: pointer;
  user-select: none;

  &[data-sort="asc"],
  &[data-sort="desc"] {
    position: relative;
    padding-right: 44px;
  }

  & .cell-sorter {
    width: 28px;
    height: 28px;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translate(0px, -50%);

    & svg {
      width: 100%;
      height: 100%;
    }
  }
  &[data-sort="asc"] .cell-sorter svg {
    rotate: 180deg;
  }
}
.row-empty {
  text-align: center;
  margin: 40px 0px;
  opacity: 0.7;
}

.row {
  position: relative;
}
.row:hover .row-action-items {
  visibility: visible;
  opacity: 1;
}

.row__action {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(10, 10, 10, 0.1);
  transition-duration: 200ms;
  padding: 0 40px 0 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.row-action__list {
  pointer-events: auto;
}

.cell-value-item {
  background-color: rgb(13, 71, 161);
  color: white;
  border-radius: 4px;
  display: inline-block;
  padding: 2px 4px;
  margin: 0px 4px 4px 0px;
  width: fit-content;
}
.firebase-table .button {
  width: fit-content;
  min-width: 160px;
}
</style>
