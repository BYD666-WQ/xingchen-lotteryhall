/* 彩票大厅 · 新后端账号 API（Phase 1，2026-11-28）
 * 替代 Appwrite Account：注册 / 登录 / me / 本地 token。
 * 后端：https://198.13.51.135.sslip.io（CORS: *，HTTPS）
 * 约定：register → 201 {ok,user}；login → 200 {ok,token,user}；me → 200 {ok,user}
 *      user = {id,username,email,balance,created_at}
 */
(function () {
  'use strict';
  var CFG = window.LH_AUTH || {};
  var BASE = String(CFG.base || 'https://198.13.51.135.sslip.io').replace(/\/+$/, '');
  var TOKEN_KEY = 'lh-auth-token-v1';

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { if (t) localStorage.setItem(TOKEN_KEY, String(t)); else localStorage.removeItem(TOKEN_KEY); } catch (e) {} }
  function clear() { setToken(''); }

  var CODE_TEXT = {
    INSUFFICIENT_BALANCE: '余额不足，无法完成投注',
    AUTH_REQUIRED: '请先登录',
    INVALID_AMOUNT: '投注金额不正确',
    INVALID_PICKS: '请选择投注号码',
    GAME_ISSUE_REQUIRED: '期号信息缺失，请刷新后重试',
    UNKNOWN_GAME: '该彩种暂不支持投注',
    EMAIL_EXISTS: '该邮箱已注册',
    INVALID_EMAIL: '邮箱格式不正确',
    USERNAME_TAKEN: '该用户名已被占用',
    INVALID_USERNAME: '用户名需 3-20 位字母/数字/下划线',
    USERNAME_REQUIRED: '请输入用户名',
    INVALID_PASSWORD: '密码需 8-72 位',
    INVALID_CREDENTIALS: '邮箱或密码不正确',
    WINDOW_CLOSED: '该期已封盘，无法投注'
  };
  function apiError(status, code, message, data) {
    var e = new Error(message || ('请求失败（' + status + '）'));
    e.status = status; e.code = code || ''; e.data = data || null;
    return e;
  }

  async function request(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers.Authorization = 'Bearer ' + t;
    var res;
    try {
      res = await fetch(BASE + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body == null ? undefined : JSON.stringify(opts.body)
      });
    } catch (e) {
      throw apiError(0, 'NETWORK', '网络连接失败，请检查网络后重试');
    }
    var text = '';
    try { text = await res.text(); } catch (e) {}
    var data = null;
    if (text) { try { data = JSON.parse(text); } catch (e) { data = null; } }
    if (!res.ok) {
      var rawErr = data && data.error;
      var code = '', msg = '';
      if (typeof rawErr === 'string') code = rawErr;
      else if (rawErr && typeof rawErr === 'object') { code = String(rawErr.code || ''); msg = String(rawErr.message || ''); }
      if (!msg && data && typeof data.message === 'string') msg = data.message;
      if (!msg) msg = CODE_TEXT[code] || ('请求失败（' + res.status + '）');
      if (res.status === 401 && path !== '/api/login') {
        try { window.dispatchEvent(new CustomEvent('lh-auth-unauthorized')); } catch (e) {}
      }
      throw apiError(res.status, code, msg, data);
    }
    return data || {};
  }

  window.LHAuth = {
    base: BASE,
    getToken: getToken,
    setToken: setToken,
    clear: clear,
    isLoggedIn: function () { return !!getToken(); },
    register: function (username, password) {
      return request('/api/register', { method: 'POST', body: { username: username, password: password } });
    },
    login: async function (username, password) {
      var d = await request('/api/login', { method: 'POST', body: { username: username, password: password } });
      if (d && d.token) setToken(d.token);
      return d;
    },
    me: function () { return request('/api/me', { method: 'GET' }); },
    api: function (path, opts) { return request(path, opts); },
    bets: function () { return request('/api/bets', { method: 'GET' }); },
    placeBet: function (bet) { return request('/api/bets', { method: 'POST', body: bet }); },
    issue: function (game) { return request('/api/issues?game=' + encodeURIComponent(game), { method: 'GET' }); },
    cancelBet: function (id) { return request('/api/bets/' + encodeURIComponent(id) + '/cancel', { method: 'POST' }); },
    results: function (game, limit) { return request('/api/results?game=' + encodeURIComponent(game) + '&limit=' + (limit || 12), { method: 'GET' }); },
    leaderboard: function (limit) { return request('/api/leaderboard?limit=' + (limit || 20), { method: 'GET' }); },
    logout: function () { clear(); }
  };

  // 旧 Function 门面已下线：保留同名对象，避免遗留调用直接 TypeError；任何调用都会收到「迁移中」。
  if (!window.LotteryAPI) {
    window.LotteryAPI = {
      call: function () { return Promise.reject(new Error('注单功能迁移中')); },
      isMock: function () { return false; },
      setJwtProvider: function () {},
      config: {}
    };
  }
})();
