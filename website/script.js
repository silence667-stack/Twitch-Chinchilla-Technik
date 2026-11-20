(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dezentes Pulsieren des "Live"-Punkts, nur wenn Reduce-Motion nicht aktiv ist.
  var dot = document.querySelector('.live-badge .dot');
  if (dot && !prefersReducedMotion) {
    dot.animate(
      [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }],
      { duration: 1800, iterations: Infinity }
    );
  }
})();
