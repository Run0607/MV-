// 黒キャラ（パペット）描画
(function () {
  const MV = (window.MV = window.MV || {});

  const NECK = [300, 345];
  const FOOT = [300, 660];

  function img(name) { return MV.IMG[name]; }
  function drawPart(ctx, name) {
    const im = img(name);
    if (!im) return;
    ctx.drawImage(im, 0, 0, 600, 720);
  }
  function rotAbout(ctx, px, py, deg) {
    if (!deg) return;
    ctx.translate(px, py); ctx.rotate((deg * Math.PI) / 180); ctx.translate(-px, -py);
  }

  // 羽: 付け根 (ax,ay)、side=1 画面右
  function drawWing(ctx, ax, ay, side, deg, sc = 1) {
    const im = img('wing');
    ctx.save();
    ctx.translate(ax, ay);
    ctx.scale(side * sc, sc);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.drawImage(im, -20, -90, 300, 200);
    ctx.restore();
  }

  /**
   * o: {x,y,scale, pose, expr, t, beat, dance(0..1), rot, flip, legs, wingFlap, alpha, headRot, bodyOnly}
   *   x,y = 足元の画面座標
   */
  MV.drawKuro = function (ctx, o) {
    const pose = MV.POSES[o.pose || 'cross'];
    const t = o.t || 0;
    const b = o.beat ?? t * MV.BPS;           // 拍（連続値）
    const bi = Math.floor(b), bp = b - bi;    // 拍番号と位相
    const dance = o.dance ?? 1;

    // ---- 揺れ計算 ----
    const hop = Math.sin(Math.PI * Math.min(1, bp / 0.85));               // 拍頭で着地
    const land = Math.max(0, 1 - bp / 0.18);                              // 着地の潰れ
    const bob = -14 * hop * dance;
    const sqY = 1 - 0.035 * land * dance + 0.012 * hop * dance;
    const sqX = 1 + 0.03 * land * dance - 0.008 * hop * dance;
    const sway = 3.2 * Math.cos(Math.PI * b) * dance;                     // 左右交互
    const headR = (-sway * 0.7 + 2.2 * Math.sin(Math.PI * b + 0.6)) * dance + (o.headRot || 0);
    const flap = (o.wingFlap ?? 1) * (7 * Math.sin(Math.PI * b) + 5 * land);
    const altLeg = bi % 2 === 0 ? 1 : -1;
    const armWig = 2.4 * Math.sin(Math.PI * b) * dance;

    // ポーズ交互（cross ⇄ cross2 など）
    let poseName = o.pose || 'cross';
    if (o.alt !== false && dance > 0 && MV.POSES[poseName + '2'] && bi % 2 === 1) poseName += '2';

    // まばたき
    let expr = o.expr || 'smug';
    if (o.blink !== false) {
      const bt = (t + (o.blinkSeed || 0)) % 3.7;
      if (bt < 0.11) {
        const map = { smug: 'blink', normal: 'blinkFlat', talk: 'blinkTalk', smile: 'blinkFlat', up: 'blinkFlat', worry: 'blinkFlat', sad: 'blinkFlat', smugOpen: 'blink' };
        if (map[expr]) expr = map[expr];
      }
    }

    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(o.x, o.y + bob * (o.scale || 1));
    const s = o.scale || 1;
    ctx.scale(s * sqX * (o.flip ? -1 : 1), s * sqY);
    ctx.rotate(((o.rot || 0) + sway * 0.6) * Math.PI / 180);
    ctx.translate(-FOOT[0], -FOOT[1]);

    if (o.sit) {
      // 体育座り
      ctx.save(); ctx.translate(0, 40);
      drawPart(ctx, 'hairBack');
      drawPart(ctx, 'sitBody');
      ctx.restore();
      ctx.save(); ctx.translate(0, 48);
      rotAbout(ctx, NECK[0], NECK[1], headR * 0.4 + (o.headTilt || 0));
      drawPart(ctx, 'head_' + expr);
      ctx.restore();
      if (o.halo != null) drawHalo(ctx, 300, 92 + 48, o.halo);
      ctx.restore();
      return;
    }

    // 羽（後ろ）
    if (!o.noWings) {
      drawWing(ctx, 274, 456, -1, -flap, 0.8);
      drawWing(ctx, 326, 456, 1, -flap, 0.8);
    }
    // 脚
    if (!o.bustOnly) {
      const legs = o.legs || 'dance';
      if (legs === 'dance') {
        const bentSide = altLeg;
        drawPart(ctx, `leg_${-bentSide}_straight`);
        drawPart(ctx, `leg_${bentSide}_bent`);
      } else if (legs === 'stand') {
        drawPart(ctx, 'leg_-1_straight'); drawPart(ctx, 'leg_1_straight');
      } else if (legs === 'wide') {
        drawPart(ctx, 'leg_-1_step'); drawPart(ctx, 'leg_1_step');
      }
    }
    // 髪（後ろ）
    ctx.save(); rotAbout(ctx, NECK[0], NECK[1], headR); drawPart(ctx, 'hairBack'); ctx.restore();
    // 胴
    drawPart(ctx, 'torso');
    // 腕（後ろ側）
    const P = MV.POSES[poseName];
    for (const k of P.order) {
      if (P[k].front) continue;
      ctx.save(); rotAbout(ctx, P[k].s[0], P[k].s[1], (k === 'L' ? armWig : -armWig)); drawPart(ctx, `arm_${poseName}_${k}`); ctx.restore();
    }
    // 頭
    ctx.save();
    rotAbout(ctx, NECK[0], NECK[1], headR);
    drawPart(ctx, 'head_' + expr);
    if (o.halo != null) drawHalo(ctx, 300, 92, o.halo);
    ctx.restore();
    // 腕（前側）
    for (const k of P.order) {
      if (!P[k].front) continue;
      ctx.save(); rotAbout(ctx, P[k].s[0], P[k].s[1], (k === 'L' ? armWig : -armWig) * 0.5); drawPart(ctx, `arm_${poseName}_${k}`); ctx.restore();
    }
    ctx.restore();
  };

  // 天使の輪
  function drawHalo(ctx, x, y, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y - 40);
    ctx.scale(1, 0.32);
    ctx.lineWidth = 22; ctx.strokeStyle = MV.PAL.ol;
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 13; ctx.strokeStyle = '#fff7c8';
    ctx.shadowColor = '#fff59a'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  MV.drawHalo = drawHalo;

  // 顔アップ用: 頭だけ描く（cx,cy=顔の中心に来る画面座標）
  MV.drawKuroHead = function (ctx, o) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.scale(o.scale, o.scale);
    ctx.rotate(((o.rot || 0) * Math.PI) / 180);
    ctx.translate(-300, -230);
    if (!o.noBody) {
      drawPart(ctx, 'hairBack');
      drawPart(ctx, 'torso');
      if (o.pose) {
        const P = MV.POSES[o.pose];
        for (const k of P.order) if (!P[k].front) drawPart(ctx, `arm_${o.pose}_${k}`);
      }
    }
    drawPart(ctx, 'head_' + (o.expr || 'smug'));
    if (o.pose) {
      const P = MV.POSES[o.pose];
      for (const k of P.order) if (P[k].front) drawPart(ctx, `arm_${o.pose}_${k}`);
    }
    ctx.restore();
  };
})();
