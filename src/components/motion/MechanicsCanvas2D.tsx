import { useEffect, useRef } from 'react';
import type { StrokePreset } from '@/data/motion-lab';

interface Props {
  stroke: StrokePreset;
  phase: number;
}

/** 2D 俯视图：力矢量 + 球台 + 旋转示意 */
export function MechanicsCanvas2D({ stroke, phase }: Props) {
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

    const pad = 24;
    const tw = w - pad * 2;
    const th = h * 0.55;
    const ty = h * 0.25;

    ctx.fillStyle = '#1a4d2e';
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 2;
    ctx.fillRect(pad, ty, tw, th);
    ctx.strokeRect(pad, ty, tw, th);

    ctx.strokeStyle = '#ffffff33';
    ctx.beginPath();
    ctx.moveTo(pad + tw / 2, ty);
    ctx.lineTo(pad + tw / 2, ty + th);
    ctx.stroke();

    const path = stroke.ballPath3d;
    const mapX = (x: number) => pad + ((x + 1) / 2) * tw;
    const mapY = (z: number) => ty + (1 - z) * th * 0.9;

    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    path.forEach((p, i) => {
      const px = mapX(p.x);
      const py = mapY(p.z);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    const t = phase % 1;
    const seg = t * (path.length - 1);
    const i0 = Math.floor(seg);
    const i1 = Math.min(i0 + 1, path.length - 1);
    const frac = seg - i0;
    const bx = path[i0].x + (path[i1].x - path[i0].x) * frac;
    const bz = path[i0].z + (path[i1].z - path[i0].z) * frac;
    const ballX = mapX(bx);
    const ballY = mapY(bz);

    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
    ctx.fill();

    // 旋转箭头
    const spinAngle = phase * Math.PI * 4;
    ctx.strokeStyle = '#4d9fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 14, spinAngle, spinAngle + Math.PI * 1.2);
    ctx.stroke();

    // 力矢量图例
    const lx = pad + 8;
    const ly = ty + th + 28;
    const forces = [
      { label: 'F_contact', color: '#ff4d4d', dx: 50, dy: -20 },
      { label: 'F_spin', color: '#4d9fff', dx: 0, dy: -40 },
      { label: 'F_gravity', color: '#8b95a8', dx: 0, dy: 35 },
    ];
    forces.forEach((f, i) => {
      const ox = lx + i * 90;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, ly);
      ctx.lineTo(ox + f.dx * 0.5, ly + f.dy * 0.5);
      ctx.stroke();
      ctx.fillStyle = f.color;
      ctx.font = '9px monospace';
      ctx.fillText(f.label, ox - 4, ly + 50);
    });

    ctx.fillStyle = '#8b95a8';
    ctx.font = '10px monospace';
    ctx.fillText(`${stroke.spinRpm} rpm · ${stroke.contactSpeed} m/s`, pad, h - 12);
  }, [stroke, phase]);

  return <canvas ref={ref} className="w-full h-full min-h-[280px] rounded-lg" />;
}
