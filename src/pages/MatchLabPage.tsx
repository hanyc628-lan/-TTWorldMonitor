import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOP_MEN, TOP_WOMEN } from '@/data/seed';
import { estimateWinRate, simulateMatch, type BestOf, type MatchSimResult } from '@/services/match-sim';
import type { Player } from '@/types';
import { useT } from '@/i18n';

const ALL = [...TOP_MEN, ...TOP_WOMEN];

export function MatchLabPage() {
  const t = useT();
  const [gender, setGender] = useState<'M' | 'W' | 'all'>('M');
  const pool = useMemo(
    () => (gender === 'all' ? ALL : ALL.filter((p) => p.gender === gender)),
    [gender],
  );
  const [idA, setIdA] = useState(TOP_MEN[0]?.id ?? '');
  const [idB, setIdB] = useState(TOP_MEN[1]?.id ?? '');
  const [bestOf, setBestOf] = useState<BestOf>(5);
  const [result, setResult] = useState<MatchSimResult | null>(null);
  const [batch, setBatch] = useState<{ winRateA: number; prior: number; eloA: number; eloB: number } | null>(null);

  const playerA = pool.find((p) => p.id === idA) ?? pool[0];
  const playerB = pool.find((p) => p.id === idB) ?? pool[1];

  function runOnce() {
    if (!playerA || !playerB || playerA.id === playerB.id) return;
    setResult(simulateMatch(playerA, playerB, bestOf));
    setBatch(null);
  }

  function runBatch() {
    if (!playerA || !playerB || playerA.id === playerB.id) return;
    const r = estimateWinRate(playerA, playerB, bestOf, 800);
    setBatch(r);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-tt-bg text-tt-text">
      <header className="h-12 border-b border-tt-border bg-tt-surface flex items-center px-3 gap-3">
        <Link to="/" className="text-sm text-tt-accent font-semibold">
          ← TTWorldMonitor
        </Link>
        <span className="text-sm font-semibold">对战模拟实验室</span>
        <span className="text-[10px] text-tt-muted font-mono ml-auto">
          Elo · topspin-lab
        </span>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <section className="panel p-4">
          <h1 className="text-lg font-semibold mb-1">球员间模拟比赛</h1>
          <p className="text-[12px] text-tt-muted leading-relaxed mb-3">
            基于{' '}
            <a
              href="https://github.com/Roni-quant/topspin-lab"
              target="_blank"
              rel="noreferrer"
              className="text-tt-accent underline"
            >
              topspin-lab
            </a>{' '}
            的 Elo 期望分公式，结合 ITTF 积分/排名映射与局分 Monte Carlo，模拟单打对决。
            结果仅供分析娱乐，非官方赛果。
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {(['M', 'W', 'all'] as const).map((g) => (
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
                {g === 'M' ? '男子' : g === 'W' ? '女子' : '全部'}
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
            <PlayerSelect label="选手 A" value={idA} pool={pool} onChange={setIdA} />
            <PlayerSelect label="选手 B" value={idB} pool={pool} onChange={setIdB} />
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
                <div className="text-tt-muted text-[11px]">{playerA.name}</div>
                <div className="text-2xl font-mono text-tt-accent">{(batch.winRateA * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-tt-muted">Elo ≈ {batch.eloA}</div>
              </div>
              <div>
                <div className="text-tt-muted text-[11px]">{playerB.name}</div>
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
                <div className="text-[10px] text-tt-muted">
                  #{result.playerA.rank} · {result.playerA.points} pts · Elo {result.eloA}
                </div>
              </div>
              <div className="text-2xl font-mono px-3">
                {result.gamesWonA} : {result.gamesWonB}
              </div>
              <div className="text-center flex-1">
                <div className="font-semibold">{result.playerB.name}</div>
                <div className="text-[10px] text-tt-muted">
                  #{result.playerB.rank} · {result.playerB.points} pts · Elo {result.eloB}
                </div>
              </div>
            </div>
            <div className="text-center text-sm mb-3">
              胜者：{' '}
              <span className="text-tt-accent font-semibold">
                {result.winner === 'A' ? result.playerA.name : result.playerB.name}
              </span>
              <span className="text-[10px] text-tt-muted ml-2">
                先验 {(result.priorWinProbA * 100).toFixed(0)}%
              </span>
            </div>
            <ul className="space-y-1">
              {result.games.map((g, i) => (
                <li key={i} className="flex justify-between text-xs font-mono px-2 py-1 rounded bg-tt-surface/50">
                  <span>第 {i + 1} 局</span>
                  <span>
                    {g.scoreA} - {g.scoreB}
                  </span>
                  <span className={g.winner === 'A' ? 'text-tt-accent' : 'text-tt-muted'}>
                    {g.winner === 'A' ? result.playerA.name.split(' ').pop() : result.playerB.name.split(' ').pop()}
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
}: {
  label: string;
  value: string;
  pool: Player[];
  onChange: (id: string) => void;
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
            #{p.rank} {p.name} ({p.country}) · {p.points}
          </option>
        ))}
      </select>
    </label>
  );
}
