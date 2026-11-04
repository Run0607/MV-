// =============================================================
//  キャラ描画（提供イラストの切り抜きをそのまま動かす）
//  assets/chars/ の PNG を差し替えれば絵が変わる
// =============================================================
(function () {
  const MV = (window.MV = window.MV || {});

  // 黒キャラ画像の基準点（kuro_body.png の座標, 576x712）
  const K = {
    w: 576, h: 712,
    foot: [282, 701],     // 足元
    neck: [262, 330],     // 首（頭の揺れの支点）
    face: [258, 225],     // 顔の中心（アップ用）
    wing: { x: 0, y: 466, w: 206, h: 87, root: [196, 500] },
    bodyCx: 282,
  };
  MV.KURO = K;

  // 拍に合わせた揺れパラメータ
  function motion(t, dance = 1, b) {
    b = b ?? t * MV.BPS;
    const bi = Math.floor(b), bp = b - bi;
    const hop = Math.sin(Math.PI * Math.min(1, bp / 0.85));
    const land = Math.max(0, 1 - bp / 0.16);
    // 左右へ「パッ」と傾く（拍頭で素早く、あとはゆっくり戻る）
    const dir = bi % 2 ? 1 : -1;
    const lean = dir * (1 - Math.pow(1 - Math.min(1, bp / 0.22), 3)) - dir * 0.0;
    const prevDir = -dir;
    const leanS = MV.lerp(prevDir, dir, 1 - Math.pow(1 - Math.min(1, bp / 0.22), 3));
    return {
      bob: -16 * hop * dance,
      sqY: 1 - 0.045 * land * dance + 0.015 * hop * dance,
      sqX: 1 + 0.035 * land * dance - 0.01 * hop * dance,
      sway: 26 * leanS * dance,          // 頭頂の横ずれ(px)
      head: 10 * Math.sin(Math.PI * b + 0.5) * dance,
      flap: 9 * Math.sin(Math.PI * b) + 6 * land,
      rot: 1.6 * leanS * dance,
      bi, bp, lean,
    };
  }
  MV.kuroMotion = motion;

  // 横ストリップで体をしならせて描く
  function drawBent(ctx, img, sc, m, opt = {}) {
    const H = K.h, W = K.w, step = 3;
    const fy = K.foot[1];
    for (let y = 0; y < H; y += step) {
      const k = Math.max(0, (fy - y) / fy);
      let dx = m.sway * Math.pow(k, 1.6);
      if (y < K.neck[1]) dx += m.head * Math.pow((K.neck[1] - y) / K.neck[1], 1.2);
      ctx.drawImage(img, 0, y * sc, W * sc, step * sc + 1, dx, y, W, step + 0.6);
    }
  }

  function drawWings(ctx, m, opt) {
    const im = MV.IMG.kuro_wing, wg = K.wing;
    const [rx, ry] = wg.root;
    const flap = (opt.wingFlap ?? 1) * m.flap;
    // 左羽（元の位置）
    ctx.save();
    ctx.translate(rx + m.sway * 0.25, ry);
    ctx.rotate((-flap * Math.PI) / 180);
    ctx.drawImage(im, wg.x - rx, wg.y - ry, wg.w, wg.h);
    ctx.restore();
    // 右羽（左羽を反転）
    const rx2 = K.bodyCx + (K.bodyCx - rx) + 4;
    ctx.save();
    ctx.translate(rx2 + m.sway * 0.25, ry);
    ctx.scale(-1, 1);
    ctx.rotate((-flap * Math.PI) / 180);
    ctx.drawImage(im, wg.x - rx, wg.y - ry, wg.w, wg.h);
    ctx.restore();
  }

  /**
   * 全身: o = {x,y(足元の画面座標), scale, t, dance, alpha, rot, noWings, hi(高解像度)}
   */
  MV.drawKuro = function (ctx, o) {
    const m = motion(o.t || 0, o.dance ?? 1, o.beat);
    const s = o.scale || 1;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(o.x, o.y + m.bob * s);
    ctx.rotate((((o.rot || 0) + m.rot) * Math.PI) / 180);
    ctx.scale(s * m.sqX, s * m.sqY);
    ctx.translate(-K.foot[0], -K.foot[1]);
    ctx.imageSmoothingQuality = 'high';
    if (!o.noWings) drawWings(ctx, m, o);
    const hi = s > 1.3;
    drawBent(ctx, hi ? MV.IMG['kuro_body@2x'] : MV.IMG.kuro_body, hi ? 2 : 1, m, o);
    if (o.halo != null) MV.drawHalo(ctx, K.face[0], 70, o.halo);
    ctx.restore();
  };

  /**
   * アップ/バスト: 画像上の点 focus を画面 (x,y) に置いて scale 倍
   * o = {x,y,scale, focus:[fx,fy], t, rot, sway(揺れ量0..1)}
   */
  MV.drawKuroShot = function (ctx, o) {
    const f = o.focus || K.face;
    const s = o.scale;
    const m = motion(o.t || 0, o.sway ?? 0.35, o.beat);
    ctx.save();
    ctx.translate(o.x, o.y + m.bob * 0.4 * s);
    ctx.rotate((((o.rot || 0) + m.rot * 0.6) * Math.PI) / 180);
    ctx.scale(s, s);
    ctx.translate(-f[0], -f[1]);
    ctx.imageSmoothingQuality = 'high';
    if (o.wings) drawWings(ctx, m, o);
    drawBent(ctx, MV.IMG['kuro_body@2x'], 2, { ...m, sway: m.sway * 0.4, head: m.head * 0.6 });
    ctx.restore();
  };

  // 天使の輪
  MV.drawHalo = function (ctx, x, y, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y - 40);
    ctx.scale(1, 0.32);
    ctx.lineWidth = 20; ctx.strokeStyle = '#2a2433';
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 12; ctx.strokeStyle = '#fff7c8';
    ctx.shadowColor = '#fff59a'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  // ---- モブ（左右2人組 × 2ポーズ） ----
  // pose: 'up' = 両手上げ / 'ch' = ガッツ・ほっぺ
  MV.drawMobGroup = function (ctx, side, pose, o = {}) {
    const im = MV.IMG[`mob_${pose}_${side}`];
    const s = (o.scale || 1.06);
    const w = im.width * s, h = im.height * s;
    const x = side === 'L' ? 0 : MV.W - w;
    const y = MV.H - h + (o.dy || 0);
    ctx.drawImage(im, x + (o.dx || 0), y, w, h);
  };
})();
