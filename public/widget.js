(function () {
  if (document.getElementById("kiteum-chat-widget-iframe")) return;

  var scriptTag = document.currentScript;

  var slug = scriptTag.getAttribute("data-slug");
  var baseUrl = (scriptTag.getAttribute("data-base-url") || "https://agent.kiteum.com/").replace(/\/$/, "");
  var accentColor = scriptTag.getAttribute("data-accent-color") || "#2B4EFF";

  if (!slug) {
    console.error("[ChatWidget] data-slug is required.");
    return;
  }

  var COLLAPSED = { width: "76px", height: "76px", radius: "999px" };
  var EXPANDED_DESKTOP = { width: "400px", height: "640px", radius: "24px" };

  var iframe = document.createElement("iframe");
  iframe.id = "kiteum-chat-widget-iframe";
  iframe.title = "Chat widget";
  iframe.src =
    baseUrl +
    "/widget/" +
    encodeURIComponent(slug) +
    "?embed=1&accent=" +
    encodeURIComponent(accentColor);
  iframe.allow = "clipboard-write";
  iframe.style.position = "fixed";
  iframe.style.bottom = "16px";
  iframe.style.right = "16px";
  iframe.style.border = "none";
  iframe.style.background = "transparent";
  iframe.style.zIndex = "2147483000";
  iframe.style.colorScheme = "light";
  iframe.style.transition = "width 0.18s ease, height 0.18s ease, border-radius 0.18s ease, top 0.18s ease, left 0.18s ease";
  iframe.style.width = COLLAPSED.width;
  iframe.style.height = COLLAPSED.height;
  iframe.style.borderRadius = COLLAPSED.radius;

  var state = "collapsed";

  function isMobile() { return window.innerWidth < 480; }

  function applyCollapsed() {
    state = "collapsed";
    iframe.style.top = "";
    iframe.style.left = "";
    iframe.style.width = COLLAPSED.width;
    iframe.style.height = COLLAPSED.height;
    iframe.style.bottom = "16px";
    iframe.style.right = "16px";
    iframe.style.borderRadius = COLLAPSED.radius;
  }

  function applyExpanded() {
    state = "expanded";
    iframe.style.top = "";
    iframe.style.left = "";
    if (isMobile()) {
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.style.bottom = "0";
      iframe.style.right = "0";
      iframe.style.borderRadius = "0";
    } else {
      iframe.style.width = EXPANDED_DESKTOP.width;
      iframe.style.height = EXPANDED_DESKTOP.height;
      iframe.style.bottom = "16px";
      iframe.style.right = "16px";
      iframe.style.borderRadius = EXPANDED_DESKTOP.radius;
    }
  }

  function applyFullscreen() {
    state = "fullscreen";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.borderRadius = "0";
  }

  window.addEventListener("message", function (event) {
    var msg = event.data;
    if (!msg || msg.source !== "my-chat-widget") return;
    if (msg.type === "open") applyExpanded();
    if (msg.type === "close") applyCollapsed();
    if (msg.type === "fullscreen") applyFullscreen();
    if (msg.type === "restore") applyExpanded();
  });

  window.addEventListener("resize", function () {
    if (state === "expanded") applyExpanded();
  });

  document.body.appendChild(iframe);
})();