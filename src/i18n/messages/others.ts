import type { Messages } from './zh';
import { en } from './en';

/** 以英文为底稿生成其他语言（可逐步完善翻译） */
function fromEn(partial: DeepPartial<Messages>): Messages {
  return deepMerge(structuredClone(en), partial) as Messages;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const pv = patch[key];
    const bv = base[key];
    if (pv && typeof pv === 'object' && bv && typeof bv === 'object' && !Array.isArray(pv)) {
      deepMerge(bv as object, pv as DeepPartial<object>);
    } else if (pv !== undefined) {
      (base as Record<string, unknown>)[key as string] = pv as unknown;
    }
  }
  return base;
}

export const ja: Messages = fromEn({
  lang: { label: '言語' },
  common: { offline: 'オフライン', loading: '読み込み中...', upcoming: '予定', finished: '終了', sample: 'サンプル', realtime: 'リアルタイム' },
  landing: {
    nav: { signals: 'シグナル', tpi: 'TPI指数', correlation: '相関', dashboard: 'ダッシュボード' },
    hero: {
      tagline: '卓球インテリジェンス · ライブ',
      title1: 'ニュースになる前に、',
      title2: 'もう知っている。',
      launch: 'ダッシュボードを開く',
      liveHub: 'ライブハブ',
      free: '無料 · 登録不要',
    },
    stats: { layers: 'マップレイヤー', sources: '情報源', tpiNations: '国別TPI', alerts: 'アラート源' },
  },
  dashboard: { loading: 'データ読み込み中...', liveHub: 'ライブハブ', command: 'コマンド', quickMetrics: 'クイック指標' },
  category: {
    back: '戻る', focus: '焦点', topLeague: 'トップリーグ', region: '地域', clubs: 'クラブ', fixtures: '試合',
    keyFocus: '注目ポイント', corePlayers: '中心選手', clubPerformance: 'クラブ戦績',
    kpis: { rankingHeat: 'ランキング熱', rankingHeatDetail: '主力が上位に定着', scheduleDensity: '試合密度', scheduleDensityDetail: '今季の強度は安定', clubStrength: 'クラブ強度', clubStrengthDetail: '主力選手の集中度が高い', high: '高', strong: '強' },
    wtt: { label: 'WTT', subtitle: '世界ツアーと選手権シリーズ', summary: '世界大会の動き、主要大会日程、ポイント勾配、重要結果の分布。', tags: '日程|ポイント|ツアー|上昇' },
    ittf: { label: 'ITTF', subtitle: '国際卓球連盟と世界ランキング', summary: '世界ランキング、世界選手権の窓口、選手の勢いを一目で見る。', tags: 'ランキング|世界大会|選手|国際' },
    china: { label: '中国', subtitle: '中国スーパーリーグと国別育成', summary: '中国国内リーグ、代表育成、主力選手の総合強度を確認。', tags: 'スーパーリーグ|育成|主力|全国' },
    japan: { label: '日本', subtitle: 'Tリーグとエリート選手', summary: '日本リーグ、エリート選手の効率、若手成長、ネットプレッサー。', tags: 'Tリーグ|張本|若手|位置取り' },
    germany: { label: 'ドイツ', subtitle: 'TTBLとクラブ戦線', summary: 'ドイツリーグの高強度リズム、クラブ成績、重要選手のパフォーマンス。', tags: 'TTBL|ブンデス|クラブ|高圧' },
    clubs: { label: 'クラブ', subtitle: '世界クラブの戦績', summary: '主要クラブの選手構成、日程リズム、競争強度を把握。', tags: 'クラブ|戦績|名選手|同時期' },
  },
  liveHub: { title: 'ライブハブ', allStreams: 'すべての配信', back: '← ダッシュボード' },
  search: { placeholder: 'コマンド、国、レイヤーを検索...', noResults: '一致なし' },
  panels: {
    tpi: { title: 'TPI強国指数' },
    signals: { title: '注目シグナル' },
    tournaments: { title: '大会ハブ' },
    liveMatches: { title: 'ライブスコア' },
    correlation: { title: '相関エンジン' },
    liveStreams: { title: 'ライブ配信' },
    evolution: { title: 'AI進化エンジン' },
    rankings: { title: 'ランキング変動' },
  },
  layers: { title: 'マップレイヤー', rankings: '世界ランキング', tournaments: '大会', liveMatches: 'ライブ' },
  variants: { world: '世界', pro: 'プロ', youth: 'ジュニア', equipment: '用具', asia: 'アジア', europe: 'ヨーロッパ' },
});

export const ko: Messages = fromEn({
  lang: { label: '언어' },
  common: { offline: '오프라인', loading: '로딩 중...', upcoming: '예정', finished: '종료', sample: '샘플', realtime: '실시간' },
  landing: {
    nav: { signals: '신호', tpi: 'TPI 지수', correlation: '상관', dashboard: '대시보드 열기' },
    hero: { tagline: '탁구 인텔리전스 · 실시간', title1: '뉴스가 되기 전에,', title2: '이미 알고 있다.', launch: '대시보드 시작', liveHub: '라이브 허브', free: '무료 · 가입 불필요' },
  },
  dashboard: { loading: '데이터 로딩 중...', liveHub: '라이브 허브', command: '명령' },
  liveHub: { title: '라이브 허브', allStreams: '모든 방송', back: '← 대시보드' },
  search: { placeholder: '명령, 국가, 레이어 검색...', noResults: '결과 없음' },
  panels: {
    tpi: { title: 'TPI 강국 지수' }, signals: { title: '핫 신호' }, tournaments: { title: '대회 허브' },
    liveMatches: { title: '실시간 스코어' }, correlation: { title: '상관 엔진' },
    liveStreams: { title: '라이브 스트림' }, evolution: { title: 'AI 진화 엔진' }, rankings: { title: '랭킹 변동' },
  },
  layers: { title: '맵 레이어' },
  variants: { world: '세계', pro: '프로', youth: '유소년', equipment: '장비', asia: '아시아', europe: '유럽' },
});

