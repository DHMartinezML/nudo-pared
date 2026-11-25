/* ─────────────────────────────────────────────────────────────
   tallo.js — la planta que cae por la pared.

   La maquetación la decide el CSS: cada .nudo dice en qué línea
   de la rejilla pasa el tallo (data-tallo) y a qué lado queda
   el texto (data-lado). La planta la decide el HTML: cada sección
   (y cada planta del catálogo) lleva data-planta, y su aspecto
   está en especies.js. Este script une los puntos, abre una hoja
   en cada nudo y hace crecer el tallo con el scroll: al bajar
   crece, al subir se recoge. Donde cambia la planta, un injerto.

   Sin JS: el contenido está entero y no falta nada.
   Con «reducir movimiento»: el tallo aparece ya crecido y quieto.
   ───────────────────────────────────────────────────────────── */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const ESPECIES = window.NUDO_ESPECIES;
  const svg = document.querySelector('.tallo');
  const agujeroEl = document.querySelector('.pieza__madera circle');
  if (!svg || !agujeroEl || !ESPECIES) return;

  const ramas = svg.querySelector('.tallo__ramas');
  const capaHojas = svg.querySelector('.tallo__hojas');
  const cabecera = document.querySelector('.cabecera');
  const quieto = /[?&]crecido(?:&|$)/.test(location.search)
    ? { matches: true, addEventListener() {} } // para capturas: el tallo ya crecido
    : matchMedia('(prefers-reduced-motion: reduce)');
  const movil = matchMedia('(max-width: 760px)');
  const PRIMERA = 'poto';
  const especie = (nombre) => ESPECIES[nombre] || ESPECIES[PRIMERA];

  const trazo = (d, color, w, op = 1) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;

  /* ── Las hojas de cada especie se dibujan una vez en <defs>; cada hoja las reutiliza con <use>. ── */
  let defs = `<linearGradient id="hoja-luz" gradientUnits="userSpaceOnUse" x1="0" y1="-0.45" x2="0" y2="0.45">
      <stop offset="0" stop-color="oklch(0.97 0.05 110)" stop-opacity=".22"/>
      <stop offset=".55" stop-color="oklch(0.97 0.05 110)" stop-opacity="0"/>
    </linearGradient>
    <filter id="sombra-hoja" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter>`;
  for (const [nombre, e] of Object.entries(ESPECIES)) {
    defs += `<clipPath id="clip-${nombre}" clipPathUnits="userSpaceOnUse"><path d="${e.limbo}" clip-rule="evenodd"/></clipPath>
      <linearGradient id="tinte-${nombre}" gradientUnits="userSpaceOnUse" x1="${e.base}" y1="0" x2="1.4" y2="0">
        <stop offset="0" stop-color="${e.tinte[0]}"/><stop offset="1" stop-color="${e.tinte[1]}"/>
      </linearGradient>
      <linearGradient id="brote-${nombre}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${e.brote[0]}"/><stop offset="1" stop-color="${e.brote[1]}"/>
      </linearGradient>`;
    e.variantes.forEach((manchas, v) => {
      defs += `<g id="limbo-${nombre}-${v}">
        <g clip-path="url(#clip-${nombre})">
          <path d="${e.limbo}" fill="url(#tinte-${nombre})" fill-rule="evenodd"/>
          <g fill="${e.mancha}" fill-opacity="${e.opMancha}">${manchas.map((m) => `<path d="${m}"/>`).join('')}</g>
          <path d="${e.limbo}" fill="url(#hoja-luz)" fill-rule="evenodd"/>
          ${e.nervios.map((n) => trazo(n, e.colorNervios, 0.7, e.opNervios)).join('')}
          ${trazo(e.central, e.colorCentral, 1, 0.85)}
        </g>
        <path d="${e.limbo}" fill="none" fill-rule="evenodd" stroke="oklch(0.3 0.06 150)" stroke-opacity=".35" stroke-width=".8" vector-effect="non-scaling-stroke"/>
      </g>`;
    });
  }
  svg.insertAdjacentHTML('afterbegin', `<defs>${defs}</defs>`);

  /* ── Geometría ── */
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  // x de una línea de la rejilla (la mitad del hueco antes de la columna N).
  function xDeLinea(tramo, n) {
    const cs = getComputedStyle(tramo);
    const r = tramo.getBoundingClientRect();
    const cols = cs.gridTemplateColumns.split(' ').map(parseFloat).filter((v) => !Number.isNaN(v));
    const gap = parseFloat(cs.columnGap) || 0;
    let x = r.left + parseFloat(cs.paddingLeft);
    for (let i = 0; i < n - 1 && i < cols.length; i++) x += cols[i] + gap;
    return x - gap / 2;
  }

  function puntoDeNudo(nudo) {
    const tramo = nudo.closest('.tramo');
    const ref = nudo.querySelector('h2:not(.vh), h3, dt, blockquote p, p') || nudo;
    const r = nudo.getBoundingClientRect();
    const rr = ref.getBoundingClientRect();
    const sy = scrollY;
    let x;
    if (movil.matches) {
      const cs = getComputedStyle(tramo);
      x = tramo.getBoundingClientRect().left + parseFloat(cs.paddingLeft) - rem() * 1.45;
    } else {
      x = xDeLinea(tramo, Number(nudo.dataset.tallo) || 7);
    }
    const hasta = nudo.querySelector('[data-tallo-hasta]');
    const rh = hasta?.getBoundingClientRect();
    return {
      x,
      y: rr.top + sy + Math.min(rr.height * 0.5, rem() * 1.1),
      fin: rh ? rh.top + sy + rh.height * 0.45 : r.bottom + sy,
      // hacia dónde abre la hoja: lejos del texto (en móvil el texto siempre queda a la derecha)
      lado: !movil.matches && nudo.dataset.lado === 'izq' ? 1 : -1,
      titulo: nudo.classList.contains('nudo--titulo'),
      // las plantas del catálogo ya traen su foto al lado: ahí la hoja va colgando, más discreta
      sinHoja: nudo.classList.contains('planta'),
      especie: nudo.closest('[data-planta]')?.dataset.planta || PRIMERA,
    };
  }

  /* ── Una hoja: sombra en la pared + limbo, envueltos en las capas que animan.
        .hoja__giro   sale pegada al tallo y gira hacia fuera mientras crece
        .hoja__mecer  se mece despacio cuando está a la vista
        .hoja__limbo  se desenrolla a lo ancho, como se abre una hoja de verdad
        .hoja__tierna el color de hoja recién nacida, que se va apagando ── */
  function crearHoja({ x, y, angulo, tam, especie: nombre }, i, clase = '') {
    const e = especie(nombre);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `hoja ${clase}`.trim());
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const t = tam * e.tam;
    const espejo = i % 3 === 1 ? -1 : 1; // la asimetría cambia de lado en una de cada tres
    const s = `scale(${t.toFixed(2)} ${(t * espejo).toFixed(2)})`;
    const curl = Math.max(-75, Math.min(75, (90 - angulo) * 0.75)); // hacia abajo, a lo largo del tallo
    const sombra = movil.matches ? 'translate(2 4)' : 'translate(3.5 7)';
    g.style.setProperty('--curl', `${curl.toFixed(1)}deg`);
    g.style.setProperty('--m', `${(1.1 + (i * 7) % 10 / 10).toFixed(2)}deg`);
    g.style.setProperty('--t', `${5 + (i * 13) % 30 / 10}s`);
    g.style.setProperty('--d', `${-((i * 17) % 50) / 10}s`);
    const peciolo = e.sinPeciolo ? ''
      : trazo(`M0 0 Q${e.base / 2} 0.035 ${e.base + 0.01} 0`, e.tallo, (anchoBase * 0.42).toFixed(2));
    g.innerHTML = `<g class="hoja__giro"><g class="hoja__mecer">
      <g transform="${sombra}" filter="url(#sombra-hoja)"><g transform="rotate(${angulo.toFixed(1)}) ${s}">
        <path d="${e.limbo}" fill="oklch(0.3 0.04 80)" fill-opacity=".17" fill-rule="evenodd"/></g></g>
      <g transform="rotate(${angulo.toFixed(1)})"><g class="hoja__limbo"><g transform="${s}">
        ${peciolo}
        <use href="#limbo-${nombre}-${i % e.variantes.length}"/>
        <path class="hoja__tierna" d="${e.limbo}" fill="${e.tierna}" fill-rule="evenodd"/>
      </g></g></g>
    </g></g>`;
    capaHojas.appendChild(g);
    return g;
  }

  /* ── Estado ── */
  const PASOS_PUNTA = 12;
  const COLOR_FOTO = 'oklch(0.66 0.13 112)'; // el tallo del brote, medido en brote.png junto al agujero
  let tramos = [], trozos = [], puntas = [], sombra, brillo, anchoBase = 3, ancho = () => 3, total = 0, muestrasY = [], muestrasL = [], hojas = [], brote;
  let actual = 0, objetivo = 0, rafId = 0, ultimoY = scrollY, especiePunta = '';

  function construir() {
    ramas.textContent = '';
    capaHojas.textContent = '';
    hojas = [];
    especiePunta = '';

    const doc = document.documentElement;
    svg.setAttribute('height', 0); // que el propio SVG no infle la medida
    const alto = Math.max(document.body.scrollHeight, doc.scrollHeight);
    svg.setAttribute('width', doc.clientWidth);
    svg.setAttribute('height', alto);
    svg.setAttribute('viewBox', `0 0 ${doc.clientWidth} ${alto}`);

    const ra = agujeroEl.getBoundingClientRect();
    let cx = ra.left + ra.width / 2;
    let cy = ra.top + scrollY + ra.height / 2;
    const agujero = { x: cx, y: cy, d: ra.width }; // para el cuello de la bifurcación
    const nudos = [...document.querySelectorAll('.nudo')].map(puntoDeNudo).sort((a, b) => a.y - b.y);
    if (!nudos.length) return;

    const esMovil = movil.matches;
    // El grosor sale de la foto: donde se unen los dos peciolos, el tallo del brote mide
    // unas 0.42 veces el agujero. De ahí baja, en un par de palmos, al grosor del tallo maduro.
    const enElAgujero = ra.width * 0.42;
    anchoBase = Math.min(esMovil ? 3.8 : 6.2, Math.max(esMovil ? 3 : 4, enElAgujero * 0.55));
    const caida = esMovil ? 150 : 260;
    ancho = (l) => anchoBase + (enElAgujero - anchoBase) * Math.exp(-l / caida);
    // y el color también: sale del agujero con el verde oliva del brote de la foto
    // y pasa poco a poco al de la planta
    const deLaFoto = (l) => Math.round(100 * Math.exp(-l / (caida * 1.2)));
    const tam = (t) => (esMovil ? (t ? 33 : 24) : (t ? 84 : 58));
    const inicio = `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
    let entero = inicio; // el tallo completo: para medir, la sombra y el brillo
    const piezas = [{ especie: PRIMERA, d: inicio }]; // un tramo por planta, para colorearlo
    const pieza = () => piezas[piezas.length - 1];
    const añadir = (seg) => { entero += seg; pieza().d += seg; };
    let vaiven = 1;
    const huecos = [];
    const nudosTallo = [];
    const nuevas = [];

    const bajarRecto = (x, y) => {
      const dy = y - cy;
      if (dy <= 1) return;
      const w = Math.min(5, dy * 0.02) * vaiven;
      vaiven *= -1;
      añadir(` C${(cx + w).toFixed(1)} ${(cy + dy * 0.33).toFixed(1)} ${(x - w).toFixed(1)} ${(cy + dy * 0.66).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
      cx = x; cy = y;
    };
    const columpiar = (x, y) => {
      const dy = y - cy;
      if (dy <= 1) { cx = x; cy = y; return; }
      huecos.push({ x0: cx, y0: cy, x1: x, y1: y, especie: pieza().especie });
      añadir(` C${cx.toFixed(1)} ${(cy + dy * 0.55).toFixed(1)} ${x.toFixed(1)} ${(y - dy * 0.55).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
      cx = x; cy = y;
    };

    // del agujero cuelga a plomo, por su peso, hasta pasar el cuadro y su cartela; luego busca el primer nudo
    const bajoElCuadro = (agujeroEl.closest('figure') || agujeroEl.ownerSVGElement).getBoundingClientRect().bottom + scrollY + (esMovil ? 16 : 28);
    const aPlomo = Math.min(bajoElCuadro, nudos[0].y - (esMovil ? 90 : 160));
    if (aPlomo > cy + 10) { añadir(` L${cx.toFixed(1)} ${aPlomo.toFixed(1)}`); cy = aPlomo; }

    nudos.forEach((n, i) => {
      if (Math.abs(n.x - cx) < 3) bajarRecto(n.x, n.y); else columpiar(n.x, n.y);
      // aquí cambia la planta: el tallo sigue desde este nudo con la nueva
      const injerto = n.especie !== pieza().especie;
      if (injerto) piezas.push({ especie: n.especie, d: `M${cx.toFixed(1)} ${cy.toFixed(1)}` });
      const e = especie(n.especie);
      const giro = esMovil ? 46 + ((i * 37) % 22) : 18 + ((i * 37) % 34); // en móvil cuelgan más: no hay margen
      const escala = 0.82 + ((i * 53) % 40) / 100; // ninguna hoja igual a la anterior
      if (!n.sinHoja) nuevas.push({ x: n.x, y: n.y, angulo: n.lado > 0 ? giro : 180 - giro, tam: tam(n.titulo) * escala, especie: n.especie });
      // en el catálogo, el nudo de cada planta echa una hoja suya, colgando casi pegada al tallo
      // para no tocar la foto: así se ve en el tallo la planta que tienes al lado
      else nuevas.push({ x: n.x, y: n.y, angulo: n.lado > 0 ? 64 : 116, tam: tam(false) * 0.8, especie: n.especie });
      nudosTallo.push({ x: n.x, y: n.y, lado: -n.lado, especie: n.especie, injerto });
      // baja pegado al texto hasta el final del nudo (o hasta el siguiente, si se solapan)
      const siguiente = nudos[i + 1];
      const salida = siguiente ? Math.min(n.fin, siguiente.y - 48) : n.fin;
      if (salida > cy + 12) {
        const y0 = cy;
        bajarRecto(n.x, salida);
        const paso = (esMovil ? 300 : 420) * (e.paso || 1);
        let k = 0;
        for (let y = y0 + paso; y < salida - paso * 0.5; y += paso, k++) {
          // las hojas muy juntas (tradescantia) se alternan a un lado y otro del tallo
          const lado = e.paso && k % 2 ? -n.lado : n.lado;
          const angulo = lado > 0 ? 24 + (y % 24) : (esMovil ? 128 : 156) - (y % 24);
          nuevas.push({ x: n.x, y, angulo, tam: tam(false) * 0.85, especie: n.especie });
        }
      }
    });

    // Hojas de más en los tramos largos entre secciones: ahí no hay texto que tapar.
    huecos.forEach((h, i) => {
      if (h.y1 - h.y0 < 260) return;
      const dir = h.x1 > h.x0 ? -1 : 1;
      nuevas.push({ x: (h.x0 + h.x1) / 2, y: (h.y0 + h.y1) / 2, angulo: dir > 0 ? 30 + i * 5 : 150 - i * 5, tam: esMovil ? 22 : 48, especie: h.especie });
    });

    /* el tallo, por capas: sombra en la pared, el tallo en trozos (cada uno con su grosor),
       los nudos, la punta que crece y el brillo */
    const capa = (clase, d, grueso, extra = '') => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', clase);
      p.setAttribute('d', d);
      p.setAttribute('stroke-width', grueso);
      if (extra) p.setAttribute('transform', extra);
      ramas.appendChild(p);
      return p;
    };
    sombra = capa('tallo__sombra', entero, anchoBase * 1.15 + 1, esMovil ? 'translate(1.5 3)' : 'translate(3 6)');
    total = sombra.getTotalLength();
    const N = Math.max(200, Math.round(total / 8));
    muestrasY = new Float32Array(N + 1);
    muestrasL = new Float32Array(N + 1);
    for (let k = 0; k <= N; k++) {
      const l = (total * k) / N;
      muestrasL[k] = l;
      muestrasY[k] = sombra.getPointAtLength(l).y;
    }

    // Un tramo por planta (su color) y, dentro, trozos de grosor decreciente: cortos donde el
    // tallo adelgaza deprisa, largos después. Todos los trozos de un tramo comparten trazado,
    // así que empalman sin costura.
    let desde = 0;
    trozos = [];
    tramos = piezas.map((p) => {
      const e = especie(p.especie);
      const medida = capa('tallo__medida', p.d, 0);
      const largo = medida.getTotalLength();
      medida.remove();
      for (let a = 0; a < largo;) {
        const g = desde + a;
        const paso = g < caida * 4 ? 30 : 400;
        const b = Math.min(largo, a + paso);
        const el = capa('tallo__trozo', p.d, (ancho(desde + (a + b) / 2) * e.grosor).toFixed(2));
        const foto = deLaFoto(desde + (a + b) / 2);
        el.style.stroke = foto > 0 ? `color-mix(in oklch, ${COLOR_FOTO} ${foto}%, ${e.tallo})` : e.tallo;
        trozos.push({ el, desde: g, hasta: desde + b, origen: desde });
        a = b;
      }
      const t = { especie: p.especie, desde, largo };
      desde += largo;
      return t;
    });

    // en cada nudo: un engrosamiento y, si la planta las echa, la raíz aérea, marrón con la punta clara.
    // Donde cambia la planta, el nudo es un injerto: más grueso y de corteza.
    const kr = anchoBase / 4;
    nudosTallo.forEach((n) => {
      const e = especie(n.especie);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', n.injerto ? 'tallo__nudo tallo__nudo--injerto' : 'tallo__nudo');
      const gr = ancho(longitudPara(n.y)) * e.grosor * (n.injerto ? 1.3 : 1);
      if (!n.injerto) g.style.fill = e.tallo;
      g.innerHTML = `<ellipse cx="${n.x}" cy="${n.y}" rx="${(gr * 0.66).toFixed(2)}" ry="${(gr * 1.1).toFixed(2)}"/>`
        + (e.raices
          ? `<path class="tallo__raiz" stroke-width="${(1.1 * kr).toFixed(2)}" d="M${n.x} ${n.y + 2} q${n.lado * 5 * kr} ${4 * kr} ${n.lado * 6 * kr} ${13 * kr}"/>`
            + `<circle class="tallo__raiz-punta" cx="${n.x + n.lado * 6 * kr}" cy="${n.y + 2 + 13 * kr}" r="${(0.8 * kr).toFixed(2)}"/>`
          : '');
      ramas.appendChild(g);
      hojas.push({ nudo: g, y: n.y });
    });

    // la punta que crece: muchos trozos cortos que se afinan y aclaran hacia el brote,
    // en pasos tan pequeños que se lee como un degradado
    const largoPunta = esMovil ? 90 : 150;
    puntas = Array.from({ length: PASOS_PUNTA }, (_, j) => ({
      el: capa(j === PASOS_PUNTA - 1 ? 'tallo__punta tallo__punta--final' : 'tallo__punta', entero, 1),
      j, largo: largoPunta,
    }));
    // El final de la bifurcación: en la foto los dos peciolos se juntan en una base ancha que
    // queda cortada en seco sobre el agujero. Este cuello la continúa: sale con el ancho de esa
    // base (medido en brote.png, en diámetros del agujero) y se estrecha hasta el tallo. Por
    // arriba se funde con la foto y por abajo con el tallo, para que no se vea la costura.
    {
      const { x, y, d: D } = agujero;
      const P = (u, v) => `${(x + u * D).toFixed(1)} ${(y + v * D).toFixed(1)}`;
      const r = enElAgujero / 2 / D; // medio tallo, en diámetros
      const cuello = document.createElementNS(NS, 'g');
      cuello.setAttribute('class', 'tallo__cuello');
      cuello.innerHTML = `
        <linearGradient id="cuello-luz" gradientUnits="userSpaceOnUse" x1="${P(-0.44, 0).split(' ')[0]}" x2="${P(0.24, 0).split(' ')[0]}" y1="0" y2="0">
          <stop offset="0" stop-color="oklch(0.5 0.11 120)"/><stop offset="0.55" stop-color="oklch(0.7 0.135 110)"/><stop offset="1" stop-color="oklch(0.58 0.12 115)"/>
        </linearGradient>
        <linearGradient id="cuello-funde" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${P(0, -0.5).split(' ')[1]}" y2="${P(0, 0.9).split(' ')[1]}">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.2" stop-color="#fff"/>
          <stop offset="0.57" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="brillo-funde" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${(y + 0.4 * D).toFixed(1)}" y2="${(y + 0.4 * D + 140).toFixed(1)}">
          <stop offset="0" stop-color="oklch(0.95 0.03 100)" stop-opacity="0"/><stop offset="1" stop-color="oklch(0.95 0.03 100)"/>
        </linearGradient>
        <mask id="cuello-mascara" maskUnits="userSpaceOnUse" x="${(x - D).toFixed(1)}" y="${(y - D).toFixed(1)}" width="${(2 * D).toFixed(1)}" height="${(2 * D).toFixed(1)}">
          <rect x="${(x - D).toFixed(1)}" y="${(y - D).toFixed(1)}" width="${(2 * D).toFixed(1)}" height="${(2 * D).toFixed(1)}" fill="url(#cuello-funde)"/>
        </mask>
        <path mask="url(#cuello-mascara)" style="fill: url(#cuello-luz); stroke: none" d="M${P(-0.46, -0.5)} L${P(0.25, -0.5)}
          C${P(0.24, -0.25)} ${P(r + 0.01, -0.08)} ${P(r, 0.12)} L${P(r * 0.97, 0.9)} L${P(-r * 0.97, 0.9)} L${P(-r, 0.12)}
          C${P(-r - 0.02, -0.06)} ${P(-0.3, -0.28)} ${P(-0.46, -0.5)} Z"/>
        <path class="tallo__cuello-anillo" d="M${P(-r * 0.95, 0.1)} Q${P(0, 0.16)} ${P(r * 0.95, 0.1)}" stroke-width="${(D * 0.03).toFixed(2)}"/>`;
      ramas.appendChild(cuello);
    }
    brillo = capa('tallo__brillo', entero, (anchoBase * 0.2).toFixed(2), `translate(${(-anchoBase * 0.2).toFixed(2)} -0.3)`);
    brillo.style.stroke = 'url(#brillo-funde)'; // el brillo nace poco a poco bajo el cuello, no en seco
    sombra.style.strokeDasharray = brillo.style.strokeDasharray = `${total} ${total}`;

    nuevas.forEach((h, i) => hojas.push({ el: crearHoja(h, i), y: h.y }));

    // el remate: en la punta, la hoja más nueva y la más grande
    const ultimo = nudos[nudos.length - 1];
    const final = crearHoja({
      x: cx, y: cy, angulo: ultimo.lado > 0 ? 40 : (esMovil ? 118 : 140), tam: tam(true) * 1.15, especie: ultimo.especie,
    }, nuevas.length, 'hoja--final');
    hojas.push({ el: final, y: cy, final: true });

    // el brote: una hoja aún enrollada que va en la punta mientras crece
    brote = document.createElementNS(NS, 'g');
    brote.setAttribute('class', 'brote');
    brote.innerHTML = `<g transform="scale(${(anchoBase / 4.4).toFixed(2)})">
      <path class="brote__hoja" d="M0 -1 C-2.8 4 -3.2 11 -0.8 19 C0.3 20.5 1.2 19.8 1.4 18 C3.2 11 2.8 4 0 -1 Z"/>
      <path d="M0.2 1 C1.6 6 1.6 12 0.6 18" fill="none" stroke="oklch(0.4 0.06 135)" stroke-opacity=".45" stroke-width=".7"/>
    </g>`;
    capaHojas.appendChild(brote);

    objetivo = longitudPara(yObjetivo());
    actual = quieto.matches ? total : Math.min(actual, objetivo);
    // al reconstruir (cambia el tamaño de la página), lo que ya estaba abierto aparece abierto:
    // sin transición, para que las hojas no vuelvan a nacer
    svg.classList.add('tallo--sin-transicion');
    pintar();
    mecerVisibles();
    svg.getBoundingClientRect();
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.remove('tallo--sin-transicion')));
  }

  const yObjetivo = () => scrollY + innerHeight * 0.68;

  function longitudPara(y) {
    if (!muestrasY.length || y <= muestrasY[0]) return 0;
    let lo = 0, hi = muestrasY.length - 1;
    if (y >= muestrasY[hi]) return total;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (muestrasY[mid] < y) lo = mid; else hi = mid;
    }
    const t = (y - muestrasY[lo]) / (muestrasY[hi] - muestrasY[lo] || 1);
    return muestrasL[lo] + t * (muestrasL[hi] - muestrasL[lo]);
  }

  // enseña el trozo [a, b] de la longitud de un trazado (o lo esconde si está vacío)
  const ventana = (el, a, b, origen = 0) => {
    if (b - a < 0.5) { el.style.visibility = 'hidden'; return; }
    el.style.visibility = '';
    el.style.strokeDasharray = `${(b - a).toFixed(1)} ${total * 2}`;
    el.style.strokeDashoffset = (origen - a).toFixed(1);
  };

  function pintar() {
    if (!tramos.length) return;
    const largoPunta = puntas[0].largo;
    const finTallo = Math.max(0, actual - largoPunta);
    sombra.style.strokeDashoffset = (total - actual).toFixed(1);
    brillo.style.strokeDashoffset = (total - Math.max(0, actual - largoPunta * 0.7)).toFixed(1);
    // el tallo hecho llega hasta donde empieza la punta
    // cada trozo se mete un pelo bajo el anterior: con extremos rectos, el antialiasing dejaría una raya
    for (const t of trozos) ventana(t.el, Math.max(t.origen, t.desde - 1.5), Math.min(t.hasta, finTallo), t.origen);

    // la punta, del color de la planta que está creciendo: más fina y más clara hacia el brote
    let enLaPunta = tramos[0];
    for (const t of tramos) if (actual > t.desde) enLaPunta = t;
    const e = especie(enLaPunta.especie);
    if (enLaPunta.especie !== especiePunta) {
      especiePunta = enLaPunta.especie;
      for (const p of puntas) p.el.style.stroke = `color-mix(in oklch, ${e.joven} ${Math.round(((p.j + 1) / PASOS_PUNTA) * 90)}%, ${e.tallo})`;
      brote.querySelector('.brote__hoja').setAttribute('fill', `url(#brote-${especiePunta})`);
    }
    const grueso = ancho(finTallo) * e.grosor;
    for (const p of puntas) {
      const a = Math.max(0, finTallo + (p.j * (actual - finTallo)) / PASOS_PUNTA - 1.5);
      const b = finTallo + ((p.j + 1) * (actual - finTallo)) / PASOS_PUNTA;
      p.el.setAttribute('stroke-width', (grueso * (1 - 0.55 * ((p.j + 0.5) / PASOS_PUNTA))).toFixed(2));
      ventana(p.el, a, b);
    }

    const punta = sombra.getPointAtLength(actual);
    const antes = sombra.getPointAtLength(Math.max(0, actual - 6));
    const ang = (Math.atan2(punta.y - antes.y, punta.x - antes.x) * 180) / Math.PI - 90;
    brote.setAttribute('transform', `translate(${punta.x.toFixed(1)} ${punta.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    brote.style.opacity = actual > 4 && actual < total - 1 ? 1 : 0;
    for (const h of hojas) {
      const abierta = h.final ? actual >= total - 1 : punta.y >= h.y + 2 || actual >= total - 1;
      (h.nudo || h.el).classList.toggle('abierta', abierta);
    }
  }

  // solo se mecen las hojas a la vista: las demás no gastan nada
  function mecerVisibles() {
    if (quieto.matches) return;
    const arriba = scrollY - 150, abajo = scrollY + innerHeight + 150;
    for (const h of hojas) if (h.el) h.el.classList.toggle('cerca', h.y > arriba && h.y < abajo);
  }

  function bucle() {
    const dif = objetivo - actual;
    if (Math.abs(dif) < 0.6) { actual = objetivo; pintar(); rafId = 0; return; }
    actual += dif * (dif > 0 ? 0.085 : 0.11); // se recoge algo más deprisa de lo que crece
    pintar();
    rafId = requestAnimationFrame(bucle);
  }

  function alScroll() {
    // cabecera: se aparta al bajar, vuelve al subir (nunca con el foco dentro)
    const y = scrollY;
    if (cabecera && !cabecera.contains(document.activeElement)) {
      if (y > ultimoY + 6 && y > 240) cabecera.classList.add('oculta');
      else if (y < ultimoY - 6 || y < 240) cabecera.classList.remove('oculta');
    }
    ultimoY = y;

    if (quieto.matches) return;
    // el tallo sigue al scroll: crece al bajar y se recoge al subir
    objetivo = longitudPara(yObjetivo());
    mecerVisibles();
    if (!rafId) rafId = requestAnimationFrame(bucle);
  }

  cabecera?.addEventListener('focusin', () => cabecera.classList.remove('oculta'));

  let espera;
  const reconstruir = () => { clearTimeout(espera); espera = setTimeout(construir, 120); };

  construir();
  if (!quieto.matches) { rafId = requestAnimationFrame(bucle); }
  addEventListener('scroll', alScroll, { passive: true });
  new ResizeObserver(reconstruir).observe(document.body);
  document.fonts?.ready.then(construir);
  quieto.addEventListener?.('change', construir);
})();
