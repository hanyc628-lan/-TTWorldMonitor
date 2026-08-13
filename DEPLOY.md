# Render 部署指南

## 为什么显示 Not Found？

`https://ttworldmonitor.onrender.com` 返回 **Not Found** 表示 **Render 上还没有创建该服务**（平台级 404），不是网站代码问题。代码已在 GitHub，需要你在 Render 控制台完成一次 Blueprint 部署。

## 一键部署步骤（约 5 分钟）

### 1. 登录 Render

打开 [https://dashboard.render.com](https://dashboard.render.com) 并注册/登录（可用 GitHub 账号）。

### 2. 从 Blueprint 创建服务

1. 打开 **[New Blueprint Instance](https://dashboard.render.com/blueprint/new)**
2. 连接 GitHub 账号，选择仓库 **`liuyuncloud/TTWorldMonitor`**
3. Render 会读取根目录 `render.yaml`，显示将要创建的服务 `ttworldmonitor`
4. 点击 **Apply** 开始部署

或直接访问（需已登录 Render 并授权 GitHub）：

```
https://dashboard.render.com/blueprint/new?repo=https://github.com/liuyuncloud/TTWorldMonitor
```

### 3. 等待构建完成

- 首次部署约 **5–10 分钟**（免费实例较慢）
- 在 Dashboard → `ttworldmonitor` → **Logs** 查看进度
- 状态变为 **Live** 后，访问 `https://ttworldmonitor.onrender.com`

### 4. 部署后验证

```powershell
node scripts/verify-cloud-deploy.mjs https://ttworldmonitor.onrender.com
```

应看到 `Health: 200 OK`。

## 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| Not Found（整页） | 服务未创建 | 按上文完成 Blueprint |
| 构建失败 `ERESOLVE` | npm 依赖冲突 | 已添加 `.npmrc`（legacy-peer-deps） |
| 构建失败缺少 tsc/vite | NODE_ENV=production 跳过 devDeps | `render.yaml` 已改为 `npm install --include=dev` |
| 启动后 502 | tsx 未安装 | 已将 `tsx` 移至 dependencies |
| 冷启动慢 | 免费实例休眠 | 首次访问等 30–60 秒；可配置 GitHub Actions Cron |

## GitHub Actions 保活（可选）

仓库 Settings → Secrets → 添加 `TTWM_CLOUD_URL` = `https://ttworldmonitor.onrender.com`，`.github/workflows/cloud-evolve.yml` 会每 5 分钟 ping 一次。

## 环境变量（render.yaml 已预设）

- `TTWM_SITE_URL` — 部署完成后改为你的实际域名
- `TTWM_PUBLISHED_AT` — 合规发布日期
