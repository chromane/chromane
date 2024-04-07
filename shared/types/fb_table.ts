export type FBTableFieldType = "text" | "teams" | "select" | "multi_select" | "json" | "textarea" | "json_arr";
export type FBTableFilterMethods = "is" | "is_empty" | "is_not_empty";

export interface FBTableConfig {
  title: string;
  hint: string;
  collection: string;
  required_claims: string[];
  cell_data_arr: FBTableColumnConfig[];
}

export interface FBTableRow {
  id: string;
  [key: string]: any;
}
export interface FBTableMeta {
  count: number;
}

export type FBTableColumnStaticConfiguration = {
  [key in FBTableFieldType]: {
    icon: string;
    is_sortable: boolean;
    filter_methods: FBTableFilterMethods[];
  };
};

export interface FBTableColumnConfigDefault {
  name: string;
  title: string;
  type: FBTableFieldType;
  editable?: boolean;
  header_filter?: boolean;
  type_display?: FBTableFieldType;
  hint?: string;
}
export interface FBTableColumnConfigText extends FBTableColumnConfigDefault {
  type: "text";
}
export interface FBTableColumnConfigTeams extends FBTableColumnConfigDefault {
  type: "teams";
}
export interface FBTableColumnConfigSelect extends FBTableColumnConfigDefault {
  type: "select";
  options: any[];
}
export interface FBTableColumnConfigJSON extends FBTableColumnConfigDefault {
  type: "json";
}
export interface FBTableColumnConfigTextarea extends FBTableColumnConfigDefault {
  type: "textarea";
}
export interface FBTableColumnConfigJSONArr extends FBTableColumnConfigDefault {
  type: "json_arr";
}

export type FBTableColumnConfig =
  | FBTableColumnConfigText
  | FBTableColumnConfigTeams
  | FBTableColumnConfigTextarea
  | FBTableColumnConfigJSON
  | FBTableColumnConfigJSONArr
  | FBTableColumnConfigSelect;

export type FBTableFilterRule = { config: FBTableColumnConfig | null; method: FBTableFilterMethods; value: any };
