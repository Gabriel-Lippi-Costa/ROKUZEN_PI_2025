// carrosel.js — versão resiliente para mobile/desktop
(function () {
    function setupCarousel(wrapper) {
      const track = wrapper.querySelector('.cards');
      const prev  = wrapper.querySelector('.prev-button');
      const next  = wrapper.querySelector('.next-button');
      if (!track || !prev || !next) return;
  
      // Passo = largura do card + gap atual (tudo dinâmico)
      const getStep = () => {
        const firstCard = track.querySelector('.card');
        if (!firstCard) return track.clientWidth; // fallback
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.gap || styles.columnGap || 0);
        const cardWidth = firstCard.getBoundingClientRect().width;
        return cardWidth + gap;
      };
  
      let step = getStep();
  
      const recalc = () => { step = getStep(); };
      window.addEventListener('resize', recalc);
      window.addEventListener('orientationchange', recalc);
  
      const scrollByStep = (dir) => {
        track.scrollBy({ left: dir * step, behavior: 'smooth' });
      };
  
      prev.addEventListener('click', () => scrollByStep(-1));
      next.addEventListener('click', () => scrollByStep(1));
  
      // Acessibilidade por teclado (opcional)
      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  scrollByStep(-1);
        if (e.key === 'ArrowRight') scrollByStep(1);
      });
    }
  
    // Inicializa cada carrossel da página
    document.querySelectorAll('.carousel-wrapper').forEach(setupCarousel);
  })();
  