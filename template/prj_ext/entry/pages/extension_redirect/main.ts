function main() {
  let url = new URL(location.href);
  let event_name = url.searchParams.get("event_name");
  let tab_id = url.searchParams.get("tab_id");
  chrome.runtime.sendMessage({
    name: "extension_redirect",
    data: { event_name, tab_id, _sender: true },
  });
}
main();
export {};
