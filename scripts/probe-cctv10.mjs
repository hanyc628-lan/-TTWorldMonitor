const apis = [
  'https://vdn.live.cntv.cn/api2/liveHtml5.do?channel=cctv5&tsp=1&client=html5',
  'https://vdn.live.cntv.cn/api2/liveHtml5.do?channel=cctv5plus&tsp=1&client=html5',
  'https://vdn.live.cntv.cn/api2/liveTimeshiftHtml5.do?channel=cctv5&tsp=1&client=html5',
  'https://api.live.cntv.cn/livestatic/zs/livestatic_config/pcweb/cctv5.json',
];
const headers = {
  Referer: 'https://tv.cctv.com/live/cctv5/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};
for (const url of apis) {
  try {
    const r = await fetch(url, { headers });
    const t = await r.text();
    console.log('---', url, r.status);
    console.log(t.slice(0, 500));
    const m3u8 = [...t.matchAll(/https?:[^"'\s\\]+\.m3u8[^"'\s\\]*/g)].slice(0, 2);
    if (m3u8.length) console.log('m3u8', m3u8.map((x) => x[0]));
  } catch (e) {
    console.log('err', url, e.message);
  }
}
