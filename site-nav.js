/**
 * Shared site chrome: mobile nav drawer.
 * Include after the navbar markup on each marketing page.
 */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  function isDrawer() {
    return window.matchMedia('(max-width: 1100px)').matches;
  }

  function setDrawerOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    links.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    setDrawerOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', function (event) {
    if (isDrawer() && links.classList.contains('open')) {
      var inNav = links.contains(event.target) || toggle.contains(event.target);
      if (!inNav) setDrawerOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isDrawer()) setDrawerOpen(false);
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (isDrawer()) setDrawerOpen(false);
    });
  });

  window.addEventListener('resize', function () {
    if (!isDrawer()) setDrawerOpen(false);
  });

  // Expose close for inquiry modal / other overlays
  window.SiteLayout = window.SiteLayout || {};
  window.SiteLayout.navApi = { closeMobileNav: function () { setDrawerOpen(false); } };
})();
