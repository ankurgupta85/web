/**
 * Shared site chrome: mobile nav + Compare submenu.
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

  toggle.addEventListener('click', function () {
    setDrawerOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  var compareItem = links.querySelector('.nav-item-has-children');
  if (!compareItem) return;

  var parentLink = compareItem.querySelector('.nav-parent');
  if (!parentLink) return;

  parentLink.setAttribute('aria-haspopup', 'true');
  parentLink.setAttribute('aria-expanded', 'false');

  var closeTimer = null;

  function setCompareOpen(open) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    compareItem.classList.toggle('is-open', open);
    parentLink.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function scheduleCompareClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      setCompareOpen(false);
    }, 180);
  }

  parentLink.addEventListener('click', function (event) {
    // Toggle the menu; hub page is "All comparisons" in the list.
    event.preventDefault();
    event.stopPropagation();
    setCompareOpen(!compareItem.classList.contains('is-open'));
  });

  // Desktop: open on hover with a short leave delay so the pointer can reach the panel.
  compareItem.addEventListener('mouseenter', function () {
    if (!isDrawer()) setCompareOpen(true);
  });

  compareItem.addEventListener('mouseleave', function () {
    if (!isDrawer()) scheduleCompareClose();
  });

  document.addEventListener('click', function (event) {
    if (!compareItem.contains(event.target)) {
      setCompareOpen(false);
    }
    if (isDrawer() && links.classList.contains('open')) {
      var inNav = links.contains(event.target) || toggle.contains(event.target);
      if (!inNav) setDrawerOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setCompareOpen(false);
      if (isDrawer()) setDrawerOpen(false);
    }
  });

  compareItem.querySelectorAll('.nav-submenu a').forEach(function (link) {
    link.addEventListener('click', function () {
      setCompareOpen(false);
    });
  });
})();
