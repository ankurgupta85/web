/**
 * Shared site chrome: mobile nav + Compare submenu.
 * Include after the navbar markup on each marketing page.
 */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    links.classList.toggle('open', !open);
    document.body.classList.toggle('nav-open', !open);
  });

  var compareItem = links.querySelector('.nav-item-has-children');
  if (!compareItem) return;

  var parentLink = compareItem.querySelector('.nav-parent');
  if (!parentLink) return;

  parentLink.addEventListener('click', function (event) {
    // On narrow viewports, first tap expands submenu; second tap (or "All comparisons") navigates.
    if (window.matchMedia('(max-width: 1100px)').matches) {
      if (!compareItem.classList.contains('is-open')) {
        event.preventDefault();
        compareItem.classList.add('is-open');
      }
    }
  });

  document.addEventListener('click', function (event) {
    if (!compareItem.contains(event.target)) {
      compareItem.classList.remove('is-open');
    }
  });
})();
