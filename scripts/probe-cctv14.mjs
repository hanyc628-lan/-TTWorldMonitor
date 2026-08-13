const candidates = [
  'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5p_1/index.m3u8',
  'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5plus_1/index.m3u8',
  'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5plus_2/index.m3u8',
  'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5p_2/index.m3u8',
  'https://ldncctvwbcdks.v.kcdnvip.com/ldncctvwbcd/cdrmldcctv5p_1/index.m3u8',
];
const headers = { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' };
for (const url of candidates) {
  try {
    const r = await fetch(url, { headers });
    const t = await r.text();
    console.log(url, r.status, t.startsWith('#EXTM3U') ? 'HLS OK' : t.slice(0, 80));
  } catch (e) {
    console.log(url, e.message);
  }
}
