window.LH_GAMES = [
  { id:'newhk', name:'新港', provider:'主站', enabled:true, dataSource:'manual-draw.json', icon:'港', color:'#e6a62f', drawKey:'newhk', desc:'每日 21:34 · 主站新港' },
  { id:'newmo', name:'新澳', provider:'主站', enabled:true, dataSource:'draw.json#Macau', icon:'澳', color:'#3d8ed0', drawKey:'newmo', desc:'每日 21:30 · 主站新澳' },
  { id:'hk', name:'香港', provider:'主站', enabled:true, dataSource:'draw.json#HongKong', icon:'香', color:'#d94b62', drawKey:'hk', desc:'周日 21:30 · 主站香港' },
  { id:'oldmo', name:'老澳', provider:'待接入', enabled:false, dataSource:null, icon:'老', color:'#8d98aa', note:'老澳数据待接入，接入后自动开放' },
  { id:'fast-mark6-1', name:'一分钟六合彩', provider:'模拟', enabled:true, mock:true, period:'1分钟', periodSeconds:60, dataSource:'mock', icon:'1', color:'#e39b38', drawKey:'mock' },
  { id:'fast-mark6-5', name:'5分钟六合彩', provider:'模拟', enabled:true, mock:true, period:'5分钟', periodSeconds:300, dataSource:'mock', icon:'5', color:'#d36d55', drawKey:'mock' },
  { id:'fast-race-1', name:'一分钟赛车', provider:'模拟', enabled:true, mock:true, period:'1分钟', periodSeconds:60, dataSource:'mock', icon:'赛', color:'#4d8fd8', drawKey:'mock' },
  { id:'fast-race-30', name:'30秒赛车', provider:'模拟', enabled:true, mock:true, period:'30秒', periodSeconds:30, dataSource:'mock', icon:'30', color:'#5a7bd4', drawKey:'mock' },
  { id:'fast-race-5', name:'5分钟赛车', provider:'模拟', enabled:true, mock:true, period:'5分钟', periodSeconds:300, dataSource:'mock', icon:'5', color:'#687bd0', drawKey:'mock' },
  { id:'fast-race-10', name:'10分钟赛车', provider:'模拟', enabled:true, mock:true, period:'10分钟', periodSeconds:600, dataSource:'mock', icon:'10', color:'#7b68c8', drawKey:'mock' },
  { id:'fast-k3', name:'大发快三', provider:'模拟', enabled:true, mock:true, period:'1分钟', periodSeconds:60, dataSource:'mock', icon:'快', color:'#d45f82', drawKey:'mock' },
  { id:'fast-airship', name:'一分飞艇', provider:'模拟', enabled:true, mock:true, period:'1分钟', periodSeconds:60, dataSource:'mock', icon:'艇', color:'#4aa99d', drawKey:'mock' }
];
