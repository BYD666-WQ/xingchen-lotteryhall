/* 彩票大厅 API 门面：所有积分/注单操作只走 Appwrite Function。
 * - enabled=true：Functions.createExecution({functionId, path, method, body})
 *   Function 返回 JSON（HTTP 语义由 responseStatusCode 表达）。
 * - enabled=false：本地 mock，仅用于未接 Function 时的预览（不写任何远端）。
 * 对外：LotteryAPI.call(path, {method, body}) -> Promise<data>
 */
(function () {
  'use strict';
  var CFG = window.LH_API || {};
  var MOCK_KEY = 'lh-mock-state-v1';
  var mock = null;

  function loadMock() {
    if (mock) return mock;
    try { mock = JSON.parse(localStorage.getItem(MOCK_KEY) || 'null'); } catch (e) { mock = null; }
    if (!mock) {
      var low = /(^|[?&])mock=low(&|$)/.test(location.search);
      mock = { username: '预览玩家', points: low ? 3 : 10000, bets: [], seq: 1, settleAt: 0 };
      saveMock();
    }
    return mock;
  }
  function saveMock() { try { localStorage.setItem(MOCK_KEY, JSON.stringify(mock)); } catch (e) {} }

  function ApiError(status, message, data) {
    var e = new Error(message || ('请求失败 (' + status + ')'));
    e.status = status; e.data = data; e.apiError = true;
    return e;
  }

  function parse(text) {
    if (text == null) return null;
    if (typeof text === 'object') return text;
    try { return JSON.parse(String(text)); } catch (e) { return { raw: String(text) }; }
  }

  function mockCall(path, opts) {
    var m = loadMock();
    var body = (opts && opts.body) || {};
    // 到点结算（预览用）：让 pending 在 20 秒后变成已结算
    if (m.settleAt && Date.now() > m.settleAt) {
      m.bets.forEach(function (b) { if (b.status === 'pending') { b.status = 'settled'; b.payout = 0; } });
      m.settleAt = 0; saveMock();
    }
    if (path === '/me') return Promise.resolve({ username: m.username, points: m.points, role: 'user' });
    if (path === '/games') return Promise.resolve({ games: [], odds: null });
    if (path === '/bets') return Promise.resolve({ bets: m.bets.slice(0, 50) });
    if (path === '/bet') {
      var stake = Math.max(0, Math.round(Number(body.stake) || 0));
      if (stake <= 0) return Promise.reject(ApiError(400, '下注积分无效'));
      if (stake > m.points) return Promise.reject(ApiError(400, '积分不足，无法投注（当前 ' + m.points + '，需要 ' + stake + '）'));
      m.points -= stake;
      var b = {
        id: 'mock-' + (m.seq++), username: m.username, gameId: body.gameId || '',
        picks: Array.isArray(body.picks) ? body.picks : [], stake: stake,
        status: 'pending', payout: 0, issue: body.issue || '', createdAt: Date.now()
      };
      m.bets.unshift(b);
      m.settleAt = Date.now() + 20000;
      saveMock();
      return Promise.resolve({ bet: b, points: m.points });
    }
    return Promise.reject(ApiError(404, '未知接口：' + path));
  }

  var jwtProvider = null;
  function setJwtProvider(fn) { jwtProvider = fn; }
  async function resolveJwt() {
    if (typeof jwtProvider !== 'function') return '';
    try { var v = await jwtProvider(); return v ? String(v) : ''; } catch (e) { return ''; }
  }
  function call(path, opts) {
    opts = opts || {};
    var method = String(opts.method || 'GET').toUpperCase();
    var body = opts.body || null;
    if (!CFG.enabled || !CFG.functionId) return mockCall(path, opts);
    var fns = window.__lhFunctions;
    if (!fns) {
      var client = new window.Appwrite.Client().setEndpoint(CFG.endpoint).setProject(CFG.project);
      fns = window.__lhFunctions = new window.Appwrite.Functions(client);
    }
    var exec = (async function () {
      var jwt = await resolveJwt();
      var headers = jwt ? { 'x-user-jwt': jwt } : undefined;
      return fns.createExecution({
        functionId: CFG.functionId,
        xpath: path,
        method: method,
        body: body == null ? undefined : JSON.stringify(body),
        headers: Object.assign({}, opts.headers || {}, headers || {}),
        async: false
      });
    })();
    var timer = new Promise(function (_, reject) {
      setTimeout(function () { reject(ApiError(0, '请求超时，请稍后重试')); }, Number(CFG.timeoutMs) || 20000);
    });
    return Promise.race([exec, timer]).then(function (r) {
      var code = Number(r && r.responseStatusCode) || 0;
      var data = parse(r && r.responseBody);
      if (code >= 400 || code === 0) {
        var errObj = (data && data.error) || null;
        var msg = (errObj && (errObj.message || errObj.code)) || (data && (data.message || data.error)) || ('服务异常（' + code + '）');
        throw ApiError(code, msg, data);
      }
      return data || {};
    });
  }

  window.LotteryAPI = { call: call, setJwtProvider: setJwtProvider, isMock: function () { return !CFG.enabled || !CFG.functionId; }, config: CFG };
})();
