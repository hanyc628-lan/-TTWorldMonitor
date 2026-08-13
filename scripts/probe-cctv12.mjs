const r = await fetch('http://cbox.cntv.cn/epg/ctlist/', {
  headers: { Referer: 'https://tv.cctv.com/', 'User-Agent': 'Mozilla/5.0' },
});
const t = await r.text();
console.log(t.slice(0, 1000));
const cctv5 = t.match(/cctv5[^}]{0,200}/gi);
console.log('cctv5 refs', cctv5?.slice(0, 5));
