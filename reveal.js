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

/* Apple-design interaction layer.
   Press feedback fires on pointerdown (not release) and cancels if the finger
   travels more than ~10px, so a scroll that starts on a button never reads as
   a tap. The scroll flag drives the header's edge effect. */
(function () {
  var PRESSABLE = '.btn,.nav-cta,.nav-phone,.path,.work-card,.resource-card,.offer,' +
                  'details.faq summary,.sticky-cta-close';
  var target = null, startX = 0, startY = 0;

  function release() {
    if (target) { target.classList.remove('is-pressed'); target = null; }
  }

  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest(PRESSABLE);
    if (!el) return;
    target = el; startX = e.clientX; startY = e.clientY;
    el.classList.add('is-pressed');
  }, { passive: true });

  document.addEventListener('pointermove', function (e) {
    if (!target) return;
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) release();
  }, { passive: true });

  ['pointerup', 'pointercancel', 'blur'].forEach(function (ev) {
    window.addEventListener(ev, release, { passive: true });
  });

  var scrolled = false;
  addEventListener('scroll', function () {
    var on = scrollY > 8;
    if (on !== scrolled) { scrolled = on; document.body.classList.toggle('scrolled', on); }
  }, { passive: true });
})();
