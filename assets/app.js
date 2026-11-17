(function () {
  'use strict';

  var GAMES = [
    { id: 'mark6', name: '六合彩', icon: '六', tag: '每日开奖', desc: '49 选 7 · 经典玩法', color: '#ffc247', meta: '下一期 21:34' },
    { id: 'ssc', name: '时时彩', icon: '时', tag: '高频', desc: '10 分钟一期 · 快速开奖', color: '#48d7ff', meta: '今日 86 期' },
    { id: 'k3', name: '快三', icon: '快', tag: 'HOT', desc: '骰子竞猜 · 简单直接', color: '#ff6b8f', meta: '今日 72 期' },
    { id: 'syxw', name: '11 选 5', icon: '11', tag: '', desc: '任选 / 直选 · 灵活组合', color: '#a68bff', meta: '今日 54 期' },
    { id: 'kl8', name: '快乐 8', icon: '8', tag: 'NEW', desc: '20 码开奖 · 多种玩法', color: '#4ee6a4', meta: '今日 31 期' },
    { id: 'pk10', name: '北京赛车', icon: '车', tag: '', desc: '10 车竞速 · 冠军竞猜', color: '#ff9a55', meta: '今日 48 期' }
  ];

  var ROOMS = [
    { name: '好运来工作室', avatar: '好', cls: '', tag: '六合彩', streak: 12, rate: '78%', rank: 'TOP 1' },
    { name: '灯塔数据组', avatar: '灯', cls: 'v2', tag: '时时彩', streak: 9, rate: '73%', rank: 'TOP 2' },
    { name: '小满研究社', avatar: '满', cls: 'v3', tag: '快三', streak: 8, rate: '71%', rank: 'TOP 3' },
    { name: '北纬二十三', avatar: '北', cls: 'v4', tag: '快乐 8', streak: 6, rate: '68%', rank: '' }
  ];

  var HISTORY = [
    { issue: '2026321', game: '六合彩', nums: ['16','15','34','41','23','19','13'], status: '已开奖', time: '11-17 21:34' },
    { issue: '2026320', game: '六合彩', nums: ['48','39','46','12','07','16','38'], status: '已开奖', time: '11-17 21:34' },
    { issue: '2026319', game: '六合彩', nums: ['28','07','33','46','12','21','38'], status: '已开奖', time: '11-16 21:34' },
    { issue: '2026318', game: '六合彩', nums: ['43','09','12','38','27','05','41'], status: '已开奖', time: '11-16 21:34' },
    { issue: '2026317', game: '六合彩', nums: ['07','15','20','46','13','38','29'], status: '已开奖', time: '11-15 21:34' },
    { issue: '2026316', game: '六合彩', nums: ['28','48','39','21','38','23','05'], status: '已开奖', time: '11-15 21:34' },
    { issue: '2026315', game: '六合彩', nums: ['11','25','12','18','17','02','06'], status: '已开奖', time: '11-14 21:34' },
    { issue: '2026314', game: '六合彩', nums: ['09','08','46','06','16','05','46'], status: '已开奖', time: '11-14 21:34' },
    { issue: '2026888', game: '时时彩', nums: ['03','08','11','06','09'], status: '已开奖', time: '11-17 22:00' },
    { issue: '2026887', game: '时时彩', nums: ['07','02','05','10','01'], status: '已开奖', time: '11-17 21:50' },
    { issue: '2026066', game: '快三', nums: ['04','05','06'], status: '已开奖', time: '11-17 21:46' },
    { issue: '2026065', game: '快三', nums: ['02','03','05'], status: '已开奖', time: '11-17 21:36' }
  ];

  var RANKS = [
    { name: '好运来工作室', avatar: '好', cls: '', tag: '六合彩 · 12 连中', value: '78%', label: '命中率', medal: '♛' },
    { name: '灯塔数据组', avatar: '灯', cls: 'v2', tag: '时时彩 · 9 连中', value: '73%', label: '命中率', medal: '②' },
    { name: '小满研究社', avatar: '满', cls: 'v3', tag: '快三 · 8 连中', value: '71%', label: '命中率', medal: '③' },
    { name: '北纬二十三', avatar: '北', cls: 'v4', tag: '快乐 8 · 6 连中', value: '68%', label: '命中率', medal: '4' },
    { name: '夜航船', avatar: '夜', cls: 'v2', tag: '六合彩 · 5 连中', value: '64%', label: '命中率', medal: '5' },
    { name: '数据小酒馆', avatar: '酒', cls: 'v3', tag: '北京赛车 · 4 连中', value: '61%', label: '命中率', medal: '6' }
  ];

  var HISTORY_FILTER = '全部';
  var TREND_GAME = '六合彩';
  var toastTimer = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function ballClass(n) {
    n = parseInt(n, 10);
    if (n === 49) return 'g';
    var r = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
    var b = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
    return r.indexOf(n) >= 0 ? 'r' : (b.indexOf(n) >= 0 ? 'b' : 'g');
  }

  function balls(nums, special) {
    var out = '';
    nums.forEach(function (n, i) {
      if (i === 6) out += '<i class="ball plus">+</i>';
      out += '<span class="ball ' + ballClass(n) + '">' + esc(n) + '</span>';
    });
    return '<span class="ball-row">' + out + '</span>';
  }

  function hero() {
    return '<section class="hero">' +
      '<span class="hero-kicker">LUCKY HALL · 演示大厅</span>' +
      '<h1>今晚，<em>好运</em>开场</h1>' +
      '<p>热门彩种、开奖走势、高手榜单，一站式逛大厅。所有内容为演示样例。</p>' +
      '<div class="hero-row"><button class="btn" type="button" data-demo="演示大厅：下注与充值功能暂未开放，敬请期待">立即体验</button><span class="hero-note">无真实交易<br>仅展示效果</span></div>' +
      '<div class="hero-jackpot"><span>演示奖池</span><b>¥ 8,888,888</b><span>虚位以待</span></div>' +
      '</section>';
  }

  function notice() {
    return '<div class="notice"><b>公告</b><span>新版本大厅已上线，彩种与榜单均为样例展示</span><button type="button" data-demo="公告详情为演示内容">更多</button></div>';
  }

  function gameCard(g) {
    return '<button class="game-card" type="button" style="--gc:' + g.color + '" data-demo="「' + esc(g.name) + '」为演示彩种，暂不开放下注">' +
      '<div class="game-top"><span class="game-icon">' + esc(g.icon) + '</span>' + (g.tag ? '<span class="game-tag">' + esc(g.tag) + '</span>' : '') + '</div>' +
      '<div class="game-name">' + esc(g.name) + '</div>' +
      '<div class="game-desc">' + esc(g.desc) + '</div>' +
      '<div class="game-meta"><i></i>' + esc(g.meta) + '</div>' +
      '</button>';
  }

  function roomRow(r, idx) {
    return '<div class="room">' +
      '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span>' +
      '<div class="room-main"><div class="room-name">' + esc(r.name) + (r.rank ? ' <span class="rank-badge">' + esc(r.rank) + '</span>' : '') + '</div>' +
      '<div class="room-meta"><span>' + esc(r.tag) + '</span><b>连中 ' + esc(r.streak) + '</b><span class="rate">命中 ' + esc(r.rate) + '</span></div></div>' +
      '<button class="room-enter" type="button" data-demo="房间「' + esc(r.name) + '」为演示内容，暂不开放进入">进入</button>' +
      '</div>';
  }

  function statStrip() {
    return '<div class="stats-strip">' +
      '<div class="stat"><b>18</b><span>今日开奖</span></div>' +
      '<div class="stat"><b>2.8w</b><span>演示人气</span></div>' +
      '<div class="stat"><b>36</b><span>在榜高手</span></div>' +
      '</div>';
  }

  function hallPage() {
    var rooms = ROOMS.map(roomRow).join('');
    var cards = GAMES.map(gameCard).join('');
    return hero() + notice() +
      '<section class="section"><div class="section-head"><h2 class="section-title">热门彩种</h2><button class="section-link" type="button" data-demo="彩种列表为演示占位">全部彩种 ›</button></div><div class="game-grid">' + cards + '</div></section>' +
      '<section class="section"><div class="section-head"><h2 class="section-title">高手房间</h2><a class="section-link" href="#/rank">查看排行 ›</a></div><div class="room-list">' + rooms + '</div></section>' +
      statStrip() +
      '<section class="section"><div class="section-head"><h2 class="section-title">榜单速览</h2><a class="section-link" href="#/rank">完整榜单 ›</a></div>' +
      '<div class="rank-list">' + RANKS.slice(0, 3).map(function (r, i) { return rankRow(r, i); }).join('') + '</div></section>' +
      '<div class="mini-note">大厅内容为演示样例，不提供充值、下注或账号服务。</div>';
  }

  function rankRow(r, i) {
    return '<div class="rank-row"><span class="rank-no">' + (i < 3 ? r.medal : (i + 1)) + '</span><span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><div class="rank-info"><b>' + esc(r.name) + '</b><span>' + esc(r.tag) + '</span></div><div class="rank-val"><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></div></div>';
  }

  function historyPage() {
    var filters = ['全部', '六合彩', '时时彩', '快三'].map(function (f) {
      return '<button class="chip ' + (HISTORY_FILTER === f ? 'on' : '') + '" type="button" data-history-filter="' + f + '">' + f + '</button>';
    }).join('');
    var rows = HISTORY.filter(function (h) { return HISTORY_FILTER === '全部' || h.game === HISTORY_FILTER; });
    if (!rows.length) rows = [];
    var body = rows.map(function (h) {
      return '<tr><td class="iss">' + esc(h.issue) + '</td><td>' + esc(h.game) + '</td><td>' + balls(h.nums) + '</td><td><span class="status">● ' + esc(h.status) + '</span></td></tr>';
    }).join('');
    return '<div class="page-head"><div><div class="page-kicker">RESULTS</div><h1 class="page-title">开奖记录</h1><div class="page-sub">近期开奖 · 数据为演示样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="chips">' + filters + '</div>' +
      '<div class="history-wrap"><div class="table-scroll"><table class="hist"><thead><tr><th>期号</th><th>彩种</th><th>开奖号码</th><th>状态</th></tr></thead><tbody>' + body + '</tbody></table></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="历史记录为演示数据，加载更多暂未开放">加载更多</button></div>' +
      '<div class="mini-note">开奖结果与期号均为展示用样例，不对应任何真实开奖。</div>';
  }

  function trendBars() {
    var data = [42, 56, 48, 70, 62, 88, 75, 58, 92, 67, 80, 51];
    var labels = ['21','20','19','18','17','16','15','14','13','12','11','10'];
    return data.map(function (v, i) {
      return '<div class="bar-item ' + (i === 6 || i === 8 ? 'hot' : '') + '"><div class="bar" style="height:' + v + '%"></div><i>' + labels[i] + '</i></div>';
    }).join('');
  }

  function trendPage() {
    var games = ['六合彩', '时时彩', '快三'];
    var chips = games.map(function (g) {
      return '<button class="chip ' + (TREND_GAME === g ? 'on' : '') + '" type="button" data-trend-game="' + g + '">' + g + '</button>';
    }).join('');
    var cells = '';
    for (var n = 1; n <= 49; n++) {
      var hot = [7, 13, 16, 19, 23, 28, 34, 38, 41, 46, 48].indexOf(n) >= 0;
      var cool = [1, 5, 12, 21, 29, 36, 44].indexOf(n) >= 0;
      cells += '<span class="num-cell ' + (hot ? 'hot' : (cool ? 'cool' : '')) + '">' + (n < 10 ? '0' + n : n) + '</span>';
    }
    return '<div class="page-head"><div><div class="page-kicker">TREND</div><h1 class="page-title">号码走势</h1><div class="page-sub">' + esc(TREND_GAME) + ' · 近 12 期演示数据</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="trend-panel card"><div class="trend-head"><b>开奖号码分布</b><span>单位：期</span></div><div class="bars">' + trendBars() + '</div><div class="num-grid">' + cells + '</div>' +
      '<div class="legend"><span><i style="background:var(--yellow)"></i>热号</span><span><i style="background:var(--cyan)"></i>冷号</span><span><i style="background:#313951"></i>常规</span></div></div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="完整走势为演示功能，暂未开放">查看完整走势</button></div>' +
      '<div class="mini-note">图表与号码网格均为 mock，仅用于展示布局。</div>';
  }

  function rankPage() {
    var top = RANKS.slice(0, 3);
    var podium = [top[1], top[0], top[2]].map(function (r, i) {
      return '<div class="podium-item ' + (r.name === top[0].name ? 'first' : '') + '">' + (r.name === top[0].name ? '<span class="crown">♛</span>' : '') +
        '<span class="avatar ' + esc(r.cls) + '">' + esc(r.avatar) + '</span><b>' + esc(r.name) + '</b><span>' + esc(r.tag.split(' · ')[0]) + '</span><strong>' + esc(r.value) + '</strong></div>';
    }).join('');
    var rest = RANKS.slice(3).map(function (r, i) { return rankRow(r, i + 3); }).join('');
    return '<div class="page-head"><div><div class="page-kicker">LEADERBOARD</div><h1 class="page-title">高手排行</h1><div class="page-sub">演示榜单 · 每日更新样例</div></div><span class="demo-pill">MOCK</span></div>' +
      '<div class="podium">' + podium + '</div><div class="rank-list">' + rest + '</div>' +
      '<div class="more-row"><button class="btn btn-ghost" type="button" data-demo="榜单为演示内容，关注功能暂未开放">关注榜单</button></div>' +
      '<div class="mini-note">排名、连中与命中率均为虚构样例，不构成任何建议。</div>';
  }

  function mePage() {
    return '<div class="page-head"><div><div class="page-kicker">PROFILE</div><h1 class="page-title">我的</h1><div class="page-sub">游客模式 · 演示账号</div></div></div>' +
      '<section class="profile"><span class="avatar">游</span><div class="profile-main"><b>游客</b><span>登录后同步你的偏好设置</span><span class="tag">DEMO ACCOUNT</span></div><button class="btn btn-ghost" type="button" data-demo="登录功能为演示占位，暂不提供真实账号">登录</button></section>' +
      '<div class="balance"><div class="balance-main"><span>演示余额</span><b>¥ 0.00</b></div><button class="btn btn-primary" type="button" data-demo="充值功能为演示占位，敬请期待">充值</button></div>' +
      '<div class="menu">' +
      '<button class="menu-row" type="button" data-demo="安全中心为演示入口"><span class="menu-ico">⌁</span><span class="txt">安全中心</span><em>演示</em><span class="arrow">›</span></button>' +
      '<button class="menu-row" type="button" data-demo="消息中心为演示入口"><span class="menu-ico">◌</span><span class="txt">消息中心</span><em>0 条</em><span class="arrow">›</span></button>' +
      '<button class="menu-row" type="button" data-demo="客服为演示入口"><span class="menu-ico">?</span><span class="txt">帮助与客服</span><em>演示</em><span class="arrow">›</span></button>' +
      '<button class="menu-row" type="button" data-demo="关于页面：演示站点，数据为样例"><span class="menu-ico">i</span><span class="txt">关于本站</span><em>v0.1</em><span class="arrow">›</span></button>' +
      '</div>' +
      '<div class="mini-note">这是纯展示空壳站，不提供真实账号、充值、提现或下注服务。</div>';
  }

  var ROUTES = { lotteryhall: hallPage, history: historyPage, trend: trendPage, rank: rankPage, me: mePage };
  var TITLES = { lotteryhall: '彩票大厅', history: '开奖记录', trend: '号码走势', rank: '高手排行', me: '我的' };

  function routeName() {
    var h = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return ROUTES[h] ? h : 'lotteryhall';
  }

  function setActiveTab(name) {
    $$('.tabbar a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-tab') === name);
    });
  }

  function render() {
    var name = routeName();
    var view = $('#view');
    if (!view) return;
    view.innerHTML = ROUTES[name]();
    setActiveTab(name);
    document.title = TITLES[name] + ' · 幸运大厅（演示）';
    window.scrollTo(0, 0);
    if (name === 'lotteryhall') {
      // no-op: hall is fully static after render
    }
  }

  function showToast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg || '演示功能，敬请期待';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function showModal(msg) {
    var modal = $('#modal');
    if (!modal) return;
    $('#modal-body').textContent = msg || '当前为展示站点，不提供充值、下注或账号登录。';
    modal.hidden = false;
  }

  function closeModal() {
    var modal = $('#modal');
    if (modal) modal.hidden = true;
  }

  document.addEventListener('click', function (e) {
    var demo = e.target.closest('[data-demo]');
    if (demo) {
      e.preventDefault();
      showModal(demo.getAttribute('data-demo'));
      return;
    }
    if (e.target.closest('[data-close-modal]')) {
      closeModal();
      return;
    }
    var hf = e.target.closest('[data-history-filter]');
    if (hf) {
      HISTORY_FILTER = hf.getAttribute('data-history-filter');
      render();
      return;
    }
    var tg = e.target.closest('[data-trend-game]');
    if (tg) {
      TREND_GAME = tg.getAttribute('data-trend-game');
      render();
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/lotteryhall';
  render();
})();
