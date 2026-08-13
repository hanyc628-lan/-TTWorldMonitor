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
): { x: number; y: number; s: number } {
  const f = 2.5 / (2.5 + z);
  return { x: cx + x * scale * f, y: cy - y * scale * f, s: f };
}

export function MechanicsCanvas3D({ stroke, phase }: Props) {
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

    const cx = w * 0.5;
    const cy = h * 0.55;
    const scale = Math.min(w, h) * 0.32;

    // 球台（透视四边形）
    const tableCorners = [
      [-1, 0, 0.5],
      [1, 0, 0.5],
      [1, 0, -0.5],
      [-1, 0, -0.5],
    ].map(([x, y, z]) => project(x, y, z, cx, cy, scale));

    ctx.fillStyle = '#1a4d2e';
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tableCorners[0].x, tableCorners[0].y);
    tableCorners.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 球网
    const netL = project(-1, 0.12, 0, cx, cy, scale);
    const netR = project(1, 0.12, 0, cx, cy, scale);
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(netL.x, netL.y);
    ctx.lineTo(netR.x, netR.y);
    ctx.stroke();

    // 球路
    const path = stroke.ballPath3d;
    const pathPts = path.map((p) => project(p.x, p.y, p.z, cx, cy, scale));

    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    pathPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([]);

    // 旋转轴示意
    const spinCenter = pathPts[Math.floor(pathPts.length * 0.4)] ?? pathPts[0];
    ctx.strokeStyle = '#4d9fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(spinCenter.x, spinCenter.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4d9fff';
    ctx.font = '9px monospace';
    ctx.fillText(`${stroke.spinRpm} rpm`, spinCenter.x + 18, spinCenter.y);

    // 动画球位置
    const t = phase % 1;
    const seg = t * (path.length - 1);
    const i0 = Math.floor(seg);
    const i1 = Math.min(i0 + 1, path.length - 1);
    const frac = seg - i0;
    const bp = {
      x: path[i0].x + (path[i1].x - path[i0].x) * frac,
      y: path[i0].y + (path[i1].y - path[i0].y) * frac,
      z: path[i0].z + (path[i1].z - path[i0].z) * frac,
    };
    const ball = project(bp.x, bp.y, bp.z, cx, cy, scale);
    const ballR = 6 * ball.s;
    const grad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, ballR);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#f5c542');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
    ctx.fill();

    // 速度矢量
    const contact = pathPts[Math.floor(path.length * 0.35)] ?? pathPts[0];
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(contact.x, contact.y);
    ctx.lineTo(contact.x + 40, contact.y - 25);
    ctx.stroke();
    ctx.fillStyle = '#ff4d4d';
    ctx.font = '10px monospace';
    ctx.fillText(`${stroke.contactSpeed} m/s`, contact.x + 44, contact.y - 22);

    // 马格努斯力
    ctx.strokeStyle = '#4d9fff88';
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + 0, ball.y - 30 * ball.s);
    ctx.stroke();
    ctx.fillStyle = '#8b95a8';
    ctx.font = '9px monospace';
    ctx.fillText('F_Magnus', ball.x + 4, ball.y - 32 * ball.s);
  }, [stroke, phase]);

  return <canvas ref={ref} className="w-full h-full min-h-[280px] rounded-lg" />;
}
