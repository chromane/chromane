import util from "@chromane/shared/ts/util"; import Actions from "./Actions"; export default class ActionsManager { state: any = { stack: [], };
actions: Actions; constructor() { util.wrap_class(Actions, []); this.actions = new Actions(); } action_run(action) { return
this.actions[action[0]](action, this.state); } async run_process_data(process_data) { console.log(`Going to run_process_data with object: `,
process_data); // common.post_window_message(window.sidebar_content_window, "set_process_data", { process_data }); for (var j = process_data.op_index;
j < process_data.op_info_arr.length; j++) { var op_info = process_data.op_info_arr[j]; var op_data = op_info.op_data; op_info.status = "in_progress";
var simple_process_data: any = {}; // common.update_object(simple_process_data, process_data); simple_process_data.state = null; //
common.post_window_message(window.sidebar_content_window, "set_process_data", { process_data: simple_process_data }); if (op_data[0] === "set_url") {
op_info.status = "complete"; process_data.op_index += 1; await chrome.storage.local.set({ process_data }); location.href = op_data[1]; return; } else
if (op_data[0] === "click_and_expect_reload") { op_info.status = "complete"; process_data.op_index += 1; await chrome.storage.local.set({ process_data
}); process_data.state.saved_element.click(); return; } await this[op_data[0]](op_data, process_data.state); op_info.status = "complete";
process_data.op_index += 1; // var simple_process_data = {}; // common.update_object(simple_process_data, process_data); simple_process_data.state =
null; // common.post_window_message(window.sidebar_content_window, "set_process_data", { process_data: simple_process_data }); await
chrome.storage.local.set({ process_data }); } } }
