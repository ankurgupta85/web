/**
 * DailyDotKids marketing analytics.
 * Set GA4_MEASUREMENT_ID below (G-XXXXXXXX) to enable Google Analytics 4.
 * Events still push to window.dataLayer when the ID is empty (for future GTM).
 */
(function (global) {
    var GA4_MEASUREMENT_ID = ''; // e.g. 'G-XXXXXXXXXX'

    var dataLayer = (global.dataLayer = global.dataLayer || []);

    function gtag() {
        dataLayer.push(arguments);
    }

    function track(eventName, params) {
        var payload = params || {};
        dataLayer.push(Object.assign({ event: eventName }, payload));
        if (GA4_MEASUREMENT_ID && typeof global.gtag === 'function') {
            global.gtag('event', eventName, payload);
        }
    }

    function initGa4() {
        if (!GA4_MEASUREMENT_ID) return;
        global.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true, send_page_view: true });

        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
        document.head.appendChild(s);
    }

    function bindStoreBadges() {
        document.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a.store-badge');
            if (!link) return;
            var href = link.getAttribute('href') || '';
            var store = /apps\.apple\.com/i.test(href)
                ? 'app_store'
                : /play\.google\.com/i.test(href)
                  ? 'google_play'
                  : 'other';
            var app = /admin/i.test(href)
                ? 'admin'
                : /teacher/i.test(href)
                  ? 'teacher'
                  : /parent/i.test(href)
                    ? 'parent'
                    : 'unknown';
            track('store_badge_click', {
                store: store,
                app: app,
                link_url: href,
                page_path: global.location.pathname,
            });
        });
    }

    function bindSignupForms() {
        document.addEventListener(
            'submit',
            function (event) {
                var form = event.target;
                if (!form || !form.classList) return;
                var isSignup =
                    form.classList.contains('pilot-signup-form') || form.id === 'inquiry-form';
                if (!isSignup) return;
                track('signup_submit', {
                    form_id: form.id || 'pilot-signup-form',
                    page_path: global.location.pathname,
                });
            },
            true
        );
    }

    function bindStartFreeCtas() {
        document.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a');
            if (!link) return;
            var href = link.getAttribute('href') || '';
            if (href.indexOf('apps.html#admin-app') === -1 && !link.classList.contains('nav-cta')) {
                return;
            }
            track('start_free_click', {
                link_url: href,
                page_path: global.location.pathname,
            });
        });
    }

    function boot() {
        initGa4();
        bindStoreBadges();
        bindSignupForms();
        bindStartFreeCtas();
        postFirstPartyPageView();
        global.DDK = global.DDK || {};
        global.DDK.track = track;
    }

    function sessionId() {
        try {
            var key = 'ddk_sid';
            var existing = global.sessionStorage && global.sessionStorage.getItem(key);
            if (existing) return existing;
            var id = 's' + Math.random().toString(36).slice(2) + Date.now().toString(36);
            if (global.sessionStorage) global.sessionStorage.setItem(key, id);
            return id;
        } catch (e) {
            return null;
        }
    }

    function apiBase() {
        // Prefer override; fall back to App Engine prod (same host as mobile apps).
        return global.DDK_API_BASE || 'https://dailydot-prod.nn.r.appspot.com';
    }

    function postFirstPartyPageView() {
        try {
            var params = new URLSearchParams(global.location.search || '');
            var body = {
                path: global.location.pathname + (global.location.search || ''),
                referrer: document.referrer || '',
                utmSource: params.get('utm_source') || params.get('src') || '',
                utmMedium: params.get('utm_medium') || '',
                utmCampaign: params.get('utm_campaign') || '',
                eventName: 'page_view',
                sessionId: sessionId(),
            };
            // fire-and-forget; never block the page
            if (global.fetch) {
                global.fetch(apiBase() + '/api/public/website-page-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    keepalive: true,
                    mode: 'cors',
                }).catch(function () {});
            }
        } catch (e) {
            // ignore
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
