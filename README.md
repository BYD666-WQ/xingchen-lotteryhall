# 幸运大厅 · 彩票大厅演示站

纯静态展示空壳，**全部数据为 mock 样例**，不接真实接口。

## 线上地址

https://byd666-wq.github.io/xingchen-lotteryhall/

## 页面（hash 路由）

- `#/lotteryhall` 彩票大厅：banner、公告、彩种卡片、高手房间、榜单速览
- `#/history` 开奖记录：mock 表格、彩种筛选
- `#/trend` 号码走势：mock 柱状图 + 号码网格
- `#/rank` 高手排行：前三领奖台 + 完整榜单
- `#/me` 我的：游客态、演示余额、设置项

## 交互说明

- 底部 tab 使用 hash 切换，刷新后保持当前页。
- 下注 / 充值 / 登录 / 房间进入 / 关注 / 加载更多等入口均为「演示占位」，点击弹出说明，不产生任何真实请求或交易。
- 页脚声明：**演示站点 · 数据为样例 · 不构成任何投注建议**。
- 移动端 390px 优先；表格横向滚动限制在容器内，页面无横向溢出。

## 部署

GitHub Pages，分支 `gh-pages`，仓库 `BYD666-WQ/xingchen-lotteryhall`。
静态文件：`index.html` + `assets/`。

## 本地预览

`python -m http.server 8099 --directory lotteryhall`
访问 `http://127.0.0.1:8099/`。

## 边界

纯展示，不做充值、下单、账号登录、支付、真实开奖接口或投注功能。