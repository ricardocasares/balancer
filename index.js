const { createServer } = require("http");
const { createProxyServer } = require("http-proxy");
const { WeightedRoundRobinEngine } = require("awesome-balancer");

const cookieName = "x_stick_to";
const targets = JSON.parse(process.env.POOL);
const balancer = new WeightedRoundRobinEngine(mapToWeights(targets));
const proxy = createProxyServer();

createServer(handler).listen(3000);

function mapToWeights(entries) {
  return Object.keys(entries).map(target => ({
    object: { target },
    weight: entries[target]
  }));
}

function handler(req, res) {
  const cookie = parseCookies(req);
  const target = resolveProxyTarget(res, cookie);

  return proxy.web(req, res, { target, changeOrigin: true });
}

// based on https://github.com/sergiodxa/now-ab
function parseCookies(req) {
  const cookies = req.headers.cookie;

  if (!cookies) return {};

  return cookies.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    return { ...acc, [name.trim()]: value.trim() };
  }, {});
}

// based on https://github.com/sergiodxa/now-ab
function resolveProxyTarget(res, cookies = {}) {
  if (cookies[cookieName] && targets[cookies[cookieName]]) {
    return cookies[cookieName];
  }

  const { target } = balancer.pick();

  res.setHeader("Set-Cookie", [`${cookieName}=${target}`]);

  return target;
}
