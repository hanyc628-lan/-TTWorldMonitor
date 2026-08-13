import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { ServerResponse } from 'node:http';

const DIST = join(process.cwd(), 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function tryServeStatic(pathname: string, res: ServerResponse): boolean {
  if (!existsSync(DIST)) return false;

  let filePath = pathname === '/' ? '/index.html' : pathname;
  const resolved = join(DIST, filePath);

  if (!resolved.startsWith(DIST)) {
    res.writeHead(403);
    res.end();
    return true;
  }

  if (!existsSync(resolved) || statSync(resolved).isDirectory()) {
    const fallback = join(DIST, 'index.html');
    if (!existsSync(fallback)) return false;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    createReadStream(fallback).pipe(res);
    return true;
  }

  const ext = extname(resolved);
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  createReadStream(resolved).pipe(res);
  return true;
}

export function isProductionCloud(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.TTWM_CLOUD === '1';
}
