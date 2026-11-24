/* consent.js v1 — GA4 with Consent Mode v2. GA loads only after {{GA4_ID}} is replaced. */
(function () {
  var GA4_ID = 'G-H1KH9JW7RB';
  var KEY = 'tw_consent';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  gtag('consent', 'default', {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    wait_for_update: 500
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'granted') applyConsent(true);

  if (GA4_ID.indexOf('{{') !== 0) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }

  function applyConsent(granted) {
    var v = granted ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v });
  }

  function save(granted) {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) {}
    applyConsent(granted);
    var b = document.getElementById('tw-consent');
    if (b) b.parentNode.removeChild(b);
  }

  function showBanner() {
    if (saved === 'granted' || saved === 'denied') return;
    var root = document.documentElement.getAttribute('data-root') || '';
    var b = document.createElement('div');
    b.id = 'tw-consent';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie choices');
    b.innerHTML =
      '<p>We use analytics cookies to see which pages and listings people use. No ads cookies are set unless you accept. ' +
      '<a href="' + root + 'privacy-policy/">Privacy policy</a></p>' +
      '<div class="tw-consent-actions">' +
      '<button type="button" class="tw-btn tw-btn-decline">Decline</button>' +
      '<button type="button" class="tw-btn tw-btn-accept">Accept</button></div>';
    document.body.appendChild(b);
    b.querySelector('.tw-btn-accept').addEventListener('click', function () { save(true); });
    b.querySelector('.tw-btn-decline').addEventListener('click', function () { save(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
  else showBanner();
})();
