import { createServer } from 'node:http';
import { handleApiRoute } from './middleware.js';
import { TOOL_REGISTRY } from './mcp/registry/index.js';
import { startCloudEvolutionWorker } from './evolution/worker.js';
import { tryServeStatic, isProductionCloud } from './static.js';

const PORT = Number(process.env.PORT ?? process.env.TTWM_PORT ?? 3100);
const HOST = process.env.TTWM_HOST ?? '0.0.0.0';

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-TTWorldMonitor-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const handled = await handleApiRoute(req, res, url.pathname, url.searchParams);
    if (handled) return;

    if (isProductionCloud() && req.method === 'GET' && tryServeStatic(url.pathname, res)) {
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TTWorldMonitor server on http://${HOST}:${PORT}`);
  console.log(`  Mode:      ${isProductionCloud() ? 'cloud (static + API)' : 'API only'}`);
  console.log(`  REST API:  /api/bootstrap · /api/evolution/state`);
  console.log(`  MCP:       /mcp`);
  console.log(`  Health:    /api/health`);
  console.log(`  Tools:     ${TOOL_REGISTRY.length} MCP tools`);

  startCloudEvolutionWorker();
});
