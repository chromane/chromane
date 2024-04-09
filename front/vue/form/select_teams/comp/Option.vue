<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { Team } from "@g_types/types";
import svg_check from "@mdi/svg/svg/check.svg?raw";
import svg_cursor_click from "@mdi/svg/svg/cursor-default-click-outline.svg?raw";

interface Model {
  search_value: string;
  roles: string[];
  is_active_tags_select: boolean;
}

const props = defineProps<{
  option: Team;
  expanded: boolean;
}>();

const emit = defineEmits<{
  (e: "on_expand", value: string | null): void;
  (e: "on_change", value: { [key: string]: any }, team_id: string): void;
}>();

let ref_option = ref(null) as any;

const model: Model = reactive({
  search_value: "",
  roles: ["admin", "user"],
  is_active_tags_select: false,
});

const methods = {
  includes_name(role: string): boolean {
    if (role.toLowerCase().indexOf(model.search_value) === -1) {
      return false;
    } else {
      return true;
    }
  },
};
const handlers = {
  handle_click_option(team: Team) {
    let value: string | null;
    if (props.expanded) {
      return;
    } else {
      value = team.id;
    }
    emit("on_expand", value);
  },
  handle_click_input_el() {
    model.is_active_tags_select = true;
  },
  handle_click_role_option(role: string) {
    const prev = props.option.roles || [];

    const filter = prev.filter((prevItem) => prevItem !== role);

    let result: string[];
    if (filter.length === prev.length) {
      result = [...prev, role];
    } else {
      result = filter;
    }

    emit("on_change", { roles: result }, props.option.id);
  },

  handle_click_expanded(e: MouseEvent) {
    const el = e.target as HTMLElement;
    const inside_select = el.closest(`.option-team-select[data-team-name=${props.option.name}]`);
    if (!inside_select) {
      model.is_active_tags_select = false;
    }
  },
};

onMounted(() => {});
onUnmounted(() => {
  ref_option.value?.closest(".overlay-card")?.removeEventListener("click", handlers.handle_click_expanded);
});

watch(
  () => props.expanded,
  (new_value: boolean) => {
    if (!new_value) {
      model.is_active_tags_select = false;
      model.search_value = "";
    }
  }
);
watch(
  () => model.is_active_tags_select,
  (new_value: boolean) => {
    if (new_value) {
      ref_option.value?.closest(".overlay-card")?.addEventListener("click", handlers.handle_click_expanded);
    } else {
      ref_option.value?.closest(".overlay-card")?.removeEventListener("click", handlers.handle_click_expanded);
    }
  }
);
</script>
<template>
  <div
    class="option-team"
    :class="{ expanded: props.expanded }"
    ref="ref_option"
  >
    <div
      class="option-team__name"
      @click="
        () => {
          handlers.handle_click_option(option);
        }
      "
    >
      <div
        class="option-team__icon"
        v-html="svg_cursor_click"
      ></div>
      <span v-text="props.option.name"></span>
    </div>

    <div class="option-team-expanded">
      <div
        class="option-team-select"
        :data-team-name="props.option.name"
        :class="{ active: model.is_active_tags_select }"
      >
        <input
          type="text"
          class="option-team-select__input"
          placeholder="Type role"
          v-model="model.search_value"
          @click="handlers.handle_click_input_el"
        />

        <div class="option-team-select__options">
          <div
            class="option-team-select__option"
            v-for="role in model.roles"
            :key="role"
            :class="{ visible: methods.includes_name(role) }"
            @click="
              () => {
                handlers.handle_click_role_option(role);
              }
            "
          >
            <span v-text="role"></span>
            <div
              class="option-team-select__check"
              v-html="svg_check"
              v-if="option.roles?.includes(role)"
            ></div>
          </div>
        </div>
      </div>
      <div class="option-team-expanded__roles">
        <div
          v-for="role in option.roles || []"
          class="option-team-expanded__role"
          :key="role"
          v-text="role"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$color-active: rgba(0, 0, 0, 0.06);
$clr-hover: rgba(0, 0, 0, 0.12);

.option-team {
  width: 100%;

  &__name {
    display: flex;
    align-items: center;
    padding: 8px 8px 8px 8px;
    gap: 4px;
    background-color: white;

    color: rgba(0, 0, 0, 0.8);
    font-size: 13px;
    font-weight: 500;

    cursor: pointer;

    & :deep(svg) {
      width: 11px;
      height: 11px;
    }
  }

  & :deep(svg) {
    width: 12px;
    height: 12px;
  }
  &:not(.expanded) .option-team__name:hover {
    background: $clr-hover;
  }
}

.option-team-expanded {
  padding: 0px 12px 8px 24px;
  display: none;

  &__roles {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  &__role {
    padding: 4px 8px;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: rgba(0, 0, 0, 0.7);
  }
}

.option-team-select {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-bottom: 8px;
  height: 27px;

  font-size: 12px;
  line-height: 1.3;
  font-weight: 500;
  //     top: 100;
  & input {
    height: min-content;
    padding: 4px 8px;
    background: transparent;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    border: none;
    //     border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 0px;
    outline: none;
  }

  &__options {
    display: none;
    position: absolute;
    top: 25px;
    left: -1px;
    width: calc(100% + 2px);
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 0px 0px 4px 4px;
  }
  &__option {
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    cursor: pointer;
    display: none;
    &.visible {
      display: flex;
    }

    &:hover {
      background: $clr-hover;
    }
  }
}

.option-team-select.active {
  border-radius: 4px 4px 0px 0px;

  & .option-team-select__options {
    display: block;
    overflow: hidden;
  }
}

.option-team.expanded {
  background: $color-active;

  .option-team__name {
    cursor: default;
    background: transparent;
  }
  & .option-team-expanded {
    display: block;
  }
}
</style>
