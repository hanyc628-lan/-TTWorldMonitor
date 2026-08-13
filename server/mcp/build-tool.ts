import type { ToolDef } from './types.js';

export function buildPublicTool(tool: ToolDef) {
  const { name, description, inputSchema, outputSchema, annotations } = tool;
  return {
    name,
    description,
    inputSchema: {
      ...inputSchema,
      properties: {
        ...inputSchema.properties,
        jmespath: {
          type: 'string',
          description: 'Optional JMESPath expression to project the response fields you need.',
        },
      },
    },
    outputSchema,
    annotations,
  };
}
