/* pie.js — la marca del pie se quema a fuego mientras bajas.
   · En escritorio la pared (main) se levanta y descubre la tabla, pegada abajo: el
     avance de la quema es cuánto se ha descubierto.
   · En móvil el pie entra con el scroll normal: el avance es cuánto se ve de la marca.
   · Con «reducir movimiento» (o sin JS) la marca ya está quemada y el esqueje fuera. */
(() => {
  const pie = document.querySelector('.pie');
  const marca = pie?.querySelector('.quemado');
  const main = document.querySelector('main');
  if (!pie || !marca || !main) return;
  const o = marca.querySelector('.quemado__o');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v) => Math.min(1, Math.max(0, v));

  // dónde cae la «o», para el agujero y el esqueje (cambia con la fuente y el ancho)
  function medir() {
    const rm = marca.getBoundingClientRect();
    const ro = o.getBoundingClientRect();
    marca.style.setProperty('--ox', `${(ro.left - rm.left + ro.width / 2).toFixed(1)}px`);
    // el ojo de la «o» queda a media altura de x, no en el centro de la caja de línea
    marca.style.setProperty('--oy', `${(ro.bottom - rm.top - ro.height * 0.42).toFixed(1)}px`);
    marca.style.setProperty('--ow', `${ro.width.toFixed(1)}px`);
  }

  function avance() {
    const alto = innerHeight;
    if (getComputedStyle(pie).position === 'sticky') {
      const descubierto = alto - main.getBoundingClientRect().bottom;
      return clamp((descubierto / Math.min(pie.offsetHeight, alto) - 0.12) / 0.78);
    }
    const r = marca.getBoundingClientRect();
    return clamp((alto - r.top - r.height * 0.1) / (r.height * 0.9));
  }

  let pendiente = false;
  function pintar() {
    pendiente = false;
    const q = quieto.matches ? 1 : avance();
    const ardor = q > 0 && q < 1 ? Math.min(1, q * 12, (1 - q) * 10) : 0;
    marca.style.setProperty('--q', q.toFixed(4));
    pie.style.setProperty('--ardor', ardor.toFixed(3));
    marca.style.setProperty('--ardor', ardor.toFixed(3));
    // el resplandor de la tabla sigue al frente del fuego
    const rm = marca.getBoundingClientRect(), rp = pie.getBoundingClientRect();
    const x = rm.left - rp.left + rm.width * (q * 1.18 - 0.09);
    pie.style.setProperty('--x-pie', `${((x / rp.width) * 100).toFixed(1)}%`);
    marca.classList.toggle('ardiendo', ardor > 0.05);
    marca.classList.toggle('brotado', q >= 0.995);
  }
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };

  medir();
  pintar();
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', () => { medir(); pedir(); });
  document.fonts?.ready.then(() => { medir(); pedir(); });
  quieto.addEventListener?.('change', pedir);
})();
