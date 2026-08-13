# TTWorldMonitor

**乒乓球世界实时情报仪表盘** — 深度参考 [World Monitor](https://github.com/koala73/worldmonitor) 架构与机制构建。

> 等它上新闻时，你早已知晓。

## 架构（对标 World Monitor）

```
types → config → services → components → app → pages
```

| World Monitor | TTWorldMonitor | 文件 |
|---|---|---|
| CII v8 国家不稳定指数 | **TPI v1 强国指数** | `src/server/tpi-scoring.ts` |
| `LAYER_REGISTRY` 56 图层 | 9 图层注册表 | `src/config/map-layer-definitions.ts` |
| 6 站点变体 (world/tech/finance...) | 6 视角变体 | `src/config/variants/` |
| Bootstrap fast/slow/on-demand | 三级 Bootstrap | `src/services/bootstrap.ts` |
| `CorrelationEngine` + adapters | 4 域适配器 | `src/services/correlation-engine/` |
| `analysis-core.ts` 纯函数 | 速度/汇聚检测 | `src/services/analysis-core.ts` |
| `wm:breaking-news` 事件总线 | `tt:breaking-news` | `src/utils/event-bus.ts` |
| `SearchModal` + `commands.ts` | ⌘K 命令面板 | `src/components/SearchModal.tsx` |
| `Panel.ts` 基类 | React Panel 组件 | `src/components/panels/Panel.tsx` |
| `RefreshScheduler` 智能轮询 | 面板级刷新 | `src/services/refresh-scheduler.ts` |
| Circuit breaker 熔断器 | 按域熔断 | `src/utils/circuit-breaker.ts` |
| URL state sync | 图层/国家 URL 同步 | `src/utils/url-state.ts` |
| `/api/bootstrap` Edge API | Vite 中间件模拟 | `vite.config.ts` |

## 核心机制

### TPI 强国指数 (对标 CII)
- **服务端权威计算**：客户端只展示，公式版本 `v1`
- 五维分量：成年实力、青训梯队、赛事势头、双打深度、媒体热度
- 24h 趋势死区 ±1 分

### 关联引擎 (对标 CorrelationEngine)
四个域适配器，各自聚类 + 评分 + 趋势检测：
- `results` — 赛果/冷门（country 聚类）
- `ranking` — 排名震荡（country 聚类）
- `tournament` — 赛事枢纽（proximity 聚类）
- `news` — 媒体信号（entity 聚类）

### Bootstrap 分级加载 (对标 CONCEPTS.md)
- **fast**：TPI、信号、实时比分（首屏）
- **slow**：排名、赛事、关联（后台）
- **on-demand**：国家档案、球员资料（按需）

### 突发告警管道
- 5 个独立来源：RSS、关键词速度、冷门赛果、排名震荡、伤病
- 去重 + 60s 全局冷却 + 自动消失

## 快速开始

```bash
npm install --legacy-peer-deps
npm run dev
```

- `/` — 落地页
- `/dashboard` — 主仪表盘
- `⌘K` / `Ctrl+K` — 命令面板

### 变体开发

```bash
VITE_VARIANT=pro npm run dev      # 职业视角
VITE_VARIANT=youth npm run dev    # 青少年视角
VITE_VARIANT=equipment npm run dev # 器材视角
```

## 项目结构

```
src/
├── config/           # 变体、图层、命令、面板配置
├── server/           # TPI 评分（未来提取为 Edge Function）
├── services/
│   ├── bootstrap.ts          # 分级数据加载
│   ├── analysis-core.ts      # 纯函数信号分析
│   ├── breaking-alerts.ts    # 突发告警管道
│   ├── refresh-scheduler.ts  # 智能轮询
│   └── correlation-engine/   # 关联引擎 + 适配器
├── store/            # Zustand 全局状态 (AppContext)
├── app/              # Boot 序列
├── components/       # UI 组件
├── data/             # 种子数据
└── utils/            # 事件总线、熔断器、URL 状态
```

## License

MIT
