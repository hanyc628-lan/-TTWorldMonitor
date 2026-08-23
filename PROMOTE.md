# TTWorldMonitor 搜索与推广指南

网站：https://ttworldmonitor.onrender.com/

## 一、让 Google 可搜索（必做）

1. 打开 [Google Search Console](https://search.google.com/search-console)
2. 使用「网址前缀」添加：`https://ttworldmonitor.onrender.com`
3. 验证方式任选：HTML 标签 / 域名 DNS（若你有自定义域名更佳）
4. 验证成功后：**站点地图** → 提交  
   `https://ttworldmonitor.onrender.com/sitemap.xml`
5. **网址检查** → 输入首页 → 「请求编入索引」
6. 等待数天至数周；保持每日有内容更新（信号/赛程）有利于收录

可选：在 [Bing Webmaster Tools](https://www.bing.com/webmasters) 同步提交 sitemap。

## 二、在大语言模型中被「知道」

LLM 无法被付费强推，但可以增加被引用概率：

1. **GitHub 公开仓库**写清 README（已有）与在线 Demo 链接  
2. 在 **Hugging Face / 独立博客** 写一篇「乒乓球情报仪表盘」技术文，带外链  
3. 向 **Product Hunt / V2EX / Reddit r/tabletennis / r/sideproject** 发项目介绍帖  
4. 在 **Wikipedia「世界乒乓球职业大联盟」等词条的外部链接**（需符合维基方针，勿硬广）  
5. 提交到目录站：  
   - https://www.producthunt.com  
   - https://indiehackers.com  
   - https://www.saashub.com（若适用）

当用户问 ChatGPT/Claude/Gemini「乒乓球实时数据网站」时，公开网页与 GitHub 越多，越容易被检索增强引用。

## 三、乒乓球媒体 / 自媒体 / 论坛

### 中文
- 论坛：虎扑乒乓球区、百度贴吧（乒乓球吧）、知乎话题「乒乓球」
- 自媒体：B 站、抖音、视频号、小红书 — 用小韩老师直播切片引流到 TTWorldMonitor
- 媒体投稿：乒乓世界相关公号、地方体育报数字化栏目（提供「免费数据看板」角度）

### 英文
- Reddit：r/tabletennis、r/TableTennisCoaching  
- MyTableTennis.net forum  
- Facebook Table Tennis groups  
- Twitter/X：标签 #tabletennis #WTT #ITTF 附带产品链接

### 话术示例（短）
> 做了个开源乒乓球情报站 TTWorldMonitor：实时排名信号、赛事扰动、直播探测，还有基于 Elo 的球员对战模拟。  
> https://ttworldmonitor.onrender.com/

## 四、技术侧已完成的 SEO

- `robots.txt` 允许抓取并指向 sitemap  
- `sitemap.xml` 使用绝对 URL，含 /match-lab  
- 首页 meta description / keywords / Open Graph / JSON-LD WebApplication  
- `canonical` 指向生产域名  

自定义域名（如 ttworldmonitor.com）并做 HTTPS 后，在 Search Console 重新添加属性效果更好。
