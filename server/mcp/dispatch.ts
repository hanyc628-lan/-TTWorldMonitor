import jmespath from 'jmespath';
import type { McpContext } from './types.js';
import { isRpcTool } from './types.js';
import { getToolByName } from './registry/index.js';

export async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
  _context: McpContext,
): Promise<unknown> {
  const tool = getToolByName(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  let result: unknown;

  if (isRpcTool(tool)) {
    result = await tool._execute(args);
  } else {
    result = await tool._getData(args);
  }

  const jmespathExpr = args.jmespath as string | undefined;
  if (jmespathExpr && typeof jmespathExpr === 'string') {
    try {
      return jmespath.search(result, jmespathExpr);
    } catch {
      return result;
    }
  }

  return result;
}
