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
- `#/me` 我的：游客态；**不展示余额/充值**，不提供真实账号或交易

## 数据源

只读主站 `xingchen-caixun`：

- `data/manual-draw.json`：新港；`numsEnc` 使用主站 vfDec（XOR key `Xc9vF2026`）解密
- `data/draw.json`：新澳 `Macau`、香港 `HongKong` 的 `games[].nums / history[]`
- `data/site-config.json`：各彩种开奖时间与星期

三源回退：GitHub Pages → jsDelivr → raw.githubusercontent.com；每 30 秒自动刷新，顶部 ↻ 可手动刷新。
源数据目前新港可获取 19 期，新澳/香港各 10 期；页面按实际可用期数展示，不伪造历史。

## 边界

- 不做充值、下单、账号登录、支付、真实开奖接口或投注功能。
- 页脚：**演示站点 · 数据为样例 · 不构成任何投注建议**。
- 移动端 390px 优先；页面无横向溢出。

## 本地预览

`python -m http.server 8099 --directory lotteryhall`

打开 `http://127.0.0.1:8099/`。

## 部署

GitHub Pages，分支 `gh-pages`；仓库 `BYD666-WQ/xingchen-lotteryhall`。