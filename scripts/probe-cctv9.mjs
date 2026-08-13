const js = await (await fetch('https://js.player.cntv.cn/creator/liveplayer.js', {
  headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' },
})).text();
const urls = [...js.matchAll(/https?:\/\/[^'"]+ldcctv[^'"]+\.m3u8/g)].map((m) => m[0]);
console.log([...new Set(urls)].filter((u) => /cctv5/i.test(u)));
console.log('all ldcctv', [...new Set(urls)].slice(0, 30));
