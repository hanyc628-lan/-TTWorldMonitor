const urls = [
  'https://www.youtube.com/@WTTGlobal/live',
  'https://www.youtube.com/@ITTFTableTennis/live',
  'https://tv.cctv.com/live/cctv5/',
  'https://live.douyin.com/57194239656',
];

for (const url of urls) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    const t = await r.text();
    const vid = t.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)?.[1];
    const m3u8 = [...t.matchAll(/https?:[^"'\s]+\.m3u8[^"'\s]*/g)].slice(0, 3).map((m) => m[0]);
    const flv = [...t.matchAll(/https?:[^"'\s]+\.flv[^"'\s]*/g)].slice(0, 2).map((m) => m[0]);
    console.log('---', url);
    console.log('status', r.status, 'len', t.length);
    if (vid) console.log('videoId', vid);
    if (m3u8.length) console.log('m3u8', m3u8);
    if (flv.length) console.log('flv', flv);
  } catch (e) {
    console.log('err', url, e.message);
  }
}
