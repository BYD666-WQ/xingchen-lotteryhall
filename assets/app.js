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
    var d = game.mockNext ? new Date(game.mockNext) : nextDrawAt(game); if (!d) return '--:--:--';
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
      '<div class="slide s1 on"><svg class="slide-art" viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"><circle cx="160" cy="76" r="52"/><circle cx="160" cy="76" r="34"/><path d="M40 140c30-25 57-26 85-8s45 12 65-9"/><path d="M118 38l7 18 18 7-18 7-7 18-7-18-18-7 18-7 7-18z"/><circle cx="56" cy="56" r="2.5" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="194" cy="136" r="2" fill="rgba(255,255,255,.55)" stroke="none"/></g></svg><small>THREE GAMES · 真实数据</small><h2>今晚，好运开场</h2><p>新港 / 新澳 / 香港 · 开奖与倒计时实时查看</p><a class="slide-btn slide-cta" href="#/bet/newhk">立即投注 →</a></div>' +
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
  var HALL18 = [
    { name:'极速赛车', id:'fast-race-1', color:'#4d8fd8', icon:'赛' },
    { name:'极速时时彩', soon:true, color:'#5a7bd4', icon:'时' },
    { name:'极速六合彩', id:'fast-mark6-1', color:'#e39b38', icon:'六' },
    { name:'香港六合彩', id:'hk', color:'#d94b62', icon:'香' },
    { name:'新澳门六合彩', id:'newmo', color:'#3d8ed0', icon:'澳' },
    { name:'澳门六合彩', soon:true, color:'#4aa99d', icon:'门' },
    { name:'极速快三', id:'fast-k3', color:'#d45f82', icon:'快' },
    { name:'腾讯分分彩', soon:true, color:'#687bd0', icon:'分' },
    { name:'极速28', soon:true, color:'#d08a3f', icon:'28' },
    { name:'幸运28', soon:true, color:'#c9a23f', icon:'幸' },
    { name:'极速飞艇', id:'fast-race-2', color:'#5a8fd4', icon:'艇' },
    { name:'幸运飞艇', id:'fast-race-5', color:'#4aa99d', icon:'飞' },
    { name:'北京赛车', id:'fast-race-10', color:'#7b68c8', icon:'北' },
    { name:'幸运赛车', id:'newhk', color:'#e6a62f', icon:'运' }
  ];
  function hallGrid18() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">游戏大厅</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid hall18">' + HALL18.map(function (x) {
      if (x.soon) return '<button type="button" class="game-cell soon" data-soon="' + esc(x.name) + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">待接入</span></button>';
      return '<a class="game-cell" href="#/bet/' + x.id + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">' + esc((DEFS[x.id] && DEFS[x.id].period) || '进入') + '</span></a>';
    }).join('') + '</div></section>';
  }
  function hotGrid() {
    var cells = CONFIG.filter(function (g) { return g.enabled; }).concat(CONFIG.filter(function (g) { return !g.enabled; }));
    return hallGrid18();
  }
  function zeroPointsBanner() {
    var seen = false; try { seen = sessionStorage.getItem('xcRegZero') === '1'; } catch (e) {}
    if ((parseInt(points, 10) || 0) <= 0) {
      var txt = (regZeroNotice || seen) ? '账号已创建，当前积分 0，请联系管理员加分' : '积分不足，请联系管理员加分后再投注';
      return '<div class="reg-zero-banner" data-reg-banner>' + txt + '<button type="button" data-dismiss-reg>知道了</button></div>';
    }
    return '';
  }
  function betZeroBanner() {
    if ((parseInt(points, 10) || 0) > 0) return '';
    return '<div class="reg-zero-banner bet-zero">积分不足，请联系管理员加分后再投注</div>';
  }
  function hallPage() {
    return zeroPointsBanner() + banner() + notice() + pointsBar() + quickGrid() + catTabs('lotteryhall') + hotGrid() +
      '<div class="mini-note">数据来自主站只读接口 · 每 30 秒自动刷新 · 仅作演示</div>';
  }
  var SUM_SOURCE = 'guanya'; // 'guanya' 冠亚和（第1+第2）| 'total' 10 个号总和
  var FAST = {}, FAST_LAST = 0, KP_FRESH = true;
  function shapeFast(id, d) {
    var nums = (d && d.lastResult && d.lastResult.nums) || [];
    nums = nums.map(function (x) { return (typeof x === 'object') ? { c: String(x.c || ''), z: x.z || '' } : { c: String(x), z: '' }; });
    var g = {
      last: { issue: (d && d.lastResult && d.lastResult.issue) || ((d && d.issue) ? d.issue - 1 : 0), nums: nums },
      nextIssue: (d && d.issue) || 0,
      mockNext: d && d.closeAt ? Date.parse(d.closeAt) : 0,
      periodSec: (d && d.periodSec) || 60,
      periodSeconds: (d && d.periodSec) || 60,
      server: true,
      history: []
    };
    return g;
  }
  function syncFastIssue(id) {
    var def = DEFS[id]; if (!def || !def.mock) return Promise.resolve();
    FAST[id] = FAST[id] || {};
    FAST[id].lastTry = Date.now();
    return window.LotteryAPI.call('/issues/' + encodeURIComponent(id), { method: 'GET' }).then(function (d) {
      FAST[id].data = d; state.games[id] = shapeFast(id, d);
      try { console.info('[fast] /issues ' + id + ' → issue=' + d.issue + ' closeAt=' + d.closeAt + ' lastNums=' + ((d.lastResult && d.lastResult.nums) || []).length); } catch (e) {}
      var cr = currentRoute();
      if (cr.name === 'bet' && cr.id === id) render(true);
      try { loadUserBets().then(function (b) { if (JSON.stringify(b) !== JSON.stringify(bets)) { bets = b; updateBetsOnly(); } }); } catch (e) {}
    }).catch(function (e) {
      console.warn('[fast] /issues 失败，回退本地 mock：' + String(e && e.message || e));
      FAST[id].failed = true;
      if (!state.games[id]) state.games[id] = mockGame(id);
      var cr = currentRoute();
      if (cr.name === 'bet' && cr.id === id) render(true);
    });
  }
  function mockGame(id) {
    var def = DEFS[id]; if (!def || !def.mock) return null;
    var sec = def.periodSeconds || 60, now = Date.now();
    var idx = Math.floor(now / 1000 / sec), issue = 100000 + (idx % 900000);
    var nextIssue = issue + 1;
    function makeNums(n) {
      var nums = [], used = {};
      for (var k = 0; k < 7; k++) {
        var v = ((n * 37 + k * 53 + 7) % 49) + 1;
        while (used[v]) v = (v % 49) + 1;
        used[v] = 1; nums.push(attrFor(v).z ? { c:pad(v), z:attrFor(v).z, color:attrFor(v).color } : { c:pad(v), z:'', color:colorOf(v) });
      }
      return nums;
    }
    var history = [];
    for (var h = 0; h < 12; h++) history.push({ issue: issue - h, nums: makeNums(idx - h) });
    if (def.racing) {
      var raceNums = [], rn = 1;
      for (var z = 0; z < 10; z++) { var n2 = ((idx * 7 + z * 3 + 1) % 10) + 1; while (raceNums.some(function (x) { return x.c === pad(n2); })) n2 = (n2 % 10) + 1; raceNums.push({ c: pad(n2), z: raceZod ? '' : '' }); }
      raceNums = raceNums.map(function (x) { var v = parseInt(x.c, 10); return { c: pad(v), z: (attrFor(v) && attrFor(v).z) || '' }; });
      history[0].nums = raceNums;
      return { last:{ issue:issue, nums:raceNums }, nextIssue:nextIssue, history:history, mockNext:(idx + 1) * sec * 1000, timeCfg:{ time:def.period || '1分钟' } };
    }
    return { last:{ issue:issue, nums:history[0].nums }, nextIssue:nextIssue, history:history, mockNext:(idx + 1) * sec * 1000, timeCfg:{ time:def.period || '1分钟', hour:0, minute:0, days:[0,1,2,3,4,5,6] } };
  }
  function gameCell(id) {
    var def = DEFS[id];
    if (!def) return '';
    if (def.enabled === false) return '<a class="game-cell placeholder" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.gridNote || '未接入') + '</span></a>';
    if (def.mock) return '<a class="game-cell" href="#/bet/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.period) + '/期</span></a>';
    var g = state.games[id];
    if (!g) return '<div class="game-cell skeleton"><span class="sk sk-badge"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.period || '每日') + ' · 第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
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
    return zeroTip + '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
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
    return catTabs('rank') + '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">实时统计 · 结算注单</div></div><span class="demo-pill">LIVE</span></div>' +
      '<div id="rank-live" class="rank-list"><div class="data-empty" style="padding:30px 16px">加载中…</div></div>' +
      '<div class="mini-note">按已结算注单统计：注数 / 命中 / 命中率 / 最近连中。</div>';
  }
  function loadRankLive() {
    var box = document.getElementById('rank-live'); if (!box) return;
    box.innerHTML = '<div class="data-empty" style="padding:30px 16px">加载中…</div>';
    Promise.resolve().then(function () { return window.LotteryAPI.call('/rank?limit=20', { method: 'GET' }); }).then(function (res) {
      var rows = (res && (res.rank || res.rows)) || [];
      if (!rows.length) { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无数据</div>'; return; }
      box.innerHTML = rows.slice(0, 20).map(function (r, i) {
        var name = esc(String(r.username || '玩家'));
        var rate = Number(r.rate);
        var rateTxt = isFinite(rate) ? (rate <= 1 ? (rate * 100).toFixed(1) : rate.toFixed(1)) + '%' : '—';
        return '<div class="rank-row"><span class="rank-no">' + (i + 1) + '</span><span class="avatar">' + esc(name.slice(0, 1)) + '</span><div class="rank-info"><b>' + name + '</b><span>注数 ' + (r.bets || 0) + ' · 命中 ' + (r.hits || 0) + '</span></div><div class="rank-val"><b>' + rateTxt + '</b><span>连中 ' + (r.streak || 0) + '</span></div></div>';
      }).join('');
    }).catch(function (e) { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">加载失败：' + esc(String(e && e.message || '接口异常')) + '</div>'; });
  }
  function rankPageLegacy() {
    var top = RANKS.slice(0, 3);
    var podium = [top[1], top[0], top[2]].map(function (r) { return '<div class="podium-item ' + (r.name === top[0].name ? 'first' : '') + '">' + (r.name === top[0].name ? '<span class="crown">♛</span>' : '') + '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><b>' + esc(r.name) + '</b><span>' + esc(r.tag.split(' · ')[0]) + '</span><strong>' + esc(r.value) + '</strong></div>'; }).join('');
    return catTabs('rank') + '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">演示榜单 · 每日更新样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="podium">' + podium + '</div><div class="rank-list">' + RANKS.slice(3).map(function (r, i) { return '<div class="rank-row"><span class="rank-no">' + (i + 4) + '</span><span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><div class="rank-info"><b>' + esc(r.name) + '</b><span>' + esc(r.tag) + '</span></div><div class="rank-val"><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></div></div>'; }).join('') + '</div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="榜单为演示内容，关注功能暂未开放">关注榜单</button></div><div class="mini-note">排名、连中与命中率均为虚构样例，不构成任何建议。</div>';
  }
  function betsPage() {
    return catTabs('') + '<div class="page-head"><div><div class="page-kicker">MY BETS</div><h1 class="page-title">投注记录</h1><div class="page-sub">云端记录 · 账户积分</div></div></div>' + myBetsHtml() + '<div class="mini-note">仅展示最近注单；结算状态以服务端为准。</div>';
  }
  function mePage() {
    var u = currentUser();
    var name = u ? u.username : '游客';
    var intro = u ? '已登录 · 账户积分与注单同步云端' : '登录后可查看账户积分并体验模拟投注';
    return catTabs('') + '<div class="page-head"><div><div class="page-kicker">PROFILE</div><h1 class="page-title">我的</h1><div class="page-sub">' + (u ? '已登录 · 演示账号' : '游客模式 · 演示账号') + '</div></div></div>' +
      '<section class="profile"><span class="avatar">' + (u ? esc(u.username.slice(0,1)) : '游') + '</span><div class="profile-main"><b>' + esc(name) + '</b><span>' + esc(intro) + '</span><span class="tag">DEMO ACCOUNT</span></div>' + (u ? '<button class="btn btn-ghost" type="button" data-logout>退出</button>' : '<a class="btn btn-primary" href="#/login">登录</a>') + '</section>' +
      '<div class="demo-account-note"><b>演示账户</b><span>本站不提供真实交易、账户或提现服务；账户积分与注单存储在云端。</span></div>' +
      '<div class="menu"><button class="menu-row" type="button" data-demo="安全中心为演示入口"><span class="menu-ico">⌁</span><span class="txt">安全中心</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="消息中心为演示入口"><span class="menu-ico">◌</span><span class="txt">消息中心</span><em>0 条</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="客服为演示入口"><span class="menu-ico">?</span><span class="txt">帮助与客服</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="关于页面：演示站点，数据来自主站只读接口"><span class="menu-ico">i</span><span class="txt">关于本站</span><em>v0.4</em><span class="arrow">›</span></button></div>' +
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
  var ODDS = Object.assign({ rank:9.98, special:48.8, oneZodiac:4.9, twoSide:1.96, color:2.8, specialZodiac:4.9, regular:7.8, miss:2.0, combo2:3.2, combo3:5.5, combo4:9.8, combo5:18.0 }, window.LH_ODDS || {});
  var BET_CATS = [
    { id:'two-side', name:'两面', short:'' },
    { id:'color', name:'色波', short:'' },
    { id:'special-zodiac', name:'特肖', short:'' },
    { id:'regular', name:'正码', short:'' },
    { id:'special', name:'正特', short:'' },
    { id:'regular6', name:'正码1-6', short:'' },
    { id:'combo', name:'连码', short:'' },
    { id:'one-zodiac', name:'平特一肖', short:'' },
    { id:'tail', name:'尾数', short:'' },
    { id:'combo-he', name:'合肖', short:'' }
  ];
  var RACING_CATS = [
    { id:'two-side', name:'两面', short:'' },
    { id:'champion', name:'冠军', short:'' },
    { id:'runner', name:'亚军', short:'' }
  ];
  var betState = { game:'newhk', cat:'special', tab:'credit', qty:'1', sel:{} };
  function selKey() { return 'lh-sel-' + (betState.game || 'newhk'); }
  function saveSel() { try { localStorage.setItem(selKey(), JSON.stringify(betState.sel || {})); } catch (e) {} }
  function loadSel(g) { try { return JSON.parse(localStorage.getItem('lh-sel-' + g) || '{}') || {}; } catch (e) { return {}; } }
  var betSubmitting = false;
  try { ['lh-demo-points','lh-demo-bets','lh-demo-session','lh-demo-accounts','lh-mock-state-v1'].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  var points = 0;
  var bets = [];
  var APPWRITE = { endpoint:'https://sgp.cloud.appwrite.io/v1', project:'6aff4c2f0016ee43abad', db:'lottery', users:'6aff4ea1000cecd6c798', bets:'bets', config:'config' };
  var awClient = null, awAccount = null, awTables = null;
  if (window.Appwrite) {
    awClient = new window.Appwrite.Client().setEndpoint(APPWRITE.endpoint).setProject(APPWRITE.project);
    awAccount = new window.Appwrite.Account(awClient);
    awTables = new window.Appwrite.TablesDB(awClient);
  }
  var AUTH_NEXT = '#/lotteryhall', authMode = 'login', authReady = false, authBusy = false;
  var awUser = null, awRow = null, gameConfigs = {};
  var rtUnsub = null, rtRetry = 0, rtRetryTimer = null, rtHeartbeat = null, rtPoll = null, rtLive = false, rtState = { s:'–', degraded:false }, rtConnTimer = null, rtGotEvent = false, rtProbeTimer = null;
  var RT_CONNECT_TIMEOUT = 10000;   // 10s 内 ping 不通才降级
  var RT_RETRY_MS = 60000;          // 降级后每 60s 重试 WS
  function safeUsername(n) {
    var s = String(n || '').trim().replace(/[^A-Za-z0-9_\u4e00-\u9fa5]/g, '');
    if (s.length < 2) s = '玩家' + String(Date.now()).slice(-6);
    return s.slice(0, 24);
  }
  function emailFor(name) { var s = String(name || '').toLowerCase().replace(/[^a-z0-9._-]/g, ''); if (!s) s = 'u' + Array.from(String(name || 'user')).map(function (c) { return c.codePointAt(0).toString(36); }).join('').slice(0, 20); return s + '@lottery-demo.com'; }
  function currentUser() { return awUser && awRow ? { username:awRow.username || awUser.name || '玩家', id:awUser.$id, email:awUser.email } : null; }
  function saveAccounts() {}
  function updateUserChip() { var b = $('#userChip'); if (!b) return; var u = currentUser(); b.textContent = u ? ('积分 ' + (parseInt(points, 10) || 0)) : '登录/注册'; b.setAttribute('data-auth', u ? 'user' : 'login'); }
  function friendlyError(e) {
    var raw = (e && (e.message || e.type || '')) || '';
    var code = (e && (e.code || e.type)) || '';
    var table = [
      [/password.*(at least|minimum|8|short|length)/i, '密码至少 8 位'],
      [/password.*(weak|strength|common|easy)/i, '密码强度不足，请包含字母和数字'],
      [/(already exists|already_exists|user_already_exists|email_already_exists|409)/i, '账号已存在，请直接登录'],
      [/(invalid email|email.*invalid|invalid.*email)/i, '邮箱格式不正确'],
      [/(network|failed to fetch|timeout|timed out|websocket|connection)/i, '网络连接失败，请稍后重试'],
      [/(invalid credentials|user_invalid_credentials|invalid password|401)/i, '账号或密码不正确'],
      [/(rate limit|too many|429)/i, '操作太频繁，请稍后重试']
    ];
    for (var i = 0; i < table.length; i++) if (table[i][0].test(raw + ' ' + code)) return table[i][1];
    return '操作失败，请重试' + (code ? '<small class="err-code">' + String(code) + '</small>' : '');
  }
  function apiError(e) { return friendlyError(e); }
  // Phase D：前端不再创建/修改 Appwrite users 行 —— 账户与积分只由 Function 管理。
  // （旧 ensureUserRow 已删除，避免任何路径再写 points/role。）
  // Phase D：前端不允许创建/修改 users 行（积分/角色只由 Function 管理）
  async function ensureUserRow() { throw new Error('前端不允许写 users 行（Phase D）'); }
  async function loadUserBets() {
    if (!awUser) return [];
    var res = await window.LotteryAPI.call('/bets', { method: 'GET' });
    var rows = (res && (res.bets || res.rows)) || [];
    return rows.map(function (r) {
      var picks = r.picks;
      if (typeof picks === 'string') { try { picks = JSON.parse(picks); } catch (e) { picks = []; } }
      picks = Array.isArray(picks) ? picks : ((picks && picks.selections) || []);
      var stake = Number(r.stake != null ? r.stake : r.cost) || 0;
      return { id: r.id || r.$id, game: r.gameId || r.game, targetIssue: r.issue || r.targetIssue || '', placedIssue: r.issue || '', qty: r.qty || 1, cost: stake, notes: r.notes || Math.round(stake / 2), selections: picks, labels: picks.map(function (x) { return (typeof x === 'string') ? x : (x.label || x.key); }).join('、'), status: r.status || 'pending', payout: Number(r.payout) || 0, created: r.createdAt || (r.$createdAt ? Date.parse(r.$createdAt) : Date.now()) };
    });
  }
  async function loadGameConfigs() {
    try {
      var res = await window.LotteryAPI.call('/games', { method: 'GET' });
      var rows = (res && (res.games || res.rows)) || [];
      gameConfigs = {};
      rows.forEach(function (r) { if (r && r.id) gameConfigs[r.id] = r; });
      if (res && res.odds && typeof res.odds === 'object') {
        Object.keys(res.odds).forEach(function (k) { gameConfigs[k] = gameConfigs[k] || { id: k }; gameConfigs[k].odds = res.odds[k]; });
      }
      // 服务端权威玩法赔率（/games.oddsByPlay）为唯一来源；本地 config/games.js 只在接口失败时兜底
      var ob = (res && (res.oddsByPlay || (res.odds && res.odds.oddsByPlay))) || null;
      if (ob && typeof ob === 'object') {
        if (ob.oneZodiac != null) ODDS.oneZodiac = Number(ob.oneZodiac);
        if (ob.flatZodiac != null) ODDS.specialZodiac = Number(ob.flatZodiac);
        if (ob.horse != null) ODDS.horse = Number(ob.horse);
        if (ob.specialNewMo != null) { DEFS.newmo = DEFS.newmo || {}; DEFS.newmo.specialOdds = Number(ob.specialNewMo); }
        if (ob.specialNewHk != null) { DEFS.newhk = DEFS.newhk || {}; DEFS.newhk.specialOdds = Number(ob.specialNewHk); }
        if (ob.specialHk != null) { DEFS.hk = DEFS.hk || {}; DEFS.hk.specialOdds = Number(ob.specialHk); }
        if (ob.zodiacNewMo != null) { DEFS.newmo = DEFS.newmo || {}; DEFS.newmo.zodiacOdds = Number(ob.zodiacNewMo); }
        var f = ob.fast;
        if (f && typeof f === 'object') {
          window.LH_RACING_ODDS = window.LH_RACING_ODDS || {};
          if (f.twoSide) window.LH_RACING_ODDS.twoSide = f.twoSide;
          if (f.champion) {
            var ch = Object.assign({}, f.champion);
            if (ch.dragon != null && ch.long == null) ch.long = ch.dragon; // 服务端用 dragon，前端键叫 long
            window.LH_RACING_ODDS.champion = ch;
          }
          if (f.runnerUp) window.LH_RACING_ODDS.runner = f.runnerUp;
          if (f.sum) window.LH_RACING_ODDS.sum = f.sum;
          if (f.bs) window.LH_RACING_ODDS.bs = f.bs;
          if (f.oe) window.LH_RACING_ODDS.oe = f.oe;
          if (f.combo != null) window.LH_RACING_ODDS.combo = Number(f.combo);
          if (f.rank != null) ODDS.rank = Number(f.rank);
        }
        try { console.info('[odds] 使用服务端 /games.oddsByPlay:', JSON.stringify(ob).slice(0, 300)); } catch (e) {}
      } else {
        try { console.warn('[odds] /games 未返回 oddsByPlay，回退本地 config/games.js 赔率表'); } catch (e) {}
      }
      // 服务端规则（resetOnLogout 等）
      var rl = (res && res.rules) || null;
      if (rl && typeof rl === 'object') {
        window.LH_RULES = window.LH_RULES || {};
        if (rl.resetOnLogout != null) window.LH_RULES.resetOnLogout = !!rl.resetOnLogout;
      }
    } catch (e) { /* 失败保留 config/games.js 静态兜底 */ }
  }
  function updateRTStatus(s, degraded) {
    rtState.s = s; rtState.degraded = !!degraded;
    $$('[data-rt-status]').forEach(function (el) { el.textContent = '实时:' + s; el.classList.toggle('degraded', !!degraded); });
  }
  function stopPoll() { if (rtPoll) { clearInterval(rtPoll); rtPoll = null; } }
  function startPoll() {
    if (rtPoll) return;
    rtPoll = setInterval(async function () {
      if (!awUser || document.hidden) return;
      try { await refreshPoints(); var nx = await loadUserBets(); if (JSON.stringify(nx) !== JSON.stringify(bets)) { bets = nx; updateBetsOnly(); } } catch (e) {}
    }, 30000);
  }
  async function onRealtime(resp) {
    var events = (resp && resp.events) || [];
    var payload = (resp && resp.payload) || {};
    rtGotEvent = true;
    if (rtConnTimer) { clearTimeout(rtConnTimer); rtConnTimer = null; }
    rtLive = true; rtRetry = 0; stopPoll(); updateRTStatus('WS');
    var mine = String((awRow && awRow.$id) || '');
    var evText = events.join(' ');
    var isUsers = evText.indexOf('tables.' + APPWRITE.users) >= 0;
    var isBets = evText.indexOf('tables.' + APPWRITE.bets) >= 0;
    if (isUsers) {
      if (!mine || String(payload.$id || '') !== mine) { try { console.info('[rt] 忽略非本人 users 事件'); } catch (e) {} return; }
      if (payload.points != null) {
        var v = parseInt(payload.points, 10);
        if (isFinite(v)) { points = v; awRow.points = v; updatePointsUI(); updateBetBar(); }
      }
    }
    if (isBets) {
      try { var next = await loadUserBets(); if (JSON.stringify(next) !== JSON.stringify(bets)) { bets = next; updateBetsOnly(); } } catch (e) {}
    }
  }
  function stopRealtime() {
    if (rtUnsub) { try { rtUnsub(); } catch (e) {} rtUnsub = null; }
    if (rtHeartbeat) { clearInterval(rtHeartbeat); rtHeartbeat = null; }
    if (rtRetryTimer) { clearTimeout(rtRetryTimer); rtRetryTimer = null; }
    if (rtConnTimer) { clearTimeout(rtConnTimer); rtConnTimer = null; }
    if (rtProbeTimer) { clearTimeout(rtProbeTimer); rtProbeTimer = null; }
    rtLive = false;
  }
  function realtimeDown(reason) {
    try { console.warn('[rt] 降级轮询（30s）：' + (reason || 'WS 不可用') + '，' + Math.round(RT_RETRY_MS / 1000) + 's 后重试 WS'); } catch (e) {}
    stopRealtime(); updateRTStatus('轮询（降级）', true); startPoll();
    rtRetry++;
    rtRetryTimer = setTimeout(startRealtime, RT_RETRY_MS);
  }
  // Realtime（WebSocket）优先；5s 未连上/未收到事件 → 降级 30s 轮询；断开指数退避重连
  function startRealtime() {
    if (!awUser || !awClient) { updateRTStatus('关'); return; }
    stopRealtime(); updateRTStatus('…');
    rtGotEvent = false;
    var rid = String((awUser && awUser.$id) || '');
    // 只订阅自己的 users 行 + bets（行权限过滤，不订阅裸表频道）
    var chans = [];
    if (rid) chans.push('tablesdb.' + APPWRITE.db + '.tables.' + APPWRITE.users + '.rows.' + rid);
    chans.push('tablesdb.' + APPWRITE.db + '.tables.' + APPWRITE.bets + '.rows');
    try {
      try { console.info('[rt] 尝试 WS 订阅：' + chans.join(' , ')); } catch (e) {}
      rtUnsub = awClient.subscribe(chans, onRealtime);
      rtLive = true;
      // 只有 ping 成功（WS 真连上）才置 WS；10s 都 ping 不通才降级
      var pingOk = false;
      var probe = async function () {
        if (pingOk) return;
        try { await awClient.ping(); pingOk = true; rtGotEvent = true; if (rtConnTimer) { clearTimeout(rtConnTimer); rtConnTimer = null; } stopPoll(); rtRetry = 0; updateRTStatus('WS'); try { console.info('[rt] subscribe + ping 成功，切到 实时:WS'); } catch (e) {} } catch (e) {}
        if (!pingOk) rtProbeTimer = setTimeout(probe, 700);
      };
      probe();
      rtConnTimer = setTimeout(function () {
        if (!pingOk && !rtGotEvent) { try { console.warn('[rt] ' + (RT_CONNECT_TIMEOUT / 1000) + 's 内未连通 WS（可能被移动网络/防火墙拦截）'); } catch (e) {} try { if (rtUnsub) rtUnsub(); } catch (e) {} rtUnsub = null; realtimeDown('10s ping 不通'); }
      }, RT_CONNECT_TIMEOUT);
      rtHeartbeat = setInterval(async function () {
        try { await awClient.ping(); } catch (e) { if (rtLive) realtimeDown('心跳 ping 失败'); }
      }, 15000);
    } catch (e) { try { console.warn('[rt] subscribe 抛错：' + (e && e.message || e)); } catch (x) {} realtimeDown('subscribe 抛错'); }
  }
  async function refreshPoints() {
    if (!awRow) return;
    try {
      var me = await window.LotteryAPI.call('/me', { method: 'GET' });
      var v = parseInt(me && me.points, 10);
      if (isFinite(v)) { points = v; awRow.points = v; updatePointsUI(); updateBetBar(); }
    } catch (e) {}
  }
  async function afterAuth(user, username) {
    try { if (window.LotteryAPI && window.LotteryAPI.setJwtProvider && awAccount) window.LotteryAPI.setJwtProvider(async function () { var j = await awAccount.createJWT(); return j && j.jwt; }); } catch (e) {}
    awUser = user;
    // Phase D：账户/积分只走 Function；首次登录自动 /register-profile 建档（10000 积分）
    var me = null;
    try {
      me = await window.LotteryAPI.call('/me', { method: 'GET' });
    } catch (e) {
      var code = (e && e.data && e.data.error && e.data.error.code) || '';
      if (e && (e.status === 404 || code === 'PROFILE_NOT_FOUND')) {
        var uname = safeUsername(username || (user && user.name) || '');
        try {
          var reg = await window.LotteryAPI.call('/register-profile', { method: 'POST', body: { username: uname } });
          me = { username: (reg && reg.user && reg.user.username) || uname, points: (reg && reg.user && reg.user.points) || 0 };
        } catch (e2) {
          if (e2 && e2.status === 409) {
            var uname2 = safeUsername(uname + String((user && user.$id) || '').replace(/[^a-z0-9]/gi, '').slice(0, 4));
            var reg2 = await window.LotteryAPI.call('/register-profile', { method: 'POST', body: { username: uname2 } });
            me = { username: (reg2 && reg2.user && reg2.user.username) || uname2, points: (reg2 && reg2.user && reg2.user.points) || 0 };
          } else { throw e2; }
        }
      } else { throw e; }
    }
    awRow = { $id: user.$id, username: String((me && me.username) || username || (user && user.name) || '玩家'), points: parseInt(me && me.points, 10) || 0 };
    points = parseInt(awRow.points, 10) || 0;
    try { bets = await loadUserBets(); } catch (e) { bets = []; }
    try { await loadGameConfigs(); } catch (e) {}
    authReady = true; updateUserChip(); render(true); startRealtime();
  }
  async function initAuth() {
    if (!awAccount) { authReady = true; render(); return; }
    try { var u = await awAccount.get(); await afterAuth(u, u.name || (u.email || '').split('@')[0]); }
    catch (e) { window.__lhInitError = String((e && e.message) || e); stopRealtime(); stopPoll(); awUser = null; awRow = null; points = 0; bets = []; authReady = true; updateRTStatus('关'); updateUserChip(); render(true); }
  }
  async function loginUser(name, pass) {
    if (authBusy) return '';
    name = String(name || '').trim(); pass = String(pass || '');
    if (name.length < 2) return '用户名至少 2 个字符';
    if (pass.length < 8) return '密码至少 8 位';
    if (!awAccount) return 'Appwrite SDK 未加载';
    authBusy = true;
    try {
      await awAccount.createEmailPasswordSession({ email:emailFor(name), password:pass });
      var u = await awAccount.get();
      await afterAuth(u, u.name || name);
      return '';
    } catch (e) { return apiError(e); } finally { authBusy = false; }
  }
  var regZeroNotice = false;
  async function registerUser(name, pass) {
    if (authBusy) return '';
    name = String(name || '').trim(); pass = String(pass || '');
    if (name.length < 2) return '用户名至少 2 个字符';
    if (pass.length < 8) return '密码至少 8 位';
    if (!awAccount) return 'Appwrite SDK 未加载';
    authBusy = true;
    try {
      var u = await awAccount.create({ userId:window.Appwrite.ID.unique(), email:emailFor(name), password:pass, name:name });
      await awAccount.createEmailPasswordSession({ email:emailFor(name), password:pass });
      await afterAuth(u, name);
      return '';
    } catch (e) { return apiError(e); } finally { authBusy = false; }
  }
  async function logoutUser() {
    try { if (awAccount) await awAccount.deleteSession({ sessionId:'current' }); } catch (e) {}
    awUser = null; awRow = null; points = 0; bets = []; authReady = true;
  }
  function logout() { logoutUser(); }
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
    var d = game.mockNext ? new Date(game.mockNext) : nextDrawAt(game); if (!d) return '--:--:--';
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
      '<div class="slide s1 on"><svg class="slide-art" viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"><circle cx="160" cy="76" r="52"/><circle cx="160" cy="76" r="34"/><path d="M40 140c30-25 57-26 85-8s45 12 65-9"/><path d="M118 38l7 18 18 7-18 7-7 18-7-18-18-7 18-7 7-18z"/><circle cx="56" cy="56" r="2.5" fill="rgba(255,255,255,.7)" stroke="none"/><circle cx="194" cy="136" r="2" fill="rgba(255,255,255,.55)" stroke="none"/></g></svg><small>THREE GAMES · 真实数据</small><h2>今晚，好运开场</h2><p>新港 / 新澳 / 香港 · 开奖与倒计时实时查看</p><a class="slide-btn slide-cta" href="#/bet/newhk">立即投注 →</a></div>' +
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
  var HALL18 = [
    { name:'极速赛车', id:'fast-race-1', color:'#4d8fd8', icon:'赛' },
    { name:'极速时时彩', soon:true, color:'#5a7bd4', icon:'时' },
    { name:'极速六合彩', id:'fast-mark6-1', color:'#e39b38', icon:'六' },
    { name:'香港六合彩', id:'hk', color:'#d94b62', icon:'香' },
    { name:'新澳门六合彩', id:'newmo', color:'#3d8ed0', icon:'澳' },
    { name:'澳门六合彩', soon:true, color:'#4aa99d', icon:'门' },
    { name:'极速快三', id:'fast-k3', color:'#d45f82', icon:'快' },
    { name:'腾讯分分彩', soon:true, color:'#687bd0', icon:'分' },
    { name:'极速28', soon:true, color:'#d08a3f', icon:'28' },
    { name:'幸运28', soon:true, color:'#c9a23f', icon:'幸' },
    { name:'极速飞艇', id:'fast-race-2', color:'#5a8fd4', icon:'艇' },
    { name:'幸运飞艇', id:'fast-race-5', color:'#4aa99d', icon:'飞' },
    { name:'北京赛车', id:'fast-race-10', color:'#7b68c8', icon:'北' },
    { name:'幸运赛车', id:'newhk', color:'#e6a62f', icon:'运' }
  ];
  function hallGrid18() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">游戏大厅</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid hall18">' + HALL18.map(function (x) {
      if (x.soon) return '<button type="button" class="game-cell soon" data-soon="' + esc(x.name) + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">待接入</span></button>';
      return '<a class="game-cell" href="#/bet/' + x.id + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">' + esc((DEFS[x.id] && DEFS[x.id].period) || '进入') + '</span></a>';
    }).join('') + '</div></section>';
  }
  function hotGrid() {
    var cells = CONFIG.filter(function (g) { return g.enabled; }).concat(CONFIG.filter(function (g) { return !g.enabled; }));
    return hallGrid18();
  }
  function hallPage() {
    return zeroPointsBanner() + banner() + notice() + pointsBar() + quickGrid() + catTabs('lotteryhall') + hotGrid() +
      '<div class="mini-note">数据来自主站只读接口 · 每 30 秒自动刷新 · 仅作演示</div>';
  }
  function mockGame(id) {
    var def = DEFS[id]; if (!def || !def.mock) return null;
    var sec = def.periodSeconds || 60, now = Date.now();
    var idx = Math.floor(now / 1000 / sec), issue = 100000 + (idx % 900000);
    var nextIssue = issue + 1;
    function makeNums(n) {
      var nums = [], used = {};
      for (var k = 0; k < 7; k++) {
        var v = ((n * 37 + k * 53 + 7) % 49) + 1;
        while (used[v]) v = (v % 49) + 1;
        used[v] = 1; nums.push(attrFor(v).z ? { c:pad(v), z:attrFor(v).z, color:attrFor(v).color } : { c:pad(v), z:'', color:colorOf(v) });
      }
      return nums;
    }
    var history = [];
    for (var h = 0; h < 12; h++) history.push({ issue: issue - h, nums: makeNums(idx - h) });
    return { last:{ issue:issue, nums:history[0].nums }, nextIssue:nextIssue, history:history, mockNext:(idx + 1) * sec * 1000, timeCfg:{ time:def.period || '1分钟', hour:0, minute:0, days:[0,1,2,3,4,5,6] } };
  }
  function gameCell(id) {
    var def = DEFS[id];
    if (!def) return '';
    if (def.enabled === false) return '<a class="game-cell placeholder" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.gridNote || '未接入') + '</span></a>';
    if (def.mock) return '<a class="game-cell" href="#/bet/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.period) + '/期</span></a>';
    var g = state.games[id];
    if (!g) return '<div class="game-cell skeleton"><span class="sk sk-badge"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(def.period || '每日') + ' · 第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
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
  function rankPageLegacyOld() {
    var top = RANKS.slice(0, 3);
    var podium = [top[1], top[0], top[2]].map(function (r) { return '<div class="podium-item ' + (r.name === top[0].name ? 'first' : '') + '">' + (r.name === top[0].name ? '<span class="crown">♛</span>' : '') + '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><b>' + esc(r.name) + '</b><span>' + esc(r.tag.split(' · ')[0]) + '</span><strong>' + esc(r.value) + '</strong></div>'; }).join('');
    return catTabs('rank') + '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">演示榜单 · 每日更新样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="podium">' + podium + '</div><div class="rank-list">' + RANKS.slice(3).map(function (r, i) { return '<div class="rank-row"><span class="rank-no">' + (i + 4) + '</span><span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><div class="rank-info"><b>' + esc(r.name) + '</b><span>' + esc(r.tag) + '</span></div><div class="rank-val"><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></div></div>'; }).join('') + '</div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="榜单为演示内容，关注功能暂未开放">关注榜单</button></div><div class="mini-note">排名、连中与命中率均为虚构样例，不构成任何建议。</div>';
  }
  function mePage() {
    var u = currentUser();
    var name = u ? u.username : '游客';
    var intro = u ? '已登录 · 账户积分与注单同步云端' : '登录后可查看账户积分并体验模拟投注';
    return catTabs('') + '<div class="page-head"><div><div class="page-kicker">PROFILE</div><h1 class="page-title">我的</h1><div class="page-sub">' + (u ? '已登录 · 演示账号' : '游客模式 · 演示账号') + '</div></div></div>' +
      '<section class="profile"><span class="avatar">' + (u ? esc(u.username.slice(0,1)) : '游') + '</span><div class="profile-main"><b>' + esc(name) + '</b><span>' + esc(intro) + '</span><span class="tag">DEMO ACCOUNT</span></div>' + (u ? '<button class="btn btn-ghost" type="button" data-logout>退出</button>' : '<a class="btn btn-primary" href="#/login">登录</a>') + '</section>' +
      '<div class="demo-account-note"><b>演示账户</b><span>本站不提供真实交易、账户或提现服务；账户积分与注单存储在云端。</span></div>' +
      '<div class="menu"><button class="menu-row" type="button" data-demo="安全中心为演示入口"><span class="menu-ico">⌁</span><span class="txt">安全中心</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="消息中心为演示入口"><span class="menu-ico">◌</span><span class="txt">消息中心</span><em>0 条</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="客服为演示入口"><span class="menu-ico">?</span><span class="txt">帮助与客服</span><em>演示</em><span class="arrow">›</span></button><button class="menu-row" type="button" data-demo="关于页面：演示站点，数据来自主站只读接口"><span class="menu-ico">i</span><span class="txt">关于本站</span><em>v0.4</em><span class="arrow">›</span></button></div>' +
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
  var ODDS = Object.assign({ special:48.8, oneZodiac:4.9, twoSide:1.96, color:2.8, specialZodiac:4.9, regular:7.8, miss:2.0, combo2:3.2, combo3:5.5, combo4:9.8, combo5:18.0 }, window.LH_ODDS || {});
  var BET_CATS = [
    { id:'two-side', name:'两面', short:'' },
    { id:'color', name:'色波', short:'' },
    { id:'special-zodiac', name:'特肖', short:'' },
    { id:'regular', name:'正码', short:'' },
    { id:'special', name:'正特', short:'' },
    { id:'regular6', name:'正码1-6', short:'' },
    { id:'combo', name:'连码', short:'' },
    { id:'one-zodiac', name:'平特一肖', short:'' },
    { id:'tail', name:'尾数', short:'' },
    { id:'combo-he', name:'合肖', short:'' }
  ];
  var betState = { game:'newhk', cat:'special', tab:'credit', qty:'1', sel:{} };
  var points = 0;
  var bets = [];
  function pointsBar() {
    var u = currentUser();
    if (!u) return '<div class="points-bar guest"><a class="points-login" href="#/login">登录</a><a class="points-help" href="#/howto">玩法说明</a></div>';
    return '<div class="points-bar"><span>账户积分</span><b data-points-value>' + points + '</b><span class="rt-status' + (rtState.degraded ? ' degraded' : '') + '" data-rt-status>实时:' + rtState.s + '</span><a class="points-help" href="#/howto">玩法说明</a></div>';
  }
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
      var o = (z === '马' && ODDS.horse) ? ODDS.horse : odds;
      return '<button type="button" class="bet-zodiac ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + z + '肖" data-odds="' + o + '"><span class="zcircle">' + z + '</span><em>' + o + '</em></button>';
    }).join('') + '</div>';
  }
  function numberGrid(prefix, odds, hideZodiac) {
    var out = '';
    for (var i = 1; i <= 49; i++) {
      var c = pad(i), a = attrFor(i), key = prefix + '-' + c, w = a.color === '红' ? 'r' : a.color === '蓝' ? 'b' : 'g';
      var z = hideZodiac ? '' : esc(a.z || '');
      var lab = hideZodiac ? c : (c + ' ' + (a.z || ''));
      out += '<button type="button" class="bet-num c-' + w + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + lab + '" data-odds="' + odds + '"><b>' + c + '</b>' + ( hideZodiac ? '' : '<i>' + z + '</i>' ) + '<em>' + odds + '</em></button>';
    }
    return '<div class="num-bet-grid">' + out + '</div>';
  }
  function optionGrid(items, prefix) {
    return '<div class="bet-options">' + items.map(function (x) {
      var key = prefix + '-' + x.k;
      return '<button type="button" class="bet-option ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + esc(x.n) + '" data-odds="' + x.o + '"' + (x.z ? ' data-zodiacs="' + x.z + '"' : '') + '><span>' + esc(x.n) + '</span><em>' + x.o + '</em></button>';
    }).join('') + '</div>';
  }
  function racingBalls() {
    var out = '';
    for (var i = 1; i <= 10; i++) {
      var c = colorOf(i), w = c === '红' ? 'r' : c === '蓝' ? 'b' : 'g';
      var key = 'race-' + pad(i);
      out += '<button type="button" class="bet-num racing c-' + w + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + pad(i) + '" data-odds="1.99"><b>' + pad(i) + '</b><em>1.99</em></button>';
    }
    return '<div class="racing-grid">' + out + '</div>';
  }
  function racingContent(cat) {
    var R = window.LH_RACING_ODDS || {};
    if (cat === 'champion' || cat === 'runner') {
      var o = (R[cat] || {});
      var items = [{ k:'big', n:'大', o:o.big }, { k:'small', n:'小', o:o.small }, { k:'odd', n:'单', o:o.odd }, { k:'even', n:'双', o:o.even }];
      if (cat === 'champion') { items.push({ k:'long', n:'1V10龙', o:o.long }); items.push({ k:'tiger', n:'1V10虎', o:o.tiger }); }
      return '<div class="bet-content-head"><div><h2>' + (cat === 'champion' ? '冠军' : '亚军') + '</h2><p>号码 01–10 · 固定球色</p></div></div>' + racingBalls() + optionGrid(items, cat === 'champion' ? 'rch' : 'rru');
    }
    var t = (R.twoSide || {});
    return '<div class="bet-content-head"><div><h2>两面</h2><p>大 2.19 / 小 1.79 · 单 1.79 / 双 2.19</p></div></div>' +
      optionGrid([{ k:'big', n:'大', o:t.big }, { k:'small', n:'小', o:t.small }, { k:'odd', n:'单', o:t.odd }, { k:'even', n:'双', o:t.even }], 'rtwo');
  }
  function zodiacNumberGrid(odds, hideZodiac) {
    var groups = {}, order = ZODIACS.slice();
    for (var i = 1; i <= 49; i++) { var a = attrFor(i), z = a.z || '其它'; (groups[z] = groups[z] || []).push(i); }
    return '<div class="zgroups">' + order.map(function (z) {
      var ns = groups[z] || [];
      return '<div class="zgroup"><div class="zgroup-h">' + z + '</div><div class="zgroup-nums">' + ns.map(function (n) {
        var key = 'special-n-' + pad(n);
        return '<button type="button" class="bet-num znum' + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + pad(n) + '" data-odds="' + odds + '"><b>' + pad(n) + '</b><em>' + odds + '</em></button>';
      }).join('') + '</div></div>';
    }).join('') + '</div>';
  }
  function betContent(cat) {
    var def = DEFS[betState.game] || {};
    if (def.racing) return racingContent(cat);
    var sp = Number(def.specialOdds || ODDS.special) || ODDS.special;
    var zo = Number(def.zodiacOdds || ODDS.oneZodiac) || ODDS.oneZodiac;
    var hideZ = !!def.hideZodiac;
    if (cat === 'special') return '<div class="bet-content-head"><div><h2>正特</h2><p>按生肖分组 · 每号赔率 ' + sp + '</p></div>' + betHelp('special') + '</div>' + zodiacNumberGrid(sp, hideZ);
    if (cat === 'one-zodiac') return '<div class="bet-content-head"><div><h2>一肖</h2><p>一肖 / 平特肖 ' + ODDS.oneZodiac + ' 倍 · 马 ' + (ODDS.horse || 1.8) + ' 倍</p></div>' + betHelp('one-zodiac') + '</div>' + zodiacGrid('one-z', ODDS.oneZodiac);
    if (cat === 'special-zodiac') return '<div class="bet-content-head"><div><h2>特肖</h2><p>只判断特码生肖，选一个生肖</p></div>' + betHelp('special-zodiac') + '</div>' + zodiacGrid('spz-z', zo);
    if (cat === 'two-side') return '<div class="bet-content-head"><div><h2>两面</h2><p>大小 / 单双 / 合单合双 / 尾数大小</p></div>' + betHelp('two-side') + '</div>' + optionGrid([{k:'big',n:'大',o:'1.96'},{k:'small',n:'小',o:'1.96'},{k:'odd',n:'单',o:'1.96'},{k:'even',n:'双',o:'1.96'},{k:'sum-odd',n:'合单',o:'1.96'},{k:'sum-even',n:'合双',o:'1.96'},{k:'tail-big',n:'尾大',o:'1.96'},{k:'tail-small',n:'尾小',o:'1.96'}], 'two');
    if (cat === 'color') return '<div class="bet-content-head"><div><h2>色波</h2><p>特码波色三选一</p></div>' + betHelp('color') + '</div>' + optionGrid([{k:'r',n:'红波',o:'2.8'},{k:'b',n:'蓝波',o:'2.8'},{k:'g',n:'绿波',o:'2.8'}], 'color');
    if (cat === 'regular6') return '<div class="bet-content-head"><div><h2>正码 1-6</h2><p>按位置结算</p></div>' + betHelp('regular') + '</div>' + optionGrid([{k:'1',n:'正码一',o:'7.8'},{k:'2',n:'正码二',o:'7.8'},{k:'3',n:'正码三',o:'7.8'},{k:'4',n:'正码四',o:'7.8'},{k:'5',n:'正码五',o:'7.8'},{k:'6',n:'正码六',o:'7.8'}], 'reg6');
    if (cat === 'tail') return '<div class="bet-content-head"><div><h2>尾数</h2><p>预测特码尾数 0–9</p></div></div>' + optionGrid([{k:'0',n:'尾0',o:'9.8'},{k:'1',n:'尾1',o:'9.8'},{k:'2',n:'尾2',o:'9.8'},{k:'3',n:'尾3',o:'9.8'},{k:'4',n:'尾4',o:'9.8'},{k:'5',n:'尾5',o:'9.8'},{k:'6',n:'尾6',o:'9.8'},{k:'7',n:'尾7',o:'9.8'},{k:'8',n:'尾8',o:'9.8'},{k:'9',n:'尾9',o:'9.8'}], 'tail');
    if (cat === 'combo-he') return '<div class="bet-content-head"><div><h2>合肖</h2><p>组合生肖命中即中</p></div></div>' + optionGrid([{k:'a',n:'鼠+牛+虎',o:'3.2',z:'鼠,牛,虎'},{k:'b',n:'兔+龙+蛇',o:'3.2',z:'兔,龙,蛇'},{k:'c',n:'马+羊+猴',o:'3.2',z:'马,羊,猴'},{k:'d',n:'鸡+狗+猪',o:'3.2',z:'鸡,狗,猪'}], 'he');
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
  function myBetsHtml() {
    var list = bets.filter(function (b) { return b.status === 'pending'; });
    return '<div class="my-bets"><div class="my-bets-head"><h2>待开奖注单</h2><span>云端记录 · 账户积分</span></div>' + (list.length ? list.slice(0, 4).map(function (b) {
      return '<div class="my-bet"><div class="my-bet-top"><span>第 ' + shortIssue(b.targetIssue) + ' 期</span><em class="pending">待开奖</em></div><div class="my-bet-sub">' + b.labels + ' · ' + b.qty + ' 注/项 · 消耗 ' + b.cost + ' 积分</div></div>';
    }).join('') : '<div class="my-bet-empty">暂无待开奖注单；结算功能暂未开放</div>') + '</div>';
  }
  function focusSafe() { var a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }
  function updateBetsOnly() {
    var box = document.querySelector('.my-bets'); if (!box || focusSafe()) return;
    box.outerHTML = myBetsHtml();
  }
  var RACING_COLORS = { '01':'#FFD700','02':'#1E5FD8','03':'#111111','04':'#FF6B00','05':'#00D8D8','06':'#7B2FF7','07':'#9E9E9E','08':'#E23A3A','09':'#8B5A2B','10':'#1FA85C' };
  var RACING_CATS5 = [
    { id:'two-side', name:'两面' }, { id:'first10', name:'第1-10名' }, { id:'sum', name:'冠亚和值' },
    { id:'combo', name:'冠亚组合' }, { id:'long', name:'长龙' }
  ];
  function raceBallHtml(n, cls) { var c = RACING_COLORS[pad(n)] || '#999'; return '<span class="race-ball ' + (cls || '') + '" style="--rc:' + c + '">' + pad(n) + '</span>'; }
  function raceZod(n) { var a = attrFor(n); return a.z || ''; }
  function raceCell(n, group) {
    var c = RACING_COLORS[pad(n)] || '#999', key = group + '-' + pad(n);
    var ro = rankOdds();
    return '<button type="button" class="rnum-cell ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + (group === 'r2' ? '亚军 ' : '') + pad(n) + ' " data-odds="' + ro + '">' +
      '<span class="rnum-sq" style="--rc:' + c + '">' + pad(n) + '</span><em class="rnum-odds">' + ro + '</em></button>';
  }
  function raceGrid(group) { var h = ''; for (var i = 1; i <= 10; i++) h += raceCell(i, group); return '<div class="rnum-grid">' + h + '</div>'; }
  function rankOdds() { var v = Number(ODDS.rank); return isFinite(v) && v > 0 ? v : 9.98; }
  function fmtOdds(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function rankCell(rank, num) {
    var key = 'r' + rank + ':' + pad(num);
    var c = RACING_COLORS[pad(num)] || '#999';
    var od = fmtOdds(rankOdds());
    return '<button type="button" class="rnum-cell rank-cell ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="第' + rank + '名 ' + pad(num) + '" data-odds="' + od + '">' +
      '<span class="rank-block" style="--rc:' + c + '">' + pad(num) + '</span><em class="rnum-odds">' + od + '</em></button>';
  }
  function rankSection(rank) {
    var cells = ''; for (var i = 1; i <= 10; i++) cells += rankCell(rank, i);
    return '<div class="rk-sec open" data-rank-sec="' + rank + '"><div class="rk-hd"><b>第' + rank + '名</b></div><div class="rk-body"><div class="rnum-grid">' + cells + '</div></div></div>';
  }
  function rankList() { var h = ''; for (var i = 1; i <= 10; i++) h += rankSection(i); return '<div class="rk-list">' + h + '</div>'; }
  function raceSummary(nums) {
    var vs = nums.map(function (x) { return parseInt(x && x.c, 10) || 0; });
    var sum;
    if (SUM_SOURCE === 'total') { sum = vs.slice(0, 10).reduce(function (a, b) { return a + b; }, 0); }
    else { sum = (vs[0] || 0) + (vs[1] || 0); } // 冠亚和
    var dragon = [];
    for (var k = 0; k < 5; k++) { var L = vs[k] || 0, R = vs[9 - k] || 0; dragon.push(L === R ? '和' : (L > R ? '龙' : '虎')); }
    return { sum: sum, big: sum >= 12 ? '大' : '小', odd: (sum % 2 === 1) ? '单' : '双', dragon: dragon };
  }
  function racingHeaderHtml(def, g) {
    var nums = (g && g.last && g.last.nums) || [];
    var has = nums.length >= 7;
    var boxes = '';
    for (var i = 0; i < 10; i++) {
      var t = has ? nums[i] : null;
      var raw = t ? parseInt(t.c, 10) : 0;
      var c = (raw >= 1 && raw <= 10) ? raw : (i + 1);
      boxes += '<span class="nbox" style="--rc:' + (RACING_COLORS[pad(c)] || '#999') + '">' + (has ? pad(c) : '—') + '</span>';
    }
    var last = (g && g.last && g.last.issue) || 1000001, next = (g && g.nextIssue) || (last + 1);
    var sm = raceSummary(has ? nums : []);
    var dragons = has ? sm.dragon.map(function (d) { return '<span class="lbox">' + d + '</span>'; }).join('') : '<span class="lbox">—</span>';
    var labelRow = '<div class="rr-labels"><span class="lbox wide">和值 ' + (has ? sm.sum : '—') + '</span><span class="lbox">' + (has ? sm.big : '—') + '</span><span class="lbox">' + (has ? sm.odd : '—') + '</span>' + dragons + '</div>';
    return '<div class="race-head">' +
      '<span class="race-title">' + esc(def.raceTitle || '极速赛车') + ' »</span>' +
      '<span class="race-mode">信用玩法 ▾</span>' +
      '<span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="race-result"><div class="rr-left"><div class="rr-issue">第 ' + last + ' 期开奖结果</div>' +
      '<div class="rr-nums">' + boxes + '</div>' + labelRow + '</div>' +
      '<div class="rr-right"><div class="rr-next">' + next + ' 期<i>封盘时间 ⏱</i></div><div class="rr-cd" data-race-cd data-close="' + ((g && g.mockNext) || 0) + '">00:00:04</div></div></div>' +
      '<div class="race-balance"><span>余额：<b>' + (parseInt(points, 10) || 0) + '</b> 积分</span><span class="rb-robot">🤖 机器选号</span><span class="rb-single"><i class="on"></i>快捷<i></i>一般</span></div>';
  }
  function menuHtml() {
    return ['投注记录: bets','玩法说明: howto','历史开奖: history','出码排行: rank','切换主题: theme','音效切换: sound','开奖网: open'].map(function (x) {
      var parts = x.split(': '); return '<button type="button" class="drop-item" data-menu="' + parts[1] + '">' + parts[0] + '</button>';
    }).join('');
  }
  function openMenu(anchor) {
    var old = document.querySelector('[data-drop-card]'); if (old) old.parentNode.removeChild(old.parentNode);
    var a = anchor ? anchor.getBoundingClientRect() : { right: innerWidth - 10, bottom: 60 };
    var w = 210, left = Math.max(8, Math.min(innerWidth - w - 8, a.right - w));
    var box = document.createElement('div'); box.className = 'drop-wrap';
    box.innerHTML = '<div class="drop-backdrop" data-menu-close></div><aside class="drop-card" data-drop-card>' + menuHtml() + '</aside>';
    document.body.appendChild(box);
    var card = box.querySelector('[data-drop-card]');
    card.style.left = left + 'px'; card.style.top = Math.round(a.bottom + 6) + 'px';
    requestAnimationFrame(function () { card.classList.add('show'); });
  }
  function closeMenu() {
    var c = document.querySelector('[data-drop-card]'); if (c) c.classList.remove('show');
    setTimeout(function () { var w = document.querySelector('.drop-wrap'); if (w) w.remove(); }, 180);
  }
  function applyTheme() { try { document.body.classList.toggle('dark-theme', localStorage.getItem('xc-theme') === 'dark'); } catch (e) {} }
  function racingPage(id, def, g) {
    if (!betState.raceCat || RACING_CATS5.map(function (x) { return x.id; }).indexOf(betState.raceCat) < 0) betState.raceCat = 'first10';
    if (!betState.raceOpen) betState.raceOpen = [1, 2];
    var cat = betState.raceCat;
    var body;
    if (cat === 'first10') body = rankList();
    else if (cat === 'two-side') {
      var R = window.LH_RACING_ODDS || {};
      var t = R.sum || R.twoSide || { big: 2.19, small: 1.79, odd: 1.79, even: 2.19 };
      var bsO = R.bs || { big: 1.99, small: 1.99 }, oeO = R.oe || { odd: 1.99, even: 1.99 };
      function optCell(key, label, odds) {
        return '<button type="button" class="bet-option ts-opt ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + label + '" data-odds="' + odds + '"><span>' + label + '</span><em>' + odds + '</em></button>';
      }
      var html = '<div class="ts-sec"><div class="ts-hd">冠亚和</div><div class="ts-grid">' +
        optCell('sum:big', '大', t.big) + optCell('sum:small', '小', t.small) + optCell('sum:odd', '单', t.odd) + optCell('sum:even', '双', t.even) + '</div></div>';
      // 名次数字：1-5 小、6-10 大；奇偶按号码
      for (var rk = 1; rk <= 10; rk++) {
        var sideLabel = '第' + rk + '名';
        html += '<div class="ts-sec"><div class="ts-hd">' + sideLabel + '</div><div class="ts-grid">' +
          optCell('r' + rk + ':bs:big', sideLabel + ' 大', bsO.big) + optCell('r' + rk + ':bs:small', sideLabel + ' 小', bsO.small) +
          optCell('r' + rk + ':oe:odd', sideLabel + ' 单', oeO.odd) + optCell('r' + rk + ':oe:even', sideLabel + ' 双', oeO.even) + '</div></div>';
      }
      body = html;
    } else if (cat === 'combo') {
      var R2 = window.LH_RACING_ODDS || {}, comboOdds = Number(R2.combo) || 42.5, comboHtml = '';
      for (var a1 = 1; a1 <= 9; a1++) {
        for (var b1 = a1 + 1; b1 <= 10; b1++) {
          var ck = 'combo:' + a1 + '_' + b1, cl = a1 + '_' + b1;
          comboHtml += '<button type="button" class="bet-option combo-cell ' + (isSel(ck) ? 'on' : '') + '" data-bet="' + ck + '" data-label="' + cl + '" data-odds="' + comboOdds + '"><span class="combo-name">' + cl + '</span><em class="combo-odds">' + fmtOdds(comboOdds) + '</em></button>';
        }
      }
      body = '<div class="combo-grid">' + comboHtml + '</div>';
    } else {
      body = '<div class="race-placeholder">' + esc((RACING_CATS5.filter(function (x) { return x.id === cat; })[0] || {}).name || '') + ' · 待开放</div>';
    }
    var chips = [10,20,50,100,200,500,1000].map(function (v, i) {
      var cc = ['#F5A623','#E23A3A','#1FA85C','#1E5FD8','#555555','#1E5FD8','#FFD700'][i] || '#999';
      return '<button type="button" class="race-chip ' + (String(betState.qty) === String(v) ? 'on' : '') + '" data-qty="' + v + '" style="--cc:' + cc + '">' + v + '</button>';
    }).join('');
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + racingHeaderHtml(def, g) +
      '<div class="race-layout"><div class="race-cats">' + RACING_CATS5.map(function (c) {
        return '<button type="button" class="race-cat ' + (cat === c.id ? 'on' : '') + '" data-race-cat="' + c.id + '"><i></i>' + c.name + '</button>';
      }).join('') + '</div><div class="race-main">' + body + '</div></div>' +
      '<div class="race-picked">已选：<b data-picked-list>—</b></div>' +
      '<div class="bet-hint" data-bet-hint></div>' +
      '<div class="race-closed" data-closed hidden><div><b>已停止投注</b><span>下一期已开盘，投注时请注意期号</span></div><button type="button" data-race-next>知道了</button></div>' +
      '<div class="race-chips">' + chips + '</div>' +
      '<div class="race-amount"><label>金额：</label><input id="betQty" type="text" inputmode="numeric" value="' + esc(betState.qty) + '"><span class="race-unit">积分</span><button type="button" class="race-quick">快捷金额</button><button type="button" class="race-reset" data-race-reset>重置</button><button type="button" class="race-submit" data-bet-submit>下注</button></div>' +
      '<div class="race-keypad" id="raceKeypad" hidden>' + [1,2,3,4,5,6,7,8,9].map(function (d) { return '<button type="button" data-kp="' + d + '">' + d + '</button>'; }).join('') + '<button type="button" data-kp="del">删除</button><button type="button" data-kp="0">0</button><button type="button" data-kp="ok">确定</button></div>' +
      '<div class="race-foot">一共 <b data-bet-count>0</b> 注，共 <b data-bet-cost>0</b> 积分</div>';
  }
  function betPage(id) {
    if (betState.game !== id) { betState.game = id; betState.sel = loadSel(id); }
    var def = DEFS[id] || DEFS.newhk;
    if (def.mock && (!FAST[id] || !FAST[id].data || (Date.now() - (FAST[id].lastTry || 0) > 5500))) syncFastIssue(id);
    var g = state.games[id] || (def.mock && FAST[id] && FAST[id].data ? shapeFast(id, FAST[id].data) : mockGame(id));
    if (def.mock && !state.games[id]) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + '<div class="data-empty" style="padding:40px 16px">正在读取服务端期号…</div>';
    if (def.racing) return betZeroBanner() + racingPage(id, def, g);
    if (def.racing && !(def.cats || []).length) { /* racing 用 RACING_CATS */ }
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + emptyState(def.note || '该彩种数据待接入');
    if (!g) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + emptyState('正在读取 ' + def.name + ' 数据…');
    var open = betBalls(g.last.nums);
    var zeroTip = betZeroBanner();
    var title = def.name + (def.mock ? '' : '六合彩');
    var credit = betState.tab === 'credit';
    var cat = betState.cat || 'special';
    var validCats = (def.racing ? RACING_CATS : BET_CATS).map(function (c) { return c.id; });
    if (validCats.indexOf(cat) < 0) cat = def.racing ? 'two-side' : 'special';
    betState.cat = cat;
    var qty = parseInt(betState.qty, 10) || 1;
    var cost = totalNotes() * 2;
    var gc = gameConfigs[id];
    var cfgNote = gc ? '<div class="bet-cfg">开奖配置：' + (gc.mode === 'manual' ? '手动 ' + (gc.forcedResult || '') : '随机') + ' · 难度 ' + (gc.difficulty === 'easy' ? '易' : gc.difficulty === 'hard' ? '难' : '中') + '</div>' : '';
    var my = myBetsHtml();
    return '<a class="back-link" href="' + (def.mock ? '#/lotteryhall' : '#/game/' + id) + '">‹ 返回 ' + (def.mock ? '大厅' : def.name + '详情') + '</a>' + pointsBar() + zeroTip +
      (def.mock ? '<div class="fast-meta">周期 <b>' + esc(def.period || '1分钟') + '</b> · <b data-fast-issue="' + id + '">第 — 期</b> · <span data-fast-count="' + id + '">—</span></div>' : '') +
      '<div class="bet-hero"><div class="bet-head"><div><span class="bet-kicker">模拟投注 · 仅演示</span><h1>' + title + '</h1><div class="bet-period">第 <b>' + shortIssue(g.last.issue) + '</b> 期 · 下期 ' + shortIssue(g.nextIssue) + '</div></div><div class="bet-clock">投注中<br><b data-cd="' + id + '">' + countdownText(g) + '</b></div></div>' +
      '<div class="bet-open"><div class="bet-open-label">上期开奖 <span>第 ' + shortIssue(g.last.issue) + ' 期</span></div><div class="bet-open-balls">' + open.html + '<span class="bet-sum">总和 <b>' + open.sum + '</b></span></div></div></div>' +
      '<div class="bet-tabs"><button type="button" class="' + (credit ? 'on' : '') + '" data-bet-tab="credit">信用</button><button type="button" class="' + (!credit ? 'on' : '') + '" data-bet-tab="path">路子图</button></div>' +
      (credit ? '<div class="bet-layout"><div class="bet-cats">' + (def.racing ? RACING_CATS : BET_CATS).map(function (c) { return '<button type="button" class="' + (cat === c.id ? 'on' : '') + '" data-bet-cat="' + c.id + '"><span>' + c.short + '</span>' + c.name + '</button>'; }).join('') + '</div><div class="bet-center">' + betContent(cat) + '</div></div>' : '<div class="bet-path">' + emptyState('路子图演示占位，暂未开放') + '</div>') +
      '<div class="picked-bar">已选：<b data-picked-list>—</b> · <b data-bet-count>0</b> 注 · 共 <b data-bet-cost>0</b> 分</div>' +
      '<div class="odds-note">演示赔率，非真实 · 每注固定 2 积分 · 不构成任何投注建议</div>' + cfgNote + my +
      '<div class="bet-bar"><div class="bet-bar-row"><span class="bet-label">注数</span>' + [10,20,50,100,200,500,1000].map(function (n) { return '<button type="button" class="amount-chip ' + (String(qty) === String(n) ? 'on' : '') + '" data-qty="' + n + '">' + n + '</button>'; }).join('') + '<input id="betQty" type="text" inputmode="numeric" placeholder="自定义" value="' + esc(qty) + '"></div><div class="bet-bar-row"><span class="bet-selected">已选 <b data-bet-count>' + totalNotes() + '</b> 注 · 需 <b data-bet-cost>' + cost + '</b> 积分</span><button type="button" class="bet-clear" data-bet-clear>清空</button><button type="button" class="bet-submit" data-bet-submit>立即投注</button></div><div class="bet-hint" data-bet-hint></div></div>';
  }
  function howtoPage(anchor) {
    var active = anchor || 'special';
    var nav = HOWTO.map(function (h) { return '<a class="' + (h.id === active ? 'on' : '') + '" href="#/howto/' + h.id + '">' + h.name + '</a>'; }).join('');
    var blocks = HOWTO.map(function (h) {
      return '<section class="howto-block" id="howto-' + h.id + '"><div class="howto-head"><h2>' + h.name + '</h2><span>演示赔率 ' + h.odds + '</span></div><p><b>规则：</b>' + h.rule + '</p><p><b>举例：</b>' + h.example + '</p><a class="howto-back" href="#/bet/newhk">去模拟投注 →</a></section>';
    }).join('');
    return '<div class="page-head"><div><div class="page-kicker">PLAY GUIDE</div><h1 class="page-title">玩法说明</h1><div class="page-sub">纯演示 · 赔率非真实</div></div><span class="demo-pill">DEMO</span></div><nav class="howto-nav">' + nav + '</nav><div class="howto-points"><b>账户积分怎么玩</b><p>注册后账户积分由 Appwrite 云端账户提供，初始 0；需管理员加分后才能投注；每注固定消耗 2 积分，选号后选择注数并记录模拟注单。开奖与结算暂未开放，积分以云端账户为准。</p></div><div class="howto-list">' + blocks + '</div><div class="mini-note">所有玩法均为模拟演示，不构成任何投注建议。</div>';
  }
  function loginPage() {
    var register = authMode === 'register';
    return '<div class="auth-page"><div class="auth-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-logo"></use></svg></div><div class="page-kicker">LUCKY HALL ACCOUNT</div><h1 class="auth-title">' + (register ? '注册演示账号' : '登录幸运大厅') + '</h1><p class="auth-sub">Appwrite 真实演示账号；积分和注单写入 lottery 数据库，不涉及真实支付。</p>' +
      '<div class="auth-tabs"><button type="button" class="' + (!register ? 'on' : '') + '" data-auth-mode="login">登录</button><button type="button" class="' + (register ? 'on' : '') + '" data-auth-mode="register">注册</button></div>' +
      '<form id="authForm" class="auth-form"><label>用户名<input id="authUser" autocomplete="username" maxlength="20" placeholder="例如：幸运玩家"></label><label>密码<input id="authPass" type="password" autocomplete="current-password" maxlength="30" placeholder="至少 8 位"></label><div id="authError" class="auth-error"></div><button class="auth-submit" type="submit">' + (register ? '注册并登录' : '登录') + '</button></form>' +
      '<div class="auth-tip">账号由 Appwrite 管理，仅用于本演示站；请勿使用真实密码。<br>登录后可查看数据库积分并体验模拟投注。</div><a class="auth-back" href="#/lotteryhall">先逛逛大厅 →</a></div>';
  }
  function soonPage(title, note) { return '<div class="page-head"><div><div class="page-kicker">COMING SOON</div><h1 class="page-title">' + title + '</h1><div class="page-sub">' + note + '</div></div></div><div class="data-empty" style="padding:40px 20px">该板块为演示占位，待接入后开放。</div>'; }
  function galleryPage() { return soonPage('49 图库', 'Demo · 图库待接入'); }
  function supportPage() { return soonPage('客服', 'Demo · 在线客服待接入'); }
  var ROUTES = { lotteryhall: hallPage, history: historyPage, trend: trendPage, rank: rankPage, bets: betsPage, me: mePage, points: mePage, gallery: galleryPage, support: supportPage };
  var TITLES = { lotteryhall: '彩票大厅', history: '开奖记录', trend: '号码走势', rank: '高手排行', bets: '投注记录', me: '我的', points: '我的积分', gallery: '49图库', support: '客服', howto: '玩法说明', login: '登录' };
  function currentRoute() {
    var h = String(location.hash || '').replace(/^#\/?/, ''), parts = h.split('/');
    if (parts[0] === 'game' && DEFS[parts[1]]) return { name: 'game', id: parts[1] };
    if (parts[0] === 'bet' && DEFS[parts[1]]) return { name: 'bet', id: parts[1] };
    if (parts[0] === 'howto') return { name: 'howto', anchor: parts[1] || '' };
    if (parts[0] === 'login') return { name: 'login', id: null };
    return { name: ROUTES[parts[0]] ? parts[0] : 'lotteryhall', id: null };
  }
  function setBottomTab(name) { var tab = name === 'game' ? 'lotteryhall' : name; $$('.bottomtab a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-tab') === tab); }); }
  function updateCountdowns() {
    try {
      var cdEl = document.querySelector('[data-race-cd]');
      if (cdEl) {
        var d = DEFS[betState.game] || {}; var closeAt = Number(cdEl.getAttribute('data-close')) || 0;
        var sec = Number(d.periodSec || d.periodSeconds) || 60;
        var left = closeAt > Date.now() ? Math.round((closeAt - Date.now()) / 1000) : (sec - (Math.floor(Date.now() / 1000) % sec));
        // 封盘窗口：显示遮罩 + 禁用下注
        var closed = !!(closeAt && Date.now() >= closeAt);
        var closedEl = document.querySelector('[data-closed]');
        if (closedEl) closedEl.hidden = !closed;
        var subBtn = document.querySelector('[data-bet-submit]');
        if (subBtn) {
          var noPts = (parseInt(points, 10) || 0) <= 0;
          subBtn.disabled = closed || noPts;
          subBtn.textContent = noPts ? '积分不足' : (closed ? '已停止投注' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注'));
        }
        // 到期后每 5s 拉 /issues
        if (closeAt && Date.now() >= closeAt && Date.now() - (FAST[betState.game] && FAST[betState.game].lastTry || 0) > 5000) syncFastIssue(betState.game);
        var hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60;
        cdEl.textContent = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
      }
    } catch (e) {}
  }
  function updateCountdownsLegacy() { $$('[data-cd]').forEach(function (el) { var g = state.games[el.getAttribute('data-cd')]; if (g) el.textContent = countdownText(g); }); }
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
    if (r.name === 'bet' && !currentUser() && !authReady) { view.innerHTML = '<div class="data-empty" style="padding:50px 20px">正在验证登录状态…</div>'; return; }
    if (r.name === 'bet' && !currentUser()) { AUTH_NEXT = '#/bet/' + r.id; location.hash = '#/login'; return; }
    if (r.name === 'bet') betState.game = r.id;
    document.body.classList.toggle('bet-mode', r.name === 'bet');
    document.body.classList.toggle('race-mode', r.name === 'bet' && !!DEFS[r.id] && !!DEFS[r.id].racing);
    if (r.name === 'game') view.innerHTML = gamePage(r.id);
    else if (r.name === 'bet') { view.innerHTML = betPage(r.id); updateBetBar(); }
    else if (r.name === 'howto') view.innerHTML = howtoPage(r.anchor);
    else if (r.name === 'login') view.innerHTML = loginPage();
    else if (r.name === 'rank') { view.innerHTML = rankPage(); loadRankLive(); }
    else view.innerHTML = ROUTES[r.name] ? ROUTES[r.name]() : hallPage();
    setBottomTab(r.name);
    var ttl = r.name === 'game' ? DEFS[r.id].name + '开奖' : (r.name === 'bet' ? (DEFS[r.id].name + '模拟投注') : (r.name === 'howto' ? '玩法说明' : (r.name === 'login' ? '登录 / 注册' : TITLES[r.name])));
    document.title = ttl + ' · 彩票大厅（演示）';
    if (!keepScroll) {
      if (r.name === 'howto' && r.anchor) setTimeout(function () { var el = document.getElementById('howto-' + r.anchor); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo(0, 0); }, 30);
      else window.scrollTo(0, 0);
    }
    clearInterval(countdownTimer); updateCountdowns(); countdownTimer = setInterval(updateCountdowns, 1000);
    updateUserChip();
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
  function settleBets() { /* 云端结算未开放，注单保持 pending；不再本地结算 */ }
  function updateBetBar() {
    var notes = totalNotes(), cost = notes * 2;
    $$('[data-bet-count]').forEach(function (el) { el.textContent = notes; });
    $$('[data-bet-cost]').forEach(function (el) { el.textContent = cost; });
    var picks = [];
    Object.keys(betState.sel || {}).forEach(function (k) { picks.push(betState.sel[k] || k); });
    $$('[data-picked-list]').forEach(function (el) { el.textContent = picks.length ? picks.join(' ') : '—'; });
    var input = $('#betQty'); if (input && document.activeElement !== input && String(input.value) !== String(betState.qty)) input.value = betState.qty;
    $$('.amount-chip').forEach(function (b) { b.classList.toggle('on', String(b.getAttribute('data-qty')) === String(betState.qty)); });
    var insuff = (points <= 0) || (notes > 0 && cost > points);
    var hint = $('[data-bet-hint]'); if (hint) { hint.textContent = insuff ? (points <= 0 ? '积分不足，请联系管理员加分后再投注' : '积分不足，无法投注（当前 ' + points + '，需要 ' + cost + '）') : ''; hint.classList.toggle('show', insuff); }
    var submit = $('[data-bet-submit]'); if (submit) { submit.disabled = insuff || betSubmitting; submit.textContent = betSubmitting ? '投注中…' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注'); }
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
    if (e.target.closest('[data-dismiss-reg]')) { try { sessionStorage.removeItem('xcRegZero'); } catch (x) {} regZeroNotice = false; var bn = document.querySelector('[data-reg-banner]'); if (bn) bn.remove(); return; }
    if (e.target.closest('[data-menu-close]')) { closeMenu(); return; }
    var mi = e.target.closest('[data-menu]');
    if (mi) {
      var act = mi.getAttribute('data-menu'); closeMenu();
      if (act === 'theme') {
        var dark = !document.body.classList.contains('dark-theme');
        document.body.classList.toggle('dark-theme', dark);
        try { localStorage.setItem('xc-theme', dark ? 'dark' : 'light'); } catch (e) {}
        showToast(dark ? '已切换深色主题' : '已切换浅色主题'); return;
      }
      if (act === 'sound') {
        var on = true; try { on = localStorage.getItem('xc-sound') !== '0'; } catch (e) {}
        on = !on; try { localStorage.setItem('xc-sound', on ? '1' : '0'); } catch (e) {}
        showToast(on ? '音效已开启（暂无音效）' : '音效已关闭（暂无音效）'); return;
      }
      if (act === 'open') { window.open('https://byd666-wq.github.io/xingchen-caixun/', '_blank'); return; }
      location.hash = '#/' + act; return;
    }
    if (e.target.closest('.race-menu')) { openMenu(e.target.closest('.race-menu')); return; }
    if (e.target.closest('.race-help')) { openMenu(e.target.closest('.race-help')); return; }
    var soon = e.target.closest('[data-soon]'); if (soon) { e.preventDefault(); showModal(soon.getAttribute('data-soon') + ' 暂未接入，敬请期待'); return; }
    var demo = e.target.closest('[data-demo]'); if (demo) { e.preventDefault(); showModal(demo.getAttribute('data-demo')); return; }
    if (e.target.closest('[data-close-modal]')) { closeModal(); return; }
    var betLink = e.target.closest('a[href^="#/bet/"]');
    if (betLink && !currentUser()) { e.preventDefault(); AUTH_NEXT = betLink.getAttribute('href'); location.hash = '#/login'; showToast('请先登录后投注'); return; }
    var chip = e.target.closest('#userChip');
    if (chip) { if (currentUser()) location.hash = '#/me'; else { AUTH_NEXT = '#/lotteryhall'; location.hash = '#/login'; } return; }
    var modeBtn = e.target.closest('[data-auth-mode]');
    if (modeBtn) { authMode = modeBtn.getAttribute('data-auth-mode'); render(true); return; }
    if (e.target.closest('[data-logout]')) {
      var resetOnLogout = !(window.LH_RULES && window.LH_RULES.resetOnLogout === false);
      var uid = awUser && awUser.$id;
      (async function () {
        var ok = false;
        if (resetOnLogout && uid) {
          try { await window.LotteryAPI.call('/reset-points', { method: 'POST', body: {} }); ok = true; } catch (e) { ok = false; }
        }
        points = resetOnLogout ? 0 : points;
        logoutUser(); AUTH_NEXT = '#/lotteryhall'; updateUserChip(); location.hash = '#/lotteryhall';
        if (resetOnLogout) showModal('已退出登录' + (ok ? '，账号积分已清零' : '（积分清零接口未就绪，已本地清零）') + '。退出清分由后台 resetOnLogout 控制。');
        else showToast('已退出登录（后台未开启退出清零，积分保留）');
      })();
      return;
    }
    var hg = e.target.closest('[data-history-game]'); if (hg) { historyGame = hg.getAttribute('data-history-game'); render(); return; }
    var dot = e.target.closest('[data-slide]'); if (dot) { var i = parseInt(dot.getAttribute('data-slide'), 10); var slides = $$('#hallBanner .slide'), dots = $$('#hallBanner .dots button'); slides.forEach(function (s, j) { s.classList.toggle('on', j === i); }); dots.forEach(function (d, j) { d.classList.toggle('on', j === i); }); bannerIndex = i; return; }
    var bc = e.target.closest('[data-bet-cat]');
    if (bc) { betState.cat = bc.getAttribute('data-bet-cat'); render(true); return; }
    var bt = e.target.closest('[data-bet-tab]');
    if (bt) { betState.tab = bt.getAttribute('data-bet-tab'); render(true); return; }
    var bb = e.target.closest('[data-bet]');
    if (bb) {
      var key = bb.getAttribute('data-bet');
      if (betState.sel[key]) delete betState.sel[key]; else betState.sel[key] = (bb.getAttribute('data-label') || key);
      bb.classList.toggle('on', !!betState.sel[key]);
      saveSel(); updateBetBar(); return;
    }
    var am = e.target.closest('[data-qty]');
    if (am) { betState.qty = am.getAttribute('data-qty'); updateBetBar(); return; }
    if (e.target.closest('#betQty')) { var kp = document.getElementById('raceKeypad'); if (kp) kp.hidden = false; KP_FRESH = true; return; }
    if (e.target.closest('[data-race-next]')) { var cl = document.querySelector('[data-closed]'); if (cl) cl.hidden = true; syncFastIssue(betState.game); return; }
    var kb = e.target.closest('[data-kp]');
    if (kb) {
      var key = kb.getAttribute('data-kp'), inp = document.getElementById('betQty');
      if (inp) {
        if (key === 'del') { inp.value = String(inp.value || '').slice(0, -1) || '1'; KP_FRESH = false; }
        else if (key === 'ok') { var kp2 = document.getElementById('raceKeypad'); if (kp2) kp2.hidden = true; }
        else { inp.value = KP_FRESH ? key : (String(inp.value === '0' ? '' : (inp.value || '')) + key); KP_FRESH = false; }
        betState.qty = inp.value || '1'; updateBetBar();
      }
      return;
    }
    var rt2 = e.target.closest('[data-rank-toggle]');
    if (rt2) {
      var rk = parseInt(rt2.getAttribute('data-rank-toggle'), 10);
      if (!betState.raceOpen) betState.raceOpen = [1, 2];
      var idx = betState.raceOpen.indexOf(rk);
      if (idx >= 0) betState.raceOpen.splice(idx, 1); else betState.raceOpen.push(rk);
      render(true); return;
    }
    var rc = e.target.closest('[data-race-cat]');
    if (rc) { betState.raceCat = rc.getAttribute('data-race-cat'); render(true); return; }
    if (e.target.closest('[data-race-reset]')) { betState.sel = {}; betState.qty = '1'; saveSel(); render(true); return; }
    if (e.target.closest('.race-quick')) { betState.qty = '100'; updateBetBar(); render(true); return; }
    if (e.target.closest('[data-bet-clear]')) { betState.sel = {}; betState.qty = '1'; saveSel(); render(true); return; }
    if (e.target.closest('[data-bet-submit]')) {
      if (betSubmitting) return;
      if (!currentUser()) { AUTH_NEXT = '#/bet/' + (betState.game || 'newhk'); location.hash = '#/login'; return; }
      var nodes = $$('[data-bet].on');
      var qty = parseInt(betState.qty, 10);
      if (!nodes.length) { showToast('请先选择玩法'); return; }
      if (!qty || qty < 1) { showToast('请输入注数'); return; }
      var notes = nodes.length * qty, cost = notes * 2;
      var g = state.games[betState.game] || mockGame(betState.game);
      if (!g) { showToast('彩种数据未就绪'); return; }
      if (points <= 0) { updateBetBar(); var zh = document.querySelector('[data-bet-hint]'); if (zh) { zh.textContent = '积分不足，请联系管理员加分后再投注'; zh.classList.add('show'); } return; }
      if (cost > points) { updateBetBar(); var zh2 = document.querySelector('[data-bet-hint]'); if (zh2) { zh2.textContent = '积分不足，无法投注（当前 ' + points + '，需要 ' + cost + '），请联系管理员加分'; zh2.classList.add('show'); } return; }
      var selections = nodes.map(function (el) { var key = el.getAttribute('data-bet'); return { key:key, label:el.getAttribute('data-label') || key, odds:parseFloat(el.getAttribute('data-odds')) || 0, zodiacs:el.getAttribute('data-zodiacs') || '' }; });
      betSubmitting = true; updateBetBar();
      (async function () {
        try {
          // 只传号码（Function 结算按开奖号码匹配）；生肖/两面等取 label 文本
          var pickIds = selections.map(function (s) {
            var key = String(s.key || '');
            if (/^r\d{1,2}:\d{2}$/.test(key)) return key;              // 赛车名次：r3:07
            if (/^sum:(big|small|odd|even)$/.test(key)) return key;      // 冠亚和：sum:big
            if (/^combo:\d{1,2}_\d{1,2}$/.test(key)) return key;          // 冠亚组合：combo:1_2
            if (/^r\d{1,2}:(bs|oe):(big|small|odd|even)$/.test(key)) return key; // 名次大小/单双
            if (key.indexOf('race-') === 0) return key.slice(5);        // 赛车冠军/亚军旧格式
            var m = key.match(/(\d{2})$/);
            return m ? m[1] : String(s.label || s.key);
          });
          // 幂等键：连点/重试不会重复扣分（Function 按 idempotencyKey 去重）
          var idem = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : ('idem-' + Date.now() + '-' + Math.random().toString(36).slice(2));
          var res = await window.LotteryAPI.call('/bet', { method: 'POST', body: {
            gameId: betState.game, issue: Number(g.nextIssue), stake: cost, picks: pickIds, idempotencyKey: idem
          } });
          var newPoints = (res && res.user && res.user.points != null) ? parseInt(res.user.points, 10) : ((res && res.points != null) ? parseInt(res.points, 10) : (points - cost));
          if (isFinite(newPoints)) { points = newPoints; awRow.points = newPoints; }
          var bet = (res && res.bet) || {};
          bets.unshift({ id: bet.id || bet.$id || idem, game: betState.game, targetIssue: bet.issue || g.nextIssue, placedIssue: g.last.issue, qty: qty, cost: cost, notes: notes, selections: selections, labels: selections.map(function (s) { return s.label; }).join('、'), status: bet.status || 'pending', payout: Number(bet.payout) || 0, created: Date.now() });
          betState.sel = {}; betState.qty = '1'; betSubmitting = false; updateBetBar(); render(true);
          showModal('投注已记录，账户积分已扣减 ' + cost + ' 分。演示站点 · 不构成任何投注建议。');
        } catch (err) {
          betSubmitting = false; updateBetBar();
          showModal(String((err && err.message) || '网络异常，请重试').slice(0, 120));
        }
      })();
      return;
    }
    if (e.target.closest('#refreshDataBtn')) { loadData(false); return; }
  });
  document.addEventListener('submit', async function (e) {
    if (!e.target || e.target.id !== 'authForm') return;
    e.preventDefault();
    var box = $('#authError'); if (box) box.textContent = '正在连接 Appwrite…';
    var wasRegister = authMode === 'register';
    var err = wasRegister ? await registerUser($('#authUser') && $('#authUser').value, $('#authPass') && $('#authPass').value) : await loginUser($('#authUser') && $('#authUser').value, $('#authPass') && $('#authPass').value);
    if (err) { if (box) box.innerHTML = err; return; }
    var next = AUTH_NEXT || '#/lotteryhall'; AUTH_NEXT = '#/lotteryhall';
    if (wasRegister) { regZeroNotice = true; try { sessionStorage.setItem('xcRegZero', '1'); } catch (e) {} }
    location.hash = next; updateUserChip();
    showToast(wasRegister ? '账号已创建，当前积分 0，请联系管理员加分' : '登录成功，已加载账户积分');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', function () { render(); });
  if (!location.hash) location.hash = '#/lotteryhall';
  applyTheme(); render(); loadData(true); initAuth(); setInterval(function () { if (!document.hidden) loadData(true); }, 30000);
  // 快开：每秒刷新期号/倒计时；到新周期调 /settle（带 cron 触发头，Function 允许）
  var FAST_LAST = {};
  setInterval(function () {
    var els = document.querySelectorAll('[data-fast-count]');
    Array.prototype.forEach.call(els, function (el) {
      var id = el.getAttribute('data-fast-count'); var def = DEFS[id]; if (!def) return;
      var sec = Number(def.periodSec || def.periodSeconds) || 60;
      var now = Math.floor(Date.now() / 1000);
      el.textContent = '剩 ' + (sec - (now % sec)) + ' 秒';
      var issue = Math.floor(now / sec);
      var issueEl = document.querySelector('[data-fast-issue="' + id + '"]');
      if (issueEl) issueEl.textContent = '第 ' + (100000 + (issue % 900000)) + ' 期';
      if (FAST_LAST[id] != null && FAST_LAST[id] !== issue) {
        try { window.LotteryAPI.call('/settle', { method: 'POST', body: { gameId: id }, headers: { 'x-appwrite-trigger': 'schedule' } }).catch(function () {}); } catch (e) {}
      }
      FAST_LAST[id] = issue;
    });
  }, 1000);

})();
