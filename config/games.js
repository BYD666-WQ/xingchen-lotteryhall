// 彩种 + 赔率 + 规则（2231 风格 / 可乐 2026-11-20 需求）
// 赔率表集中在这里；后台可通过 Function /admin/config 覆盖（前端以本表兜底）。
window.LH_ODDS = {
  rank: 9.98,          // 第1-10名 名次赔率（服务端 /games.oddsByPlay.fast.rank 为准）
  special: 47.3,        // 新澳/新香港「特码」号码
  macauSpecialZodiac: 48.8, // 澳门（新澳）生肖
  oneZodiac: 2.0,       // 一肖 / 平特肖
  specialZodiac: 2.0,   // 特肖
  horse: 1.8,           // 马
  twoSide: 1.96,
  color: 2.8,
  regular: 7.8,
  miss: 2.0,
  combo2: 3.2, combo3: 5.5, combo4: 9.8, combo5: 18.0
};
window.LH_RULES = {
  resetOnLogout: true   // 退出登录清零积分（后台可配置）
};
window.LH_RACING_ODDS = {
  twoSide: { big: 2.19, small: 1.79, odd: 1.79, even: 2.19 },
  champion: { big: 1.99, small: 1.99, odd: 1.99, even: 1.99, long: 1.99, tiger: 1.99 },
  runner: { big: 1.99, small: 1.99, odd: 1.99, even: 1.99 }
};
window.LH_GAMES = [
  { id:'fast-airship-5', name:'幸运飞艇5分', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'艇', color:'#4aa99d', drawKey:'mock', racing:true },
  { id:'fast-bjrace', name:'北京赛车', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'北', color:'#7b68c8', drawKey:'mock', racing:true },
  { id:'fast-luckyrace', name:'幸运赛车', provider:'快开', enabled:true, mock:true, period:'3分钟', periodSec:180, icon:'运', color:'#e6a62f', drawKey:'mock', racing:true },
  { id:'fast-ship10', name:'澳洲幸运10', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'澳', color:'#5a8fd4', drawKey:'mock', racing:true },
  { id:'fast-tensc', name:'极速时时彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'时', color:'#5a7bd4', drawKey:'mock', racing:true },
  { id:'fast-txffc', name:'腾讯分分彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'分', color:'#687bd0', drawKey:'mock', racing:true },
  { id:'newhk', name:'新香港', provider:'主站', enabled:true, dataSource:'manual-draw.json', icon:'新', color:'#e6a62f', drawKey:'newhk', desc:'每日 21:34 · 主站新香港', hideZodiac:true, specialOdds:47.3 },
  { id:'newmo', name:'新澳', provider:'主站', enabled:true, dataSource:'draw.json#Macau', icon:'澳', color:'#3d8ed0', drawKey:'newmo', desc:'每日 21:30 · 主站新澳', hideZodiac:true, specialOdds:47.3, zodiacOdds:48.8 },
  { id:'hk', name:'香港', provider:'主站', enabled:true, dataSource:'draw.json#HongKong', icon:'香', color:'#d94b62', drawKey:'hk', desc:'周日 21:30 · 主站香港', specialOdds:47.3 },
  { id:'fast-race-1', name:'1分钟赛车', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'1', color:'#4d8fd8', drawKey:'mock' , racing:true },
  { id:'fast-race-2', name:'2分钟赛车', provider:'快开', enabled:true, mock:true, period:'2分钟', periodSec:120, icon:'2', color:'#5a7bd4', drawKey:'mock' , racing:true },
  { id:'fast-race-5', name:'5分钟赛车', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'5', color:'#687bd0', drawKey:'mock' , racing:true },
  { id:'fast-race-10', name:'10分钟赛车', provider:'快开', enabled:true, mock:true, period:'10分钟', periodSec:600, icon:'10', color:'#7b68c8', drawKey:'mock' , racing:true },
  { id:'fast-mark6-1', name:'一分钟六合彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'六', color:'#e39b38', drawKey:'mock', specialOdds:48.8 },
  { id:'fast-k3', name:'快三', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'快', color:'#d45f82', drawKey:'mock' },
  { id:'fast-mark6-5', name:'5分钟六合彩', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'5', color:'#d36d55', drawKey:'mock', specialOdds:48.8 },
  { id:'fast-race-30', name:'30秒赛车', provider:'快开', enabled:true, mock:true, period:'30秒', periodSec:30, icon:'30', color:'#5a7bd4', drawKey:'mock', racing:true },
  { id:'fast-airship', name:'一分飞艇', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'艇', color:'#4aa99d', drawKey:'mock', racing:true }
];
