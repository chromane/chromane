import { FBTableColumnStaticConfiguration } from "@chromane/shared/types/fb_table";
import mdi_text from "@mdi/svg/svg/format-text-variant.svg?raw";
import mdi_teams from "@mdi/svg/svg/account-multiple.svg?raw";
import mdi_select from "@mdi/svg/svg/arrow-down-drop-circle-outline.svg?raw";

export const COLUMN_STATIC_CONFIGURATION: FBTableColumnStaticConfiguration = {
  text: { icon: mdi_text, is_sortable: true, filter_methods: ["is", "is_empty", "is_not_empty"] },
  teams: { icon: mdi_teams, is_sortable: true, filter_methods: [] },
  multi_select: { icon: mdi_select, is_sortable: true, filter_methods: [] },
  select: { icon: mdi_select, is_sortable: true, filter_methods: [] },
  json: { icon: mdi_text, is_sortable: true, filter_methods: [] },
  json_arr: { icon: mdi_text, is_sortable: true, filter_methods: [] },
  textarea: { icon: mdi_text, is_sortable: true, filter_methods: [] },
};
