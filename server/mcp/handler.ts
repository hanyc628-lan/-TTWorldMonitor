import type { IncomingMessage, ServerResponse } from 'node:http';
import { TOOL_LIST_RESPONSE } from './registry/index.js';
import { dispatchTool } from './dispatch.js';

interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

function rpcOk(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function rpcErr(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-TTWorldMonitor-Key',
  });
  res.end(body);
}

export async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-TTWorldMonitor-Key',
    });
    res.end();
    return;
  }

  if (req.method === 'GET') {
    sendJson(res, {
      name: 'TTWorldMonitor MCP Server',
      version: '0.1.0',
      protocol: 'streamable-http',
      tools: TOOL_LIST_RESPONSE.length,
      endpoint: 'POST /mcp',
      authentication: 'Optional X-TTWorldMonitor-Key header',
      documentation: `${TOOL_LIST_RESPONSE.length} tools for table tennis intelligence`,
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, rpcErr(null, -32600, 'Invalid Request'), 405);
    return;
  }

  let body: JsonRpcRequest;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw) as JsonRpcRequest;
  } catch {
    sendJson(res, rpcErr(null, -32700, 'Parse error'), 400);
    return;
  }

  const { id, method, params } = body;
  const apiKey = req.headers['x-ttworldmonitor-key'] as string | undefined;

  try {
    switch (method) {
      case 'initialize':
        sendJson(res, rpcOk(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'ttworldmonitor-mcp', version: '0.1.0' },
        }));
        return;

      case 'tools/list':
      case 'tools/list/v1':
        sendJson(res, rpcOk(id, { tools: TOOL_LIST_RESPONSE }));
        return;

      case 'tools/call':
      case 'tools/call/v1': {
        const toolParams = (params ?? {}) as Record<string, unknown>;
        const toolName = String(toolParams.name ?? '');
        const toolArgs = (toolParams.arguments ?? {}) as Record<string, unknown>;
        const result = await dispatchTool(toolName, toolArgs, { apiKey });
        sendJson(res, rpcOk(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        }));
        return;
      }

      case 'ping':
        sendJson(res, rpcOk(id, {}));
        return;

      default:
        sendJson(res, rpcErr(id, -32601, `Method not found: ${method}`));
    }
  } catch (err) {
    sendJson(res, rpcErr(id, -32603, String(err)));
  }
}
