const { settingGet } = require("../utils/setting");
const { getSlots } = require("./slots/slot_data");
const { PLINKO_HOUSE_EDGE } = require("./plinko/payout_list");
const { KENO_HOUSE_EDGE, KENO_MAX_AMOUNT } = require("./keno");
const { DICE_HOUSE_EDGE } = require("./dice");
const { MINES_HOUSE_EDGE, MINES_MAX_AMOUNT } = require("../utils/games/mines");
const { SLIDE_HOUSE_EDGE, SLIDE_MAX_AMOUNT } = require("../utils/games/slide");
const { CRASH_HOUSE_EDGE, CRASH_MAX_AMOUNT } = require("../utils/games/crash");
const { TOWERS_HOUSE_EDGE } = require("../utils/games/towers");
const { MAX_WIN } = require("../utils/games/games");
const NodeCache = require("node-cache");

function getOriginals() {
  return [
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.mines?.enabled,
      name: "Mines",
      id: "mines",
      category: ["originals"],
      image: "\/img\/game\/mines.png",
      houseEdge: MINES_HOUSE_EDGE,
      maxBet: MINES_MAX_AMOUNT,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.reme?.enabled,
      name: "Reme",
      id: "reme",
      category: ["originals"],
      image: "\/img\/game\/reme.png",
      houseEdge: null,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.dice?.enabled,
      name: "Dice",
      id: "dice",
      category: ["originals"],
      image: "\/img\/game\/dice.png",
      houseEdge: DICE_HOUSE_EDGE,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.coinflip?.enabled,
      name: "Coinflip PvP",
      id: "coinflip",
      category: ["originals"],
      image: "\/img\/game\/coinflip.png",
      houseEdge: null,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.cases?.enabled,
      name: "Cases",
      id: "cases",
      category: ["originals"],
      image: "\/img\/game\/cases.png",
      houseEdge: null,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.plinko?.enabled,
      name: "Plinko",
      id: "plinko",
      category: ["originals"],
      image: "\/img\/game\/plinko.png",
      houseEdge: PLINKO_HOUSE_EDGE,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.keno?.enabled,
      name: "Keno",
      id: "keno",
      category: ["originals"],
      image: "\/img\/game\/keno.png",
      houseEdge: KENO_HOUSE_EDGE,
      maxBet: KENO_MAX_AMOUNT,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.towers?.enabled,
      name: "Towers",
      id: "towers",
      category: ["originals"],
      image: "\/img\/game\/towers.png",
      houseEdge: TOWERS_HOUSE_EDGE,
      maxBet: null,
      maxWin: MAX_WIN,
    },
    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.slide?.enabled,
      name: "Slide",
      id: "slide",
      category: ["originals"],
      image: "\/img\/game\/slide.png",
      houseEdge: SLIDE_HOUSE_EDGE,
      maxBet: SLIDE_MAX_AMOUNT,
      maxWin: MAX_WIN,
    },

    {
      type: "Originals",
      isDisabled: !settingGet()?.games?.crash?.enabled,
      name: "Crash",
      id: "crash",
      category: ["originals"],
      image: "\/img\/game\/crash.png",
      houseEdge: CRASH_HOUSE_EDGE,
      maxBet: CRASH_MAX_AMOUNT,
      maxWin: MAX_WIN,
    },
  ];
}

const POPULAR_SLOTS = new Set([
  "nolimit/Mental",
  // "hacksaw/WantedDeadoraWild",
  "nolimit/KennethMustDie",
  // "hacksaw/BladeMaster94",
  "pragmaticsg/GatesOfOlympus1",
  "nolimit/RockBottom",
  // "hacksaw/DuelatDawn",
  // "hacksaw/Densho",
  "pragmaticsg/BigBassMissionFishin",
  "nolimit/SanQuentin2",
  "nolimit/BruteForce",
  // "hacksaw/MerlinsAlchemy94",
  // "hacksaw/LeBandit",
  "pragmaticsg/TheBigDawgs",
]);

const GROWBIT_RECOMMENDS = new Set([
  "yggdrasil/RaptorDoublemax",
  "booming/CracktheBankHoldandWin",
  "spnmnl/CyclopsUnchained",
  "yggdrasil/ValleyoftheDeadOnlywinsBoltLock",
  "popiplay/MoneyMansion",
  "yggdrasil/PenguinCity",
  "evolution/Cupcakes",
  "booming/KimsWildJourney",
  "spnmnl/AgeOfCronus",
  "popiplay/SonsOfMonarchy",
  "booming/SpaceCowstotheMoon",
  "yggdrasil/DevourTheWeak",
  "evolution/RabidRandy",
]);

function getSlotPopularity(game) {
  let p = +game.popularity || 0;
  if (POPULAR_SLOTS.has(game.id)) {
    p += 50;
  }

  return p;
}

const homeGamesCache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 120 });

async function getHomeGames() {
  let cached = homeGamesCache.get("homeGames");
  let homeGames = null;

  if (cached) {
    homeGames = cached;
  } else {
    const slots = await getSlots();

    let popular = slots
      ?.filter((g) => !g.isDisabled)
      .sort((a, b) => getSlotPopularity(b) - getSlotPopularity(a))
      .slice(0, 10);

    let recommends = slots?.filter(
      (g) => !g.isDisabled && GROWBIT_RECOMMENDS.has(g.id),
    );

    let live = slots
      ?.filter((g) => !g.isDisabled && g.subcategory === "live")
      .slice(0, 20);

    homeGames = {
      popular,
      recommends,
      live,
      originals: getOriginals(),
    };
    homeGamesCache.set("homeGames", homeGames);
  }

  return homeGames;
}

async function getGames() {
  const spinac = await getSlots();
  const originals = getOriginals();
  return [...originals, ...spinac];
}

module.exports = {
  getGames,
  getHomeGames,
};
