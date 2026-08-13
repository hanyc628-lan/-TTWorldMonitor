/** 在浏览器中解析 YouTube 直播页当前 videoId（需用户网络可访问 YouTube） */
export async function resolveYoutubeLiveVideoId(livePageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(livePageUrl, { credentials: 'omit' });
    if (!res.ok) return null;
    const html = await res.text();
    const fromWatch = html.match(/"url":"https:\\\/\\\/www\.youtube\.com\\\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (fromWatch?.[1]) return fromWatch[1];
    const direct = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (direct?.[1] && direct[1] !== 'undefined') return direct[1];
    const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    return canonical?.[1] ?? null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrls(channelId: string, videoId?: string | null): string[] {
  const params = 'autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1';
  const list: string[] = [];
  if (videoId) {
    list.push(`https://www.youtube-nocookie.com/embed/${videoId}?${params}`);
    list.push(`https://www.youtube.com/embed/${videoId}?${params}`);
  }
  list.push(`https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&${params}`);
  list.push(`https://www.youtube.com/embed/live_stream?channel=${channelId}&${params}`);
  return list;
}
