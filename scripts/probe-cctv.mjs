const r = await fetch('https://tv.cctv.com/live/cctv5/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
});
const t = await r.text();
console.log('len', t.length);
const patterns = [
  /https?:[^"'\s]+\.m3u8[^"'\s]*/g,
  /hls_url[^"']*"([^"]+)"/g,
  /"url":"([^"]+\.m3u8[^"]*)"/g,
  /var\s+hls_url\s*=\s*['"]([^'"]+)/g,
  /cctvcdn[^"'\s]+/g,
];
for (const p of patterns) {
  const m = [...t.matchAll(p)].slice(0, 5);
  if (m.length) console.log(p.toString(), m.map((x) => x[1] ?? x[0]));
}
// try cctv api
const api = await fetch('https://api.cntv.cn/live/getLiveUrlApi?serviceId=cctv5', {
  headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://tv.cctv.com/' },
}).catch((e) => ({ ok: false, text: () => e.message }));
if (api.ok) {
  const j = await api.text();
  console.log('api', j.slice(0, 500));
}
