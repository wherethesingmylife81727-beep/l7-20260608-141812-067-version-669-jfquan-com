(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function applyFilter(input) {
        var q = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search-keywords"));
            var match = !q || text.indexOf(q) !== -1;
            card.style.display = match ? "" : "none";
            if (match) {
                visible += 1;
            }
        });
        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var pageInput = document.querySelector("[data-search-input]");
        var localInput = document.querySelector("[data-local-search]");
        if (pageInput) {
            pageInput.value = query;
            applyFilter(pageInput);
            pageInput.addEventListener("input", function () {
                applyFilter(pageInput);
            });
        }
        if (localInput) {
            localInput.addEventListener("input", function () {
                applyFilter(localInput);
            });
        }
    }

    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector("[data-play-cover]");
        if (!video || !src) {
            return;
        }
        var loaded = false;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
