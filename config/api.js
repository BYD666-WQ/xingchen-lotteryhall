// 彩票大厅 API 配置（Phase D：全部交易走 Appwrite Function）
// functionId / enabled 由发布前填写；enabled=false 时前端跑本地 mock，仅用于预览与离线演示。
window.LH_API = {
  enabled: true,                 // 接上 Function 后改为 true
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  project: '6aff4c2f0016ee43abad',
  functionId: 'lottery-api',                 // 例如 'lottery-api'
  timeoutMs: 30000
};
