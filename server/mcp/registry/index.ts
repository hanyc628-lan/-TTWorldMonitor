import type { ToolDef } from '../types.js';
import { buildPublicTool } from '../build-tool.js';
import { CACHE_TOOLS } from './cache-tools.js';
import { RPC_TOOLS } from './rpc-tools.js';
import { RANKING_TOOLS } from './ranking-tools.js';
import { COUNTRY_TOOLS } from './country-tools.js';
import { INTELLIGENCE_TOOLS } from './intelligence-tools.js';
import { TOURNAMENT_TOOLS } from './tournament-tools.js';
import { STREAM_TOOLS } from './stream-tools.js';
import { CONFIG_TOOLS } from './config-tools.js';
import { ANALYSIS_TOOLS } from './analysis-tools.js';
import { PLAYER_TOOLS } from './player-tools.js';
import { META_TOOLS, setToolRegistryForMeta } from './meta-tools.js';

export const TOOL_REGISTRY: ToolDef[] = [
  ...CACHE_TOOLS,
  ...RPC_TOOLS,
  ...RANKING_TOOLS,
  ...COUNTRY_TOOLS,
  ...INTELLIGENCE_TOOLS,
  ...TOURNAMENT_TOOLS,
  ...STREAM_TOOLS,
  ...CONFIG_TOOLS,
  ...ANALYSIS_TOOLS,
  ...PLAYER_TOOLS,
  ...META_TOOLS,
];

setToolRegistryForMeta(TOOL_REGISTRY);

export const TOOL_LIST_RESPONSE = TOOL_REGISTRY.map((tool) => buildPublicTool(tool));

export function getToolByName(name: string): ToolDef | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

export { buildPublicTool };
