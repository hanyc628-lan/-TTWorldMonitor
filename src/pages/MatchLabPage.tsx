import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOP_MEN, TOP_WOMEN } from '@/data/seed';
import {
  DOMESTIC_ELITE,
  LEGENDS,
  buildActiveFromIttf,
  type SimPlayer,
  type SimTier,
} from '@/data/sim-roster';
import { estimateWinRate, simulateMatch, type BestOf, type MatchSimResult } from '@/services/match-sim';
import { useAppStore } from '@/store/app';

type PoolFilter = 'all' | SimTier;

export function MatchLabPage() {
  const ittf = useAppStore((s) => s.ittfRankings);

  const activePool: SimPlayer[] = useMemo(() => {
    if (ittf?.men?.length || ittf?.women?.length) {
      return buildActiveFromIttf(ittf.men ?? [], ittf.women ?? []);
    }
    // 无 API 时用种子前排兜底
    return buildActiveFromIttf(
      TOP_MEN.map((p) => ({ name: p.name, country: p.country, rank: p.rank, points: p.points })),
      TOP_WOMEN.map((p) => ({ name: p.name, country: p.country, rank: p.rank, points: p.points })),
    );
  }, [ittf]);

  const fullPool = useMemo(
    () => [...activePool, ...DOMESTIC_ELITE, ...LEGENDS],
    [activePool],
  );

  const [filter, setFilter] = useState<PoolFilter>('all');
  const [gender, setGender] = useState<'M' | 'W' | 'all'>('all');
  const pool = useMemo(() => {
    let list = fullPool;
    if (filter !== 'all') list = list.filter((p) => p.tier === filter);
    if (gender !== 'all') list = list.filter((p) => p.gender === gender);
    return list;
  }, [fullPool, filter, gender]);

  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [bestOf, setBestOf] = useState<BestOf>(5);
  const [result, setResult] = useState<MatchSimResult | null>(null);
  const [batch, setBatch] = useState<{
    winRateA: number;
    prior: number;
    eloA: number;
    eloB: number;
  } | null>(null);

  // 默认选中：现役第一 vs 国内精英樊振东
  const playerA =
    pool.find((p) => p.id === idA) ??
    pool.find((p) => p.tier === 'active' && p.gender === 'M') ??
    pool[0];
  const playerB =
    pool.find((p) => p.id === idB) ??
    pool.find((p) => p.id === 'dom-fzd') ??
    pool.find((p) => p.id !== playerA?.id) ??
    pool[1];

  function runOnce() {
    if (!playerA || !playerB || playerA.id === playerB.id) return;
    setResult(simulateMatch(playerA, playerB, bestOf));
    setBatch(null);
  }

  function runBatch() {
    if (!playerA || !playerB || playerA.id === playerB.id) return;
    setBatch(estimateWinRate(playerA, playerB, bestOf, 800));
    setResult(null);
  }

  const tierLabel = (t: SimTier) =>
    t === 'active' ? 'ITTF现役' : t === 'domestic' ? '国内/未上榜' : '历史名将';

  return (
    <div className="min-h-screen bg-tt-bg text-tt-text">
      <header className="h-12 border-b border-tt-border bg-tt-surface flex items-center px-3 gap-3">
        <Link to="/" className="text-sm text-tt-accent font-semibold">
          ← TTWorldMonitor
        </Link>
        <span className="text-sm font-semibold">对战模拟实验室</span>
        <span className="text-[10px] text-tt-muted font-mono ml-auto">
          Elo · topspin-lab · 现役+名将
        </span>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <section className="panel p-4">
          <h1 className="text-lg font-semibold mb-1">球员间模拟比赛</h1>
          <p className="text-[12px] text-tt-muted leading-relaxed mb-2">
            <strong className="text-tt-text">不二选一</strong>：ITTF 实时前 100 提供
            <em>现役名册与积分</em>；
            <a
              href="https://github.com/Roni-quant/topspin-lab"
              target="_blank"
              rel="noreferrer"
              className="text-tt-accent underline"
            >
              topspin-lab
            </a>{' '}
            提供 <em>Elo 期望分引擎</em>。二者是「数据 × 模型」组合。
            另含未上榜现役高手与历史巅峰名将（跨时代为折算推演，非史实对阵）。
          </p>
          <p className="text-[11px] text-tt-muted mb-3">
            当前名册：ITTF 现役 {activePool.length} 人 · 国内/未上榜 {DOMESTIC_ELITE.length} ·
            历史名将 {LEGENDS.length}
            {ittf?.source ? ` · 排名源 ${ittf.source}` : ' · 种子兜底'}
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            {(
              [
                ['all', '全部'],
                ['active', 'ITTF现役'],
                ['domestic', '国内/未上榜'],
                ['legend', '历史名将'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`text-xs px-2 py-1 rounded border ${
                  filter === k
                    ? 'bg-tt-accent/20 text-tt-accent border-tt-accent/40'
                    : 'border-tt-border text-tt-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['all', 'M', 'W'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`text-xs px-2 py-1 rounded border ${
                  gender === g
                    ? 'bg-tt-accent/20 text-tt-accent border-tt-accent/40'
                    : 'border-tt-border text-tt-muted'
                }`}
              >
                {g === 'all' ? '男女' : g === 'M' ? '男子' : '女子'}
              </button>
            ))}
            <span className="text-xs text-tt-muted self-center ml-2">赛制</span>
            {([5, 7] as BestOf[]).map((bo) => (
              <button
                key={bo}
                type="button"
                onClick={() => setBestOf(bo)}
                className={`text-xs px-2 py-1 rounded border ${
                  bestOf === bo
                    ? 'bg-tt-accent/20 text-tt-accent border-tt-accent/40'
                    : 'border-tt-border text-tt-muted'
                }`}
              >
                BO{bo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <PlayerSelect
              label="选手 A"
              value={playerA?.id ?? ''}
              pool={pool}
              onChange={setIdA}
              tierLabel={tierLabel}
            />
            <PlayerSelect
              label="选手 B"
              value={playerB?.id ?? ''}
              pool={pool}
              onChange={setIdB}
              tierLabel={tierLabel}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={runOnce} className="btn-primary text-sm px-4 py-2 min-h-0">
              模拟一场
            </button>
            <button
              type="button"
              onClick={runBatch}
              className="btn-ghost text-sm px-4 py-2 border border-tt-border min-h-0"
            >
              800 场胜率估计
            </button>
          </div>
        </section>

        {batch && playerA && playerB && (
          <section className="panel p-4">
            <h2 className="text-sm font-semibold mb-2">胜率估计（800 次模拟）</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-tt-muted text-[11px]">
                  {playerA.nameZh ?? playerA.name}
                  <span className="ml-1 text-[9px] opacity-70">{tierLabel(playerA.tier)}</span>
                </div>
                <div className="text-2xl font-mono text-tt-accent">
                  {(batch.winRateA * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-tt-muted">Elo ≈ {batch.eloA}</div>
              </div>
              <div>
                <div className="text-tt-muted text-[11px]">
                  {playerB.nameZh ?? playerB.name}
                  <span className="ml-1 text-[9px] opacity-70">{tierLabel(playerB.tier)}</span>
                </div>
                <div className="text-2xl font-mono">{((1 - batch.winRateA) * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-tt-muted">Elo ≈ {batch.eloB}</div>
              </div>
            </div>
            <p className="text-[11px] text-tt-muted mt-2">
              Elo 先验 P(A 胜) = {(batch.prior * 100).toFixed(1)}%（topspin-lab expected_score）
            </p>
            <div className="mt-2 h-2 rounded-full bg-tt-surface overflow-hidden flex">
              <div className="h-full bg-tt-accent" style={{ width: `${batch.winRateA * 100}%` }} />
              <div className="h-full bg-tt-muted/40" style={{ width: `${(1 - batch.winRateA) * 100}%` }} />
            </div>
          </section>
        )}

        {result && (
          <section className="panel p-4">
            <h2 className="text-sm font-semibold mb-2">单场模拟结果</h2>
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <div className="font-semibold">{result.playerA.name}</div>
                <div className="text-[10px] text-tt-muted">Elo {result.eloA}</div>
              </div>
              <div className="text-2xl font-mono px-3">
                {result.gamesWonA} : {result.gamesWonB}
              </div>
              <div className="text-center flex-1">
                <div className="font-semibold">{result.playerB.name}</div>
                <div className="text-[10px] text-tt-muted">Elo {result.eloB}</div>
              </div>
            </div>
            <div className="text-center text-sm mb-3">
              胜者：{' '}
              <span className="text-tt-accent font-semibold">
                {result.winner === 'A' ? result.playerA.name : result.playerB.name}
              </span>
            </div>
            <ul className="space-y-1">
              {result.games.map((g, i) => (
                <li
                  key={i}
                  className="flex justify-between text-xs font-mono px-2 py-1 rounded bg-tt-surface/50"
                >
                  <span>第 {i + 1} 局</span>
                  <span>
                    {g.scoreA} - {g.scoreB}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-tt-muted mt-2">{result.note}</p>
          </section>
        )}
      </main>
    </div>
  );
}

function PlayerSelect({
  label,
  value,
  pool,
  onChange,
  tierLabel,
}: {
  label: string;
  value: string;
  pool: SimPlayer[];
  onChange: (id: string) => void;
  tierLabel: (t: SimTier) => string;
}) {
  return (
    <label className="block text-xs">
      <span className="text-tt-muted">{label}</span>
      <select
        className="mt-1 w-full bg-tt-surface border border-tt-border rounded px-2 py-2 text-sm text-tt-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {pool.map((p) => (
          <option key={p.id} value={p.id}>
            [{tierLabel(p.tier)}] {p.nameZh ? `${p.nameZh} · ` : ''}
            {p.name}
            {p.era ? ` · ${p.era}` : ''}
            {p.rank > 0 ? ` · #${p.rank}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
