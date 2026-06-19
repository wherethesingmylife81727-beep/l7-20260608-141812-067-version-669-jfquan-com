document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mainNav = document.querySelector("[data-main-nav]");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const yearSelect = document.querySelector("[data-year-filter]");
  const cards = Array.from(document.querySelectorAll("[data-title][data-meta]"));
  const emptyResult = document.querySelector("[data-empty-result]");

  function filterCards() {
    const query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).find(Boolean) || "";

    const year = yearSelect ? yearSelect.value : "";
    let visibleCount = 0;

    cards.forEach(function (card) {
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const meta = (card.getAttribute("data-meta") || "").toLowerCase();
      const matchesQuery = !query || title.includes(query) || meta.includes(query);
      const matchesYear = !year || meta.includes(year);
      const isVisible = matchesQuery && matchesYear;

      card.style.display = isVisible ? "" : "none";
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("visible", visibleCount === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", filterCards);
  });

  if (yearSelect) {
    yearSelect.addEventListener("change", filterCards);
  }
});
