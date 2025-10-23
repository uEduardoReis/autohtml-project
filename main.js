// main.js
document.addEventListener('DOMContentLoaded', function () {

  // Prevent real submission for demo search form
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="search"]');
      const val = input ? input.value.trim() : '';
      if (!val) {
        input.focus();
      } else {
        // aqui você poderia redirecionar para a página de busca
        alert('Procurando por: ' + val);
      }
    });
  }

  // Simple carousel initializer for each .carousel
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));

  carousels.forEach(initCarousel);

  function initCarousel(carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.carousel__button--prev');
    const nextBtn = carousel.querySelector('.carousel__button--next');
    const indicatorsContainer = carousel.querySelector('.carousel__indicators');

    // slidesPerPage: prefer dataset override, fallback to responsive logic
    function computeSlidesPerPage() {
      const override = parseInt(carousel.dataset.slidesPerPage, 10);
      if (!Number.isNaN(override) && override > 0) return override;
      const w = window.innerWidth;
      if (w >= 1100) return 3;
      if (w >= 700) return 2;
      return 1;
    }

    let slidesPerPage = computeSlidesPerPage();
    let slideWidth = slides[0] ? slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 20) : 0;
    let currentPage = 0;

    // create indicators (now pages = ceil(total / slidesPerPage))
    function buildIndicators() {
      indicatorsContainer.innerHTML = '';
      const pages = Math.max(1, Math.ceil(slides.length / slidesPerPage));
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement('button');
        btn.className = 'carousel__indicator';
        btn.dataset.page = i;
        if (i === 0) btn.classList.add('active');
        indicatorsContainer.appendChild(btn);
        btn.addEventListener('click', () => goToPage(i));
      }
    }

    function setPosition() {
      slidesPerPage = computeSlidesPerPage();
      slideWidth = slides[0] ? slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 20) : 0;
      // rebuild indicators when layout changes (slidesPerPage may have changed)
      buildIndicators();
      moveToPage(currentPage, false);
    }

    function moveToPage(page, animate = true) {
      const pages = Math.max(1, Math.ceil(slides.length / slidesPerPage));
      currentPage = Math.max(0, Math.min(page, pages - 1));
      const x = -currentPage * slidesPerPage * slideWidth;
      if (!animate) track.style.transition = 'none';
      else track.style.transition = '';
      track.style.transform = `translateX(${x}px)`;
      updateIndicators();
      if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });
    }

    function updateIndicators(){
      Array.from(indicatorsContainer.children).forEach((b,i) => {
        b.classList.toggle('active', i === currentPage);
      });
    }

    function prev(){ moveToPage(currentPage - 1) }
    function next(){ moveToPage(currentPage + 1) }
    function goToPage(i){ moveToPage(i) }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // make track draggable (desktop / touch) — swipe moves one page
    let pointerDown = false, startX = 0, currentTranslate = 0;
    track.addEventListener('pointerdown', function(e){
      if (e.target.closest('a, button')) return;
      pointerDown = true;
      startX = e.clientX;
      currentTranslate = -currentPage * slidesPerPage * slideWidth;
      track.style.transition = 'none';
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function(e){
      if (!pointerDown) return;
      const delta = e.clientX - startX;
      track.style.transform = `translateX(${currentTranslate + delta}px)`;
    });
    track.addEventListener('pointerup', function(e){
      if (!pointerDown) return;
      pointerDown = false;
      const delta = e.clientX - startX;
      // threshold relative to a single slide width (feel free to tweak)
      if (Math.abs(delta) > (slideWidth / 5)) {
        if (delta < 0) next(); else prev();
      } else {
        moveToPage(currentPage);
      }
    });
    track.addEventListener('pointercancel', function(){ pointerDown = false; moveToPage(currentPage) });

    // Recalculate on resize
    window.addEventListener('resize', () => {
      setPosition();
    });

    // initial pos
    setPosition();
  }

  // accessibility: keyboard support for carousels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      const focusedCarousel = document.activeElement.closest && document.activeElement.closest('[data-carousel]');
      if (focusedCarousel) {
        const btn = focusedCarousel.querySelector('.carousel__button--prev');
        if (btn) btn.click();
      }
    } else if (e.key === 'ArrowRight') {
      const focusedCarousel = document.activeElement.closest && document.activeElement.closest('[data-carousel]');
      if (focusedCarousel) {
        const btn = focusedCarousel.querySelector('.carousel__button--next');
        if (btn) btn.click();
      }
    }
  });

  // Scroll reveal: apply to all sections (and any element with .reveal-on-scroll)
  (function initScrollReveal() {
    const STAGGER_MS = 80; // change to control spacing between items
    const targets = Array.from(document.querySelectorAll('section, .reveal-on-scroll'));

    if (!targets.length) return;

    // initialize hidden state
    targets.forEach(el => {
      // If element looks like a container (has multiple direct children) we'll
      // add .reveal to each direct child so they can stagger left->right.
      const children = Array.from(el.querySelectorAll(':scope > *'));
      if (children.length > 1) {
        children.forEach((child, i) => {
          if (!child.classList.contains('reveal')) child.classList.add('reveal');
          // default slide direction: from left -> right; override with data attribute if needed
          const direction = el.dataset.revealDirection || 'left'; // 'left'|'right'|'none'
          if (direction === 'left') {
            child.classList.add('reveal-left');
          } else if (direction === 'right') {
            child.classList.add('reveal-right');
          }
          child.style.setProperty('--reveal-delay', `${i * STAGGER_MS}ms`);
        });
        // mark container so observer knows it's a stagger group
        el.dataset._revealGroup = 'true';
      } else {
        // single element reveal: tag the element itself
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
      }
    });

    const onIntersect = (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset._revealGroup === 'true') {
          // reveal the direct children (they already have .reveal + delay set)
          const children = Array.from(el.querySelectorAll(':scope > *'));
          children.forEach(child => child.classList.add('is-visible'));
        } else {
          el.classList.add('is-visible');
        }
        // unobserve to animate once
        obs.unobserve(el);
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(onIntersect, {
        root: null,
        rootMargin: '0px 0px -120px 0px',
        threshold: 0.12
      });
      targets.forEach(t => observer.observe(t));
    } else {
      // fallback: simple on-scroll check (stagger applied immediately)
      const check = () => {
        const h = window.innerHeight;
        targets.forEach(t => {
          const rect = t.getBoundingClientRect();
          if (rect.top < h - 100) {
            if (t.dataset._revealGroup === 'true') {
              Array.from(t.querySelectorAll(':scope > *')).forEach(c => c.classList.add('is-visible'));
            } else {
              t.classList.add('is-visible');
            }
          }
        });
      };
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      check();
    }
  })();

});
