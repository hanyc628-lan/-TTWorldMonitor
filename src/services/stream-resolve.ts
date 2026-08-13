export type StreamPlaybackMode = 'hls' | 'youtube' | 'dock';

export interface StreamResolveResult {
  streamId: string;
  mode: StreamPlaybackMode;
  manifestUrl?: string;
  youtubeChannelId?: string;
  youtubeVideoId?: string;
  openUrl: string;
  expiresAt?: string;
}

export async function resolveStreamPlayback(streamId: string): Promise<StreamResolveResult | null> {
  const res = await fetch(`/api/streams/resolve/${encodeURIComponent(streamId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json() as Promise<StreamResolveResult>;
}
