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
    { id:'fast-airship-5', name:'幸运飞艇5分', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'艇', color:'#4aa99d', drawKey:'mock', racing:true },
    { id:'fast-bjrace', name:'北京赛车', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'北', color:'#7b68c8', drawKey:'mock', racing:true },
    { id:'fast-luckyrace', name:'幸运赛车', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'运', color:'#e6a62f', drawKey:'mock', racing:true },
    { id:'fast-ship10', name:'澳洲幸运10', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'澳', color:'#5a8fd4', drawKey:'mock', racing:true },
    { id:'fast-tensc', name:'极速时时彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'时', color:'#5a7bd4', drawKey:'mock', racing:true },
    { id:'fast-txffc', name:'腾讯分分彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'分', color:'#687bd0', drawKey:'mock', racing:true },
    { id:'fast-race-1', name:'1分钟赛车', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'1', color:'#4d8fd8', drawKey:'mock', racing:true },
    { id:'fast-race-2', name:'2分钟赛车', provider:'快开', enabled:true, mock:true, period:'2分钟', periodSec:120, icon:'2', color:'#5a7bd4', drawKey:'mock', racing:true },
    { id:'fast-race-5', name:'5分钟赛车', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'5', color:'#687bd0', drawKey:'mock', racing:true },
    { id:'fast-race-10', name:'10分钟赛车', provider:'快开', enabled:true, mock:true, period:'10分钟', periodSec:600, icon:'10', color:'#7b68c8', drawKey:'mock', racing:true },
    { id:'fast-race-30', name:'30秒赛车', provider:'快开', enabled:true, mock:true, period:'30秒', periodSec:30, icon:'30', color:'#5a7bd4', drawKey:'mock', racing:true },
    { id:'fast-mark6-1', name:'一分钟六合彩', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'六', color:'#e39b38', drawKey:'mock', specialOdds:48.8 },
    { id:'fast-mark6-5', name:'5分钟六合彩', provider:'快开', enabled:true, mock:true, period:'5分钟', periodSec:300, icon:'5', color:'#d36d55', drawKey:'mock', specialOdds:48.8 },
    { id:'fast-k3', name:'快三', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'快', color:'#d45f82', drawKey:'mock' },
    { id:'fast-airship', name:'一分飞艇', provider:'快开', enabled:true, mock:true, period:'1分钟', periodSec:60, icon:'艇', color:'#4aa99d', drawKey:'mock', racing:true },
    { id:'oldmo', name:'老澳', provider:'待接入', enabled:false, icon:'老', color:'#8d98aa', note:'老澳数据待接入，接入后自动开放' }
  ];
  var DEFS = {};
  CONFIG.forEach(function (g) { DEFS[g.id] = g; });
  var ORDER = CONFIG.filter(function (g) { return g.enabled; }).map(function (g) { return g.id; });
  var PLACEHOLDERS = CONFIG.filter(function (g) { return !g.enabled; });
  var RED = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
  var BLUE = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
  var KEY = 'Xc9vF2026';
  var state = { games: {}, config: {}, attrs: {}, win: {}, histApi: {}, histLoading: {}, noticeDismissed: {}, closedPrev: {}, closedDismissed: {}, closedShown: {}, updated: 0, error: '', loading: false };
  function noticeHash(s) { var h = 0; for (var i = 0; i < String(s).length; i++) { h = ((h << 5) - h + String(s).charCodeAt(i)) | 0; } return 'n' + ((h >>> 0).toString(36)); }
  function noticeIsDismissed(id) { if (state.noticeDismissed[id]) return true; try { return localStorage.getItem('noticeDismissed:' + id) === '1'; } catch (e) { return false; } }
  function dismissNotice(id) { if (!id) return; state.noticeDismissed[id] = true; try { localStorage.setItem('noticeDismissed:' + id, '1'); } catch (e) {} }
  var homeTab = 'hot';
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
  function shortIssue(v) { if (v && typeof v === 'object') v = v.issueLabel || v.issue; var s = String(v == null ? '' : v).replace(/\s*期\s*$/, ''); return s.length >= 7 ? s : s.slice(-3); }
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
    if (!game) return null;
    now = now || new Date(); var cfg = game.timeCfg; if (!cfg) return null;
    for (var i = 0; i < 15; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, cfg.hour, cfg.minute, 0, 0);
      if (d.getTime() <= now.getTime()) continue;
      if (cfg.days.indexOf(d.getDay()) < 0) continue;
      return d;
    }
    return null;
  }
  function countdownText(game) {
    if (!game) return '--:--:--';
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
  function loadData(silent, soft) {
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
      if (!silent) showToast('数据已更新');
      if (!soft) render(true);
    }).catch(function (e) {
      state.error = String(e && e.message || e); if (!soft && !state.games.newhk && !state.games.newmo && !state.games.hk) render(true); if (!silent) showToast('刷新失败，稍后重试');
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
    { name:'新香港六合彩', id:'newhk', game:true, color:'#e6a62f', icon:'新' },
    { name:'极速六合彩', id:'fast-mark6-1', color:'#e39b38', icon:'六' },
    { name:'香港六合彩', id:'hk', color:'#d94b62', icon:'香' },
    { name:'新澳门六合彩', id:'newmo', color:'#3d8ed0', icon:'澳' },
    { name:'澳门六合彩', soon:true, color:'#4aa99d', icon:'门' },
    { name:'极速快三', id:'fast-k3', color:'#d45f82', icon:'快' },
    { name:'腾讯分分彩', id:'fast-txffc', color:'#687bd0', icon:'分' },
    { name:'极速28', soon:true, color:'#d08a3f', icon:'28' },
    { name:'幸运28', soon:true, color:'#c9a23f', icon:'幸' },
    { name:'澳洲幸运10', id:'fast-ship10', color:'#5a8fd4', icon:'澳' },
    { name:'幸运飞艇', id:'fast-airship-5', color:'#4aa99d', icon:'飞' },
    { name:'北京赛车', id:'fast-bjrace', color:'#7b68c8', icon:'北' },
    { name:'幸运赛车', id:'fast-luckyrace', color:'#e6a62f', icon:'运' },
    { name:'极速时时彩', id:'fast-tensc', color:'#5a7bd4', icon:'时' }
  ];
  function hallGrid18() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">游戏大厅</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid hall18">' + HALL18.map(function (x) {
      if (x.soon) return '<button type="button" class="game-cell soon" data-soon="' + esc(x.name) + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">待接入</span></button>';
      return '<a class="game-cell" href="' + (x.game ? '#/game/' : '#/bet/') + x.id + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">' + esc((DEFS[x.id] && DEFS[x.id].period) || '进入') + '</span></a>';
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
      var nid = noticeHash('reg:' + txt), off = noticeIsDismissed(nid);
      return '<div class="reg-zero-banner' + (off ? ' dismissed' : '') + '" data-reg-banner data-notice-id="' + nid + '"' + (off ? ' aria-hidden="true"' : '') + '>' + txt + '<button type="button" data-dismiss-reg>知道了</button></div>';
    }
    return '';
  }
  function betZeroBanner() {
    if (!currentUser()) return '<div class="reg-zero-banner bet-zero">未登录 · 可浏览赔率，<a href="#/login">登录后投注</a></div>';
    if ((parseInt(points, 10) || 0) > 0) return '';
    return '<div class="reg-zero-banner bet-zero">积分不足，请联系管理员加分后再投注</div>';
  }
  var HOME_TABS = [
    { id:'hot', name:'热门', items:[
      ['极速赛车','fast-race-1','赛','#e8402a','#ff8a5c','HOT'], ['极速六合彩','fast-mark6-1','六','#e39b38','#ffcf7a'], ['香港六合彩','hk','港','#d94b62','#ff8fa3'],
      ['新澳门六合彩','newmo','澳','#3d8ed0','#7cc4ff'], ['极速快三','fast-k3','快','#d45f82','#ff9fbe'], ['极速飞艇','fast-airship','艇','#4aa99d','#8fe0d5']
    ]},
    { id:'race', name:'赛车飞艇', items:[
      ['极速赛车','fast-race-1','赛','#e8402a','#ff8a5c','HOT'], ['幸运飞艇','fast-race-5','飞','#4aa99d','#8fe0d5'], ['北京赛车','fast-race-10','北','#7b68c8','#b9a8ff'],
      ['幸运赛车','fast-race-2','幸','#5a8fd4','#9cc6ff'], ['澳洲幸运10',null,'澳10','#999','#ccc']
    ]},
    { id:'fast', name:'极速彩', items:[
      ['极速时时彩',null,'时','#5a7bd4','#9cb6ff'], ['极速快三','fast-k3','快','#d45f82','#ff9fbe'], ['极速28',null,'28','#d08a3f','#ffc27a'], ['幸运28',null,'28','#c9a23f','#ffe39a']
    ]},
    { id:'ssc', name:'时时彩', items:[
      ['极速时时彩',null,'时','#5a7bd4','#9cb6ff'], ['腾讯分分彩',null,'分','#687bd0','#a8b8ff'], ['极速28',null,'28','#d08a3f','#ffc27a'], ['幸运28',null,'28','#c9a23f','#ffe39a']
    ]},
    { id:'six', name:'六合彩', items:[
      ['香港六合彩','hk','港','#d94b62','#ff8fa3'], ['澳门六合彩',null,'门','#4aa99d','#8fe0d5'], ['新澳门六合彩','newmo','澳','#3d8ed0','#7cc4ff'],
      ['一分钟六合彩','fast-mark6-1','六','#e39b38','#ffcf7a'], ['5分钟六合彩','fast-mark6-5','5','#d36d55','#ffa58f']
    ]}
  ];
  function homeTabsHtml() {
    return '<div class="home-tabs">' + HOME_TABS.map(function (t) {
      return '<button type="button" class="home-tab ' + (homeTab === t.id ? 'on' : '') + '" data-home-tab="' + t.id + '">' + t.name + '</button>';
    }).join('') + '</div>';
  }
  function homeGridHtml() {
    var tab = HOME_TABS.filter(function (t) { return t.id === homeTab; })[0] || HOME_TABS[0];
    return '<div class="home-grid">' + tab.items.map(function (it) {
      var name = it[0], id = it[1], glyph = it[2], c1 = it[3], c2 = it[4], hot = it[5];
      var icon = '<span class="home-icon" style="--g1:' + c1 + ';--g2:' + c2 + '"><b>' + esc(glyph) + '</b>' + (hot ? '<i class="home-hot">HOT</i>' : '') + '</span>';
      if (!id) return '<div class="home-cell soon">' + icon + '<span class="home-name">' + esc(name) + '</span><em class="home-soon">即将上线</em></div>';
      return '<a class="home-cell" href="#/bet/' + id + '">' + icon + '<span class="home-name">' + esc(name) + '</span></a>';
    }).join('') + '</div>';
  }
  var LOGO_MAP = { '新香港六合彩':'香港六合彩.png', '极速赛车':'极速赛车.png', '极速时时彩':'极速时时彩.png', '极速六合彩':'极速六合彩.png', '香港六合彩':'香港六合彩.png', '澳门六合彩':'澳门六合彩.png', '新澳门六合彩':'新澳门六合彩.png', '极速快三':'极速快三.png', '极速飞艇':'极速飞艇.png', '幸运飞艇':'幸运飞艇.png', '北京赛车':'北京赛车.png', '幸运赛车':'幸运赛车.png', '极速28':'极速28.png', '幸运28':'幸运28.png', '腾讯分分彩':'腾讯分分彩.png' };
  var LOGO_HAS_HOT = { '极速赛车':1, '极速时时彩':1, '极速六合彩':1, '澳门六合彩':1, '新澳门六合彩':1, '极速快三':1 };
  function decorateLogos() {
    try {
      document.querySelectorAll('.game-cell').forEach(function (cell) {
        var circle = cell.querySelector('.game-circle'); if (!circle || circle.querySelector('.game-logo')) return;
        var nameEl = cell.querySelector('.game-name'); var name = (nameEl ? nameEl.textContent : '').trim();
        var file = LOGO_MAP[name]; if (!file) return;
        var img = document.createElement('img');
        img.className = 'game-logo'; img.alt = ''; img.src = './assets/icons/' + encodeURIComponent(file);
        img.onload = function () {
          circle.classList.add('has-logo'); circle.setAttribute('data-logo', '1');
          if (name === '新香港六合彩' && !circle.querySelector('.game-new')) { var nx = document.createElement('i'); nx.className = 'game-new'; nx.textContent = '新'; circle.appendChild(nx); }
          if (LOGO_HAS_HOT[name]) { var h = circle.querySelector('.game-hot'); if (h) h.remove(); }
        };
        img.onerror = function () { img.remove(); };
        circle.appendChild(img);
      });
    } catch (e) {}
  }
  function markHotIcons() {
    try {
      [['#/bet/fast-race-1', 'HOT'], ['#/bet/hk', 'HOT'], ['#/bet/newmo', 'HOT']].forEach(function (p) {
        document.querySelectorAll('a[href="' + p[0] + '"] .game-circle').forEach(function (c) {
          if (!c.querySelector('.game-hot')) { var i = document.createElement('i'); i.className = 'game-hot'; i.textContent = p[1]; c.appendChild(i); }
        });
      });
    } catch (e) {}
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
      last: { issue: (d && d.lastResult && d.lastResult.issue) || ((d && d.issue) ? d.issue - 1 : 0), issueLabel: (d && d.lastResult && (d.lastResult.issueLabel || d.lastResult.label)) ? String(d.lastResult.issueLabel || d.lastResult.label).replace(/\s*期\s*$/, '') : null, nums: nums },
      nextIssue: (d && d.issue) || 0,
      nextIssueLabel: (d && (d.issueLabel || d.nextIssueLabel)) ? String(d.issueLabel || d.nextIssueLabel).replace(/\s*期\s*$/, '') : null,
      mockNext: d && d.closeAt ? Date.parse(d.closeAt) : 0,
      periodSec: (d && d.periodSec) || 60,
      periodSeconds: (d && d.periodSec) || 60,
      server: true,
      history: []
    };
    return g;
  }
  function winClosed(id) { var w = state.win[id]; return !!(w && w.open === false); }
  function winCloseText(id) {
    var w = state.win[id]; if (!w || w.open !== false) return '';
    var d = w.nextOpenAt ? new Date(w.nextOpenAt) : null;
    if (!d || isNaN(d.getTime())) return '本时段已结束';
    var bj = new Date(d.getTime() + 8 * 3600 * 1000);
    return '本时段已结束，下次开奖 ' + bj.toISOString().slice(11, 16);
  }
  function winBanner(id) {
    if (!winClosed(id)) return '';
    return '<div class="win-closed" data-win-banner="' + id + '"><b>' + winCloseText(id) + '</b><span data-win-cd>--:--</span></div>';
  }
  function syncIssueWindow(id) {
    return window.LotteryAPI.call('/issues/' + encodeURIComponent(id) + '?t=' + Date.now(), { method: 'GET' }).then(function (d) {
      var w = d && (d.window || d.windowInfo);
      if (!w) return;
      var prev = JSON.stringify(state.win[id] || null), next = JSON.stringify(w);
      state.win[id] = w;
      var cr = currentRoute();
      // 窗口状态只更新缓存；关闭态由下一次路由/轮询局部更新，避免导航 +2 render
    }).catch(function () {});
  }
  function updateFastHeader(id) {
    try {
      var g = state.games[id]; if (!g || !g.last) return;
      var root = document.querySelector('[data-audit="head-wrap"]'); if (!root) return;
      var nums = g.last.nums || [];
      var boxes = root.querySelectorAll('[data-audit="num"]');
      for (var i = 0; i < boxes.length && i < nums.length; i++) {
        var v = parseInt(nums[i].c, 10); if (!isFinite(v)) continue;
        boxes[i].textContent = pad(v);
        if (DEFS[id] && DEFS[id].racing) { var c = RACING_COLORS[pad(v)] || '#999'; boxes[i].style.background = c; boxes[i].style.setProperty('--rc', c); }
        else { var col = nums[i].color || colorOf(v); boxes[i].style.background = col === '红' ? '#E23A3A' : (col === '蓝' ? '#1F6FEB' : '#1FA85C'); }
      }
      var title = root.querySelector('[data-audit="title"]');
      var fd = FAST[id] && FAST[id].data;
      var lastLab = (fd && fd.lastResult && (fd.lastResult.issueLabel || fd.lastResult.issue)) || (g.last && g.last.issueLabel) || (g.last && g.last.issue);
      var nextLab = g.nextIssueLabel || (fd && (fd.issueLabel || fd.nextIssueLabel)) || g.nextIssue;
      if (title) title.textContent = '第 ' + shortIssue(lastLab) + ' 期开奖结果';
      var nextSpan = root.querySelector('.rr-next span');
      if (nextSpan && nextLab) nextSpan.textContent = shortIssue(nextLab) + ' 期';
      var cdNow = root.querySelector('[data-race-cd]');
      if (cdNow && g.mockNext) cdNow.setAttribute('data-close', String(g.mockNext));
      var labels = root.querySelectorAll('[data-audit="label"]');
      if (DEFS[id] && DEFS[id].racing) {
        var sm = raceSummary(nums);
        var vals = ['和值 ' + sm.sum, sm.big, sm.odd].concat(sm.dragon);
        for (var j = 0; j < labels.length && j < vals.length; j++) labels[j].textContent = vals[j];
      } else {
        for (var k = 0; k < labels.length && k < nums.length; k++) labels[k].textContent = nums[k].z || '';
      }
    } catch (e) {}
  }
  var DAILY_SYNC = {};
  function syncDailyIssue(id) {
    if (!/^(hk|newmo|newhk)$/.test(id) || DAILY_SYNC[id]) return;
    DAILY_SYNC[id] = 1;
    try {
      window.LotteryAPI.call('/issues/' + encodeURIComponent(id) + '?t=' + Date.now(), { method: 'GET' }).then(function (d) {
        if (!d || !d.lastResult) { DAILY_SYNC[id] = 0; return; }
        var g = state.games[id] || (state.games[id] = { last: {}, history: [] });
        var lr = d.lastResult || {};
        g.last = g.last || {};
        g.last.issue = d.issue || lr.issue;
        g.last.issueLabel = String(d.issueLabel || lr.issueLabel || lr.label || lr.issue || d.issue || '').replace(/\s*期\s*$/, '');
        g.last.nums = (lr.nums || []).map(function (x) { return (typeof x === 'object') ? x : { c: String(x), z: '' }; });
        g.nextIssue = d.issue;
        g.nextIssueLabel = String(d.issueLabel || d.nextIssueLabel || '').replace(/\s*期\s*$/, '');
        g.server = true;
        if (currentRoute().id === id) updateFastHeader(id);
      }).catch(function () { DAILY_SYNC[id] = 0; });
    } catch (e) { DAILY_SYNC[id] = 0; }
  }
  function syncFastIssue(id, soft) {
    try { console.info('[fast] sync ' + id); } catch (e) {}
    var def = DEFS[id]; if (!def || !(def.mock || def.racing || /^fast-/.test(id))) { try { console.info('[fast] skip ' + id); } catch (e) {} return Promise.resolve(); }
    FAST[id] = FAST[id] || {};
    FAST[id].lastTry = Date.now();
    return window.LotteryAPI.call('/issues/' + encodeURIComponent(id), { method: 'GET' }).then(function (d) {
      FAST[id].data = d;
      var _prev = state.games[id];
      state.games[id] = shapeFast(id, d);
      if (_prev && _prev.nextIssue === state.games[id].nextIssue && _prev.mockNext) state.games[id].mockNext = _prev.mockNext;
      try { var _cr = currentRoute(); if ((_cr.name === 'bet' || _cr.name === 'game') && _cr.id === id && !FAST[id].didRender) { FAST[id].didRender = 1; render(true); } } catch (e) {}
      if (d && d.window) state.win[id] = d.window;
      try {
        var key = 'xc-race-hist-' + id, hist = JSON.parse(localStorage.getItem(key) || '[]');
        var lr = d.lastResult || {};
        if (lr.issue && lr.nums && lr.nums.length >= 10 && !hist.some(function (x) { return String(x.issue) === String(lr.issue); })) {
          hist.unshift({ issue: lr.issue, nums: lr.nums }); if (hist.length > 60) hist = hist.slice(0, 60);
          localStorage.setItem(key, JSON.stringify(hist));
        }
      } catch (e) {}
      try { console.info('[fast] /issues ' + id + ' → issue=' + d.issue + ' closeAt=' + d.closeAt + ' lastNums=' + ((d.lastResult && d.lastResult.nums) || []).length); } catch (e) {}
      var cr = currentRoute();
      if ((cr.name === 'bet' || cr.name === 'game') && cr.id === id) {
        try {
          if (id === 'fast-k3') render(true);
          else if (soft) updateFastHeader(id);
          else render(true);
        } catch (e2) { console.error('[fast] render error: ' + (e2 && e2.stack || e2)); }
      }
      try { loadUserBets().then(function (b) { if (JSON.stringify(b) !== JSON.stringify(bets)) { bets = b; updateBetsOnly(); } }); } catch (e) {}
    }).catch(function (e) {
      console.warn('[fast] /issues 失败，回退本地 mock：' + String(e && (e.stack || e.message) || e));
      FAST[id].sdkRetry = (FAST[id].sdkRetry || 0) + 1;
      if (FAST[id].sdkRetry <= 30) { setTimeout(function () { try { syncFastIssue(id, true); } catch (x) {} }, 2000); return; }
      FAST[id].failed = true;
      if (!state.games[id]) state.games[id] = mockGame(id);
      var cr = currentRoute();
      if (!soft && cr.name === 'bet' && cr.id === id && !/SDK 加载中/.test(String(e && e.message || e))) render(true);
    });
  }
  function mockGame(id) {
    var def = DEFS[id]; if (!def || !def.mock) return null;
    var issue = 0, nextIssue = 0;
    function makeNums(n) {
      return [];
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
      return { last:{ issue:issue, nums:raceNums }, nextIssue:nextIssue, history:history, mockNext:0, timeCfg:{ time:def.period || '1分钟' } };
    }
    return { last:{ issue:issue, nums:history[0].nums }, nextIssue:nextIssue, history:history, mockNext:0, timeCfg:{ time:def.period || '1分钟', hour:0, minute:0, days:[0,1,2,3,4,5,6] } };
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
  function loadingCard(def, id) {
    setTimeout(function () {
      var el = document.querySelector('[data-loading]');
      if (el) { el.innerHTML = '数据加载失败，请点击重试'; el.setAttribute('data-retry', String(id)); el.classList.add('load-error'); }
    }, 20000);
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-last card"><div class="data-empty" data-loading>正在读取 ' + esc(def.name) + ' 数据…<div class="load-hint">首次加载可能较慢，最长等待 20 秒</div></div></div>';
  }
  function gamePage(id) {
    if (/^(hk|newmo|newhk)$/.test(id)) syncDailyIssue(id);
    try { console.info('[gp] ' + id + ' mock=' + (DEFS[id] && DEFS[id].mock)); } catch (e) {}
    var def = DEFS[id]; if (!def) return hallPage();
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-head"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span></span><div><div class="page-kicker">' + esc(def.name) + ' · 占位</div><h1 class="page-title">' + esc(def.name) + '</h1><div class="page-sub">' + esc(def.provider || '演示占位') + '</div></div></div><div class="detail-last card">' + emptyState(def.note || '数据待接入，敬请期待') + '</div>';
    var g = state.games[id];
    if (!g && def.mock) { state.games[id] = mockGame(id); g = state.games[id]; syncFastIssue(id, true); }
    if (!g) { syncFastIssue(id, true); state.games[id] = mockGame(id); g = state.games[id]; }
    var zeroTip = betZeroBanner();
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + shortIssue(h.issue) + '期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return zeroTip + '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<div class="detail-actions"><a class="action-btn action-primary" href="#/bet/' + id + '">立即投注</a><a class="action-btn action-ghost" href="#/howto">玩法说明</a></div>' +
      '<section class="detail-last"><div class="detail-label">上期开奖 <span>第 ' + shortIssue(last.issue) + ' 期</span></div><div class="detail-balls">' + balls(last.nums) + '</div><div class="wave-legend"><span><i class="r"></i>红波</span><span><i class="b"></i>蓝波</span><span><i class="g"></i>绿波</span><span class="special-legend">+ 后为特码</span></div></section>' +
      '<section class="next-card"><div><span>下期开奖</span><b>第 ' + shortIssue(g.nextIssue) + ' 期</b><em>' + ((g.timeCfg && g.timeCfg.time) || def.period || '实时') + (id === 'hk' ? ' · 周日' : ' · 每日') + '</em></div><strong data-cd="' + id + '">' + countdownText(g) + '</strong></section>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">波色 / 生肖统计</h2><span class="section-link">近 10 期</span></div><div class="trend-panel">' + gameStats(g) + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">近 10 期开奖</h2><a class="section-link" href="#/history">全部记录 ›</a></div><div class="detail-history">' + rows + '</div></div>' +
      '<div class="mini-note">数据来自主站只读接口；号码、特码与开奖时间以主站为准。</div>';
  }
  function historyPage() {
    var chips = ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('');
    var g = state.games[historyGame];
    var rows = state.histApi[historyGame] && state.histApi[historyGame].length ? histTableRows(historyGame, state.histApi[historyGame]) : (g && g.history || []).slice(0, 20).map(function (h) { return '<tr><td class="iss">' + shortIssue(h.issue) + '</td><td>' + DEFS[historyGame].name + '</td><td>' + balls(h.nums, true) + '</td><td><span class="status">● 已开奖</span></td></tr>'; }).join('');
    if (!rows) rows = '<tr><td colspan="4">' + emptyState('暂无数据') + '</td></tr>';
    setTimeout(function () { try { loadHistoryData(historyGame); } catch (e) {} }, 0);
    return catTabs('history') + '<div class="page-head"><div><div class="page-kicker">RESULTS</div><h1 class="page-title">开奖记录</h1><div class="page-sub">主站真实数据 · 当前可获取 ' + ((g && g.history.length) || 0) + ' 期</div></div><span class="demo-pill">REAL</span></div>' +
      '<div class="chips">' + chips + '</div><div style="padding:0 10px"><div class="table-scroll"><table class="hist"><thead><tr><th>期号</th><th>彩种</th><th>开奖号码</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="更多记录为演示入口">加载更多</button></div><div class="mini-note">主站当前可获取近 ' + ((g && g.history.length) || 0) + ' 期；开奖号码与主站一致。</div>';
  }
  function trendPage() {
    var g = state.games[historyGame] || state.games.newhk;
    if (!g || !g.history || !g.history.length) {
      return catTabs('trend') + '<div class="page-head"><div><div class="page-kicker">TREND</div><h1 class="page-title">号码走势</h1><div class="page-sub">' + esc(DEFS[historyGame].name) + ' · 近 12 期</div></div><span class="demo-pill">REAL</span></div>' +
        '<div class="chips">' + ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('') + '</div>' +
        '<div class="trend-panel">' + emptyState('暂无数据') + '</div>' +
        '<div class="mini-note">走势基于主站近 12 期真实开奖号码计算。</div>';
    }
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
      if (!rows.length) { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无排行数据</div>'; return; }
      box.innerHTML = rows.slice(0, 20).map(function (r, i) {
        var name = esc(String(r.username || '玩家'));
        var rate = Number(r.rate);
        var rateTxt = isFinite(rate) ? (rate <= 1 ? (rate * 100).toFixed(1) : rate.toFixed(1)) + '%' : '—';
        return '<div class="rank-row"><span class="rank-no">' + (i + 1) + '</span><span class="avatar">' + esc(name.slice(0, 1)) + '</span><div class="rank-info"><b>' + name + '</b><span>注数 ' + (r.bets || 0) + ' · 命中 ' + (r.hits || 0) + '</span></div><div class="rank-val"><b>' + rateTxt + '</b><span>连中 ' + (r.streak || 0) + '</span></div></div>';
      }).join('');
    }).catch(function (e) { try{console.warn('[rank] load failed',e&&e.message);}catch(x){} box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无排行数据</div>'; });
  }
  function rankPageLegacy() {
    var top = RANKS.slice(0, 3);
    var podium = [top[1], top[0], top[2]].map(function (r) { return '<div class="podium-item ' + (r.name === top[0].name ? 'first' : '') + '">' + (r.name === top[0].name ? '<span class="crown">♛</span>' : '') + '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><b>' + esc(r.name) + '</b><span>' + esc(r.tag.split(' · ')[0]) + '</span><strong>' + esc(r.value) + '</strong></div>'; }).join('');
    return catTabs('rank') + '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">演示榜单 · 每日更新样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="podium">' + podium + '</div><div class="rank-list">' + RANKS.slice(3).map(function (r, i) { return '<div class="rank-row"><span class="rank-no">' + (i + 4) + '</span><span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><div class="rank-info"><b>' + esc(r.name) + '</b><span>' + esc(r.tag) + '</span></div><div class="rank-val"><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></div></div>'; }).join('') + '</div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="榜单为演示内容，关注功能暂未开放">关注榜单</button></div><div class="mini-note">排名、连中与命中率均为虚构样例，不构成任何建议。</div>';
  }
  function betsPage() { setTimeout(loadBetsIssueInfo, 0); return betsPageHtml(); }
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
  function initAppwrite() {
    if (!window.Appwrite || !window.Appwrite.Client) return false;
    if (!awClient) awClient = new window.Appwrite.Client().setEndpoint(APPWRITE.endpoint).setProject(APPWRITE.project);
    if (!awAccount) awAccount = new window.Appwrite.Account(awClient);
    if (!awTables && window.Appwrite.TablesDB) awTables = new window.Appwrite.TablesDB(awClient);
    return !!awAccount;
  }
  function ensureAppwrite(timeoutMs) {
    return new Promise(function (resolve) {
      var t0 = Date.now(), limit = timeoutMs || 10000;
      (function poll() {
        if (initAppwrite()) return resolve(true);
        if (Date.now() - t0 > limit) return resolve(false);
        setTimeout(poll, 100);
      })();
    });
  }
  initAppwrite();
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
  function updateUserChip() { var b = $('#userChip'); if (!b) return; var u = currentUser(); b.textContent = u ? ('积分 ' + fmtPoints(points)) : '登录/注册'; b.setAttribute('data-auth', u ? 'user' : 'login'); }
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
      var createdRaw = r.createdAt || r.$createdAt;
      var createdMs = (typeof createdRaw === 'number') ? createdRaw : (createdRaw ? Date.parse(createdRaw) : Date.now());
      if (!isFinite(createdMs)) createdMs = Date.now();
      return { id: r.id || r.$id, game: r.gameId || r.game, targetIssue: r.issue || r.targetIssue || '', placedIssue: r.issue || '', qty: r.qty || 1, cost: stake, notes: r.notes || Math.round(stake / 2), selections: picks, picksText: r.picksText || '', labels: picks.map(function (x) { return (typeof x === 'string') ? x : (x.label || x.key); }).join('、'), status: r.status || 'pending', payout: Number(r.payout) || 0, profit: (r.profit == null ? null : Number(r.profit)), created: createdMs, settledAt: r.settledAt || null, cancelledAt: r.cancelledAt || null };
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
      try { window.LH_ODDS_BY_PLAY = ob || null; } catch (e) {}
      if (ob && typeof ob === 'object') {
        if (ob.oneZodiac != null) ODDS.oneZodiac = Number(ob.oneZodiac);
        if (ob.flatZodiac != null) ODDS.specialZodiac = Number(ob.flatZodiac && ob.flatZodiac.default != null ? ob.flatZodiac.default : ob.flatZodiac);
        if (ob.horse != null) ODDS.horse = Number(ob.horse);
        if (ob.colorWave != null) {
          if (typeof ob.colorWave === 'object') {
            SIX_ODDS.colorWave = { red: Number(ob.colorWave.red) || 2.7, blue: Number(ob.colorWave.blue) || 2.8, green: Number(ob.colorWave.green) || 2.8 };
          } else { var cwv = Number(ob.colorWave) || 2.7; SIX_ODDS.colorWave = { red: cwv, blue: cwv, green: cwv }; }
        }
        if (ob.colorWaveByGame && typeof ob.colorWaveByGame === 'object') { COLOR_WAVE_BY_GAME = ob.colorWaveByGame; }
        if (ob.regular != null) SIX_ODDS.regular = Number(ob.regular);
        if (ob.zhengte != null) SIX_ODDS.zhengte = Number(ob.zhengte);
        if (ob.tail != null) SIX_ODDS.tail = Number(ob.tail);
        if (ob.specialZodiac != null) {
          if (typeof ob.specialZodiac === 'object') { if (ob.specialZodiac.horse != null) SIX_ODDS.specialZodiac.horse = Number(ob.specialZodiac.horse); if (ob.specialZodiac.default != null) SIX_ODDS.specialZodiac.other = Number(ob.specialZodiac.default); if (ob.specialZodiac.other != null) SIX_ODDS.specialZodiac.other = Number(ob.specialZodiac.other); }
          else { var sz = Number(ob.specialZodiac); if (sz) { SIX_ODDS.specialZodiac.other = sz; } }
        }
        if (ob.flatZodiac != null) {
          if (typeof ob.flatZodiac === 'object') { if (ob.flatZodiac.horse != null) SIX_ODDS.flatZodiac.horse = Number(ob.flatZodiac.horse); if (ob.flatZodiac.default != null) SIX_ODDS.flatZodiac.other = Number(ob.flatZodiac.default); if (ob.flatZodiac.other != null) SIX_ODDS.flatZodiac.other = Number(ob.flatZodiac.other); }
          else { var fz = Number(ob.flatZodiac); if (fz) SIX_ODDS.flatZodiac.other = fz; }
        }
        if (ob.horse != null) SIX_ODDS.flatZodiac.horse = Number(ob.horse);
        if (ob.specialNewMo != null) { DEFS.newmo = DEFS.newmo || {}; DEFS.newmo.specialOdds = Number(ob.specialNewMo); }
        if (ob.specialNewHk != null) { DEFS.newhk = DEFS.newhk || {}; DEFS.newhk.specialOdds = Number(ob.specialNewHk); DEFS.hk = DEFS.hk || {}; DEFS.hk.specialOdds = Number(ob.specialNewHk); }
        if (ob.special != null) { DEFS['fast-mark6-1'] = DEFS['fast-mark6-1'] || {}; DEFS['fast-mark6-1'].specialOdds = Number(ob.special); DEFS['fast-mark6-5'] = DEFS['fast-mark6-5'] || {}; DEFS['fast-mark6-5'].specialOdds = Number(ob.special); } else if (ob.specialHk != null) { DEFS['fast-mark6-1'] = DEFS['fast-mark6-1'] || {}; DEFS['fast-mark6-1'].specialOdds = Number(ob.specialHk); DEFS['fast-mark6-5'] = DEFS['fast-mark6-5'] || {}; DEFS['fast-mark6-5'].specialOdds = Number(ob.specialHk); }
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
    try { if (!window.__renderCount) render(true); } catch (e) {}
  }
  function updateRTStatus(s, degraded) {
    rtState.s = s; rtState.degraded = !!degraded;
    $$('[data-rt-status]').forEach(function (el) { el.textContent = '实时:' + s; el.classList.toggle('degraded', !!degraded); });
  }
  function stopPoll() { if (rtPoll) { clearInterval(rtPoll); rtPoll = null; } }
  function startPoll() {
    // 统一轮询：由全局 pollTick（8s）负责，避免叠加第二个定时器。
    return;
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
        if (isFinite(v)) { points = v; awRow.points = v; updatePointsUI(); updateUserChip(); updateBetBar(); }
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
      if (isFinite(v)) { points = v; awRow.points = v; updatePointsUI(); updateUserChip(); updateBetBar(); }
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
      } else {
        try {
          authReady = true;
          var v = document.getElementById('view');
          if (v) v.innerHTML = '<div class="data-empty" style="padding:40px 20px">账户数据加载失败（首次可能较慢）<br><button class="btn btn-primary" type="button" data-retry-me style="margin-top:12px">重试</button></div>';
        } catch (e3) {}
        return;
      }
    }
    awRow = { $id: user.$id, username: String((me && me.username) || username || (user && user.name) || '玩家'), points: parseInt(me && me.points, 10) || 0 };
    points = parseInt(awRow.points, 10) || 0;
    try { bets = await loadUserBets(); } catch (e) { bets = []; }
    try { await loadGameConfigs(); } catch (e) {}
    authReady = true; updateUserChip(); render(true); startRealtime();
  }
  async function initAuth() {
    if (!window.Appwrite || !awAccount) {
      var okSdk = await ensureAppwrite(10000);
      if (!okSdk) { authReady = true; window.__lhSdkError = 'Appwrite SDK 加载超时（' + (window.Appwrite ? 'Account 初始化失败' : 'window.Appwrite undefined') + '）'; render(); return; }
    }
    if (!awAccount) { authReady = true; render(); return; }
    try { var u = await awAccount.get(); await afterAuth(u, u.name || (u.email || '').split('@')[0]); }
    catch (e) { window.__lhInitError = String((e && e.message) || e); stopRealtime(); stopPoll(); awUser = null; awRow = null; points = 0; bets = []; authReady = true; updateRTStatus('关'); updateUserChip(); }
  }
  async function loginUser(name, pass) {
    if (authBusy) return '';
    name = String(name || '').trim(); pass = String(pass || '');
    if (name.length < 2) return '用户名至少 2 个字符';
    if (pass.length < 8) return '密码至少 8 位';
    if (!await ensureAppwrite(10000) || !awAccount) return 'SDK 加载超时，请刷新（' + (window.Appwrite ? 'Account 初始化失败' : 'window.Appwrite undefined') + '）';
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
    if (!await ensureAppwrite(10000) || !awAccount) return 'SDK 加载超时，请刷新（' + (window.Appwrite ? 'Account 初始化失败' : 'window.Appwrite undefined') + '）';
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
  function shortIssue(v) { if (v && typeof v === 'object') v = v.issueLabel || v.issue; var s = String(v == null ? '' : v).replace(/\s*期\s*$/, ''); return s.length >= 7 ? s : s.slice(-3); }
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
    if (!game) return null;
    now = now || new Date(); var cfg = game.timeCfg; if (!cfg) return null;
    for (var i = 0; i < 15; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, cfg.hour, cfg.minute, 0, 0);
      if (d.getTime() <= now.getTime()) continue;
      if (cfg.days.indexOf(d.getDay()) < 0) continue;
      return d;
    }
    return null;
  }
  function countdownText(game) {
    if (!game) return '--:--:--';
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
  function loadData(silent, soft) {
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
      if (!silent) showToast('数据已更新');
      if (!soft) render(true);
    }).catch(function (e) {
      state.error = String(e && e.message || e); if (!soft && !state.games.newhk && !state.games.newmo && !state.games.hk) render(true); if (!silent) showToast('刷新失败，稍后重试');
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
    { name:'新香港六合彩', id:'newhk', game:true, color:'#e6a62f', icon:'新' },
    { name:'极速六合彩', id:'fast-mark6-1', color:'#e39b38', icon:'六' },
    { name:'香港六合彩', id:'hk', color:'#d94b62', icon:'香' },
    { name:'新澳门六合彩', id:'newmo', color:'#3d8ed0', icon:'澳' },
    { name:'澳门六合彩', soon:true, color:'#4aa99d', icon:'门' },
    { name:'极速快三', id:'fast-k3', color:'#d45f82', icon:'快' },
    { name:'腾讯分分彩', id:'fast-txffc', color:'#687bd0', icon:'分' },
    { name:'极速28', soon:true, color:'#d08a3f', icon:'28' },
    { name:'幸运28', soon:true, color:'#c9a23f', icon:'幸' },
    { name:'澳洲幸运10', id:'fast-ship10', color:'#5a8fd4', icon:'澳' },
    { name:'幸运飞艇', id:'fast-airship-5', color:'#4aa99d', icon:'飞' },
    { name:'北京赛车', id:'fast-bjrace', color:'#7b68c8', icon:'北' },
    { name:'幸运赛车', id:'fast-luckyrace', color:'#e6a62f', icon:'运' },
    { name:'极速时时彩', id:'fast-tensc', color:'#5a7bd4', icon:'时' }
  ];
  function hallGrid18() {
    return '<section class="hot-section"><div class="hot-head"><h2 class="hot-title">游戏大厅</h2><a class="hot-more" href="#/history">全部 ›</a></div><div class="hot-grid hall18">' + HALL18.map(function (x) {
      if (x.soon) return '<button type="button" class="game-cell soon" data-soon="' + esc(x.name) + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">待接入</span></button>';
      return '<a class="game-cell" href="' + (x.game ? '#/game/' : '#/bet/') + x.id + '"><span class="game-circle" style="--gc:' + x.color + '"><span class="game-glyph">' + esc(x.icon) + '</span></span><span class="game-name">' + esc(x.name) + '</span><span class="game-issue">' + esc((DEFS[x.id] && DEFS[x.id].period) || '进入') + '</span></a>';
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
    if (!g && def.mock) { state.games[id] = mockGame(id); g = state.games[id]; syncFastIssue(id, true); }
    if (!g) { state.games[id] = mockGame(id); g = state.games[id]; syncFastIssue(id, true); }
    var zeroTip = betZeroBanner();
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + shortIssue(h.issue) + '期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<div class="detail-actions"><a class="action-btn action-primary" href="#/bet/' + id + '">立即投注</a><a class="action-btn action-ghost" href="#/howto">玩法说明</a></div>' +
      '<section class="detail-last"><div class="detail-label">上期开奖 <span>第 ' + shortIssue(last.issue) + ' 期</span></div><div class="detail-balls">' + balls(last.nums) + '</div><div class="wave-legend"><span><i class="r"></i>红波</span><span><i class="b"></i>蓝波</span><span><i class="g"></i>绿波</span><span class="special-legend">+ 后为特码</span></div></section>' +
      '<section class="next-card"><div><span>下期开奖</span><b>第 ' + shortIssue(g.nextIssue) + ' 期</b><em>' + ((g.timeCfg && g.timeCfg.time) || def.period || '实时') + (id === 'hk' ? ' · 周日' : ' · 每日') + '</em></div><strong data-cd="' + id + '">' + countdownText(g) + '</strong></section>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">波色 / 生肖统计</h2><span class="section-link">近 10 期</span></div><div class="trend-panel">' + gameStats(g) + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">近 10 期开奖</h2><a class="section-link" href="#/history">全部记录 ›</a></div><div class="detail-history">' + rows + '</div></div>' +
      '<div class="mini-note">数据来自主站只读接口；号码、特码与开奖时间以主站为准。</div>';
  }
  function historyPage() {
    var chips = ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('');
    var g = state.games[historyGame];
    var rows = (g && g.history || []).slice(0, 20).map(function (h) { return '<tr><td class="iss">' + shortIssue(h.issue) + '</td><td>' + DEFS[historyGame].name + '</td><td>' + balls(h.nums, true) + '</td><td><span class="status">● 已开奖</span></td></tr>'; }).join('');
    if (!rows) rows = '<tr><td colspan="4">' + emptyState('暂无数据') + '</td></tr>';
    return catTabs('history') + '<div class="page-head"><div><div class="page-kicker">RESULTS</div><h1 class="page-title">开奖记录</h1><div class="page-sub">主站真实数据 · 当前可获取 ' + ((g && g.history.length) || 0) + ' 期</div></div><span class="demo-pill">REAL</span></div>' +
      '<div class="chips">' + chips + '</div><div style="padding:0 10px"><div class="table-scroll"><table class="hist"><thead><tr><th>期号</th><th>彩种</th><th>开奖号码</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="更多记录为演示入口">加载更多</button></div><div class="mini-note">主站当前可获取近 ' + ((g && g.history.length) || 0) + ' 期；开奖号码与主站一致。</div>';
  }
  function trendPage() {
    var g = state.games[historyGame] || state.games.newhk;
    if (!g || !g.history || !g.history.length) {
      return catTabs('trend') + '<div class="page-head"><div><div class="page-kicker">TREND</div><h1 class="page-title">号码走势</h1><div class="page-sub">' + esc(DEFS[historyGame].name) + ' · 近 12 期</div></div><span class="demo-pill">REAL</span></div>' +
        '<div class="chips">' + ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('') + '</div>' +
        '<div class="trend-panel">' + emptyState('暂无数据') + '</div>' +
        '<div class="mini-note">走势基于主站近 12 期真实开奖号码计算。</div>';
    }
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
    return '<div class="points-bar"><span>账户积分</span><b data-points-value>' + fmtPoints(points) + '</b><span class="rt-status' + (rtState.degraded ? ' degraded' : '') + '" data-rt-status>实时:' + rtState.s + '</span><a class="points-help" href="#/howto">玩法说明</a></div>';
  }
  function updatePointsUI() { $$('[data-points-value]').forEach(function (el) { el.textContent = fmtPoints(points); }); }
  function attrFor(n) { return state.attrs[parseInt(n,10)] || { z:'', color:colorOf(n) }; }
  function isSel(k) { return !!betState.sel[k]; }
  function selectedCount() { return Object.keys(betState.sel).length; }
  function totalNotes() { var q = parseInt(betState.qty, 10); return (isFinite(q) && q > 0) ? selectedCount() * q : 0; }
  function totalCost() { return totalNotes(); }
  function betHelp(cat) { return '<a class="help-link" href="#/howto/' + cat + '" aria-label="玩法说明">?</a>'; }
  function zodiacGrid(prefix, odds) {
    return '<div class="zodiac-grid">' + ZODIACS.map(function (z) {
      var key = prefix + '-' + z;
      var o = (z === '马' && ODDS.horse) ? ODDS.horse : odds;
      return '<button type="button" class="bet-zodiac ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + z + '肖" data-odds="' + o + '"><span class="zcircle">' + z + '</span><em>' + fmtOdds(o) + '</em></button>';
    }).join('') + '</div>';
  }
  function numberGrid(prefix, odds, hideZodiac) {
    var out = '';
    for (var i = 1; i <= 49; i++) {
      var c = pad(i), a = attrFor(i), key = prefix + '-' + c, w = a.color === '红' ? 'r' : a.color === '蓝' ? 'b' : 'g';
      var z = hideZodiac ? '' : esc(a.z || '');
      var lab = hideZodiac ? c : (c + ' ' + (a.z || ''));
      out += '<button type="button" class="bet-num c-' + w + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + lab + '" data-odds="' + odds + '"><b>' + c + '</b>' + ( hideZodiac ? '' : '<i>' + z + '</i>' ) + '<em>' + fmtOdds(odds) + '</em></button>';
    }
    return '<div class="num-bet-grid">' + out + '</div>';
  }
  function optionGrid(items, prefix) {
    return '<div class="bet-options">' + items.map(function (x) {
      var key = prefix + '-' + x.k;
      return '<button type="button" class="bet-option ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + esc(x.n) + '" data-odds="' + x.o + '"' + (x.z ? ' data-zodiacs="' + x.z + '"' : '') + '><span>' + esc(x.n) + '</span><em>' + fmtOdds(x.o) + '</em></button>';
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
        return '<button type="button" class="bet-num znum' + (isSel(key) ? ' on' : '') + '" data-bet="' + key + '" data-label="' + pad(n) + '" data-odds="' + odds + '"><b>' + pad(n) + '</b><em>' + fmtOdds(odds) + '</em></button>';
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
    if (cat === 'color') { var cwo = sixColorOdds(betState.game); return '<div class="bet-content-head"><div><h2>色波</h2><p>特码波色三选一</p></div>' + betHelp('color') + '</div>' + optionGrid([{k:'r',n:'红波',o:fmtOdds(cwo.red)},{k:'b',n:'蓝波',o:fmtOdds(cwo.blue)},{k:'g',n:'绿波',o:fmtOdds(cwo.green)}], 'color'); };
    if (cat === 'regular6') return '<div class="bet-content-head"><div><h2>正码 1-6</h2><p>按位置结算</p></div>' + betHelp('regular') + '</div>' + optionGrid([{k:'1',n:'正码一',o:'7.8'},{k:'2',n:'正码二',o:'7.8'},{k:'3',n:'正码三',o:'7.8'},{k:'4',n:'正码四',o:'7.8'},{k:'5',n:'正码五',o:'7.8'},{k:'6',n:'正码六',o:'7.8'}], 'reg6');
    if (cat === 'tail') return '<div class="bet-content-head"><div><h2>平特尾</h2><p>预测特码尾数 0–9</p></div></div>' + optionGrid([{k:'0',n:'尾0',o:'9.8'},{k:'1',n:'尾1',o:'9.8'},{k:'2',n:'尾2',o:'9.8'},{k:'3',n:'尾3',o:'9.8'},{k:'4',n:'尾4',o:'9.8'},{k:'5',n:'尾5',o:'9.8'},{k:'6',n:'尾6',o:'9.8'},{k:'7',n:'尾7',o:'9.8'},{k:'8',n:'尾8',o:'9.8'},{k:'9',n:'尾9',o:'9.8'}], 'tail');
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
  function fmtSettled(ts) {
    if (!ts) return '';
    var d = new Date(ts); if (isNaN(d.getTime())) return String(ts).slice(0, 16).replace('T', ' ');
    var bj = new Date(d.getTime() + 8 * 3600 * 1000);
    return bj.toISOString().slice(5, 16).replace('T', ' ');
  }
  // ===== 投注记录（购彩查询）+ 撤单 · owner: dev-lottery =====
  var betFilter = 'all';
  var betExpanded = {};
  var betClosed = {};
  var betsIssue = {};
  var cancelBusy = false;
  var cancelTargetId = '';
  var BET_NOTE_COST = 2;

  function betNumOr(v, d) { var n = Number(v); return isFinite(n) && n > 0 ? n : d; }
  function fmtPoints(n) { var v = Number(n); if (!isFinite(v)) v = 0; v = Math.round(v * 100) / 100; var s = v.toFixed(2).replace(/\.?0+$/, ''); return s === '-0' ? '0' : s; }
  function betMoney(n) { return fmtPoints(n); }
  function betGameName(id) { var d = DEFS[id]; return (d && d.name) || id || '未知彩种'; }
  function betGameGlyph(id) { var n = String(betGameName(id)); return n.length > 1 ? n.slice(-1) : n; }
  function betGameColor(id) { var d = DEFS[id]; return (d && d.color) || '#EC2829'; }
  function betSpecialOdds(id) {
    var O = window.LH_ODDS_BY_PLAY || {}, d = DEFS[id] || {};
    if (id === 'newhk' && O.specialNewHk != null) return betNumOr(O.specialNewHk, 47.3);
    if (id === 'newmo' && O.specialNewMo != null) return betNumOr(O.specialNewMo, 47.3);
    if (d.mock && O.special != null) return betNumOr(O.special, 48.8);
    return betNumOr(d.specialOdds, betNumOr(ODDS.special, 48.8));
  }
  function betPairOdds(obj, z, fallback) {
    if (obj && typeof obj === 'object') { var v = z === '马' ? obj.horse : obj.default; if (isFinite(Number(v)) && Number(v) > 0) return Number(v); }
    return betNumOr(obj, fallback);
  }
  // 后端只存 pick id，这里把它翻成「第1名 03 · 9.98」；picksText 由服务端给出时优先用
  function betPickInfo(raw, gameId) {
    var p = String(raw == null ? '' : raw).trim();
    var def = DEFS[gameId] || {}, racing = !!def.racing;
    var O = window.LH_ODDS_BY_PLAY || {}, R = window.LH_RACING_ODDS || {};
    var m, label = p, odds = null;
    if ((m = /^r(\d{1,2})\s*[:：]\s*(\d{1,2})$/i.exec(p))) { label = '第' + Number(m[1]) + '名 ' + pad(m[2]); odds = rankOdds(); }
    else if ((m = /^r(\d{1,2}):bs:(big|small)$/i.exec(p))) { label = '第' + Number(m[1]) + '名 ' + (m[2].toLowerCase() === 'big' ? '大' : '小'); odds = betNumOr((R.bs || {})[m[2].toLowerCase()], 1.99); }
    else if ((m = /^r(\d{1,2}):oe:(odd|even)$/i.exec(p))) { label = '第' + Number(m[1]) + '名 ' + (m[2].toLowerCase() === 'odd' ? '单' : '双'); odds = betNumOr((R.oe || {})[m[2].toLowerCase()], 1.99); }
    else if ((m = /^sum:(big|small|odd|even)$/i.exec(p))) { label = '冠亚和 ' + ({ big: '大', small: '小', odd: '单', even: '双' })[m[1].toLowerCase()]; odds = betNumOr((R.sum || {})[m[1].toLowerCase()], 1.99); }
    else if ((m = /^sum:(\d{1,2})$/i.exec(p))) { label = '冠亚和 ' + Number(m[1]); odds = betNumOr((R.sumExact || {})[Number(m[1])], 1.99); }
    else if ((m = /^combo:(\d{1,2})_(\d{1,2})$/i.exec(p))) { label = '冠亚组合 ' + pad(m[1]) + '_' + pad(m[2]); odds = betNumOr(R.combo, 42.5); }
    else if ((m = /^color:(red|blue|green)$/i.exec(p))) { label = '色波 ' + ({ red: '红', blue: '蓝', green: '绿' })[m[1].toLowerCase()]; odds = betNumOr(sixColorOdds(gameId)[m[1].toLowerCase()], 2.7); }
    else if ((m = /^zodiac:([\u4e00-\u9fa5])$/.exec(p))) { label = '特肖 ' + m[1]; odds = betPairOdds(O.specialZodiac, m[1], 4.9); }
    else if ((m = /^flat:([\u4e00-\u9fa5])$/.exec(p))) { label = '平特一肖 ' + m[1]; odds = betPairOdds(O.flatZodiac, m[1], 2); }
    else if ((m = /^tail:(\d)$/i.exec(p))) { label = '尾数 ' + m[1]; odds = betNumOr(O.tail, 9.8); }
    else if ((m = /^zhengte:(\d{1,2})$/i.exec(p))) { label = '正特 ' + pad(m[1]); odds = betNumOr(O.special, betSpecialOdds(gameId)); }
    else if ((m = /^regular:(\d{1,2})$/i.exec(p))) { label = '正码 ' + pad(m[1]); odds = betNumOr(O.regular, 7.8); }
    else if (/^\d{1,2}$/.test(p) && Number(p) >= 1 && Number(p) <= 49) { label = (racing ? '冠军 ' : '号码 ') + pad(p); odds = racing ? rankOdds() : betSpecialOdds(gameId); }
    return { label: label, odds: (odds != null && isFinite(odds) && odds > 0) ? Number(odds) : null };
  }
  function betPickEntry(e) {
    var parts = String(e || '').split('·');
    var label = String(parts[0] || '').trim();
    var o = parts.length > 1 ? Number(String(parts[parts.length - 1]).trim()) : NaN;
    return { label: label, odds: (isFinite(o) && o > 0) ? o : null };
  }
  // picksText 格式：'第1名 03 · 9.98、第2名 07 · 9.98'（后端 2026-11-23 起）
  function betPickItems(b) {
    var raw = (b.selections || []).map(function (x) { return (typeof x === 'string') ? x : (x && (x.key || x.c || x.label) || ''); }).filter(Boolean);
    var txt = String(b.picksText || '').trim();
    var entries = txt ? txt.split('、').map(betPickEntry) : [];
    if (!raw.length && entries.length) return entries.filter(function (e) { return e.label; });
    return raw.map(function (p, i) {
      var info = betPickInfo(p, b.game), e = entries[i];
      return { label: (e && e.label) || info.label, odds: (e && e.odds) || info.odds };
    });
  }
  function betNoteQty(b) {
    var n = (b.selections || []).length, stake = Number(b.cost) || 0;
    var q = n ? Math.round(stake / (n * BET_NOTE_COST)) : 0;
    return q > 0 ? q : 1;
  }
  function betStatusMeta(b) {
    if (b.status === 'cancelled') return { cls: 'cancel', text: '已撤单' };
    if (b.status === 'settled') return Number(b.payout) > 0 ? { cls: 'win', text: '已中奖' } : { cls: 'lose', text: '未中奖' };
    return { cls: 'pending', text: '待结算' };
  }
  function betRangeStart(range) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    if (range === 'today') return d.getTime();
    if (range === '7d') return d.getTime() - 6 * 86400000;
    return 0;
  }
  function betFilteredList() {
    var since = betRangeStart(betFilter);
    return bets.slice().filter(function (b) {
      if (!since) return true;
      return (Number(b.created) || 0) >= since;
    }).sort(function (a, b) { return (Number(b.created) || 0) - (Number(a.created) || 0); });
  }
  function betStats(list) {
    var st = { stake: 0, payout: 0, profit: 0, count: list.length, pending: 0, cancelled: 0 };
    list.forEach(function (b) {
      if (b.status === 'cancelled') { st.cancelled++; return; }
      var s = Number(b.cost) || 0;
      st.stake += s;
      if (b.status === 'settled') st.payout += Number(b.payout) || 0;
      else st.pending++;
    });
    st.profit = st.payout - st.stake;
    return st;
  }
  function betsStatsHtml(st) {
    var pf = st.profit, pfCls = pf > 0 ? 'pos' : (pf < 0 ? 'neg' : 'zero');
    var pfTxt = (pf > 0 ? '+' : '') + betMoney(pf);
    var ranges = [['today', '今天'], ['7d', '近7天'], ['all', '全部']];
    return '<section class="bets-stats" aria-label="投注统计">' +
      '<div class="bets-stats-grid">' +
        '<div class="bets-stat"><span>投注合计</span><b>' + betMoney(st.stake) + '</b></div>' +
        '<div class="bets-stat"><span>中奖合计</span><b class="' + (st.payout > 0 ? 'pos' : 'max') + '">' + betMoney(st.payout) + '</b></div>' +
        '<div class="bets-stat" title="中奖合计 − 投注合计（未结算注单按未中计算）"><span>盈亏合计</span><b class="' + pfCls + '">' + pfTxt + '</b></div>' +
      '</div>' +
      '<div class="bets-filter" role="group" aria-label="按日期筛选">' +
        ranges.map(function (x) { return '<button type="button" class="' + (betFilter === x[0] ? 'on' : '') + '" data-bet-range="' + x[0] + '">' + x[1] + '</button>'; }).join('') +
        '<span class="bets-count">共 ' + st.count + ' 笔' + (st.pending ? ' · 待结算 ' + st.pending : '') + (st.cancelled ? ' · 已撤 ' + st.cancelled : '') + '</span>' +
      '</div>' +
    '</section>';
  }
  function betItemHtml(b) {
    var st = betStatusMeta(b);
    var picks = betPickItems(b), qty = betNoteQty(b);
    var limit = 8, shown = picks, more = 0;
    if (picks.length > limit && !betExpanded[b.id]) { shown = picks.slice(0, limit); more = picks.length - limit; }
    var chips = shown.map(function (p) {
      return '<span class="bs-pick"><i>' + esc(p.label) + '</i>' + (p.odds ? '<em>' + esc(fmtOdds(p.odds)) + '</em>' : '') + '</span>';
    }).join('');
    if (picks.length > limit) chips += '<button type="button" class="bs-more" data-picks-more="' + esc(b.id) + '">' + (more ? '+ ' + more + ' 项' : '收起') + '</button>';
    var stake = Number(b.cost) || 0, pay = Number(b.payout) || 0;
    var payHtml = '<b class="max muted">—</b>', pfHtml = '<b class="max muted">—</b>';
    if (b.status === 'settled') {
      var pf = (b.profit == null ? pay - stake : Number(b.profit)) || 0;
      payHtml = '<b class="' + (pay > 0 ? 'pos' : 'max') + '">' + betMoney(pay) + '</b>';
      pfHtml = '<b class="' + (pf > 0 ? 'pos' : (pf < 0 ? 'neg' : 'max')) + '">' + (pf > 0 ? '+' : '') + betMoney(pf) + '</b>';
    } else if (b.status === 'cancelled') {
      pfHtml = '<b class="max">0</b>';
    }
    var when;
    if (b.status === 'settled' && b.settledAt) when = '结算 ' + fmtSettled(b.settledAt);
    else if (b.status === 'cancelled') when = '撤单 ' + (b.cancelledAt ? fmtSettled(b.cancelledAt) : '—') + ' · 退回 ' + betMoney(stake) + ' 积分';
    else when = '投注 ' + (b.created ? fmtSettled(b.created) : '—');
    var act = '';
    if (b.status === 'pending') {
      act = betWindowOpen(b)
        ? '<button type="button" class="bs-btn" data-cancel="' + esc(b.id) + '">撤单</button>'
        : '<button type="button" class="bs-btn off" disabled title="已封盘，不能撤单">已封盘</button>';
    }
    return '<article class="bets-item" data-bet-id="' + esc(b.id) + '">' +
      '<div class="bs-top"><span class="bs-game" style="--gc:' + esc(betGameColor(b.game)) + '"><i class="bs-icon">' + esc(betGameGlyph(b.game)) + '</i>' + esc(betGameName(b.game)) + '</span>' +
      '<span class="bs-issue">第 ' + esc(shortIssue(b.targetIssue)) + ' 期</span>' +
      '<em class="bs-status ' + st.cls + '">' + st.text + '</em></div>' +
      '<div class="bs-picks">' + (chips || '<span class="bs-pick empty">明细缺失</span>') + '<span class="bs-qty">× ' + qty + ' 注</span></div>' +
      '<div class="bs-money"><div><span>投注额</span><b>' + betMoney(stake) + '</b></div><div><span>派彩</span>' + payHtml + '</div><div class="al-r"><span>盈亏</span>' + pfHtml + '</div></div>' +
      '<div class="bs-foot"><span class="bs-time">' + esc(when) + '</span>' + act + '</div>' +
    '</article>';
  }
  function betsBodyHtml() {
    var list = betFilteredList(), st = betStats(list);
    var isMock = !!(window.LotteryAPI && window.LotteryAPI.isMock && window.LotteryAPI.isMock());
    var body = betsStatsHtml(st);
    if (isMock) body += '<div class="bets-preview" role="note"><b>预览模式</b><span>本地模拟数据 · 撤单只在本地生效，不写服务端</span></div>';
    if (!list.length) {
      body += '<div class="bets-empty"><b>' + (bets.length ? '该时间段暂无注单' : '暂无注单') + '</b><span>' + (bets.length ? '切换「今天 / 近7天 / 全部」看看。' : '去大厅选个号码，投注后会出现在这里。') + '</span></div>';
    } else {
      body += '<div class="bets-list">' + list.map(betItemHtml).join('') + '</div>';
    }
    return body;
  }
  function betsPageHtml() {
    var head = catTabs('') + '<div class="page-head bets-head"><div><div class="page-kicker">MY BETS</div><h1 class="page-title">投注记录</h1><div class="page-sub">购彩查询 · 期号 / 派彩 / 盈亏</div></div></div>';
    if (!currentUser()) {
      return head +
        '<div class="bets-login"><b>登录后查看投注记录</b><span>可查期号、投注明细、派彩与盈亏；封盘前支持撤单。</span><a class="btn btn-primary" href="#/login">登录 / 注册</a></div>' +
        '<div class="mini-note">只展示当前账号的云端注单；结算状态以服务端为准。</div>';
    }
    return head + '<div id="betsBody">' + betsBodyHtml() + '</div>' +
      '<div class="mini-note">封盘前可不限次数撤单，撤单全额退回积分且不参与结算；派彩以服务端结算为准。</div>';
  }
  function renderBetsBody() {
    var el = document.getElementById('betsBody');
    if (!el) return;
    el.innerHTML = betsBodyHtml();
  }
  // 规则：pending 且未封盘可撤；期号与当前期不一致时不擅自拦截（服务端 /cancel 才权威，
  // 不一致时点撤单会拿到 WINDOW_CLOSED 再置灰），避免把「跨期但服务端仍允许」的注单锁死。
  function betWindowOpen(b) {
    if (!b || b.status !== 'pending') return false;
    if (betClosed[b.id]) return false;
    var info = betsIssue[b.game];
    if (info) {
      if (info.open === false) return false;
      var close = info.closeAt ? Date.parse(info.closeAt) : 0;
      if (close && Date.now() >= close && Number(b.targetIssue) === Number(info.issue)) return false;
    }
    var w = state.win[b.game];
    if (w && w.open === false) return false;
    return true;
  }
  function loadBetsIssueInfo() {
    if (!currentUser()) return;
    if (currentRoute().name !== 'bets') return;
    var games = [];
    bets.forEach(function (b) { if (b.status === 'pending' && b.game && games.indexOf(b.game) < 0) games.push(b.game); });
    if (!games.length) return;
    var now = Date.now();
    games.slice(0, 8).forEach(function (g) {
      var cached = betsIssue[g];
      if (cached && now - (cached.at || 0) < 20000) return;
      window.LotteryAPI.call('/issues/' + encodeURIComponent(g), { method: 'GET' }).then(function (d) {
        var w = (d && d.window) || null;
        betsIssue[g] = { at: Date.now(), issue: d && d.issue, closeAt: (d && d.closeAt) || (w && (w.endAt || w.closeAt)) || null, open: w ? w.open : undefined };
        if (currentRoute().name === 'bets') renderBetsBody();
      }).catch(function () {});
    });
  }
  function ensureCancelSheet() {
    var el = document.getElementById('cancelSheet');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'cancelSheet';
    el.className = 'cs-mask';
    el.hidden = true;
    el.innerHTML = '<div class="cs-card" role="dialog" aria-modal="true" aria-labelledby="csTitle">' +
      '<h3 id="csTitle">确认撤单？</h3>' +
      '<div class="cs-bet" id="csBet"></div>' +
      '<p class="cs-note">撤单后该注不参与结算，投注积分全额退回；封盘前可不限次数撤单。</p>' +
      '<div class="cs-actions"><button class="cs-ghost" type="button" data-cancel-abort>再想想</button><button class="cs-main" type="button" data-cancel-confirm>确认撤单</button></div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }
  function openCancelSheet(id) {
    var b = bets.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!b || b.status !== 'pending') return;
    cancelTargetId = String(id);
    var sheet = ensureCancelSheet();
    var items = betPickItems(b).map(function (p) { return p.label; }).join(' · ');
    var isMock = !!(window.LotteryAPI && window.LotteryAPI.isMock && window.LotteryAPI.isMock());
    document.getElementById('csBet').innerHTML =
      '<div class="cs-line"><span>' + esc(betGameName(b.game)) + ' · 第 ' + esc(shortIssue(b.targetIssue)) + ' 期</span><b>退回 ' + betMoney(b.cost) + ' 积分</b></div>' +
      '<div class="cs-picks">' + esc(items || '投注明细缺失') + '</div>' +
      (isMock ? '<div class="cs-mock">预览：本次撤单仅本地模拟，不会写服务端</div>' : '');
    sheet.hidden = false;
    var btn = sheet.querySelector('[data-cancel-confirm]');
    if (btn) { btn.disabled = false; btn.textContent = '确认撤单'; }
    try { if (btn) btn.focus(); } catch (e) {}
    document.body.classList.add('cs-open');
  }
  function closeCancelSheet() {
    var el = document.getElementById('cancelSheet');
    if (el) el.hidden = true;
    document.body.classList.remove('cs-open');
    cancelTargetId = '';
    cancelBusy = false;
  }
  function cancelErrorCode(err) {
    return (err && err.data && err.data.error && err.data.error.code) || '';
  }
  function cancelErrorMessage(err) {
    var code = cancelErrorCode(err);
    if (code === 'BET_NOT_FOUND') return '注单不存在，请刷新列表';
    if (code === 'ALREADY_SETTLED') return '该注已结算或已撤单，不能撤单';
    if (code === 'WINDOW_CLOSED') return '已封盘，不能撤单';
    if (code === 'CANCELLED') return '该注单已撤单';
    if (code === 'NOT_OWNER') return '只能撤自己的注单';
    return String((err && err.message) || '撤单失败，请稍后重试');
  }
  function mockCancelBet(id) {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('lh-mock-state-v1') || 'null'); } catch (e) { raw = null; }
    var err = function (code, msg) { var e = new Error(msg); e.data = { error: { code: code } }; return e; };
    if (!raw || !Array.isArray(raw.bets)) return Promise.reject(err('BET_NOT_FOUND', '注单不存在'));
    var b = raw.bets.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!b) return Promise.reject(err('BET_NOT_FOUND', '注单不存在'));
    if (b.status === 'cancelled') return Promise.reject(err('CANCELLED', '该注单已撤单'));
    if (b.status !== 'pending') return Promise.reject(err('ALREADY_SETTLED', '注单已结算'));
    var stake = Math.max(0, Math.round(Number(b.stake) || 0));
    b.status = 'cancelled'; b.payout = 0; b.cancelledAt = Date.now();
    raw.points = (Number(raw.points) || 0) + stake;
    try { localStorage.setItem('lh-mock-state-v1', JSON.stringify(raw)); } catch (e2) {}
    return Promise.resolve({ ok: true, mock: true, bet: b, points: raw.points, refund: stake });
  }
  function doCancel() {
    var b = bets.filter(function (x) { return String(x.id) === String(cancelTargetId); })[0];
    if (!b || cancelBusy) return;
    var sheet = ensureCancelSheet(), btn = sheet.querySelector('[data-cancel-confirm]');
    cancelBusy = true;
    if (btn) { btn.disabled = true; btn.textContent = '撤单中…'; }
    var isMock = !!(window.LotteryAPI && window.LotteryAPI.isMock && window.LotteryAPI.isMock());
    var req = isMock ? mockCancelBet(b.id) : window.LotteryAPI.call('/cancel', { method: 'POST', body: { betId: b.id } });
    req.then(function (res) {
      cancelBusy = false;
      var refund = Math.max(0, Number(b.cost) || 0);
      var np = (res && res.points != null) ? parseInt(res.points, 10) : NaN;
      if (isFinite(np)) { points = np; if (awRow) awRow.points = np; updatePointsUI(); }
      b.status = 'cancelled'; b.payout = 0; b.profit = 0;
      b.cancelledAt = (res && res.bet && res.bet.cancelledAt) || Date.now();
      closeCancelSheet(); renderBetsBody(); updateUserChip();
      showToast('已撤单，退回 ' + betMoney(refund) + ' 积分' + (isMock ? '（本地模拟）' : '') + ' · 当前积分 ' + betMoney(points));
      if (!isMock) { try { loadUserBets().then(function (nb) { if (JSON.stringify(nb) !== JSON.stringify(bets)) { bets = nb; renderBetsBody(); } }); } catch (e) {} }
    }).catch(function (err) {
      cancelBusy = false;
      var code = cancelErrorCode(err);
      if (code === 'WINDOW_CLOSED') {
        betClosed[b.id] = true;
        closeCancelSheet(); renderBetsBody(); showToast('已封盘，不能撤单');
        return;
      }
      if (code === 'ALREADY_SETTLED' || code === 'CANCELLED' || code === 'BET_NOT_FOUND') {
        closeCancelSheet();
        try { refreshPointsAndBets(); } catch (e) {}
        showToast(cancelErrorMessage(err));
        return;
      }
      if (btn) { btn.disabled = false; btn.textContent = '确认撤单'; }
      showToast(cancelErrorMessage(err));
    });
  }

  function myBetsHtml() {
    var list = bets.slice().sort(function (a, b) { return (Number(b.created) || 0) - (Number(a.created) || 0); }).slice(0, 6);
    return '<div class="my-bets"><div class="my-bets-head"><h2>最近注单</h2><a class="my-bets-all" href="#/bets">全部记录 ›</a></div>' + (list.length ? list.map(function (b) {
      var st = betStatusMeta(b);
      var picks = betPickItems(b).map(function (p) { return p.label + (p.odds ? ' ' + fmtOdds(p.odds) : ''); }).join('、');
      var tail = b.status === 'settled'
        ? ('派彩 ' + betMoney(b.payout) + ' · 盈亏 ' + ((Number(b.profit) || 0) > 0 ? '+' : '') + betMoney(b.profit))
        : (b.status === 'cancelled' ? ('已退回 ' + betMoney(b.cost) + ' 积分') : ('投注 ' + betMoney(b.cost) + ' · 待开奖'));
      var when = b.status === 'settled' && b.settledAt ? ' · 结算 ' + fmtSettled(b.settledAt) : (b.status === 'cancelled' && b.cancelledAt ? ' · 撤单 ' + fmtSettled(b.cancelledAt) : '');
      return '<div class="my-bet"><div class="my-bet-top"><span>' + esc(betGameName(b.game)) + ' · 第 ' + esc(shortIssue(b.targetIssue)) + ' 期</span><em class="' + st.cls + '">' + st.text + '</em></div>' +
        '<div class="my-bet-picks">' + esc(picks || '明细缺失') + '</div>' +
        '<div class="my-bet-sub">' + esc(tail) + when + '</div></div>';
    }).join('') : '<div class="my-bet-empty">暂无注单 · <a href="#/bets">去投注记录</a></div>') + '</div>';
  }
  function focusSafe() { var a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }
  function updateBetsOnly() {
    if (focusSafe()) return;
    if (document.getElementById('betsBody')) { renderBetsBody(); loadBetsIssueInfo(); return; }
    var box = document.querySelector('.my-bets'); if (!box) return;
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
  function fmtOdds(v) {
    var n = Number(v);
    if (!isFinite(n)) return String(v == null ? '' : v);
    var s = n.toFixed(4);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
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
  function histTableRows(id, rows) {
    return (rows || []).slice(0, 20).map(function (h) {
      var nums = (h.nums || []).map(function (x) { return (typeof x === 'object') ? x : { c: String(x) }; });
      var text = nums.length ? balls(nums, true) : (h.bigSmall || h.parity || '—');
      return '<tr><td class="iss">' + shortIssue(h.issue) + '</td><td>' + DEFS[id].name + '</td><td>' + text + '</td><td><span class="status">● 已开奖</span></td></tr>';
    }).join('');
  }
  function histRows(id) {
    var def = DEFS[id] || {}, list = [];
    if (state.histApi[id] && state.histApi[id].length) return state.histApi[id].slice(0, 20);
    if (def.mock) { try { list = JSON.parse(localStorage.getItem('xc-race-hist-' + id) || '[]'); } catch (e) {} }
    if (!list.length) { var g = state.games[id]; list = (g && g.history) || []; }
    if (!list.length && state.games[id] && state.games[id].last) list = [state.games[id].last];
    return list.slice(0, 15);
  }
  function histInner(id) {
    var mode = window.__histMode || 'num', def = DEFS[id] || {}, racing = !!def.racing;
    var tabs = [['num','显示号码'],['bs','显示大小'],['oe','显示单双'],['sum','冠亚/龙虎']];
    var rows = histRows(id);
    var body = rows.map(function (h, ri) {
      var nums = (h.nums || []).map(function (x) { return parseInt(x.c || x, 10); });
      var cells = '';
      if (mode === 'num') {
        nums.forEach(function (v) {
          var c = racing ? (RACING_COLORS[pad(v)] || '#999') : (colorOf(v) === '红' ? '#E23A3A' : (colorOf(v) === '蓝' ? '#1F6FEB' : '#1FA85C'));
          cells += '<span class="hh-ball" style="background:' + c + '">' + pad(v) + '</span>';
        });
      } else if (mode === 'bs') {
        nums.forEach(function (v) { var big = racing ? v >= 6 : v >= 25; cells += '<span class="hh-cell' + (big ? ' big' : '') + '">' + (big ? '大' : '小') + '</span>'; });
      } else if (mode === 'oe') {
        nums.forEach(function (v) { cells += '<span class="hh-cell">' + (v % 2 ? '单' : '双') + '</span>'; });
      } else {
        if (!nums.length) { cells = '<span class="hh-missing">号码缺失</span>'; }
        else if (racing && nums.length >= 2) {
          var sum = nums[0] + nums[1];
          cells = '<span class="hh-sum">和值 ' + sum + '</span>';
          for (var k = 0; k < 5 && k < nums.length / 2; k++) {
            var a = nums[k], b = nums[nums.length - 1 - k];
            cells += '<span class="hh-dragon">' + (k + 1) + 'V' + (10 - k) + ' ' + (a > b ? '龙' : (a < b ? '虎' : '和')) + '</span>';
          }
        } else {
          cells = '<span class="hh-sum">和值 ' + (nums[0] || 0) + '+' + (nums[1] || 0) + '</span><span class="hh-dragon">特码 ' + pad(nums[6] || 0) + '</span>';
        }
      }
      return '<div class="hh-row' + (ri % 2 ? ' alt' : '') + '"><span class="hh-issue">' + shortIssue(h.issue) + '期</span><span class="hh-cells">' + cells + '</span></div>';
    }).join('') || '<div class="hh-empty">暂无历史（本期开奖后开始积累）</div>';
    return '<div class="hh-tabs">' + tabs.map(function (t) { return '<button type="button" class="hh-tab ' + (mode === t[0] ? 'on' : '') + '" data-hist-mode="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' + body +
      '<div class="hh-more"><a href="#/history">更多历史 ›</a></div>';
  }
  function loadHistoryData(id) {
    if (!id || state.histLoading[id] || (state.histApi[id] && state.histApi[id].length)) return;
    state.histLoading[id] = 1;
    try {
      window.LotteryAPI.call('/history/' + encodeURIComponent(id) + '?limit=20', { method: 'GET' }).then(function (d) {
        var rows = (d && (d.items || d.results || d.history || d.rows)) || [];
        if (!Array.isArray(rows) && rows && typeof rows === 'object') {
          rows = Object.keys(rows).map(function (k) { var v = rows[k] || {}; return { issue: v.issue || k, nums: v.nums || v.lastResult || [] }; });
        }
        rows = rows.filter(function (h) { return h && h.issue != null && (h.nums || []).length; }).sort(function (a, b) { return Number(b.issue) - Number(a.issue); });
        if (rows.length) {
          state.histApi[id] = rows;
          var box = document.querySelector('.race-history'); if (box) box.innerHTML = histInner(id);
          try { var tb = document.querySelector('.hist tbody'); if (tb && currentRoute().name === 'history') tb.innerHTML = histTableRows(id, rows); } catch (e) {}
        }
      }).catch(function () {});
    } catch (e) {}
  }
  function toggleHistory(id) {
    var old = document.querySelector('.race-history');
    if (old) { old.remove(); return; }
    var head = document.querySelector('[data-audit="head-wrap"]'); if (!head) return;
    var box = document.createElement('div'); box.className = 'race-history';
    box.innerHTML = histInner(id);
    head.parentNode.insertBefore(box, head.nextSibling);
    loadHistoryData(id);
  }
  function racingHeaderHtml(def, g) {
    var nums = (g && g.last && g.last.nums) || [];
    var has = nums.length >= 7;
    var boxes = '';
    for (var i = 0; i < 10; i++) {
      var t = has ? nums[i] : null;
      var raw = t ? parseInt(t.c, 10) : 0;
      var c = (raw >= 1 && raw <= 10) ? raw : (i + 1);
      boxes += '<span class="nbox" data-audit="num" style="--rc:' + (RACING_COLORS[pad(c)] || '#999') + '">' + (has ? pad(c) : '—') + '</span>';
    }
    var lastRaw = (g && g.last && g.last.issue) || 0, nextRaw = (g && g.nextIssue) || 0;
    var lastLabel = (g && g.last && g.last.issueLabel) || (lastRaw ? lastRaw : '——');
    var nextLabel = (g && (g.nextIssueLabel || g.nextLabel)) || (nextRaw ? nextRaw : '——');
    var sm = raceSummary(has ? nums : []);
    var dragons = has ? sm.dragon.map(function (d) { return '<span class="lbox" data-audit="label">' + d + '</span>'; }).join('') : '<span class="lbox">—</span>';
    var labelRow = '<div class="rr-labels"><span class="lbox wide" data-audit="label">和值 ' + (has ? sm.sum : '—') + '</span><span class="lbox" data-audit="label">' + (has ? sm.big : '—') + '</span><span class="lbox" data-audit="label">' + (has ? sm.odd : '—') + '</span>' + dragons + '</div>';
    return '<div class="race-head">' +
      '<span class="race-title">' + esc(def.raceTitle || def.name || '极速赛车') + ' »</span>' +
      '<span class="race-mode">信用玩法 ▾</span>' +
      '<span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="race-result" data-audit="head-wrap"><div class="rr-left"><div class="rr-issue" data-audit="title" data-hist-toggle="' + def.id + '">第 ' + lastLabel + ' 期开奖结果 <i class="hist-arrow">▾</i></div>' +
      '<div class="rr-nums">' + boxes + '</div>' + labelRow + '</div>' +
      '<div class="rr-right" data-audit="timepanel"><div class="rr-next"><span data-audit="time-row">' + nextLabel + ' 期</span><span data-audit="time-row"><i>封盘时间 ⏱</i></span></div><div class="rr-cd" data-audit="time-row" data-race-cd data-close="' + ((g && g.mockNext) || 0) + '">00:00:04</div></div></div>' +
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
        return '<button type="button" class="bet-option ts-opt ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + label + '" data-odds="' + odds + '"><span>' + label + '</span><em>' + fmtOdds(odds) + '</em></button>';
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
    } else if (cat === 'sum') {
      var R3 = window.LH_RACING_ODDS || {}, t3 = R3.sum || R3.twoSide || {};
      function sumOdds(n) {
        if (n === 3 || n === 4 || n === 18 || n === 19) return 42.5;
        if (n === 5 || n === 6 || n === 16 || n === 17) return 22;
        if (n === 7 || n === 8 || n === 14 || n === 15) return 14.5;
        if (n === 9 || n === 10 || n === 12 || n === 13) return 11;
        return 8.8;
      }
      var sh = '<div class="ts-sec"><div class="ts-hd">冠亚和值</div><div class="combo-grid">';
      for (var sv = 3; sv <= 19; sv++) {
        var sk = 'sum:' + sv;
        sh += '<button type="button" class="bet-option combo-cell ' + (isSel(sk) ? 'on' : '') + '" data-bet="' + sk + '" data-label="和值 ' + sv + '" data-odds="' + sumOdds(sv) + '"><span class="combo-name">' + sv + '</span><em class="combo-odds">' + fmtOdds(sumOdds(sv)) + '</em></button>';
      }
      sh += '</div></div><div class="ts-sec"><div class="ts-hd">两面</div><div class="combo-grid">' +
        ['big:大:' + t3.big, 'small:小:' + t3.small, 'odd:单:' + t3.odd, 'even:双:' + t3.even].map(function (x) {
          var p = x.split(':'); return '<button type="button" class="bet-option combo-cell ' + (isSel('sum:' + p[0]) ? 'on' : '') + '" data-bet="sum:' + p[0] + '" data-label="' + p[1] + '" data-odds="' + p[2] + '"><span class="combo-name">' + p[1] + '</span><em class="combo-odds">' + fmtOdds(p[2]) + '</em></button>';
        }).join('') + '</div></div>';
      body = sh;
    } else if (cat === 'long') {
      var R4 = window.LH_RACING_ODDS || {}, dOdds = 1.99, hist = [];
      try { hist = JSON.parse(localStorage.getItem('xc-race-hist-' + id) || '[]'); } catch (e) {}
      var need = betState.dragonN || 4;
      var items = [];
      function pushItem(name, dir, streak) { if (streak >= need) items.push({ name: name, dir: dir, streak: streak }); }
      if (hist.length) {
        var ranks = [['第1名', 'r1'], ['第2名', 'r2'], ['第3名', 'r3'], ['第4名', 'r4'], ['第5名', 'r5'], ['第6名', 'r6'], ['第7名', 'r7'], ['第8名', 'r8'], ['第9名', 'r9'], ['第10名', 'r10']];
        for (var ri = 0; ri < 10; ri++) {
          var streakBS = 1, baseBS = null, streakOE = 1, baseOE = null;
          for (var hi = 0; hi < hist.length; hi++) {
            var vv = parseInt(hist[hi].nums[ri], 10); if (!vv) break;
            var bs = vv >= 6 ? '大' : '小', oe = vv % 2 ? '单' : '双';
            if (hi === 0) { baseBS = bs; baseOE = oe; } else { if (bs === baseBS) streakBS++; if (oe === baseOE) streakOE++; }
          }
          if (baseBS) pushItem(ranks[ri][0] + ' 大小', baseBS, streakBS);
          if (baseOE) pushItem(ranks[ri][0] + ' 单双', baseOE, streakOE);
        }
        var pairs = [['1V10', 0, 9], ['2V9', 1, 8], ['3V8', 2, 7], ['4V7', 3, 6], ['5V6', 4, 5]];
        pairs.forEach(function (p) {
          var st = 1, base = null;
          for (var hi = 0; hi < hist.length; hi++) {
            var a = parseInt(hist[hi].nums[p[1]], 10), b = parseInt(hist[hi].nums[p[2]], 10); if (!a || !b) break;
            var dr = a > b ? '龙' : (a < b ? '虎' : '和');
            if (hi === 0) base = dr; else if (dr === base) st++;
          }
          if (base) pushItem(p[0] + ' 龙虎', base, st);
        });
        var stSum = 1, baseSum = null;
        for (var hi2 = 0; hi2 < hist.length; hi2++) {
          var smv = (parseInt(hist[hi2].nums[0], 10) || 0) + (parseInt(hist[hi2].nums[1], 10) || 0);
          var sd = smv >= 12 ? '大' : '小'; if (hi2 === 0) baseSum = sd; else if (sd === baseSum) stSum++;
        }
        if (baseSum) pushItem('冠亚和 大小', baseSum, stSum);
      }
      var opts = [4, 6, 8, 10, 12].map(function (x) { return '<option value="' + x + '"' + (x === need ? ' selected' : '') + '>长龙连开期数：' + x + '</option>'; }).join('');
      var list = items.sort(function (a, b) { return b.streak - a.streak; }).map(function (it) {
        return '<div class="dragon-card"><div class="dragon-hd"><b>' + esc(it.name) + '</b><span class="dragon-streak">连开 <b>' + it.streak + '</b> 期</span></div><div class="dragon-mid"><span class="dragon-dir">' + esc(it.dir) + '</span><em class="dragon-odds">' + fmtOdds(dOdds) + '</em></div><div class="dragon-foot">只读监控 · 不可下注</div></div>';
      }).join('');
      body = '<div class="dragon-toolbar"><select data-dragon-n>' + opts + '</select></div>' + (list || '<div class="dragon-empty">暂无（正在积累历史，当前 ' + hist.length + ' 期）</div>');
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
    var topHtml = '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + racingHeaderHtml(def, g) +
      '<div class="race-layout"><div class="race-cats">' + RACING_CATS5.map(function (c) {
        return '<button type="button" class="race-cat ' + (cat === c.id ? 'on' : '') + '" data-race-cat="' + c.id + '"><i></i>' + c.name + '</button>';
      }).join('') + '</div><div class="race-main">' + body + '</div></div>';
    var bottom = cat === 'long' ? '<div class="dragon-note">长龙为只读监控，不支持下注</div>' :
      '<div class="race-picked">已选：<b data-picked-list>—</b></div>' +
      '<div class="bet-hint" data-bet-hint></div>' +
      '<div class="race-closed" data-closed hidden><div><b>已停止投注</b><span>下一期已开盘，投注时请注意期号</span></div><button type="button" data-race-next>知道了</button></div>' +
      '<div class="race-chips">' + chips + '</div>' +
      '<div class="race-amount"><label>金额：</label><input id="betQty" type="text" inputmode="numeric" value="' + esc(betState.qty) + '"><span class="race-unit">积分</span><button type="button" class="race-quick">快捷金额</button><button type="button" class="race-reset" data-race-reset>重置</button><button type="button" class="race-submit" data-bet-submit>下注</button></div>' +
      '<div class="race-keypad" id="raceKeypad" hidden>' + [1,2,3,4,5,6,7,8,9].map(function (d) { return '<button type="button" data-kp="' + d + '">' + d + '</button>'; }).join('') + '<button type="button" data-kp="del">删除</button><button type="button" data-kp="0">0</button><button type="button" data-kp="ok">确定</button></div>' +
      '<div class="race-foot">一共 <b data-bet-count>0</b> 注，共 <b data-bet-cost>0</b> 积分</div>';
    return topHtml + bottom;
  }
  var COLOR_WAVE_BY_GAME = {};
  function sixColorOdds(gameId) {
    var out = { red: 2.7, blue: 2.8, green: 2.8 };
    var base = SIX_ODDS && SIX_ODDS.colorWave;
    if (base && typeof base === 'object') { out.red = Number(base.red) || out.red; out.blue = Number(base.blue) || out.blue; out.green = Number(base.green) || out.green; }
    else if (base) { var v = Number(base) || 2.7; out = { red: v, blue: v, green: v }; }
    var g = COLOR_WAVE_BY_GAME && COLOR_WAVE_BY_GAME[gameId];
    if (g && typeof g === 'object') { if (g.red != null) out.red = Number(g.red); if (g.blue != null) out.blue = Number(g.blue); if (g.green != null) out.green = Number(g.green); }
    return out;
  }
  var SIX_ODDS = { colorWave: { red: 2.7, blue: 2.8, green: 2.8 }, specialZodiac: { horse: 9.5, other: 11.7 }, flatZodiac: { horse: 1.8, other: 2 } };
  var SIX_CATS = ['特码','两面','色波','特肖','正码','正特','正码1-6','连码','平特一肖','平特尾','合肖','自选不中','连肖','尾数连','龙虎斗','长龙'];
  var SIX_ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  function sixBall(n) {
    var c = colorOf(n), cls = c === '红' ? 'rb' : (c === '蓝' ? 'bb' : 'gb');
    return '<span class="six-ball ' + cls + '">' + pad(n) + '</span>';
  }
  function sixSpecialPage(id, def, g) {
    var cat = betState.sixCat || '特码';
    if (cat === '尾数') cat = '平特尾';
    var last = (g && g.last) || { issue: 0, nums: [] };
    var balls = '', zods = '';
    (last.nums || []).slice(0, 7).forEach(function (x, idx) {
      var n = parseInt(x.c, 10), col = x.color || colorOf(n);
      var hex = col === '红' ? '#E23A3A' : (col === '蓝' ? '#1F6FEB' : '#1FA85C');
      if (idx === 6) balls += '<span class="six-plus">+</span>';
      balls += '<span class="nbox six-nbox" data-audit="num"' + (idx === 6 ? ' special' : '') + '" style="background:' + hex + '">' + pad(n) + '</span>';
      zods += '<span class="lbox six-lbox" data-audit="label">' + (x.z || attrFor(n).z || '') + '</span>';
    });
    var head = '<div class="six-head"><span class="race-title">' + esc(def.name) + ' »</span><span class="race-mode">信用玩法 ▾</span><span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="race-result six-result-head" data-audit="head-wrap"><div class="rr-left">' +
      '<div class="rr-issue" data-audit="title" data-hist-toggle="' + id + '">第 ' + shortIssue(last.issueLabel || last.issue) + ' 期开奖结果 <i class="hist-arrow">▾</i></div>' +
      '<div class="rr-nums six-rr-nums">' + balls + '</div>' +
      '<div class="rr-labels six-rr-labels">' + zods + '</div></div>' +
      '<div class="rr-right" data-audit="timepanel"><div class="rr-next"><span data-audit="time-row">' + ((g && (g.nextIssueLabel || g.nextIssue)) || last.issue + 1) + ' 期</span><span data-audit="time-row"><i>封盘时间 ⏱</i></span></div><div class="rr-cd" data-audit="time-row" data-cd="' + id + '">' + countdownText(g) + '</div></div></div>';
    var cats = SIX_CATS.map(function (c) { return '<button type="button" class="six-cat ' + (cat === c ? 'on' : '') + '" data-six-cat="' + c + '">' + c + '</button>'; }).join('');
    var main;
    if (cat === '特码') {
      var odds = Number(def.specialOdds) || Number(ODDS.special) || 0, grid = '';
      var zf = betState.sixZodiac || '';
      for (var i = 1; i <= 49; i++) {
        var key = pad(i);
        if (zf && attrFor(i).z !== zf) continue;
        grid += '<button type="button" class="six-cell ' + (isSel(key) ? 'on' : '') + '" data-bet="' + key + '" data-label="' + key + '" data-odds="' + odds + '">' + sixBall(i) + '<em class="six-odds">' + fmtOdds(odds) + '</em></button>';
      }
      main = '<div class="six-title">特码</div><div class="six-zodiac-strip">' + SIX_ZODIAC.map(function (z) { return '<button type="button" class="six-ztab ' + (zf === z ? 'on' : '') + '" data-six-zodiac="' + z + '">' + z + '</button>'; }).join('') + '</div><div class="six-grid">' + grid + '</div>';
    } else if ((cat === '一肖' || cat === '特肖')) {
      main = '<div class="six-title">特肖</div><div class="six-opts">' + SIX_ZODIAC.map(function (z) {
        var oo = (z === '马' ? SIX_ODDS.specialZodiac.horse : SIX_ODDS.specialZodiac.other);
        return '<button type="button" class="six-opt ' + (isSel('zodiac:' + z) ? 'on' : '') + '" data-bet="zodiac:' + z + '" data-label="' + z + '" data-odds="' + oo + '"><span>' + z + '</span><em>' + fmtOdds(oo) + '</em></button>';
      }).join('') + '</div>';
    } else if (cat === '两面') {
      var o2 = ODDS.twoSide || 1.96;
      main = '<div class="six-title">两面</div><div class="six-opts">' + ['大','小','单','双'].map(function (z) {
        return '<button type="button" class="six-opt ' + (isSel('lm:' + z) ? 'on' : '') + '" data-bet="lm:' + z + '" data-label="' + z + '" data-odds="' + o2 + '"><span>' + z + '</span><em>' + fmtOdds(o2) + '</em></button>';
      }).join('') + '</div>';
    } else if (cat === '平特一肖') {
      main = '<div class="six-title">平特一肖</div><div class="six-opts">' + SIX_ZODIAC.map(function (z) {
        var fo = (z === '马' ? SIX_ODDS.flatZodiac.horse : SIX_ODDS.flatZodiac.other);
        return '<button type="button" class="six-opt ' + (isSel('flat:' + z) ? 'on' : '') + '" data-bet="flat:' + z + '" data-label="' + z + '" data-odds="' + fo + '"><span>' + z + '</span><em>' + fmtOdds(fo) + '</em></button>';
      }).join('') + '</div>';
    } else if (cat === '色波') {
      var cw = sixColorOdds(id);
      main = '<div class="six-title">色波</div><div class="six-opts">' + [['红波','red'],['蓝波','blue'],['绿波','green']].map(function (z) {
        var o3 = cw[z[1]];
        return '<button type="button" class="six-opt ' + (isSel('color:' + z[1]) ? 'on' : '') + '" data-bet="color:' + z[1] + '" data-label="' + z[0] + '" data-odds="' + o3 + '"><span>' + z[0] + '</span><em>' + fmtOdds(o3) + '</em></button>';
      }).join('') + '</div>';
    } else if (cat === '正码' || cat === '正特') {
      var nob = window.LH_ODDS_BY_PLAY || {};
      var isZt = cat === '正特';
      var no = isZt ? Number(def.specialOdds) : Number(nob.regular);
      if (!isFinite(no) || no <= 0) no = Number(isZt ? ODDS.special : ODDS.regular);
      if (!isFinite(no) || no <= 0) no = isZt ? 47.3 : 7.8;
      var nGrid = '';
      for (var ni = 1; ni <= 49; ni++) {
        var nKey = (isZt ? 'zhengte:' : 'regular:') + pad(ni);
        nGrid += '<button type="button" class="six-cell ' + (isSel(nKey) ? 'on' : '') + '" data-bet="' + nKey + '" data-label="' + pad(ni) + '" data-odds="' + no + '">' + sixBall(ni) + '<em class="six-odds">' + fmtOdds(no) + '</em></button>';
      }
      main = '<div class="six-title">' + cat + '</div><div class="six-grid">' + nGrid + '</div>';
    } else if (cat === '平特尾') {
      var tob = window.LH_ODDS_BY_PLAY || {};
      var tailObj = (tob.tail && typeof tob.tail === 'object') ? tob.tail : null;
      var tGrid = '';
      for (var ti = 0; ti <= 9; ti++) {
        var tKey = 'tail:' + ti;
        var to = tailObj ? Number(tailObj[String(ti)]) : (ti === 0 ? 2.0 : 1.8);
        if (!isFinite(to) || to <= 0) to = ti === 0 ? 2.0 : 1.8;
        var tb = '';
        for (var tn = 1; tn <= 49; tn++) if (tn % 10 === ti) tb += sixBall(tn);
        tGrid += '<button type="button" class="six-tail-row ' + (isSel(tKey) ? 'on' : '') + '" data-bet="' + tKey + '" data-label="' + (ti === 0 ? '0尾' : ti + '尾') + '" data-odds="' + to + '"><span class="six-tail-left"><b>' + ti + '尾</b><em>' + fmtOdds(to) + '</em></span><span class="six-tail-balls">' + tb + '</span></button>';
      }
      main = '<div class="six-title">平特尾</div><div class="six-tail-list">' + tGrid + '</div>';
    } else {
      main = '<div class="six-title">' + esc(cat) + '</div><div class="six-empty"><b>待开放</b><span>该玩法暂未开放</span></div>';
    }
    var chips = [10,20,50,100,200,500,1000].map(function (v, i) {
      var cc = ['#F5A623','#E23A3A','#1FA85C','#1E5FD8','#555555','#1E5FD8','#FFD700'][i] || '#999';
      return '<button type="button" class="race-chip ' + (String(betState.qty) === String(v) ? 'on' : '') + '" data-qty="' + v + '" style="--cc:' + cc + '">' + v + '</button>';
    }).join('');
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + head +
      '<div class="six-layout"><div class="six-cats">' + cats + '</div><div class="six-main">' + main + '</div></div>' +
      '<div class="race-picked">已选：<b data-picked-list>—</b></div><div class="bet-hint" data-bet-hint></div>' +
      '<div class="race-chips">' + chips + '</div>' +
      '<div class="race-amount"><label>金额：</label><input id="betQty" type="text" inputmode="numeric" value="' + esc(betState.qty) + '"><span class="race-unit">积分</span><button type="button" class="race-quick">快捷金额</button><button type="button" class="race-reset" data-race-reset>重置</button><button type="button" class="race-submit" data-bet-submit>下注</button></div>' +
      '<div class="race-foot">一共 <b data-bet-count>0</b> 注，共 <b data-bet-cost>0</b> 积分</div>';
  }

  var K3_PIPS = { 1:[[50,50]], 2:[[26,26],[74,74]], 3:[[24,24],[50,50],[76,76]], 4:[[26,26],[74,26],[26,74],[74,74]], 5:[[26,26],[74,26],[50,50],[26,74],[74,74]], 6:[[26,24],[74,24],[26,50],[74,50],[26,76],[74,76]] };
  function k3Die(n, cls) {
    var v = parseInt(n, 10), pips = K3_PIPS[v] || [];
    return '<span class="k3-die d' + (v || 0) + ' ' + (cls || '') + '" aria-label="' + (pips.length ? v + '点' : '待开奖') + '">' + pips.map(function (p) { return '<i style="left:' + p[0] + '%;top:' + p[1] + '%"></i>'; }).join('') + '</span>';
  }
  function k3Dice(n) { return '<span class="k3-dice3">' + k3Die(n) + k3Die(n) + k3Die(n) + '</span>'; }
  function k3Page(id, def, g) {
    var cat = betState.k3Cat || 'tri';
    var last = (g && g.last) || {};
    var raw = (last.nums || []).slice(0, 3).map(function (x) { return parseInt(x && x.c != null ? x.c : x, 10); });
    var has = raw.length === 3 && raw.every(function (n) { return n >= 1 && n <= 6; });
    var sum = has ? raw.reduce(function (a, b) { return a + b; }, 0) : 0;
    var bigSmall = has ? (sum >= 11 ? '大' : '小') : '';
    var oe = has ? (sum % 2 ? '单' : '双') : '';
    var head = '<div class="k3-head"><div class="k3-head-top"><span class="k3-logo">极速快三 »</span><span class="k3-mode">信用玩法 ▾</span><span class="k3-help">小助手</span><span class="k3-menu">☰</span></div>' +
      '<div class="k3-result"><span class="k3-res-dice">' + (has ? raw.map(function (n) { return k3Die(n); }).join('') : k3Die('') + k3Die('') + k3Die('')) + '</span>' +
      '<span class="k3-sum">和值<b>' + (has ? sum : '—') + '</b></span>' +
      '<span class="k3-tags">' + (bigSmall ? '<i>' + bigSmall + '</i>' : '') + (oe ? '<i>' + oe + '</i>' : '') + '</span>' +
      '<span class="k3-next"><b>下一期 ' + esc((g && (g.nextIssueLabel || g.nextIssue)) || '—') + '</b><strong>封盘 ⏱ <em class="k3-cd">' + countdownText(g) + '</em></strong></span></div></div>';
    var cats = [['tri','全骰、围骰'],['sum','点数'],['long','长龙']].map(function (x) {
      return '<button type="button" class="k3-cat ' + (cat === x[0] ? 'on' : '') + '" data-k3-cat="' + x[0] + '">' + x[1] + '</button>';
    }).join('');
    var body;
    if (cat === 'tri') {
      var ob = (window.LH_ODDS_BY_PLAY && window.LH_ODDS_BY_PLAY.k3) || {};
      var all = Number(ob.triAll) || 35, exact = Number(ob.triExact) || 175;
      var grid = '<button type="button" class="k3-cell k3-any ' + (isSel('tri:any') ? 'on' : '') + '" data-bet="tri:any" data-label="全骰" data-odds="' + all + '"><b>全骰</b><em>' + fmtOdds(all) + '</em></button>';
      for (var i = 1; i <= 6; i++) {
        grid += '<button type="button" class="k3-cell ' + (isSel('tri:' + i) ? 'on' : '') + '" data-bet="tri:' + i + '" data-label="围骰' + i + '" data-odds="' + exact + '">' + k3Dice(i) + '<em>' + fmtOdds(exact) + '</em></button>';
      }
      body = '<div class="k3-title">全骰、围骰</div><div class="k3-grid">' + grid + '</div>';
    } else if (cat === 'sum') {
      var sums = [];
      for (var s = 3; s <= 18; s++) sums.push('<button type="button" class="k3-sum-cell" disabled><b>' + s + '</b><em>待确认</em></button>');
      body = '<div class="k3-title">点数 <small>赔率待确认</small></div><div class="k3-sum-grid">' + sums.join('') + '</div>' +
        '<div class="k3-side-grid">' + ['大','小','单','双'].map(function (x) { return '<button type="button" class="k3-sum-cell" disabled><b>' + x + '</b><em>待确认</em></button>'; }).join('') + '</div>';
    } else {
      body = '<div class="k3-title">长龙</div><div class="k3-empty"><b>长龙监控</b><span>数据接入中，暂不支持投注</span></div>';
    }
    var chips = [10,20,50,100,200,500,1000].map(function (v, i) {
      var cc = ['#F5A623','#E23A3A','#1FA85C','#1E5FD8','#555555','#1E5FD8','#FFD700'][i] || '#999';
      return '<button type="button" class="race-chip ' + (String(betState.qty) === String(v) ? 'on' : '') + '" data-qty="' + v + '" style="--cc:' + cc + '">' + v + '</button>';
    }).join('');
    var bottom = cat === 'long' ? '<div class="k3-note">长龙为只读监控，不支持下注</div>' :
      '<div class="race-picked">已选：<b data-picked-list>—</b></div><div class="bet-hint" data-bet-hint></div>' +
      '<div class="race-chips">' + chips + '</div>' +
      '<div class="race-amount"><label>金额：</label><input id="betQty" type="text" inputmode="numeric" value="' + esc(betState.qty) + '"><span class="race-unit">积分</span><button type="button" class="race-quick">快捷金额</button><button type="button" class="race-reset" data-race-reset>重置</button><button type="button" class="race-submit" data-bet-submit>下注</button></div>' +
      '<div class="race-foot">一共 <b data-bet-count>0</b> 注，共 <b data-bet-cost>0</b> 积分</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + head +
      '<div class="k3-layout"><div class="k3-cats">' + cats + '</div><div class="k3-main">' + body + '</div></div>' + bottom;
  }

  function betPage(id) {
    if (/^(hk|newmo|newhk)$/.test(id)) syncDailyIssue(id);
    if (betState.game !== id) { betState.game = id; betState.sel = loadSel(id); }
    var def = DEFS[id] || DEFS.newhk;
    if (def.mock && (!FAST[id] || !FAST[id].data || (Date.now() - (FAST[id].lastTry || 0) > 5500))) syncFastIssue(id, true);
    var g = state.games[id] || (def.mock && FAST[id] && FAST[id].data ? shapeFast(id, FAST[id].data) : mockGame(id));
    if (def.mock && !state.games[id]) { state.games[id] = mockGame(id); syncFastIssue(id, true); }
    if (!def.mock && !state.win[id]) syncIssueWindow(id);
    if (def.racing) return betZeroBanner() + winBanner(id) + racingPage(id, def, g);
    if (id === 'newhk' || id === 'newmo' || id === 'hk' || id === 'fast-mark6-1' || id === 'fast-mark6-5') return betZeroBanner() + winBanner(id) + sixSpecialPage(id, def, g);
    if (id === 'fast-k3') return betZeroBanner() + winBanner(id) + k3Page(id, def, g);
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
    var cost = totalNotes();
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
  function closedNoticeKey() {
    var cd = document.querySelector('[data-race-cd]');
    var at = cd ? Number(cd.getAttribute('data-close')) || 0 : 0;
    var g = state.games[betState.game] || {};
    return String(betState.game) + '|' + Math.round(at / 1000) + '|' + noticeHash('closed');
  }
  function closedNoticeDismissed(key) {
    if (state.closedDismissed[key]) return true;
    try { return localStorage.getItem('closedNoticeDismissed:' + key) === '1'; } catch (e) { return false; }
  }
  function updateCountdowns() {
    try {
      var cdEl = document.querySelector('[data-race-cd]');
      if (cdEl) {
        var closeAt = Number(cdEl.getAttribute('data-close')) || 0;
        var left = closeAt ? Math.max(0, Math.round((closeAt - Date.now()) / 1000)) : 0;
        // 封盘窗口：显示遮罩 + 禁用下注（无 closeAt 不进入停售）
        var closed = !!(closeAt && Date.now() >= closeAt);
        if (!closeAt) {
          cdEl.textContent = '——';
        }
        var closedEl = document.querySelector('[data-closed]');
        var gkey = closedNoticeKey();
        var wasClosed = !!state.closedPrev[betState.game];
        state.closedPrev[betState.game] = closed;
        var edgeClosed = closed && !wasClosed;
        if (!closed) state.closedShown[betState.game] = false;
        if (edgeClosed) state.closedShown[betState.game] = true;
        if (closedEl) {
          var wantHidden = !(closed && state.closedShown[betState.game] && !closedNoticeDismissed(gkey));
          if (closedEl.hidden !== wantHidden) closedEl.hidden = wantHidden;
        }
        var subBtn = document.querySelector('[data-bet-submit]');
        if (subBtn) {
          var noPts = (parseInt(points, 10) || 0) <= 0;
          var winOff = winClosed(betState.game);
          subBtn.disabled = closed || noPts || winOff;
          subBtn.textContent = winOff ? '已停售（时段结束）' : (noPts ? '积分不足' : (closed ? '已停止投注' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注')));
        }
        // 到期后每 5s 拉 /issues
        // 期号/号码刷新交给统一 pollTick（避免多定时器）
        if (closeAt) { var hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60; cdEl.textContent = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2); }
      }
      var wEls = document.querySelectorAll('[data-win-cd]');
      if (wEls.length) {
        var ww = state.win[betState.game];
        if (ww && ww.nextOpenAt) {
          var wd = new Date(ww.nextOpenAt), wl = Math.max(0, Math.floor((wd.getTime() - Date.now()) / 1000));
          var wm = Math.floor(wl / 60), wss = wl % 60;
          wEls.forEach(function (el) { el.textContent = ('0' + wm).slice(-2) + ':' + ('0' + wss).slice(-2); });
        }
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
  function refreshDefs() {
    try {
      (window.LH_GAMES || []).forEach(function (g) { if (g && g.id && !DEFS[g.id]) DEFS[g.id] = g; });
    } catch (e) {}
  }
  function render(keepScroll) {
    window.__renderCount = (window.__renderCount || 0) + 1;

    refreshDefs();
    settleBets();
    var r = currentRoute(), view = $('#view'); if (!view) return;
    if (r.name === 'bet') betState.game = r.id;
    document.body.classList.toggle('bet-mode', r.name === 'bet');
    document.body.classList.toggle('race-mode', r.name === 'bet' && !!DEFS[r.id] && !!DEFS[r.id].racing);
    try {
      if (r.name === 'game') view.innerHTML = gamePage(r.id);
      else if (r.name === 'bet') {
        view.innerHTML = betPage(r.id); updateBetBar();
      }
      else if (r.name === 'howto') view.innerHTML = howtoPage(r.anchor);
      else if (r.name === 'login') view.innerHTML = loginPage();
      else if (r.name === 'rank') { view.innerHTML = rankPage(); loadRankLive(); }
      else view.innerHTML = ROUTES[r.name] ? ROUTES[r.name]() : hallPage();
    } catch (err) {
      view.innerHTML = '<div class="data-empty" style="padding:40px 20px">页面渲染失败：' + String((err && err.message) || err) + '</div>';
      try { console.error('[render]', err); } catch (e) {}
    }
    setBottomTab(r.name); markHotIcons(); decorateLogos();
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
  function showToast(msg) {
    var el = $('#toast'); if (!el) return;
    var text = msg || '演示功能，敬请期待';
    var key = 'toastAt:' + noticeHash(text), now = Date.now();
    var prev = 0; try { prev = Number(localStorage.getItem(key)) || 0; } catch (e) {}
    if (now - prev < 30000) return;
    try { localStorage.setItem(key, String(now)); } catch (e) {}
    el.textContent = text; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
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
    var notes = totalNotes(), cost = notes;
    $$('[data-bet-count]').forEach(function (el) { el.textContent = fmtPoints(notes); });
    $$('[data-bet-cost]').forEach(function (el) { el.textContent = fmtPoints(cost); });
    var picks = [];
    Object.keys(betState.sel || {}).forEach(function (k) { picks.push(betState.sel[k] || k); });
    $$('[data-picked-list]').forEach(function (el) { el.textContent = picks.length ? picks.join(' ') : '—'; });
    var input = $('#betQty'); if (input && document.activeElement !== input && String(input.value) !== String(betState.qty)) input.value = betState.qty;
    $$('.amount-chip').forEach(function (b) { b.classList.toggle('on', String(b.getAttribute('data-qty')) === String(betState.qty)); });
    var closed = winClosed(betState.game);
    var insuff = (points <= 0) || (notes > 0 && cost > points);
    var hint = $('[data-bet-hint]'); if (hint) { hint.textContent = closed ? winCloseText(betState.game) : (insuff ? (points <= 0 ? '积分不足，请联系管理员加分后再投注' : '积分不足，无法投注（当前 ' + fmtPoints(points) + '，需要 ' + fmtPoints(cost) + '）') : ''); hint.classList.toggle('show', closed || insuff); }
    var _g = state.games[betState.game]; var noReal = !_g || !_g.server || !_g.last || !_g.last.issue;
    var submit = $('[data-bet-submit]'); if (submit) { submit.disabled = closed || insuff || betSubmitting || noReal; submit.textContent = closed ? '已停售（时段结束）' : (betSubmitting ? '投注中…' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注')); }
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
    var histBlock = e.target.closest('.race-result, .six-result-head');
    if (histBlock && !e.target.closest('.race-history')) {
      var hr = currentRoute(); if (hr && (hr.name === 'bet' || hr.name === 'game') && hr.id) { toggleHistory(hr.id); return; }
    }
    var histToggle = e.target.closest('[data-hist-toggle]');
    if (histToggle) { toggleHistory(histToggle.getAttribute('data-hist-toggle')); return; }
    var histModeBtn = e.target.closest('[data-hist-mode]');
    if (histModeBtn) {
      window.__histMode = histModeBtn.getAttribute('data-hist-mode');
      var box = document.querySelector('.race-history');
      if (box) { var toggle = document.querySelector('[data-hist-toggle]'); box.innerHTML = histInner(toggle ? toggle.getAttribute('data-hist-toggle') : betState.game); }
      return;
    }
    var ht = e.target.closest('[data-home-tab]');
    if (ht) { homeTab = ht.getAttribute('data-home-tab'); render(true); return; }
    var br = e.target.closest('[data-bet-range]');
    if (br) { betFilter = br.getAttribute('data-bet-range'); renderBetsBody(); return; }
    var pm = e.target.closest('[data-picks-more]');
    if (pm) { var pid = pm.getAttribute('data-picks-more'); betExpanded[pid] = !betExpanded[pid]; renderBetsBody(); return; }
    var cc = e.target.closest('[data-cancel]');
    if (cc) { openCancelSheet(cc.getAttribute('data-cancel')); return; }
    if (e.target.closest('[data-cancel-abort]')) { closeCancelSheet(); return; }
    if (e.target.closest('[data-cancel-confirm]')) { doCancel(); return; }
    if (e.target.id === 'cancelSheet') { closeCancelSheet(); return; }
    if (e.target.closest('[data-dismiss-reg]')) { try { sessionStorage.removeItem('xcRegZero'); } catch (x) {} regZeroNotice = false; var bn = document.querySelector('[data-reg-banner]'); if (bn) { dismissNotice(bn.getAttribute('data-notice-id')); bn.classList.add('dismissed'); bn.setAttribute('aria-hidden', 'true'); } return; }
    if (e.target.closest('[data-retry-me]')) { initAuth(); return; }
    var retry = e.target.closest('[data-retry]');
    if (retry) { syncFastIssue(retry.getAttribute('data-retry'), true); return; }
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
    if (e.target.closest('[data-race-next]')) {
        var cl = document.querySelector('[data-closed]'); if (cl) cl.hidden = true;
        var ck = closedNoticeKey(); state.closedDismissed[ck] = true;
        try { localStorage.setItem('closedNoticeDismissed:' + ck, '1'); } catch (x) {}
        syncFastIssue(betState.game, true); return;
      }
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
    var zt = e.target.closest('[data-six-zodiac]');
    if (zt) { var zz = zt.getAttribute('data-six-zodiac'); betState.sixZodiac = (betState.sixZodiac === zz ? '' : zz); render(true); return; }
    var sc = e.target.closest('[data-six-cat]');
    if (sc) { betState.sixCat = sc.getAttribute('data-six-cat'); render(true); return; }
    var kc = e.target.closest('[data-k3-cat]');
    if (kc) { betState.k3Cat = kc.getAttribute('data-k3-cat'); render(true); return; }
    if (e.target.closest('[data-dragon-n]') || (e.target.tagName === 'SELECT' && e.target.hasAttribute('data-dragon-n'))) {
      betState.dragonN = parseInt(e.target.value, 10) || 4; render(true); return;
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
      var notes = nodes.length * qty, cost = notes;
      var g = state.games[betState.game] || mockGame(betState.game);
      if (!g) { showToast('彩种数据未就绪'); return; }

      var selections = nodes.map(function (el) { var key = el.getAttribute('data-bet'); return { key:key, label:el.getAttribute('data-label') || key, odds:parseFloat(el.getAttribute('data-odds')) || 0, zodiacs:el.getAttribute('data-zodiacs') || '' }; });
      betSubmitting = true; updateBetBar();
      (async function () {
        try {
          await refreshPoints();
          if (points <= 0 || cost > points) {
            betSubmitting = false; updateBetBar();
            var zh = document.querySelector('[data-bet-hint]');
            if (zh) { zh.textContent = points <= 0 ? '积分不足，请联系管理员加分后再投注' : '积分不足，无法投注（当前 ' + fmtPoints(points) + '，需要 ' + fmtPoints(cost) + '），请联系管理员加分'; zh.classList.add('show'); }
            return;
          }
          // 只传号码（Function 结算按开奖号码匹配）；生肖/两面等取 label 文本
          var pickIds = selections.map(function (s) {
            var key = String(s.key || '');
            if (/^r\d{1,2}:\d{2}$/.test(key)) return key;              // 赛车名次：r3:07
            if (/^sum:(big|small|odd|even)$/.test(key)) return key;      // 冠亚和：sum:big
            if (/^sum:\d{1,2}$/.test(key)) return key;                    // 和值：sum:11
            if (/^combo:\d{1,2}_\d{1,2}$/.test(key)) return key;          // 冠亚组合：combo:1_2
            if (/^r\d{1,2}:(bs|oe):(big|small|odd|even)$/.test(key)) return key; // 名次大小/单双
            if (/^color:(red|blue|green)$/.test(key)) return key;
            if (/^regular:\d{2}$/.test(key)) return key;
            if (/^zhengte:\d{2}$/.test(key)) return key;
            if (/^tail:[0-9]$/.test(key)) return key;
            if (/^tri:(any|[1-6])$/.test(key)) return key;
            if (/^zodiac:[\u4e00-\u9fa5]$/.test(key)) return key;
            if (/^flat:[\u4e00-\u9fa5]$/.test(key)) return key;
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
          try { refreshPointsAndBets(); } catch (e) {}
          try { refreshPointsAndBets(); } catch (e) {}
          var bet = (res && res.bet) || {};
          bets.unshift({ id: bet.id || bet.$id || idem, game: betState.game, targetIssue: bet.issue || g.nextIssue, placedIssue: g.last.issue, qty: qty, cost: cost, notes: notes, selections: selections, labels: selections.map(function (s) { return s.label; }).join('、'), status: bet.status || 'pending', payout: Number(bet.payout) || 0, created: Date.now() });
          betState.sel = {}; betState.qty = '1'; betSubmitting = false; updateBetBar(); render(true);
          showModal('投注已记录，账户积分已扣减 ' + fmtPoints(cost) + ' 分。演示站点 · 不构成任何投注建议。');
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCancelSheet(); } });
  window.addEventListener('hashchange', function () { closeCancelSheet(); render(); });
  if (!location.hash) { try { history.replaceState(null, '', '#/lotteryhall'); } catch (e) { location.hash = '#/lotteryhall'; } }
  applyTheme();
  (async function () {
    try { if (typeof ensureAppwrite === 'function') await ensureAppwrite(8000); } catch (e) {}
    render(); loadData(true, true); initAuth();
  })();
  // 首屏只渲染一次；后续数据只做局部更新
  var bootWatchdog = setInterval(function () {
    try {
      refreshDefs();
      var br = currentRoute();
      if ((br.name === 'bet' || br.name === 'game') && document.querySelectorAll('[data-audit]').length === 0 && document.querySelector('[data-loading]')) render(true);
    } catch (e) {}
    if (window.__bootWatchdogTicks = (window.__bootWatchdogTicks || 0) + 1, window.__bootWatchdogTicks > 30) clearInterval(bootWatchdog);
  }, 400);
  function refreshPointsAndBets() {
    if (!awUser) return;
    try { refreshPoints(); } catch (e) {}
    try { loadUserBets().then(function (nb) { if (JSON.stringify(nb) !== JSON.stringify(bets)) { bets = nb; updateBetsOnly(); } }); } catch (e) {}
  }
  var pollTimer = null, pollTicks = 0;
  function pollTick() {
    if (document.hidden) return;
    refreshPointsAndBets();
    pollTicks++;
    try {
      var r = currentRoute();
      if ((r.name === 'bet' || r.name === 'game') && DEFS[r.id] && DEFS[r.id].mock) syncFastIssue(r.id, true);
      if (pollTicks % 4 === 0) loadData(true, true);
    } catch (e) {}
  }
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  pollTimer = setInterval(pollTick, 8000);
  window.__pollTimerCount = 1;
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { pollTick(); } catch (e) {} } });
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
