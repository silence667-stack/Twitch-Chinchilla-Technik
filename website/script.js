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

  // Zufaelligen Fakt aus derselben Datenbank laden, die auch der Chatbot nutzt.
  function loadFact(elementId, name, count) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var n = Math.floor(Math.random() * count) + 1;
    fetch('../fakten/' + name + '/' + n + '.txt')
      .then(function (res) { return res.ok ? res.text() : null; })
      .then(function (text) { if (text) el.textContent = text.trim(); })
      .catch(function () { /* Fallback-Text im HTML bleibt stehen */ });
  }
  loadFact('chin-fakt', 'chinchilla', 109);
  loadFact('retro-fakt', 'retro', 331);
})();
