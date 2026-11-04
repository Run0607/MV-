// =============================================================
//  モブ（応援団4人）バストアップ  viewBox 0 0 400 440
// =============================================================
(function () {
  const MV = (window.MV = window.MV || {});
  const { tube, hand, C, strands } = MV.ART_HELPERS;
  const OL = C.ol;
  const st = (w = 4.2) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  // 顔の基本
  function faceBase(skin) {
    return `<path d="M96,150 C96,94 142,64 200,64 C258,64 304,94 304,150 C304,212 266,254 200,266 C134,254 96,212 96,150 Z" fill="${skin}" ${st(4.5)}/>`;
  }
  function eyeM(cx, cy, side, col, kind) {
    if (kind === 'happy') return `<path d="M${cx - 24},${cy + 8} C${cx - 14},${cy - 10} ${cx + 14},${cy - 10} ${cx + 24},${cy + 8}" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${cx + side * 22},${cy + 4} l${side * 8},4" ${st(3.5)}/>`;
    if (kind === 'wink') return `<path d="M${cx - 24},${cy + 2} L${cx + 22},${cy + 4}" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><path d="M${cx - side * 2},${cy + 4} q${side * 8},10 ${side * 20},8" ${st(3)} fill="none"/>`;
    // open (きらきら)
    const id = 'g' + Math.random().toString(36).slice(2, 8);
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col[1]}"/><stop offset="1" stop-color="${col[0]}"/></linearGradient></defs>` +
      `<ellipse cx="${cx}" cy="${cy + 4}" rx="27" ry="32" fill="#fff"/>` +
      `<ellipse cx="${cx}" cy="${cy + 6}" rx="22" ry="28" fill="url(#${id})" stroke="${col[1]}" stroke-width="3"/>` +
      `<ellipse cx="${cx}" cy="${cy + 8}" rx="9" ry="12" fill="${col[1]}"/>` +
      `<circle cx="${cx - side * 7}" cy="${cy - 6}" r="7" fill="#fff"/><circle cx="${cx + side * 8}" cy="${cy + 18}" r="3.5" fill="#fff"/>` +
      `<path d="M${cx - 30},${cy - 14} C${cx - 16},${cy - 30} ${cx + 16},${cy - 30} ${cx + 30},${cy - 12}" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
      `<path d="M${cx + side * 28},${cy - 14} l${side * 10},-6" ${st(4)}/>`;
  }
  function mouthBig(open = true) {
    return `<path d="M170,210 C172,250 228,250 230,210 Z" fill="${C.mouth}" ${st(4)}/><path d="M180,236 C190,226 210,226 220,236 C210,246 190,246 180,236 Z" fill="${C.tongue}"/>`;
  }
  function blushM() {
    let s = `<ellipse cx="136" cy="206" rx="24" ry="11" fill="${C.blush}" opacity=".55"/><ellipse cx="264" cy="206" rx="24" ry="11" fill="${C.blush}" opacity=".55"/>`;
    for (const x of [126, 138, 150, 254, 266, 278]) s += `<path d="M${x + 3},199 l-5,12" stroke="#e8577f" stroke-width="2.2" stroke-linecap="round"/>`;
    return s;
  }

  // 腕（ポーズ別）
  function arms(pose, cloth, clothD, skin, hk) {
    const H = (x, y, r, k, f) => MV.ART_HELPERS.hand(x, y, r, k, f, 1.35);
    let back = '', front = '';
    if (pose === 'fists') {
      front += tube('M92,350 Q70,300 104,262', 54, cloth, { shade: clothD, shadeOff: [8, 4] }) + H(108, 258, 10, 'fist', true);
      front += tube('M308,350 Q330,300 296,262', 54, cloth, { shade: clothD, shadeOff: [-8, 4] }) + H(292, 258, -10, 'fist', false);
    } else if (pose === 'cheeks') {
      front += tube('M92,360 Q80,300 112,250', 50, cloth, { shade: clothD, shadeOff: [8, 4] }) + H(114, 236, 16, 'open', true);
      front += tube('M308,360 Q320,300 288,250', 50, cloth, { shade: clothD, shadeOff: [-8, 4] }) + H(286, 236, -16, 'open', false);
    } else if (pose === 'up') {
      back += tube('M90,330 Q40,220 60,120', 50, cloth, { shade: clothD, shadeOff: [8, 4] }) + H(62, 104, -12, 'open', true);
      back += tube('M310,330 Q360,220 340,120', 50, cloth, { shade: clothD, shadeOff: [-8, 4] }) + H(338, 104, 12, 'open', false);
    }
    return { back, front };
  }

  function bodyBase(def) {
    let s = '';
    s += `<path d="M184,250 L184,290 L216,290 L216,250 Z" fill="${C.skinS}" ${st(4)}/>`;
    s += def.body;
    return s;
  }

  // ---- 個別デザイン ----
  const MOBS = {
    // オレンジ髪・ウインク・カーキジャケット
    taiyo: {
      skin: C.skin, eyes: ['wink', 'open'], eyeCol: ['#ffb24a', '#b4500e'],
      hairBack: `<path d="${strands([[100, 230], [86, 160], [100, 90], [200, 40], [300, 90], [314, 160], [300, 230]], 0.1)}" fill="#c4551b" ${st(4.5)}/>`,
      hairFront: (() => {
        const o = [[104, 236], [80, 196], [96, 176], [70, 136], [100, 120], [90, 80], [130, 76], [140, 36], [180, 52], [210, 18], [236, 50], [276, 34], [282, 70], [322, 72], [312, 110], [340, 132], [312, 150], [330, 190], [300, 200], [296, 236]];
        const i = [[288, 196], [282, 150], [262, 122], [258, 158], [236, 112], [224, 152], [204, 108], [192, 150], [170, 112], [160, 160], [138, 124], [128, 168], [112, 196]];
        return `<path d="${strands(o.concat(i), 0.2)}" fill="#f07b2e" ${st(4.5)}/><path d="M126,92 Q170,66 214,64" stroke="#ffb46e" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M244,70 Q276,80 292,104" stroke="#ffb46e" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      })(),
      body: `<path d="M60,440 C60,350 100,300 160,284 L200,330 L240,284 C300,300 340,350 340,440 Z" fill="#8d8a4c" ${st(4.5)}/>` +
        `<path d="M160,284 L200,330 L240,284 L232,440 L168,440 Z" fill="#ffffff" ${st(4)}/>` +
        `<path d="M160,284 L148,330 L176,340 L168,440 M240,284 L252,330 L224,340 L232,440" fill="none" stroke="#5f5d2f" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M70,420 C74,380 92,350 120,330" stroke="#6b6936" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>`,
      cloth: '#8d8a4c', clothD: '#6b6936',
    },
    // 青ロング・セーラー
    ao: {
      skin: C.skin, eyes: ['open', 'open'], eyeCol: ['#9cc4ff', '#2c4fa8'],
      hairBack: `<path d="${strands([[110, 120], [70, 200], [86, 260], [56, 320], [80, 380], [54, 440], [346, 440], [320, 380], [344, 320], [314, 260], [330, 200], [290, 120], [200, 50]], 0.22)}" fill="#2c4392" ${st(4.5)}/>`,
      hairFront: (() => {
        const o = [[106, 270], [92, 210], [96, 140], [130, 80], [200, 52], [270, 80], [304, 140], [308, 210], [294, 270]];
        const i = [[284, 220], [282, 150], [262, 112], [264, 152], [240, 104], [232, 146], [214, 102], [204, 140], [176, 104], [168, 146], [146, 112], [128, 156], [118, 220]];
        return `<path d="${strands(o.concat(i), 0.12)}" fill="#3d5cb8" ${st(4.5)}/><path d="M130,98 Q170,72 210,70" stroke="#7d9bea" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M240,74 Q276,86 290,118" stroke="#7d9bea" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      })(),
      body: `<path d="M70,440 C70,350 110,300 168,286 L232,286 C290,300 330,350 330,440 Z" fill="#f4f6ff" ${st(4.5)}/>` +
        `<path d="M150,290 L200,370 L250,290 L300,320 L268,350 L200,400 L132,350 L100,320 Z" fill="#26386e" ${st(4)}/>` +
        `<path d="M112,326 L138,346 M288,326 L262,346" stroke="#9fd4ff" stroke-width="5"/>` +
        `<path d="M184,372 L200,400 L216,372 L240,410 L200,430 L160,410 Z" fill="#e8455f" ${st(3.5)}/>`,
      cloth: '#f4f6ff', clothD: '#d4d8ee',
    },
    // 黒髪白メッシュ・バッテンピン・地雷系
    shiro: {
      skin: C.skin, eyes: ['happy', 'happy'], eyeCol: ['#c9a8ff', '#5b3b9a'],
      hairBack: `<path d="${strands([[106, 140], [86, 230], [70, 280], [98, 270], [104, 300], [130, 260], [270, 260], [296, 300], [302, 270], [330, 280], [314, 230], [294, 140], [200, 56]], 0.16)}" fill="#141218" ${st(4.5)}/>`,
      hairFront: (() => {
        const o = [[104, 262], [90, 200], [96, 136], [132, 80], [200, 54], [268, 80], [304, 136], [310, 200], [296, 262]];
        const i = [[284, 230], [284, 160], [264, 120], [262, 156], [238, 114], [228, 150], [208, 112], [200, 150], [178, 112], [166, 156], [146, 118], [128, 160], [116, 230]];
        return `<path d="${strands(o.concat(i), 0.12)}" fill="#1d1a24" ${st(4.5)}/>` +
          `<path d="M150,86 Q168,120 166,156 L146,118 L128,160 Q120,120 150,86 Z" fill="#f6f4fb" ${st(3.5)}/>` +
          `<g transform="translate(256,104) rotate(15)" stroke="${OL}" stroke-width="13" stroke-linecap="round"><path d="M-14,-14 L14,14 M14,-14 L-14,14"/></g>` +
          `<g transform="translate(256,104) rotate(15)" stroke="#c9a3ff" stroke-width="6" stroke-linecap="round"><path d="M-14,-14 L14,14 M14,-14 L-14,14"/></g>` +
          `<path d="M232,84 Q262,90 280,114" stroke="#46425a" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      })(),
      body: `<path d="M74,440 C74,352 112,302 168,288 L232,288 C288,302 326,352 326,440 Z" fill="#1d1a24" ${st(4.5)}/>` +
        `<path d="M150,292 C170,312 230,312 250,292 L246,320 C226,338 174,338 154,320 Z" fill="#fff" ${st(3.5)}/>` +
        `<path d="M176,282 L224,282 L222,294 L178,294 Z" fill="#1d1a24" ${st(3)}/><circle cx="200" cy="300" r="7" fill="#c9a3ff" ${st(3)}/>` +
        `<path d="M200,330 L200,440" stroke="#3a3646" stroke-width="5"/>`,
      cloth: '#1d1a24', clothD: '#0f0d14',
    },
    // 銀髪・青ジャケット
    gin: {
      skin: C.skin, eyes: ['happy', 'happy'], eyeCol: ['#cfd4e6', '#55607e'],
      hairBack: `<path d="${strands([[100, 230], [84, 160], [104, 86], [200, 40], [296, 86], [316, 160], [300, 230]], 0.1)}" fill="#8b8fa3" ${st(4.5)}/>`,
      hairFront: (() => {
        const o = [[102, 240], [80, 200], [94, 180], [74, 140], [98, 124], [92, 82], [136, 76], [150, 40], [190, 56], [222, 24], [250, 56], [290, 46], [292, 84], [326, 92], [310, 126], [334, 150], [310, 166], [326, 200], [298, 208], [298, 240]];
        const i = [[288, 200], [280, 150], [258, 120], [256, 160], [232, 112], [220, 156], [198, 110], [186, 154], [164, 114], [154, 162], [134, 128], [124, 170], [110, 200]];
        return `<path d="${strands(o.concat(i), 0.2)}" fill="#b5b8c6" ${st(4.5)}/><path d="M128,96 Q170,70 214,68" stroke="#e6e8f0" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M246,74 Q280,84 296,110" stroke="#e6e8f0" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      })(),
      body: `<path d="M60,440 C60,350 100,300 160,284 L200,330 L240,284 C300,300 340,350 340,440 Z" fill="#2d5db6" ${st(4.5)}/>` +
        `<path d="M160,284 L200,330 L240,284 L232,440 L168,440 Z" fill="#ffffff" ${st(4)}/>` +
        `<path d="M160,284 L148,330 L176,340 L168,440 M240,284 L252,330 L224,340 L232,440" fill="none" stroke="#1f468e" stroke-width="5" stroke-linejoin="round"/>`,
      cloth: '#2d5db6', clothD: '#1f468e',
    },
  };

  function mobSVG(key, pose) {
    const d = MOBS[key];
    const a = arms(pose, d.cloth, d.clothD, d.skin);
    let s = d.hairBack + a.back + bodyBase(d) + faceBase(d.skin);
    s += `<path d="M100,170 C120,150 160,140 200,140 C240,140 280,150 300,170" fill="none"/>`;
    s += eyeM(155, 176, -1, d.eyeCol, d.eyes[0]) + eyeM(245, 176, 1, d.eyeCol, d.eyes[1]);
    s += blushM() + mouthBig();
    s += d.hairFront + a.front;
    return s;
  }

  const P = {};
  for (const k of Object.keys(MOBS)) for (const pose of ['fists', 'cheeks', 'up']) P[`mob_${k}_${pose}`] = MV.svgWrap(mobSVG(k, pose), 400, 440, 2);
  MV.MOBPARTS = P;
  MV.MOB_KEYS = Object.keys(MOBS);
})();
