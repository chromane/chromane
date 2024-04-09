import "../../../slots/project.css";

function main() {
  let config = JSON.parse(window.name);
  document.querySelector("#button").addEventListener("click", () => {
    chrome.permissions.request(config.permissions, async (granted) => {
      // The callback argument will be true if the user granted the permissions.
    });
  });
}
main();
export {};
