/* medios.js — los vídeos de ambiente.
   · Con «reducir movimiento» no se reproducen: se queda el póster.
   · Fuera de pantalla se pausan (no gastan batería ni CPU). */
(() => {
  const videos = [...document.querySelectorAll('video[autoplay]')];
  if (!videos.length) return;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');

  const reproducir = (v) => v.play().catch(() => {});
  const aplicar = () => videos.forEach((v) => {
    if (quieto.matches) v.pause();
  });

  if (quieto.matches) videos.forEach((v) => v.removeAttribute('autoplay'));
  aplicar();
  quieto.addEventListener('change', () => {
    aplicar();
    if (!quieto.matches) videos.forEach(reproducir);
  });

  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (quieto.matches) continue;
      if (e.isIntersecting) reproducir(e.target); else e.target.pause();
    }
  }, { rootMargin: '200px 0px' });
  videos.forEach((v) => io.observe(v));
})();
