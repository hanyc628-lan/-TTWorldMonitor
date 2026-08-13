const urls = [
  'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5_1/index.m3u8',
  'http://ldncctvwbcdks.v.kcdnvip.com/ldncctvwbcd/cdrmldcctv5_1/index.m3u8',
  'https://ldncctvwbndks.v.kcdnvip.com/ldncctvwbnd/ldcctv5_2/index.m3u8',
  'http://ldncctvwbndbd.a.bdydns.com/ldncctvwbnd/ldcctv5_2/index.m3u8',
];
for (const url of urls) {
  try {
    const r = await fetch(url, { headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' } });
    console.log(url, r.status, (await r.text()).slice(0, 150));
  } catch (e) {
    console.log(url, e.message);
  }
}
