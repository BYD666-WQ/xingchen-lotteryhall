(function () {
  'use strict';

  var BASES = [
    'https://byd666-wq.github.io/xingchen-caixun/',
    'https://cdn.jsdelivr.net/gh/BYD666-WQ/xingchen-caixun@main/',
    'https://raw.githubusercontent.com/BYD666-WQ/xingchen-caixun/main/'
  ];
  var CONFIG = window.LH_GAMES || [
    { id:'newhk', name:'新港', provider:'主站', enabled:true, icon:'港', color:'#e6a62f', drawKey:'newhk', desc:'每日 21:34 · 主站新港' },
    { id:'newmo', name:'新澳', provider:'主站', enabled:true, icon:'澳', color:'#3d8ed0', drawKey:'newmo', desc:'每日 21:30 · 主站新澳' },
    { id:'hk', name:'香港', provider:'主站', enabled:true, icon:'香', color:'#d94b62', drawKey:'hk', desc:'周日 21:30 · 主站香港' },
    { id:'oldmo', name:'老澳', provider:'待接入', enabled:false, icon:'老', color:'#8d98aa', note:'老澳数据待接入，接入后自动开放' }
  ];
  var DEFS = {};
  CONFIG.forEach(function (g) { DEFS[g.id] = g; });
  var ORDER = CONFIG.filter(function (g) { return g.enabled; }).map(function (g) { return g.id; });
  var PLACEHOLDERS = CONFIG.filter(function (g) { return !g.enabled; });
  var RED = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
  var BLUE = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
  var KEY = 'Xc9vF2026';
  var state = { games: {}, config: {}, attrs: {}, updated: 0, error: '', loading: false };
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
    { t: '开奖', icon: 'award', i: '奖', c: 'linear-gradient(135deg,#ff9b47,#ed5b3e)', href: '#/history' },
    { t: '走势', icon: 'trend', i: '势', c: '#4ca4e8', href: '#/trend' },
    { t: '图谱', icon: 'chart', i: '谱', c: '#6e8ee8', action: '图谱为演示入口，暂未开放' },
    { t: '排行榜', icon: 'rank', i: '榜', c: 'linear-gradient(135deg,#ff6a6e,#dc3c41)', href: '#/rank' },
    { t: '资料', icon: 'book', i: '资', c: '#3e9fe0', action: '资料库为演示入口，暂未开放' },
    { t: '玩法说明', icon: 'rules', i: '规', c: '#58b5a6', href: '#/howto' },
    { t: '客服', icon: 'support', i: '服', c: '#4f8fe0', action: '客服为演示入口' },
    { t: '活动', icon: 'activity', i: '活', c: 'linear-gradient(135deg,#ff686b,#dc3c41)', action: '活动为演示入口，不产生真实奖励' }
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
  function setData(manual, draw, cfg, attrs) {
    var now = Date.now(), games = {};
    var m = parseManual(manual, now); if (m) games.newhk = Object.assign({}, DEFS.newhk, m);
    var dm = parseDraw(draw, 'Macau'); if (dm) games.newmo = Object.assign({}, DEFS.newmo, dm);
    var dh = parseDraw(draw, 'HongKong'); if (dh) games.hk = Object.assign({}, DEFS.hk, dh);
    ORDER.forEach(function (id) { if (games[id]) games[id].timeCfg = timeCfg(cfg, DEFS[id].drawKey); });
    ORDER.forEach(function (id) { if (!games[id] && state.games[id]) games[id] = state.games[id]; });
    state.games = games; state.config = cfg || state.config || {};
    var amap = {};(attrs && attrs.rows || []).forEach(function (r) { var n = parseInt(r.num, 10); if (n) amap[n] = { z: r.zodiac || '', color: r.color || colorOf(n) }; });
    if (Object.keys(amap).length) state.attrs = amap; state.updated = Date.now(); state.error = '';
  }
  function loadData(silent) {
    if (state.loading) return Promise.resolve();
    state.loading = true; setRefreshBusy(true);
    var jobs = [fetchOne('data/manual-draw.json'), fetchOne('data/draw.json'), fetchOne('data/site-config.json'), fetchOne('data/num-attrs.json')];
    var all = Promise.allSettled ? Promise.allSettled(jobs) : Promise.all(jobs.map(function (p) { return p.then(function (v) { return { status: 'fulfilled', value: v }; }, function (e) { return { status: 'rejected', reason: e }; }); }));
    return all.then(function (res) {
      var manual = res[0] && res[0].status === 'fulfilled' ? res[0].value : null;
      var draw = res[1] && res[1].status === 'fulfilled' ? res[1].value : null;
      var cfg = res[2] && res[2].status === 'fulfilled' ? res[2].value : null;
      var attrs = res[3] && res[3].status === 'fulfilled' ? res[3].value : null;
      if (!manual && !draw && !cfg && !attrs) throw new Error('数据源不可达');
      setData(manual, draw, cfg, attrs);
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
  function emptyState(text) {
    return '<div class="empty-state"><svg viewBox="0 0 120 96" aria-hidden="true"><use href="#i-empty"></use></svg><span>' + esc(text || '暂无数据') + '</span></div>';
  }
  function catTabs(active) {
    var items = [['lotteryhall','彩票','#/lotteryhall'],['trend','走势','#/trend'],['history','开奖记录','#/history'],['rank','排行榜','#/rank']];
    return '<nav class="cat-tabs">' + items.map(function (x) { return '<a class="' + (active === x[0] ? 'on' : '') + '" href="' + x[2] + '">' + x[1] + '</a>'; }).join('') + '</nav>';
  }
  function banner() {
    return '<section class="swiper" id="hallBanner">' +
      '<div class="slide s1 on"><svg class="slide-art" viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"><circle cx="160" cy="76" r="52"/><circle cx="160" cy="76" r="34"/><path d="M40 140c30-25 57-26 85-8s45 12 65-9"/><path d="M118 38l7 18 18 7-18 7-7 18-7-18-18-7 18-7 7-18z"/><circle cx="56" cy="56" r="2.5" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="194" cy="136" r="2" fill="rgba(255,255,255,.55)" stroke="none"/></g></svg><small>THREE GAMES · 真实数据</small><h2>今晚，好运开场</h2><p>新港 / 新澳 / 香港 · 开奖与倒计时实时查看</p><a class="slide-btn" href="#/history">查看开奖 →</a></div>' +
      '<div class="slide s2"><svg class="slide-art" viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"><path d="M36 138l28-38 25 17 30-47 26 22 28-39"/><path d="M36 148h148M36 116h148" opacity=".35"/><circle cx="64" cy="100" r="3" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="119" cy="70" r="3" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="173" cy="53" r="3" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="160" cy="84" r="36" opacity=".35"/></g></svg><small>TREND · 近 12 期</small><h2>看懂每一条走势</h2><p>波色、生肖、号码分布，一眼看清</p><a class="slide-btn" href="#/trend">去看走势 →</a></div>' +
      '<div class="slide s3"><svg class="slide-art" viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"><path d="M110 36l10 22 24 3-18 17 5 24-21-12-21 12 5-24-18-17 24-3 10-22z"/><path d="M62 52c-15 8-23 21-23 37M158 52c15 8 23 21 23 37"/><circle cx="110" cy="94" r="58" opacity=".25"/><path d="M38 145h144" opacity=".35"/><circle cx="54" cy="127" r="2" fill="rgba(255,255,255,.6)" stroke="none"/><circle cx="168" cy="127" r="2" fill="rgba(255,255,255,.6)" stroke="none"/></g></svg><small>LEADERBOARD · 演示榜单</small><h2>高手，都在这里</h2><p>连中纪录与命中率，示例展示</p><a class="slide-btn" href="#/rank">查看排行 →</a></div>' +
      '<div class="dots">' + [0,1,2].map(function (i) { return '<button type="button" data-slide="' + i + '" class="' + (i === 0 ? 'on' : '') + '" aria-label="第 ' + (i + 1) + ' 张"></button>'; }).join('') + '</div></section>';
  }
  function notice() {
    return '<div class="notice"><span class="notice-ico">◖</span><div class="notice-track"><span>演示站点 · 数据为样例 · 不构成任何投注建议 <em>｜ 新港 / 新澳 / 香港数据已接入</em></span></div><button class="notice-more" type="button" data-demo="公告为演示内容">更多 ›</button></div>';
  }
  function quickGrid() {
    return '<div class="quick-grid">' + QUICK.map(function (q) {
      var inner = '<span class="quick-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + q.icon + '"></use></svg></span>' + q.t;
      return q.href ? '<a class="quick-item" style="--qc:' + q.c + '" href="' + q.href + '">' + inner + '</a>' : '<button class="quick-item" style="--qc:' + q.c + '" type="button" data-demo="' + esc(q.action) + '">' + inner + '</button>';
    }).join('') + '</div>';
  }
  function realCell(id) {
    var g = state.games[id], def = DEFS[id];
    if (!g) return '<div class="game-cell skeleton"><span class="sk sk-badge"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
  }
  function placeholderCell(x) {
    var note = x.note || (x.provider === '待接入' ? '数据待接入' : '演示彩种');
    return '<a class="game-cell placeholder" href="#/game/' + x.id + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + x.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + x.name + '</span><span class="game-issue">' + esc(note) + '</span></a>';
  }
  function hotGrid() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">热门彩种</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid">' + ORDER.map(realCell).join('') + '</div><a class="pending-strip" href="#/game/oldmo"><span class="pending-dot"></span><b>老澳</b><em>· 数据待接入</em><strong>了解 ›</strong></a></section>';
  }
  function hallPage() {
    return banner() + notice() + pointsBar() + quickGrid() + catTabs('lotteryhall') + hotGrid() +
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
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-head"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span></span><div><div class="page-kicker">' + esc(def.name) + ' · 占位</div><h1 class="page-title">' + esc(def.name) + '</h1><div class="page-sub">' + esc(def.provider || '演示占位') + '</div></div></div><div class="detail-last card">' + emptyState(def.note || '数据待接入，敬请期待') + '</div>';
    var g = state.games[id];
    if (!g) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-last card"><div class="data-empty">正在读取 ' + def.name + ' 数据…</div></div>';
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + shortIssue(h.issue) + '期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<div class="detail-actions"><a class="action-btn action-primary" href="#/bet/' + id + '">立即投注</a><a class="action-btn action-ghost" href="#/howto">玩法说明</a></div>' +
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
    if (!rows) rows = '<tr><td colspan="4">' + emptyState('正在读取主站数据…') + '</td></tr>';
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
      '<div class="demo-account-note"><b>演示账户</b><span>本站不提供真实交易、账户或提现服务。</span></div>' +
      '<div class="menu"><button class="menu-row" type="button" data-demo="安全中心为演示入口"><span class="menu-ico">⌁</span><span class="txt">安全中心</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="消息中心为演示入口"><span class="menu-ico">◌</span><span class="txt">消息中心</span><em>0 条</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="客服为演示入口"><span class="menu-ico">?</span><span class="txt">帮助与客服</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="关于页面：演示站点，数据来自主站只读接口"><span class="menu-ico">i</span><span class="txt">关于本站</span><em>v0.3</em><span class="arrow">›</span></button></div>' +
      '<div class="mini-note">这是纯展示空壳站，不提供真实账号、交易或下注服务。</div>';
  }
  var ZODIACS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  var HOWTO = [
    { id:'special', name:'特码', odds:'48.8', rule:'选 1 个号码，开奖特码（第 7 个号码）与你选的号码相同即中。', example:'选 01，开奖特码为 01 → 命中。' },
    { id:'one-zodiac', name:'一肖', odds:'4.9', rule:'选 1 个生肖，开奖特码的生肖与你选的生肖相同即中。', example:'选「马」，特码为 13（马）→ 命中。' },
    { id:'two-side', name:'两面', odds:'1.96', rule:'按特码的大小、单双、合数单双或尾数大小判断，选对即中。', example:'选「大」，特码 41（大）→ 命中。' },
    { id:'color', name:'色波', odds:'2.8', rule:'按特码的波色判断，红波 / 蓝波 / 绿波三选一，选对即中。', example:'选「红波」，特码 34（红波）→ 命中。' },
    { id:'special-zodiac', name:'特肖', odds:'4.9', rule:'专门判断特码生肖；与一肖的区别是只结算特码这一位。', example:'选「兔」，特码 16（兔）→ 命中。' },
    { id:'regular', name:'正码 1-6', odds:'7.8', rule:'从正码 1 至正码 6 中选择一个位置；演示结算规则：该位置号码为单数即算命中。', example:'选「正码一」，第 1 个正码开出 16 → 命中。' },
    { id:'miss', name:'自选不中', odds:'2.0', rule:'选 1 个号码，开奖的 7 个号码中都不包含它即中。', example:'选 49，开奖号码没有 49 → 命中。' },
    { id:'combo', name:'连肖', odds:'3.2 起', rule:'选择 2–5 个生肖的组合，开奖特码生肖在组合内即中；组合越长赔率越高。', example:'选「马 + 兔」，特码为马 → 命中。' }
  ];
  var ODDS = { special:48.8, oneZodiac:4.9, twoSide:1.96, color:2.8, specialZodiac:4.9, regular:7.8, miss:2.0, combo2:3.2, combo3:5.5, combo4:9.8, combo5:18.0 };
  var BET_CATS = [
    { id:'special', name:'特码', short:'特' },
    { id:'one-zodiac', name:'一肖', short:'肖' },
    { id:'two-side', name:'两面', short:'两' },
    { id:'color', name:'色波', short:'波' },
    { id:'special-zodiac', name:'特肖', short:'特' },
    { id:'regular', name:'正码1-6', short:'正' },
    { id:'miss', name:'自选不中', short:'不' },
    { id:'combo', name:'连肖', short:'连' }
  ];
  var betState = { game:'newhk', cat:'special', tab:'credit', qty:'1', sel:{} };
  var POINTS_KEY = 'lh-demo-points', BETS_KEY = 'lh-demo-bets';
  function loadPoints() { var n = parseInt(localStorage.getItem(POINTS_KEY), 10); return isFinite(n) ? n : 10000; }
  function savePoints(n) { try { localStorage.setItem(POINTS_KEY, String(n)); } catch (e) {} }
  function loadBets() { try { var b = JSON.parse(localStorage.getItem(BETS_KEY) || '[]'); return Array.isArray(b) ? b : []; } catch (e) { return []; } }
  function saveBets() { try { localStorage.setItem(BETS_KEY, JSON.stringify(bets)); } catch (e) {} }
  var points = loadPoints();
  var bets = loadBets();
  function pointsBar() { return '<div class="points-bar"><span>演示积分</span><b data-points-value>' + points + '</b><a class="points-help" href="#/howto">玩法说明</a><button type="button" data-reset-points>重置积分</button></div>'; }
  function updatePointsUI() { $$('[data-points-value]').forEach(function (el) { el.textContent = points; }); }
  function attrFor(n) { return state.attrs[parseInt(n,10)] || { z:'', color:colorOf(n) }; }
  function isSel(k) { return !!betState.sel[k]; }
  function selectedCount() { return Object.keys(betState.sel).length; }
  function totalNotes() { var q = parseInt(betState.qty, 10); return (isFinite(q) && q > 0) ? selectedCount() * q : 0; }
  function totalCost() { return totalNotes() * 2; }
  function betHelp(cat) { return '<a class="help-link" href="#/howto/' + cat + '" aria-label="玩法说明">?</a>'; }
  function zodiacGrid(prefix, odds) {
    return '<div class="zodiac-grid">' + ZODIACS.map(function (z) {
      var key = prefix + '-' + z;
      return '<button type="button" class="bet-zodiac ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + z + '肖" data-odds="' + odds + '"><span class="zcircle">' + z + '</span><em>' + odds + '</em></button>';
    }).join('') + '</div>';
  }
  function numberGrid(prefix, odds) {
    var out = '';
    for (var i = 1; i <= 49; i++) {
      var c = pad(i), a = attrFor(i), key = prefix + '-' + c, w = a.color === '红' ? 'r' : a.color === '蓝' ? 'b' : 'g';
      out += '<button type="button" class="bet-num c-' + w + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + c + ' ' + (a.z || '') + '" data-odds="' + odds + '"><b>' + c + '</b><i>' + esc(a.z || '') + '</i><em>' + odds + '</em></button>';
    }
    return '<div class="num-bet-grid">' + out + '</div>';
  }
  function optionGrid(items, prefix) {
    return '<div class="bet-options">' + items.map(function (x) {
      var key = prefix + '-' + x.k;
      return '<button type="button" class="bet-option ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + esc(x.n) + '" data-odds="' + x.o + '"' + (x.z ? ' data-zodiacs="' + x.z + '"' : '') + '><span>' + esc(x.n) + '</span><em>' + x.o + '</em></button>';
    }).join('') + '</div>';
  }
  function betContent(cat) {
    if (cat === 'special') return '<div class="bet-content-head"><div><h2>特码</h2><p>选一个号码，命中开奖特码即中</p></div>' + betHelp('special') + '</div>' + zodiacGrid('special-z', ODDS.oneZodiac) + numberGrid('special-n', ODDS.special);
    if (cat === 'one-zodiac') return '<div class="bet-content-head"><div><h2>一肖</h2><p>选一个生肖，命中特码生肖即中</p></div>' + betHelp('one-zodiac') + '</div>' + zodiacGrid('one-z', ODDS.oneZodiac);
    if (cat === 'special-zodiac') return '<div class="bet-content-head"><div><h2>特肖</h2><p>只判断特码生肖，选一个生肖</p></div>' + betHelp('special-zodiac') + '</div>' + zodiacGrid('spz-z', ODDS.specialZodiac);
    if (cat === 'two-side') return '<div class="bet-content-head"><div><h2>两面</h2><p>大小 / 单双 / 合单合双 / 尾数大小</p></div>' + betHelp('two-side') + '</div>' + optionGrid([{k:'big',n:'大',o:'1.96'},{k:'small',n:'小',o:'1.96'},{k:'odd',n:'单',o:'1.96'},{k:'even',n:'双',o:'1.96'},{k:'sum-odd',n:'合单',o:'1.96'},{k:'sum-even',n:'合双',o:'1.96'},{k:'tail-big',n:'尾大',o:'1.96'},{k:'tail-small',n:'尾小',o:'1.96'}], 'two');
    if (cat === 'color') return '<div class="bet-content-head"><div><h2>色波</h2><p>特码波色三选一</p></div>' + betHelp('color') + '</div>' + optionGrid([{k:'r',n:'红波',o:'2.8'},{k:'b',n:'蓝波',o:'2.8'},{k:'g',n:'绿波',o:'2.8'}], 'color');
    if (cat === 'regular') return '<div class="bet-content-head"><div><h2>正码 1-6</h2><p>选择正码位置，按该位置开奖号码结算</p></div>' + betHelp('regular') + '</div>' + optionGrid([{k:'1',n:'正码一',o:'7.8'},{k:'2',n:'正码二',o:'7.8'},{k:'3',n:'正码三',o:'7.8'},{k:'4',n:'正码四',o:'7.8'},{k:'5',n:'正码五',o:'7.8'},{k:'6',n:'正码六',o:'7.8'}], 'reg');
    if (cat === 'miss') return '<div class="bet-content-head"><div><h2>自选不中</h2><p>选一个号码，7 个开奖号码都不包含它即中</p></div>' + betHelp('miss') + '</div>' + numberGrid('miss-n', ODDS.miss);
    return '<div class="bet-content-head"><div><h2>连肖</h2><p>选一组生肖组合，特码生肖在组合内即中</p></div>' + betHelp('combo') + '</div>' + optionGrid([{k:'c1',n:'马 + 兔',o:'3.2',z:'马,兔'},{k:'c2',n:'龙 + 蛇 + 猴',o:'5.5',z:'龙,蛇,猴'},{k:'c3',n:'鼠 + 牛 + 虎 + 猪',o:'9.8',z:'鼠,牛,虎,猪'},{k:'c4',n:'马 + 兔 + 龙 + 蛇 + 猴',o:'18.0',z:'马,兔,龙,蛇,猴'}], 'combo');
  }
  function betBalls(nums) {
    if (!nums) return '';
    var out = '', sum = 0;
    nums.forEach(function (x, i) {
      sum += parseInt(x.c, 10) || 0;
      if (i === 6) out += '<i class="bet-plus">+</i>';
      out += '<span class="bet-ball ' + waveClass(x.c) + '"><b>' + esc(x.c) + '</b><small>' + esc(x.z || '') + '</small></span>';
    });
    return { html:out, sum:sum };
  }
  function betPage(id) {
    var def = DEFS[id] || DEFS.newhk, g = state.games[id];
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + emptyState(def.note || '该彩种数据待接入');
    if (!g) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + emptyState('正在读取 ' + def.name + ' 数据…');
    var open = betBalls(g.last.nums);
    var title = def.name + '六合彩';
    var credit = betState.tab === 'credit';
    var cat = betState.cat || 'special';
    var qty = parseInt(betState.qty, 10) || 1;
    var cost = totalNotes() * 2;
    var my = '<div class="my-bets"><div class="my-bets-head"><h2>模拟注单</h2><span>本地记录 · 演示积分</span></div>' + (bets.length ? bets.slice(0, 4).map(function (b) {
      var st = b.status === 'pending' ? '<em class="pending">待开奖</em>' : (b.payout > 0 ? '<em class="win">已结算 +' + b.payout + ' 积分</em>' : '<em class="lost">已结算 · 未中</em>');
      return '<div class="my-bet"><div class="my-bet-top"><span>第 ' + shortIssue(b.targetIssue) + ' 期</span>' + st + '</div><div class="my-bet-sub">' + b.labels + ' · ' + b.qty + ' 注/项 · 消耗 ' + b.cost + ' 积分</div></div>';
    }).join('') : '<div class="my-bet-empty">还没有模拟注单，选号后可记录一张本地注单</div>') + '</div>';
    return '<a class="back-link" href="#/game/' + id + '">‹ 返回 ' + def.name + '详情</a>' + pointsBar() +
      '<div class="bet-head"><div><span class="bet-kicker">模拟投注 · 仅演示</span><h1>' + title + '</h1><div class="bet-period">第 <b>' + shortIssue(g.last.issue) + '</b> 期 · 下期 ' + shortIssue(g.nextIssue) + '</div></div><div class="bet-clock">投注中<br><b data-cd="' + id + '">' + countdownText(g) + '</b></div></div>' +
      '<div class="bet-open"><div class="bet-open-label">上期开奖 <span>第 ' + shortIssue(g.last.issue) + ' 期</span></div><div class="bet-open-balls">' + open.html + '<span class="bet-sum">总和 <b>' + open.sum + '</b></span></div></div>' +
      '<div class="bet-tabs"><button type="button" class="' + (credit ? 'on' : '') + '" data-bet-tab="credit">信用</button><button type="button" class="' + (!credit ? 'on' : '') + '" data-bet-tab="path">路子图</button></div>' +
      (credit ? '<div class="bet-layout"><div class="bet-cats">' + BET_CATS.map(function (c) { return '<button type="button" class="' + (cat === c.id ? 'on' : '') + '" data-bet-cat="' + c.id + '"><span>' + c.short + '</span>' + c.name + '</button>'; }).join('') + '</div><div class="bet-center">' + betContent(cat) + '</div></div>' : '<div class="bet-path">' + emptyState('路子图演示占位，暂未开放') + '</div>') +
      '<div class="odds-note">演示赔率，非真实 · 每注固定 2 演示积分 · 不构成任何投注建议</div>' + my +
      '<div class="bet-bar"><div class="bet-bar-row"><span class="bet-label">注数</span>' + [10,20,50,100].map(function (n) { return '<button type="button" class="amount-chip ' + (String(qty) === String(n) ? 'on' : '') + '" data-qty="' + n + '">' + n + '</button>'; }).join('') + '<input id="betQty" type="text" inputmode="numeric" placeholder="自定义" value="' + esc(qty) + '"></div><div class="bet-bar-row"><span class="bet-selected">已选 <b data-bet-count>' + totalNotes() + '</b> 注 · 需 <b data-bet-cost>' + cost + '</b> 积分</span><button type="button" class="bet-clear" data-bet-clear>清空</button><button type="button" class="bet-submit" data-bet-submit>立即投注</button></div></div>';
  }
  function howtoPage(anchor) {
    var active = anchor || 'special';
    var nav = HOWTO.map(function (h) { return '<a class="' + (h.id === active ? 'on' : '') + '" href="#/howto/' + h.id + '">' + h.name + '</a>'; }).join('');
    var blocks = HOWTO.map(function (h) {
      return '<section class="howto-block" id="howto-' + h.id + '"><div class="howto-head"><h2>' + h.name + '</h2><span>演示赔率 ' + h.odds + '</span></div><p><b>规则：</b>' + h.rule + '</p><p><b>举例：</b>' + h.example + '</p><a class="howto-back" href="#/bet/newhk">去模拟投注 →</a></section>';
    }).join('');
    return '<div class="page-head"><div><div class="page-kicker">PLAY GUIDE</div><h1 class="page-title">玩法说明</h1><div class="page-sub">纯演示 · 赔率非真实</div></div><span class="demo-pill">DEMO</span></div><nav class="howto-nav">' + nav + '</nav><div class="howto-points"><b>演示积分怎么玩</b><p>初始 10000 演示积分，每注固定消耗 2 积分；选号后选择注数，记录模拟注单。开奖后按演示赔率在本地自动结算，中奖增加积分。不涉及真实支付、账户或提现。</p></div><div class="howto-list">' + blocks + '</div><div class="mini-note">所有玩法均为模拟演示，不构成任何投注建议。</div>';
  }
  var ROUTES = { lotteryhall: hallPage, history: historyPage, trend: trendPage, rank: rankPage, me: mePage };
  var TITLES = { lotteryhall: '彩票大厅', history: '开奖记录', trend: '号码走势', rank: '高手排行', me: '我的', howto: '玩法说明' };
  function currentRoute() {
    var h = String(location.hash || '').replace(/^#\/?/, ''), parts = h.split('/');
    if (parts[0] === 'game' && DEFS[parts[1]]) return { name: 'game', id: parts[1] };
    if (parts[0] === 'bet' && DEFS[parts[1]]) return { name: 'bet', id: parts[1] };
    if (parts[0] === 'howto') return { name: 'howto', anchor: parts[1] || '' };
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
    settleBets();
    var r = currentRoute(), view = $('#view'); if (!view) return;
    if (r.name === 'bet') betState.game = r.id;
    document.body.classList.toggle('bet-mode', r.name === 'bet');
    if (r.name === 'game') view.innerHTML = gamePage(r.id);
    else if (r.name === 'bet') view.innerHTML = betPage(r.id);
    else if (r.name === 'howto') view.innerHTML = howtoPage(r.anchor);
    else view.innerHTML = ROUTES[r.name] ? ROUTES[r.name]() : hallPage();
    setBottomTab(r.name);
    var ttl = r.name === 'game' ? DEFS[r.id].name + '开奖' : (r.name === 'bet' ? (DEFS[r.id].name + '模拟投注') : (r.name === 'howto' ? '玩法说明' : TITLES[r.name]));
    document.title = ttl + ' · 彩票大厅（演示）';
    if (!keepScroll) {
      if (r.name === 'howto' && r.anchor) setTimeout(function () { var el = document.getElementById('howto-' + r.anchor); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo(0, 0); }, 30);
      else window.scrollTo(0, 0);
    }
    clearInterval(countdownTimer); updateCountdowns(); countdownTimer = setInterval(updateCountdowns, 1000);
    startBanner();
  }
  function showToast(msg) { var el = $('#toast'); if (!el) return; el.textContent = msg || '演示功能，敬请期待'; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200); }
  function showModal(msg) { var m = $('#modal'); if (!m) return; $('#modal-body').textContent = msg || '当前为展示站点，不提供真实交易或账户服务。'; m.hidden = false; modalOpen = true; }
  function closeModal() { var m = $('#modal'); if (m) m.hidden = true; modalOpen = false; }
  function selectionWins(s, draw) {
    if (!draw || !draw.nums || draw.nums.length < 7) return false;
    var nums = draw.nums, spec = nums[6], c = parseInt(spec.c, 10), z = spec.z || '', key = s.key;
    if (key.indexOf('special-n-') === 0) return c === parseInt(key.split('-')[2], 10);
    if (key.indexOf('special-z-') === 0 || key.indexOf('one-z-') === 0 || key.indexOf('spz-z-') === 0) return z === key.split('-')[2];
    if (key === 'two-big') return c >= 25;
    if (key === 'two-small') return c < 25;
    if (key === 'two-odd') return c % 2 === 1;
    if (key === 'two-even') return c % 2 === 0;
    if (key === 'two-sum-odd' || key === 'two-sum-even') { var ds = String(c).split('').reduce(function (a, b) { return a + (parseInt(b,10)||0); }, 0); return key === 'two-sum-odd' ? ds % 2 === 1 : ds % 2 === 0; }
    if (key === 'two-tail-big') return c % 10 >= 5;
    if (key === 'two-tail-small') return c % 10 < 5;
    if (key === 'color-r') return (spec.color || colorOf(c)) === '红';
    if (key === 'color-b') return (spec.color || colorOf(c)) === '蓝';
    if (key === 'color-g') return (spec.color || colorOf(c)) === '绿';
    if (key.indexOf('reg-') === 0) { var pos = parseInt(key.split('-')[1], 10); var n = nums[pos - 1]; return !!n && parseInt(n.c, 10) % 2 === 1; }
    if (key.indexOf('miss-n-') === 0) { var miss = parseInt(key.split('-')[2], 10); return nums.every(function (n) { return parseInt(n.c, 10) !== miss; }); }
    if (key.indexOf('combo-') === 0) { var zs = String(s.zodiacs || '').split(','); return zs.indexOf(z) >= 0; }
    return false;
  }
  function settleBets() {
    var changed = false;
    bets.forEach(function (b) {
      if (b.status !== 'pending') return;
      var g = state.games[b.game]; if (!g) return;
      var draw = (g.history || []).filter(function (x) { return x.issue === b.targetIssue; })[0];
      if (!draw) return;
      var payout = 0, wins = 0;
      (b.selections || []).forEach(function (s) { if (selectionWins(s, draw)) { payout += Math.round((s.odds || 0) * 2 * b.qty); wins++; } });
      b.status = 'settled'; b.payout = payout; b.won = wins; b.settledAt = Date.now();
      points += payout; changed = true;
    });
    if (changed) { savePoints(points); saveBets(); }
  }
  function updateBetBar() {
    var notes = totalNotes(), cost = notes * 2;
    $$('[data-bet-count]').forEach(function (el) { el.textContent = notes; });
    $$('[data-bet-cost]').forEach(function (el) { el.textContent = cost; });
    var input = $('#betQty'); if (input && String(input.value) !== String(betState.qty)) input.value = betState.qty;
    $$('.amount-chip').forEach(function (b) { b.classList.toggle('on', String(b.getAttribute('data-qty')) === String(betState.qty)); });
    updatePointsUI();
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'betQty') {
      betState.qty = String(e.target.value || '').replace(/[^\d]/g, '') || '1';
      e.target.value = betState.qty;
      updateBetBar();
    }
  });
  document.addEventListener('click', function (e) {
    var demo = e.target.closest('[data-demo]'); if (demo) { e.preventDefault(); showModal(demo.getAttribute('data-demo')); return; }
    if (e.target.closest('[data-close-modal]')) { closeModal(); return; }
    var hg = e.target.closest('[data-history-game]'); if (hg) { historyGame = hg.getAttribute('data-history-game'); render(); return; }
    var dot = e.target.closest('[data-slide]'); if (dot) { var i = parseInt(dot.getAttribute('data-slide'), 10); var slides = $$('#hallBanner .slide'), dots = $$('#hallBanner .dots button'); slides.forEach(function (s, j) { s.classList.toggle('on', j === i); }); dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); bannerIndex = i; return; }
    var bc = e.target.closest('[data-bet-cat]');
    if (bc) { betState.cat = bc.getAttribute('data-bet-cat'); render(true); return; }
    var bt = e.target.closest('[data-bet-tab]');
    if (bt) { betState.tab = bt.getAttribute('data-bet-tab'); render(true); return; }
    var bb = e.target.closest('[data-bet]');
    if (bb) {
      var key = bb.getAttribute('data-bet');
      if (betState.sel[key]) delete betState.sel[key]; else betState.sel[key] = 1;
      bb.classList.toggle('on', !!betState.sel[key]);
      updateBetBar(); return;
    }
    var am = e.target.closest('[data-qty]');
    if (am) { betState.qty = am.getAttribute('data-qty'); updateBetBar(); return; }
    if (e.target.closest('[data-bet-clear]')) { betState.sel = {}; betState.qty = '1'; render(true); return; }
    if (e.target.closest('[data-reset-points]')) { points = 10000; savePoints(points); updatePointsUI(); showToast('演示积分已重置为 10000'); return; }
    if (e.target.closest('[data-bet-submit]')) {
      var nodes = $$('.bet-center [data-bet].on');
      var qty = parseInt(betState.qty, 10);
      if (!nodes.length) { showToast('请先选择玩法'); return; }
      if (!qty || qty < 1) { showToast('请输入注数'); return; }
      var notes = nodes.length * qty, cost = notes * 2;
      if (points < cost) { showModal('演示积分不足。当前为模拟投注，不涉及真实交易。'); return; }
      var g = state.games[betState.game];
      var selections = nodes.map(function (el) { var key = el.getAttribute('data-bet'); return { key:key, label:el.getAttribute('data-label') || key, odds:parseFloat(el.getAttribute('data-odds')) || 0, zodiacs:el.getAttribute('data-zodiacs') || '' }; });
      points -= cost; savePoints(points);
      bets.unshift({ id:Date.now() + '' + Math.floor(Math.random() * 999), game:betState.game, targetIssue:g.nextIssue, placedIssue:g.last.issue, qty:qty, cost:cost, notes:notes, selections:selections, labels:selections.map(function (s) { return s.label; }).join('、'), status:'pending', payout:0, created:Date.now() });
      saveBets(); betState.sel = {}; betState.qty = '1'; render(true);
      showModal('模拟投注已记录，演示积分已扣减 ' + cost + ' 分。演示站点 · 不构成任何投注建议。全部为本地模拟，不涉及真实交易。'); return;
    }
    if (e.target.closest('#refreshDataBtn')) { loadData(false); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', function () { render(); });
  if (!location.hash) location.hash = '#/lotteryhall';
  render(); loadData(true); setInterval(function () { if (!document.hidden) loadData(true); }, 30000);
})();
