// =============================================================
//  描画エンジン: ユーティリティ / 文字 / 吹き出し / 背景 / エフェクト
// =============================================================
(function () {
  const MV = (window.MV = window.MV || {});
  const W = 1280, H = 720;
  MV.W = W; MV.H = H;
  MV.BPM = 180; MV.BPS = MV.BPM / 60;

  // ---- 基本 -------------------------------------------------------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    lin: (t) => t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => { const c1 = 2.0, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  };
  const prog = (t, a, d) => clamp((t - a) / d);
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  // キーフレーム: [[t, v...], ...] から t 以前の最後を返す
  function keyAt(list, t) { let r = list[0]; for (const k of list) { if (k[0] <= t) r = k; else break; } return r; }
  Object.assign(MV, { clamp, lerp, E, prog, rng, keyAt });

  // ---- 色 -----------------------------------------------------------
  MV.COL = {
    mint: '#47e4e4', mintD: '#2bbfc4', pink: '#ff4fae', white: '#ffffff', black: '#17141d', violet: '#6f4cff', red: '#ff3d6e', teal: '#1e6f73',
  };
  const TXT = { white: '#ffffff', pink: '#ff4fae', black: '#17141d', violet: '#6f4cff', red: '#ff3d6e' };
  MV.TXT = TXT;

  // ---- 文字 ---------------------------------------------------------
  const FONT_BIG = '"Dela", "MaruK", sans-serif';
  const FONT_MARU = '"MaruK", sans-serif';
  MV.FONT_BIG = FONT_BIG; MV.FONT_MARU = FONT_MARU;

  // 1文字ずつポップ（拡大→等倍）
  function popChar(ctx, ch, x, y, size, color, lt, i, opt = {}) {
    const d = opt.stagger ?? 0.022;
    const p = clamp((lt - i * d) / 0.11);
    if (p <= 0) return;
    const s = opt.noPop ? 1 : lerp(1.35, 1, E.outBack(p));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (opt.rot) ctx.rotate(opt.rot);
    ctx.globalAlpha *= clamp(p * 2.5);
    ctx.font = `${size}px ${opt.font || FONT_BIG}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (opt.stroke) { ctx.lineWidth = opt.strokeW || size * 0.14; ctx.strokeStyle = opt.stroke; ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0); }
    if (opt.shadow) { ctx.fillStyle = opt.shadow; ctx.fillText(ch, size * 0.06, size * 0.06); }
    ctx.fillStyle = color;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
  MV.popChar = popChar;

  // 横幅いっぱいに均等割りで並べる（本家っぽい巨大文字）
  function spreadLine(ctx, text, y, lt, color, opt = {}) {
    const chars = [...text];
    const x0 = opt.x0 ?? 40, x1 = opt.x1 ?? W - 40;
    const n = chars.length;
    const step = (x1 - x0) / n;
    const size = Math.min(opt.max || 180, step * (opt.fill || 0.98));
    chars.forEach((ch, i) => popChar(ctx, ch, x0 + step * (i + 0.5), y, size, color, lt, i, opt));
    return size;
  }
  // 中央寄せ1行（自動縮小）
  function centerLine(ctx, text, x, y, lt, color, size, maxW, opt = {}) {
    ctx.font = `${size}px ${opt.font || FONT_BIG}`;
    const chars = [...text];
    let w = 0; const ws = chars.map((c) => { const m = ctx.measureText(c).width; w += m; return m; });
    const sp = opt.spacing || 0;
    w += sp * (chars.length - 1);
    let sc = 1; if (w > maxW) sc = maxW / w;
    const sz = size * sc;
    let px = x - (w * sc) / 2;
    chars.forEach((c, i) => { const cw = ws[i] * sc; popChar(ctx, c, px + cw / 2, y, sz, color, lt, i, opt); px += cw + sp * sc; });
  }
  MV.spreadLine = spreadLine; MV.centerLine = centerLine;

  // 縦書き（吹き出し用）: 列は右→左
  const ROT_CH = 'ー〜～…‥―-－「」（）()';
  const SMALL_SHIFT = '、。，．';
  function vText(ctx, text, x, y, size, color, opt = {}) {
    const cols = text.split('\n');
    const lh = size * (opt.lh || 1.04), cg = size * (opt.cg || 1.25);
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px ${opt.font || FONT_MARU}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const totalW = (cols.length - 1) * cg;
    cols.forEach((col, ci) => {
      const cx = x + totalW / 2 - ci * cg;
      const chars = [...col];
      const colH = chars.length * lh;
      let cy = y - (opt.align === 'top' ? 0 : colH / 2) + lh / 2;
      for (const ch of chars) {
        if (ROT_CH.includes(ch)) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); }
        else if (SMALL_SHIFT.includes(ch)) ctx.fillText(ch, cx + size * 0.55, cy - size * 0.55);
        else if ('ゃゅょっぁぃぅぇぉャュョッァィゥェォ'.includes(ch)) ctx.fillText(ch, cx + size * 0.1, cy - size * 0.1);
        else ctx.fillText(ch, cx, cy);
        cy += lh;
      }
    });
    ctx.restore();
  }
  MV.vText = vText;

  // ---- 吹き出し ------------------------------------------------------
  // b: {x,y,w,h,text,tail:[tx,ty], kind:'round'|'think'|'spike'|'box'|'boxW', size}
  function bubble(ctx, b, lt) {
    const p = clamp(lt / 0.14);
    const s = b.noPop ? 1 : lerp(0.4, 1, E.outBack(p));
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(s, s);
    ctx.globalAlpha *= clamp(p * 3);
    const w = b.w, h = b.h;
    ctx.lineJoin = 'round';
    if (b.kind === 'box' || b.kind === 'boxW') {
      // ナレーション枠
      ctx.fillStyle = b.kind === 'box' ? '#17141d' : '#fbfaff';
      ctx.strokeStyle = '#17141d'; ctx.lineWidth = 4;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      if (b.kind === 'boxW') ctx.strokeRect(-w / 2, -h / 2, w, h);
      vText(ctx, b.text, 0, 0, b.size || 22, b.kind === 'box' ? '#fff' : '#17141d', { font: '"MaruB", sans-serif' });
      ctx.restore(); return;
    }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#17141d'; ctx.lineWidth = 4.5;
    if (b.kind === 'think') {
      // もこもこ
      ctx.beginPath();
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const px = Math.cos(a) * w / 2, py = Math.sin(a) * h / 2;
        const r = Math.min(w, h) * 0.16;
        ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2);
      }
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.fill();
      if (b.tail) { // 小さな丸
        const [tx, ty] = b.tail;
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(tx * i / 3, ty * i / 3, 12 - i * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
    } else if (b.kind === 'spike') {
      ctx.beginPath();
      const n = 22;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, r = i % 2 ? 1 : 1.22;
        const px = Math.cos(a) * w / 2 * r, py = Math.sin(a) * h / 2 * r;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      // 楕円＋しっぽ
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (b.tail) {
        const [tx, ty] = b.tail;
        const ang = Math.atan2(ty, tx), bw = 0.22;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang - bw) * w * 0.42, Math.sin(ang - bw) * h * 0.42);
        ctx.lineTo(tx, ty);
        ctx.lineTo(Math.cos(ang + bw) * w * 0.42, Math.sin(ang + bw) * h * 0.42);
        ctx.fill(); ctx.stroke();
      }
      ctx.beginPath(); ctx.ellipse(0, 0, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    vText(ctx, b.text, 0, 0, b.size || 26, '#17141d', { font: FONT_MARU });
    ctx.restore();
  }
  MV.bubble = bubble;

  // ---- 背景 ---------------------------------------------------------
  const cache = {};
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  MV.makeCanvas = makeCanvas;

  function cloudBlob(ctx, x, y, s, fill, shade, dot) {
    const R = rng(Math.floor(x * 13 + y * 7));
    const puffs = [];
    for (let i = 0; i < 7; i++) puffs.push([x + (i - 3) * 46 * s + (R() - 0.5) * 20 * s, y - Math.sin((i / 6) * Math.PI) * 50 * s - R() * 20 * s, (40 + R() * 34) * s]);
    // 影
    ctx.fillStyle = shade;
    for (const [px, py, r] of puffs) { ctx.beginPath(); ctx.arc(px, py + 10 * s, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(x - 170 * s, y, 340 * s, 60 * s);
    ctx.fillStyle = fill;
    for (const [px, py, r] of puffs) { ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(x - 160 * s, y - 10 * s, 320 * s, 50 * s);
    if (dot) { // 網点
      ctx.fillStyle = dot;
      for (let yy = 0; yy < 40 * s; yy += 9) for (let xx = -150 * s; xx < 150 * s; xx += 9) {
        const r = 2.2 * (yy / (40 * s));
        ctx.beginPath(); ctx.arc(x + xx + (yy % 18 ? 4.5 : 0), y + 4 * s + yy, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function buildCloudLayer(seed, count, yBase, yJit, scale, fill, shade, dot) {
    const c = makeCanvas(2560, H), g = c.getContext('2d');
    const R = rng(seed);
    for (let i = 0; i < count; i++) {
      const x = (i / count) * 2560 + R() * 120, y = yBase + (R() - 0.5) * yJit, s = scale * (0.8 + R() * 0.5);
      for (const dx of [0, -2560, 2560]) cloudBlob(g, x + dx, y, s, fill, shade, dot);
    }
    return c;
  }

  MV.initBackgrounds = function () {
    cache.cloudFar = buildCloudLayer(3, 9, 300, 160, 0.8, '#d8f6fb', '#bfeef7', null);
    cache.cloudMid = buildCloudLayer(7, 7, 520, 120, 1.2, '#ffffff', '#cdeff7', 'rgba(120,200,225,.55)');
    cache.cloudNear = buildCloudLayer(11, 6, 700, 60, 1.7, '#ffffff', '#d6f3fa', 'rgba(120,200,225,.5)');
    cache.dreamMid = buildCloudLayer(17, 7, 520, 140, 1.3, '#ffffff', '#ffd9ef', 'rgba(255,150,200,.4)');
    cache.dreamNear = buildCloudLayer(23, 6, 690, 80, 1.8, '#ffffff', '#ffe3f3', 'rgba(255,150,200,.4)');
    // 砂嵐ノイズ
    const nz = makeCanvas(256, 256), ng = nz.getContext('2d'), id = ng.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    ng.putImageData(id, 0, 0); cache.noise = nz;
    // オフスクリーン（シルエット等）
    cache.off = makeCanvas(W, H);
    cache.off2 = makeCanvas(W, H);
  };
  MV.cache = cache;

  function scrollLayer(ctx, layer, x, y = 0) {
    const ox = ((x % 2560) + 2560) % 2560;
    ctx.drawImage(layer, -ox, y); ctx.drawImage(layer, 2560 - ox, y);
  }

  MV.bgSolid = (ctx, col) => { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); };
  MV.bgClouds = function (ctx, t, opt = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3fd5ee'); g.addColorStop(0.6, '#62e3f2'); g.addColorStop(1, '#a9f1f8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sp = opt.speed ?? 1;
    scrollLayer(ctx, cache.cloudFar, t * 14 * sp, (opt.dy || 0) * 0.3);
    scrollLayer(ctx, cache.cloudMid, t * 34 * sp, (opt.dy || 0) * 0.6);
    scrollLayer(ctx, cache.cloudNear, t * 60 * sp, opt.dy || 0);
  };
  MV.bgDream = function (ctx, t, opt = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#58dcef'); g.addColorStop(0.5, '#bfeef8'); g.addColorStop(0.8, '#ffd3ea'); g.addColorStop(1, '#ffc0e0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    scrollLayer(ctx, cache.dreamMid, t * 30, 0);
    scrollLayer(ctx, cache.dreamNear, t * 55, 0);
  };
  MV.bgRoom = function (ctx, t, dark = 0, tvOn = true) {
    ctx.drawImage(MV.IMG.room, 0, 0, W, H);
    if (tvOn) {
      const s = MV.TV_SCREEN;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8, s.r - 4); ctx.clip();
      const f = Math.floor(t * 24);
      ctx.globalAlpha = 0.35;
      ctx.drawImage(cache.noise, (f * 37) % 128, (f * 91) % 128, 128, 128, s.x, s.y, s.w, s.h);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#9fb7d8'; ctx.fillRect(s.x, s.y, s.w, s.h);
      // 走査線
      ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
      for (let y = s.y + ((f * 2) % 6); y < s.y + s.h; y += 6) ctx.fillRect(s.x, y, s.w, 2);
      ctx.restore();
    }
    if (dark > 0) { ctx.fillStyle = `rgba(22,18,44,${dark})`; ctx.fillRect(0, 0, W, H); }
  };

  // ---- エフェクト -------------------------------------------------------
  function star4(ctx, x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  }
  MV.star4 = star4;
  MV.sparkles = function (ctx, t, seed, n, area, col = '#fff') {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = area[0] + R() * area[2], y = area[1] + R() * area[3], ph = R() * 10, sp = 1.5 + R() * 2.5, sz = 6 + R() * 16;
      const tw = Math.max(0, Math.sin(t * sp + ph));
      if (tw > 0.05) star4(ctx, x, y - (t * 10 * (R() + 0.2)) % 40, sz * tw, col);
    }
  };
  function heartPath(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 0.9, y - s * 0.3, x - s * 0.45, y - s * 0.95, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 0.95, x + s * 0.9, y - s * 0.3, x, y + s * 0.35);
    ctx.closePath();
  }
  MV.heartPath = heartPath;
  // ふわふわ浮くハート線画（羽つき）
  MV.floatHearts = function (ctx, t, seed, n, col = 'rgba(255,120,190,.85)') {
    const R = rng(seed);
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const bx = R() * W, by = R() * H, sp = 10 + R() * 25, ph = R() * 6, s = 26 + R() * 30;
      const x = ((bx - t * sp) % W + W) % W, y = by + Math.sin(t * 1.3 + ph) * 18;
      heartPath(ctx, x, y, s); ctx.stroke();
      // 羽
      ctx.beginPath();
      ctx.moveTo(x + s * 0.55, y - s * 0.2); ctx.quadraticCurveTo(x + s * 1.2, y - s * 0.6, x + s * 1.3, y - s * 0.1);
      ctx.quadraticCurveTo(x + s * 1.0, y, x + s * 0.6, y); ctx.stroke();
    }
    ctx.restore();
  };
  MV.flash = (ctx, a, col = '#fff') => { if (a > 0) { ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); } };

  // キラキラのハート（落ちサビ用）
  MV.glitterHeart = function (ctx, x, y, s, t, col = '#ff5fb5') {
    ctx.save();
    heartPath(ctx, x, y, s); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
    ctx.clip();
    const R = rng(77);
    for (let i = 0; i < 60; i++) {
      const px = x + (R() - 0.5) * s * 2, py = y + (R() - 0.7) * s * 1.6, ph = R() * 6;
      ctx.fillStyle = Math.sin(t * 6 + ph) > 0.3 ? '#fff' : '#ffb3dc';
      ctx.fillRect(px, py, 3, 3);
    }
    ctx.restore();
  };

  // 効果音文字（ドヤ！など）縁取り付き斜め
  MV.sfxText = function (ctx, text, x, y, size, lt, rot = -0.2, col = '#fff') {
    const chars = [...text];
    chars.forEach((ch, i) => popChar(ctx, ch, x + i * size * 0.55, y + i * size * 0.75, size, col, lt, i, { stroke: '#17141d', strokeW: size * 0.2, rot, stagger: 0.05 }));
  };

  // 集中線
  MV.speedLines = function (ctx, t, cx, cy, col = 'rgba(255,255,255,.8)', n = 60) {
    const R = rng(Math.floor(t * 12));
    ctx.save(); ctx.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, r0 = 330 + R() * 120, r1 = 900, w = 0.006 + R() * 0.01;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1);
      ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1);
      ctx.fill();
    }
    ctx.restore();
  };
})();
