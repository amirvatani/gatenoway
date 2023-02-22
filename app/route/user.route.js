const { authJwt } = require("../middleware");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { transactionLogger } = require("../util/logger.js");
const db = require("../model");
const { filtering } = require("../constant/filtering");
const { checkFiltering } = require("../middleware/checkFiltering");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const modifyResponse = require("node-http-proxy-json");
var validate = require("jsonschema").validate;
const {
  PROXY_URL,
  SKIP_SSL_VERIFICATION,
  TO_MANY_REQUEST_MESSAGE,
  TO_MANY_REQUEST_TIME,
  CONTRACT_NOT_SATISFY_ORIGIN_MESSAGE,
} = require("../constant/environment");

const { checkContract } = require("../middleware/checkContract");
const History = db.history;

module.exports = function (app) {
  app.use(function (_, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const destinationURL = PROXY_URL;

  const limiter = rateLimit({
    standardHeaders: true,
    windowMs: parseInt(TO_MANY_REQUEST_TIME),
    max: async (request, _) => {
      return request.rateLimit;
    },
    onLimitReached: (_, response) => {
      return response.status(429).json({
        message: TO_MANY_REQUEST_MESSAGE,
      });
    },
    handler: (_, response) => {
      return response.status(429).json({
        message: TO_MANY_REQUEST_MESSAGE,
      });
    },
  });

  app.use(
    "*",
    [authJwt.verifyToken],
    limiter,
    [checkContract],
    [checkFiltering],
    createProxyMiddleware({
      target: destinationURL,
      changeOrigin: true,
      secure: SKIP_SSL_VERIFICATION == "true",
      logLevel: "debug",
      onError: function onError(err, req, res, target) {
        const id = crypto.randomBytes(16).toString("hex");
        transactionLogger.error(
          "new error : " + JSON.stringify(err) + " Ray ID : " + id
        );
        res.writeHead(502, {
          "Content-Type": "text/plain",
        });
        res.end("Something went wrong.  \r\n Ray ID : " + id);
      },
      onProxyReq: (_, request) => {
        const {
          rawHeaders,
          remoteAddress,
          httpVersion,
          method,
          headers,
          body,
          params,
          query,
          url,
        } = request;

        History.create({
          userId: request.userId,
          rawHeaders: JSON.stringify(rawHeaders),
          remoteAddress: JSON.stringify(remoteAddress),
          httpVersion: JSON.stringify(httpVersion),
          method: JSON.stringify(method),
          headers: JSON.stringify(headers),
          body: JSON.stringify(body),
          params: JSON.stringify(params),
          query: JSON.stringify(query),
          url: JSON.stringify(url),
          path:
            request.protocol +
            "://" +
            request.get("host") +
            request.originalUrl,
          timestamp: new Date().toISOString(),
        });
      },
      onProxyRes(proxyRes, req, res) {
        modifyResponse(
          res,
          proxyRes.headers["content-encoding"],
          function (body) {
            if (body && req.contract.response) {
              const validation = validate(
                JSON.parse(JSON.stringify(body)),
                JSON.parse(req.contract.response)
              );
              if (!validation.valid) {
                body = {
                  message: CONTRACT_NOT_SATISFY_ORIGIN_MESSAGE,
                };
              }
            }

            const wholeText = JSON.stringify({
              headers: res.headers,
              method: res.method,
              url: res.url,
              httpVersion: res.httpVersion,
              body,
              cookies: res.cookies,
              path: res.path,
              protocol: res.protocol,
              query: res.query,
              params: res.params,
              hostname: res.hostname,
              ip: res.ip,
              originalUrl: res.originalUrl,
              params: res.params,
            });
            let status = false;
            filtering.forEach((i) => {
              if (wholeText.includes(i)) {
                status = i;
              }
            });
            if (status) {
              body = {
                message: "something illegal found in origin server response",
              };
            }
            delete req.contract;
            delete req.userRoles;
            return body;
          }
        );
      },
    })
  );
};
