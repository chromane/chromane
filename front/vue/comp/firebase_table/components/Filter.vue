<script setup lang="ts">
import mdi_filter from "@mdi/svg/svg/filter-variant.svg?raw";
import mdi_plus from "@mdi/svg/svg/plus.svg?raw";
import mdi_trash from "@mdi/svg/svg/trash-can-outline.svg?raw";
import PopupCustom from "../../PopupCustom.vue";
import { FBTableColumnConfig, FBTableFilterRule } from "@chromane/shared/types";
import { computed, onMounted, reactive } from "vue";
import { COLUMN_STATIC_CONFIGURATION } from "../constants";
import util from "@chromane/shared/ts/util";

interface IModel {
  rules: FBTableFilterRule[];
  is_popup_open: boolean;
}

const props = defineProps<{
  column_configs: FBTableColumnConfig[];
  applied_rules: FBTableFilterRule[];
  is_applying: boolean;
}>();

const emit = defineEmits<{
  (e: "on_apply_filter_rules", data: FBTableFilterRule[]): void;
}>();

const model: IModel = reactive({
  rules: [],
  is_popup_open: false,
});

const allowed_filter_columns = computed(() => {
  return props.column_configs.filter((item) => item.header_filter);
});

const handlers = {
  handle_click_filter_btn(e: any) {
    const is_open = model.is_popup_open;

    util.stop_propagation_smart(e);

    if (!is_open) {
      if (props.applied_rules?.length > model.rules?.length) {
        model.rules = util.clone(props.applied_rules);
      }
      model.is_popup_open = true;
    }
  },

  handle_click_create_rule() {
    methods.create_default_rule();
  },

  handle_change_select_field(e: any, index: number) {
    const value = e.target.value;
    const config = allowed_filter_columns.value.find((item) => item.name === value);
    model.rules[index].config = config;

    methods.trigger_rules_change();
  },

  handle_change_select_method(e: any, index: number) {
    const value = e.target.value;
    model.rules[index].method = value;

    methods.trigger_rules_change();
  },
  handle_change_rule_value(e: any, index: number) {
    const value = e.target.value;
    model.rules[index].value = value;

    methods.trigger_rules_change();
  },
  handle_click_apply() {
    emit("on_apply_filter_rules", model.rules);
  },
  handle_click_delete(index: number) {
    model.rules.splice(index, 1);
  },
};
const methods = {
  create_default_rule() {
    const rule: FBTableFilterRule = { config: props.column_configs.find((item) => item.header_filter), method: "is", value: "" };
    model.rules.push(rule);
  },
  trigger_rules_change() {},
};

