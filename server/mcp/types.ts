export interface ToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface JsonSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
  description?: string;
}

export interface BaseToolDef {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  _outputBudgetBytes: number;
  annotations: ToolAnnotations;
  _apiPaths?: string[];
}

export interface RpcToolDef extends BaseToolDef {
  _execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface CacheToolDef extends BaseToolDef {
  _getData: (params: Record<string, unknown>) => Promise<unknown>;
}

export type ToolDef = RpcToolDef | CacheToolDef;

export interface McpContext {
  apiKey?: string;
}

export function isRpcTool(tool: ToolDef): tool is RpcToolDef {
  return '_execute' in tool;
}

const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function readOnlyTool(
  partial: Omit<BaseToolDef, 'annotations'> & Partial<Pick<BaseToolDef, 'annotations'>>,
): BaseToolDef {
  return { annotations: READ_ONLY, ...partial };
}
