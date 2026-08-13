import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { STREAM_SOURCES } from '../../../src/config/stream-sources.js';
import { simulateStreamStatuses } from '../../streams.js';
import { envelope } from './helpers.js';

export const STREAM_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_stream_by_platform',
      description: 'Stream sources filtered by platform: cctv, youtube, douyin.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: { platform: { type: 'string', enum: ['cctv', 'youtube', 'douyin'] } },
        required: ['platform'],
      },
      outputSchema: envelope({ sources: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const platform = String(params.platform);
      const sources = STREAM_SOURCES.filter((s) => s.platform === platform);
      const statuses = simulateStreamStatuses();
      return {
        sources: sources.map((s) => ({
          ...s,
          status: statuses.find((st) => st.id === s.id),
        })),
        platform,
      };
    },
  },
];
