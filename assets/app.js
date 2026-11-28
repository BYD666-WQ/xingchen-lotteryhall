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
    { id:'fast-luckyrace', name:'幸运赛车', provider:'快开', enabled:true, mock:true, period:'3分钟', periodSec:180, icon:'运', color:'#e6a62f', drawKey:'mock', racing:true },
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
    { t: '玩法说明', icon: 'rules', i: '规', c: '#58b5a6', href: '#/rules' },
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
  // 与主站一致的 mdCompat：兼容 current/history 新结构 + 顶层 issue/nums 旧结构
  function parseManual(manual, now) {
    if (!manual) return null;
    var nowMs = now || Date.now();
    function pubOk(x) {
      if (!x) return false;
      var vis = x.visibleFrom ? Date.parse(x.visibleFrom) : 0;
      var pub = x.publishedAt ? Date.parse(x.publishedAt) : 0;
      return !!(pub || !vis || vis <= nowMs);
    }
    var hist = (manual.history || []).map(function (h) {
      var n = normNums(h && h.nums);
      return n.length === 7 ? { issue: issueNo(h.issue), nums: n, raw: h } : null;
    }).filter(function (h) { return h && h.issue && pubOk(h.raw); }).sort(function (a, b) { return b.issue - a.issue; });
    hist = hist.map(function (h) { return { issue: h.issue, nums: h.nums }; });
    var cur = manual.current || {}, curNums = normNums(cur.nums);
    if (curNums.length < 7 && cur.numsEnc && pubOk(cur)) { var d = vfDec(cur.numsEnc); if (d) curNums = normNums(d); }
    var last = null, nextIssue = null;
    if (curNums.length === 7 && pubOk(cur)) {
      last = { issue: issueNo(cur.issue), nums: curNums }; nextIssue = last.issue + 1;
      hist = [{ issue: last.issue, nums: last.nums }].concat(hist.filter(function (h) { return h.issue !== last.issue; }));
    } else {
      last = hist[0] || null;
      nextIssue = cur.issue ? issueNo(cur.issue) : (last ? last.issue + 1 : null);
    }
    // 旧结构兜底：顶层 {issue, nums}
    if (!last && manual.issue != null && manual.nums) {
      var on = normNums(manual.nums);
      if (on.length === 7) { last = { issue: issueNo(manual.issue), nums: on }; nextIssue = last.issue + 1; hist = [{ issue: last.issue, nums: on }].concat(hist); }
    }
    var seen = {};
    hist = hist.filter(function (h) { if (seen[h.issue]) return false; seen[h.issue] = 1; return true; }).slice(0, 20);
    var pending = !(curNums.length === 7 && pubOk(cur));
    return { last: last, nextIssue: nextIssue, history: hist, pending: pending };
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
      else {
        var cr = currentRoute();
        if ((cr.name === 'bet' || cr.name === 'game') && cr.id && DEFS[cr.id] && !DEFS[cr.id].mock) render(true);
      }
    }).catch(function (e) {
      state.error = String(e && e.message || e); if (!soft && !state.games.newhk && !state.games.newmo && !state.games.hk) render(true); if (!silent) showToast('刷新失败，稍后重试');
    }).then(function () { state.loading = false; setRefreshBusy(false); });
  }
  function setRefreshBusy(on) { var b = $('#refreshDataBtn'); if (!b) return; b.classList.toggle('busy', on); b.disabled = on; b.setAttribute('aria-busy', on ? 'true' : 'false'); }
  var BOOT = { data: null, ts: 0, loading: false, stale: false };
  function bootSkeleton() {
    var cards = '';
    for (var i = 0; i < 10; i++) cards += '<div class="bsk-card"><i></i><b></b><em></em></div>';
    return '<div class="boot-skel"><div class="bsk-line w40"></div><div class="bsk-hero"></div><div class="bsk-grid">' + cards + '</div></div>';
  }
  function bootToBalls(arr) {
    return (arr || []).map(function (x) {
      var v = (x && typeof x === 'object') ? (x.c != null ? x.c : x.num) : x;
      var c = pad(v);
      return { c: c, z: (x && x.z) || zodiacOfNumber(c) || '', color: (x && x.color) || colorOf(c) };
    }).filter(function (b) { return b.c && b.c !== 'NaN'; });
  }
  function applyBootstrap(j, stale) {
    var data = j && j.data ? j.data : (j || {});
    BOOT.data = data; BOOT.ts = data.ts ? Date.parse(data.ts) || Date.now() : Date.now(); BOOT.stale = !!stale;
    var games = Array.isArray(data.games) ? data.games : [];
    games.forEach(function (item) {
      if (!item || !item.id || !DEFS[item.id]) return;
      var id = item.id, cur = item.current || item.next || {}, results = (item.results || []).slice();
      results.sort(function (a, b) { return Number(b.issue) - Number(a.issue); });
      var lastRow = results[0] || null;
      var d = { issue: cur.issue, closeAt: cur.closeAt, periodSec: item.intervalSec || 0, lastResult: lastRow ? { issue: lastRow.issue, nums: lastRow.nums } : null };
      var g = shapeFast(id, d);
      g.intervalSec = Number(item.intervalSec) || 0;
      g.nextIssue = cur.issue || g.nextIssue;
      g.nextIssueLabel = cur.issue ? String(cur.issue) : g.nextIssueLabel;
      g.mockNext = cur.closeAt ? Date.parse(cur.closeAt) : 0;
      if (lastRow) { g.last.issue = lastRow.issue; g.last.nums = bootToBalls(lastRow.nums); }
      g.history = results.map(function (r) { return { issue: r.issue, nums: bootToBalls(r.nums) }; });
      state.games[id] = g;
      FAST[id] = { data: d, syncedAt: BOOT.ts, lastTry: BOOT.ts, degraded: false };
      state.win[id] = { open: true, startAt: cur.openAt || null, endAt: cur.closeAt || null, nextOpenAt: (item.next && item.next.openAt) || null, issue: cur.issue, degraded: false };
    });
    var daily = data.daily || {};
    ['newhk', 'newmo', 'hk'].forEach(function (id) {
      var x = daily[id]; if (!x || !DEFS[id]) return;
      var lastD = x.last || null, nextD = x.next || null;
      var nums = normNums((lastD && lastD.nums) || x.nums || []);
      if (nums.length < 7) return;
      var status = String(x.status || '').toLowerCase();
      var drawn = status === 'published' || status === 'drawn';
      var rawIssue = issueNo(lastD && lastD.issue != null ? lastD.issue : x.issue);
      if (rawIssue == null) return;
      var lastIssue = lastD ? rawIssue : (drawn ? rawIssue : rawIssue - 1);
      var nextIssue = issueNo(nextD && nextD.issue != null ? nextD.issue : x.nextIssue) || (lastD ? lastIssue + 1 : (drawn ? rawIssue + 1 : rawIssue));
      var g = state.games[id] || {};
      g.last = { issue: lastIssue, issueLabel: String(lastIssue), nums: bootToBalls(nums) };
      g.nextIssue = nextIssue;
      g.nextIssueLabel = String(nextIssue);
      g.history = [{ issue: lastIssue, nums: bootToBalls(nums) }];
      g.pending = false;
      g.timeCfg = timeCfg(state.config, id);
      var nextMs = Date.parse((nextD && nextD.visibleFrom) || (lastD ? x.nextVisibleFrom : (drawn ? x.nextVisibleFrom : x.visibleFrom)) || '') || 0;
      g.mockNext = nextMs > Date.now() ? nextMs : 0;
      g.server = true;
      state.games[id] = g;
    });
    if (data.odds) {
      try { Object.assign(ODDS, data.odds); } catch (e) {}
      if (data.odds.byPlay) { window.LH_ODDS_BY_PLAY = data.odds.byPlay; }
    }
    if (!stale) { try { sessionStorage.setItem('lh-bootstrap-v1', JSON.stringify({ ts: BOOT.ts, data: data })); } catch (e) {} }
    try { render(true); } catch (e) {}
    if (stale) { try { showToast('网络异常，显示 ' + new Date(BOOT.ts).toLocaleTimeString('zh-CN', { hour12: false }) + ' 的缓存数据'); } catch (e) {} }
  }
  function loadBootstrap(force) {
    if (BOOT.loading) return;
    if (BOOT.data && !force) return;
    if (!window.LHAuth) { BOOT.loading = false; return; }
    BOOT.loading = true;
    var attempt = function (n) {
      fetch(window.LHAuth.base + '/api/bootstrap', { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('BOOTSTRAP_' + r.status);
        return r.json();
      }).then(function (j) {
        if (!j || j.ok === false) throw new Error('BOOTSTRAP_BAD');
        BOOT.loading = false; applyBootstrap(j, false);
      }).catch(function (e) {
        if (n < 2) { setTimeout(function () { attempt(n + 1); }, n === 0 ? 1000 : 3000); return; }
        BOOT.loading = false;
        var cached = null; try { cached = JSON.parse(sessionStorage.getItem('lh-bootstrap-v1') || 'null'); } catch (x) {}
        if (cached && cached.data) { applyBootstrap(cached, true); }
        else { try { render(true); } catch (x) {} }
        try { console.warn('[bootstrap] failed:', e && e.message); } catch (x) {}
      });
    };
    attempt(0);
  }
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
    if (!currentUser()) return '<div class="reg-zero-banner">请先登录后投注 · <a href="#/login">去登录</a></div>';
    if (Number(points) <= 0) {
      var txt = (regZeroNotice || seen) ? '账号已创建，当前余额 0，暂无法投注' : '余额不足，暂无法投注';
      var nid = noticeHash('reg:' + txt), off = noticeIsDismissed(nid);
      return '<div class="reg-zero-banner' + (off ? ' dismissed' : '') + '" data-reg-banner data-notice-id="' + nid + '"' + (off ? ' aria-hidden="true"' : '') + '>' + txt + '<button type="button" data-dismiss-reg>知道了</button></div>';
    }
    return '';
  }
  function betZeroBanner() {
    if (!currentUser()) return '<div class="reg-zero-banner bet-zero">未登录 · 可浏览赔率，<a href="#/login">登录后投注</a></div>';
    if (Number(points) > 0) return '';
    return '<div class="reg-zero-banner bet-zero">余额不足，暂无法投注</div>';
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
  // 只有 ISSUE_INTERVALS 里的快开彩种才请求新后端；每日彩种仍用 GitHub 数据 + 本地倒计时。
  function isFastIssueGame(id) { return /^fast-/.test(String(id || '')); }
  function syncIssueWindow(id) {
    if (!isFastIssueGame(id) || !window.LHAuth) return Promise.resolve();
    return window.LHAuth.issue(id).then(function (d) {
      var cur = d && d.issues && d.issues[0];
      if (!cur) return;
      var next = (d.issues && d.issues[1]) || {};
      var w = { open: cur.status !== 'closed', startAt: cur.openAt || null, endAt: cur.closeAt || null, nextOpenAt: next.openAt || null, issue: cur.issue };
      state.win[id] = w;
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
      var sixCd = root.querySelector('[data-cd]');
      if (sixCd && g.mockNext) sixCd.textContent = countdownText(g);
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
        g.last.issue = lr.issue || d.drawableIssue;
        g.last.issueLabel = String(lr.issueLabel || lr.label || lr.issue || d.drawableIssue || '').replace(/\s*期\s*$/, '');
        g.last.nums = (lr.nums || []).map(function (x) { return (typeof x === 'object') ? x : { c: String(x), z: zodiacOfNumber(x) }; });
        g.nextIssue = d.issue;
        g.nextIssueLabel = String(d.issueLabel || d.nextIssueLabel || '').replace(/\s*期\s*$/, '');
        g.mockNext = d.closeAt ? Date.parse(d.closeAt) : 0;
        if (!g.last.nums.length) {
          window.LotteryAPI.call('/history/' + encodeURIComponent(id) + '?limit=2&t=' + Date.now(), { method: 'GET' }).then(function (h) {
            var it = (h && h.items || [])[0];
            if (it && currentRoute().id === id) {
              g.last.issue = it.issue; g.last.issueLabel = String(it.issueLabel || it.issue);
              g.last.nums = (it.nums || []).map(function (x) { return { c: String(x), z: zodiacOfNumber(x) }; });
              if (!DAILY_SYNC.rendered) { DAILY_SYNC.rendered = 1; try { render(true); } catch (e) {} }
              else updateFastHeader(id);
            }
          }).catch(function () {});
        }
        g.server = true;
        if (currentRoute().id === id) {
          if (!DAILY_SYNC.rendered) { DAILY_SYNC.rendered = 1; try { render(true); } catch (e) {} }
          else updateFastHeader(id);
        }
      }).catch(function () {
        DAILY_SYNC[id] = 0;
        if ((DAILY_SYNC.tries = (DAILY_SYNC.tries || 0) + 1) <= 30) setTimeout(function () { DAILY_SYNC.rendered = 0; syncDailyIssue(id); }, 2000);
      });
    } catch (e) { DAILY_SYNC[id] = 0; }
  }
  function syncFastIssue(id, soft, force, silent) {
    var def = DEFS[id];
    if (!def || !(def.mock || def.racing || /^fast-/.test(id))) return Promise.resolve();
    FAST[id] = FAST[id] || {};
    if (FAST[id].inFlight) return Promise.resolve();
    FAST[id].inFlight = true;
    if (SSE.es && !force && state.games[id]) { FAST[id].inFlight = false; return Promise.resolve(); } // SSE 连接中由事件驱动
    if (soft && !force && FAST[id].syncedAt && Date.now() - FAST[id].syncedAt < 9000) return Promise.resolve();
    FAST[id].lastTry = Date.now();
    if (!window.LHAuth) return Promise.resolve();
    return Promise.all([window.LHAuth.issue(id), window.LHAuth.results(id, 12)]).then(function (arr) {
      var d0 = arr[0], rs = arr[1];
      var cur = d0 && d0.issues && d0.issues[0], nxt = d0 && d0.issues && d0.issues[1];
      if (!cur || !cur.issue) throw new Error('NO_ISSUE');
      var rows = (rs && rs.results) || [];
      var lastRow = rows[0] || null;
      var d = { issue: cur.issue, closeAt: cur.closeAt, periodSec: d0.intervalSec || 0, lastResult: lastRow ? { issue: lastRow.issue, nums: lastRow.nums } : null };
      var g = shapeFast(id, d);
      g.intervalSec = Number(d0.intervalSec) || 0;
      function toBalls(arr) { return (arr || []).map(function (x) { var c = pad(x); return { c: c, z: zodiacOfNumber(c) || '', color: colorOf(c) }; }); }
      if (lastRow) { g.last.nums = toBalls(lastRow.nums); g.last.issue = lastRow.issue; }
      if (rows.length) g.history = rows.map(function (r) { return { issue: r.issue, nums: toBalls(r.nums) }; });
      FAST[id].data = d;
      state.games[id] = g;
      state.win[id] = { open: cur.status !== 'closed', startAt: cur.openAt || null, endAt: cur.closeAt || null, nextOpenAt: (nxt && nxt.openAt) || null, issue: cur.issue, degraded: false };
      FAST[id].degraded = false;
      FAST[id].syncedAt = Date.now();
      try { localStorage.removeItem('xc-race-hist-' + id); } catch (e) {}
      FAST[id].inFlight = false;
      var cr0 = currentRoute();
      if ((cr0.name === 'bet' || cr0.name === 'game') && cr0.id === id) {
        try {
          var hasHead = !!document.querySelector('[data-audit="head-wrap"]');
          if (soft && id !== 'fast-k3' && hasHead) updateFastHeader(id); else render(true);
        } catch (e1) {}
      }
      if (!silent) {
        try { loadUserBets().then(function (b) { if (JSON.stringify(b) !== JSON.stringify(bets)) { bets = b; updateBetsOnly(); } }); } catch (e2) {}
      }
    }).catch(function (e) {
      FAST[id].inFlight = false;
      FAST[id].failed = true;
      FAST[id].failedAt = Date.now();
      try { window.__fastErr = id + ': ' + ((e && e.stack) || e); } catch (x0) {}
      try { delete state.games[id]; } catch (x1) {}
      state.win[id] = Object.assign({}, state.win[id] || {}, { degraded: true });
      if (!FAST[id].degradedToast) { FAST[id].degradedToast = 1; try { showToast('实时数据获取失败，已回退本地模拟'); } catch (x) {} }
      var cr = currentRoute();
      if (!soft && cr.name === 'bet' && cr.id === id) { try { render(true); } catch (e2) {} }
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
    if (def.mock) return '<a class="game-cell" href="#/bet/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(intervalLabel(id)) + '/期</span></a>';
    var g = state.games[id];
    if (!g) return '<div class="game-cell skeleton"><span class="sk sk-badge"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(intervalLabel(id) || '每日') + ' · 第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
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
    var def = DEFS[id]; if (!def) return hallPage();
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="detail-head"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span></span><div><div class="page-kicker">' + esc(def.name) + ' · 占位</div><h1 class="page-title">' + esc(def.name) + '</h1><div class="page-sub">' + esc(def.provider || '演示占位') + '</div></div></div><div class="detail-last card">' + emptyState(def.note || '数据待接入，敬请期待') + '</div>';
    var g = state.games[id];
    if (!g || !g.last) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="data-empty" style="padding:40px 20px">数据待同步</div>';
    var zeroTip = betZeroBanner();
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + esc(String(h.issue)) + ' 期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return zeroTip + '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<div class="detail-actions"><a class="action-btn action-primary" href="#/bet/' + id + '">立即投注</a><a class="action-btn action-ghost" href="#/rules">玩法说明</a></div>' +
      '<section class="detail-last"><div class="detail-label">上期开奖 <span>第 ' + shortIssue(last.issue) + ' 期</span></div><div class="detail-balls">' + balls(last.nums) + '</div><div class="wave-legend"><span><i class="r"></i>红波</span><span><i class="b"></i>蓝波</span><span><i class="g"></i>绿波</span><span class="special-legend">+ 后为特码</span></div></section>' +
      '<section class="next-card"><div><span>下期开奖</span><b>第 ' + shortIssue(g.nextIssue) + ' 期</b><em>' + (intervalLabel(id) || (g.timeCfg && g.timeCfg.time) || '实时') + (id === 'hk' ? ' · 周日' : ' · 每日') + '</em></div><strong data-cd="' + id + '">' + countdownText(g) + '</strong></section>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">波色 / 生肖统计</h2><span class="section-link">近 10 期</span></div><div class="trend-panel">' + gameStats(g) + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">近 10 期开奖</h2><a class="section-link" href="#/history">全部记录 ›</a></div><div class="detail-history">' + rows + '</div></div>' +
      '<div class="mini-note">数据来自主站只读接口；号码、特码与开奖时间以主站为准。</div>';
  }
  function historyPage() {
    var chips = ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('');
    var g = state.games[historyGame];
    var rows = state.histApi[historyGame] && state.histApi[historyGame].length ? histTableRows(historyGame, state.histApi[historyGame]) : (g && g.history || []).slice(0, 20).map(function (h) { return '<tr><td class="iss">' + esc(String(h.issue)) + ' 期</td><td>' + DEFS[historyGame].name + '</td><td>' + balls(h.nums, true) + '</td><td><span class="status">● 已开奖</span></td></tr>'; }).join('');
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
      '<div class="mini-note">真实统计：结算单数 / 胜场 / 命中率 / 盈亏。</div>';
  }
  function loadRankLive() {
    var box = document.getElementById('rank-live'); if (!box) return;
    box.innerHTML = '<div class="data-empty" style="padding:30px 16px">加载中…</div>';
    if (!window.LHAuth) { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无数据</div>'; return; }
    window.LHAuth.leaderboard(20).then(function (res) {
      var rows = (res && res.leaderboard) || [];
      if (!rows.length) { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无数据</div>'; return; }
      box.innerHTML = rows.slice(0, 20).map(function (r, i) {
        var rawName = String(r.username || (r.user && r.user.username) || r.email || '玩家');
        var name = esc(rawName);
        var settled = Number(r.settled) || 0, wins = Number(r.wins) || 0, net = Number(r.net) || 0;
        var rateTxt = settled ? (Math.round(wins / settled * 1000) / 10).toFixed(1) + '%' : '—';
        var netTxt = (net > 0 ? '+' : '') + fmtPoints(net);
        return '<div class="rank-row"><span class="rank-no">' + (i + 1) + '</span>' + avatarHtml({ username: rawName, avatar: r.avatar || r.avatar_url }) + '<div class="rank-info"><b>' + name + '</b><span>结算 ' + settled + ' · 胜 ' + wins + '</span></div><div class="rank-val"><b>' + rateTxt + '</b><span>盈亏 ' + netTxt + '</span></div></div>';
      }).join('');
    }).catch(function () { box.innerHTML = '<div class="data-empty" style="padding:30px 16px">暂无数据</div>'; });
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
      '<section class="profile"><div class="profile-avatar"><button type="button" class="avatar-btn" data-avatar-pick aria-label="设置头像">' + avatarHtml(u || { username: '游客' }, 'lg') + '<i class="avatar-edit">✎</i></button><input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" hidden></div><div class="profile-main"><b>' + esc(name) + '</b><span>' + esc(intro) + '</span><span class="tag">DEMO ACCOUNT</span></div>' + (u ? '<button class="btn btn-ghost" type="button" data-logout>退出</button>' : '<a class="btn btn-primary" href="#/login">登录</a>') + '</section>' +
      '<div class="avatar-set"><button type="button" class="btn btn-ghost" data-avatar-pick>设置头像</button><span>JPG / PNG / WebP · 自动压到 300KB 内</span></div><div id="avatarMsg" class="avatar-msg"></div>' +
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
  // Phase 1（2026-11-28）：账号切到新后端（198.13.51.135.sslip.io），不再使用 Appwrite。
  var BETS_READY = true;  // /api/bets 已上线（2026-11-28）
  var CANCEL_READY = true; // 撤单接口已上线（2026-11-28 14:15）
  var RANK_READY = false;   // 排行榜仍走旧 Function，暂不可用
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
  function currentUser() { return awUser && awRow ? { username:awRow.username || awUser.name || awUser.email || '', id:awUser.$id, email:awUser.email || '', avatar:awUser.avatar || '' } : null; }
  function saveAccounts() {}
  function avatarSrc(a) {
    var s = String(a || ''); if (!s) return '';
    if (/^(https?:|data:|blob:)/i.test(s)) return s;
    var b = (window.LHAuth && window.LHAuth.base) || '';
    return b + (s.charAt(0) === '/' ? s : '/' + s);
  }
  function avatarHtml(u, cls) {
    var name = String((u && (u.username || u.name)) || '');
    var src = avatarSrc(u && (u.avatar || u.avatar_url));
    if (src) return '<span class="avatar ' + (cls || '') + ' has-img"><img src="' + esc(src) + '" alt=""></span>';
    return '<span class="avatar ' + (cls || '') + '">' + esc((name || '玩').slice(0, 1).toUpperCase()) + '</span>';
  }
  function avatarMsg(text, bad) {
    var el = document.getElementById('avatarMsg');
    if (el) { el.textContent = text || ''; el.className = 'avatar-msg' + (bad ? ' bad' : ''); }
    else if (text) { try { showToast(text); } catch (e) {} }
  }
  function loadImageFile(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('IMAGE')); };
      img.src = url;
    });
  }
  function canvasBlob(canvas, q) { return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', q); }); }
  async function compressAvatar(file) {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) { var e1 = new Error('FORMAT'); e1.code = 'FORMAT'; throw e1; }
    if (file.size > 8 * 1024 * 1024) { var e2 = new Error('TOO_BIG'); e2.code = 'TOO_BIG'; throw e2; }
    var img = await loadImageFile(file), max = 512;
    for (var attempt = 0; attempt < 5; attempt++) {
      var scale = Math.min(1, max / Math.max(img.width, img.height));
      var w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
      for (var q = 0.9; q >= 0.5; q -= 0.1) {
        var blob = await canvasBlob(c, q);
        if (blob && blob.size <= 300 * 1024) { blob.__dataUrl = c.toDataURL('image/jpeg', q); return blob; }
      }
      max = Math.floor(max * 0.75);
    }
    var e3 = new Error('TOO_BIG'); e3.code = 'TOO_BIG'; throw e3;
  }
  async function uploadAvatar(file) {
    var u = currentUser();
    if (!u) { avatarMsg('请先登录后再设置头像', true); return; }
    avatarMsg('正在压缩并上传…');
    try {
      var blob = await compressAvatar(file);
      var fd = new FormData(); fd.append('avatar', blob, 'avatar.jpg');
      var token = localStorage.getItem('lh-auth-token-v1');
      var res = await fetch(window.LHAuth.base + '/api/me/avatar', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd });
      var data = {}; try { data = await res.json(); } catch (e0) {}
      if (!res.ok) { var err = new Error('HTTP'); err.status = res.status; err.code = String(data && data.error || ''); throw err; }
      var url = (data && (data.avatar || data.url)) || (data && data.user && (data.user.avatar || data.user.avatar_url)) || '';
      if (!url) { var e4 = new Error('NO_URL'); e4.code = 'NO_URL'; throw e4; }
      awUser.avatar = url;
      updateUserChip(); avatarMsg(''); render(true);
      try { showToast('头像已更新'); } catch (e5) {}
    } catch (e) {
      var map = { FORMAT: '仅支持 JPG / PNG / WebP 图片', TOO_BIG: '图片压缩后仍超过 300KB，请换一张', NO_URL: '上传失败（服务端未返回头像地址）' };
      var msg = map[e.code] || (e.status === 401 ? '登录已过期，请重新登录' : (e.status === 413 ? '图片太大，请换一张' : (e.status === 415 ? '图片格式不支持' : '上传失败，请稍后重试')));
      avatarMsg(msg, true);
    }
  }
  function updateUserChip() {
    var b = $('#userChip'); if (!b) return;
    var u = currentUser();
    if (u) {
      b.innerHTML = '<b class="uc-bal">' + esc(fmtPoints(points)) + '</b><i class="uc-sep">·</i><span class="uc-mail">' + esc(u.username) + '</span>';
      b.title = u.username + ' · 余额 ' + fmtPoints(points);
    } else { b.textContent = '登录/注册'; b.title = ''; }
    b.setAttribute('data-auth', u ? 'user' : 'login');
  }
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
    if (!awUser || !window.LHAuth) return [];
    var res = await window.LHAuth.bets();
    var rows = (res && res.bets) || [];
    return rows.map(function (r) {
      var picks = Array.isArray(r.picks) ? r.picks : [];
      var amount = Number(r.amount) || 0;
      var t = r.created_at ? Date.parse(r.created_at) : Date.now();
      if (!isFinite(t)) t = Date.now();
      var prev = bets.filter(function (x) { return String(x.id) === String(r.id); })[0];
      var cat = r.cancelled_at || (prev && prev.cancelledAt) || null;
      var hasPay = r.payout != null && r.payout !== '';
      var pay = hasPay ? Number(r.payout) : null;
      var settled = r.status === 'settled' || r.status === 'win';
      return { id: r.id, game: r.game, targetIssue: r.issue, placedIssue: r.issue, qty: 1, cost: amount, notes: 0, selections: picks, picksText: '', labels: '', status: r.status || 'pending', payout: (hasPay && isFinite(pay)) ? pay : null, profit: (settled && hasPay && isFinite(pay)) ? pay - amount : null, created: t, settledAt: r.settled_at || null, cancelledAt: cat };
    });
  }
  async function loadGameConfigs() {
    /* Phase 1：新后端暂未提供 /games 赔率接口；赔率沿用 config/games.js 静态表。
       恢复后在此接 GET /api/games（返回 oddsByPlay 时再覆盖 ODDS/SIX_ODDS）。 */
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
  function stopRealtime() {
    if (rtHeartbeat) { clearInterval(rtHeartbeat); rtHeartbeat = null; }
    if (rtRetryTimer) { clearTimeout(rtRetryTimer); rtRetryTimer = null; }
    if (rtConnTimer) { clearTimeout(rtConnTimer); rtConnTimer = null; }
    if (rtProbeTimer) { clearTimeout(rtProbeTimer); rtProbeTimer = null; }
    rtLive = false;
  }
  // Phase 1：新后端暂无实时推送，状态固定为「关」；余额靠 /api/me 与轮询刷新。
  // 实时：EventSource（SSE）优先；连不上自动降级为 15s 轮询 /api/issues
  var SSE = { es: null, game: '', fallback: null, degraded: false, errs: 0, degradedShown: false };
  function sseStop() {
    if (SSE.es) { try { SSE.es.close(); } catch (e) {} SSE.es = null; }
    if (SSE.fallback) { clearInterval(SSE.fallback); SSE.fallback = null; }
    SSE.game = ''; SSE.errs = 0; SSE.degraded = false;
  }
  function sseConnect(game) {
    if (!game || !window.EventSource || !window.LHAuth || !/^fast-/.test(game)) { sseStop(); updateRTStatus('关'); return; }
    if (SSE.es && SSE.game === game) return;
    sseStop(); SSE.game = game;
    try { SSE.es = new EventSource(window.LHAuth.base + '/api/stream?game=' + encodeURIComponent(game)); }
    catch (e) { sseFallback(game); return; }
    SSE.es.addEventListener('issue', function (ev) {
      var d = null; try { d = JSON.parse(ev.data); } catch (e) {}
      if (!d || !d.current) return;
      applyStreamIssue(game, d);
      SSE.errs = 0; SSE.degraded = false;
      updateRTStatus('SSE');
    });
    ['result', 'results'].forEach(function (name) {
      SSE.es.addEventListener(name, function (ev) {
        var d = null; try { d = JSON.parse(ev.data); } catch (e) {}
        if (!d) return;
        var g = state.games[game]; if (!g) return;
        var row = d.result || d;
        if (row && row.issue && row.nums) {
          g.last = { issue: row.issue, nums: bootToBalls(row.nums) };
          g.history = [{ issue: row.issue, nums: bootToBalls(row.nums) }].concat((g.history || []).filter(function (h) { return String(h.issue) !== String(row.issue); })).slice(0, 12);
        }
        var cr = currentRoute();
        if ((cr.name === 'bet' || cr.name === 'game') && cr.id === game) { try { render(true); } catch (e) {} }
      });
    });
    SSE.es.addEventListener('odds', function (ev) {
      var d = null; try { d = JSON.parse(ev.data); } catch (e) {}
      if (!d) return;
      var o = d.odds || d.config || d;
      try { Object.assign(ODDS, o); } catch (e) {}
      if (o && o.byPlay) window.LH_ODDS_BY_PLAY = o.byPlay;
      var cr = currentRoute();
      if (cr.name === 'bet' || cr.name === 'game') { try { render(true); } catch (e) {} }
    });
    SSE.es.onerror = function () {
      SSE.errs++;
      if (SSE.errs >= 2 || (SSE.es && SSE.es.readyState === 2)) {
        try { if (SSE.es) SSE.es.close(); } catch (e) {}
        SSE.es = null;
        sseFallback(game);
      }
    };
  }
  function applyStreamIssue(game, d) {
    var cur = d.current || {}, nxt = d.next || {};
    var g = state.games[game];
    var changed = !g || String(g.nextIssue) !== String(cur.issue);
    if (g) { g.nextIssue = cur.issue || g.nextIssue; g.mockNext = cur.closeAt ? Date.parse(cur.closeAt) : g.mockNext; }
    state.win[game] = { open: true, endAt: cur.closeAt || null, nextOpenAt: nxt.openAt || null, issue: cur.issue, degraded: false };
    var cr = currentRoute();
    if (changed && (cr.name === 'bet' || cr.name === 'game') && cr.id === game) { try { render(true); } catch (e) {} }
  }
  function sseFallback(game) {
    if (!game) return;
    SSE.degraded = true;
    updateRTStatus('降级', true);
    if (!SSE.degradedShown) { SSE.degradedShown = true; try { showToast('实时连接失败，已降级'); } catch (e) {} }
    if (!SSE.fallback) {
      SSE.fallback = setInterval(function () {
        window.LHAuth.issue(game).then(function (d) {
          var c = d && d.issues && d.issues[0];
          if (c) applyStreamIssue(game, { current: c, next: (d.issues || [])[1] });
        }).catch(function () {});
      }, 15000);
    }
  }
  function startRealtime() { updateRTStatus('关'); }
  var regZeroNotice = false;
  async function refreshPoints() {
    if (!awRow) return;
    try {
      var d = await window.LHAuth.me();
      applyUser(d && (d.user || d));
      updatePointsUI(); updateUserChip(); updateBetBar();
    } catch (e) { if (e && e.status === 401) expireSession('登录已过期，请重新登录'); }
  }
  function applyUser(u) {
    var uname = String((u && (u.username || u.email)) || '');
    awUser = { $id: (u && u.id) || '', email: String((u && u.email) || ''), name: uname, avatar: (u && (u.avatar || u.avatar_url)) || '' };
    var bal = Number(u && u.balance);
    awRow = { $id: (u && u.id) || '', username: uname, points: isFinite(bal) ? bal : 0 };
    points = awRow.points;
  }
  function expireSession(msg) {
    try { window.LHAuth.clear(); } catch (e) {}
    awUser = null; awRow = null; points = 0; bets = []; authReady = true;
    updateUserChip();
    try { render(true); } catch (e) {}
    if (msg) showToast(msg);
  }
  async function afterAuth(user) {
    applyUser(user);
    authReady = true;
    try { bets = await loadUserBets(); } catch (e) { bets = []; }
    updateUserChip();
    render(true);
  }
  async function initAuth() {
    if (!window.LHAuth || !window.LHAuth.getToken()) { authReady = true; updateUserChip(); render(true); return; }
    try {
      var d = await window.LHAuth.me();
      await afterAuth(d && (d.user || d));
    } catch (e) {
      if (e && e.status === 401) { expireSession('登录已过期，请重新登录'); }
      else { authReady = true; window.__lhInitError = (e && e.message) || '账户数据加载失败'; updateUserChip(); render(true); }
    }
  }
  function validUsername(v) { return /^[A-Za-z0-9_]{3,20}$/.test(String(v || '').trim()); }
  function authErrorMessage(e) {
    var s = e && e.status, code = String((e && e.code) || '').toUpperCase(), msg = String((e && e.message) || '');
    if (s === 401) return '用户名或密码不正确';
    if (code === 'USERNAME_TAKEN' || s === 409) return '该用户名已被占用，请换一个';
    if (s === 429) return '操作太频繁，请稍后再试';
    if (s === 422) return msg || '用户名或密码格式不正确';
    if (s === 0 || !s) return msg || '网络连接失败，请检查网络后重试';
    return msg || '操作失败，请重试';
  }
  async function loginUser(uname, pass) {
    if (authBusy) return '';
    uname = String(uname || '').trim(); pass = String(pass || '');
    if (!validUsername(uname)) return '用户名需 3-20 位字母/数字/下划线';
    if (pass.length < 8) return '密码至少 8 位';
    if (!window.LHAuth) return '网络组件未加载，请刷新页面';
    authBusy = true;
    try {
      var d = await window.LHAuth.login(uname, pass);
      await afterAuth(d && (d.user || d));
      return '';
    } catch (e) { return authErrorMessage(e); } finally { authBusy = false; }
  }
  async function registerUser(uname, pass, pass2) {
    if (authBusy) return '';
    uname = String(uname || '').trim(); pass = String(pass || ''); pass2 = String(pass2 == null ? pass : pass2);
    if (!validUsername(uname)) return '用户名需 3-20 位字母/数字/下划线';
    if (pass.length < 8) return '密码至少 8 位';
    if (pass !== pass2) return '两次密码不一致';
    if (!window.LHAuth) return '网络组件未加载，请刷新页面';
    authBusy = true;
    try {
      await window.LHAuth.register(uname, pass);
      var d = await window.LHAuth.login(uname, pass);
      await afterAuth(d && (d.user || d));
      return '';
    } catch (e) { return authErrorMessage(e); } finally { authBusy = false; }
  }
  async function logoutUser() {
    try { window.LHAuth.logout(); } catch (e) {}
    awUser = null; awRow = null; points = 0; bets = []; authReady = true;
    updateUserChip();
    try { render(true); } catch (e) {}
  }
  function logout() { logoutUser(); }
  window.addEventListener('lh-auth-unauthorized', function () { expireSession('登录已过期，请重新登录'); });
    var QUICK = [
    { t: '开奖', icon: 'award', i: '奖', c: 'linear-gradient(135deg,#ff9b47,#ed5b3e)', href: '#/history' },
    { t: '走势', icon: 'trend', i: '势', c: '#4ca4e8', href: '#/trend' },
    { t: '图谱', icon: 'chart', i: '谱', c: '#6e8ee8', action: '图谱为演示入口，暂未开放' },
    { t: '排行榜', icon: 'rank', i: '榜', c: 'linear-gradient(135deg,#ff6a6e,#dc3c41)', href: '#/rank' },
    { t: '资料', icon: 'book', i: '资', c: '#3e9fe0', action: '资料库为演示入口，暂未开放' },
    { t: '玩法说明', icon: 'rules', i: '规', c: '#58b5a6', href: '#/rules' },
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
  // 与主站一致的 mdCompat：兼容 current/history 新结构 + 顶层 issue/nums 旧结构
  function parseManual(manual, now) {
    if (!manual) return null;
    var nowMs = now || Date.now();
    function pubOk(x) {
      if (!x) return false;
      var vis = x.visibleFrom ? Date.parse(x.visibleFrom) : 0;
      var pub = x.publishedAt ? Date.parse(x.publishedAt) : 0;
      return !!(pub || !vis || vis <= nowMs);
    }
    var hist = (manual.history || []).map(function (h) {
      var n = normNums(h && h.nums);
      return n.length === 7 ? { issue: issueNo(h.issue), nums: n, raw: h } : null;
    }).filter(function (h) { return h && h.issue && pubOk(h.raw); }).sort(function (a, b) { return b.issue - a.issue; });
    hist = hist.map(function (h) { return { issue: h.issue, nums: h.nums }; });
    var cur = manual.current || {}, curNums = normNums(cur.nums);
    if (curNums.length < 7 && cur.numsEnc && pubOk(cur)) { var d = vfDec(cur.numsEnc); if (d) curNums = normNums(d); }
    var last = null, nextIssue = null;
    if (curNums.length === 7 && pubOk(cur)) {
      last = { issue: issueNo(cur.issue), nums: curNums }; nextIssue = last.issue + 1;
      hist = [{ issue: last.issue, nums: last.nums }].concat(hist.filter(function (h) { return h.issue !== last.issue; }));
    } else {
      last = hist[0] || null;
      nextIssue = cur.issue ? issueNo(cur.issue) : (last ? last.issue + 1 : null);
    }
    // 旧结构兜底：顶层 {issue, nums}
    if (!last && manual.issue != null && manual.nums) {
      var on = normNums(manual.nums);
      if (on.length === 7) { last = { issue: issueNo(manual.issue), nums: on }; nextIssue = last.issue + 1; hist = [{ issue: last.issue, nums: on }].concat(hist); }
    }
    var seen = {};
    hist = hist.filter(function (h) { if (seen[h.issue]) return false; seen[h.issue] = 1; return true; }).slice(0, 20);
    var pending = !(curNums.length === 7 && pubOk(cur));
    return { last: last, nextIssue: nextIssue, history: hist, pending: pending };
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
      else {
        var cr = currentRoute();
        if ((cr.name === 'bet' || cr.name === 'game') && cr.id && DEFS[cr.id] && !DEFS[cr.id].mock) render(true);
      }
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
    if (def.mock) return '<a class="game-cell" href="#/bet/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(intervalLabel(id)) + '/期</span></a>';
    var g = state.games[id];
    if (!g) return '<div class="game-cell skeleton"><span class="sk sk-badge"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>';
    return '<a class="game-cell" href="#/game/' + id + '"><span class="game-circle" style="--gc:' + def.color + '"><span class="game-glyph">' + def.icon + '</span><i class="badge-shine"></i></span><span class="game-name">' + def.name + '</span><span class="game-issue">' + esc(intervalLabel(id) || '每日') + ' · 第 ' + shortIssue(g.last.issue) + ' 期</span></a>';
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
    if (!g || !g.last) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a><div class="data-empty" style="padding:40px 20px">数据待同步</div>';
    var zeroTip = betZeroBanner();
    var last = g.last, hist = (g.history || []).slice(0, 10);
    var rows = hist.map(function (h) { return '<div class="detail-hist-row"><span class="dh-iss">' + esc(String(h.issue)) + ' 期</span><span class="dh-balls">' + balls(h.nums, true) + '</span></div>'; }).join('') || '<div class="data-empty">暂无历史数据</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<section class="detail-head"><span class="game-circle" style="--gc:' + def.color + '">' + def.icon + '</span><div><div class="page-kicker">' + def.name + ' · 实时数据</div><h1 class="page-title">' + def.name + '开奖</h1><div class="page-sub">' + esc(def.desc) + '</div></div></section>' +
      '<div class="detail-actions"><a class="action-btn action-primary" href="#/bet/' + id + '">立即投注</a><a class="action-btn action-ghost" href="#/rules">玩法说明</a></div>' +
      '<section class="detail-last"><div class="detail-label">上期开奖 <span>第 ' + shortIssue(last.issue) + ' 期</span></div><div class="detail-balls">' + balls(last.nums) + '</div><div class="wave-legend"><span><i class="r"></i>红波</span><span><i class="b"></i>蓝波</span><span><i class="g"></i>绿波</span><span class="special-legend">+ 后为特码</span></div></section>' +
      '<section class="next-card"><div><span>下期开奖</span><b>第 ' + shortIssue(g.nextIssue) + ' 期</b><em>' + (intervalLabel(id) || (g.timeCfg && g.timeCfg.time) || '实时') + (id === 'hk' ? ' · 周日' : ' · 每日') + '</em></div><strong data-cd="' + id + '">' + countdownText(g) + '</strong></section>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">波色 / 生肖统计</h2><span class="section-link">近 10 期</span></div><div class="trend-panel">' + gameStats(g) + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">近 10 期开奖</h2><a class="section-link" href="#/history">全部记录 ›</a></div><div class="detail-history">' + rows + '</div></div>' +
      '<div class="mini-note">数据来自主站只读接口；号码、特码与开奖时间以主站为准。</div>';
  }
  function historyPage() {
    var chips = ORDER.map(function (id) { return '<button class="chip ' + (historyGame === id ? 'on' : '') + '" type="button" data-history-game="' + id + '">' + DEFS[id].name + '</button>'; }).join('');
    var g = state.games[historyGame];
    var rows = (g && g.history || []).slice(0, 20).map(function (h) { return '<tr><td class="iss">' + esc(String(h.issue)) + ' 期</td><td>' + DEFS[historyGame].name + '</td><td>' + balls(h.nums, true) + '</td><td><span class="status">● 已开奖</span></td></tr>'; }).join('');
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
      '<section class="profile"><div class="profile-avatar"><button type="button" class="avatar-btn" data-avatar-pick aria-label="设置头像">' + avatarHtml(u || { username: '游客' }, 'lg') + '<i class="avatar-edit">✎</i></button><input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" hidden></div><div class="profile-main"><b>' + esc(name) + '</b><span>' + esc(intro) + '</span><span class="tag">DEMO ACCOUNT</span></div>' + (u ? '<button class="btn btn-ghost" type="button" data-logout>退出</button>' : '<a class="btn btn-primary" href="#/login">登录</a>') + '</section>' +
      '<div class="avatar-set"><button type="button" class="btn btn-ghost" data-avatar-pick>设置头像</button><span>JPG / PNG / WebP · 自动压到 300KB 内</span></div><div id="avatarMsg" class="avatar-msg"></div>' +
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
    if (!u) return '<div class="points-bar guest"><a class="points-login" href="#/login">登录</a><a class="points-help" href="#/rules">玩法说明</a></div>';
    return '<div class="points-bar"><span>账户余额</span><b data-points-value>' + fmtPoints(points) + '</b><span class="rt-status">演示账户</span><a class="points-help" href="#/rules">玩法说明</a></div>';
  }
  function updatePointsUI() { $$('[data-points-value]').forEach(function (el) { el.textContent = fmtPoints(points); }); }
  function attrFor(n) { return state.attrs[parseInt(n,10)] || { z:'', color:colorOf(n) }; }
  function isSel(k) { return !!betState.sel[k]; }
  function selectedCount() { return Object.keys(betState.sel).length; }
  function totalNotes() { var q = parseInt(betState.qty, 10); return (isFinite(q) && q > 0) ? selectedCount() * q : 0; }
  function totalCost() { return totalNotes(); }
  function betHelp(cat) { return '<a class="help-link" href="#/rules/' + cat + '" aria-label="玩法说明">?</a>'; }
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
  function fmtInterval(sec) { sec = Number(sec) || 0; if (sec <= 0) return ''; return sec % 60 === 0 ? (sec / 60) + '分钟' : sec + '秒'; }
  function intervalLabel(id) {
    var g = state.games[id] || {}, def = DEFS[id] || {};
    return fmtInterval(g.intervalSec) || fmtInterval(def.periodSec) || def.period || '';
  }
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
    if (b.status === 'win') return { cls: 'win', text: '已中奖' };
    if (b.status === 'lose') return { cls: 'lose', text: '未中奖' };
    if (b.status === 'settled') {
      if (b.payout == null) return { cls: 'lose', text: '已结算' };
      return Number(b.payout) > 0 ? { cls: 'win', text: '已中奖' } : { cls: 'lose', text: '未中奖' };
    }
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
      if (b.payout == null) { payHtml = '<b class="max muted">—</b>'; pfHtml = '<b class="max muted">—</b>'; }
      else {
        var pf = (b.profit == null ? pay - stake : Number(b.profit)) || 0;
        payHtml = '<b class="' + (pay > 0 ? 'pos' : 'max') + '">' + betMoney(pay) + '</b>';
        pfHtml = '<b class="' + (pf > 0 ? 'pos' : (pf < 0 ? 'neg' : 'max')) + '">' + (pf > 0 ? '+' : '') + betMoney(pf) + '</b>';
      }
    } else if (b.status === 'cancelled') {
      pfHtml = '<b class="max">0</b>';
    }
    var when;
    if (b.status === 'settled') when = b.settledAt ? ('结算 ' + fmtSettled(b.settledAt)) : '已结算';
    else if (b.status === 'cancelled') when = '撤单' + (b.cancelledAt ? ' ' + fmtSettled(b.cancelledAt) : '') + ' · 退回 ' + betMoney(stake) + ' 积分';
    else when = '投注 ' + (b.created ? fmtSettled(b.created) : '—');
    var act = '';
    if (b.status === 'pending' && CANCEL_READY) {
      act = betWindowOpen(b)
        ? '<button type="button" class="bs-btn" data-cancel="' + esc(b.id) + '">撤单</button>'
        : '<button type="button" class="bs-btn off" disabled title="已封盘，不能撤单">已封盘</button>';
    }
    return '<article class="bets-item" data-bet-id="' + esc(b.id) + '">' +
      '<div class="bs-top"><span class="bs-game" style="--gc:' + esc(betGameColor(b.game)) + '"><i class="bs-icon">' + esc(betGameGlyph(b.game)) + '</i>' + esc(betGameName(b.game)) + '</span>' +
      '<span class="bs-issue">第 ' + esc(shortIssue(b.targetIssue)) + ' 期</span>' +
      '<em class="bs-status ' + st.cls + '">' + st.text + '</em></div>' +
      '<div class="bs-picks">' + (chips || '<span class="bs-pick empty">明细缺失</span>') + '<span class="bs-qty">×' + qty + '</span></div>' +
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
        '<div class="bets-login"><b>登录后查看投注记录</b><span>登录后可查看余额；投注记录需登录后查看。</span><a class="btn btn-primary" href="#/login">登录 / 注册</a></div>' +
        '<div class="mini-note">只展示当前账号的云端注单；结算状态以服务端为准。</div>';
    }
    return head + '<div id="betsBody">' + betsBodyHtml() + '</div>' +
      '<div class="mini-note">注单与余额以服务端为准；撤单功能待后端开放。</div>';
  }
  function renderBetsBody() {
    var el = document.getElementById('betsBody');
    if (!el) return;
    el.innerHTML = betsBodyHtml();
  }
  // 规则：pending 且未封盘可撤；期号与当前期不一致时不擅自拦截（服务端 /cancel 才权威，
  // 不一致时点撤单会拿到 WINDOW_CLOSED 再置灰），避免把「跨期但服务端仍允许」的注单锁死。
  // 撤单资格以服务端为准：pending 且未收到过 WINDOW_CLOSED 就展示按钮
  function betWindowOpen(b) {
    if (!b || b.status !== 'pending') return false;
    if (betClosed[b.id]) return false;
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
    return (err && err.code) || (err && err.data && err.data.error && err.data.error.code) || '';
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
    var req = isMock ? mockCancelBet(b.id) : window.LHAuth.cancelBet(b.id);
    req.then(function (res) {
      cancelBusy = false;
      var refund = Math.max(0, Number(b.cost) || 0);
      var np = (res && (res.balance != null ? res.balance : res.points));
      np = np != null ? Number(np) : NaN;
      if (isFinite(np)) { points = np; if (awRow) awRow.points = np; updatePointsUI(); }
      b.status = 'cancelled'; b.payout = 0; b.profit = 0;
      b.cancelledAt = Date.now();
      closeCancelSheet(); renderBetsBody(); updateUserChip();
      showToast('已撤单，退回 ' + betMoney(refund) + ' 积分' + (isMock ? '（本地模拟）' : '') + ' · 当前余额 ' + betMoney(points));
      if (!isMock) { try { loadUserBets().then(function (nb) { if (JSON.stringify(nb) !== JSON.stringify(bets)) { bets = nb; renderBetsBody(); updateUserChip(); } }); } catch (e) {} }
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
      return '<tr><td class="iss">' + esc(String(h.issue)) + ' 期</td><td>' + DEFS[id].name + '</td><td>' + text + '</td><td><span class="status">● 已开奖</span></td></tr>';
    }).join('');
  }
  function histRows(id) {
    var def = DEFS[id] || {}, g = state.games[id];
    // 快开彩种：只认 /api/results 写入的 g.history，不读 localStorage / 旧 /history 接口
    if (def.mock || /^fast-/.test(String(id))) {
      var list = (g && g.history) || [];
      list = list.filter(function (h) { return h && /^\d{6,}$/.test(String(h.issue)) && (h.nums || []).length; });
      list.sort(function (a, b) { return Number(b.issue) - Number(a.issue); });
      return list.slice(0, 20);
    }
    var daily = [];
    if (state.histApi[id] && state.histApi[id].length) return state.histApi[id].slice(0, 20);
    if (!daily.length) daily = (g && g.history) || [];
    if (!daily.length && g && g.last) daily = [g.last];
    return daily.slice(0, 20);
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
      return '<div class="hh-row' + (ri % 2 ? ' alt' : '') + '"><span class="hh-issue">' + esc(String(h.issue)) + ' 期</span><span class="hh-cells">' + cells + '</span></div>';
    }).join('') || '<div class="hh-empty">暂无历史数据</div>';
    return '<div class="hh-tabs">' + tabs.map(function (t) { return '<button type="button" class="hh-tab ' + (mode === t[0] ? 'on' : '') + '" data-hist-mode="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' + body +
      '<div class="hh-more"><a href="#/history">更多历史 ›</a></div>';
  }
  function loadHistoryData(id) {
    if (!id || state.histLoading[id]) return;
    state.histLoading[id] = 1;
    if (!window.LHAuth) { state.histLoading[id] = 0; return; }
    window.LHAuth.results(id, 20).then(function (d) {
      var rows = (d && d.results) || [];
      var g = state.games[id] || (state.games[id] = { last: {}, history: [] });
      g.history = rows.map(function (r) {
        return { issue: r.issue, nums: (r.nums || []).map(function (x) { var c = pad(x); return { c: c, z: zodiacOfNumber(c) || '', color: colorOf(c) }; }) };
      });
      var box = document.querySelector('.race-history'); if (box) box.innerHTML = histInner(id);
      var k3box = document.querySelector('.k3-history'); if (k3box) k3box.innerHTML = k3HistHtml(id);
    }).catch(function () {
      var box = document.querySelector('.race-history'); if (box) box.innerHTML = '<div class="hh-empty">暂无历史数据</div>';
      var k3box = document.querySelector('.k3-history'); if (k3box) k3box.innerHTML = '<div class="k3-hist-empty">暂无历史数据</div>';
    }).then(function () { state.histLoading[id] = 0; });
  }
  function toggleHistory(id) {
    var old = document.querySelector('.race-history');
    if (old) { old.remove(); return; }
    var head = document.querySelector('[data-audit="head-wrap"]'); if (!head) return;
    var box = document.createElement('div'); box.className = 'race-history';
    box.innerHTML = histInner(id);
    head.parentNode.insertBefore(box, head.nextSibling);
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
      '<span class="race-mode">' + ((def && def.id) === 'fast-luckyrace' ? esc(intervalLabel(def.id)) + '/期 · ' : '') + '信用玩法 ▾</span>' +
      '<span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="race-result" data-audit="head-wrap"><div class="rr-left"><div class="rr-issue" data-audit="title" data-hist-toggle="' + def.id + '">第 ' + lastLabel + ' 期开奖结果 <i class="hist-arrow">▾</i></div>' +
      '<div class="rr-nums">' + boxes + '</div>' + labelRow + '</div>' +
      '<div class="rr-right" data-audit="timepanel"><div class="rr-next"><span data-audit="time-row">' + nextLabel + ' 期</span><span data-audit="time-row"><i>封盘时间 ⏱</i></span></div><div class="rr-cd" data-audit="time-row" data-race-cd data-close="' + ((g && g.mockNext) || 0) + '">00:00:04</div></div></div>' +
      '<div class="race-balance"><span>余额：<b>' + fmtPoints(points) + '</b> 积分</span><span class="rb-robot">🤖 机器选号</span><span class="rb-single"><i class="on"></i>快捷<i></i>一般</span></div>';
  }
  function menuHtml() {
    return ['投注记录: bets','玩法说明: rules','历史开奖: history','出码排行: rank','切换主题: theme','音效切换: sound','开奖网: open'].map(function (x) {
      var parts = x.split(': '); return '<button type="button" class="drop-item" data-menu="' + parts[1] + '">' + parts[0] + '</button>';
    }).join('');
  }
  function openRulesToc(anchor) {
    var old = document.querySelector('[data-drop-card]'); if (old) old.parentNode.removeChild(old.parentNode);
    var a = anchor ? anchor.getBoundingClientRect() : { right: innerWidth - 10, bottom: 60 };
    var w = 210, left = Math.max(8, Math.min(innerWidth - w - 8, a.right - w));
    var box = document.createElement('div'); box.className = 'drop-wrap';
    box.innerHTML = '<div class="drop-backdrop" data-menu-close></div><aside class="drop-card" data-drop-card style="left:' + left + 'px;top:' + Math.round(a.bottom + 6) + 'px;width:' + w + 'px"><button type="button" class="drop-item" data-rule-jump="rules-general">一般规则说明</button><button type="button" class="drop-item" data-rule-jump="rules-more">更多玩法说明整理中</button></aside>';
    document.body.appendChild(box);
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
      '<div class="race-foot">一共 ×<b data-bet-count>0</b>，共 <b data-bet-cost>0</b> 积分</div>';
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
  function zodiacOfNumber(n) { var seq = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊']; var i = ((parseInt(n, 10) || 1) - 1) % 12; return seq[(i + 12) % 12]; }
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
      zods += '<span class="lbox six-lbox" data-audit="label">' + (x.z || zodiacOfNumber(n) || attrFor(n).z || '') + '</span>';
    });
    var head = '<div class="six-head"><span class="race-title">' + esc(def.name) + ' »</span><span class="race-mode">信用玩法 ▾</span><span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="race-result six-result-head" data-audit="head-wrap"><div class="rr-left">' +
      '<div class="rr-issue" data-audit="title" data-hist-toggle="' + id + '">' + (/^(hk|newmo|newhk)$/.test(id) ? '上期 ' : '第 ') + shortIssue(last.issueLabel || last.issue) + ' 期开奖结果 <i class="hist-arrow">▾</i></div>' +
      '<div class="rr-nums six-rr-nums">' + balls + '</div>' +
      '<div class="rr-labels six-rr-labels">' + zods + '</div></div>' +
      '<div class="rr-right" data-audit="timepanel"><div class="rr-next"><span data-audit="time-row">' + ((g && (g.nextIssueLabel || g.nextIssue)) || last.issue + 1) + ' 期' + (g && g.pending ? ' · 待开' : '') + '</span><span data-audit="time-row"><i>距开奖 ⏱</i></span></div><div class="rr-cd" data-audit="time-row" data-cd="' + id + '">' + countdownText(g) + '</div></div></div>';
    var cats = SIX_CATS.map(function (c) { return '<button type="button" class="six-cat ' + (cat === c ? 'on' : '') + '" data-six-cat="' + c + '">' + c + '</button>'; }).join('');
    var main;
    if (cat === '特码') {
      var odds = Number(def.specialOdds) || Number(ODDS.special) || 0, grid = '';
      var zf = betState.sixZodiac || '';
      for (var i = 1; i <= 49; i++) {
        var key = pad(i);
        if (zf && (attrFor(i).z || zodiacOfNumber(i)) !== zf) continue;
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
      '<div class="race-foot">一共 ×<b data-bet-count>0</b>，共 <b data-bet-cost>0</b> 积分</div>';
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
      '<span class="k3-next"><b>下一期 ' + esc((g && (g.nextIssueLabel || g.nextIssue)) || '—') + '</b><strong>封盘 ⏱ <em class="k3-cd" data-k3-cd="' + esc(id) + '">' + countdownText(g) + '</em></strong></span></div></div>';
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
      '<div class="race-foot">一共 ×<b data-bet-count>0</b>，共 <b data-bet-cost>0</b> 积分</div>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + head +
      '<div class="k3-layout"><div class="k3-cats">' + cats + '</div><div class="k3-main">' + body + '</div></div>' + bottom;
  }

  function k3HistHtml(id) {
    var g = state.games[id] || {}, rows = (g.history || []).slice(0, 10);
    if (!rows.length) return '<div class="k3-hist-empty">暂无历史数据</div>';
    return '<div class="k3-hist-hd">历史开奖 · 近 ' + rows.length + ' 期</div>' + rows.map(function (h) {
      var n = (h.nums || []).slice(0, 3).map(function (x) { return parseInt(x && x.c != null ? x.c : x, 10); });
      if (n.length < 3) return '';
      var s = n[0] + n[1] + n[2];
      return '<div class="k3-hist-row"><span class="k3-hist-issue">' + esc(String(h.issue)) + ' 期</span><span class="k3-hist-dice">' + n.map(function (v) { return k3Die(v); }).join('') + '</span><span class="k3-hist-sum">和值 <b>' + s + '</b> · ' + (s >= 11 ? '大' : '小') + ' · ' + (s % 2 ? '单' : '双') + '</span></div>';
    }).join('');
  }
  function toggleK3History(id) {
    var old = document.querySelector('.k3-history');
    if (old) { old.remove(); return; }
    var head = document.querySelector('.k3-head'); if (!head) return;
    var box = document.createElement('div');
    box.className = 'k3-history';
    box.innerHTML = k3HistHtml(id);
    head.parentNode.insertBefore(box, head.nextSibling);
  }
  function fastPlaceholderPage(id, def) {
    var boxes = '';
    for (var i = 0; i < 10; i++) boxes += '<i class="fl-ball"></i>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<div class="race-head"><span class="race-title">' + esc(def.name) + ' »</span><span class="race-mode">信用玩法 ▾</span><span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="fast-loading"><div class="fl-title">第 <b>——</b> 期开奖结果</div><div class="fl-balls">' + boxes + '</div></div>';
  }
  function prefetchFastGames() {
    if (window.__lhFastPrefetch || !window.LHAuth) return;
    window.__lhFastPrefetch = 1;
    var first = ['fast-race-1','fast-k3','fast-txffc','fast-mark6-1','fast-race-30','fast-airship','fast-race-2','fast-race-5','fast-mark6-5','fast-bjrace','fast-luckyrace','fast-ship10','fast-tensc','fast-airship-5','fast-race-10'];
    var ids = Object.keys(DEFS).filter(function (id) { return DEFS[id] && DEFS[id].mock; });
    ids.sort(function (a, b) { var ia = first.indexOf(a), ib = first.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    ids.forEach(function (id) { try { syncFastIssue(id, true, true, true); } catch (e) {} });
  }
  function fastErrorPage(id, def) {
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<div class="race-head"><span class="race-title">' + esc(def.name) + ' »</span><span class="race-mode">数据加载失败</span><span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="fast-loading"><div class="fl-title">第 <b>——</b> 期开奖结果</div><div class="fl-note">实时数据获取失败，请稍后重试</div><div style="text-align:center;margin-top:16px"><button type="button" class="btn btn-primary" data-fast-retry="' + esc(id) + '">重新加载</button></div></div>';
  }
  function fastLoadingPage(id, def) {
    var boxes = '';
    for (var i = 0; i < 10; i++) boxes += '<i class="fl-ball"></i>';
    return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' +
      '<div class="race-head"><span class="race-title">' + esc(def.name) + ' »</span><span class="race-mode">加载中…</span><span class="race-help">小助手</span><span class="race-menu">☰</span></div>' +
      '<div class="fast-loading" data-fast-loading="' + esc(id) + '"><div class="fl-title">第 <b>——</b> 期开奖结果</div><div class="fl-balls">' + boxes + '</div><div class="fl-note">正在获取最新开奖数据…</div></div>';
  }
  function betPage(id) {
    var def = DEFS[id] || DEFS.newhk;
    var cached = !!(state.games[id] && state.games[id].last && (state.games[id].last.nums || []).length);
    if (!cached) return betZeroBanner() + fastPlaceholderPage(id, def);
    if (betState.game !== id) { betState.game = id; betState.sel = loadSel(id); }
    var g = state.games[id] || (def.mock && FAST[id] && FAST[id].data ? shapeFast(id, FAST[id].data) : mockGame(id));
    if (def.racing) return betZeroBanner() + winBanner(id) + racingPage(id, def, g);
    if (id === 'newhk' || id === 'newmo' || id === 'hk' || id === 'fast-mark6-1' || id === 'fast-mark6-5') return betZeroBanner() + winBanner(id) + sixSpecialPage(id, def, g);
    if (id === 'fast-k3') return betZeroBanner() + winBanner(id) + k3Page(id, def, g);
    if (def.racing && !(def.cats || []).length) { /* racing 用 RACING_CATS */ }
    if (def.enabled === false) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + emptyState(def.note || '该彩种数据待接入');
    if (!g) return '<a class="back-link" href="#/lotteryhall">‹ 返回大厅</a>' + fastPlaceholderPage(id, def);
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
      (def.mock ? '<div class="fast-meta">周期 <b>' + esc(intervalLabel(id) || '1分钟') + '</b> · <b data-fast-issue="' + id + '">第 — 期</b> · <span data-fast-count="' + id + '">—</span></div>' : '') +
      '<div class="bet-hero"><div class="bet-head"><div><span class="bet-kicker">模拟投注 · 仅演示</span><h1>' + title + '</h1><div class="bet-period">第 <b>' + shortIssue(g.last.issue) + '</b> 期 · 下期 ' + shortIssue(g.nextIssue) + '</div></div><div class="bet-clock">投注中<br><b data-cd="' + id + '">' + countdownText(g) + '</b></div></div>' +
      '<div class="bet-open"><div class="bet-open-label">上期开奖 <span>第 ' + shortIssue(g.last.issue) + ' 期</span></div><div class="bet-open-balls">' + open.html + '<span class="bet-sum">总和 <b>' + open.sum + '</b></span></div></div></div>' +
      '<div class="bet-tabs"><button type="button" class="' + (credit ? 'on' : '') + '" data-bet-tab="credit">信用</button><button type="button" class="' + (!credit ? 'on' : '') + '" data-bet-tab="path">路子图</button></div>' +
      (credit ? '<div class="bet-layout"><div class="bet-cats">' + (def.racing ? RACING_CATS : BET_CATS).map(function (c) { return '<button type="button" class="' + (cat === c.id ? 'on' : '') + '" data-bet-cat="' + c.id + '"><span>' + c.short + '</span>' + c.name + '</button>'; }).join('') + '</div><div class="bet-center">' + betContent(cat) + '</div></div>' : '<div class="bet-path">' + emptyState('路子图演示占位，暂未开放') + '</div>') +
      '<div class="picked-bar">已选：<b data-picked-list>—</b> · ×<b data-bet-count>0</b> · 共 <b data-bet-cost>0</b> 分</div>' +
      '<div class="odds-note">演示赔率，非真实 · 每注固定 2 积分 · 不构成任何投注建议</div>' + cfgNote + my +
      '<div class="bet-bar"><div class="bet-bar-row"><span class="bet-label">注数</span>' + [10,20,50,100,200,500,1000].map(function (n) { return '<button type="button" class="amount-chip ' + (String(qty) === String(n) ? 'on' : '') + '" data-qty="' + n + '">' + n + '</button>'; }).join('') + '<input id="betQty" type="text" inputmode="numeric" placeholder="自定义" value="' + esc(qty) + '"></div><div class="bet-bar-row"><span class="bet-selected">已选 <b data-bet-count>' + totalNotes() + '</b> 注 · 需 <b data-bet-cost>' + cost + '</b> 积分</span><button type="button" class="bet-clear" data-bet-clear>清空</button><button type="button" class="bet-submit" data-bet-submit>立即投注</button></div><div class="bet-hint" data-bet-hint></div></div>';
  }
  function howtoPage(anchor) {
    var active = anchor || 'special';
    var nav = HOWTO.map(function (h) { return '<a class="' + (h.id === active ? 'on' : '') + '" href="#/rules/' + h.id + '">' + h.name + '</a>'; }).join('');
    var blocks = HOWTO.map(function (h) {
      return '<section class="howto-block" id="howto-' + h.id + '"><div class="howto-head"><h2>' + h.name + '</h2><span>演示赔率 ' + h.odds + '</span></div><p><b>规则：</b>' + h.rule + '</p><p><b>举例：</b>' + h.example + '</p><a class="howto-back" href="#/bet/newhk">去模拟投注 →</a></section>';
    }).join('');
    return '<div class="page-head"><div><div class="page-kicker">PLAY GUIDE</div><h1 class="page-title">玩法说明</h1><div class="page-sub">纯演示 · 赔率非真实</div></div><span class="demo-pill">DEMO</span></div><nav class="howto-nav">' + nav + '</nav><div class="howto-points"><b>账户积分怎么玩</b><p>注册后账户余额由新后端提供，初始 0；投注/注单功能正在迁移，暂不可用；每注固定 2 积分（迁移完成后恢复）。余额以服务端返回为准。</p></div><div class="howto-list">' + blocks + '</div><div class="mini-note">所有玩法均为模拟演示，不构成任何投注建议。</div>';
  }
  function loginPage() {
    var register = authMode === 'register';
    return '<div class="auth-page"><div class="auth-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-logo"></use></svg></div><div class="page-kicker">LUCKY HALL ACCOUNT</div><h1 class="auth-title">' + (register ? '注册演示账号' : '登录幸运大厅') + '</h1><p class="auth-sub">新后端账号 · 用户名登录；仅用于本演示站，不涉及真实支付。</p>' +
      '<div class="auth-tabs"><button type="button" class="' + (!register ? 'on' : '') + '" data-auth-mode="login">登录</button><button type="button" class="' + (register ? 'on' : '') + '" data-auth-mode="register">注册</button></div>' +
      '<form id="authForm" class="auth-form"><label>用户名<input id="authUser" type="text" autocomplete="username" maxlength="20" placeholder="3–20 位字母/数字/下划线"></label><label>密码<input id="authPass" type="password" autocomplete="' + (register ? 'new-password' : 'current-password') + '" maxlength="72" placeholder="至少 8 位"></label>' + (register ? '<label>确认密码<input id="authPass2" type="password" autocomplete="new-password" maxlength="72" placeholder="再输入一次密码"></label>' : '') + '<div id="authError" class="auth-error"></div><button class="auth-submit" type="submit">' + (register ? '注册并登录' : '登录') + '</button></form>' +
      '<div class="auth-tip">账号与余额由新后端管理，仅用于本演示站；请勿使用真实密码。<br>登录后可查看余额与投注记录。</div><a class="auth-back" href="#/lotteryhall">先逛逛大厅 →</a></div>';
  }
  function soonPage(title, note) { return '<div class="page-head"><div><div class="page-kicker">COMING SOON</div><h1 class="page-title">' + title + '</h1><div class="page-sub">' + note + '</div></div></div><div class="data-empty" style="padding:40px 20px">该板块为演示占位，待接入后开放。</div>'; }
  function galleryPage() { return soonPage('49 图库', 'Demo · 图库待接入'); }
  function supportPage() { return soonPage('客服', 'Demo · 在线客服待接入'); }
  function rulesPage(anchor) {
    var general = [
      [1,'客户一经在本公司开户或投注，即被视为已接受这些规则。',0],
      [2,'如果客户怀疑自己的资料被盗用，应立即通知本公司，并更改个人详细资料，且之前所使用的使用者名称及密码将全部无效。',0],
      [3,'客户有责任确保自己的账户及登入资料的保密性。在本网站上以个人的使用者名称及密码进行的任何网上投注将被视为有效。',0],
      [4,'为了避免出现争议，请务必在下注之后检查「下注状况」。',0],
      [5,'不论任何原因，开奖之后所接受的投注，将一律被视为「无效」。',1],
      [6,'任何的投诉必须在开奖之前提出，本公司将不会受理任何开奖之后的投诉。',0],
      [7,'公布的投注时间、项目及赔率出现任何打字错误或非故意人为失误，本公司将保留改正错误和按正确搅珠时间、赔率结算注单的权力。',0],
      [8,'公布之所有赔率为浮动赔率，派彩时的赔率将以本公司确认投注时之赔率计算。',0],
      [9,'如本公司察觉客户投注状况异常时，有权及时终止客户投注并删除不正常注单；在本公司终止下注前，客户所有正常投注仍属有效，不得要求取消、延迟交收及不得有任何异议。',0],
      [10,'如因在本网站投注触犯当地法律，本公司概不负责。',0],
      [11,'敬请注意！本公司各游戏项目，开奖时间若有延后，本公司保留期数及注单至隔日早上 09:00；保留期间内若有开奖，一切以下注之期数为主；若无开奖，本公司将期数及注单全部取消，如有不便敬请见谅！',1]
    ];
    var six = [
      { id:'special', name:'特码', odds:'47.3', def:'从 1–49 中任选 1 个号码，竞猜开奖的第 7 个号码（特码）。', win:'开奖特码与所选号码相同即中。', ex:'选 28，开奖特码为 28 → 中。' },
      { id:'two-side', name:'两面', odds:'1.96', def:'按特码属性二选一：大小（25–49 为大、1–24 为小）、单双、合单双（各位数字之和）、尾数大小（0–4 小、5–9 大）。', win:'所选属性与开奖特码一致即中。', ex:'特码 41：大、单、合数 5（合单）、尾数 1（尾小）。' },
      { id:'color', name:'色波', odds:'红 2.7 / 蓝 2.8 / 绿 2.8', def:'按特码所属波色三选一：红波、蓝波、绿波。', win:'开奖特码的波色与所选颜色一致即中。', ex:'选红波，特码 34 为红波 → 中。' },
      { id:'zodiac', name:'特肖', odds:'马 9.5 / 其他 11.7', def:'按特码对应的生肖竞猜，共 12 个生肖。', win:'开奖特码的生肖与所选生肖相同即中。', ex:'选兔，特码 16 属兔 → 中。' },
      { id:'regular', name:'正码', odds:'7.8', def:'从 1–49 中选 1 个号码，竞猜 6 个正码中是否出现。', win:'开奖的 6 个正码中包含所选号码即中。', ex:'选 08，6 个正码中有 08 → 中。' },
      { id:'regular-special', name:'正特', odds:'47.3', def:'从 1–49 中选 1 个号码，竞猜整期 7 个号码（6 正码 + 特码）中是否出现。', win:'7 个开奖号码中包含所选号码即中。', ex:'选 23，任一正码或特码为 23 → 中。' },
      { id:'regular-1-6', name:'正码 1-6', odds:'以页面显示为准', def:'指定第 1–6 位正码中的某一位，竞猜该位置号码的单双、大小、合单双或波色。', win:'该位置开出的号码属性与所选一致即中。', ex:'选「正码一 · 单」，第 1 个正码开 15 → 中。' },
      { id:'combo', name:'连码', odds:'3.2 起', def:'从 1–49 中选 2–5 个号码组成一注组合。', win:'开奖的 7 个号码中全部包含所选号码即中；组合越长，赔率越高。', ex:'选 03 + 18，开奖号码同时含 03、18 → 中。' },
      { id:'flat-zodiac', name:'平特一肖', odds:'马 1.8 / 其他 2', def:'选 1 个生肖，竞猜整期开奖号码中是否出现该生肖。', win:'7 个开奖号码中任意一个属于所选生肖即中。', ex:'选马，开奖号码中有 13（马）→ 中。' },
      { id:'flat-tail', name:'平特尾', odds:'0 尾 2 / 1–9 尾 1.8', def:'选 1 个尾数（0–9），竞猜整期开奖号码中是否出现该尾数。', win:'7 个开奖号码中任意一个的尾数与所选相同即中。', ex:'选 8 尾，开奖号码中有 28 → 中。' },
      { id:'sum-zodiac', name:'合肖', odds:'以页面显示为准', def:'选 2–5 个生肖组成一注，竞猜特码生肖是否落在组合内。', win:'开奖特码的生肖属于所选组合即中；组合越长，赔率越高。', ex:'选马 + 兔，特码 13（马）→ 中。' },
      { id:'miss', name:'自选不中', odds:'2.0', def:'选 1 个号码，竞猜整期开奖号码中是否都不出现它。', win:'7 个开奖号码均不含所选号码即中。', ex:'选 49，开奖 7 个号码无 49 → 中。' },
      { id:'chain-zodiac', name:'连肖', odds:'以页面显示为准', def:'选 2–5 个生肖组成连肖组合，按所选顺序组成一注。', win:'开奖特码生肖落在所选组合内即中；组合越长，赔率越高。', ex:'选鼠 + 牛，特码生肖为牛 → 中。' },
      { id:'tail-chain', name:'尾数连', odds:'以页面显示为准', def:'选 2–5 个尾数组成一注。', win:'开奖的 7 个号码中，所选尾数全部至少出现一次即中。', ex:'选 2 尾 + 7 尾，开奖号码含 02 和 27 → 中。' },
      { id:'dragon-tiger', name:'龙虎斗', odds:'以页面显示为准', def:'比较两个指定位置号码的大小：前者大为龙、后者大为虎、相同为和。', win:'所选结果与实际比较结果一致即中。', ex:'特码 41、正码一 18，选龙 → 中。' }
    ];
    var fast = [
      { id:'rank', name:'名次（第 1–10 名）', odds:'9.98', def:'竞猜开奖号码在某一具体名次上的号码，或该名次号码的大小、单双、龙虎。', win:'所选名次的号码或属性与开奖结果一致即中。', ex:'第 1 名开 08，选「第 1 名 · 小」→ 中。' },
      { id:'sum', name:'冠亚和值', odds:'冠亚大 2.19 / 冠亚小 1.79 / 冠亚单 1.79 / 冠亚双 2.19', def:'冠军号码与亚军号码相加得到和值，可竞猜和值大小、单双或具体点数。', win:'所选和值区间、单双或点数与实际和值一致即中。', ex:'冠军 09、亚军 02，和值 11；选「冠亚大」→ 中。' },
      { id:'combo', name:'冠亚组合', odds:'以页面显示为准', def:'把冠军与亚军的号码按先后顺序组成一个组合，竞猜具体组合。', win:'开奖的冠军、亚军号码与所选组合完全一致即中。', ex:'冠军 01、亚军 02，选「1-2」→ 中。' },
      { id:'two-side', name:'两面', odds:'1.99', def:'对冠亚和值或指定名次做二选一判断：大小、单双、龙虎。', win:'判断结果与实际开奖属性一致即中；龙虎按两个位置号码大小比较。', ex:'冠亚和值 15，选「大 · 单」→ 中。' },
      { id:'dragon-tiger', name:'龙虎', odds:'1.99', def:'比较两个指定名次号码的大小，前者大为龙、后者大为虎。', win:'所选龙/虎与实际比较结果一致即中。', ex:'冠军 09、亚军 02，选龙 → 中。' }
    ];
    var faqs = [
      ['开奖时间', '六合彩类按主站每日/每周开奖时间；快开类每个彩种有独立倒计时，以彩种页顶部倒计时为准。'],
      ['赔率以哪里为准', '以彩种页/投注页实时显示的赔率为准；后台配置调整后页面会同步变化，本页数字仅为当前展示值的摘录。'],
      ['怎样算中奖与结算', '开奖后系统按注单选项自动结算，可在「投注记录」查看待结算/已结算、派彩与盈亏。'],
      ['为什么不同彩种玩法有差异', '不同彩种的号码个数、名次和可选玩法不同；具体可选选项以该彩种页面为准。']
    ];
    function item(x, group) {
      return '<article class="rule-item2" id="rule-' + group + '-' + x.id + '"><h3>' + x.name + '<span class="rule-odds">参考赔率 ' + x.odds + '</span></h3><p><b>玩法说明：</b>' + x.def + '</p><p><b class="rules-red">中奖条件：</b>' + x.win + '</p><p class="rule-ex"><b>举例：</b>' + x.ex + '</p></article>';
    }
    var generalHtml = general.map(function (r) { return '<p class="rules-p' + (r[2] ? ' red' : '') + '"><span class="rules-no">' + r[0] + '</span>' + r[1] + '</p>'; }).join('');
    return '<div class="rules-page"><header class="rules-top"><a class="rules-back" href="#/lotteryhall" aria-label="返回大厅">‹</a><h1>玩法说明</h1><button type="button" class="rules-menu" data-rules-menu aria-label="目录">☰</button></header>' +
      '<nav class="rules-toc"><a href="#/rules/general">一般规则</a><a href="#/rules/six">六合彩类</a><a href="#/rules/fast">快开类</a><a href="#/rules/faq">常见问题</a></nav>' +
      '<div class="rules-sub"><h2 id="rules-general">一般规则说明</h2><a href="#/bet/fast-race-1">极速赛车 ›</a></div><div class="rules-line"></div>' +
      '<div class="rules-body">' + generalHtml + '</div>' +
      '<section class="rules-sec2" id="rules-six"><h2>六合彩类</h2><p class="rules-lead">适用于新香港、新澳、香港等 49 号码彩种。赔率为当前页面展示值，具体以投注页为准。</p>' + six.map(function (x) { return item(x, 'six'); }).join('') + '</section>' +
      '<section class="rules-sec2" id="rules-fast"><h2>快开类</h2><p class="rules-lead">适用于赛车、飞艇、时时彩、分分彩等按名次或和值开奖的彩种。</p>' + fast.map(function (x) { return item(x, 'fast'); }).join('') + '</section>' +
      '<section class="rules-sec2" id="rules-faq"><h2>常见问题</h2>' + faqs.map(function (q) { return '<div class="rule-faq"><h3>' + q[0] + '</h3><p>' + q[1] + '</p></div>'; }).join('') + '</section>' +
      '<div class="rules-more" id="rules-more">更多玩法说明整理中</div>' +
      '<footer class="rules-declare"><p>本页玩法说明由公开网络资料整理而成，部分表述参考自公开的彩票资料站点；玩法规则与赔率以官方及本平台页面显示为准，本说明仅作规则解释，不构成任何投注建议。</p></footer></div>';
  }
  var ROUTES = { lotteryhall: hallPage, history: historyPage, trend: trendPage, rank: rankPage, bets: betsPage, me: mePage, points: mePage, gallery: galleryPage, support: supportPage, rules: rulesPage };
  var TITLES = { lotteryhall: '彩票大厅', history: '开奖记录', trend: '号码走势', rank: '高手排行', bets: '投注记录', me: '我的', points: '我的积分', gallery: '49图库', support: '客服', howto: '玩法说明', rules: '玩法说明', login: '登录' };
  function currentRoute() {
    var h = String(location.hash || '').replace(/^#\/?/, ''), parts = h.split('/');
    if (parts[0] === 'game' && DEFS[parts[1]]) return { name: 'game', id: parts[1] };
    if (parts[0] === 'bet' && DEFS[parts[1]]) return { name: 'bet', id: parts[1] };
    if (parts[0] === 'howto') return { name: 'howto', anchor: parts[1] || '' };
    if (parts[0] === 'rules') return { name: 'rules', anchor: parts[1] || '' };
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
          var noPts = Number(points) <= 0;
          var winOff = winClosed(betState.game);
          var guestBtn = !currentUser();
          // 未登录/余额不足都保持可点：未登录跳登录，余额不足由后端 400 给明确文案
          subBtn.disabled = closed || winOff;
          subBtn.textContent = winOff ? '已停售（时段结束）' : (guestBtn ? '登录后投注' : (noPts ? '余额不足' : (closed ? '已停止投注' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注'))));
        }
        // 到期后每 5s 拉 /issues
        // 期号/号码刷新交给统一 pollTick（避免多定时器）
        if (closeAt) { var hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60; cdEl.textContent = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2); }
      }
      var k3cd = document.querySelector('[data-k3-cd]');
      if (k3cd) {
        var kid = k3cd.getAttribute('data-k3-cd'), kg = state.games[kid] || {};
        var kat = Number(kg.mockNext) || 0;
        if (!kat && state.win[kid] && state.win[kid].endAt) kat = Date.parse(state.win[kid].endAt) || 0;
        if (kat) {
          var kl = Math.max(0, Math.round((kat - Date.now()) / 1000));
          k3cd.textContent = ('0' + Math.floor(kl / 3600)).slice(-2) + ':' + ('0' + Math.floor((kl % 3600) / 60)).slice(-2) + ':' + ('0' + (kl % 60)).slice(-2);
        } else { k3cd.textContent = '——'; }
      }
      var dailyCd = document.querySelector('[data-cd]');
      if (dailyCd) {
        var dg = state.games[betState.game] || {};
        var at = Number(dg.mockNext) || 0;
        if (!at && dg.timeCfg) { var nd = nextDrawAt(dg); at = nd ? nd.getTime() : 0; }
        if (!at) dailyCd.textContent = '——';
        else {
          var dl = Math.max(0, Math.round((at - Date.now()) / 1000));
          var dh = Math.floor(dl / 3600), dm = Math.floor((dl % 3600) / 60), ds = dl % 60;
          dailyCd.textContent = ('0' + dh).slice(-2) + ':' + ('0' + dm).slice(-2) + ':' + ('0' + ds).slice(-2);
        }
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
    document.body.classList.toggle('rules-mode', r.name === 'rules');
    document.body.classList.toggle('race-mode', r.name === 'bet' && !!DEFS[r.id] && !!DEFS[r.id].racing);
    try {
      if (r.name === 'lotteryhall' && !BOOT.data && BOOT.loading) view.innerHTML = bootSkeleton();
      else if (r.name === 'game') view.innerHTML = gamePage(r.id);
      else if (r.name === 'bet') {
        view.innerHTML = betPage(r.id); updateBetBar();
      }
      else if (r.name === 'howto') view.innerHTML = howtoPage(r.anchor);
      else if (r.name === 'rules') view.innerHTML = rulesPage(r.anchor);
      else if (r.name === 'login') view.innerHTML = loginPage();
      else if (r.name === 'rank') { view.innerHTML = rankPage(); loadRankLive(); }
      else view.innerHTML = ROUTES[r.name] ? ROUTES[r.name]() : hallPage();
    } catch (err) {
      view.innerHTML = '<div class="data-empty" style="padding:40px 20px">页面渲染失败：' + String((err && err.message) || err) + '</div>';
      try { console.error('[render]', err); } catch (e) {}
    }
    setBottomTab(r.name); markHotIcons(); decorateLogos();
    try { sseConnect((r.name === 'bet' || r.name === 'game') ? r.id : ''); } catch (e) {}
    var ttl = r.name === 'game' ? DEFS[r.id].name + '开奖' : (r.name === 'bet' ? (DEFS[r.id].name + '模拟投注') : (r.name === 'howto' ? '玩法说明' : (r.name === 'login' ? '登录 / 注册' : TITLES[r.name])));
    document.title = ttl + ' · 彩票大厅（演示）';
    if (!keepScroll) {
      if (r.name === 'rules' && r.anchor) setTimeout(function () { var el = document.getElementById('rules-' + r.anchor); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo(0, 0); }, 60);
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
    var guest = !currentUser();
    var hintText = guest ? '请先登录后投注' : (closed ? winCloseText(betState.game) : (insuff ? (points <= 0 ? '余额不足，暂无法投注' : '余额不足，无法投注（当前 ' + fmtPoints(points) + '，需要 ' + fmtPoints(cost) + '）') : ''));
    var hint = $('[data-bet-hint]'); if (hint) { hint.textContent = hintText; hint.classList.toggle('show', closed || insuff); }
    var _g = state.games[betState.game]; var noReal = !_g || !_g.last || !_g.last.issue;
    var submit = $('[data-bet-submit]'); if (submit) {
      submit.disabled = closed || betSubmitting || noReal;
      submit.textContent = closed ? '已停售（时段结束）' : (betSubmitting ? '投注中…' : (guest ? '登录后投注' : (insuff ? '余额不足' : ((document.body.classList.contains('race-mode')) ? '下注' : '立即投注'))));
    }
    updatePointsUI();
  }
  document.addEventListener('click', function (e) {
    var pick = e.target.closest('[data-avatar-pick]');
    if (pick) { e.preventDefault(); var inp = document.getElementById('avatarFile'); if (inp) inp.click(); }
  });
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'avatarFile' && e.target.files && e.target.files[0]) uploadAvatar(e.target.files[0]);
  });
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'betQty') {
      betState.qty = String(e.target.value || '').replace(/[^\d.]/g, '');
      e.target.value = betState.qty;
      updateBetBar();
    }
    if (e.target && (e.target.id === 'authPass' || e.target.id === 'authPass2')) {
      var p1 = document.getElementById('authPass'), p2 = document.getElementById('authPass2');
      if (!p2) return;
      var box = document.getElementById('authError'), btn = document.querySelector('.auth-submit');
      var mismatch = !!(p1 && p1.value && p2.value && p1.value !== p2.value);
      if (mismatch) {
        if (btn) btn.disabled = true;
        if (box && !/正在/.test(box.textContent || '')) box.textContent = '两次密码不一致';
      } else {
        if (btn) btn.disabled = false;
        if (box && box.textContent === '两次密码不一致') box.textContent = '';
      }
    }
  });
  document.addEventListener('click', function (e) {
    var retry = e.target.closest('[data-fast-retry]');
    if (retry) { var rid = retry.getAttribute('data-fast-retry'); if (rid) { FAST[rid] = FAST[rid] || {}; FAST[rid].failedAt = 0; syncFastIssue(rid, false, true); } return; }
    var k3Block = e.target.closest('.k3-result');
    if (k3Block) { var k3r = currentRoute(); if (k3r && k3r.id) { toggleK3History(k3r.id); return; } }
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
    if (e.target.closest('[data-rules-menu]')) { openRulesToc(e.target.closest('[data-rules-menu]')); return; }
    var rj = e.target.closest('[data-rule-jump]');
    if (rj) { var rid2 = rj.getAttribute('data-rule-jump'); closeMenu(); var rel = document.getElementById(rid2); if (rel) rel.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
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
      logoutUser(); AUTH_NEXT = '#/lotteryhall'; updateUserChip(); location.hash = '#/lotteryhall';
      showToast('已退出登录');
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
      var qty = parseFloat(betState.qty);
      if (!nodes.length) { showToast('请先选择玩法'); return; }
      if (!String(betState.qty == null ? '' : betState.qty).trim() || !isFinite(qty) || qty < 1) { showToast('请输入投注金额'); return; }
      var notes = nodes.length * qty, cost = notes;
      var g = state.games[betState.game] || mockGame(betState.game);
      if (!g) { showToast('彩种数据未就绪'); return; }

      var selections = nodes.map(function (el) { var key = el.getAttribute('data-bet'); return { key:key, label:el.getAttribute('data-label') || key, odds:parseFloat(el.getAttribute('data-odds')) || 0, zodiacs:el.getAttribute('data-zodiacs') || '' }; });
      betSubmitting = true; updateBetBar();
      (async function () {
        try {
          await refreshPoints();
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
          // 快开：期号以 GET /api/issues 为准；每日彩种沿用前端期号
          var issue = String(g.nextIssue == null ? '' : g.nextIssue);
          if (/^fast-/.test(betState.game) && window.LHAuth) {
            try {
              var info = await window.LHAuth.issue(betState.game);
              var cur = info && info.issues && info.issues[0];
              if (cur && cur.issue) issue = String(cur.issue);
            } catch (e0) {}
          }
          var res = await window.LHAuth.placeBet({ game: betState.game, issue: issue, picks: pickIds, amount: cost });
          var newPoints = (res && res.balance != null) ? Number(res.balance) : (points - cost);
          if (isFinite(newPoints)) { points = newPoints; awRow.points = newPoints; }
          var bet = (res && res.bet) || {};
          bets.unshift({ id: bet.id || ('local-' + Date.now()), game: betState.game, targetIssue: bet.issue || issue, placedIssue: g.last && g.last.issue, qty: qty, cost: cost, notes: notes, selections: selections, picksText: '', labels: selections.map(function (s) { return s.label; }).join('、'), status: bet.status || 'pending', payout: 0, profit: 0, created: Date.now(), settledAt: null, cancelledAt: null });
          betState.sel = {}; betState.qty = '1'; betSubmitting = false;
          try { bets = await loadUserBets(); } catch (e1) {}
          updateBetBar(); updateUserChip(); render(true);
          showModal('投注成功，扣减 ' + fmtPoints(cost) + ' 积分，当前余额 ' + fmtPoints(points) + '。演示站点 · 不构成任何投注建议。');
        } catch (err) {
          betSubmitting = false; updateBetBar();
          var code = String((err && err.code) || '');
          if (err && err.status === 400 && code === 'INSUFFICIENT_BALANCE') {
            var zh = document.querySelector('[data-bet-hint]');
            if (zh) { zh.textContent = '余额不足，无法投注（当前 ' + fmtPoints(points) + '，需要 ' + fmtPoints(cost) + '）'; zh.classList.add('show'); }
            showToast('余额不足，请先充值或联系管理员');
          } else if (err && err.status === 409 && code === 'WINDOW_CLOSED') {
            var zh2 = document.querySelector('[data-bet-hint]');
            if (zh2) { zh2.textContent = '该期已封盘，无法投注'; zh2.classList.add('show'); }
            showToast('该期已封盘，无法投注');
            try { refreshPoints(); } catch (e) {}
          } else if (err && err.status === 401) {
            expireSession('登录已过期，请重新登录');
          } else {
            showModal(String((err && err.message) || '网络异常，请重试').slice(0, 120));
          }
        }
      })();
      return;
    }
    if (e.target.closest('#refreshDataBtn')) { loadBootstrap(true); return; }
  });
  document.addEventListener('submit', async function (e) {
    if (!e.target || e.target.id !== 'authForm') return;
    e.preventDefault();
    var wasRegister = authMode === 'register';
    var box = $('#authError'); if (box) box.textContent = wasRegister ? '正在注册…' : '正在登录…';
    var uEl = $('#authUser'), pEl = $('#authPass'), p2El = $('#authPass2');
    if (wasRegister && pEl && p2El && pEl.value !== p2El.value) { if (box) box.textContent = '两次密码不一致'; return; }
    var err = wasRegister ? await registerUser(uEl && uEl.value, pEl && pEl.value, p2El && p2El.value) : await loginUser(uEl && uEl.value, pEl && pEl.value);
    if (err) { if (box) box.innerHTML = err; return; }
    var next = wasRegister ? '#/lotteryhall' : (AUTH_NEXT || '#/lotteryhall'); AUTH_NEXT = '#/lotteryhall';
    if (wasRegister) { regZeroNotice = true; try { sessionStorage.setItem('xcRegZero', '1'); } catch (e) {} }
    location.hash = next; updateUserChip();
    showToast(wasRegister ? '注册成功，已登录 · 当前余额 0' : '登录成功，余额已同步');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCancelSheet(); } });
  window.addEventListener('hashchange', function () { closeCancelSheet(); render(); });
  if (!location.hash) { try { history.replaceState(null, '', '#/lotteryhall'); } catch (e) { location.hash = '#/lotteryhall'; } }
  applyTheme();
  (async function () {
    loadBootstrap(); render();
    try { await initAuth(); } catch (e) { try { console.warn('[auth] init failed:', (e && e.message) || e); } catch (x) {} }
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
      // 数据由 /api/bootstrap + SSE 维护，不做页面轮询
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
        if (BETS_READY) { try { window.LotteryAPI.call('/settle', { method: 'POST', body: { gameId: id }, headers: { 'x-appwrite-trigger': 'schedule' } }).catch(function () {}); } catch (e) {} }
      }
      FAST_LAST[id] = issue;
    });
  }, 1000);

})();
