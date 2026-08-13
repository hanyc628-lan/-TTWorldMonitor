import { useEffect, useRef } from 'react';
import type { StrokePreset } from '@/data/motion-lab';

interface Props {
  stroke: StrokePreset;
  phase: number;
}

function project(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  scale: number,
): { x: number; y: number } {
  const f = 2.5 / (2.5 + z);
  return { x: cx + x * scale * f, y: cy - y * scale * f };
}

/** 3D 简化骨架侧视投影 */
export function BiomechCanvas3D({ stroke, phase }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.45;
    const cy = h * 0.65;
    const scale = Math.min(w, h) * 0.35;

    const pts2d = stroke.skeleton2d;
    const pts3d = pts2d.map((p, i) => {
      const z = Math.sin(i * 0.5 + phase * Math.PI * 2) * 0.15;
      const y = 1 - p.y;
      return project(p.x * 2 - 1, y, z, cx, cy, scale);
    });

    for (let i = 0; i < pts3d.length - 1; i++) {
      const depth = 1 - i / pts3d.length;
      ctx.strokeStyle = `rgba(77, 159, 255, ${0.4 + depth * 0.5})`;
      ctx.lineWidth = 3 - i * 0.2;
      ctx.beginPath();
      ctx.moveTo(pts3d[i].x, pts3d[i].y);
      ctx.lineTo(pts3d[i + 1].x, pts3d[i + 1].y);
      ctx.stroke();
    }

    pts3d.forEach((p, i) => {
      ctx.fillStyle = i === pts3d.length - 1 ? '#ff4d4d' : '#f5c542';
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === pts3d.length - 1 ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 地面网格
    for (let gx = -1; gx <= 1; gx += 0.25) {
      const a = project(gx, 0, -0.8, cx, cy, scale);
      const b = project(gx, 0, 0.8, cx, cy, scale);
      ctx.strokeStyle = '#2a3040';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }, [stroke, phase]);

  return <canvas ref={ref} className="w-full h-full min-h-[280px] rounded-lg" />;
}
