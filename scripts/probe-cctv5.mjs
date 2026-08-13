const r = await fetch('https://tv.cctv.com/live/cctv5/', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
const html = await r.text();
const pidMatch = html.match(/var\s+guid\s*=\s*["'](\d+)["']/);
const pid2 = html.match(/pid[=:]["']?(\d{10,})/i);
console.log('guid', pidMatch?.[1], 'pid2', pid2?.[1]);
const pids = [...html.matchAll(/(\d{15,25})/g)].map((m) => m[1]);
console.log('long nums', [...new Set(pids)].slice(0, 10));

for (const pid of [...new Set([pidMatch?.[1], pid2?.[1], ...pids.slice(0, 3)].filter(Boolean))]) {
  const api = `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${pid}`;
  const res = await fetch(api, { headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' } });
  const body = await res.text();
  if (body.includes('m3u8') || body.includes('"ack":"yes"')) {
    console.log('HIT', pid, body.slice(0, 500));
  }
}
