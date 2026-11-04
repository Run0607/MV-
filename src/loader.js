// SVG文字列 → Image に変換して保持
(function () {
  const MV = (window.MV = window.MV || {});
  MV.IMG = {};

  function loadSVG(name, svgStr) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { MV.IMG[name] = img; res(); };
      img.onerror = (e) => { console.error('SVG load failed', name); rej(e); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    });
  }
  function loadURL(name, url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { MV.IMG[name] = img; res(); };
      img.onerror = rej;
      img.src = url;
    });
  }

  // 一度だけラスタライズしてキャンバス化（drawImage を速く・安定させる）
  function rasterize(name) {
    const img = MV.IMG[name];
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    c.logicalW = img.naturalWidth / 2; c.logicalH = img.naturalHeight / 2;
    MV.IMG[name] = c;
  }

  MV.loadAll = async function () {
    const jobs = [];
    const all = Object.assign({}, MV.SVGPARTS, MV.MOBPARTS || {}, MV.PROPPARTS || {});
    for (const [k, v] of Object.entries(all)) jobs.push(loadSVG(k, v));
    jobs.push(loadURL('real', (MV.BASE || '') + 'assets/kuro_real.png'));
    await Promise.all(jobs);
    for (const k of Object.keys(all)) rasterize(k);
    await Promise.all([
      document.fonts.load('100px "Dela"', 'ダ天使あ'),
      document.fonts.load('100px "MaruB"', 'ダ天使あ'),
      document.fonts.load('100px "MaruK"', 'ダ天使あ'),
    ]);
    await document.fonts.ready;
  };
})();
