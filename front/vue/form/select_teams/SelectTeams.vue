<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from "vue";
import { v4 } from "uuid";
import { Team, Dict } from "@g_types/types";
import Option from "./comp/Option.vue";

interface Model {
  teams: Dict<Team>;
  filtered_teams: Dict<Team>;
  comp_id: string;
  search_top: string;
  disabled: boolean;
  active: boolean;
  expanded_option: string | null;
}

const props = defineProps<{
  init_teams: Team[] | undefined;
}>();

const emits = defineEmits<{
  (e: "my_change", data: any): void;
}>();

const model: Model = reactive({
  teams: {},
  filtered_teams: {},
  comp_id: v4(),
  search_top: "",
  disabled: false,
  active: true,
  expanded_option: null,
});

const methods = {
  filter_options(teams: Dict<Team>, value: string): Dict<Team> {
    if (!value?.trim()) {
      return teams;
    }

    const result: Dict<Team> = {};

    for (const key in teams) {
      if (!teams[key]) {
        continue;
      }
      const team_name = teams[key]?.name || "";
      if (team_name.toLowerCase().indexOf(value) === -1) {
      } else {
        if (teams[key]) {
          // @ts-ignore
          result[key] = teams[key];
        }
      }
    }

    return result;
  },

  handle_event: function (name, data) {
    if (name === "chromane_select_disabled_cover_click") {
      this.chromane_select_disabled_cover_click(data);
    }
  },

  chromane_select_disabled_cover_click: function (data) {
    data.event.stopPropagation();
  },

  mutate_arr_to_dict(arr: Team[]) {
    try {
      const res = {};
      arr.forEach((el) => {
        res[el.id] = el;
      });
      return res;
    } catch (e) {
      return {};
    }
  },
};

const handlers = {
  handle_input_search_top(e: any) {
    const value = e.target.value;

    model.filtered_teams = methods.filter_options(model.teams, value);
    model.search_top = value;
  },

  handle_select_click(e: any) {
    if (model.active) return;
    e.stopPropagation();
    model.active = true;
    model.search_top = "";
  },

  handle_click_select_arrow(e: any) {
    if (!model.active) {
      return;
    }
    e.stopPropagation();
    model.active = false;
  },

  handle_click_outside_select(e: MouseEvent) {
    if (!model.active || model.active) return;
    const target: Element | null = e.target as any;
    if (!target) return;

    const selector = `[data-id='${model.comp_id}']`;
    const is_inside_select = target.closest(selector);
    if (is_inside_select) {
      return;
    }

    model.active = false;
    model.expanded_option = null;
  },

  handle_expended_option(value: string | null) {
    model.expanded_option = value;
  },

  handle_change_team(data: { [key: string]: any }, team_id: string) {
    const curr_team = model.teams[team_id];
    if (!curr_team) {
      return;
    }
    const upd_data = { ...curr_team, ...data };
    model.teams[team_id] = upd_data;
    if (team_id in model.filtered_teams) {
      model.filtered_teams[team_id] = upd_data;
    }
    emits("my_change", Object.values(model.teams));
  },
};

onMounted(() => {
  model.teams = methods.mutate_arr_to_dict(props.init_teams || []);

  const overlay: any = document.querySelector(".overlay-card");
  if (overlay) {
    overlay.addEventListener("click", handlers.handle_click_outside_select);
  }
});

onUnmounted(() => {
  const overlay: HTMLElement = document.querySelector(".overlay-card") as any;
  if (overlay) {
    overlay.removeEventListener("click", handlers.handle_click_outside_select);
  }
});
</script>

<template>
  <div
    class="select-teams"
    :data-id="model.comp_id"
    v-bind:class="{ active: model.active, disabled: !(props.init_teams?.length > 0) }"
  >
    <div
      class="select-teams-main"
      @click="handlers.handle_select_click"
    >
      <input
        type="text"
        placeholder="Type team name"
        :value="model.search_top"
        @input="handlers.handle_input_search_top"
      />

      <svg
        @click="handlers.handle_click_select_arrow"
        viewBox="0 0 24 24"
        class="select-teams-chevron"
      >
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    </div>

    <div class="select-teams-options">
      <div
        class="select-teams-option select-teams-option-no-results"
        v-if="model.search_top && Object.values(model.filtered_teams)?.length === 0"
      >
        No results found.
      </div>

      <Option
        v-for="option in !model?.search_top ? model.teams : model.filtered_teams"
        :key="option.name"
        :option="option"
        :expanded="true"
        @on_expand="handlers.handle_expended_option"
        @on_change="handlers.handle_change_team"
      />
    </div>

    <div
      class="select-teams-disabled-cover"
      v-if="model.disabled"
      v-on:click="methods.handle_event('chromane_select_disabled_cover_click', { event: $event })"
    ></div>
  </div>
</template>

<style scoped>
/* select-teams */

.select-teams {
  position: relative;

  width: 100%;

  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: transparent;
}

.select-teams.active {
  border-bottom: none;
}

.select-teams-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.select-teams input {
  flex-grow: 1;

  width: 10px;
  padding: 8px;
  background: transparent;

  border: none;
  border-radius: inherit;

  outline: none;

  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  font-size: 13px;
}

.select-teams-chevron {
  position: absolute;

  right: 6px;
  top: 6px;

  width: 24px;
  height: 24px;

  fill: rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
/*  */
.select-teams-options {
  position: relative;
  display: none;
  z-index: 10000;

  left: -1px;
  /* overflow: auto; */
  /* max-height: 200px; */
  width: calc(100% + 2px);

  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);

  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.select-teams.active .select-teams-chevron {
  rotate: 180deg;
}
.select-teams.active .select-teams-options {
  display: block;
}

.chromane-daterange-option-title {
  margin-right: 8px;

  color: rgba(0, 0, 0, 0.8);
}

.chromane-daterange-option-range {
  color: #a0a0a0;
}

.select-teams-option-no-results {
  display: flex;
  align-items: center;
  padding: 8px 12px 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.7);
  cursor: default;
  background-color: white;
}

.select-teams-option-no-results:hover {
  background-color: white;
}

/* select-teams-icon */

.select-teams-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 100%;

  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.select-teams-icon svg {
  width: 20px;
  height: 20px;

  fill: rgba(0, 0, 0, 0.5);
}

/**/

.select-teams-disabled-cover {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.12);
}

.select-teams.disabled {
  pointer-events: none;
  opacity: 0.5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.select-teams.disabled .select-teams-options {
  display: none;
}

/**/
</style>
