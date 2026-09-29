// Selector de idioma (español / inglés), formulario de contacto por correo y animaciones.
(function () {
  var d = document.documentElement;
  function set(l) {
    d.setAttribute('data-lang', l);
    d.lang = l === 'en' ? 'en' : 'es-MX';
    var t = d.getAttribute('data-title-' + l);
    if (t) document.title = t;
    var imgs = document.querySelectorAll('[data-alt-en]');
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i];
      if (!im.hasAttribute('data-alt-es')) im.setAttribute('data-alt-es', im.alt);
      im.alt = im.getAttribute('data-alt-' + l);
    }
    var ops = document.querySelectorAll('option[data-en]');
    for (var j = 0; j < ops.length; j++) ops[j].textContent = ops[j].getAttribute('data-' + l);
    try { localStorage.setItem('wt-lang', l); } catch (e) {}
  }
  var q = new URLSearchParams(location.search).get('lang'), s = null;
  try { s = localStorage.getItem('wt-lang'); } catch (e) {}
  set(q === 'en' || q === 'es' ? q : (s || 'es'));

  // Animaciones solo si la persona no pidió reducir el movimiento.
  // Se activan aquí, antes de pintar la página, para que no parpadee.
  var motion = window.matchMedia && matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (motion) d.classList.add('anim');

  document.addEventListener('DOMContentLoaded', function () {
    set(d.getAttribute('data-lang'));
    var b = document.getElementById('lang-toggle');
    if (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        set(d.getAttribute('data-lang') === 'en' ? 'es' : 'en');
      });
    }
    var f = document.getElementById('contact-form');
    if (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = f.elements.nombre.value.trim();
        var topic = f.elements.tema.options[f.elements.tema.selectedIndex].text;
        var msg = f.elements.mensaje.value.trim();
        var body = msg + (name ? '\n\n— ' + name : '');
        location.href = f.getAttribute('data-mailto') +
          '?subject=' + encodeURIComponent('Wallas Transcribe: ' + topic) +
          '&body=' + encodeURIComponent(body);
      });
    }

    // Borde del encabezado al desplazarse
    var h = document.querySelector('.site-header');
    if (h) {
      var onScroll = function () { h.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (!motion) return;

    // Portada: la nota de voz se convierte en texto (una vez, menos de 5 segundos)
    var demo = document.getElementById('demo'), play = null;
    if (demo) {
      var ps = demo.querySelectorAll('.words');
      for (var p = 0; p < ps.length; p++) {
        var words = ps[p].textContent.trim().split(/\s+/);
        ps[p].textContent = '';
        for (var w = 0; w < words.length; w++) {
          var sp = document.createElement('span');
          sp.textContent = words[w];
          sp.style.setProperty('--w', w);
          ps[p].appendChild(sp);
          ps[p].appendChild(document.createTextNode(' '));
        }
      }
      play = function () {
        demo.classList.remove('play');
        void demo.offsetWidth;
        demo.classList.add('play');
      };
      var rb = document.getElementById('demo-replay');
      if (rb) rb.addEventListener('click', play);
    }

    // Aparición suave de las secciones al llegar a ellas
    var show = function (el) {
      if (el.classList.contains('in')) return;
      el.classList.add('in');
      if (play && el.contains(demo)) play();
    };
    var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var check = function () {
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { show(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', check);
        window.removeEventListener('resize', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    // Si alguien llega con el teclado a algo que aún no aparece, se muestra de inmediato
    document.addEventListener('focusin', function (e) {
      var r = e.target.closest && e.target.closest('.reveal');
      if (r) show(r);
    });

  });
})();
