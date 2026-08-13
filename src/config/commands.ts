import type { Command } from '@/types';
import { COUNTRIES } from '@/data/countries';
import { LAYER_PRESETS } from '@/config/map-layer-definitions';

export { LAYER_PRESETS };

export const LAYER_KEY_MAP: Record<string, string> = {
  live: 'liveMatches',
  youth: 'youthPipeline',
  tpi: 'tpiChoropleth',
  upset: 'upsetHeatmap',
};

export const COMMANDS: Command[] = [
  // Navigation
  { id: 'nav:global', keywords: ['global', 'world', 'reset', 'home', '全球'], label: '地图：全球视图', icon: '🌍', category: 'navigate' },
  { id: 'nav:asia', keywords: ['asia', 'pacific', '亚洲'], label: '地图：亚太地区', icon: '🌏', category: 'navigate' },
  { id: 'nav:europe', keywords: ['europe', 'eu', '欧洲'], label: '地图：欧洲', icon: '🏰', category: 'navigate' },

  // Layer presets
  { id: 'layers:competitive', keywords: ['competitive', 'pro', '比赛'], label: '显示竞技图层', icon: '🏆', category: 'layers' },
  { id: 'layers:scouting', keywords: ['scouting', 'youth', '青训'], label: '显示球探图层', icon: '🔍', category: 'layers' },
  { id: 'layers:events', keywords: ['events', 'tournaments', '赛事'], label: '显示赛事图层', icon: '📅', category: 'layers' },
  { id: 'layers:minimal', keywords: ['minimal', 'clean', '简洁'], label: '最小图层', icon: '✨', category: 'layers' },
  { id: 'layers:all', keywords: ['all layers', 'show all', '全部'], label: '启用全部图层', icon: '👁️', category: 'layers' },
  { id: 'layers:none', keywords: ['hide all', 'clear', '隐藏'], label: '隐藏全部图层', icon: '🚫', category: 'layers' },

  // Individual layers
  { id: 'layer:rankings', keywords: ['rankings', '排名'], label: '切换排名图层', icon: '🏆', category: 'layers' },
  { id: 'layer:tournaments', keywords: ['tournaments', '赛事'], label: '切换赛事图层', icon: '📍', category: 'layers' },
  { id: 'layer:liveStreams', keywords: ['streams', 'live', '直播', 'cctv', 'douyin', '小韩'], label: '切换直播信号图层', icon: '📡', category: 'layers' },
  { id: 'layer:clubs', keywords: ['clubs', 'league', '俱乐部'], label: '切换俱乐部图层', icon: '🏢', category: 'layers' },
  { id: 'layer:youthPipeline', keywords: ['youth', 'junior', '青少年'], label: '切换青训图层', icon: '🌱', category: 'layers' },
  { id: 'layer:equipment', keywords: ['equipment', 'rubber', 'blade', '器材'], label: '切换器材图层', icon: '🏓', category: 'layers' },
  { id: 'layer:federations', keywords: ['federation', 'association', '协会'], label: '切换协会图层', icon: '🏛️', category: 'layers' },
  { id: 'layer:tpiChoropleth', keywords: ['tpi', 'power index', '强国指数'], label: '切换 TPI 热力图', icon: '📊', category: 'layers' },
  { id: 'layer:upsetHeatmap', keywords: ['upset', '冷门'], label: '切换冷门热力图', icon: '⚡', category: 'layers' },

  // Panels
  { id: 'panel:tpi', keywords: ['tpi', 'instability', '强国'], label: '面板：TPI 指数', icon: '📊', category: 'panels' },
  { id: 'panel:signals', keywords: ['signals', 'news', '信号'], label: '面板：热门信号', icon: '📡', category: 'panels' },
  { id: 'panel:correlation', keywords: ['correlation', 'convergence', '关联'], label: '面板：关联引擎', icon: '🔗', category: 'panels' },
  { id: 'panel:liveStreams', keywords: ['streams', 'live', '直播', 'cctv', 'douyin'], label: '面板：直播信号', icon: '📡', category: 'panels' },
  { id: 'panel:evolution', keywords: ['evolution', 'ai', '进化', '公理'], label: '面板：AI 进化引擎', icon: '🧬', category: 'panels' },
  { id: 'nav:live-hub', keywords: ['live hub', '直播中心', '小韩老师'], label: '打开直播中心', icon: '📺', category: 'navigate' },
  { id: 'nav:motion-lab', keywords: ['motion', 'biomech', '力学', '生物力学', '美学'], label: '打开运动力学实验室', icon: '🦴', category: 'navigate' },
  { id: 'nav:evolution', keywords: ['evolution', 'self', '自我进化', '进化'], label: '打开自我进化', icon: '🧬', category: 'navigate' },
  { id: 'panel:tournaments', keywords: ['tournaments', 'events', '赛事'], label: '面板：赛事枢纽', icon: '📅', category: 'panels' },
  { id: 'panel:rankings', keywords: ['rankings', 'movers', '排名', 'ittf'], label: '面板：ITTF 排名', icon: '📈', category: 'panels' },
  { id: 'panel:leagues', keywords: ['leagues', 'clubs', 'ttbl', '乒超', '联赛', 'wtt', 'ittf'], label: '面板：联赛俱乐部', icon: '🏢', category: 'panels' },
  { id: 'panel:leagueData', keywords: ['league data', 'stats', '数据', '德甲', 't联赛', '胜率', 'wtt', 'ittf'], label: '面板：联赛数据中心', icon: '📊', category: 'panels' },
  { id: 'panel:grassroots', keywords: ['youth', 'veteran', 'senior', '青少年', '中老年', '业余'], label: '面板：青少年与大众', icon: '🌱', category: 'panels' },
  { id: 'panel:gear', keywords: ['equipment', 'gear', 'shoes', 'rubber', '器材', '球鞋', '教学'], label: '面板：器材与教学', icon: '🏓', category: 'panels' },
  { id: 'action:mcp', keywords: ['mcp', 'api', 'tools'], label: 'MCP 工具列表 (20 tools)', icon: '🔌', category: 'actions' },

  // View / variant
  { id: 'view:world', keywords: ['world variant', '世界'], label: '视角：世界', icon: '🌍', category: 'view' },
  { id: 'view:pro', keywords: ['pro', 'professional', '职业'], label: '视角：职业', icon: '🏆', category: 'view' },
  { id: 'view:youth', keywords: ['youth', 'junior', '青少年'], label: '视角：青少年', icon: '🌱', category: 'view' },
  { id: 'view:equipment', keywords: ['equipment', 'gear', '器材'], label: '视角：器材', icon: '🏓', category: 'view' },
  { id: 'view:asia', keywords: ['asia', '亚洲'], label: '视角：亚洲', icon: '🌏', category: 'view' },
  { id: 'view:europe', keywords: ['europe', '欧洲'], label: '视角：欧洲', icon: '🏰', category: 'view' },

  // Actions
  { id: 'action:refresh', keywords: ['refresh', 'reload', '刷新'], label: '刷新全部数据', icon: '🔄', category: 'actions' },
  { id: 'action:toggle-sidebar', keywords: ['sidebar', '侧栏'], label: '切换侧栏', icon: '◧', category: 'actions' },

  // Countries
  ...COUNTRIES.map((c) => ({
    id: `country:${c.code}`,
    keywords: [c.code, c.name.toLowerCase(), c.nameZh, c.federation.toLowerCase()],
    label: `国家：${c.nameZh} (${c.code})`,
    icon: '🏳️',
    category: 'country' as const,
  })),
];

export function fuzzyMatch(query: string, command: Command): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  if (command.label.toLowerCase().includes(q)) return 0.9;
  if (command.id.toLowerCase().includes(q)) return 0.85;
  const kwHit = command.keywords.some((k) => k.includes(q) || q.includes(k));
  if (kwHit) return 0.7;
  return 0;
}

export function searchCommands(query: string): Command[] {
  if (!query.trim()) return COMMANDS;
  return COMMANDS
    .map((cmd) => ({ cmd, score: fuzzyMatch(query, cmd) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.cmd);
}
