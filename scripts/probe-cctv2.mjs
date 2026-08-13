const apis = [
  'https://api.cntv.cn/live/getLiveUrlApi?serviceId=cctv5',
  'https://api.cntv.cn/live/getLiveUrlApi?serviceId=cctv5plus',
  'https://livechina.cctv.com/cctv5/',
];
for (const url of apis) {
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://tv.cctv.com/',
      },
      redirect: 'follow',
    });
    const t = await r.text();
    console.log('---', url, r.status);
    console.log(t.slice(0, 800));
    const m3u8 = [...t.matchAll(/https?:[^"'\s\\]+\.m3u8[^"'\s\\]*/g)].slice(0, 3);
    if (m3u8.length) console.log('m3u8', m3u8.map((x) => x[0]));
  } catch (e) {
    console.log('err', url, e.message);
  }
}
