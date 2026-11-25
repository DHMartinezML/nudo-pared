/* mapa.js — la barra de scroll es otro tallo.
   Una enredadera fina en el borde derecho que crece con el avance de la página. A la altura de
   cada sección echa una hojita de la planta de esa sección (las mismas hojas que dibuja
   tallo.js, reutilizadas con <use>). Las hojas son enlaces para saltar a la sección, y la
   barra se puede arrastrar como una barra de scroll normal.
   · Solo en escritorio con ratón; en móvil se queda el scroll nativo.
   · Sin JS no aparece y se ve la barra del navegador. */
(() => {
  const SECCIONES = [
    ['inicio', 'Inicio'], ['que-es', 'Qué es'], ['cuidados', 'Cuidados'], ['agua', 'Raíces en agua'],
    ['rutina', 'Rutina'], ['plantas', 'Plantas'], ['preguntas', 'Preguntas'], ['sobre', 'Gonzalo'], ['pie', 'Contacto'],
  ];
  const NS = 'http://www.w3.org/2000/svg';
  const apto = matchMedia('(min-width: 761px) and (pointer: fine)');
  const doc = document.documentElement;

  const secciones = SECCIONES
    .map(([id, nombre]) => ({ id, nombre, el: document.getElementById(id) }))
    .filter((s) => s.el);
  if (secciones.length < 2) return;

  /* ── el marcado ── */
  const nav = document.createElement('nav');
  nav.className = 'mapa';
  nav.setAttribute('aria-label', 'Recorrido de la página');
  nav.innerHTML = `<svg class="mapa__tallo" aria-hidden="true" focusable="false">
      <path class="mapa__guia"/><path class="mapa__vivo"/><circle class="mapa__punta" r="2.2"/>
    </svg><ol class="mapa__lista"></ol>`;
  const svg = nav.querySelector('svg');
  const guia = nav.querySelector('.mapa__guia');
  const vivo = nav.querySelector('.mapa__vivo');
  const punta = nav.querySelector('.mapa__punta');
  const lista = nav.querySelector('ol');

  secciones.forEach((s, i) => {
    const planta = s.el.closest('[data-planta]')?.dataset.planta
      || s.el.querySelector('[data-planta]')?.dataset.planta || 'poto';
    s.lado = i % 2 ? -1 : 1; // alternas, como en un tallo de verdad
    const li = document.createElement('li');
    li.dataset.lado = s.lado;
    li.innerHTML = `<a class="mapa__nudo" href="#${s.id}">
        <svg class="mapa__hoja" viewBox="${s.lado > 0 ? -4 : -24} -14 28 28" aria-hidden="true" focusable="false">
          <g class="mapa__hoja-giro" style="--lado:${s.lado}">
            ${s.id === 'pie'
              ? '<circle cx="5" cy="0" r="4.2" class="mapa__agujero"/>'
              : `<g transform="scale(${s.lado > 0 ? 15 : -15} 15)"><use href="#limbo-${planta}-0"/></g>`}
          </g>
        </svg>
        <span class="mapa__nombre">${s.nombre}</span>
      </a>`;
    s.li = li;
    lista.appendChild(li);
  });

  /* ── geometría: una línea con un vaivén suave, y cada sección a su altura en el recorrido ── */
  let alto = 0, ancho = 0, largo = 0, maximo = 1;
  const xEn = (y) => ancho / 2 + Math.sin((y / Math.max(alto, 1)) * Math.PI * 6) * 2.5;

  // la altura en la página según la maqueta. El pie va pegado abajo con sticky y miente sobre
  // dónde está (aparece siempre al fondo de la pantalla): se mide por el final de lo de antes.
  const arriba = (el) => {
    const antes = el.previousElementSibling;
    if (antes && getComputedStyle(el).position === 'sticky') return arriba(antes) + antes.offsetHeight;
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  };

  function medir() {
    const r = nav.getBoundingClientRect();
    alto = r.height; ancho = r.width;
    maximo = Math.max(1, doc.scrollHeight - innerHeight);
    svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
    let d = `M${xEn(0).toFixed(2)} 0`;
    for (let y = 6; y <= alto; y += 6) d += ` L${xEn(y).toFixed(2)} ${y}`;
    guia.setAttribute('d', d);
    vivo.setAttribute('d', d);
    largo = vivo.getTotalLength();
    vivo.style.strokeDasharray = `${largo} ${largo}`;
    for (const s of secciones) {
      const top = arriba(s.el);
      // la sección «se alcanza» cuando su principio llega a un tercio de la pantalla
      s.p = Math.min(1, Math.max(0, (top - innerHeight / 3) / maximo));
      const y = s.p * alto;
      s.li.style.setProperty('--y', `${y.toFixed(1)}px`);
      s.li.style.setProperty('--x', `${(xEn(y) - ancho / 2).toFixed(1)}px`);
    }
    pintar();
  }

  function pintar() {
    pendiente = false;
    const p = Math.min(1, Math.max(0, scrollY / maximo));
    vivo.style.strokeDashoffset = (largo * (1 - p)).toFixed(1);
    const y = p * alto;
    punta.setAttribute('cx', xEn(y).toFixed(2));
    punta.setAttribute('cy', y.toFixed(2));
    let actual = secciones[0];
    for (const s of secciones) {
      const alcanzada = p >= s.p - 0.001;
      s.li.classList.toggle('alcanzada', alcanzada);
      if (alcanzada) actual = s;
    }
    for (const s of secciones) {
      const a = s.li.querySelector('a');
      if (s === actual) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    }
  }
  let pendiente = false;
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };

  /* ── arrastrar la barra, como una barra de scroll ── */
  let arrastrando = false;
  const irA = (clientY) => {
    const r = nav.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    scrollTo({ top: f * maximo, behavior: 'instant' });
  };
  nav.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('a')) return;
    arrastrando = true;
    nav.setPointerCapture(e.pointerId);
    nav.classList.add('arrastrando');
    irA(e.clientY);
    e.preventDefault();
  });
  nav.addEventListener('pointermove', (e) => { if (arrastrando) irA(e.clientY); });
  const soltar = () => { arrastrando = false; nav.classList.remove('arrastrando'); };
  nav.addEventListener('pointerup', soltar);
  nav.addEventListener('pointercancel', soltar);

  /* ── montar solo donde tiene sentido ── */
  let espera;
  const remedir = () => { clearTimeout(espera); espera = setTimeout(medir, 150); };
  function aplicar() {
    if (apto.matches) {
      if (!nav.isConnected) document.body.appendChild(nav);
      doc.classList.add('con-mapa');
      medir();
    } else {
      nav.remove();
      doc.classList.remove('con-mapa');
    }
  }
  aplicar();
  apto.addEventListener?.('change', aplicar);
  addEventListener('scroll', () => { if (nav.isConnected) pedir(); }, { passive: true });
  addEventListener('resize', remedir);
  new ResizeObserver(remedir).observe(document.body);
  document.fonts?.ready.then(remedir);
})();
