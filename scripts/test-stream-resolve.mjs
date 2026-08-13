import { resolveStream } from '../server/streams/resolver.js';
import { handleManifestRequest } from '../server/streams/hls-proxy.js';
import { createServer } from 'node:http';

const ids = ['douyin-xiaohan', 'cctv5-sports', 'cctv5plus', 'wtt-youtube'];
for (const id of ids) {
  const r = await resolveStream(id);
  console.log(id, r?.mode, r?.hlsUrl?.slice(0, 80) ?? r?.youtubeChannelId);
}

const server = createServer(async (req, res) => {
  if (req.url?.includes('/manifest/douyin-xiaohan')) {
    await handleManifestRequest('douyin-xiaohan', res);
    return;
  }
  res.end('ok');
});
server.listen(3999, async () => {
  const m = await fetch('http://localhost:3999/manifest/douyin-xiaohan');
  console.log('manifest status', m.status);
  console.log((await m.text()).slice(0, 400));
  server.close();
});
