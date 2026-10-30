// Tracks clicks that open WhatsApp, not messages actually sent.
document.addEventListener("click", (event) => {
  const anchor = event.target.closest?.('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]');
  if (!anchor) return;
  const section = anchor.closest("header, section, footer");
  const placement = section?.id || section?.tagName?.toLowerCase() || "unknown";
  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", {
      link_location: placement,
      page_path: window.location.pathname,
      link_url: anchor.href,
      transport_type: "beacon"
    });
  }
});
