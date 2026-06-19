(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setImageFallbacks() {
    document.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.parentElement;
        if (parent) {
          parent.classList.add('image-missing');
        }
        image.style.display = 'none';
      }, { once: true });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initLocalFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    if (!grids.length) {
      return;
    }

    var searchInput = document.querySelector('[data-local-search]');
    var typeSelect = document.querySelector('[data-local-type]');
    var resultCount = document.querySelector('[data-result-count]');

    if (searchInput) {
      var query = new URLSearchParams(window.location.search).get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    function filter() {
      var term = normalize(searchInput ? searchInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var totalVisible = 0;

      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchesTerm = !term || haystack.indexOf(term) !== -1;
          var matchesType = !type || cardType.indexOf(type) !== -1;
          var visible = matchesTerm && matchesType;
          card.classList.toggle('is-hidden', !visible);
          if (visible) {
            totalVisible += 1;
          }
        });
      });

      if (resultCount) {
        resultCount.textContent = totalVisible + ' 部';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', filter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', filter);
    }
    filter();
  }

  ready(function () {
    setImageFallbacks();
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
  });
})();
