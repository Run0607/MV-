// =============================================================
//  キャラクター作画（SVGパーツ）
//  全パーツ共通座標系: viewBox 0 0 600 720 / 足元中心 = (300,660)
// =============================================================
(function () {
  const MV = (window.MV = window.MV || {});

  // ---- パレット ----------------------------------------------------
  const C = {
    ol: '#221d2b',          // 主線
    skin: '#fff4ee', skinS: '#f6d2c8', skinS2: '#eebcb1',
    hair: '#23202c', hairD: '#121018', hairH: '#4a4d80', hairHH: '#9aa0e6',
    cloth: '#24222b', clothD: '#141219', clothH: '#3c3a49', clothHH: '#55526a',
    string: '#e9e7f2',
    eyeW: '#ffffff', iris: '#b8bccc', irisD: '#5a5d70', irisL: '#e3e6f0', pupil: '#2c2b38',
    blush: '#ff8fb0', mouth: '#b8374f', tongue: '#ff8a9a',
    wing: '#ffffff', wingS: '#dfe3f6', wingS2: '#c4cbec', wingOl: '#3a3452',
    shoeSole: '#f2f0f7', earring: '#18161e',
  };
  MV.PAL = C;

  const W = 600, H = 720;
  const svg = (body, w = W, h = H, scale = 2) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * scale}" height="${h * scale}">${body}</svg>`;

  // 縁取りチューブ（袖・脚）
  let uid = 0;
  function tube(d, w, fill, opt = {}) {
    const olw = opt.olw ?? 4.5, ol = opt.ol ?? C.ol, id = 'm' + (uid++);
    let s = `<path d="${d}" fill="none" stroke="${ol}" stroke-width="${w + olw * 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (opt.shade) {
      const [dx, dy] = opt.shadeOff || [7, 5];
      s += `<mask id="${id}"><path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></mask>`;
      s += `<g mask="url(#${id})"><path d="${d}" transform="translate(${dx},${dy})" fill="none" stroke="${opt.shade}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (opt.hi) s += `<path d="${d}" transform="translate(${-w * 0.42},${-w * 0.18})" fill="none" stroke="${opt.hi}" stroke-width="${w * 0.28}" stroke-linecap="round" opacity=".9"/>`;
      s += `</g>`;
    }
    return s;
  }

  // ---- 手 -----------------------------------------------------------
  // ローカル座標: 手首 = (0,0)、指先は -y 方向
  function hand(x, y, rot, kind = 'open', flip = false, sc = 1) {
    const f = flip ? -1 : 1;
    let p = '';
    const st = `stroke="${C.ol}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"`;
    if (kind === 'open') {
      p += `<path d="M-13,4 C-15,-12 -15,-30 -10,-41 C-6,-48 6,-49 10,-42 C14,-33 15,-14 13,4 Z" fill="${C.skin}" ${st}/>`;
      p += `<path d="M12,-6 C20,-10 27,-18 24,-25 C21,-31 14,-27 11,-21" fill="${C.skin}" ${st}/>`;
      p += `<path d="M-4,-44 L-4,-31 M3.5,-45 L3.5,-32" stroke="${C.ol}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
      p += `<path d="M-9,-6 C-6,0 4,0 8,-4" stroke="${C.skinS2}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'fist') {
      p += `<path d="M-15,4 C-18,-10 -16,-26 -2,-28 C12,-29 18,-18 16,-4 C15,2 12,6 8,6 Z" fill="${C.skin}" ${st}/>`;
      p += `<path d="M-12,-14 C-6,-12 4,-12 12,-15 M-8,-27 L-8,-17 M0,-28 L0,-18 M7,-26 L7,-17" stroke="${C.ol}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'peace') {
      p += `<path d="M-13,4 C-15,-8 -14,-18 -8,-22 L4,-22 C12,-20 15,-8 13,4 Z" fill="${C.skin}" ${st}/>`;
      p += `<path d="M-8,-18 L-14,-48 C-15,-54 -6,-56 -5,-50 L0,-22" fill="${C.skin}" ${st}/>`;
      p += `<path d="M1,-21 L5,-52 C6,-58 15,-57 14,-50 L10,-19" fill="${C.skin}" ${st}/>`;
    }
    return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${f * sc},${sc})">${p}</g>`;
  }

  // 袖口（カフ）
  function cuff(x, y, rot, w = 46) {
    return `<g transform="translate(${x},${y}) rotate(${rot})"><path d="M${-w / 2},-6 C${-w / 2},6 ${w / 2},6 ${w / 2},-6 L${w / 2 - 2},8 C${w / 4},16 ${-w / 4},16 ${-w / 2 + 2},8 Z" fill="${C.clothD}" stroke="${C.ol}" stroke-width="4" stroke-linejoin="round"/></g>`;
  }

  const ang = (x1, y1, x2, y2) => (Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI;

  // 腕1本: 肩→肘→手首
  function arm(s, e, wr, handKind = 'open', handRot = null, flip = false, opts = {}) {
    const d = `M${s[0]},${s[1]} Q${e[0]},${e[1]} ${wr[0]},${wr[1]}`;
    const sw = opts.w || 44;
    const a = ang(e[0], e[1], wr[0], wr[1]);
    const hr = handRot == null ? a : handRot;
    // 手首から少し先に手
    const rad = (a * Math.PI) / 180;
    const hx = wr[0] + Math.sin(rad) * 6, hy = wr[1] - Math.cos(rad) * 6;
    let out = '';
    if (opts.handBehind) out += hand(hx, hy, hr, handKind, flip);
    out += tube(d, sw, C.cloth, { shade: C.clothD, shadeOff: opts.shadeOff || [8, 6], hi: C.clothH });
    // 皺
    out += `<path d="M${(s[0] + e[0]) / 2 - 6},${(s[1] + e[1]) / 2} q8,6 14,0" stroke="${C.clothD}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    out += cuff(wr[0], wr[1], a, sw + 6);
    if (!opts.handBehind) out += hand(hx, hy, hr, handKind, flip);
    return out;
  }

  // ---- 羽 -----------------------------------------------------------
  // 右羽（画面右）。付け根(0,0) 外側 +x
  function wingShape() {
    const ol = `stroke="${C.wingOl}" stroke-width="3.6" stroke-linejoin="round"`;
    let s = '';
    // 風切羽（長い羽）
    const prim = [
      [215, 10, 262, 34], [190, 22, 236, 58], [160, 30, 200, 76], [128, 34, 160, 86], [96, 34, 120, 88], [64, 30, 82, 80],
    ];
    for (const [x, y, tx, ty] of prim) {
      s += `<path d="M${x - 30},${y - 18} C${x - 10},${y + 10} ${tx - 22},${ty + 4} ${tx},${ty} C${tx + 4},${ty - 14} ${x + 22},${y - 20} ${x + 12},${y - 28} Z" fill="${C.wing}" ${ol}/>`;
      s += `<path d="M${x - 10},${y - 10} C${x + 2},${y + 8} ${tx - 18},${ty - 4} ${tx - 6},${ty - 6}" stroke="${C.wingS2}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    // 雨覆（上の丸い羽の層）
    s += `<path d="M-6,-30 C40,-52 150,-58 236,-26 C262,-16 278,-2 270,10 C262,20 246,14 236,8 C232,26 212,30 200,20 C196,36 176,40 164,28 C158,44 136,46 126,34 C120,48 98,50 90,38 C82,52 60,52 52,40 C40,50 18,46 10,32 C0,20 -10,-10 -6,-30 Z" fill="${C.wing}" ${ol}/>`;
    s += `<path d="M10,22 C60,8 160,4 250,0" stroke="${C.wingS}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>`;
    s += `<path d="M30,-24 C90,-38 170,-38 230,-18" stroke="${C.wingS}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // 羽の筋
    for (const x of [52, 90, 126, 164, 200, 236]) s += `<path d="M${x},${30 - x * 0.02} q4,-12 0,-22" stroke="${C.wingS2}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return s;
  }
  MV.wingShape = wingShape;

  // ---- 頭 ------------------------------------------------------------
  const HEAD = { cx: 300, neckY: 345 };

  // ギザギザ毛束パスを作る: pts=[[x,y],...] を曲線でつなぐ（bend で毛先のしなり）
  function strands(pts, bend = 0.18, close = true) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
      const k = (i % 2 ? 1 : -1) * bend;
      d += ` Q${(mx - dy * k).toFixed(1)},${(my + dx * k).toFixed(1)} ${x1},${y1}`;
    }
    return d + (close ? ' Z' : '');
  }

  function hairBack() {
    // 後ろ髪（襟足のハネ）
    const pts = [[176, 300], [150, 330], [158, 296], [132, 300], [146, 262], [140, 220], [300, 150], [460, 220], [454, 262], [468, 300], [442, 296], [450, 330], [424, 300]];
    return `<path d="${strands(pts, 0.12)}" fill="${C.hairD}" stroke="${C.ol}" stroke-width="4.5" stroke-linejoin="round"/>`;
  }
  function face() {
    let s = '';
    // 耳
    s += `<path d="M168,232 C150,226 146,254 156,270 C162,282 172,284 178,278 Z" fill="${C.skin}" stroke="${C.ol}" stroke-width="4"/>`;
    s += `<path d="M432,232 C450,226 454,254 444,270 C438,282 428,284 422,278 Z" fill="${C.skin}" stroke="${C.ol}" stroke-width="4"/>`;
    s += `<path d="M160,246 c4,4 6,12 4,18 M440,246 c-4,4 -6,12 -4,18" stroke="${C.skinS2}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    // ピアス（キャラ左耳=画面右）
    s += `<circle cx="446" cy="284" r="9.5" fill="none" stroke="${C.ol}" stroke-width="8"/><circle cx="446" cy="284" r="9.5" fill="none" stroke="#3c3a4a" stroke-width="3.2"/>`;
    // 顔
    s += `<path d="M170,196 C170,128 228,92 300,92 C372,92 430,128 430,196 C430,266 392,326 300,348 C208,326 170,266 170,196 Z" fill="${C.skin}" stroke="${C.ol}" stroke-width="4.5"/>`;
    // 前髪の影
    s += `<path d="M176,230 L198,256 L214,214 L232,252 L250,210 L266,250 L286,212 L300,270 L318,212 L336,248 L352,210 L370,252 L388,212 L404,256 L424,230 L424,170 L176,170 Z" fill="${C.skinS}" stroke="${C.skinS}" stroke-width="10" stroke-linejoin="round"/>`;
    // 首の影（あご下）
    return s;
  }

  // 目のパーツ ---------------------------------------------------------
  function eyeOpen(cx, cy, side, opt = {}) {
    // side: -1 = 画面左, 1 = 画面右
    const lid = opt.lid ?? 0;           // 0=全開, 1=半目
    const id = 'e' + (uid++);
    const rx = 36, ry = 39;
    const top = cy - ry + lid * 26;
    const out = cx + side * rx, inn = cx - side * rx * 0.86;
    // 白目（下ぶくれのアーモンド）
    const white = `M${inn},${cy - 4 + lid * 12} C${inn},${top - 2} ${out},${top - 8 - lid * 2} ${out + side * 2},${cy - 6 + lid * 8} C${out},${cy + 22} ${cx + side * 14},${cy + ry - 2} ${cx - side * 2},${cy + ry - 4} C${inn + side * 6},${cy + ry - 6} ${inn - side * 2},${cy + 12} ${inn},${cy - 4 + lid * 12} Z`;
    let s = `<clipPath id="${id}"><path d="${white}"/></clipPath>`;
    s += `<path d="${white}" fill="${C.eyeW}"/>`;
    const ix = cx + (opt.look || 0) * 6, iy = cy + 4 + (opt.lookY || 0);
    const ir = opt.small ? 16 : 27;
    s += `<g clip-path="url(#${id})">`;
    s += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.irisD}"/><stop offset=".55" stop-color="${C.iris}"/><stop offset="1" stop-color="${C.irisL}"/></linearGradient></defs>`;
    s += `<ellipse cx="${ix}" cy="${iy}" rx="${ir}" ry="${ir * 1.18}" fill="url(#${id}g)" stroke="${C.irisD}" stroke-width="3"/>`;
    if (opt.ring !== false) s += `<ellipse cx="${ix}" cy="${iy}" rx="${ir * 0.62}" ry="${ir * 0.74}" fill="none" stroke="${C.irisD}" stroke-width="2" opacity=".7"/>`;
    s += `<ellipse cx="${ix}" cy="${iy + 1}" rx="${ir * 0.36}" ry="${ir * 0.46}" fill="${C.pupil}"/>`;
    // 上まぶたの影
    s += `<path d="M${cx - 50},${top - 30} L${cx + 50},${top - 30} L${cx + 50},${top + 10} C${cx + 20},${top + 2} ${cx - 20},${top + 2} ${cx - 50},${top + 10} Z" fill="${C.irisD}" opacity=".35"/>`;
    // ハイライト
    s += `<circle cx="${ix - side * 9}" cy="${iy - 10}" r="${opt.small ? 4 : 6.5}" fill="#fff"/><circle cx="${ix + side * 9}" cy="${iy + 12}" r="3" fill="#fff" opacity=".9"/>`;
    s += `</g>`;
    // 上まぶた（太い線）
    const lt = top - 2;
    s += `<path d="M${inn - side * 3},${cy - 2 + lid * 12} C${inn + side * 4},${lt - 6} ${out - side * 10},${lt - 10} ${out + side * 6},${cy - 10 + lid * 8}" stroke="${C.ol}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    // まつげ（外側の跳ね）
    s += `<path d="M${out + side * 2},${cy - 8 + lid * 8} l${side * 12},-6 M${out},${cy - 2 + lid * 8} l${side * 10},2" stroke="${C.ol}" stroke-width="4" stroke-linecap="round"/>`;
    // 下まぶた
    s += `<path d="M${cx - side * 4},${cy + ry - 2} q${side * 14},0 ${side * 22},-8" stroke="${C.ol}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return s;
  }
  function eyeClosedSmile(cx, cy, side) { // ⌒ 笑顔閉じ
    return `<path d="M${cx - 28},${cy + 8} C${cx - 16},${cy - 10} ${cx + 16},${cy - 10} ${cx + 28},${cy + 8}" stroke="${C.ol}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M${cx + side * 26},${cy + 6} l${side * 9},4" stroke="${C.ol}" stroke-width="4" stroke-linecap="round"/>`;
  }
  function eyeClosedCalm(cx, cy, side) { // ‿ 穏やか閉じ
    return `<path d="M${cx - 30},${cy + 2} C${cx - 16},${cy + 16} ${cx + 16},${cy + 16} ${cx + 30},${cy + 2}" stroke="${C.ol}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M${cx + side * 28},${cy + 3} l${side * 10},-3 M${cx + side * 20},${cy + 11} l${side * 6},7 M${cx + side * 8},${cy + 14} l${side * 2},8" stroke="${C.ol}" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  function eyeX(cx, cy, side) { // > <
    const d = side < 0 ? `M${cx - 22},${cy - 18} L${cx + 18},${cy} L${cx - 22},${cy + 18}` : `M${cx + 22},${cy - 18} L${cx - 18},${cy} L${cx + 22},${cy + 18}`;
    return `<path d="${d}" stroke="${C.ol}" stroke-width="7.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function eyeSpiral(cx, cy) {
    let d = `M${cx},${cy}`;
    for (let a = 0; a < Math.PI * 6; a += 0.3) {
      const r = 2 + a * 1.5;
      d += ` L${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 1.1).toFixed(1)}`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="31" fill="#fff" stroke="${C.ol}" stroke-width="4"/><path d="${d}" stroke="${C.ol}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  }
  function eyeBlink(cx, cy, side) {
    return `<path d="M${cx - 30},${cy + 10} C${cx - 14},${cy + 16} ${cx + 14},${cy + 16} ${cx + 30},${cy + 10}" stroke="${C.ol}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M${cx + side * 28},${cy + 10} l${side * 10},-4" stroke="${C.ol}" stroke-width="4" stroke-linecap="round"/>`;
  }
  function brows(kind) {
    // 前髪の上に描く眉（半透明の前髪越し風）
    if (kind === 'angry') return `<path d="M208,206 L270,226 M392,206 L330,226" stroke="${C.ol}" stroke-width="7" stroke-linecap="round"/>`;
    if (kind === 'worry') return `<path d="M212,222 L268,208 M388,222 L332,208" stroke="${C.ol}" stroke-width="6" stroke-linecap="round"/>`;
    if (kind === 'smug') return `<path d="M214,212 Q240,204 268,212 M332,206 Q362,198 388,208" stroke="${C.ol}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    return '';
  }

  function eyes(kind) {
    const L = [240, 266], R = [360, 266];
    switch (kind) {
      case 'half': return eyeOpen(L[0], L[1], -1, { lid: 0.9, look: 0.3 }) + eyeOpen(R[0], R[1], 1, { lid: 0.9, look: 0.3 });
      case 'open': return eyeOpen(L[0], L[1], -1) + eyeOpen(R[0], R[1], 1);
      case 'small': return eyeOpen(L[0], L[1], -1, { small: true, ring: false }) + eyeOpen(R[0], R[1], 1, { small: true, ring: false });
      case 'side': return eyeOpen(L[0], L[1], -1, { lid: 0.7, look: 1.6 }) + eyeOpen(R[0], R[1], 1, { lid: 0.7, look: 1.6 });
      case 'angry': return eyeOpen(L[0], L[1], -1, { lid: 0.55, small: true }) + eyeOpen(R[0], R[1], 1, { lid: 0.55, small: true });
      case 'up': return eyeOpen(L[0], L[1], -1, { lookY: -8 }) + eyeOpen(R[0], R[1], 1, { lookY: -8 });
      case 'closed': return eyeClosedCalm(L[0], L[1], -1) + eyeClosedCalm(R[0], R[1], 1);
      case 'happy': return eyeClosedSmile(L[0], L[1], -1) + eyeClosedSmile(R[0], R[1], 1);
      case 'wink': return eyeClosedSmile(L[0], L[1], -1) + eyeOpen(R[0], R[1], 1);
      case 'x': return eyeX(L[0], L[1], -1) + eyeX(R[0], R[1], 1);
      case 'spiral': return eyeSpiral(L[0], L[1]) + eyeSpiral(R[0], R[1]);
      case 'blink': return eyeBlink(L[0], L[1], -1) + eyeBlink(R[0], R[1], 1);
      case 'down': return eyeOpen(L[0], L[1], -1, { lid: 1.05, lookY: 6 }) + eyeOpen(R[0], R[1], 1, { lid: 1.05, lookY: 6 });
    }
    return '';
  }

  function mouth(kind) { const m = mouthRaw(kind); return m ? `<g transform="translate(0,9)">${m}</g>` : ''; }
  function mouthRaw(kind) {
    const o = `stroke="${C.ol}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
    switch (kind) {
      case 'smirk': return `<path d="M282,312 C292,318 306,318 318,306" fill="none" ${o}/>`;
      case 'flat': return `<path d="M287,314 L313,314" fill="none" ${o}/>`;
      case 'smile': return `<path d="M280,306 C290,322 310,322 320,306" fill="none" ${o}/>`;
      case 'open': return `<path d="M280,304 C282,330 318,330 320,304 Z" fill="${C.mouth}" ${o}/><path d="M287,320 C294,314 306,314 313,320 C306,327 294,327 287,320Z" fill="${C.tongue}"/>`;
      case 'big': return `<path d="M272,300 C272,340 328,340 328,300 Z" fill="${C.mouth}" ${o}/><path d="M282,324 C292,314 308,314 318,324 C308,334 292,334 282,324Z" fill="${C.tongue}"/>`;
      case 'o': return `<ellipse cx="300" cy="314" rx="10" ry="12" fill="${C.mouth}" ${o}/>`;
      case 'talk': return `<path d="M286,308 C288,324 312,324 314,308 Z" fill="${C.mouth}" ${o}/>`;
      case 'grin': return `<path d="M268,304 C272,330 328,330 332,304 Z" fill="#fff" ${o}/><path d="M270,316 L330,316 M286,306 L286,326 M300,306 L300,328 M314,306 L314,326" stroke="${C.ol}" stroke-width="2.4"/>`;
      case 'wavy': return `<path d="M278,314 q6,-8 11,0 q6,8 11,0 q6,-8 11,0 q6,8 11,0" fill="none" ${o}/>`;
      case 'fang': return `<path d="M280,304 C284,326 316,326 320,304 Z" fill="${C.mouth}" ${o}/><path d="M290,305 l4,8 l4,-8 Z" fill="#fff" stroke="${C.ol}" stroke-width="1.6"/>`;
      case 'pout': return `<path d="M288,316 q12,-8 24,0" fill="none" ${o}/>`;
    }
    return '';
  }

  function blush(on, strong) {
    if (!on) return '';
    let s = `<ellipse cx="222" cy="302" rx="28" ry="12" fill="${C.blush}" opacity="${strong ? .7 : .45}"/><ellipse cx="378" cy="302" rx="28" ry="12" fill="${C.blush}" opacity="${strong ? .7 : .45}"/>`;
    for (const x of [208, 220, 232, 364, 376, 388]) s += `<path d="M${x + 4},${294} l-6,14" stroke="#e8577f" stroke-width="2.4" stroke-linecap="round"/>`;
    return s;
  }

  function hairFront() {
    let s = '';
    const ol = `stroke="${C.ol}" stroke-width="4.5" stroke-linejoin="round"`;
    // 外側シルエット（ボサッと外ハネ）→ 前髪の毛先（内側）を一筆で
    const outer = [
      [164, 322], [148, 282], [130, 270], [146, 242], [126, 210], [148, 192], [136, 156], [166, 136], [168, 98], [206, 90],
      [228, 58], [268, 64], [300, 40], [330, 62], [372, 56], [396, 90], [432, 98], [436, 136], [466, 156], [452, 192],
      [474, 210], [454, 242], [470, 270], [452, 282], [436, 322],
    ];
    const inner = [
      [428, 282], [424, 236], [412, 208], [404, 244], [388, 198], [370, 240], [352, 196], [336, 236], [318, 198],
      [300, 256], [286, 198], [266, 238], [250, 196], [232, 240], [214, 200], [198, 244], [186, 210], [176, 238], [172, 282],
    ];
    s += `<path d="${strands(outer.concat(inner), 0.2)}" fill="${C.hair}" ${ol}/>`;
    s += `<path d="M296,46 C292,22 306,8 326,10 C312,18 306,30 310,46 Z" fill="${C.hair}" ${ol}/>`;
    // 前髪の重なり（中くらいの束）
    s += `<path d="${strands([[230, 120], [214, 168], [236, 150], [234, 210], [256, 160], [270, 214], [282, 150], [258, 120]], 0.14)}" fill="${C.hair}" stroke="${C.ol}" stroke-width="3.2" stroke-linejoin="round"/>`;
    s += `<path d="${strands([[352, 116], [376, 160], [362, 152], [366, 204], [342, 160], [330, 210], [320, 150], [334, 118]], 0.14)}" fill="${C.hair}" stroke="${C.ol}" stroke-width="3.2" stroke-linejoin="round"/>`;
    // 毛流れの線
    const lines = ['M300,70 Q270,120 262,170', 'M300,70 Q336,118 344,170', 'M240,92 Q214,140 206,190', 'M362,94 Q392,140 398,186', 'M178,170 Q166,230 168,300', 'M424,170 Q436,230 434,300', 'M300,72 Q304,130 300,180'];
    for (const d of lines) s += `<path d="${d}" stroke="${C.hairD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    // ツヤ（細い三日月を数本）
    const gl = (x1, y1, cx, cy, x2, y2, w) => `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2} Q${cx + w * 0.3},${cy + w} ${x1},${y1} Z" fill="${C.hairH}"/>`;
    s += gl(184, 168, 196, 126, 236, 100, 18) + gl(366, 100, 406, 126, 418, 168, 18);
    s += `<path d="M214,122 l10,-10 M232,108 l8,-8 M372,104 l8,8 M392,118 l8,10" stroke="${C.hairHH}" stroke-width="4" stroke-linecap="round"/>`;
    return s;
  }

  function headSVG(eyesKind, mouthKind, opt = {}) {
    let s = face();
    s += eyes(eyesKind);
    s += `<path d="M298,300 l3,4" stroke="${C.skinS2}" stroke-width="3.2" stroke-linecap="round"/>`; // 鼻
    s += mouth(mouthKind);
    s += blush(opt.blush !== false, opt.blushStrong);
    s += hairFront();
    s += brows(opt.brows);
    if (opt.sweat) s += `<path d="M420,190 C410,206 408,218 418,222 C428,224 430,210 420,190 Z" fill="#bfefff" stroke="${C.ol}" stroke-width="3"/>`;
    if (opt.vein) s += `<g transform="translate(410,120)" stroke="#ff3d6e" stroke-width="6" stroke-linecap="round" fill="none"><path d="M-14,-4 q10,2 12,-12 M4,-16 q2,10 14,12 M18,4 q-10,2 -12,12 M-2,18 q-2,-10 -14,-12"/></g>`;
    return s;
  }

  // ---- 体 ------------------------------------------------------------
  function torso() {
    let s = '';
    const ol = `stroke="${C.ol}" stroke-width="4.5" stroke-linejoin="round"`;
    // 首
    s += `<path d="M284,330 L284,362 L316,362 L316,330 Z" fill="${C.skinS}" ${ol}/>`;
    // フード（首回り）
    s += `<path d="M236,352 C250,336 274,334 300,346 C326,334 350,336 364,352 C352,372 330,378 300,374 C270,378 248,372 236,352 Z" fill="${C.clothH}" ${ol}/>`;
    // 胴体
    s += `<path d="M234,368 C220,376 214,398 214,430 C214,452 216,470 218,486 L382,486 C384,470 386,452 386,430 C386,398 380,376 366,368 C346,378 326,382 300,380 C274,382 254,378 234,368 Z" fill="${C.cloth}" ${ol}/>`;
    // 影
    s += `<path d="M300,380 C300,420 302,456 304,486 L382,486 C384,470 386,452 386,430 C386,398 380,376 366,368 C346,378 326,382 300,380 Z" fill="${C.clothD}" opacity=".7"/>`;
    // 裾リブ
    s += `<path d="M218,470 L382,470 L384,492 L216,492 Z" fill="${C.clothD}" ${ol}/>`;
    for (let x = 230; x < 380; x += 12) s += `<path d="M${x},474 L${x},488" stroke="${C.cloth}" stroke-width="2.4"/>`;
    // 紐
    s += `<path d="M288,370 C286,392 284,410 282,428 M312,370 C314,392 316,412 318,432" stroke="${C.ol}" stroke-width="7.5" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M288,370 C286,392 284,410 282,428 M312,370 C314,392 316,412 318,432" stroke="${C.string}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="277" y="426" width="10" height="14" rx="3" fill="#9a98a8" stroke="${C.ol}" stroke-width="3"/><rect x="313" y="430" width="10" height="14" rx="3" fill="#9a98a8" stroke="${C.ol}" stroke-width="3"/>`;
    // 縁のツヤ
    s += `<path d="M226,392 C222,412 222,440 224,462" stroke="${C.clothHH}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return s;
  }

  // 脚: kind = 'straight' | 'bent' | 'step'; side = -1(画面左) / 1
  function leg(side, kind) {
    const hx = 300 + side * 34;
    let d, foot;
    if (kind === 'straight') { d = `M${hx},486 L${hx + side * 4},560 L${hx + side * 6},626`; foot = [hx + side * 8, 640, side * 4]; }
    else if (kind === 'bent') { d = `M${hx},486 Q${hx - side * 4},548 ${300 - side * 2},572 L${300 + side * 18},628`; foot = [300 + side * 22, 638, side * -10]; }
    else { d = `M${hx},486 Q${hx + side * 30},540 ${hx + side * 34},580 L${hx + side * 40},626`; foot = [hx + side * 44, 640, side * 8]; }
    let s = tube(d, 50, C.cloth, { shade: C.clothD, shadeOff: [side * -8, 4], hi: null });
    // 靴
    const [fx, fy, fr] = foot;
    s += `<g transform="translate(${fx},${fy}) rotate(${fr}) scale(${side},1)">` +
      `<path d="M-26,-14 C-26,-24 6,-26 16,-18 C28,-12 38,-6 38,4 C38,12 -26,12 -28,4 Z" fill="${C.clothD}" stroke="${C.ol}" stroke-width="4.5" stroke-linejoin="round"/>` +
      `<path d="M-28,2 C-10,8 20,8 38,2 L38,8 C20,16 -10,16 -28,8 Z" fill="${C.shoeSole}" stroke="${C.ol}" stroke-width="3.5"/>` +
      `<path d="M-8,-20 q8,6 16,2" stroke="${C.string}" stroke-width="3" fill="none"/></g>`;
    return s;
  }

  // ---- ポーズ ----------------------------------------------------------
  // 各ポーズの腕: front=頭より前に描く
  const SL = [234, 382], SR = [366, 382];
  const POSES = {
    cross: {
      L: { s: SL, e: [204, 438], w: [322, 338], hand: 'open', hr: 22, front: true },
      R: { s: SR, e: [396, 438], w: [278, 338], hand: 'open', hr: -22, flip: true, front: true },
      order: ['L', 'R'],
    },
    cross2: { // ×の別フレーム（少し低め）
      L: { s: SL, e: [206, 446], w: [326, 350], hand: 'open', hr: 30, front: true },
      R: { s: SR, e: [394, 446], w: [274, 350], hand: 'open', hr: -30, flip: true, front: true },
      order: ['L', 'R'],
    },
    shrug: {
      L: { s: SL, e: [190, 440], w: [140, 386], hand: 'open', hr: -62, flip: true },
      R: { s: SR, e: [410, 440], w: [460, 386], hand: 'open', hr: 62 },
      order: ['L', 'R'],
    },
    shrug2: {
      L: { s: SL, e: [186, 432], w: [132, 370], hand: 'open', hr: -50, flip: true },
      R: { s: SR, e: [414, 432], w: [468, 370], hand: 'open', hr: 50 },
      order: ['L', 'R'],
    },
    heart: {
      L: { s: SL, e: [206, 446], w: [270, 420], hand: 'none', front: true },
      R: { s: SR, e: [394, 446], w: [330, 420], hand: 'none', front: true },
      order: ['L', 'R'], heart: true,
    },
    wave: {
      L: { s: SL, e: [176, 404], w: [112, 398], hand: 'open', hr: -96, flip: true },
      R: { s: SR, e: [414, 446], w: [432, 384], hand: 'peace', hr: 22, front: true },
      order: ['L', 'R'],
    },
    wave2: {
      L: { s: SL, e: [176, 398], w: [110, 384], hand: 'open', hr: -104, flip: true },
      R: { s: SR, e: [416, 442], w: [438, 378], hand: 'peace', hr: 30, front: true },
      order: ['L', 'R'],
    },
    prayer: {
      L: { s: SL, e: [218, 446], w: [290, 382], hand: 'none', front: true },
      R: { s: SR, e: [382, 446], w: [310, 382], hand: 'none', front: true },
      order: ['L', 'R'], prayer: true,
    },
    down: {
      L: { s: SL, e: [220, 438], w: [212, 482], hand: 'open', hr: 180 },
      R: { s: SR, e: [380, 438], w: [388, 482], hand: 'open', hr: 180, flip: true },
      order: ['L', 'R'],
    },
    fist: { // ドヤ・ガッツ
      L: { s: SL, e: [196, 444], w: [236, 392], hand: 'fist', hr: 10, front: true },
      R: { s: SR, e: [404, 444], w: [364, 392], hand: 'fist', hr: -10, flip: true, front: true },
      order: ['L', 'R'],
    },
    point: { // 片手を口元・片手は腰
      L: { s: SL, e: [200, 450], w: [262, 470], hand: 'fist', hr: 120 },
      R: { s: SR, e: [404, 446], w: [338, 334], hand: 'open', hr: -40, flip: true, front: true },
      order: ['L', 'R'],
    },
  };
  MV.POSES = POSES;

  function heartHands() {
    // 胸の前で作るハート
    const d = 'M300,446 C282,430 262,416 262,396 C262,380 278,372 290,380 C296,384 300,392 300,398 C300,392 304,384 310,380 C322,372 338,380 338,396 C338,416 318,430 300,446 Z';
    return `<path d="${d}" fill="none" stroke="${C.ol}" stroke-width="34" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${C.skin}" stroke-width="25" stroke-linejoin="round"/>` +
      `<path d="M288,384 l-4,-8 M312,384 l4,-8 M276,394 l-8,-2 M324,394 l8,-2" stroke="${C.ol}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  function prayerHands() {
    return hand(292, 386, 6, 'open', true) + hand(308, 386, -6, 'open', false) +
      `<path d="M300,384 L300,346" stroke="${C.ol}" stroke-width="3" stroke-linecap="round"/>`;
  }

  function armSVG(poseName, sideKey) {
    const P = POSES[poseName], a = P[sideKey];
    let s = arm(a.s, a.e, a.w, a.hand === 'none' ? 'open' : a.hand, a.hr ?? null, !!a.flip, { shadeOff: sideKey === 'L' ? [8, 6] : [-8, 6] });
    if (a.hand === 'none') {
      // 手は別描画（ハート/合掌）。袖だけ欲しいので hand を消す
      s = tube(`M${a.s[0]},${a.s[1]} Q${a.e[0]},${a.e[1]} ${a.w[0]},${a.w[1]}`, 44, C.cloth, { shade: C.clothD, shadeOff: sideKey === 'L' ? [8, 6] : [-8, 6], hi: C.clothH });
      s += cuff(a.w[0], a.w[1], ang(a.e[0], a.e[1], a.w[0], a.w[1]), 50);
    }
    if (sideKey === 'R' && P.heart) s = heartHands() + s;
    if (sideKey === 'R' && P.prayer) s = s + prayerHands();
    return s;
  }

  // 体育座り（腕で膝を抱える）: 首位置は (300,345) のまま、全体を下にずらして使う
  function sitBody() {
    let s = '';
    const ol = `stroke="${C.ol}" stroke-width="4.5" stroke-linejoin="round"`;
    // 小さくたたんだ羽
    s += `<g transform="translate(212,560) scale(-0.5,0.5) rotate(-8)">${wingShape()}</g>`;
    s += `<g transform="translate(388,560) scale(0.5,0.5) rotate(-8)">${wingShape()}</g>`;
    // お尻・足
    s += `<path d="M222,560 C214,600 230,624 300,626 C370,624 386,600 378,560 Z" fill="${C.clothD}" ${ol}/>`;
    // 胴（前かがみ）
    s += `<path d="M284,330 L284,362 L316,362 L316,330 Z" fill="${C.skinS}" ${ol}/>`;
    s += `<path d="M236,352 C250,336 274,334 300,346 C326,334 350,336 364,352 C352,372 330,378 300,374 C270,378 248,372 236,352 Z" fill="${C.clothH}" ${ol}/>`;
    s += `<path d="M232,370 C214,400 212,480 222,566 L378,566 C388,480 386,400 368,370 C346,380 326,384 300,382 C274,384 254,380 232,370 Z" fill="${C.cloth}" ${ol}/>`;
    // 膝（2つ）
    s += tube('M262,600 Q250,520 262,440', 62, C.cloth, { shade: C.clothD, shadeOff: [8, 0] });
    s += tube('M338,600 Q350,520 338,440', 62, C.cloth, { shade: C.clothD, shadeOff: [-8, 0] });
    // 足先
    for (const sd of [-1, 1]) {
      const fx = 300 + sd * 52;
      s += `<g transform="translate(${fx},632) scale(${sd},1)"><path d="M-22,-12 C-20,-22 10,-22 20,-14 C30,-8 34,0 32,6 L-24,6 Z" fill="${C.clothD}" ${ol}/><path d="M-24,2 L32,2 L32,8 L-24,8Z" fill="${C.shoeSole}" stroke="${C.ol}" stroke-width="3.5"/></g>`;
    }
    // 腕（膝を抱える）
    s += tube('M236,388 Q206,470 250,500 Q290,512 336,490', 42, C.cloth, { shade: C.clothD, shadeOff: [0, 6], hi: C.clothH });
    s += tube('M364,388 Q394,470 350,500 Q310,512 264,490', 42, C.cloth, { shade: C.clothD, shadeOff: [0, 6], hi: C.clothH });
    s += hand(332, 486, 64, 'fist', false, 0.95) + hand(268, 486, -64, 'fist', true, 0.95);
    return s;
  }

  // ---- 書き出し ------------------------------------------------------
  const PARTS = {};
  function add(name, body, w, h, scale) { PARTS[name] = svg(body, w, h, scale); }

  add('hairBack', hairBack());
  add('torso', torso());
  add('sitBody', sitBody());
  for (const side of [-1, 1]) for (const k of ['straight', 'bent', 'step']) add(`leg_${side}_${k}`, leg(side, k));
  for (const p of Object.keys(POSES)) { add(`arm_${p}_L`, armSVG(p, 'L')); add(`arm_${p}_R`, armSVG(p, 'R')); }
  // 羽は専用キャンバス（付け根を中心に回転させるため）
  add('wing', `<g transform="translate(20,90)">${wingShape()}</g>`, 300, 200);

  const EXPR = {
    smug: { e: 'half', m: 'smirk' },
    smugOpen: { e: 'half', m: 'fang', brows: 'smug' },
    normal: { e: 'open', m: 'flat' },
    talk: { e: 'open', m: 'talk' },
    wink: { e: 'wink', m: 'open' },
    x: { e: 'x', m: 'big' },
    xSmile: { e: 'x', m: 'smile' },
    spiral: { e: 'spiral', m: 'wavy', sweat: true },
    shock: { e: 'small', m: 'o', sweat: true },
    closed: { e: 'closed', m: 'smile' },
    happy: { e: 'happy', m: 'open' },
    angry: { e: 'angry', m: 'grin', brows: 'angry', vein: true },
    grin: { e: 'open', m: 'grin', brows: 'angry' },
    pout: { e: 'side', m: 'pout', sweat: true },
    worry: { e: 'down', m: 'flat', brows: 'worry', blush: false },
    sad: { e: 'down', m: 'pout', brows: 'worry' },
    up: { e: 'up', m: 'o' },
    blink: { e: 'blink', m: 'smirk' },
    blinkFlat: { e: 'blink', m: 'flat' },
    blinkTalk: { e: 'blink', m: 'talk' },
    smile: { e: 'open', m: 'smile' },
  };
  MV.EXPR = EXPR;
  for (const [k, v] of Object.entries(EXPR)) add(`head_${k}`, headSVG(v.e, v.m, v));

  MV.SVGPARTS = PARTS;
  MV.headSVG = headSVG;
  MV.svgWrap = svg;
  MV.ART_HELPERS = { tube, hand, C, strands, eyeOpen };
})();
