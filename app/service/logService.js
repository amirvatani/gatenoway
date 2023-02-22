var fs = require("fs");
var path = require("path");
var archiver = require("archiver");
const {ZIP_LOG_FILES_LIMIT} = require("#constant/environment")

function zipDirectory(sourceDir, outPath) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => {
        reject(err);
        console.log(err);
      })
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

let isArchiving = false;

function startLogWatcher() {
  try {
    fs.watchFile("./logs/gateway.log", function () {
      fs.stat("./logs/gateway.log", async function (err, stats) {
        if (err) {
          return setTimeout(() => {
            startLogWatcher();
          }, 3000);
        }

        if (stats.size > ZIP_LOG_FILES_LIMIT) {
          if (!isArchiving) {
            isArchiving = true;

            console.log("start backup from archive " + new Date());
            //*************************//
            const date = new Date();

            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();

            // This arrangement can be altered based on how we want the date's format to appear.
            let currentDate = `${day}-${month}-${year}-${hours}-${minutes}`;

            var zipDirectoryPath = path.resolve(
              process.cwd() + `/archives/${currentDate}.zip`
            );
            var logPath = path.resolve(process.cwd() + "/logs");
            var logFilePath = path.resolve(process.cwd() + "/logs/gateway.log");

            await zipDirectory(logPath, zipDirectoryPath);
            console.log("finished backup from archive " + new Date());

            console.log("start removing old log file " + new Date());
            isArchiving = false;

            fs.closeSync(fs.openSync(logFilePath, "w"));

            console.log("backup process done successfully " + new Date());

            //************************//
          }
        }
      });
    });
  } catch (e) {}
}

function changeDefaultLoggers() {
  const defaultLogger = console.log;
  console.log = (itemForLog) => {
    if (typeof itemForLog === "array") {
      defaultLogger(`[ ${new Date().toLocaleString()} ]  \r\n`);
      console.table(itemForLog + "\r\n");
      defaultLogger("************\r\n\r\n");
    } else {
      defaultLogger(
        `[ ${new Date().toLocaleString()} ] ${itemForLog} \r\n\r\n************\r\n`
      );
    }
  };
}

module.exports = {
  startLogWatcher,
  changeDefaultLoggers,
};
