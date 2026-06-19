(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');
    var searchForm = document.querySelector('.site-search');

    if (navToggle && navMenu && searchForm) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
            searchForm.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function () {
            var input = form.querySelector('input[name="q"]');
            if (input) {
                input.value = input.value.trim();
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterGrid = document.querySelector('[data-filter-grid]');
    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        var filterCards = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchQuery = !query || search.indexOf(query) !== -1;
                var matchYear = !yearValue || cardYear === yearValue;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        };

        if (input) {
            input.addEventListener('input', filterCards);
        }
        if (year) {
            year.addEventListener('change', filterCards);
        }
        filterCards();
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var hlsInstance = null;

        var loadAndPlay = function () {
            if (!video) {
                return;
            }

            var source = video.getAttribute('data-video-source');
            if (!source) {
                return;
            }

            if (video.getAttribute('data-loaded') !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute('data-loaded', 'true');
            }

            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', loadAndPlay);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video && video.getAttribute('data-loaded') !== 'true') {
                loadAndPlay();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
