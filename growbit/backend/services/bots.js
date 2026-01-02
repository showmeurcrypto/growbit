const User = require("../database/models/User");
const UserSeed = require("../database/models/UserSeed");

const { logger } = require("../utils/logger");
const Plinko = require("../services/plinko/plinko");
const Dice = require("../services/dice");
const Keno = require("../services/keno");
const Mines = require("../services/mines");

const crypto = require("crypto");
const botName = "laurix34";

const games = ["plinko", "dice", "keno", "mines"];

async function init(io) {
  //TODO: remove bot game history from db
  try {
    let user = await User.findOne({ username: botName }).exec();

    if (!user) {
      user = await User.create({
        username: botName,
        anonymous: true,
        rank: "admin",
        local: {
          email: "",
          password: crypto.randomBytes(15).toString("hex"),
        },
        limits: {
          betToWithdraw: 999999999999,
          blockLeaderboard: true,
        },
        balance: 9999,
        affiliates: {
          referrer: null,
        },
        ips: [],
        avatar: Math.floor(Math.random() * 10) + 1,
      });
    }

    await resetSeed(user);
    await play(user, io);
  } catch (e) {
    logger.error(e);
  }
}

async function resetSeed(user) {
  let seedServer = crypto.randomBytes(24).toString("hex");
  let seedClient = crypto.randomBytes(8).toString("hex");
  let hash = crypto.createHash("sha256").update(seedServer).digest("hex");

  await UserSeed.updateOne(
    { user: user._id },
    {
      $set: {
        seedClient,
        seedServer,
        hash,
        nonce: Math.floor(Math.random() * 200) + 146,
        state: "active",
      },
    },
    { upsert: true },
  );
}

async function play(user, io) {
  try {
    let callback = () => {};

    user.balance = 9999;
    let numberOfRounds = Math.floor(Math.random() * 20) + 20;
    let game = games[Math.floor(Math.random() * 3)];

    let params = { amount: (Math.floor(Math.random() * 20) + 1) * 0.1 };

    if (game === "plinko") {
      params.rows = Math.floor(Math.random() * 6) + 9;
      params.risk = ["low", "medium", "high"][Math.floor(Math.random() * 3)];
    } else if (game === "dice") {
      params.target = Math.floor(Math.random() * 70) + 6;
    } else if (game === "keno") {
      params.picks = [];
      for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
        const rnd = Math.floor(Math.random() * 40) + 1;
        if (params.picks.includes(rnd)) {
          i--;
          continue;
        }
        params.picks.push(rnd);
      }
    } else if (game === "mines") {
      params.minesCount = 5;
      params.minesTiles = [0];
      const numbers = Array.from({ length: 25 }, (_, i) => i);
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      params.minesTiles = numbers.slice(0, params.minesCount);
    }

    for (let i = 0; i < numberOfRounds; i++) {
      if (game === "plinko") {
        await Plinko.playPlinko(
          user,
          params.amount,
          params.rows,
          params.risk,
          io,
        );
      } else if (game === "dice") {
        await Dice.play(user, params.target, params.amount, io);
      } else if (game === "keno") {
        await Keno.play(user, params.picks, params.amount, "auto", io);
      } else if (game === "mines") {
        let data = {
          amount: params.amount,
          tiles: params.minesTiles,
          minesCount: params.minesCount,
        };

        const amount = data.amount;
        const minesCount = Math.floor(data.minesCount);

        await Mines.minesAutobet(
          io,
          { decoded: { _id: user._id } },
          user,
          data,
          callback,
        );
      }

      const t = (Math.random() * 60 + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, t));
    }

    await resetSeed(user);
    await play(user, io);
  } catch (e) {
    logger.error(e);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await play(user, io);
  }
}

module.exports = { init };
