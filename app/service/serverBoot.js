const express = require("express");
const cors = require("cors");
const cluster = require("node:cluster");
const process = require("node:process");
const helmet = require("helmet");
const limits = require("limits");
/*************/
const { PORT } = require("#constant/environment");
const db = require("#model/index");
const { getAdminPanelRouter } = require("#service/adminPanel");
const { LIMITER_CONFIG, CORS_URL } = require("#constant/limiter");
const monitor = require("express-status-monitor");
const { startLogWatcher, changeDefaultLoggers } = require("./logService");

function startService() {
  const app = express(cluster);
  const { admin, adminRouter } = getAdminPanelRouter();

  app.use(admin.options.rootPath, adminRouter);
  app.use(helmet());
  app.use(limits(LIMITER_CONFIG));
  app.use(
    cors({
      origin: CORS_URL,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    monitor({
      title: "monitor of worker " + cluster.worker.id,
    })
  );
  db.sequelize.sync();

  app.get("/", (req, res) => {
    res.json({ message: "Welcome to GateWay application." });
  });

  require("#route/auth.route")(app);
  require("#route/user.route")(app);

  app.listen(PORT || 8080, () => {
    console.log(`
            
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    ██░▄▄░█░▄▄▀█▄░▄█░▄▄█░▄▄▀█▀▄▄▀█░███░█░▄▄▀█░██░██
    ██░█▀▀█░▀▀░██░██░▄▄█░██░█░██░█▄▀░▀▄█░▀▀░█░▀▀░██
    ██░▀▀▄█▄██▄██▄██▄▄▄█▄██▄██▄▄███▄█▄██▄██▄█▀▀▀▄██
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
            
                                              \r\nVersion : 1.0.0 `);
    console.log(`Server is running on port : ${PORT}`);
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
  startLogWatcher();
  changeDefaultLoggers();
}

module.exports = {
  serverBoot: {
    startService,
  },
};
