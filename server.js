const {IS_DEVELOPMENT} = require("#constant/environment")
const {serverBoot} = require("#service/serverBoot");
const cluster = require("node:cluster");
const process = require("node:process");

const totalCPUs = IS_DEVELOPMENT ? 1 :require("node:os").cpus().length;


if (cluster.isMaster) {
  console.log(`Number of CPUs is ${require("node:os").cpus().length} (1 core will be use in development)`);
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
    serverBoot.startService(cluster)
}
