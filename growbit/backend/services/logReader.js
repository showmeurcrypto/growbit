const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const logDir = path.join(process.cwd(), "logs");

function getFilesFromDisk() {
  return new Promise((resolve, reject) => {
    fs.readdir(logDir, (err, files) => {
      if (err) {
        return reject("Error reading directory");
      }

      const fileStats = files
        .filter((file) => !file.endsWith(".gz") && !file.includes("audit"))
        .map((file) => {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          return {
            type: file.includes("error") ? "error" : "log",
            name: file,
            time: stats.mtime.getTime(),
          };
        });

      fileStats.sort((a, b) => b.time - a.time);

      resolve(fileStats);
    });
  });
}

function readLogFile(fileName, limit = 50, search = "") {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(logDir, fileName);
    let command;

    if (search) {
      command = `grep -Ei "${search.replace(/"/g, '\\"')}" "${fullPath}" | cat`;
    } else {
      command = `tail -n ${limit} "${fullPath}"`;
    }

    exec(command, (err, stdout, stderr) => {
      if (err) return reject(`Error executing command: ${stderr}`);

      const logs = stdout.split("\n").filter(Boolean).slice(0, limit);

      resolve(logs);
    });
  });
}

module.exports = { getFilesFromDisk, readLogFile };
