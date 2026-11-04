// 背景小物（部屋・アイコンなど）
(function () {
  const MV = (window.MV = window.MV || {});
  const OL = '#2a2433';
  const st = (w = 4) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  function room() {
    let s = '';
    // 壁
    s += `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d7a88"/><stop offset="1" stop-color="#a9a6b3"/></linearGradient>` +
      `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b6c2"/><stop offset="1" stop-color="#d8d5de"/></linearGradient></defs>`;
    s += `<rect x="0" y="0" width="1280" height="480" fill="url(#wall)"/>`;
    for (let x = 0; x < 1280; x += 64) s += `<path d="M${x},0 L${x},476" stroke="#76737f" stroke-width="2" opacity=".35"/>`;
    // 床
    s += `<rect x="0" y="476" width="1280" height="244" fill="url(#floor)"/>`;
    for (const y of [500, 530, 568, 614, 668]) s += `<path d="M0,${y} L1280,${y}" stroke="#a4a1ad" stroke-width="2.5"/>`;
    for (let i = -8; i < 12; i++) s += `<path d="M${640 + i * 40},476 L${640 + i * 150},720" stroke="#a4a1ad" stroke-width="2" opacity=".6"/>`;
    s += `<rect x="0" y="466" width="1280" height="14" fill="#5d5a68" ${st(3)}/>`;
    // ポスター
    s += `<g transform="translate(470,70) rotate(-4)"><rect width="130" height="170" fill="#e9e6ee" ${st(4)}/>` +
      `<path d="M20,120 C40,60 90,60 110,120" stroke="#b0acbc" stroke-width="6" fill="none"/><circle cx="65" cy="62" r="22" fill="#cfcbd8"/>` +
      `<rect x="45" y="-10" width="40" height="18" fill="#f5f0c8" opacity=".9" transform="rotate(6 65 0)"/></g>`;
    // 時計
    s += `<g transform="translate(760,120)"><circle r="40" fill="#efecf3" ${st(5)}/><path d="M0,0 L0,-26 M0,0 L18,8" ${st(5)}/></g>`;
    // タンス
    s += `<g transform="translate(40,210)"><rect width="300" height="262" rx="6" fill="#8b6b5c" ${st(5)}/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="16" y="${16 + i * 60}" width="268" height="50" rx="4" fill="#9c7b6b" ${st(4)}/><rect x="130" y="${34 + i * 60}" width="40" height="12" rx="6" fill="#5c4438" ${st(3)}/>`;
    s += `<rect x="40" y="-46" width="54" height="46" fill="#d9d4e2" ${st(4)}/><path d="M50,-30 L84,-30 M50,-18 L76,-18" stroke="#a49eb2" stroke-width="4"/>`;
    s += `<path d="M200,-4 C196,-40 214,-62 232,-70 C226,-48 236,-30 250,-24 C248,-12 236,-4 200,-4 Z" fill="#6f8f6a" ${st(4)}/><rect x="196" y="-8" width="48" height="10" fill="#c58f6a" ${st(3)}/></g>`;
    // ちゃぶ台
    s += `<g transform="translate(250,560)"><path d="M-150,10 L-150,90 M150,10 L150,90 M-60,30 L-60,110 M60,30 L60,110" stroke="${OL}" stroke-width="22" stroke-linecap="round"/>` +
      `<path d="M-150,10 L-150,90 M150,10 L150,90 M-60,30 L-60,110 M60,30 L60,110" stroke="#7a3d33" stroke-width="13" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="18" rx="196" ry="52" fill="#7a3d33" ${st(5)}/><ellipse cx="0" cy="0" rx="196" ry="52" fill="#a8574a" ${st(5)}/>` +
      `<ellipse cx="-30" cy="-6" rx="120" ry="26" fill="#b7685a" opacity=".6"/>` +
      // マグカップとティッシュ
      `<g transform="translate(70,-30)"><path d="M-22,-30 L22,-30 L18,14 C10,22 -10,22 -18,14 Z" fill="#f1eef5" ${st(4)}/><path d="M22,-20 C40,-20 40,4 20,2" fill="none" ${st(4)}/></g>` +
      `<g transform="translate(-80,-28)"><rect x="-40" y="-26" width="80" height="40" fill="#f1eef5" ${st(4)}/><path d="M-6,-26 C-12,-50 12,-50 6,-26" fill="#fff" ${st(3)}/></g></g>`;
    // ブラウン管テレビ
    s += `<g transform="translate(880,348)"><path d="M90,0 L50,-80 M190,0 L240,-90" ${st(6)}/><circle cx="50" cy="-80" r="8" fill="#555" ${st(3)}/><circle cx="240" cy="-90" r="8" fill="#555" ${st(3)}/>` +
      `<rect x="0" y="0" width="320" height="250" rx="26" fill="#c23a3a" ${st(6)}/><rect x="12" y="10" width="296" height="40" rx="18" fill="#d9524d"/>` +
      `<rect x="26" y="34" width="210" height="176" rx="24" fill="#26252f" ${st(5)}/>` +
      `<rect x="252" y="40" width="44" height="160" rx="10" fill="#9f2c2c" ${st(4)}/><circle cx="274" cy="74" r="13" fill="#e6e1ea" ${st(4)}/><circle cx="274" cy="118" r="13" fill="#e6e1ea" ${st(4)}/>` +
      `<path d="M262,150 L286,150 M262,162 L286,162 M262,174 L286,174" stroke="${OL}" stroke-width="3"/>` +
      `<path d="M40,250 L30,286 M280,250 L290,286" ${st(8)}/></g>`;
    // 紙くず
    for (const [x, y, r] of [[560, 650, 14], [720, 690, 12], [1110, 680, 16], [80, 690, 13]]) s += `<path d="M${x - r},${y} l${r * 0.6},${-r} l${r * 0.8},${r * 0.3} l${r * 0.6},${r * 0.9} l${-r},${r * 0.6} Z" fill="#f4f1f7" ${st(3)}/>`;
    return s;
  }

  const P = {};
  P.room = MV.svgWrap(room(), 1280, 720, 1);
  MV.PROPPARTS = P;
  MV.TV_SCREEN = { x: 880 + 26, y: 348 + 34, w: 210, h: 176, r: 24 };
})();
