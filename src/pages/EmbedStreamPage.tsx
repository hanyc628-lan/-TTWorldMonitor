import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer';

/** 同源嵌入页：供 iframe 伪内嵌播放 */
export function EmbedStreamPage() {
  const { streamId } = useParams<{ streamId: string }>();
  const [id, setId] = useState(streamId ?? '');

  useEffect(() => {
    if (streamId) setId(streamId);
  }, [streamId]);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-black p-0">
      <LiveStreamPlayer streamId={id} hero />
    </div>
  );
}
