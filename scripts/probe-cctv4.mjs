const r = await fetch('https://tv.cctv.com/live/cctv5/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
});
const t = await r.text();
const scripts = [...t.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
console.log('scripts', scripts.slice(0, 15));
const cfg = t.match(/var\s+(\w+)\s*=\s*(\{[\s\S]{0,500})/g);
if (cfg) console.log('vars', cfg.slice(0, 5));

// try cntv player api used by cctv web player
const pid = '578560200000001000001'; // cctv5 pid guess
const apis = [
  `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${pid}`,
  `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=578560200000001000001`,
  'https://live.cctv.com/live/channel=578560200000001000001?sub=1',
];
for (const url of apis) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://tv.cctv.com/' },
    });
    const body = await res.text();
    console.log('---', url, res.status);
    console.log(body.slice(0, 600));
    const m3u8 = [...body.matchAll(/https?:[^"'\s\\]+\.m3u8[^"'\s\\]*/g)].slice(0, 2);
    if (m3u8.length) console.log('m3u8', m3u8.map((x) => x[0]));
  } catch (e) {
    console.log('err', url, e.message);
  }
}
