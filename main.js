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

    let slideWidth = slides[0] ? slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 20) : 0;
    let currentIndex = 0;

    // create indicators
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'carousel__indicator';
      btn.dataset.index = i;
      if (i === 0) btn.classList.add('active');
      indicatorsContainer.appendChild(btn);
      btn.addEventListener('click', () => goTo(i));
    });

    function setPosition() {
      slideWidth = slides[0] ? slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 20) : 0;
      moveToIndex(currentIndex, false);
    }

    function moveToIndex(index, animate = true) {
      const maxIndex = Math.max(0, slides.length - 1);
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      const x = -currentIndex * slideWidth;
      if (!animate) track.style.transition = 'none';
      else track.style.transition = '';
      track.style.transform = `translateX(${x}px)`;
      updateIndicators();
      // restore transition
      if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });
    }

    function updateIndicators(){
      Array.from(indicatorsContainer.children).forEach((b,i) => {
        b.classList.toggle('active', i === currentIndex);
      });
    }

    function prev(){ moveToIndex(currentIndex - 1) }
    function next(){ moveToIndex(currentIndex + 1) }
    function goTo(i){ moveToIndex(i) }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // make track draggable (desktop / touch)
    let pointerDown = false, startX = 0, currentTranslate = 0;
    track.addEventListener('pointerdown', function(e){
      pointerDown = true;
      startX = e.clientX;
      currentTranslate = -currentIndex * slideWidth;
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
      if (Math.abs(delta) > (slideWidth / 5)) {
        if (delta < 0) next(); else prev();
      } else {
        moveToIndex(currentIndex);
      }
    });
    track.addEventListener('pointercancel', function(){ pointerDown = false; moveToIndex(currentIndex) });

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

});


// Botão de troca de tema
const toggleThemeBtn = document.getElementById('toggleTheme');

// Aplica o tema salvo
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    toggleThemeBtn.textContent = '🌙';
  }
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  toggleThemeBtn.textContent = isDark ? '🌙' : '🌞';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
