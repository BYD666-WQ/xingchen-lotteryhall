# 幸运大厅 · 彩票大厅演示站

纯静态展示空壳，**所有交易/账号功能均为演示占位**；开奖数据来自主站只读接口。

## 线上地址

https://byd666-wq.github.io/xingchen-lotteryhall/

## 页面

- `#/lotteryhall` 大厅：新港/新澳/香港三个彩种卡片（当前期号、开奖时间、缩略号码、下期倒计时）
- `#/game/newhk` / `#/game/newmo` / `#/game/hk`：上期开奖、下期倒计时、近 10 期、波色/生肖统计
- `#/history` 开奖记录：三彩种切换，主站真实历史
- `#/trend` 走势：基于真实近 12 期号码的波色/号码网格
- `#/rank` 排行榜：mock 演示榜单
- `#/me` 我的：游客态；**不展示真实账户或交易入口**
- `#/bet/newhk` / `#/bet/newmo` / `#/bet/hk`：模拟投注页（账户积分、注数、本地注单）
- `#/howto`：8 个玩法的规则、演示赔率、举例与锚点导航

## Phase C Appwrite 真接口

- 前端引入本地 `assets/vendor/appwrite.js`（不依赖 CDN）。
- 注册：Appwrite `account.create` + 登录 + `users` 表建行；用户名为账号名，邮箱为内部合成地址。
- 登录/刷新：`account.get()`；积分读 `users` 行。
- 投注：更新 `users.points` + 写 `bets` 行（`picks` 为 JSON 文本）。
- 后台 `admin.html` 的「彩票大厅」tab：API Key 本地保存，真实读写 users/bets/config。
- Appwrite project `6aff4c2f0016ee43abad` / database `lottery`；users 表 `6aff4ea1000cecd6c798`，bets `bets`，config `config`。
- API Key 仅后台本机 localStorage，绝不放入前端。

## Phase A 账号与彩种

- `#/login`：本地 mock 登录/注册；会话存 `lh-demo-session`，账号存本机。
- 未登录点投注会引导登录；登录后显示账户积分。
- 首屏 Banner 第一张「立即投注」为投注入口。
- 3 列彩种：新港/新澳/香港（真实数据）+ 8 个快频模拟彩种 + 老澳（未接入）。
- 快频彩种 `#/bet/<id>` 使用本地 mock 期号/倒计时/号码格。
- 主站后台本地 mock 在 `新站-复刻/admin.html` 的「彩票大厅」tab，接口路径已预留，不调用。

## 模拟积分与投注

- 初始 **10000 账户积分**，存 `localStorage`，可重置。
- 每注固定 **2 账户积分**；选号后选择注数，生成**本地模拟注单**。
- 开奖后按演示赔率**本地自动结算**，中奖增加积分；不涉及真实支付、账户或提现。
- 底部注数：10 / 20 / 50 / 100 / 自定义；提交只会弹演示说明，不产生真实订单。
- 彩种配置在 `config/games.js`；老澳已加入但标记 `数据待接入`。

## 数据源

只读主站 `xingchen-caixun`：

- `data/manual-draw.json`：新港；`numsEnc` 使用主站 vfDec（XOR key `Xc9vF2026`）解密
- `data/draw.json`：新澳 `Macau`、香港 `HongKong` 的 `games[].nums / history[]`
- `data/site-config.json`：各彩种开奖时间与星期

三源回退：GitHub Pages → jsDelivr → raw.githubusercontent.com；每 30 秒自动刷新，顶部 ↻ 可手动刷新。
源数据目前新港可获取 19 期，新澳/香港各 10 期；页面按实际可用期数展示，不伪造历史。

## 边界

- 不做真实交易、下单、账号登录、支付或投注功能。
- 页脚：**演示站点 · 数据为样例 · 不构成任何投注建议**。
- 移动端 390px 优先；页面无横向溢出。

## 本地预览

`python -m http.server 8099 --directory lotteryhall`

打开 `http://127.0.0.1:8099/`。

## 部署

GitHub Pages，分支 `gh-pages`；仓库 `BYD666-WQ/xingchen-lotteryhall`。