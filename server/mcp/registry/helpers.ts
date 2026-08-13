export const envelope = (props: Record<string, unknown>) => ({
  type: 'object',
  properties: {
    data: { type: 'object', properties: props },
    fetchedAt: { type: 'string' },
  },
});

export const emptyInput = { type: 'object' as const, properties: {}, required: [] as string[] };

export function simpleOutput(props: Record<string, unknown>) {
  return { type: 'object' as const, properties: props };
}
