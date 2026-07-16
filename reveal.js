/* Transform-only scroll reveals. JS applies the initial offset, so without JS
   (or with reduced motion) the page is fully static and nothing is ever hidden. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = document.querySelectorAll('.offer, .path, .work-card, .bio, .price-card, .figure, .steps li');
  if (!('IntersectionObserver' in window) || !els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('r-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el, i) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return; // already in view: leave static
    el.classList.add('r-init');
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
    io.observe(el);
  });
})();
