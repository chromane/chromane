import { FBTableFilterRule } from "@chromane/shared/types/fb_table";

export function convert_filter_rule_to_fb_query(rule: FBTableFilterRule): any[][] | null {
  try {
    if (rule.config.type === "text" || rule.config.type === "textarea") {
      if (rule.method === "is") {
        return [
          [rule.config.name, ">=", rule.value],
          [rule.config.name, "<=", rule.value + "\uf8ff"],
        ];
      } else if (rule.method === "is_empty") {
        return [[rule.config.name, "==", ""]];
      } else if (rule.method === "is_not_empty") {
        return [[rule.config.name, "!=", ""]];
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}
