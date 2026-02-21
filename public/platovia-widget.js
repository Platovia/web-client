(function () {
  // Locate the current script tag and read data attributes
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getAttr(name, fallback) {
    var v = currentScript.getAttribute(name);
    return v == null ? fallback : v;
  }

  var token = getAttr('data-token');
  if (!token) {
    console.error('[Platovia] Missing data-token attribute on script tag');
    return;
  }

  var color = getAttr('data-color', '#ea580c');
  var position = (getAttr('data-position', 'bottom-right') || '').toLowerCase();
  var open = (getAttr('data-open', 'false') || 'false').toLowerCase() === 'true';
  var welcome = getAttr('data-welcome', '');
  // Prefer the origin of this script's src, so embedding from any host works
  var scriptSrc = currentScript && currentScript.src ? currentScript.src : '';
  var scriptOriginMatch = scriptSrc.match(/^https?:\/\/[^/]+/i);
  var scriptOrigin = scriptOriginMatch ? scriptOriginMatch[0] : '';
  var urlBase = getAttr('data-host', scriptOrigin || window.location.origin);
  // Ensure absolute URL for self-hosted setups
  if (!/^https?:\/\//i.test(urlBase)) {
    urlBase = scriptOrigin || window.location.origin;
  }

  var qs = '?color=' + encodeURIComponent(color) + '&position=' + encodeURIComponent(position) + '&open=' + (open ? 'true' : 'false');
  if (welcome) qs += '&welcome=' + encodeURIComponent(welcome);
  var iframeSrc = urlBase.replace(/\/$/, '') + '/embed/chat/' + encodeURIComponent(token) + qs;

  // Create container
  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '2147483000';
  container.style.bottom = '16px';
  if (position === 'bottom-left') {
    container.style.left = '16px';
  } else {
    container.style.right = '16px';
  }

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = 'Platovia Chatbot';
  iframe.style.border = '0';
  iframe.style.width = '384px'; // 24rem, matches w-96
  iframe.style.height = open ? '500px' : '64px';
  iframe.style.borderRadius = '12px';
  iframe.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)';
  // Requesting clipboard permission can trigger a Permissions Policy warning
  // on host pages that do not allow it. The widget does not require it,
  // so we omit the permission to avoid noisy console messages.

  // Listen for height sync from embed page
  window.addEventListener('message', function (ev) {
    if (!ev || !ev.data) return;
    try {
      if (ev.data.type === 'platovia:height') {
        var h = parseInt(ev.data.height, 10);
        if (!isNaN(h) && h > 40 && h < 900) {
          iframe.style.height = h + 'px';
        }
      }
    } catch (e) {}
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
})();


