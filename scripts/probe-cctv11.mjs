const js = await (await fetch('https://p1.img.cctvpic.com/photoAlbum/templet/common/DEPA1567091909687313/h5_live_index.js', {
  headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' },
})).text();
console.log('len', js.length);
const snippets = ['zhiboliu', 'liveHtml5', 'vdn', 'cctv5', 'm3u8', 'hls', 'channel'];
for (const s of snippets) {
  const i = js.indexOf(s);
  if (i >= 0) console.log(s, js.slice(Math.max(0, i - 30), i + 100).replace(/\s+/g, ' '));
}
