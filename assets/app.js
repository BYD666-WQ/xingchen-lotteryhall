(function () {
  'use strict';

  var BASES = [
    'https://byd666-wq.github.io/xingchen-caixun/',
    'https://cdn.jsdelivr.net/gh/BYD666-WQ/xingchen-caixun@main/',
    'https://raw.githubusercontent.com/BYD666-WQ/xingchen-caixun/main/'
  ];
  var DEFS = {
    newhk: { name: '新港', icon: '港', color: '#e6a62f', drawKey: 'newhk', desc: '每日 21:34 · 主站新港' },
    newmo: { name: '新澳', icon: '澳', color: '#3d8ed0', drawKey: 'newmo', desc: '每日 21:30 · 主站新澳' },
    hk: { name: '香港', icon: '香', color: '#d94b62', drawKey: 'hk', desc: '周日 21:30 · 主站香港' }
  };
  var ORDER = ['newhk', 'newmo', 'hk'];
  var PLACEHOLDERS = [
    { name: '老澳门', icon: '老', color: '#7d8da8' },
    { name: '快乐 8', icon: '8', color: '#4cae78' },
    { name: '北京赛车', icon: '车', color: '#c88742' }
  ];
  var RED = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
  var BLUE = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
  var KEY = 'Xc9vF2026';
  var state = { games: {}, config: {}, updated: 0, error: '', loading: false };
  var historyGame = 'newhk';
  var countdownTimer = 0;
  var bannerTimer = 0;
  var bannerIndex = 0;
  var toastTimer = 0;
  var modalOpen = false;

  var RANKS = [
    { name: '好运来工作室', avatar: '好', cls: '', tag: '新港 · 12 连中', value: '78%', label: '命中率', medal: '♛' },
    { name: '灯塔数据组', avatar: '灯', cls: 'v2', tag: '新澳 · 9 连中', value: '73%', label: '命中率', medal: '②' },
    { name: '小满研究社', avatar: '满', cls: 'v3', tag: '香港 · 8 连中', value: '71%', label: '命中率', medal: '③' },
    { name: '北纬二十三', avatar: '北', cls: 'v4', tag: '综合 · 6 连中', value: '68%', label: '命中率', medal: '4' },
    { name: '夜航船', avatar: '夜', cls: 'v2', tag: '新港 · 5 连中', value: '64%', label: '命中率', medal: '5' },
    { name: '数据小酒馆', avatar: '酒', cls: 'v3', tag: '新澳 · 4 连中', value: '61%', label: '命中率', medal: '6' }
  ];
  var QUICK = [
    { t: '开奖', i: '奖', c: 'linear-gradient(135deg,#ff9b47,#ed5b3e)', href: '#/history' },
    { t: '走势', i: '势', c: '#4ca4e8', href: '#/trend' },
    { t: '图谱', i: '谱', c: '#6e8ee8', action: '图谱为演示入口，暂未开放' },
    { t: '排行榜', i: '榜', c: 'linear-gradient(135deg,#ff6a6e,#dc3c41)', href: '#/rank' },
    { t: '资料', i: '资', c: '#3e9fe0', action: '资料库为演示入口，暂未开放' },
    { t: '规则', i: '规', c: '#58b5a6', action: '玩法规则为演示内容' },
    { t: '客服', i: '服', c: '#4f8fe0', action: '客服为演示入口' },
    { t: '活动', i: '活', c: 'linear-gradient(135deg,#ff686b,#dc3c41)', action: '活动为演示入口，不产生真实奖励' }
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function shortIssue(v) { return String(v == null ? '' : v).slice(-3); }
  function colorOf(n) { n = parseInt(n, 10); if (RED.indexOf(n) >= 0) return '红'; if (BLUE.indexOf(n) >= 0) return '蓝'; return '绿'; }
  function waveClass(n) { var c = colorOf(n); return c === '红' ? 'r' : (c === '蓝' ? 'b' : 'g'); }
  function normBall(x) {
    if (x == null) return null;
    var c = (typeof x === 'object') ? (x.c != null ? x.c : x.num) : x;
    c = String(c == null ? '' : c).trim();
    if (!/^\d+$/.test(c)) return null;
    c = pad(parseInt(c, 10));
    return { c: c, z: (x && x.z) || '', color: (x && x.color) || colorOf(c) };
  }
  function normNums(arr) { return (arr || []).map(normBall).filter(Boolean).slice(0, 7); }
  function vfDec(enc) {
    try {
      var bin = atob(String(enc || '')), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length);
      return JSON.parse(new TextDecoder().decode(arr));
    } catch (e) { return null; }
  }
  function issueNo(v) { var n = parseInt(v, 10); return isFinite(n) ? n : null; }
  function parseManual(manual, now) {
    if (!manual) return null;
    var hist = (manual.history || []).map(function (h) { var n = normNums(h.nums); return n.length === 7 ? { issue: issueNo(h.issue), nums: n } : null; }).filter(Boolean).sort(function (a, b) { return b.issue - a.issue; });
    var cur = manual.current || {}, curNums = normNums(cur.nums), visible = cur.visibleFrom ? Date.parse(cur.visibleFrom) : 0;
    if (curNums.length < 7 && cur.numsEnc && (!visible || visible <= now)) { var d = vfDec(cur.numsEnc); if (d) curNums = normNums(d); }
    var last, nextIssue;
    if (curNums.length === 7) {
      last = { issue: issueNo(cur.issue), nums: curNums }; nextIssue = last.issue + 1;
      hist = [{ issue: last.issue, nums: last.nums }].concat(hist.filter(function (h) { return h.issue !== last.issue; }));
    } else { last = hist[0] || null; nextIssue = cur.issue ? issueNo(cur.issue) : (last ? last.issue + 1 : null); }
    var seen = {};
    hist = hist.filter(function (h) { if (seen[h.issue]) return false; seen[h.issue] = 1; return true; }).slice(0, 20);
    return { last: last, nextIssue: nextIssue, history: hist };
  }
  function parseDraw(draw, rule) {
    if (!draw || !draw.games) return null;
    var g = draw.games.filter(function (x) { return x.rule === rule; })[0]; if (!g) return null;
    var nums = normNums(g.nums); if (nums.length < 7) return null;
    var last = { issue: issueNo(g.issue), nums: nums };
    var hist = [{ issue: last.issue, nums: nums }].concat((g.history || []).map(function (h) { var n = normNums(h.nums); return n.length === 7 ? { issue: issueNo(h.issue), nums: n } : null; }).filter(Boolean));
    var seen = {};
    hist = hist.filter(function (h) { if (seen[h.issue]) return false; seen[h.issue] = 1; return true; }).sort(function (a, b) { return b.issue - a.issue; }).slice(0, 20);
    return { last: last, nextIssue: last.issue + 1, history: hist };
  }
  function timeCfg(cfg, key) {
    var d = (cfg && cfg.drawTimes && cfg.drawTimes[key]) || {};
    var def = key === 'hk' ? { time: '21:30', days: [0] } : (key === 'newmo' ? { time: '21:30', days: [0,1,2,3,4,5,6] } : { time: '21:34', days: [0,1,2,3,4,5,6] });
    var parts = String(d.time || def.time).split(':');
    return { time: String(d.time || def.time), hour: parseInt(parts[0], 10) || 0, minute: parseInt(parts[1], 10) || 0, days: (d.days && d.days.length ? d.days : def.days).map(Number) };
  }
  function nextDrawAt(game, now) {
    now = now || new Date(); var cfg = game.timeCfg;
    for (var i = 0; i < 15; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, cfg.hour, cfg.minute, 0, 0);
      if (d.getTime() <= now.getTime()) continue;
      if (cfg.days.indexOf(d.getDay()) < 0) continue;
      return d;
    }
    return null;
  }
  function countdownText(game) {
    var d = nextDrawAt(game); if (!d) return '--:--:--';
    var left = Math.max(0, Math.floor((d.getTime() - Date.now()) / 1000));
    var days = Math.floor(left / 86400), hours = Math.floor(left % 86400 / 3600);
    return (days > 0 ? days + '天 ' : '') + pad(hours) + ':' + pad(Math.floor(left % 3600 / 60)) + ':' + pad(left % 60);
  }
  function fetchOne(path) {
    var i = 0;
    function go() {
      if (i >= BASES.length) return Promise.reject(new Error('all sources failed: ' + path));
      var url = BASES[i++] + path + '?t=' + Date.now();
      var ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = ac ? setTimeout(function () { try { ac.abort(); } catch (e) {} }, 7000) : 0;
      return fetch(url, { cache: 'no-store', signal: ac ? ac.signal : undefined }).then(function (r) {
        if (timer) clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json();
      }).catch(function () { if (timer) clearTimeout(timer); return go(); });
    }
    return go();
  }
  function setData(manual, draw, cfg) {
    var now = Date.now(), games = {};
    var m = parseManual(manual, now); if (m) games.newhk = Object.assign({}, DEFS.newhk, m);
    var dm = parseDraw(draw, 'Macau'); if (dm) games.newmo = Object.assign({}, DEFS.newmo, dm);
    var dh = parseDraw(draw, 'HongKong'); if (dh) games.hk = Object.assign({}, DEFS.hk, dh);
    ORDER.forEach(function (id) { if (games[id]) games[id].timeCfg = timeCfg(cfg, DEFS[id].drawKey); });
    ORDER.forEach(function (id) { if (!games[id] && state.games[id]) games[id] = state.games[id]; });
    state.games = games; state.config = cfg || state.config || {}; state.updated = Date.now(); state.error = '';
  }
  function loadData(silent) {
    if (state.loading) return Promise.resolve();
    state.loading = true; setRefreshBusy(true);
    var jobs = [fetchOne('data/manual-draw.json'), fetchOne('data/draw.json'), fetchOne('data/site-config.json')];
    var all = Promise.allSettled ? Promise.allSettled(jobs) : Promise.all(jobs.map(function (p) { return p.then(function (v) { return { status: 'fulfilled', value: v }; }, function (e) { return { status: 'rejected', reason: e }; }); }));
    return all.then(function (res) {
      var manual = res[0] && res[0].status === 'fulfilled' ? res[0].value : null;
      var draw = res[1] && res[1].status === 'fulfilled' ? res[1].value : null;
      var cfg = res[2] && res[2].status === 'fulfilled' ? res[2].value : null;
      if (!manual && !draw && !cfg) throw new Error('数据源不可达');
      setData(manual, draw, cfg);
      if (!silent) { showToast('数据已更新'); render(true); }
      else render(true);
    }).catch(function (e) {
      state.error = String(e && e.message || e); if (!state.games.newhk && !state.games.newmo && !state.games.hk) render(true); if (!silent) showToast('刷新失败，稍后重试');
    }).then(function () { state.loading = false; setRefreshBusy(false); });
  }
  function setRefreshBusy(on) { var b = $('#refreshDataBtn'); if (!b) return; b.classList.toggle('busy', on); b.disabled = on; b.setAttribute('aria-busy', on ? 'true' : 'false'); }
  function balls(nums, compact) {
    if (!nums || !nums.length) return '<span class="data-empty">暂无开奖数据</span>';
    var out = '';
    nums.forEach(function (x, i) {
      if (i === 6) out += '<i class="ball plus">+</i>';
      out += '<span class="ball ' + waveClass(x.c) + '" title="' + esc(x.z || '') + '">' + esc(x.c) + '</span>';
    });
    return '<span class="ball-row">' + out + '</span>';
  }
  function catTabs(active) {
    var items = [['lotteryhall','彩票','#/lotteryhall'],['trend','走势','#/trend'],['history','开奖记录','#/history'],['rank','排行榜','#/rank']];
    return '<nav class="cat-tabs">' + items.map(function (x) { return '<a class="' + (active === x[0] ? 'on' : '') + '" href="' + x[2] + '">' + x[1] + '</a>'; }).join('') + '</nav>';
  }
  function banner() {
    return '<section class="swiper" id="hallBanner">' +
      '<div class="slide s1 on"><small>THREE GAMES · 真实数据</small><h2>今晚，好运开场</h2><p>新港 / 新澳 / 香港 · 开奖与倒计时实时查看</p><a class="slide-btn" href="#/history">查看开奖 →</a></div>' +
      '<div class="slide s2"><small>TREND · 近 12 期</small><h2>看懂每一条走势</h2><p>波色、生肖、号码分布，一眼看清</p><a class="slide-btn" href="#/trend">去看走势 →</a></div>' +
      '<div class="slide s3"><small>LEADERBOARD · 演示榜单</small><h2>高手，都在这里</h2><p>连中纪录与命中率，示例展示</p><a class="slide-btn" href="#/rank">查看排行 →</a></div>' +
      '<div class="dots">' + [0,1,2].map(function (i) { return '<button type="button" data-slide="' + i + '" class="' + (i === 0 ? 'on' : '') + '" aria-label="第 ' + (i + 1) + ' 张"></button>'; }).join('') + '</div></section>';
  }
  function notice() {
    return '<div class="notice"><span class="notice-ico">◖</span><div class="notice-track"><span>演示站点 · 数据为样例 · 不构成任何投注建议 <em>｜ 新港 / 新澳 / 香港数据已接入</em></span></div><button class="notice-more" type="button" data-demo="公告为演示内容">更多 ›</button></div>';
  }
  function quickGrid() {
    return '<div class="quick-grid">' + QUICK.map(function (q) {
      var inner = '<span class="qico">' + q.i + '</span>' + q.t;
      return q.href ? '<a class="quick-item" style="--qc:' + q.c + '" href="' + q.href + '">' + inner + '</a>' : '<button class="quick-item" style="--qc:' + q.c + '" type="button" data-demo="' + esc(q.action) + '">' + inner + '</button>';
    }).join('') + '</div>';
  }
  function realCell(id) {
    var g = state.games[id], def = DEFS[id];
    if (!g) return '<div class="game-cell"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><span class="game-name">' + def.name + '</span><span class="game-issue">读取中…</span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><span class="game-name">' + def.name + '</span><span class="game-issue">第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
  }
  function placeholderCell(x) {
    return '<button class="game-cell placeholder" type="button" data-demo="「' + esc(x.name) + '」为演示彩种，暂未接入数据"><span class="game-circle" style="--gc:' + x.color + '">' + x.icon + '</span><span class="game-name">' + x.name + '</span><span class="game-issue">演示彩种</span></button>';
  }
  function hotGrid() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">热门彩种</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid">' + ORDER.map(realCell).join('') + PLACEHOLDERS.map(placeholderCell).join('') + '</div></section>';
  }
  function hallPage() {
    return banner() + notice() + quickGrid() + catTabs('lotteryhall') + hotGrid() +
      '<div class="mini-note">数据来自主站只读接口 · 每 30 秒自动刷新 · 仅作演示</div>';
  }
  function gameStats(g) {
    var counts = { '红': 0, '蓝': 0, '绿': 0 }, zc = {};
    (g.history || []).slice(0, 10).forEach(function (h) { h.nums.forEach(function (b) { counts[colorOf(b.c)]++; if (b.z) zc[b.z] = (zc[b.z] || 0) + 1; }); });
    var total = Math.max(1, counts['红'] + counts['蓝'] + counts['绿']);
    var bars = ['红','蓝','绿'].map(function (c) { var n = counts[c]; return '<div class="wave-stat"><span class="wave-dot ' + (c === '红' ? 'r' : c === '蓝' ? 'b' : 'g') + '"></span><b>' + c + '波</b><div class="wave-bar"><i class="' + (c === '红' ? 'r' : c === '蓝' ? 'b' : 'g') + '" style="width:' + Math.round(n / total * 100) + '%"></i></div><em>' + n + '</em></div>'; }).join('');
    var zs = Object.keys(zc).sort(function (a, b) { return zc[b] - zc[a]; }).slice(0, 8).map(function (z) { return '<span class="zodiac-chip">' + esc(z) + ' <b>' + zc[z] + '</b></span>'; }).join('') || '<span class="data-empty">暂无可统计生肖</span>';
    return '<div class="wave-stats">' + bars + '</div><div class="zodiac-row">' + zs + '</div>';
  }
  function gamePage(id) {
    var def = DEFS[id]; if (!def) return hallPage();
    var g = state.games[id];
    if (!g) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-last card"><div class="data-empty">正在读取 ' + def.name + ' 数据…</div></div>';
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + shortIssue(h.issue) + '期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<section class="detail-last"><div class="detail-label">上期开奖 <span>第 ' + shortIssue(last.issue) + ' 期</span></div><div class="detail-balls">' + balls(last.nums) + '</div><div class="wave-legend"><span><i class="r"></i>红波</span><span><i class="b"></i>蓝波</span><span><i class="g"></i>绿波</span><span class="special-legend">+ 后为特码</span></div></section>' +
      '<section class="next-card"><div><span>下期开奖</span><b>第 ' + shortIssue(g.nextIssue) + ' 期</b><em>' + g.timeCfg.time + (id === 'hk' ? ' · 周日' : ' · 每日') + '</em></div><strong data-cd="' + id + '">' + countdownText(g) + '</strong></section>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">波色 / 生肖统计</h2><span class="section-link">近 10 期</span></div><div class="trend-panel">' + gameStats(g) + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">近 10 期开奖</h2><a class="section-link" href="#/history">全部记录 ›</a></div><div class="detail-history">' + rows + '</div></div>' +
      '<div class="mini-note">数据来自主站只读接口；号码、特码与开奖时间以主站为准。</div>';
  }
  function historyPage() {
    var chips = ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('');
    var g = state.games[historyGame];
    var rows = (g && g.history || []).slice(0, 20).map(function (h) { return '<tr><td class="iss">' + shortIssue(h.issue) + '</td><td>' + DEFS[historyGame].name + '</td><td>' + balls(h.nums, true) + '</td><td><span class="status">● 已开奖</span></td></tr>'; }).join('');
    if (!rows) rows = '<tr><td colspan="4"><span class="data-empty">数据加载中…</span></td></tr>';
    return catTabs('history') + '<div class="page-head"><div><div class="page-kicker">RESULTS</div><h1 class="page-title">开奖记录</h1><div class="page-sub">主站真实数据 · 当前可获取 ' + ((g && g.history.length) || 0) + ' 期</div></div><span class="demo-pill">REAL</span></div>' +
      '<div class="chips">' + chips + '</div><div style="padding:0 10px"><div class="table-scroll"><table class="hist"><thead><tr><th>期号</th><th>彩种</th><th>开奖号码</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="更多记录为演示入口">加载更多</button></div><div class="mini-note">主站当前可获取近 ' + ((g && g.history.length) || 0) + ' 期；开奖号码与主站一致。</div>';
  }
  function trendPage() {
    var g = state.games[historyGame] || state.games.newhk;
    var counts = { '红':0,'蓝':0,'绿':0 }, total = 0;
    (g && g.history || []).slice(0, 12).forEach(function (h) { h.nums.forEach(function (b) { counts[colorOf(b.c)]++; total++; }); });
    total = Math.max(1, total);
    var bars = ['红','蓝','绿'].map(function (c) { return '<div class="bar-item"><div class="bar" style="height:' + Math.max(8, Math.round(counts[c] / total * 100)) + '%"></div><i>' + c + '波</i></div>'; }).join('');
    var cells = '';
    for (var n = 1; n <= 49; n++) { var hit = (g && g.history || []).slice(0,12).some(function (h) { return h.nums.some(function (b) { return parseInt(b.c,10) === n; }); }); cells += '<span class="num-cell ' + (hit ? 'hot' : '') + '">' + pad(n) + '</span>'; }
    return catTabs('trend') + '<div class="page-head"><div><div class="page-kicker">TREND</div><h1 class="page-title">号码走势</h1><div class="page-sub">' + esc(DEFS[historyGame].name) + ' · 近 12 期</div></div><span class="demo-pill">REAL</span></div>' +
      '<div class="chips">' + ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('') + '</div>' +
      '<div class="trend-panel"><div class="trend-head"><b>近 12 期波色分布</b><span>共 ' + total + ' 个号码</span></div><div class="bars">' + bars + '</div><div class="num-grid">' + cells + '</div><div class="legend"><span><i style="background:#DC3C41"></i>近 12 期出现</span><span><i style="background:#eee"></i>未出现</span></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="完整走势为演示入口">查看完整走势</button></div><div class="mini-note">走势基于主站近 12 期真实开奖号码计算。</div>';
  }
  function rankPage() {
    var top = RANKS.slice(0, 3);
    var podium = [top[1], top[0], top[2]].map(function (r) { return '<div class="podium-item ' + (r.name === top[0].name ? 'first' : '') + '">' + (r.name === top[0].name ? '<span class="crown">♛</span>' : '') + '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><b>' + esc(r.name) + '</b><span>' + esc(r.tag.split(' · ')[0]) + '</span><strong>' + esc(r.value) + '</strong></div>'; }).join('');
    return catTabs('rank') + '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">演示榜单 · 每日更新样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="podium">' + podium + '</div><div class="rank-list">' + RANKS.slice(3).map(function (r, i) { return '<div class="rank-row"><span class="rank-no">' + (i + 4) + '</span><span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><div class="rank-info"><b>' + esc(r.name) + '</b><span>' + esc(r.tag) + '</span></div><div class="rank-val"><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></div></div>'; }).join('') + '</div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="榜单为演示内容，关注功能暂未开放">关注榜单</button></div><div class="mini-note">排名、连中与命中率均为虚构样例，不构成任何建议。</div>';
  }
  function mePage() {
    return catTabs('') + '<div class="page-head"><div><div class="page-kicker">PROFILE</div><h1 class="page-title">我的</h1><div class="page-sub">游客模式 · 演示账号</div></div></div>' +
      '<section class="profile"><span class="avatar">游</span><div class="profile-main"><b>游客</b><span>当前为演示游客，无需登录</span><span class="tag">DEMO ACCOUNT</span></div></section>' +
      '<div class="demo-account-note"><b>演示账户</b><span>本站不提供余额、充值、提现、登录或任何真实交易。</span></div>' +
      '<div class="menu"><button class="menu-row" type="button" data-demo="安全中心为演示入口"><span class="menu-ico">⌁</span><span class="txt">安全中心</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="消息中心为演示入口"><span class="menu-ico">◌</span><span class="txt">消息中心</span><em>0 条</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="客服为演示入口"><span class="menu-ico">?</span><span class="txt">帮助与客服</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="关于页面：演示站点，数据来自主站只读接口"><span class="menu-ico">i</span><span class="txt">关于本站</span><em>v0.3</em><span class="arrow">›</span></button></div>' +
      '<div class="mini-note">这是纯展示空壳站，不提供真实账号、余额、充值、提现或下注服务。</div>';
  }
  var ROUTES = { lotteryhall: hallPage, history: historyPage, trend: trendPage, rank: rankPage, me: mePage };
  var TITLES = { lotteryhall: '彩票大厅', history: '开奖记录', trend: '号码走势', rank: '高手排行', me: '我的' };
  function currentRoute() {
    var h = String(location.hash || '').replace(/^#\/?/, ''), parts = h.split('/');
    if (parts[0] === 'game' && DEFS[parts[1]]) return { name: 'game', id: parts[1] };
    return { name: ROUTES[parts[0]] ? parts[0] : 'lotteryhall', id: null };
  }
  function setBottomTab(name) { var tab = name === 'game' ? 'lotteryhall' : name; $$('.bottomtab a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-tab') === tab); }); }
  function updateCountdowns() { $$('[data-cd]').forEach(function (el) { var g = state.games[el.getAttribute('data-cd')]; if (g) el.textContent = countdownText(g); }); }
  function startBanner() {
    clearInterval(bannerTimer);
    if (!document.getElementById('hallBanner')) return;
    bannerTimer = setInterval(function () {
      var slides = $$('#hallBanner .slide'), dots = $$('#hallBanner .dots button');
      if (!slides.length) return;
      slides[bannerIndex].classList.remove('on'); dots[bannerIndex] && dots[bannerIndex].classList.remove('on');
      bannerIndex = (bannerIndex + 1) % slides.length;
      slides[bannerIndex].classList.add('on'); dots[bannerIndex] && dots[bannerIndex].classList.add('on');
    }, 4000);
  }
  function render(keepScroll) {
    var r = currentRoute(), view = $('#view'); if (!view) return;
    if (r.name === 'game') view.innerHTML = gamePage(r.id); else view.innerHTML = ROUTES[r.name] ? ROUTES[r.name]() : hallPage();
    setBottomTab(r.name);
    document.title = (r.name === 'game' ? DEFS[r.id].name + '开奖' : TITLES[r.name]) + ' · 彩票大厅（演示）';
    if (!keepScroll) window.scrollTo(0, 0);
    clearInterval(countdownTimer); updateCountdowns(); countdownTimer = setInterval(updateCountdowns, 1000);
    startBanner();
  }
  function showToast(msg) { var el = $('#toast'); if (!el) return; el.textContent = msg || '演示功能，敬请期待'; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200); }
  function showModal(msg) { var m = $('#modal'); if (!m) return; $('#modal-body').textContent = msg || '当前为展示站点，不提供充值、下注或账号登录。'; m.hidden = false; modalOpen = true; }
  function closeModal() { var m = $('#modal'); if (m) m.hidden = true; modalOpen = false; }
  document.addEventListener('click', function (e) {
    var demo = e.target.closest('[data-demo]'); if (demo) { e.preventDefault(); showModal(demo.getAttribute('data-demo')); return; }
    if (e.target.closest('[data-close-modal]')) { closeModal(); return; }
    var hg = e.target.closest('[data-history-game]'); if (hg) { historyGame = hg.getAttribute('data-history-game'); render(); return; }
    var dot = e.target.closest('[data-slide]'); if (dot) { var i = parseInt(dot.getAttribute('data-slide'), 10); var slides = $$('#hallBanner .slide'), dots = $$('#hallBanner .dots button'); slides.forEach(function (s, j) { s.classList.toggle('on', j === i); }); dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); bannerIndex = i; return; }
    if (e.target.closest('#refreshDataBtn')) { loadData(false); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', function () { render(); });
  if (!location.hash) location.hash = '#/lotteryhall';
  render(); loadData(true); setInterval(function () { if (!document.hidden) loadData(true); }, 30000);
})();
