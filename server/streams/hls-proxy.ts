import type { ServerResponse } from 'node:http';
import { getHlsUrlForStream, getStreamReferer } from './resolver.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function proxySegmentPath(streamId: string, targetUrl: string): string {
  return `/api/streams/segment/${streamId}?u=${encodeURIComponent(targetUrl)}`;
}

function rewriteManifest(body: string, baseUrl: string, streamId: string): string {
  const base = new URL(baseUrl);
  return body
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const absolute = new URL(trimmed, base).href;
      return proxySegmentPath(streamId, absolute);
    })
    .join('\n');
}

async function fetchUpstream(url: string, referer: string): Promise<Response> {
  return fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: referer,
      Origin: new URL(referer).origin,
    },
    redirect: 'follow',
  });
}

export async function handleManifestRequest(
  streamId: string,
  res: ServerResponse,
): Promise<boolean> {
  const info = await getHlsUrlForStream(streamId);
  if (!info) return false;

  const upstream = await fetchUpstream(info.url, info.referer);
  if (!upstream.ok) {
    res.writeHead(upstream.status, { 'Content-Type': 'text/plain' });
    res.end(`upstream ${upstream.status}`);
    return true;
  }

  const text = await upstream.text();
  const rewritten = rewriteManifest(text, upstream.url, streamId);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.apple.mpegurl',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(rewritten);
  return true;
}

export async function handleSegmentRequest(
  streamId: string,
  targetUrl: string,
  res: ServerResponse,
): Promise<void> {
  const referer = getStreamReferer(streamId);
  const upstream = await fetchUpstream(targetUrl, referer);

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
  const body = Buffer.from(await upstream.arrayBuffer());

  if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
    const rewritten = rewriteManifest(body.toString('utf8'), targetUrl, streamId);
    res.writeHead(upstream.status, {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(rewritten);
    return;
  }

  res.writeHead(upstream.status, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=30',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

export function manifestUrl(streamId: string): string {
  return `/api/streams/manifest/${streamId}`;
}
