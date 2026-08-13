const js = await (await fetch('https://js.player.cntv.cn/creator/liveplayer.js', {
  headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' },
})).text();
for (const ch of ['cctv5', 'cctv5plus', 'cctv5p']) {
  const idx = js.indexOf(ch);
  if (idx < 0) continue;
  console.log('---', ch, js.slice(idx, idx + 200).replace(/\s+/g, ' '));
}
const m3u5 = [...js.matchAll(/ldcctv5[^'"]*\.m3u8/g)];
console.log('m3u5 patterns', [...new Set(m3u5.map((m) => m[0]))].slice(0, 10));

// try vdnx livets api
for (const ch of ['cctv5', 'cctv5plus']) {
  const url = `https://vdnx.live.cntv.cn/api/v3/vdn/livets?channel=${ch}&tsp=1`;
  try {
    const r = await fetch(url, { headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' } });
    const t = await r.text();
    console.log('vdnx', ch, r.status, t.slice(0, 400));
    const m3u8 = [...t.matchAll(/https?:[^"'\s\\]+\.m3u8[^"'\s\\]*/g)].slice(0, 2);
    if (m3u8.length) console.log('found', m3u8.map((x) => x[0]));
  } catch (e) {
    console.log('vdnx err', ch, e.message);
  }
}
