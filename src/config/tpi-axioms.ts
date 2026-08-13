import type { TPIComponents } from '@/types';

/** 第一性原理：国家乒乓实力的五个不可约维度 */
export const TPI_FIRST_PRINCIPLES = [
  {
    id: 'axiom-competition',
    principle: '竞技本质',
    statement: '国家实力首先体现在能否持续产出世界一流选手——排名与大赛成绩是硬约束。',
  },
  {
    id: 'axiom-sustainability',
    principle: '可持续人才',
    statement: '顶尖成绩若缺乏梯队厚度，则不可持续；青少年储备决定未来十年的上限。',
  },
  {
    id: 'axiom-ecosystem',
    principle: '竞赛生态',
    statement: '职业联赛、WTT/ITTF 赛事承办与本土俱乐部密度，构成选手成长的「重力场」。',
  },
  {
    id: 'axiom-participation',
    principle: '参与基础',
    statement: '草根参与人口与俱乐部网络是选材池的物理上限，决定长尾国家的上升空间。',
  },
  {
    id: 'axiom-momentum',
    principle: '体系动能',
    statement: '双打深度、舆论热度与近期趋势反映体系是否处于正反馈循环。',
  },
] as const;

export type TPIPillarKey = keyof TPIComponents;

export interface TPIPillarMeta {
  key: TPIPillarKey;
  labelZh: string;
  labelEn: string;
  weight: number;
  axiom: string;
  measures: string;
}

/** TPI v2 支柱定义与权重（总和 = 1.0） */
export const TPI_PILLARS: TPIPillarMeta[] = [
  {
    key: 'eliteOutput',
    labelZh: '顶尖产出',
    labelEn: 'Elite Output',
    weight: 0.3,
    axiom: '竞技本质',
    measures: 'ITTF 排名积分密度、Top100 选手占比、大赛奖牌转化率',
  },
  {
    key: 'pipelineDepth',
    labelZh: '梯队厚度',
    labelEn: 'Pipeline Depth',
    weight: 0.25,
    axiom: '可持续人才',
    measures: 'U15/U18/U21 排名、青训赛事成绩、年龄结构健康度',
  },
  {
    key: 'eventGravity',
    labelZh: '赛事引力',
    labelEn: 'Event Gravity',
    weight: 0.15,
    axiom: '竞赛生态',
    measures: 'WTT/ITTF 承办频次、本土职业联赛等级、国际转会吸引力',
  },
  {
    key: 'massBase',
    labelZh: '参与基础',
    labelEn: 'Mass Base',
    weight: 0.15,
    axiom: '参与基础',
    measures: '活跃人口、注册俱乐部数、业余联赛渗透率',
  },
  {
    key: 'systemMomentum',
    labelZh: '体系动能',
    labelEn: 'System Momentum',
    weight: 0.15,
    axiom: '体系动能',
    measures: '双打世界排名、媒体热度、近 90 天积分动量',
  },
];

export const TPI_PILLAR_WEIGHTS = Object.fromEntries(
  TPI_PILLARS.map((p) => [p.key, p.weight]),
) as Record<TPIPillarKey, number>;

export type HeatmapMetric = 'composite' | TPIPillarKey;

export const HEATMAP_METRICS: HeatmapMetric[] = [
  'composite',
  ...TPI_PILLARS.map((p) => p.key),
];
