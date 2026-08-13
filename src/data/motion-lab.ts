/** 运动力学实验室 — 第一性原理数据模型 */

export type MotionDomain = 'biomech' | 'mechanics' | 'aesthetics';
export type ViewMode = '2d' | '3d';
export type StrokeId =
  | 'forehand-loop'
  | 'backhand-flick'
  | 'pendulum-serve'
  | 'forehand-smash'
  | 'backhand-loop'
  | 'banana-flick'
  | 'chop-defense'
  | 'short-push'
  | 'tomahawk-serve'
  | 'counter-loop';

export type StrokeCategory = 'attack' | 'serve' | 'defense' | 'receive';

export interface StrokeGroup {
  id: StrokeCategory;
  nameZh: string;
  nameEn: string;
  strokes: StrokeId[];
}

export const STROKE_GROUPS: StrokeGroup[] = [
  { id: 'attack', nameZh: '进攻', nameEn: 'Attack', strokes: ['forehand-loop', 'forehand-smash', 'backhand-loop', 'backhand-flick', 'banana-flick', 'counter-loop'] },
  { id: 'serve', nameZh: '发球', nameEn: 'Serve', strokes: ['pendulum-serve', 'tomahawk-serve'] },
  { id: 'defense', nameZh: '防守', nameEn: 'Defense', strokes: ['chop-defense'] },
  { id: 'receive', nameZh: '接发球', nameEn: 'Receive', strokes: ['short-push'] },
];

export interface MotionPrinciple {
  id: string;
  titleZh: string;
  titleEn: string;
  statementZh: string;
  statementEn: string;
}

/** 第一性原理公理 */
export const MOTION_AXIOMS: MotionPrinciple[] = [
  {
    id: 'ground-up',
    titleZh: '动力链传导',
    titleEn: 'Kinetic Chain',
    statementZh: '地面反作用力经踝—膝—髋—肩—肘—腕逐级放大，击球功率源于下肢蹬转而非仅手臂挥拍。',
    statementEn: 'Ground reaction force amplifies through ankle–knee–hip–shoulder–elbow–wrist; power comes from leg drive, not arm swing alone.',
  },
  {
    id: 'magnus',
    titleZh: '马格努斯效应',
    titleEn: 'Magnus Effect',
    statementZh: '球体旋转改变周围气流压力分布，产生弧线轨迹；侧上旋与侧下旋对应不同二跳行为。',
    statementEn: 'Ball spin alters air pressure, producing curved trajectories; topspin and backspin yield different second-bounce behavior.',
  },
  {
    id: 'aesthetic-rhythm',
    titleZh: '运动美学',
    titleEn: 'Movement Aesthetics',
    statementZh: '动作流畅度由关节角速度协调性、重心轨迹连续性与击球点一致性共同决定，可用节律与对称性量化。',
    statementEn: 'Movement elegance is quantified by joint coordination, center-of-mass continuity, and contact-point consistency.',
  },
];

export interface StrokePreset {
  id: StrokeId;
  nameZh: string;
  nameEn: string;
  /** 2D 骨架关键点（归一化 0–1，侧视图） */
  skeleton2d: { x: number; y: number }[];
  /** 关节角（度） */
  jointAngles: { joint: string; jointZh: string; angle: number; optimal: string }[];
  /** 3D 球路采样点 */
  ballPath3d: { x: number; y: number; z: number }[];
  spinRpm: number;
  contactSpeed: number;
  aesthetic: { symmetry: number; rhythm: number; flow: number; golden: number };
}

