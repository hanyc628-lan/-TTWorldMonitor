import { resolveDouyinHls } from '../server/streams/resolver.js';

const url = await resolveDouyinHls('https://live.douyin.com/57194239656');
console.log('url', url);
const r = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Referer: 'https://live.douyin.com/',
    Origin: 'https://live.douyin.com',
  },
});
console.log('status', r.status, (await r.text()).slice(0, 300));
