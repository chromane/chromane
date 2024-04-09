function main() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.name === "close_redirect_page") {
      chrome.runtime.sendMessage({ name: "close_this_tab" });
    }
  });
  //
  let url = new URL(location.href);
  let code = url.searchParams.get("code");
  let state = url.searchParams.get("state");
  let event_name = url.searchParams.get("event_name");
  chrome.runtime.sendMessage({
    name: "redirect",
    data: { code, state, event_name },
  });
}
main();
export {};
