/* ─────────────────────────────────────────────────────────────
   especies.js — el catálogo de plantas que dibuja tallo.js.

   Cada sección de la página dice qué planta le toca con
   data-planta="…"; aquí está cómo es cada una: su tallo y su hoja.

   La hoja va en coordenadas unitarias: el peciolo nace en (0,0),
   el limbo empieza en `base` y apunta hacia +x. Los nervios y las
   manchas se recortan al limbo, así que pueden pasarse del borde.
   ───────────────────────────────────────────────────────────── */
window.NUDO_ESPECIES = (() => {
  const elipse = (cx, cy, rx, ry) =>
    `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

  return {
    // Poto dorado (Epipremnum aureum): corazón algo asimétrico y vetas crema que siguen los nervios.
    poto: {
      limbo: 'M0.32 0 C0.24 -0.08 0.2 -0.27 0.35 -0.39 C0.53 -0.53 0.9 -0.43 1.12 -0.17 '
        + 'C1.2 -0.08 1.26 -0.02 1.35 0.01 C1.25 0.05 1.16 0.1 1.06 0.18 '
        + 'C0.86 0.39 0.52 0.47 0.34 0.35 C0.2 0.26 0.24 0.08 0.32 0 Z',
      base: 0.32, tam: 1,
      tinte: ['oklch(0.58 0.13 136)', 'oklch(0.45 0.11 146)'],
      central: 'M0.32 0 Q0.8 -0.035 1.31 0.008', colorCentral: 'oklch(0.88 0.08 105)',
      nervios: ['M0.42 -0.012 Q0.5 -0.2 0.6 -0.37', 'M0.6 -0.024 Q0.72 -0.19 0.86 -0.31', 'M0.82 -0.026 Q0.95 -0.13 1.06 -0.19',
        'M0.44 0.008 Q0.53 0.18 0.62 0.33', 'M0.63 0 Q0.75 0.15 0.88 0.26', 'M0.84 -0.002 Q0.95 0.08 1.04 0.16'],
      colorNervios: 'oklch(0.36 0.08 148)', opNervios: 0.3,
      mancha: 'oklch(0.9 0.09 100)', opMancha: 0.78,
      variantes: [
        ['M0.38 -0.04 C0.5 -0.18 0.68 -0.3 0.84 -0.32 C0.78 -0.25 0.64 -0.16 0.5 -0.05 Z',
          'M0.66 -0.03 C0.8 -0.14 0.98 -0.2 1.12 -0.14 C1 -0.1 0.86 -0.06 0.74 -0.01 Z',
          'M0.44 0.05 C0.58 0.2 0.76 0.3 0.94 0.31 C0.84 0.23 0.68 0.14 0.54 0.04 Z',
          'M0.82 0.03 C0.94 0.11 1.06 0.14 1.18 0.1 C1.08 0.06 0.98 0.04 0.88 0.02 Z'],
        ['M0.4 -0.02 C0.46 -0.2 0.6 -0.38 0.76 -0.42 C0.74 -0.3 0.7 -0.2 0.62 -0.12 C0.56 -0.07 0.48 -0.03 0.4 -0.02 Z',
          'M0.9 0.02 C1 0.1 1.12 0.12 1.22 0.06 C1.12 0.04 1 0.02 0.9 0.02 Z',
          'M0.5 0.06 C0.6 0.16 0.7 0.22 0.8 0.22 C0.72 0.16 0.62 0.1 0.5 0.06 Z'],
        ['M0.36 -0.02 C0.56 -0.12 0.8 -0.2 1.02 -0.2 C0.82 -0.16 0.6 -0.09 0.42 -0.01 Z',
          'M0.4 0.03 C0.6 0.12 0.82 0.2 1 0.22 C0.82 0.16 0.6 0.1 0.44 0.03 Z',
          'M0.7 -0.29 C0.78 -0.31 0.86 -0.31 0.93 -0.28 C0.86 -0.27 0.78 -0.27 0.7 -0.29 Z',
          'M1 0 C1.1 -0.04 1.2 -0.05 1.28 -0.02 C1.2 0 1.1 0.01 1 0 Z'],
      ],
      tierna: 'oklch(0.84 0.15 118)',
      tallo: 'oklch(0.56 0.1 132)', joven: 'oklch(0.72 0.14 122)', grosor: 1, raices: true,
      brote: ['oklch(0.66 0.13 132)', 'oklch(0.86 0.15 118)'],
    },

    // Filodendro trepador (Philodendron hederaceum): corazón liso y brillante, peciolo largo,
    // punta muy alargada. Las hojas nuevas salen color bronce.
    filodendro: {
      limbo: 'M0.42 0 C0.3 -0.05 0.23 -0.22 0.36 -0.34 C0.54 -0.48 0.9 -0.4 1.12 -0.16 '
        + 'C1.22 -0.07 1.34 -0.02 1.5 0 C1.34 0.02 1.22 0.07 1.12 0.16 '
        + 'C0.9 0.4 0.54 0.48 0.36 0.34 C0.23 0.22 0.3 0.05 0.42 0 Z',
      base: 0.42, tam: 0.92,
      tinte: ['oklch(0.54 0.13 140)', 'oklch(0.4 0.11 148)'],
      central: 'M0.42 0 Q0.95 -0.012 1.48 0', colorCentral: 'oklch(0.66 0.1 128)',
      nervios: ['M0.52 -0.01 Q0.62 -0.2 0.74 -0.34', 'M0.78 -0.01 Q0.9 -0.16 1.04 -0.24',
        'M0.52 0.01 Q0.62 0.2 0.74 0.34', 'M0.78 0.01 Q0.9 0.16 1.04 0.24'],
      colorNervios: 'oklch(0.3 0.08 150)', opNervios: 0.35,
      // sin jaspe: solo el reflejo de una hoja encerada
      mancha: 'oklch(0.97 0.03 120)', opMancha: 0.2,
      variantes: [['M0.5 -0.08 C0.72 -0.3 1.02 -0.27 1.24 -0.08 C1.02 -0.17 0.76 -0.18 0.5 -0.08 Z']],
      tierna: 'oklch(0.62 0.11 55)',
      tallo: 'oklch(0.52 0.1 135)', joven: 'oklch(0.62 0.1 70)', grosor: 0.85, raices: true,
      brote: ['oklch(0.52 0.09 60)', 'oklch(0.72 0.12 70)'],
    },

    // Singonio (Syngonium podophyllum): punta de flecha, centro rosado y nervios claros.
    singonio: {
      limbo: 'M0.36 0 C0.33 -0.06 0.27 -0.14 0.17 -0.27 C0.12 -0.34 0.18 -0.39 0.27 -0.37 '
        + 'C0.53 -0.33 0.8 -0.26 1.02 -0.14 C1.15 -0.07 1.25 -0.03 1.34 0 '
        + 'C1.25 0.03 1.15 0.07 1.02 0.14 C0.8 0.26 0.53 0.33 0.27 0.37 '
        + 'C0.18 0.39 0.12 0.34 0.17 0.27 C0.27 0.14 0.33 0.06 0.36 0 Z',
      base: 0.36, tam: 1,
      tinte: ['oklch(0.74 0.08 135)', 'oklch(0.6 0.11 140)'],
      central: 'M0.36 0 L1.32 0', colorCentral: 'oklch(0.9 0.05 15)',
      nervios: ['M0.36 -0.01 Q0.26 -0.16 0.2 -0.3', 'M0.36 0.01 Q0.26 0.16 0.2 0.3',
        'M0.52 -0.01 Q0.72 -0.18 0.98 -0.18', 'M0.52 0.01 Q0.72 0.18 0.98 0.18'],
      colorNervios: 'oklch(0.9 0.05 15)', opNervios: 0.65,
      mancha: 'oklch(0.8 0.08 12)', opMancha: 0.62,
      variantes: [
        ['M0.3 0 C0.4 -0.17 0.72 -0.2 0.98 -0.09 C1.08 -0.04 1.14 0 1.16 0 C1.14 0 1.08 0.04 0.98 0.09 C0.72 0.2 0.4 0.17 0.3 0 Z',
          'M0.34 -0.03 C0.3 -0.1 0.24 -0.2 0.2 -0.3 C0.28 -0.26 0.34 -0.16 0.38 -0.05 Z',
          'M0.34 0.03 C0.3 0.1 0.24 0.2 0.2 0.3 C0.28 0.26 0.34 0.16 0.38 0.05 Z'],
        ['M0.18 -0.34 C0.5 -0.32 0.86 -0.24 1.1 -0.1 C1.2 -0.05 1.26 -0.02 1.3 0 C1.26 0.02 1.2 0.05 1.1 0.1 C0.86 0.24 0.5 0.32 0.18 0.34 C0.3 0.2 0.36 0.08 0.36 0 C0.36 -0.08 0.3 -0.2 0.18 -0.34 Z'],
      ],
      tierna: 'oklch(0.88 0.07 20)',
      tallo: 'oklch(0.68 0.07 135)', joven: 'oklch(0.8 0.06 30)', grosor: 0.9, raices: true,
      brote: ['oklch(0.7 0.07 130)', 'oklch(0.86 0.07 20)'],
    },

    // Monstera adansonii: hoja ovalada, de verde más claro, llena de agujeros.
    monstera: {
      limbo: 'M0.32 0 C0.28 -0.12 0.38 -0.3 0.58 -0.36 C0.82 -0.42 1.14 -0.3 1.32 -0.1 '
        + 'C1.38 -0.04 1.42 -0.01 1.48 0 C1.4 0.04 1.32 0.1 1.22 0.17 '
        + 'C1.02 0.33 0.74 0.37 0.54 0.31 C0.36 0.25 0.3 0.1 0.32 0 Z '
        + elipse(0.62, -0.18, 0.08, 0.042) + elipse(0.89, -0.2, 0.085, 0.045) + elipse(1.12, -0.13, 0.055, 0.03)
        + elipse(0.64, 0.16, 0.075, 0.04) + elipse(0.9, 0.17, 0.08, 0.042) + elipse(1.12, 0.1, 0.05, 0.026),
      base: 0.32, tam: 1.08,
      tinte: ['oklch(0.62 0.12 135)', 'oklch(0.5 0.12 142)'],
      central: 'M0.32 0 Q0.9 -0.03 1.46 0', colorCentral: 'oklch(0.75 0.11 128)',
      nervios: ['M0.46 -0.01 Q0.5 -0.18 0.5 -0.33', 'M0.75 -0.02 Q0.77 -0.2 0.76 -0.38', 'M1.01 -0.02 Q1.02 -0.14 1.02 -0.26',
        'M0.48 0.01 Q0.52 0.16 0.52 0.29', 'M0.77 0.01 Q0.79 0.18 0.78 0.33', 'M1.02 0.01 Q1.03 0.12 1.03 0.22'],
      colorNervios: 'oklch(0.4 0.09 148)', opNervios: 0.35,
      mancha: 'oklch(0.97 0.03 120)', opMancha: 0.12,
      variantes: [['M0.5 -0.1 C0.8 -0.34 1.1 -0.28 1.3 -0.08 C1.08 -0.18 0.8 -0.2 0.5 -0.1 Z']],
      tierna: 'oklch(0.84 0.13 118)',
      tallo: 'oklch(0.6 0.11 130)', joven: 'oklch(0.76 0.13 122)', grosor: 1.1, raices: true,
      brote: ['oklch(0.62 0.12 132)', 'oklch(0.86 0.14 118)'],
    },

    // Tradescantia zebrina: tallo morado y articulado, hojas sin peciolo que abrazan el tallo,
    // con dos bandas de plata y los bordes morados.
    tradescantia: {
      limbo: 'M0.02 0 C0.1 -0.17 0.34 -0.27 0.62 -0.27 C0.9 -0.25 1.1 -0.13 1.26 0 '
        + 'C1.1 0.13 0.9 0.25 0.62 0.27 C0.34 0.27 0.1 0.17 0.02 0 Z',
      base: 0, tam: 0.8, sinPeciolo: true,
      tinte: ['oklch(0.42 0.1 335)', 'oklch(0.36 0.08 320)'],
      central: 'M0.04 0 L1.22 0', colorCentral: 'oklch(0.4 0.07 160)',
      nervios: [], colorNervios: 'transparent', opNervios: 0,
      mancha: 'oklch(0.88 0.035 250)', opMancha: 0.9,
      variantes: [[
        'M0.1 -0.035 C0.28 -0.16 0.52 -0.21 0.76 -0.2 C0.94 -0.18 1.06 -0.12 1.15 -0.045 C1.02 -0.06 0.9 -0.065 0.76 -0.06 C0.52 -0.055 0.3 -0.05 0.1 -0.035 Z',
        'M0.1 0.035 C0.28 0.16 0.52 0.21 0.76 0.2 C0.94 0.18 1.06 0.12 1.15 0.045 C1.02 0.06 0.9 0.065 0.76 0.06 C0.52 0.055 0.3 0.05 0.1 0.035 Z',
      ]],
      tierna: 'oklch(0.72 0.1 340)',
      tallo: 'oklch(0.46 0.12 340)', joven: 'oklch(0.62 0.13 345)', grosor: 0.8, raices: false,
      paso: 0.55, // las hojas van mucho más juntas
      brote: ['oklch(0.45 0.11 340)', 'oklch(0.7 0.1 340)'],
    },

    // Scindapsus pictus: corazón de verde muy oscuro y mate, con manchas de plata; la punta se curva.
    scindapsus: {
      limbo: 'M0.3 0 C0.22 -0.1 0.22 -0.3 0.38 -0.4 C0.58 -0.5 0.94 -0.4 1.14 -0.16 '
        + 'C1.22 -0.07 1.3 0.02 1.36 0.08 C1.24 0.07 1.14 0.1 1.04 0.16 '
        + 'C0.84 0.32 0.52 0.38 0.36 0.3 C0.22 0.22 0.22 0.08 0.3 0 Z',
      base: 0.3, tam: 1,
      tinte: ['oklch(0.43 0.07 155)', 'oklch(0.33 0.06 160)'],
      central: 'M0.3 0 Q0.85 -0.04 1.33 0.07', colorCentral: 'oklch(0.3 0.05 160)',
      nervios: [], colorNervios: 'transparent', opNervios: 0,
      mancha: 'oklch(0.84 0.03 190)', opMancha: 0.72,
      variantes: [
        [elipse(0.52, -0.22, 0.05, 0.03), elipse(0.7, -0.29, 0.045, 0.025), elipse(0.86, -0.17, 0.065, 0.032),
          elipse(1.02, -0.09, 0.035, 0.02), elipse(0.48, 0.18, 0.04, 0.025), elipse(0.68, 0.23, 0.06, 0.03),
          elipse(0.84, 0.13, 0.04, 0.025), elipse(1.0, 0.1, 0.04, 0.02), elipse(0.63, -0.08, 0.03, 0.02)],
        [elipse(0.46, -0.28, 0.06, 0.035), elipse(0.76, -0.24, 0.035, 0.02), elipse(0.95, -0.15, 0.05, 0.03),
          elipse(0.58, 0.12, 0.05, 0.03), elipse(0.78, 0.26, 0.04, 0.022), elipse(0.96, 0.14, 0.055, 0.025),
          elipse(0.42, 0.27, 0.03, 0.02)],
      ],
      tierna: 'oklch(0.62 0.07 150)',
      tallo: 'oklch(0.48 0.08 145)', joven: 'oklch(0.6 0.09 140)', grosor: 1, raices: true,
      brote: ['oklch(0.42 0.06 155)', 'oklch(0.62 0.07 150)'],
    },
  };
})();
