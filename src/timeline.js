// =============================================================
//  タイムライン（ショット構成）＋ renderAt(t)
//  構成・タイミングは参考MVに合わせている
// =============================================================
(function () {
  const MV = (window.MV = window.MV || {});
  const { clamp, lerp, E, prog, keyAt, W, H } = MV;

  // ---- 黒キャラのポーズ/表情キー（ダンス場面用） ----
  const KK = [
    [0, 'cross', 'smug'],
    [3.33, 'cross', 'smug'], [16.67, 'shrug', 'smugOpen'], [18.83, 'cross', 'smug'], [24.0, 'cross', 'x'],
    [29.83, 'cross', 'smug'], [34.83, 'cross', 'normal'], [37.33, 'shrug', 'shock'], [38.12, 'cross', 'spiral'],
    [94.2, 'cross', 'smug'], [97.0, 'cross', 'x'], [100.0, 'cross', 'smug'], [102.67, 'cross', 'x'],
    [104.75, 'shrug', 'normal'], [107.0, 'shrug', 'smug'], [110.0, 'shrug', 'normal'], [112.67, 'shrug', 'pout'],
    [204.46, 'shrug', 'x'], [210.0, 'shrug', 'happy'], [213.67, 'cross', 'smug'],
  ];
  for (const C of [62.12, 168.67]) {
    KK.push([C, 'cross', 'smug'], [C + 2.05, 'wave', 'wink'], [C + 3.63, 'heart', 'smug'], [C + 5.21, 'cross', 'smug'],
      [C + 7.92, 'shrug', 'x'], [C + 8.92, 'shrug', 'smug'], [C + 9.67, 'wave', 'wink'], [C + 10.55, 'heart', 'smug'],
      [C + 12.71, 'wave', 'wink'], [C + 14.55, 'heart', 'wink'], [C + 15.88, 'cross', 'smug'], [C + 18.21, 'shrug', 'x'],
      [C + 19.59, 'shrug', 'smug'], [C + 20.5, 'wave', 'happy']);
  }
  KK.sort((a, b) => a[0] - b[0]);
  MV.KURO_KEYS = KK;

  const flap = (t, a = 'talk', b = 'normal', rate = 7) => (Math.floor(t * rate) % 2 ? b : a);

  // =============================================================
  //  ショット定義
  // =============================================================
  const SHOTS = [];
  const shot = (a, b, type, p = {}) => SHOTS.push(Object.assign({ a, b, type }, p));

  // 顔アップ寸劇（イントロ / 2回目 / ラスト）
  function skit(t0, kind) {
    const o = (x) => t0 + x;
    if (kind === 'intro' || kind === 'mid') {
      const e = kind === 'intro' ? 0.62 : 0.42;
      shot(o(0), o(e), 'head', { s: [5.4, 5.6], y: 190, expr: kind === 'intro' ? 'closed' : 'normal' });
      shot(o(e), o(1.0), 'head', { s: [4.7, 4.8], y: 200, expr: 'up', bg: 'mint' });
      shot(o(1.0), o(1.37), 'head', { s: [4.4, 4.5], y: 210, expr: (t) => flap(t, 'grin', 'angry', 8), bg: 'mint' });
      shot(o(1.37), o(2.0), 'head', { s: [3.9, 3.7], y: 230, expr: (t) => flap(t), bg: 'mint' });
      shot(o(2.0), o(2.62), 'head', { s: [2.3, 2.15], y: 290, expr: (t) => flap(t, 'talk', 'shock'), bg: 'mint', body: true });
      shot(o(2.62), o(3.0), 'head', { s: [1.75, 1.7], y: 330, expr: 'smugOpen', bg: 'mint', body: true, pose: 'fist' });
      shot(o(3.0), o(kind === 'intro' ? 3.33 : 3.0), 'head', { s: [1.7, 1.65], y: 330, expr: 'smug', bg: 'mint', body: true, pose: 'fist', doya: o(2.87) });
    }
    if (kind === 'last') {
      shot(o(0), o(0.43), 'head', { s: [5.4, 5.6], y: 190, expr: 'closed' });
      shot(o(0.43), o(1.43), 'head', { s: [4.6, 4.4], y: 200, expr: (t) => flap(t, 'talk', 'normal'), bg: 'mint' });
      shot(o(1.43), o(2.1), 'head', { s: [4.2, 4.0], y: 210, expr: (t) => flap(t, 'talk', 'shock'), bg: 'mint' });
      shot(o(2.1), o(2.98), 'head', { s: [3.6, 3.5], y: 240, expr: 'smugOpen', bg: 'mint', doya: o(2.15), shake: true });
      shot(o(2.98), o(3.98), 'head', { s: [1.9, 1.85], y: 320, expr: 'worry', bg: 'clouds', body: true, pose: 'down' });
      shot(o(3.98), o(5.02), 'head', { s: [3.4, 3.3], y: 240, expr: (t) => flap(t, 'grin', 'angry', 6), bg: 'clouds' });
      shot(o(5.02), o(6.56), 'head', { s: [1.75, 1.7], y: 360, expr: 'smugOpen', bg: 'mint', body: true, pose: 'fist', doya: o(5.1), doya2: o(5.6) });
    }
  }
  skit(0, 'intro');
  shot(3.33, 13.0, 'dance', { bg: 'mint', popIn: true, title: true });
  shot(13.0, 40.79, 'dance', { bg: 'mint' });
  shot(40.79, 59.33, 'room', { part: 1 });
  shot(59.33, 61.0, 'head', { s: [5.0, 4.4], y: 200, expr: 'closed', bg: 'mint' });
  shot(61.0, 62.12, 'head', { s: [2.1, 2.0], y: 320, expr: 'talk', bg: 'mint', body: true, pose: 'down' });
  shot(62.12, 83.0, 'dance', { bg: 'clouds', zoomIn: true, hearts: true });
  realSection(83.0);
  skit(91.2, 'mid');
  shot(94.2, 104.75, 'dance', { bg: 'mint', popIn: true });
  shot(104.75, 114.79, 'dance', { bg: 'mint' });
  shot(114.79, 124.67, 'talk2b');
  shot(124.67, 144.67, 'room', { part: 2 });
  shot(144.67, 146.0, 'head', { s: [5.0, 4.5], y: 200, expr: 'closed', bg: 'mint' });
  shot(146.0, 147.33, 'head', { s: [2.2, 2.1], y: 320, expr: 'smile', bg: 'mint', body: true, pose: 'down' });
  // Cメロ（頭身高め＝リアル絵）
  shot(147.33, 149.46, 'real', { mode: 'circle', rot: [-4, 4], z: [1.0, 1.08] });
  shot(149.46, 151.21, 'real', { mode: 'crop', c: [520, 770], s: [1.3, 1.42] });
  shot(151.21, 152.54, 'real', { mode: 'crop', c: [500, 745], s: [1.95, 2.1] });
  shot(152.54, 156.5, 'real', { mode: 'circle', rot: [6, -6], z: [1.12, 1.0], dx: [-120, 120] });
  shot(156.5, 157.79, 'real', { mode: 'crop', c: [500, 780], s: [1.6, 1.4] });
  shot(157.79, 160.67, 'real', { mode: 'circle', rot: [0, 360], z: [0.9, 1.0], spin: true });
  shot(160.67, 163.08, 'real', { mode: 'crop', c: [540, 800], s: [1.28, 1.4], sketch: true });
  shot(163.08, 166.62, 'real', { mode: 'circle', rot: [-3, 3], z: [1.0, 1.15], soft: true });
  shot(166.62, 168.67, 'real', { mode: 'crop', c: [520, 770], s: [1.5, 1.8], burst: true });
  shot(168.67, 189.55, 'dance', { bg: 'clouds', zoomIn: true, hearts: true });
  realSection(189.55, 197.9);
  skit(197.9, 'last');
  shot(204.46, 216.17, 'dance', { bg: 'mint', popIn: true });
  shot(216.17, 999, 'black');

  function realSection(a, end) {
    shot(a, a + 1.67, 'real', { mode: 'circle', rot: [-8, 0], z: [0.85, 1.0], burst: true });
    shot(a + 1.67, a + 3.0, 'real', { mode: 'circle', rot: [0, 4], z: [1.0, 1.05], dx: [0, -160] });
    shot(a + 3.0, a + 4.96, 'real', { mode: 'crop', c: [520, 770], s: [1.28, 1.4] });
    shot(a + 4.96, a + 5.75, 'real', { mode: 'crop', c: [500, 745], s: [2.0, 2.12] });
    shot(a + 5.75, a + 7.33, 'real', { mode: 'circle', rot: [4, -4], z: [1.05, 1.0], dx: [140, 0] });
    shot(a + 7.33, end || a + 8.2, 'real', { mode: 'crop', c: [540, 790], s: [1.7, 1.5] });
  }
  MV.SHOTS = SHOTS;

  // =============================================================
  //  ショット描画
  // =============================================================
  function bg(ctx, t, kind) {
    if (kind === 'clouds') MV.bgClouds(ctx, t);
    else if (kind === 'dream') MV.bgDream(ctx, t);
    else MV.bgSolid(ctx, MV.COL.mint);
  }

  const H_ = {};
  // 顔アップ / バストアップ
  H_.head = function (ctx, t, lt, sh, mid) {
    const p = lt / (sh.b - sh.a);
    bg(ctx, t, sh.bg || 'mint');
    mid();
    const s = lerp(sh.s[0], sh.s[1], E.inOut(clamp(p)));
    const expr = typeof sh.expr === 'function' ? sh.expr(t) : sh.expr;
    let x = sh.x ?? 640, y = sh.y ?? 300;
    if (sh.shake) { x += Math.sin(t * 90) * 6 * (1 - clamp(lt / 0.4)); y += Math.cos(t * 77) * 5 * (1 - clamp(lt / 0.4)); }
    const pose = sh.pose || (sh.body ? 'down' : null);
    MV.drawKuroHead(ctx, { x, y, scale: s, expr, noBody: !sh.body && !sh.pose, pose, rot: Math.sin(t * 2) * 1.2 });
    if (sh.doya != null && t >= sh.doya) MV.sfxText(ctx, 'ドヤ!', 90, 170, 120, t - sh.doya, -0.25);
    if (sh.doya2 != null && t >= sh.doya2) MV.sfxText(ctx, 'ドヤ!', 1000, 120, 100, t - sh.doya2, 0.2);
  };

  // 全身ダンス
  H_.dance = function (ctx, t, lt, sh, mid) {
    bg(ctx, t, sh.bg);
    if (sh.hearts) MV.floatHearts(ctx, t, 5, 7);
    if (sh.title) titleScroll(ctx, t, lt);
    mid();
    const k = keyAt(KK, t);
    let sc = 1.0, y = 712;
    if (sh.popIn) sc *= lerp(0.15, 1, E.outBack(clamp(lt / 0.35)));
    if (sh.zoomIn) sc *= lerp(0.55, 1, E.outQuint(clamp(lt / 0.3)));
    // 同じポーズに入った瞬間に軽いバウンス
    const since = t - k[0];
    const kick = since < 0.15 ? Math.sin((since / 0.15) * Math.PI) * 0.03 : 0;
    MV.drawKuro(ctx, { x: 640, y, scale: sc * (1 + kick), pose: k[1], expr: k[2], t, blinkSeed: 0.7 });
    if (sh.title) credits(ctx, t);
  };

  // タイトル「ダダダダ天使」スクロール
  function titleScroll(ctx, t, lt) {
    const title = MV.CONFIG.title;
    const head = [...title].slice(0, -2).join(''), tail = [...title].slice(-2).join('');
    const P = 680, off = (lt * 240) % P;
    ctx.save();
    ctx.fillStyle = MV.TXT.pink;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    for (let i = -1; i < 4; i++) {
      const x = i * P - off;
      ctx.font = `150px ${MV.FONT_BIG}`;
      ctx.fillText(head, x + P / 2, 96);
      ctx.font = `300px ${MV.FONT_BIG}`;
      ctx.fillText(tail[0], x + P * 0.25, 350); ctx.fillText(tail[1], x + P * 0.75, 350);
    }
    ctx.restore();
    // 歌い手名
    MV.centerLine(ctx, MV.CONFIG.vocalName, 640, 548, lt - 0.3, MV.TXT.pink, 34, 600, { noPop: true });
  }
  function credits(ctx, t) {
    for (const [a, b, txt] of MV.CONFIG.credits) if (t >= a && t < b) MV.centerLine(ctx, txt, 640, 330, t - a, MV.TXT.pink, 52, 1100, { stagger: 0.012 });
  }

  // 部屋（体育座り）
  H_.room = function (ctx, t, lt, sh, mid) {
    let dark, expr = 'worry', halo = null, sil = 0, cam = 1, head = 0;
    if (sh.part === 1) {
      dark = t < 50.96 ? 0.42 : lerp(0.42, 0.0, E.out(prog(t, 50.96, 0.4)));
      for (const hb of [45, 47, 50]) if (t >= hb && t < hb + 0.5) halo = Math.floor((t - hb) * 12) % 2 ? 0.25 : 1;
      if (t >= 51.0) expr = 'up';
      if (t >= 55.0) expr = 'worry';
      cam = lerp(1, 1.08, prog(t, 40.79, 18));
    } else {
      dark = t < 136.46 ? 0.25 : 0;
      expr = t < 133.88 ? 'worry' : t < 136.08 ? 'smugOpen' : 'sad';
      sil = E.inOut(prog(t, 137.0, 3.0));
      cam = lerp(1.0, 1.1, prog(t, 136.46, 8));
      // 大きい吹き出しのアップ
      if (t >= 131.25 && t < 133.88) {
        MV.bgRoom(ctx, t, 0.35);
        mid();
        MV.drawKuroHead(ctx, { x: 470, y: 330, scale: lerp(2.6, 2.5, prog(t, 131.25, 2.6)), expr: flap(t, 'talk', 'normal', 6), pose: 'down' });
        return;
      }
    }
    ctx.save();
    ctx.translate(640, 400); ctx.scale(cam, cam); ctx.translate(-640, -400);
    MV.bgRoom(ctx, t, 0);
    // キャラ（シルエット化対応）
    const off = MV.cache.off, oc = off.getContext('2d');
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H);
    MV.drawKuro(oc, { x: 640, y: 700, scale: 0.84, sit: true, expr, t, dance: 0, halo, headTilt: head });
    if (sil > 0) {
      oc.globalCompositeOperation = 'source-atop';
      oc.fillStyle = `rgba(8,6,12,${sil})`; oc.fillRect(0, 0, W, H);
      oc.globalCompositeOperation = 'source-over';
    }
    ctx.drawImage(off, 0, 0);
    // ハート
    if (sh.part === 1 && t >= 55.0) {
      const pp = E.outBack(prog(t, 55.0, 0.25));
      if (t < 56.0) { ctx.save(); MV.heartPath(ctx, 640, 150, 44 * pp); ctx.fillStyle = '#17141d'; ctx.fill(); ctx.restore(); }
      else MV.glitterHeart(ctx, 640, 150 + Math.sin(t * 3) * 6, 48, t);
    }
    if (sh.part === 2 && t >= 139.5) MV.glitterHeart(ctx, 640, 545, 44 * E.outBack(prog(t, 139.5, 0.5)), t);
    ctx.restore();
    if (dark > 0) { ctx.fillStyle = `rgba(22,18,44,${dark})`; ctx.fillRect(0, 0, W, H); }
    mid();
    // 円ワイプ（2回目の入り）
    if (sh.part === 2 && lt < 0.9) {
      const r = lerp(0, 820, E.inOut(clamp(lt / 0.9)));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(640, 360, r, 0, Math.PI * 2, true); ctx.fillStyle = '#16525a'; ctx.fill(); ctx.restore();
    }
  };

  // 2番Bメロ（会話劇）
  H_.talk2b = function (ctx, t, lt, sh, mid) {
    const darkBg = (t >= 119.17 && t < 120.67) || t >= 124.0;
    if (darkBg) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a9aa0'); g.addColorStop(1, '#16525a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else MV.bgSolid(ctx, MV.COL.mint);
    // 影のモブ（ゆらゆら）
    ctx.save(); ctx.fillStyle = darkBg ? 'rgba(10,40,44,.55)' : '#1f8f93';
    const blobs = [[90, 300, 120], [200, 420, 90], [1180, 330, 110], [1090, 450, 80]];
    blobs.forEach(([x, y, r], i) => {
      const yy = y + Math.sin(t * 3 + i) * 8;
      ctx.beginPath(); ctx.ellipse(x, yy, r * 0.8, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, yy + r * 1.6, r * 1.3, r * 1.0, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    // 怒りのトゲ
    if ((t >= 116.62 && t < 119.17) || (t >= 121.7 && t < 124.0)) {
      ctx.save(); ctx.fillStyle = '#17323a';
      for (const [x, y] of [[470, 140], [820, 160]]) {
        ctx.beginPath();
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 26 : 60; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.fill();
      }
      ctx.restore();
    }
    mid();
    let expr = flap(t);
    if (t >= 116.62 && t < 117.92) expr = flap(t, 'angry', 'grin', 6);
    else if (t >= 117.92 && t < 119.17) expr = 'grin';
    else if (t >= 119.17 && t < 120.67) expr = 'pout';
    else if (t >= 121.7 && t < 122.9) expr = flap(t, 'angry', 'grin', 6);
    else if (t >= 122.9 && t < 124.0) expr = 'grin';
    else if (t >= 124.0) expr = 'pout';
    const bob = Math.abs(Math.sin(t * Math.PI * MV.BPS / 2)) * 8;
    MV.drawKuroHead(ctx, { x: 640, y: 470 - bob, scale: 1.9, expr, pose: 'down', rot: Math.sin(t * 1.5) * 2 });
  };

  // リアル絵（頭身高めパート）
  H_.real = function (ctx, t, lt, sh, mid) {
    const p = clamp(lt / (sh.b - sh.a));
    const im = MV.IMG.real;
    const ep = E.inOut(p);
    if (sh.mode === 'circle') {
      MV.bgDream(ctx, t);
      MV.floatHearts(ctx, t, 9, 6, 'rgba(255,255,255,.9)');
      const z = lerp(sh.z[0], sh.z[1], ep), rot = lerp(sh.rot[0], sh.rot[1], sh.spin ? E.inOut(p) : ep);
      const dx = sh.dx ? lerp(sh.dx[0], sh.dx[1], ep) : 0;
      const R = 278 * z, cx = 640 + dx, cy = 368;
      // 外枠のグロー
      ctx.save();
      ctx.shadowColor = sh.soft ? '#ffb3dc' : '#ffffff'; ctx.shadowBlur = 40;
      ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate((rot * Math.PI) / 180);
      const s = (R / 455) * 1.0;
      ctx.drawImage(im, -512 * s, -762 * s, 1024 * s, 1536 * s);
      grade(ctx, sh.soft ? 0.32 : 0.2, -R, -R, R * 2, R * 2);
      ctx.restore();
      // 枠線
      ctx.save(); ctx.lineWidth = 8; ctx.strokeStyle = '#ff7cc4';
      ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      MV.sparkles(ctx, t, 31, 26, [0, 0, W, H]);
    } else {
      const s = lerp(sh.s[0], sh.s[1], ep);
      const [icx, icy] = sh.c;
      ctx.save();
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.translate(640, 360); ctx.scale(s, s);
      ctx.drawImage(im, -icx, -icy);
      ctx.restore();
      grade(ctx, 0.28, 0, 0, W, H);
      // 周辺減光
      const vg = ctx.createRadialGradient(640, 360, 200, 640, 360, 800);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,0,40,.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      MV.sparkles(ctx, t, 41, 18, [0, 0, W, H], 'rgba(255,240,255,.95)');
      if (sh.sketch && Math.floor(lt * 6) % 3 === 0 && lt < 1.5) MV.flash(ctx, 0.25, '#fff');
    }
    if (sh.burst) { MV.sparkles(ctx, t * 2, 55, 40, [200, 100, 880, 520]); }
    // 入りの白フラッシュ
    MV.flash(ctx, 0.7 * (1 - clamp(lt / 0.18)));
    mid();
  };
  // ピンク×シアンのグレーディング
  function grade(ctx, a, x, y, w, h) {
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, `rgba(80,230,240,${a})`); g.addColorStop(1, `rgba(255,90,180,${a})`);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  H_.black = function (ctx, t, lt) {
    MV.bgSolid(ctx, '#000');
    const a = clamp(lt / 0.3) * (1 - clamp((lt - 1.6) / 0.5));
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(640, 360, 46, 0, Math.PI * 2); ctx.fillStyle = MV.COL.mint; ctx.fill(); ctx.clip();
    MV.drawKuroHead(ctx, { x: 640, y: 372, scale: 0.36, expr: 'smug', noBody: true });
    ctx.restore();
  };

  // =============================================================
  //  オーバーレイ（歌詞・吹き出し・モブ）
  // =============================================================
  function drawLyrics(ctx, t) {
    for (const l of MV.LYRICS) {
      if (t < l.a || t >= l.b) continue;
      const lt = t - l.a;
      if (l.style === 'rows') {
        for (const r of l.rows) {
          const rt = lt - (r.at || 0);
          if (rt < 0) continue;
          MV.spreadLine(ctx, r.text, r.y, rt, MV.TXT[r.color || 'white'], { max: r.max || 175, x0: r.x0, x1: r.x1, noPop: r.noPop });
        }
      } else if (l.style === 'center') {
        MV.centerLine(ctx, l.text, 640, l.y, lt, MV.TXT[l.color || 'white'], l.size, 1200);
      } else if (l.style === 'scroll') {
        ctx.save();
        ctx.font = `${l.size}px ${MV.FONT_BIG}`; ctx.fillStyle = MV.TXT[l.color || 'white'];
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(l.text + '　').width;
        const off = (lt * l.speed) % tw;
        for (let x = -off; x < W + tw; x += tw) ctx.fillText(l.text + '　', x, l.y);
        ctx.restore();
      }
    }
  }

  function drawBubbles(ctx, t) {
    for (const b of MV.BUBBLES) if (t >= b.a && t < b.b) MV.bubble(ctx, b, t - b.a);
  }

  const MOB_LAYOUT = [
    // key, x, scale, side
    ['ao', 330, 0.62, -1], ['shiro', 950, 0.62, 1], ['taiyo', 120, 0.88, -1], ['gin', 1160, 0.88, 1],
  ];
  function drawMobs(ctx, t) {
    for (const ev of MV.MOBEVENTS) {
      if (t < ev.a || t >= ev.b) continue;
      const lt = t - ev.a, rem = ev.b - t;
      if (ev.show) {
        const bi = Math.floor(t * MV.BPS);
        MOB_LAYOUT.forEach(([key, x, sc, side], i) => {
          const pose = ev.pose || (bi % 2 === 0 ? (key === 'ao' || key === 'shiro' ? 'cheeks' : 'fists') : 'up');
          const im = MV.IMG[`mob_${key}_${pose}`];
          const w = 400 * sc, h = 440 * sc;
          const enter = clamp(lt / 0.12), exit = clamp(rem / 0.1);
          const yOff = (1 - E.out(enter)) * 160 + (1 - exit) * 120;
          const hop = Math.abs(Math.sin(t * Math.PI * MV.BPS)) * 10;
          const bx = x - w / 2, by = H - h + 30 - hop + yOff;
          // 入りのブレ（モーションブラー）
          if (enter < 1) {
            ctx.save(); ctx.globalAlpha = 0.25;
            for (let k = 1; k <= 3; k++) ctx.drawImage(im, bx - side * k * 26 * (1 - enter), by, w, h);
            ctx.restore();
          }
          ctx.drawImage(im, bx, by, w, h);
        });
      }
      if (ev.chant) {
        const txt = '＼' + ev.chant + '／';
        const yy = ev.show ? 280 : 300;
        MV.centerLine(ctx, txt, 230, yy, lt, '#17141d', 40, 360, { font: MV.FONT_MARU, stroke: '#fff', strokeW: 9, rot: -0.12, stagger: 0.015 });
        MV.centerLine(ctx, txt, 1050, yy, lt, '#17141d', 40, 360, { font: MV.FONT_MARU, stroke: '#fff', strokeW: 9, rot: 0.12, stagger: 0.015 });
      }
    }
  }

  // =============================================================
  //  renderAt
  // =============================================================
  MV.renderAt = function (ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    let sh = null;
    for (const s of SHOTS) if (t >= s.a && t < s.b) { sh = s; break; }
    if (!sh) { MV.bgSolid(ctx, '#000'); return; }
    const mid = () => drawLyrics(ctx, t);
    H_[sh.type](ctx, t, t - sh.a, sh, mid);
    if (sh.type !== 'black') {
      drawMobs(ctx, t);
      drawBubbles(ctx, t);
    }
  };
})();
