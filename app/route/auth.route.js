const rateLimit = require("express-rate-limit");
/*************/
const { verifySignUp } = require("#middleware/index");
const controller = require("#controller/auth.controller");
const {TO_MANY_REQUEST_MESSAGE,TO_MANY_REQUEST_TIME} = require("../constant/environment")

module.exports = function (app) {
  app.use(function (_, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const limiter = rateLimit({
    standardHeaders: true,
    windowMs: parseInt(TO_MANY_REQUEST_TIME),
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
    max: async () => {
      return 5;
    },
  });

  app.post(
    "/api/auth/signup",
    limiter,
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post("/api/auth/signin", limiter, controller.signin);
};
