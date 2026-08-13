import type { EvolutionAxiom } from '@/types';

/**
 * 第一性原理公理库 — AI 自我进化的逻辑起点
 * 不依赖经验规则，从不可否定的基础事实推导
 */
export const CORE_AXIOMS: EvolutionAxiom[] = [
  {
    id: 'causality-match-ranking',
    principle: '因果律：赛果先于排名',
    description: '比赛结果是对排名变动的必要前因。排名变化若无对应赛果支撑，则为噪声信号。',
    weight: 1.0,
  },
  {
    id: 'conservation-skill',
    principle: '技能守恒：技术不会凭空产生',
    description: '球员技术提升必然伴随训练/教学输入。教学直播热度上升预示技术趋势变化。',
    weight: 0.9,
  },
  {
    id: 'momentum-decay',
    principle: '势头衰减：连胜不可持续',
    description: '竞技势头遵循衰减规律。连胜场次越多，下一场爆冷概率按指数上升。',
    weight: 0.85,
  },
  {
    id: 'information-asymmetry',
    principle: '信息不对称：直播先于新闻',
    description: '直播信号包含新闻尚未报道的信息。教学直播中的技术讨论领先媒体 12-48 小时。',
    weight: 0.95,
  },
  {
    id: 'geographic-clustering',
    principle: '地理聚类：强国效应',
    description: '乒乓球强国在地理上聚类（东亚、欧洲），区域赛事密度与 TPI 正相关。',
    weight: 0.8,
  },
  {
    id: 'teaching-match-bridge',
    principle: '教学-竞技桥接',
    description: '小韩老师等教学直播中的技术热点，3-7 天后会出现在职业赛场技术统计中。',
    weight: 0.88,
  },
  {
    id: 'biomech-efficiency',
    principle: '生物力学效率',
    description: '动力链传导完整性决定击球功率输出。关节角偏离最优区间时，相同挥拍速度产生更低球速。',
    weight: 0.82,
  },
  {
    id: 'tpi-first-principles',
    principle: 'TPI 第一性原理',
    description: '国家实力由顶尖产出、梯队厚度、赛事引力、参与基础、体系动能五维不可约组合，热力图指标应与此对齐。',
    weight: 0.9,
  },
  {
    id: 'league-signal-bridge',
    principle: '联赛-国家队桥接',
    description: '俱乐部联赛胜率趋势与国家队大赛表现存在 1-2 赛季滞后相关，是选材与状态的前瞻信号。',
    weight: 0.78,
  },
];
