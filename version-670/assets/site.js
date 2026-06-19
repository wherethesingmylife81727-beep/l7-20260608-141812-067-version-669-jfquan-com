document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHero();
  initFilters();
  initPlayers();
});

function initMobileMenu() {
  var button = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function initHero() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("mouseenter", function () {
      var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
      if (!Number.isNaN(index)) {
        show(index);
      }
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }
}

function initFilters() {
  var grid = document.querySelector("[data-grid]");
  var searchInput = document.querySelector("[data-card-search]");
  var regionSelect = document.querySelector("[data-region-filter]");
  var typeSelect = document.querySelector("[data-type-filter]");
  var sortSelect = document.querySelector("[data-sort-filter]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (!grid) {
    return;
  }

  var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  function haystack(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function apply() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var region = regionSelect ? regionSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = haystack(card);
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesRegion = !region || (card.getAttribute("data-region") || "").indexOf(region) !== -1;
      var matchesType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
      var visible = matchesQuery && matchesRegion && matchesType;
      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("visible", visibleCount === 0);
    }
  }

  function sortCards() {
    if (!sortSelect) {
      return;
    }

    var value = sortSelect.value;
    var sorted = cards.slice();

    if (value === "year-desc") {
      sorted.sort(function (a, b) {
        return parseInt(b.getAttribute("data-year") || "0", 10) - parseInt(a.getAttribute("data-year") || "0", 10);
      });
    }

    if (value === "year-asc") {
      sorted.sort(function (a, b) {
        return parseInt(a.getAttribute("data-year") || "0", 10) - parseInt(b.getAttribute("data-year") || "0", 10);
      });
    }

    if (value === "title") {
      sorted.sort(function (a, b) {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      });
    }

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  [searchInput, regionSelect, typeSelect].forEach(function (element) {
    if (element) {
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    }
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortCards();
      apply();
    });
  }

  apply();
}

function initPlayers() {
  var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-shell]"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    var isReady = false;
    var player = null;

    function attachSource() {
      var source = video.getAttribute("data-src");

      if (!source || isReady) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        isReady = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(source);
        player.attachMedia(video);
        isReady = true;
        return;
      }

      video.src = source;
      isReady = true;
    }

    function start() {
      attachSource();
      button.classList.add("hidden");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", start);

    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  });
}
