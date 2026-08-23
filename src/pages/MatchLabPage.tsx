import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOP_MEN, TOP_WOMEN } from '@/data/seed';
import {
  DOMESTIC_ELITE,
  LEGENDS,
  FEATURED_ITTF_PLAYERS,
  buildActiveFromIttf,
  mergeSimRoster,
  simPlayerFromSearch,
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
    return buildActiveFromIttf(
      TOP_MEN.map((p) => ({ name: p.name, country: p.country, rank: p.rank, points: p.points })),
      TOP_WOMEN.map((p) => ({ name: p.name, country: p.country, rank: p.rank, points: p.points })),
    );
  }, [ittf]);

  const [searchHits, setSearchHits] = useState<SimPlayer[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fullPool = useMemo(
    () => mergeSimRoster([...activePool, ...searchHits]),
    [activePool, searchHits],
  );

  const [filter, setFilter] = useState<PoolFilter>('all');
  const [gender, setGender] = useState<'M' | 'W' | 'all'>('all');
  const pool = useMemo(() => {
    let list = fullPool;
    if (filter !== 'all') list = list.filter((p) => p.tier === filter);
    if (gender !== 'all') list = list.filter((p) => p.gender === gender);
    return list;
  }, [fullPool, filter, gender]);

  const [idA, setIdA] = useState('ittf-115612');
  const [idB, setIdB] = useState('');
  const [bestOf, setBestOf] = useState<BestOf>(5);
  const [result, setResult] = useState<MatchSimResult | null>(null);
  const [batch, setBatch] = useState<{
    winRateA: number;
    prior: number;
    eloA: number;
    eloB: number;
  } | null>(null);

  const playerA =
    pool.find((p) => p.id === idA) ??
    fullPool.find((p) => p.id === 'ittf-115612') ??
    pool[0];
  const playerB =
    pool.find((p) => p.id === idB) ??
    pool.find((p) => p.tier === 'active' && p.gender === 'M') ??
    pool.find((p) => p.id !== playerA?.id) ??
    pool[1];

  async function runSearch() {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const resp = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      if (!resp.ok) throw new Error('search failed');
      const data = (await resp.json()) as { results: Array<{ ittfId: string; name: string }> };
      const hits = (data.results ?? []).map((r) => simPlayerFromSearch(r));
      // 本地兜底：HAN YIchen
      if (/han|韩|yichen|宜宸|小韩|115612/i.test(q)) {
        for (const f of FEATURED_ITTF_PLAYERS) {
          if (!hits.some((h) => h.name.toUpperCase() === f.name.toUpperCase())) hits.unshift(f);
        }
      }
      setSearchHits((prev) => {
        const map = new Map<string, SimPlayer>();
        for (const p of [...prev, ...hits]) map.set(p.name.toUpperCase(), p);
        return [...map.values()];
      });
      if (hits[0]) setIdA(hits[0].id);
    } catch {
      if (/han|韩|yichen|宜宸|小韩|115612/i.test(q)) {
        setSearchHits(FEATURED_ITTF_PLAYERS);
        setIdA('ittf-115612');
      }
    } finally {
      setSearching(false);
    }
  }

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
    t === 'active' ? 'ITTF' : t === 'domestic' ? '国内/未上榜' : '历史名将';

  return (
    <div className="min-h-screen bg-tt-bg text-tt-text">
      <header className="h-12 border-b border-tt-border bg-tt-surface flex items-center px-3 gap-3">
        <Link to="/" className="text-sm text-tt-accent font-semibold">
          ← TTWorldMonitor
        </Link>
        <span className="text-sm font-semibold">对战模拟实验室</span>
        <span className="text-[10px] text-tt-muted font-mono ml-auto">
          ITTF 前200 + 全库检索 · topspin-lab Elo
        </span>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <section className="panel p-4">
          <h1 className="text-lg font-semibold mb-1">球员间模拟比赛</h1>
          <p className="text-[12px] text-tt-muted leading-relaxed mb-2">
            名册：ITTF 男女各前 200（bootstrap）+ ITTF 姓名检索任意收录选手 + 国内未上榜高手 +
            历史名将。已包含 ITTF 收录女运动员 <strong className="text-tt-text">HAN YIchen（韩宜宸 / 小韩老师，ITTF #115612）</strong>。
            引擎：topspin-lab Elo 期望分。
          </p>
          <p className="text-[11px] text-tt-muted mb-3">
            当前池 {fullPool.length} 人（现役榜 {activePool.length} · 检索缓存 {searchHits.length} ·
            精选 {FEATURED_ITTF_PLAYERS.length} · 国内 {DOMESTIC_ELITE.length} · 名将 {LEGENDS.length}）
            {ittf?.source ? ` · 源 ${ittf.source}` : ''}
          </p>

          {/* ITTF 全库姓名搜索 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void runSearch()}
              placeholder="搜索 ITTF 选手，如 HAN YIchen / 115612 / 王楚钦"
              className="flex-1 min-w-[12rem] bg-tt-surface border border-tt-border rounded px-2 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              className="btn-ghost text-xs px-3 py-2 border border-tt-border min-h-0"
              disabled={searching}
            >
              {searching ? '检索中…' : 'ITTF 检索'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {(
              [
                ['all', '全部'],
                ['active', 'ITTF'],
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
                <div className="text-tt-muted text-[11px]">{playerA.nameZh ?? playerA.name}</div>
                <div className="text-2xl font-mono text-tt-accent">
                  {(batch.winRateA * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-tt-muted">Elo ≈ {batch.eloA}</div>
              </div>
              <div>
                <div className="text-tt-muted text-[11px]">{playerB.nameZh ?? playerB.name}</div>
                <div className="text-2xl font-mono">{((1 - batch.winRateA) * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-tt-muted">Elo ≈ {batch.eloB}</div>
              </div>
            </div>
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
