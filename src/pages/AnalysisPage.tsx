import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/** 五大国对比面板数据（来自实时 ITTF 排名聚合） */
interface NationRow {
  code: string;
  name: string;
  zh: string;
  color: string;
  top10: number;
  top20: number;
  top50: number;
  avgRank: number;
  bestRank: number;
  points: number;
}

const NATION_DEFS = [
  { code: 'CHN', name: 'China', zh: '中国', color: '#ff4d4d' },
  { code: 'JPN', name: 'Japan', zh: '日本', color: '#e91e63' },
  { code: 'GER', name: 'Germany', zh: '德国', color: '#f5c542' },
  { code: 'FRA', name: 'France', zh: '法国', color: '#4d9fff' },
  { code: 'SWE', name: 'Sweden', zh: '瑞典', color: '#4caf50' },
] as const;

interface CauseBlock {
  icon: string;
  zh: string;
  en: string;
  color: string;
  points: string[];
}

export function AnalysisPage() {
  const { t } = useI18n();
  const { ittfRankings } = useAppStore();
  const { men = [], women = [] } = ittfRankings ?? {};

  const rows: NationRow[] = NATION_DEFS.map((n) => {
    const pool = [...men, ...women].filter((r) => r.country === n.code);
    return {
      ...n,
      top10: pool.filter((r) => r.rank <= 10).length,
      top20: pool.filter((r) => r.rank <= 20).length,
      top50: pool.filter((r) => r.rank <= 50).length,
      avgRank: pool.length ? Math.round(pool.reduce((s, r) => s + r.rank, 0) / pool.length) : 0,
      bestRank: pool.length ? Math.min(...pool.map((r) => r.rank)) : 0,
      points: pool.length ? pool.reduce((s, r) => s + r.points, 0) : 0,
    };
  });
  const maxTop50 = Math.max(1, ...rows.map((r) => r.top50));

  const causes: CauseBlock[] = [
    {
      icon: '🧒', zh: '青训体系：训练场 vs 赛场', en: 'Youth Pipeline', color: 'text-tt-accent',
      points: [
        '日本"断代育成"：U17 以上年均国际赛 12+ 站（协会包差旅），张本美和 17 岁进世界前三；T 联赛强制 U18 登场 ≥15%',
        '德国"延迟竞争"：16 岁前不急于出成绩，建立失败档案库，年投入约 1200 万欧元于俱乐部社区青训',
        '法国"科技赋能"：里昂中央理工视觉算法量化走位/旋转/前三板，老中青三代梯队接力',
        '中国"70% 训练 vs 30% 比赛"：17 岁前极少打 WTT 成年组；打法同质化 >70%；特殊打法占比仅 6%（日本 17%）',
      ],
    },
    {
      icon: '🏆', zh: '联赛生态：职业化密度之差', en: 'League Ecosystem', color: 'text-tt-gold',
      points: [
        '德甲 TTBL：8 月打到次年 6 月近全年，常规赛+季后赛，外援同场；樊振东加盟后俱乐部观众涨 300%',
        '日本 T 联赛：男 6 女 12 队职业化，强制新人登场，张本兄妹从小对抗成年选手',
        '法国办赛：2024-26 落地 WTT 冠军赛等多项赛事，欧洲办赛最多，蒙彼利埃上座率爆满',
        '乒超赛程被压缩至不足两个月，球员年比赛量不足德甲一半；2026 已启动全华班+U19 强制登场改革',
      ],
    },
    {
      icon: '🎯', zh: '选拔机制：单通道 vs 多渠道', en: 'Selection', color: 'text-tt-accent2',
      points: [
        '日本"积分制+选拔赛"双轨：全日本锦标赛成绩挂钩国家队资格，积分靠前即可上车，零容错倒逼全员打国际赛',
        '中国精兵路线：体校→省队→国家队逐级淘汰，通道陡峭，年轻选手国际赛历练通道相对有限',
        '瑞典曾派少年赴中国取经（瓦尔德内尔 15 岁入中国训练），法国允许俱乐部自由试训与跨项融合',
        '结论：多渠道开放比单一通道更易产出"对手猜不到下一板"的选手',
      ],
    },
    {
      icon: '⚙️', zh: '器材与打法演进', en: 'Equipment & Style', color: 'text-tt-red',
      points: [
        '40mm 大球+塑料球：旋转减弱、回合增多、相持变长，利好力量型打法（欧洲传统），稀释中式快攻优势',
        '反手拧拉（Chiquita）普及成为战略级技术，消除外协反手短板，中外技术差距缩小',
        '外协"非标准打法"崛起：草莓拧、极端侧拧、长胶削球、颗粒怪胶——国内闭门训练遇不到这类旋转',
        '佐证：樊振东赴德甲初期连输（遭遇体系外"陌生旋转"），后明显涨球——开放激发生态创新',
      ],
    },
    {
      icon: '📜', zh: '规则变化：双刃剑向追赶者倾斜', en: 'Rules', color: 'text-tt-green',
      points: [
        '"52 周最佳 8 站"滚动积分制：旧积分到期清零，必须持续参赛抢分',
        '中段轮次积分上调（四强 700→900、八强 350→580），冠军优势被稀释，利好稳定进八强的欧洲中坚',
        '强制参赛/退赛罚则曾导致樊振东、陈梦、马龙三位奥运冠军退出世界排名',
        '混团世界杯 2500 分 + 2028 奥运新增混团项目：积分指挥棒引导各国资源再配置',
      ],
    },
    {
      icon: '🧭', zh: '破局建议（AI 综合研判）', en: 'Breakthrough', color: 'text-tt-green',
      points: [
        '青训双轨化：体系内+体系外双通道，特殊打法占比从 6% 提升至 15%+，保护打法多样性',
        '联赛扩容：延长乒超赛程对标德甲近全年，恢复外援，打通 T 联赛/德甲/法甲跨联赛交流',
        '外战常态化：U19-U23 年均国际赛从 <10 站提升至 20+ 站，改"以赛代练、边赛边改"',
        '科技下沉：AI/VR 从主力层下沉到省队与 15 岁梯队，建立国家级乒乓大数据中心',
        '现行已启动：乒超 U19 强制登场、樊振东赴德甲、AI 战术分析系统、教练组重组——方向正确，需持续深化',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-tt-bg">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-4 gap-3">
        <Link to="/dashboard" className="text-sm text-tt-muted hover:text-tt-text">← {t('dashboard.liveHub')}</Link>
        <span className="font-semibold text-sm">情报分析 · 五强透视</span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-tt-accent">AI-assisted Analysis</span>
        <LanguageSwitcher />
      </header>

      <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4">
        {/* 标题区 */}
        <div className="panel p-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-tt-accent">First-Principles Intelligence</div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold">
            为什么日本、德国、法国、瑞典在上升，而中国在相对下降
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-tt-muted leading-relaxed">
            基于 ITTF 实时世界排名聚合 + 2026 年 8 月多源深度调研（30+ 来源：ITTF 官方、奥林匹克官网、人民日报、新浪体育等）。
            本页"排名分布"为实时数据，"成因与破局"为 AI 综合研判，供讨论参考。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="badge bg-tt-red/10 text-tt-red border-tt-red/30">2026 男单前5仅剩 1 名中国选手</span>
            <span className="badge bg-tt-accent/10 text-tt-accent border-tt-accent/30">张本兄妹横滨同日夺冠 · 国乒男单 0 进八强</span>
            <span className="badge bg-tt-green/10 text-tt-green border-tt-green/30">2026 乒超改革进行时</span>
          </div>
        </div>

        {/* 五强真实排名分布（实时） */}
        <div className="panel p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-tt-muted">实时排名分布 · 五强</h2>
            <span className="text-[10px] font-mono text-tt-green">LIVE ITTF</span>
          </div>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.code} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-[10px] font-mono text-tt-muted">{r.zh}</span>
                <span className="w-2.5 shrink-0 h-2.5 rounded-sm" style={{ background: r.color }} />
                <div className="flex-1 h-4 bg-tt-surface rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(r.top50 / maxTop50) * 100}%`, background: r.color }} />
                </div>
                <span className="w-16 shrink-0 text-right text-[10px] font-mono">
                  top50 <b className="text-tt-text">{r.top50}</b>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {rows.map((r) => (
              <div key={r.code} className="rounded-lg bg-tt-surface/60 border border-tt-border p-2">
                <div className="text-[9px] text-tt-muted font-mono">{r.zh}</div>
                <div className="text-lg font-mono" style={{ color: r.color }}>#{r.bestRank}</div>
                <div className="text-[9px] text-tt-muted">最佳 · 前50 {r.top50} 人</div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-tt-muted mt-2">
            数据来源：ITTF 官方实时 API（男/女单前 100 聚合）。2026-08 世界排名男单前五：王楚钦 / 莫雷加德(瑞) / 松岛辉空(日) / 勒布伦(法) / 张本智和(日)。
          </p>
        </div>

        {/* 五维成因 + 破局 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {causes.map((c) => (
            <div key={c.zh} className="panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{c.icon}</span>
                <span className={`text-sm font-semibold ${c.color}`}>{c.zh}</span>
                <span className="text-[9px] text-tt-muted font-mono ml-auto">{c.en}</span>
              </div>
              <ul className="space-y-1.5">
                {c.points.map((pt) => (
                  <li key={pt} className="text-[11px] text-tt-muted leading-relaxed list-disc list-inside">{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 数据与方法论注记 */}
        <div className="panel p-3">
          <h3 className="text-[10px] uppercase tracking-wider text-tt-muted mb-2">数据与方法论</h3>
          <ul className="text-[10px] text-tt-muted space-y-1 list-disc list-inside">
            <li>排名分布来自 ITTF 官方实时 API（男子+女子前 100）。</li>
            <li>成因分析与破局建议为 AI 基于 2026-08-17 多源深度调研（ITTF 官方新闻、奥林匹克官网、人民日报体谈、新浪体育、中华网、上海社科院海外随笔等 30+ 来源）的综合研判，非官方结论。</li>
            <li>关键事实：瑞典 2026 伦敦世锦赛 3-2 胜中国；横滨冠军赛国乒男单 0 进八强；WTT 52 周滚动积分制；乒超 2026 U19 强制登场改革。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}