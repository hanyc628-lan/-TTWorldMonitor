const html = await (await fetch('https://tv.cctv.com/live/cctv5/', { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
const interesting = [...html.matchAll(/(cctv5|channel|liveplayer|guid|hls|m3u8|getHttp)[^<]{0,80}/gi)].slice(0, 30);
for (const m of interesting) console.log(m[0].replace(/\s+/g, ' '));

// config tool
const cfg = await (await fetch('//r.img.cctvpic.com/photoAlbum/templet/common/DEPA1486437585241505/configtoolV1.1.js'.replace('//', 'https://'))).text();
const lines = cfg.split('\n').filter((l) => /cctv5|live|pid|channel/i.test(l)).slice(0, 20);
console.log('cfg lines', lines);