onMounted(() => {
  // methods.create_default_rule();
});
</script>
<template>
  <div class="table-filter">
    <div
      class="table-filter-btn"
      :class="{ filtered: props.applied_rules.length > 0 }"
      @click="handlers.handle_click_filter_btn"
    >
      <div
        class="table-filter-btn__svg"
        v-html="mdi_filter"
      ></div>
      <span v-if="props.applied_rules.length > 0">
        <span>Filtered by {{ " " }}</span>
        <span
          v-for="item in props.applied_rules"
          :key="item.config.name"
          v-text="item.config.title + ' '"
        ></span>
      </span>
      <span v-else>Filter</span>
    </div>
    <PopupCustom
      class="filter-popup"
      :is_open="model.is_popup_open"
      :need_close_on_popup_click="false"
      @on_close="
        () => {
          model.is_popup_open = false;
        }
      "
    >
      <div class="filter-popup__wrap">
        <div class="filter-popup-header">
          <div
            class="filter-popup-header__info"
            v-text="props.applied_rules.length > 0 ? `${props.applied_rules.length} rules applied` : 'No filter conditions are applied'"
          ></div>

          <div
            class="filter-popup-body"
            v-if="model.rules?.length > 0"
          >
            <div class="filter-popup-body__filters">
              <div
                class="filter-popup-rule"
                v-for="(rule, index) in model.rules"
                :key="rule.config.name"
              >
                <div class="filter-popup-rule__label">Where</div>
                <div
                  class="filter-popup-rule__actions"
                  v-if="rule.config"
                >
                  <select
                    data-type="field"
                    @change="(e) => handlers.handle_change_select_field(e, index)"
                    :value="rule.config.name"
                  >
                    <option
                      v-for="config_item in allowed_filter_columns"
                      :key="config_item.name"
                      :text="config_item.title"
                      :value="config_item.name"
                    ></option>
                  </select>
                  <select
                    data-type="method"
                    :value="rule.method"
                    @change="(e) => handlers.handle_change_select_method(e, index)"
                  >
                    <option
                      v-for="method_name in COLUMN_STATIC_CONFIGURATION[rule.config.type].filter_methods"
                      :key="method_name"
                      :text="method_name"
                      :value="method_name"
                    ></option>
                  </select>
                  <div class="filter-popup-rule__enter">
                    <input
                      v-if="rule.method === 'is'"
                      type="text"
                      :value="rule.value"
                      @input="(e) => handlers.handle_change_rule_value(e, index)"
                    />
                  </div>
                  <button
                    class="filter-popup-rule__delete"
                    v-html="mdi_trash"
                    @click="handlers.handle_click_delete(index)"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-popup-footer">
            <div
              class="filter-popup-footer__create"
              v-if="model.rules.length === 0"
            >
              <button
                data-action="add"
                @click="handlers.handle_click_create_rule"
              >
                <div
                  class="svg-wrap"
                  v-html="mdi_plus"
                ></div>
                Add condition
              </button>
            </div>
            <button
              data-action="apply"
              :disabled="props.is_applying"
              @click="handlers.handle_click_apply"
              v-text="props.is_applying ? 'Applying filter...' : 'Apply filter'"
              v-if="props.applied_rules.length > 0 || model.rules.length > 0"
            ></button>
          </div>
        </div>
      </div>
    </PopupCustom>
  </div>
</template>

<style scoped lang="scss">
$clr-border: rgba(0, 0, 0, 0.12);
$fs-m: 14px;
.table-filter {
  position: relative;
}

.table-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border-radius: 4px;
  padding: 2px 8px;
  transition: all 0.1s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.13);
    cursor: pointer;
  }

  &.filtered {
    background: #cff5d1;
  }
  &__svg {
    display: flex;
    align-items: center;
    width: 20px;
    height: 20px;
    & svg {
      width: 100%;
      height: 100%;
    }
  }
}

.filter-popup {
  width: min-content;
  max-width: 70vw;
  width: min-content;
  min-width: 300px;
  left: 0px;
  right: auto;

  &__wrap {
    padding: 12px 16px;
  }

  &-header {
    font-size: $fs-m;
    &__info {
      opacity: 0.5;
    }
  }
}

.filter-popup-body {
  margin-top: 12px;
}
.filter-popup-footer {
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & button[data-action] {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $fs-m;
    opacity: 0.7;
    transition: all 0.1s ease;
    border-radius: 4px;

    &:hover:not(:disabled) {
      opacity: 1;
    }
    & > .svg-wrap {
      height: 14px;
      width: 14px;
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
      background: transparent;
    }
  }
  & button[data-action="apply"] {
    padding: 0px 10px;
    border: 1px solid $clr-border;
    background: rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      opacity: 1;
      background: rgba(0, 0, 0, 0.08);
    }
  }
}

.filter-popup-rule {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  font-size: $fs-m;
  gap: 20px;

  &__label {
    flex: 0 0 auto;
  }

  &__actions {
    flex: 1 1 auto;
    display: flex;
  }
  &__actions > * {
    border-right: 1px solid $clr-border;
    border-top: 1px solid $clr-border;
    border-bottom: 1px solid $clr-border;
    height: 30px;
  }

  &__actions > *:first-child {
    border-left: 1px solid $clr-border;
  }

  &__actions select {
    min-width: 120px;
    padding: 6px;
    background: transparent;
  }

  &__enter {
    height: 100%;
    flex: 1 1 auto;
    & input {
      height: 100%;
      outline: none;
      border: none;
      padding: 6px;
    }
  }

  &__delete {
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: all 0.1s ease;
    & :deep(svg) {
      width: 16px;
      height: 16px;
    }
    &:hover {
      opacity: 1;
    }
  }
}
</style>
