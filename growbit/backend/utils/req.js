const { logger } = require("./logger");

function getIpFromReq(req) {
  let ip = req.headers["cf-connecting-ip"];

  if (!ip) {
    const xForwardedFor = req.headers["x-forwarded-for"];

    if (xForwardedFor) {
      ip = xForwardedFor.split(",")[0].trim();
    }
    logger.info("xForwardedFor:", xForwardedFor, ip);
  }

  if (!ip) {
    ip = req.socket.remoteAddress;
    logger.info("Ip is null:", ip);
  }

  return ip;
}

module.exports = {
  getIpFromReq,
};
