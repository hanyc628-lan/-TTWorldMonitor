import { useEffect, useRef } from 'react';
import type { StrokePreset } from '@/data/motion-lab';

interface Props {
  stroke: StrokePreset;
  phase: number;
  mode: '2d' | '3d';
}

const PHI = 1.618;

export function AestheticsCanvas({ stroke, phase, mode }: Props) {
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

    const { aesthetic } = stroke;
    const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);

    if (mode === '2d') {
      // 黄金分割网格
      const gx = w / PHI;
      const gy = h / PHI;
      ctx.strokeStyle = '#f5c54222';
      ctx.lineWidth = 1;
      [gx, w - gx].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      });
      [gy, h - gy].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      });

      // 动作轨迹曲线（贝塞尔）
      const pts = stroke.skeleton2d;
      const start = { x: pts[0].x * w, y: pts[0].y * h };
      const end = { x: pts[pts.length - 1].x * w, y: pts[pts.length - 1].y * h };
      const cp = { x: w * 0.5, y: h * (0.25 + pulse * 0.05) };

      ctx.strokeStyle = `rgba(245, 197, 66, ${0.4 + pulse * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
      ctx.stroke();

      // 对称轴
      const axisX = w * 0.5;
      ctx.strokeStyle = '#4d9fff33';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(axisX, 0);
      ctx.lineTo(axisX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // 骨架剪影
      pts.forEach((p, i) => {
        const x = p.x * w + Math.sin(phase * Math.PI * 2 + i) * 3;
        const y = p.y * h;
        ctx.fillStyle = i === pts.length - 1 ? '#ff4d4d' : '#f5c54288';
        ctx.beginPath();
        ctx.arc(x, y, i === pts.length - 1 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
        if (i > 0) {
          const prev = pts[i - 1];
          ctx.strokeStyle = '#f5c54255';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(prev.x * w, prev.y * h);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      // 节律波形
      ctx.strokeStyle = '#4d9fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const t = x / w;
        const y = h * 0.85 + Math.sin(t * Math.PI * 4 + phase * Math.PI * 2) * 12 * aesthetic.rhythm;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      // 3D 美学：轨迹在三维空间的优雅度（螺旋 + 球路）
      const cx = w * 0.5;
      const cy = h * 0.5;
      const scale = Math.min(w, h) * 0.28;

      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const r = (a / (Math.PI * 6)) * scale * aesthetic.golden;
        const x3 = Math.cos(a + phase * Math.PI * 2) * r * 0.01;
        const y3 = (a / (Math.PI * 6)) * 1.2 - 0.3;
        const z3 = Math.sin(a + phase * Math.PI * 2) * r * 0.01;
        const f = 2 / (2 + z3);
        const px = cx + x3 * scale * 8 * f;
        const py = cy - y3 * scale * f;
        const alpha = 0.15 + (a / (Math.PI * 6)) * 0.5;
        ctx.fillStyle = `rgba(245, 197, 66, ${alpha})`;
        ctx.fillRect(px, py, 2, 2);
      }

      stroke.ballPath3d.forEach((p, i) => {
        const f = 2 / (2 + p.z);
        const px = cx + p.x * scale * f;
        const py = cy - p.y * scale * f;
        ctx.fillStyle = `rgba(77, 159, 255, ${0.3 + i * 0.12})`;
        ctx.beginPath();
        ctx.arc(px, py, 4 * f, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 评分角标
    const scores = [
      { label: '对称', v: aesthetic.symmetry },
      { label: '节律', v: aesthetic.rhythm },
      { label: '流畅', v: aesthetic.flow },
      { label: '黄金', v: aesthetic.golden },
    ];
    scores.forEach((s, i) => {
      const bx = 12;
      const by = 20 + i * 22;
      const barW = 60 * s.v;
      ctx.fillStyle = '#1a2030';
      ctx.fillRect(bx, by, 64, 10);
      ctx.fillStyle = '#f5c542';
      ctx.fillRect(bx, by, barW, 10);
      ctx.fillStyle = '#8b95a8';
      ctx.font = '9px monospace';
      ctx.fillText(`${s.label} ${(s.v * 100).toFixed(0)}`, bx + 70, by + 9);
    });
  }, [stroke, phase, mode]);

  return <canvas ref={ref} className="w-full h-full min-h-[280px] rounded-lg" />;
}
