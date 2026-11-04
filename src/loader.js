// 画像・フォントの読み込み
(function () {
  const MV = (window.MV = window.MV || {});
  MV.IMG = {};

  function load(name, url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { MV.IMG[name] = img; res(); };
      img.onerror = () => { console.error('load failed', name, url); rej(new Error(url)); };
      img.src = url;
    });
  }
  const svgURL = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

  MV.loadAll = async function () {
    const B = MV.BASE || '';
    const files = {
      kuro_body: 'assets/chars/kuro_body.png',
      'kuro_body@2x': 'assets/chars/kuro_body@2x.png',
      kuro_wing: 'assets/chars/kuro_wing.png',
      mob_up_L: 'assets/chars/mob_up_L.png',
      mob_up_R: 'assets/chars/mob_up_R.png',
      mob_ch_L: 'assets/chars/mob_ch_L.png',
      mob_ch_R: 'assets/chars/mob_ch_R.png',
      real: 'assets/kuro_real.png',
    };
    const jobs = Object.entries(files).map(([k, f]) => load(k, B + f));
    for (const [k, v] of Object.entries(MV.PROPPARTS || {})) jobs.push(load(k, svgURL(v)));
    await Promise.all(jobs);
    await Promise.all([
      document.fonts.load('100px "MP1"', 'ダ天使あ'),
      document.fonts.load('100px "MaruB"', 'ダ天使あ'),
      document.fonts.load('100px "MaruK"', 'ダ天使あ'),
    ]);
    await document.fonts.ready;
  };
})();
