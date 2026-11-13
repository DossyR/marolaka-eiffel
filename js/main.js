/**
 * Marolaka Eiffel — interactions de la page.
 * Menu mobile, navigation active, formulaire de réservation, fenêtre de demande,
 * carrousel des chambres, section « Histoire » et images de remplacement.
 */
(function () {
  'use strict';

  var MOBILE_MENU_BREAKPOINT = 850;

  document.addEventListener('DOMContentLoaded', function () {
    initImageFallbacks();
    initHeroSlideshow();
    initMobileMenu();
    initActiveNavigation();
    initBookingForm();
    initStory();
    initRoomsCarousel();
  });

  /* ---------- Images : emplacement neutre si la photo ne se charge pas ---------- */
  function initImageFallbacks() {
    function usePlaceholder(img) {
      var placeholder = img.getAttribute('data-placeholder');
      if (!placeholder || img.getAttribute('src') === placeholder) return;
      img.setAttribute('src', placeholder);
      img.classList.add('is-placeholder');
    }

    document.querySelectorAll('img[data-placeholder]').forEach(function (img) {
      img.addEventListener('error', function () { usePlaceholder(img); });
      var isLazy = img.getAttribute('loading') === 'lazy';
      if (!isLazy && img.complete && img.naturalWidth === 0) usePlaceholder(img);
    });

    // Fond de l'encart « Prêt pour l'évasion ? » (image définie dans le CSS)
    var escape = document.querySelector('.escape');
    if (escape) {
      var match = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(escape).backgroundImage);
      if (match) {
        var probe = new Image();
        probe.onerror = function () {
          escape.style.backgroundImage = 'url("assets/images/placeholder-escape-leaves.svg")';
        };
        probe.src = match[1];
      }
    }
  }

  /* ---------- Diaporama de la bannière ----------
     Chaque photo reste affichée 5 s, puis fondu enchaîné de 1,5 s vers la suivante, en boucle.
     La nouvelle photo apparaît au-dessus de l'ancienne, qui reste visible jusqu'à la fin du fondu :
     jamais d'écran noir. Les photos 2 et 3 sont chargées après la page, et une photo n'est affichée
     qu'une fois entièrement prête. Pause automatique quand la bannière ou l'onglet n'est plus visible.
     Si l'appareil demande moins d'animations, la première photo reste fixe. */
  function initHeroSlideshow() {
    var root = document.querySelector('[data-hero-slideshow]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero__slide'));
    if (slides.length < 2) return;

    var DISPLAY = 5000;
    var FADE = 1500;
    var reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var current = 0;
    var timer = null;
    var started = false;
    var heroVisible = true;

    function decode(img) {
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    }

    function load(img) {
      if (img.getAttribute('data-src')) {
        var source = img.parentNode.querySelector('source[data-srcset]');
        if (source) {
          source.srcset = source.getAttribute('data-srcset');
          source.removeAttribute('data-srcset');
        }
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      }
      if (img.complete && img.naturalWidth) return decode(img);
      return new Promise(function (resolve, reject) {
        img.addEventListener('load', function () { decode(img).then(resolve); }, { once: true });
        img.addEventListener('error', reject, { once: true });
      });
    }

    function zoom(img) {
      img.classList.remove('is-zooming');
      void img.offsetWidth; // relance l'animation de zoom depuis le début
      img.classList.add('is-zooming');
    }

    function show(index) {
      var previous = slides[current];
      var next = slides[index];
      slides.forEach(function (slide) { slide.classList.remove('is-previous'); });
      previous.classList.remove('is-active');
      previous.classList.add('is-previous');
      zoom(next);
      next.classList.add('is-active');
      current = index;
      window.setTimeout(function () {
        previous.classList.remove('is-previous', 'is-zooming');
      }, FADE + 50);
    }

    function schedule(delay) {
      window.clearTimeout(timer);
      timer = window.setTimeout(advance, delay);
    }

    function advance() {
      timer = null;
      var index = (current + 1) % slides.length;
      load(slides[index]).then(function () {
        if (!isRunning()) return;
        show(index);
        load(slides[(index + 1) % slides.length]).catch(function () {}); // prépare la suivante
        schedule(FADE + DISPLAY);
      }, function () {
        // photo introuvable : on la retire du diaporama et on continue avec les autres
        slides[index].parentNode.removeChild(slides[index]);
        slides.splice(index, 1);
        if (index < current) current -= 1;
        if (slides.length > 1) schedule(0);
      });
    }

    function isRunning() {
      return started && heroVisible && !document.hidden && !reducedMotion.matches;
    }

    function update() {
      var running = isRunning();
      root.classList.toggle('is-paused', !running);
      if (!running) { window.clearTimeout(timer); timer = null; return; }
      if (!timer) schedule(DISPLAY);
    }

    function start() {
      if (reducedMotion.matches) return;
      started = true;
      zoom(slides[0]);
      load(slides[1]).catch(function () {});
      update();
    }

    document.addEventListener('visibilitychange', update);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', update);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        update();
      }).observe(root);
    }

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var navigation = document.getElementById('main-navigation');
    if (!button || !navigation) return;

    function setOpen(open) {
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      navigation.classList.toggle('navigation--open', open);
    }

    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    navigation.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navigation.classList.contains('navigation--open')) {
        setOpen(false);
        button.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!navigation.classList.contains('navigation--open')) return;
      if (navigation.contains(event.target) || button.contains(event.target)) return;
      setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE_MENU_BREAKPOINT) setOpen(false);
    });
  }

  /* ---------- Lien actif du menu selon la section visible ---------- */
  function initActiveNavigation() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.navigation__link'));
    var linkByTarget = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      if (!linkByTarget[id]) linkByTarget[id] = link;
    });

    var sections = Object.keys(linkByTarget)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function setActive(link) {
      links.forEach(function (item) {
        var active = item === link;
        item.classList.toggle('navigation__link--active', active);
        if (active) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    }

    // Section choisie au clic : elle reste active jusqu'à ce que le visiteur fasse défiler lui-même la page
    // (sur grand écran, les dernières sections ne peuvent pas remonter jusqu'en haut de la fenêtre).
    var clickedId = null;
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        clickedId = link.getAttribute('href').slice(1);
        setActive(linkByTarget[clickedId]);
      });
    });
    ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
      window.addEventListener(type, function () { clickedId = null; }, { passive: true });
    });

    var ticking = false;
    function update() {
      ticking = false;
      if (clickedId) { setActive(linkByTarget[clickedId]); return; }
      var marker = window.innerHeight * 0.35;
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker &&
            section.getBoundingClientRect().top >= current.getBoundingClientRect().top) {
          current = section;
        }
      });
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && linkByTarget.contact) current = document.getElementById('contact');
      if (window.scrollY < 10) current = document.getElementById('accueil') || current;
      setActive(linkByTarget[current.id]);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Formulaire de réservation ---------- */
  function initBookingForm() {
    var form = document.getElementById('booking-form');
    var dialog = document.getElementById('reservation-dialog');
    if (!form || !window.BookingService) return;
    form.noValidate = true; // messages en français gérés ci-dessous

    var arrival = document.getElementById('arrival');
    var departure = document.getElementById('departure');
    var guests = document.getElementById('guests');

    function isoDate(date) {
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    function displayValue(input) {
      var display = input.parentNode.querySelector('.booking__value');
      if (!display) return;
      if (input.value) {
        var parts = input.value.split('-');
        display.textContent = parts[2] + '/' + parts[1] + '/' + parts[0];
      } else {
        display.textContent = display.getAttribute('data-empty');
      }
    }

    function openPicker(event) {
      var input = event.currentTarget;
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch (error) { /* le navigateur ouvre son propre sélecteur */ }
      }
    }

    var today = new Date();
    arrival.min = isoDate(today);
    var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    departure.min = isoDate(tomorrow);

    [arrival, departure].forEach(function (input) {
      input.addEventListener('click', openPicker);
      input.addEventListener('input', function () { input.setCustomValidity(''); displayValue(input); });
      input.addEventListener('change', function () { displayValue(input); });
      displayValue(input); // valeur restaurée par le navigateur (retour arrière)
    });

    arrival.addEventListener('change', function () {
      if (!arrival.value) return;
      var next = new Date(arrival.value + 'T12:00:00');
      next.setDate(next.getDate() + 1);
      departure.min = isoDate(next);
      if (departure.value && departure.value <= arrival.value) {
        departure.value = '';
        displayValue(departure);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var request = {
        arrival: arrival.value,
        departure: departure.value,
        guests: Number(guests.value),
        guestsLabel: guests.selectedOptions[0].text
      };

      var error = window.BookingService.validate(request);
      if (error) {
        var field = document.getElementById(error.field);
        field.setCustomValidity(error.message);
        field.reportValidity();
        return;
      }

      window.BookingService.submit(request).then(function (result) {
        if (result.type === 'redirect') { window.location.href = result.url; return; }
        document.getElementById('reservation-summary').textContent = result.summary;
        document.getElementById('reservation-email').href = result.emailHref;
        document.getElementById('reservation-phone').href = result.phoneHref;
        openDialog(dialog);
      });
    });

    initDialog(dialog);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function initDialog(dialog) {
    if (!dialog) return;
    function close() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
    dialog.querySelector('.reservation-dialog__close').addEventListener('click', close);
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) close();
    });
  }

  /* ---------- « Découvrir notre histoire » ---------- */
  function initStory() {
    var button = document.getElementById('story-more');
    var detail = document.getElementById('story-detail');
    if (!button || !detail) return;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      detail.hidden = !detail.hidden;
      button.setAttribute('aria-expanded', String(!detail.hidden));
    });
  }

  /* ---------- Carrousel des chambres ---------- */
  function initRoomsCarousel() {
    var list = document.getElementById('room-list');
    var prev = document.getElementById('rooms-prev');
    var next = document.getElementById('rooms-next');
    var toggle = document.getElementById('view-rooms');
    if (!list) return;

    function step() {
      var card = list.querySelector('.room-card');
      var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : list.clientWidth;
    }

    function atStart() { return list.scrollLeft <= 1; }
    function atEnd() { return list.scrollLeft + list.clientWidth >= list.scrollWidth - 2; }

    if (prev) prev.addEventListener('click', function () {
      if (atStart()) list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' });
      else list.scrollBy({ left: -step(), behavior: 'smooth' });
    });

    if (next) next.addEventListener('click', function () {
      if (atEnd()) list.scrollTo({ left: 0, behavior: 'smooth' });
      else list.scrollBy({ left: step(), behavior: 'smooth' });
    });

    list.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' && next) { event.preventDefault(); next.click(); }
      if (event.key === 'ArrowLeft' && prev) { event.preventDefault(); prev.click(); }
    });

    if (toggle) toggle.addEventListener('click', function () {
      var expanded = list.classList.toggle('rooms__list--expanded');
      list.scrollLeft = 0;
      toggle.textContent = expanded ? 'Réduire les chambres' : 'Voir toutes les chambres';
      toggle.setAttribute('aria-expanded', String(expanded));
    });
  }
})();
