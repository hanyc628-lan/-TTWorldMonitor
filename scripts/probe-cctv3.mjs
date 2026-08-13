const urls = [
  'http://ottrrs.hl.chinamobile.com/PLTV/88888888/224/3221225603/index.m3u8',
  'http://ottrrs.hl.chinamobile.com/PLTV/88888888/224/3221226019/index.m3u8',
];
for (const url of urls) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(url, r.status, (await r.text()).slice(0, 200));
  } catch (e) {
    console.log(url, 'err', e.message);
  }
}
