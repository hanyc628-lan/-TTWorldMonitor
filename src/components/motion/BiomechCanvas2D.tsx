import { useEffect, useRef } from 'react';
import type { StrokePreset } from '@/data/motion-lab';

interface Props {
  stroke: StrokePreset;
  phase: number;
}

export function BiomechCanvas2D({ stroke, phase }: Props) {
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

    // 地面
    ctx.strokeStyle = '#2a3040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.9);
    ctx.lineTo(w, h * 0.9);
    ctx.stroke();

    const pts = stroke.skeleton2d.map((p, i) => {
      const sway = Math.sin(phase * Math.PI * 2 + i * 0.3) * 0.008;
      return { x: (p.x + sway) * w, y: p.y * h };
    });

    // 动力链箭头
    const chainColors = ['#4d9fff', '#4d9fff88', '#f5c54288', '#ff4d4d88'];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.strokeStyle = chainColors[Math.min(i, chainColors.length - 1)];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.fillStyle = chainColors[Math.min(i, chainColors.length - 1)];
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - (dx / len) * 8 + (-dy / len) * 4, b.y - (dy / len) * 8 + (dx / len) * 4);
      ctx.lineTo(b.x - (dx / len) * 8 - (-dy / len) * 4, b.y - (dy / len) * 8 - (dx / len) * 4);
      ctx.fill();
      if (i === 2 || i === 4) {
        ctx.fillStyle = '#8b95a8';
        ctx.font = '9px monospace';
        ctx.fillText(i === 2 ? '核心' : '鞭打', mx + 4, my - 4);
      }
    }

    // 关节
    pts.forEach((p, i) => {
      ctx.fillStyle = i === pts.length - 1 ? '#ff4d4d' : '#f5c542';
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === pts.length - 1 ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 关节角弧
    stroke.jointAngles.forEach((ja, idx) => {
      const p = pts[3 + idx];
      if (!p) return;
      const r = 22 + idx * 4;
      ctx.strokeStyle = '#4d9fff66';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, -0.8, 0.4);
      ctx.stroke();
      ctx.fillStyle = '#4d9fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${ja.jointZh} ${ja.angle}°`, p.x + r + 2, p.y);
    });

    // 重心
    const comX = pts.slice(0, 4).reduce((s, p) => s + p.x, 0) / 4;
    const comY = pts.slice(0, 4).reduce((s, p) => s + p.y, 0) / 4;
    ctx.strokeStyle = '#ff4d4d44';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(comX, comY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = '10px monospace';
    ctx.fillText('CoM', comX + 14, comY);
  }, [stroke, phase]);

  return <canvas ref={ref} className="w-full h-full min-h-[280px] rounded-lg" />;
}
