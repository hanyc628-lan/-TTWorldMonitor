import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SESSION_KEY = 'ttwm:visit-session';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

/** 合规访问统计：仅上报路径 + 匿名会话 ID，不含个人身份信息 */
export function VisitTracker() {
  const location = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    void fetch('/api/analytics/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, sessionId: getSessionId() }),
      keepalive: true,
    }).catch(() => { /* offline */ });
  }, [location.pathname]);

  return null;
}
