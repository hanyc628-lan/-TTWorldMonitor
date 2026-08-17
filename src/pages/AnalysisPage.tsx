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

export function AnalysisPage() {
  const { t } = useI18n();
  const { ittfRankings } = useAppStore();
  const { men = [], women = [] } = ittfRankings ?? {};

  // 聚合五大国（CHN/JPN/GER/FRA/SWE）真实排名分布
  const nationDefs = [
    { code: 'CHN', name: 'China', zh: '中国', color: '#ff4d4d' },
    { code: 'JPN', name: 'Japan', zh: '日本', color: '#e91e63' },
    { code: 'GER', name: 'Germany', zh: '德国', color: '#f5c542' },
    { code: 'FRA', name: 'France', zh: '法国', color: '#4d9fff' },
    { code: 'SWE', name: 'Sweden', zh: '瑞典', color: '#4caf50' },
  ] as const;

  const rows: NationRow[] = nationDefs.map((n) => {
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
            基于 ITTF 实时世界排名聚合，结合青训体系、联赛生态、选拔机制、器材与打法演进、国际乒联规则变化五个维度的多源调研，
            给出中国乒乓的破局思路。本页数据部分实时、分析部分为 AI 综合研判，供讨论参考。
          </p>
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
                  <div
                    className="h-full rounded"
                    style={{ width: `${(r.top50 / maxTop50) * 100}%`, background: r.color }}
                  />
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
                <div className="text-[9px] text-tt-muted">最佳 · 前50共 {r.top50}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 五维成因分析 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: '🏛️', zh: '青训体系', en: 'Youth Pipeline', color: 'text-tt-accent', body: '日本依托 T 联赛＋学校体系培养张本兄妹等一批 00 后；瑞典莫雷加德、法国勒布伦兄弟经由本国联赛+欧洲杯赛持续打磨；德甲 TTBL 俱乐部青训与成年队衔接紧密。中国青训集中省队，基层参与与流动相对收窄。' },
            { icon: '🏆', zh: '联赛生态', en: 'League Ecosystem', color: 'text-tt-gold', body: 'T 联赛、德甲 TTBL、法国 Pro A 均高度职业化，外援与国际选手同场锻炼。乒超虽球星云集但赛程短、商业开发与稳定运营存在差距，外战机会相对集中于国家队。' },
            { icon: '🎯', zh: '选拔机制', en: 'Selection', color: 'text-tt-accent2', body: '欧洲/日本选手从小长期参加国际青年赛，积分与大赛经验同步累积；中国国手选拔高度集中，人才梯队竞争陡峭，年轻选手国际赛历练通道相对有限。' },
            { icon: '⚙️', zh: '器材与打法', en: 'Equipment & Style', color: 'text-tt-red', body: '德日法器材与打法更快融合新技术（如反手拧拉、远台对拉体系化）；中国主教练体系对器材规则变化适应较慢，胶皮覆盖物等新规压力更大。' },
            { icon: '📜', zh: '规则变化', en: 'Rules', color: 'text-tt-green', body: '国际乒联近年推行新球、发球不遮挡、积分改革、缩短局分等变化，客观上稀释了中国长期积累的体系优势，为新势力留出重新起跑的空间。' },
            { icon: '🧭', zh: '破局建议', en: 'Breakthrough', color: 'text-tt-green', body: '· 青训双轨化：体系内省队+体系外俱乐部双通道；· 联赛扩容：延长乒超赛季、放开外援身份限制；· 外战练兵：更多选手常驻 WTT/欧洲赛事；· 技术前瞻：主动适应器材/规则迭代。' },
          ].map((c) => (
            <div key={c.zh} className="panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{c.icon}</span>
                <span className={`text-sm font-semibold ${c.color}`}>{c.zh}</span>
                <span className="text-[9px] text-tt-muted font-mono ml-auto">{c.en}</span>
              </div>
              <p className="text-xs text-tt-muted leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* 数据/方法论注记 */}
        <div className="panel p-3">
          <h3 className="text-[10px] uppercase tracking-wider text-tt-muted mb-2">数据与方法论</h3>
          <ul className="text-[10px] text-tt-muted space-y-1 list-disc list-inside">
            <li>排名分布来自 ITTF 官方实时 API（男子+女子前 100）。</li>
            <li>成因分析与破局建议为 AI 基于多源公开资料的综合研判，非官方结论。</li>
            <li>详细深度调研报告持续更新中。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}