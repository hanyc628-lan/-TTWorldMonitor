const js = await (await fetch('https://js.player.cntv.cn/creator/liveplayer.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://tv.cctv.com/' },
})).text();
console.log('len', js.length);
const apis = [...js.matchAll(/https?:\/\/[^'"]+/g)].map((m) => m[0]).filter((u) => /api|live|vdn|cntv/i.test(u));
console.log('apis', [...new Set(apis)].slice(0, 20));
const m3u8 = [...js.matchAll(/\.m3u8[^'"]*/g)].slice(0, 5);
console.log('m3u8 refs', m3u8);

// try live cctv api patterns
const tries = [
  'https://live.cctv.com/live/cctv5.m3u8',
  'https://live.cctv.com/live/cctv5/index.m3u8',
  'https://cctv5.live.cctv.com/cctv5.m3u8',
];
for (const url of tries) {
  try {
    const r = await fetch(url, { headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' } });
    console.log(url, r.status, (await r.text()).slice(0, 120));
  } catch (e) {
    console.log(url, e.message);
  }
}
