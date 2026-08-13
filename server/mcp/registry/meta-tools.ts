import type { RpcToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { buildPublicTool } from '../build-tool.js';
import { simpleOutput } from './helpers.js';

let toolRegistryRef: import('../types.js').ToolDef[] = [];

export function setToolRegistryForMeta(tools: import('../types.js').ToolDef[]): void {
  toolRegistryRef = tools;
}

export const META_TOOLS: RpcToolDef[] = [
  {
    ...readOnlyTool({
      name: 'describe_tool',
      description: 'Returns the full input/output schema for any MCP tool. Quota-exempt introspection.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: { tool_name: { type: 'string' } },
        required: ['tool_name'],
      },
      outputSchema: simpleOutput({ name: { type: 'string' } }),
    }),
    _execute: async (params) => {
      const tool = toolRegistryRef.find((t) => t.name === params.tool_name);
      if (!tool) return { error: 'Tool not found', available: toolRegistryRef.map((t) => t.name) };
      return buildPublicTool(tool);
    },
  },
  {
    ...readOnlyTool({
      name: 'list_all_tools',
      description: 'List all registered MCP tool names grouped by domain.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: simpleOutput({ tools: { type: 'array' }, count: { type: 'number' } }),
    }),
    _execute: async () => ({
      count: toolRegistryRef.length,
      tools: toolRegistryRef.map((t) => ({
        name: t.name,
        description: t.description.slice(0, 120),
        apiPaths: t._apiPaths ?? [],
      })),
    }),
  },
];
