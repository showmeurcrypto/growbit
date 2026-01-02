module.exports = (io) => {
  require("./general")(io);
  require("./games/crash")(io);
  require("./games/mines")(io);
  require("./games/plinko")(io);
  require("./games/slide")(io);
  require("./games/towers")(io);
  require("./games/coinflip")(io);
  require("./games/unbox")(io);
  require("./games/battles")(io);
  require("./cashier")(io);
  require("./admin")(io);
  require("./support_chat")(io);
};
