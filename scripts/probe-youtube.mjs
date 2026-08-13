const tests = [
  'https://www.youtube.com/oembed?url=https://www.youtube.com/@WTTGlobal/live&format=json',
  'https://www.youtube.com/oembed?url=https://www.youtube.com/channel/UCl92Wz5d6t90Kq-bM5V4VqQ/live&format=json',
];
for (const url of tests) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(url, r.status);
    console.log((await r.text()).slice(0, 400));
  } catch (e) {
    console.log(url, 'err', e.message);
  }
}