export const STROKE_PRESETS: StrokePreset[] = [
  {
    id: 'forehand-loop',
    nameZh: '正手弧圈',
    nameEn: 'Forehand Loop',
    skeleton2d: [
      { x: 0.22, y: 0.88 }, { x: 0.28, y: 0.72 }, { x: 0.32, y: 0.55 },
      { x: 0.38, y: 0.42 }, { x: 0.48, y: 0.35 }, { x: 0.62, y: 0.32 },
      { x: 0.78, y: 0.28 }, { x: 0.88, y: 0.25 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 42, optimal: '35–50°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 95, optimal: '85–105°' },
      { joint: 'elbow', jointZh: '肘部', angle: 118, optimal: '100–130°' },
      { joint: 'wrist', jointZh: '腕部', angle: 28, optimal: '20–40°' },
    ],
    ballPath3d: [
      { x: -0.7, y: 0.15, z: 0.9 }, { x: -0.3, y: 0.35, z: 0.6 }, { x: 0, y: 0.5, z: 0.35 },
      { x: 0.35, y: 0.55, z: 0.15 }, { x: 0.7, y: 0.45, z: 0.05 }, { x: 1.0, y: 0.2, z: 0 },
    ],
    spinRpm: 2800,
    contactSpeed: 28.5,
    aesthetic: { symmetry: 0.88, rhythm: 0.92, flow: 0.9, golden: 0.85 },
  },
  {
    id: 'backhand-flick',
    nameZh: '反手拧拉',
    nameEn: 'Backhand Flick',
    skeleton2d: [
      { x: 0.55, y: 0.88 }, { x: 0.52, y: 0.72 }, { x: 0.48, y: 0.55 },
      { x: 0.42, y: 0.42 }, { x: 0.35, y: 0.38 }, { x: 0.28, y: 0.36 },
      { x: 0.18, y: 0.34 }, { x: 0.08, y: 0.32 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 38, optimal: '30–45°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 72, optimal: '65–85°' },
      { joint: 'elbow', jointZh: '肘部', angle: 95, optimal: '85–110°' },
      { joint: 'wrist', jointZh: '腕部', angle: 45, optimal: '35–55°' },
    ],
    ballPath3d: [
      { x: 0.5, y: 0.2, z: 0.85 }, { x: 0.2, y: 0.4, z: 0.5 }, { x: -0.1, y: 0.52, z: 0.2 },
      { x: -0.45, y: 0.48, z: 0.08 }, { x: -0.8, y: 0.35, z: 0.02 },
    ],
    spinRpm: 3200,
    contactSpeed: 24.2,
    aesthetic: { symmetry: 0.82, rhythm: 0.86, flow: 0.84, golden: 0.78 },
  },
  {
    id: 'pendulum-serve',
    nameZh: '顺旋发球',
    nameEn: 'Pendulum Serve',
    skeleton2d: [
      { x: 0.4, y: 0.88 }, { x: 0.42, y: 0.7 }, { x: 0.44, y: 0.52 },
      { x: 0.46, y: 0.4 }, { x: 0.5, y: 0.32 }, { x: 0.58, y: 0.22 },
      { x: 0.68, y: 0.15 }, { x: 0.75, y: 0.12 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 25, optimal: '20–35°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 110, optimal: '95–125°' },
      { joint: 'elbow', jointZh: '肘部', angle: 135, optimal: '120–150°' },
      { joint: 'wrist', jointZh: '腕部', angle: 52, optimal: '40–65°' },
    ],
    ballPath3d: [
      { x: 0.6, y: 0.5, z: 0.3 }, { x: 0.4, y: 0.65, z: 0.55 }, { x: 0.1, y: 0.75, z: 0.8 },
      { x: -0.3, y: 0.7, z: 1.0 }, { x: -0.7, y: 0.55, z: 1.1 }, { x: -1.0, y: 0.3, z: 1.0 },
    ],
    spinRpm: 4500,
    contactSpeed: 18.6,
    aesthetic: { symmetry: 0.9, rhythm: 0.88, flow: 0.93, golden: 0.91 },
  },
  {
    id: 'forehand-smash',
    nameZh: '正手爆冲',
    nameEn: 'Forehand Smash',
    skeleton2d: [
      { x: 0.2, y: 0.88 }, { x: 0.26, y: 0.68 }, { x: 0.32, y: 0.48 },
      { x: 0.4, y: 0.35 }, { x: 0.55, y: 0.28 }, { x: 0.72, y: 0.22 },
      { x: 0.85, y: 0.18 }, { x: 0.92, y: 0.15 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 48, optimal: '40–55°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 105, optimal: '95–115°' },
      { joint: 'elbow', jointZh: '肘部', angle: 130, optimal: '115–145°' },
      { joint: 'wrist', jointZh: '腕部', angle: 35, optimal: '25–45°' },
    ],
    ballPath3d: [
      { x: -0.5, y: 0.3, z: 0.7 }, { x: -0.1, y: 0.55, z: 0.35 }, { x: 0.4, y: 0.6, z: 0.1 },
      { x: 0.85, y: 0.45, z: 0 }, { x: 1.1, y: 0.2, z: 0 },
    ],
    spinRpm: 1800,
    contactSpeed: 35.0,
    aesthetic: { symmetry: 0.85, rhythm: 0.88, flow: 0.87, golden: 0.82 },
  },
  {
    id: 'backhand-loop',
    nameZh: '反手弧圈',
    nameEn: 'Backhand Loop',
    skeleton2d: [
      { x: 0.52, y: 0.88 }, { x: 0.5, y: 0.7 }, { x: 0.46, y: 0.52 },
      { x: 0.4, y: 0.4 }, { x: 0.32, y: 0.35 }, { x: 0.22, y: 0.32 },
      { x: 0.12, y: 0.3 }, { x: 0.02, y: 0.28 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 35, optimal: '28–42°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 78, optimal: '70–90°' },
      { joint: 'elbow', jointZh: '肘部', angle: 105, optimal: '95–120°' },
      { joint: 'wrist', jointZh: '腕部', angle: 32, optimal: '22–42°' },
    ],
    ballPath3d: [
      { x: 0.4, y: 0.25, z: 0.8 }, { x: 0.05, y: 0.45, z: 0.45 }, { x: -0.3, y: 0.52, z: 0.15 },
      { x: -0.65, y: 0.48, z: 0.05 }, { x: -0.95, y: 0.35, z: 0 },
    ],
    spinRpm: 2650,
    contactSpeed: 26.5,
    aesthetic: { symmetry: 0.86, rhythm: 0.9, flow: 0.88, golden: 0.84 },
  },
  {
    id: 'banana-flick',
    nameZh: '香蕉拧拉',
    nameEn: 'Banana Flick',
    skeleton2d: [
      { x: 0.5, y: 0.88 }, { x: 0.48, y: 0.72 }, { x: 0.44, y: 0.55 },
      { x: 0.38, y: 0.45 }, { x: 0.3, y: 0.4 }, { x: 0.2, y: 0.38 },
      { x: 0.1, y: 0.36 }, { x: 0.02, y: 0.34 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 32, optimal: '25–40°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 68, optimal: '60–80°' },
      { joint: 'elbow', jointZh: '肘部', angle: 88, optimal: '75–100°' },
      { joint: 'wrist', jointZh: '腕部', angle: 55, optimal: '45–65°' },
    ],
    ballPath3d: [
      { x: 0.45, y: 0.18, z: 0.75 }, { x: 0.15, y: 0.38, z: 0.4 }, { x: -0.2, y: 0.48, z: 0.12 },
      { x: -0.55, y: 0.42, z: 0.04 },
    ],
    spinRpm: 3600,
    contactSpeed: 23.8,
    aesthetic: { symmetry: 0.8, rhythm: 0.85, flow: 0.83, golden: 0.76 },
  },
  {
    id: 'chop-defense',
    nameZh: '削球防守',
    nameEn: 'Chop Defense',
    skeleton2d: [
      { x: 0.45, y: 0.88 }, { x: 0.44, y: 0.75 }, { x: 0.43, y: 0.62 },
      { x: 0.42, y: 0.5 }, { x: 0.48, y: 0.42 }, { x: 0.58, y: 0.38 },
      { x: 0.7, y: 0.36 }, { x: 0.78, y: 0.35 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 55, optimal: '50–65°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 65, optimal: '55–75°' },
      { joint: 'elbow', jointZh: '肘部', angle: 75, optimal: '65–90°' },
      { joint: 'wrist', jointZh: '腕部', angle: 18, optimal: '10–30°' },
    ],
    ballPath3d: [
      { x: -0.3, y: 0.6, z: 0.5 }, { x: 0.1, y: 0.55, z: 0.7 }, { x: 0.5, y: 0.5, z: 0.9 },
      { x: 0.8, y: 0.45, z: 1.0 }, { x: 1.0, y: 0.35, z: 1.05 },
    ],
    spinRpm: -2000,
    contactSpeed: 12.8,
    aesthetic: { symmetry: 0.78, rhythm: 0.82, flow: 0.8, golden: 0.74 },
  },
  {
    id: 'short-push',
    nameZh: '搓短',
    nameEn: 'Short Push',
    skeleton2d: [
      { x: 0.48, y: 0.88 }, { x: 0.47, y: 0.78 }, { x: 0.46, y: 0.65 },
      { x: 0.45, y: 0.55 }, { x: 0.5, y: 0.48 }, { x: 0.58, y: 0.44 },
      { x: 0.66, y: 0.42 }, { x: 0.72, y: 0.41 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 28, optimal: '20–35°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 55, optimal: '45–65°' },
      { joint: 'elbow', jointZh: '肘部', angle: 85, optimal: '75–95°' },
      { joint: 'wrist', jointZh: '腕部', angle: 22, optimal: '15–35°' },
    ],
    ballPath3d: [
      { x: 0.3, y: 0.15, z: 0.4 }, { x: 0.1, y: 0.12, z: 0.55 }, { x: -0.1, y: 0.1, z: 0.65 },
      { x: -0.35, y: 0.08, z: 0.7 },
    ],
    spinRpm: 600,
    contactSpeed: 4.5,
    aesthetic: { symmetry: 0.92, rhythm: 0.9, flow: 0.94, golden: 0.88 },
  },
  {
    id: 'tomahawk-serve',
    nameZh: '逆旋发球',
    nameEn: 'Tomahawk Serve',
    skeleton2d: [
      { x: 0.38, y: 0.88 }, { x: 0.4, y: 0.72 }, { x: 0.42, y: 0.55 },
      { x: 0.44, y: 0.42 }, { x: 0.52, y: 0.3 }, { x: 0.62, y: 0.2 },
      { x: 0.72, y: 0.14 }, { x: 0.78, y: 0.1 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 30, optimal: '22–38°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 115, optimal: '100–130°' },
      { joint: 'elbow', jointZh: '肘部', angle: 128, optimal: '115–140°' },
      { joint: 'wrist', jointZh: '腕部', angle: 48, optimal: '38–58°' },
    ],
    ballPath3d: [
      { x: 0.55, y: 0.45, z: 0.35 }, { x: 0.35, y: 0.62, z: 0.6 }, { x: 0.05, y: 0.72, z: 0.85 },
      { x: -0.35, y: 0.68, z: 1.0 }, { x: -0.75, y: 0.5, z: 1.05 },
    ],
    spinRpm: 4100,
    contactSpeed: 18.2,
    aesthetic: { symmetry: 0.87, rhythm: 0.86, flow: 0.89, golden: 0.86 },
  },
  {
    id: 'counter-loop',
    nameZh: '对拉弧圈',
    nameEn: 'Counter Loop',
    skeleton2d: [
      { x: 0.25, y: 0.88 }, { x: 0.3, y: 0.7 }, { x: 0.35, y: 0.52 },
      { x: 0.42, y: 0.38 }, { x: 0.55, y: 0.32 }, { x: 0.7, y: 0.28 },
      { x: 0.82, y: 0.25 }, { x: 0.9, y: 0.22 },
    ],
    jointAngles: [
      { joint: 'hip', jointZh: '髋部', angle: 44, optimal: '38–52°' },
      { joint: 'shoulder', jointZh: '肩部', angle: 92, optimal: '82–102°' },
      { joint: 'elbow', jointZh: '肘部', angle: 115, optimal: '100–128°' },
      { joint: 'wrist', jointZh: '腕部', angle: 30, optimal: '22–40°' },
    ],
    ballPath3d: [
      { x: -0.8, y: 0.2, z: 0.85 }, { x: -0.4, y: 0.4, z: 0.5 }, { x: 0, y: 0.5, z: 0.2 },
      { x: 0.5, y: 0.48, z: 0.05 }, { x: 0.9, y: 0.35, z: 0 }, { x: -0.9, y: 0.38, z: 0.08 },
    ],
    spinRpm: 2800,
    contactSpeed: 28.0,
    aesthetic: { symmetry: 0.91, rhythm: 0.94, flow: 0.95, golden: 0.9 },
  },
];

export function getStrokePreset(id: StrokeId): StrokePreset {
  return STROKE_PRESETS.find((s) => s.id === id) ?? STROKE_PRESETS[0];
}