export const de: Messages = fromEn({
  lang: { label: 'Sprache' },
  common: { offline: 'Offline', loading: 'Laden...', upcoming: 'Bevorstehend', finished: 'Beendet', sample: 'Beispiel', realtime: 'Live' },
  landing: {
    nav: { signals: 'Signale', tpi: 'TPI-Index', correlation: 'Korrelation', dashboard: 'Dashboard öffnen' },
    hero: { tagline: 'Tischtennis-Intelligence · Live', title1: 'Bevor es Nachrichten wird,', title2: 'wusstest du es schon.', launch: 'Dashboard starten', liveHub: 'Live-Hub', free: 'Kostenlos · Keine Anmeldung' },
  },
  dashboard: { loading: 'Daten werden geladen...', liveHub: 'Live-Hub', command: 'Befehl' },
  liveHub: { title: 'Live-Hub', allStreams: 'Alle Streams', back: '← Dashboard' },
  search: { placeholder: 'Befehle, Länder, Ebenen suchen...', noResults: 'Keine Treffer' },
  panels: {
    tpi: { title: 'TPI-Machtindex' }, signals: { title: 'Top-Signale' }, tournaments: { title: 'Turnier-Hub' },
    liveMatches: { title: 'Live-Ergebnisse' }, correlation: { title: 'Korrelations-Engine' },
    liveStreams: { title: 'Live-Streams' }, evolution: { title: 'KI-Evolution' }, rankings: { title: 'Ranking-Änderungen' },
  },
  layers: { title: 'Kartenebenen' },
  variants: { world: 'Welt', pro: 'Profi', youth: 'Jugend', equipment: 'Material', asia: 'Asien', europe: 'Europa' },
});

export const fr: Messages = fromEn({
  lang: { label: 'Langue' },
  common: { offline: 'Hors ligne', loading: 'Chargement...', upcoming: 'À venir', finished: 'Terminé', sample: 'Échantillon', realtime: 'Direct' },
  landing: {
    nav: { signals: 'Signaux', tpi: 'Indice TPI', correlation: 'Corrélation', dashboard: 'Ouvrir le tableau de bord' },
    hero: { tagline: 'Intelligence tennis de table · En direct', title1: 'Avant que ce soit l\'actualité,', title2: 'vous le saviez déjà.', launch: 'Lancer le tableau de bord', liveHub: 'Hub live', free: 'Gratuit · Sans inscription' },
  },
  dashboard: { loading: 'Chargement des données...', liveHub: 'Hub live', command: 'Commande' },
  liveHub: { title: 'Hub live', allStreams: 'Tous les flux', back: '← Tableau de bord' },
  search: { placeholder: 'Rechercher commandes, pays, calques...', noResults: 'Aucun résultat' },
  panels: {
    tpi: { title: 'Indice TPI' }, signals: { title: 'Signaux chauds' }, tournaments: { title: 'Hub tournois' },
    liveMatches: { title: 'Scores en direct' }, correlation: { title: 'Moteur de corrélation' },
    liveStreams: { title: 'Flux live' }, evolution: { title: 'Évolution IA' }, rankings: { title: 'Classements' },
  },
  layers: { title: 'Calques carte' },
  variants: { world: 'Monde', pro: 'Pro', youth: 'Jeunes', equipment: 'Matériel', asia: 'Asie', europe: 'Europe' },
});

export const es: Messages = fromEn({
  lang: { label: 'Idioma' },
  common: { offline: 'Desconectado', loading: 'Cargando...', upcoming: 'Próximo', finished: 'Finalizado', sample: 'Muestra', realtime: 'En vivo' },
  landing: {
    nav: { signals: 'Señales', tpi: 'Índice TPI', correlation: 'Correlación', dashboard: 'Abrir panel' },
    hero: { tagline: 'Inteligencia de tenis de mesa · En vivo', title1: 'Cuando es noticia,', title2: 'ya lo sabías.', launch: 'Iniciar panel', liveHub: 'Centro en vivo', free: 'Gratis · Sin registro' },
  },
  dashboard: { loading: 'Cargando datos...', liveHub: 'Centro en vivo', command: 'Comando' },
  liveHub: { title: 'Centro en vivo', allStreams: 'Todas las señales', back: '← Panel' },
  search: { placeholder: 'Buscar comandos, países, capas...', noResults: 'Sin resultados' },
  panels: {
    tpi: { title: 'Índice TPI' }, signals: { title: 'Señales destacadas' }, tournaments: { title: 'Hub de torneos' },
    liveMatches: { title: 'Marcadores en vivo' }, correlation: { title: 'Motor de correlación' },
    liveStreams: { title: 'Señales en vivo' }, evolution: { title: 'Evolución IA' }, rankings: { title: 'Cambios de ranking' },
  },
  layers: { title: 'Capas del mapa' },
  variants: { world: 'Mundo', pro: 'Pro', youth: 'Juvenil', equipment: 'Equipamiento', asia: 'Asia', europe: 'Europa' },
});
