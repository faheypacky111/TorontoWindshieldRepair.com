/* main.js v4 — directory filters, event tracking, listing form */
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  // Tracking: calls to a shop, shop website clicks, other buttons
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var shop = a.getAttribute('data-shop') || '';
    if (href.indexOf('tel:') === 0) {
      track('call_click', { shop: shop, link_location: a.getAttribute('data-track') || '', page_path: location.pathname });
    } else if (a.getAttribute('data-out') === 'website') {
      track('website_click', { shop: shop, page_path: location.pathname });
    } else if (a.getAttribute('data-track')) {
      track('button_click', { button: a.getAttribute('data-track'), page_path: location.pathname });
    }
  });

  if (document.body.getAttribute('data-page') === 'thank-you') track('generate_lead', { method: 'listing_form' });

  // Directory filters
  var selects = document.querySelectorAll('select[data-filter]');
  if (selects.length) {
    var cards = document.querySelectorAll('.section .wrap > .shop-rows .shop-row');
    var countEl = document.querySelector('[data-count]');
    var emptyEl = document.querySelector('[data-empty]');
    var apply = function () {
      var area = '', svc = '';
      Array.prototype.forEach.call(selects, function (s) {
        if (s.getAttribute('data-filter') === 'area') area = s.value; else svc = s.value;
      });
      var n = 0;
      Array.prototype.forEach.call(cards, function (c) {
        var ok = (!area || c.getAttribute('data-area') === area) &&
                 (!svc || (' ' + c.getAttribute('data-services') + ' ').indexOf(' ' + svc + ' ') > -1);
        c.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      if (countEl) countEl.textContent = n + (n === 1 ? ' shop' : ' shops');
      if (emptyEl) emptyEl.style.display = n ? 'none' : 'block';
      track('filter_use', { area: area, service: svc });
    };
    Array.prototype.forEach.call(selects, function (s) { s.addEventListener('change', apply); });
  }

  // Listing request form
  Array.prototype.forEach.call(document.querySelectorAll('form[data-quote-form]'), function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var pageField = form.querySelector('input[name="page"]');
    if (pageField) pageField.value = location.pathname;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status'; status.textContent = '';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var endpoint = form.getAttribute('action') || '';
      if (endpoint.indexOf('{{') === 0) {
        status.className = 'form-status is-error';
        status.textContent = 'This form is not connected yet. Please try again later.';
        return;
      }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); window.location.href = form.getAttribute('data-thanks'); })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Send request';
          status.className = 'form-status is-error';
          status.textContent = 'Your request did not send. Check your connection and try again.';
        });
    });
  });
})();
