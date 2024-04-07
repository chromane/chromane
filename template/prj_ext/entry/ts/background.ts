import config from "@shared/config";

async function handle_activation(tab, info) {
  console.log("chromane_activation_info", info);
  let result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (info) => {
      let _window = window as any;
      _window.chromane_activation_info = info;
      if (_window.chromane_content_extecuted_flag) {
        _window.chromane_handle_action_click();
        return true;
      } else {
        _window.chromane_content_extecuted_flag = true;
        _window.chromane_open_popup_on_init = true;
        return false;
      }
    },
    args: [info],
  });
  let chromane_content_extecuted_flag = result[0].result;
  if (chromane_content_extecuted_flag === false) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        //
        "/js/content.js",
      ],
    });
  }
}

chrome.action.onClicked.addListener((tab) => {
  handle_activation(tab, tab);
});
