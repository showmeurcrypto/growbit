const NodeCache = require("node-cache");
const SlotData = require("../../database/models/SlotData");
const axios = require("axios");
const ExcelJS = require("exceljs");
const { logger } = require("../../utils/logger");
let availableProviders = new Set();
const disabledProviders = new Set();
const slotCache = new NodeCache();

let slotDataMap = new Map();
let slotNameMap = new Map();
let slotegatorRTP = new Map();

async function initSlotData() {
  const slotData = await SlotData.findOne({});

  if (slotData) {
    const data = slotData.data;

    const disabledProvidersDb = slotData.disabledProviders;

    if (disabledProvidersDb) {
      for (let p of disabledProvidersDb) {
        disabledProviders.add(p);
      }
    }

    for (const [key, value] of Object.entries(data)) {
      slotDataMap.set(key, value);
    }
  }
  await loadRTP();
  await getSlots();

  setInterval(
    async () => {
      await getSlots(true);
    },
    1000 * 60 * 4,
  );
}

async function loadRTP() {
  console.log("--- loading slots RTP ---");
  if (!process.env.SLOTEGATOR_RTP_FILE_NAME) {
    throw new Error("RTP file path missing!");
  }

  var workbook = new ExcelJS.Workbook();
  workbook.xlsx
    .readFile(process.env.SLOTEGATOR_RTP_FILE_NAME)
    .then(function () {
      workbook.eachSheet(function (workSheet, sheetId) {
        workSheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          currRow = workSheet.getRow(rowNumber);
          let name = currRow.getCell(1).value?.toString();
          let rtpCell = currRow.getCell(9).value;
          let rtp = parseRtp(rtpCell);
          if (name && rtp) {
            const convertedName = name.replace(/\s+/g, "").toLowerCase();
            slotegatorRTP.set(convertedName, rtp);
          }
        });
      });
    });
  logger.info("--- finished loading slots RTP ---");
}

function parseRtp(value) {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value;
  }

  if (!value) return 0.98;

  value = value.trim().replace(/\s+/g, "");

  if (!value) return 0.98;

  if (value.includes("%")) {
    // Handle percentage ranges and single percentages
    if (value.includes("-")) {
      const [min, max] = value
        .split("-")
        .map((v) => parseFloat(v.replace("%", "")) / 100);
      return (min + max) / 2;
    }
    return parseFloat(value.replace("%", "")) / 100;
  }

  let number = parseFloat(value);
  if (!number) return null;
  return number > 1 ? number / 100 : number;
}

function increasePopularity(gameId) {
  const curr = slotDataMap.get(gameId);

  if (curr) {
    slotDataMap.set(gameId, {
      ...curr,
      popularity: curr.popularity + 1,
    });
  } else {
    slotDataMap.set(gameId, {
      popularity: 0,
      firstSeen: new Date(),
    });
  }
}

async function getSlotName(gameId) {
  return slotNameMap.get(gameId);
}

function getProviders() {
  return {
    disabledProviders: Array.from(disabledProviders),
    allProviders: Array.from(availableProviders),
  };
}

function toggleProviderDisable(provider, io) {
  if (disabledProviders.has(provider)) {
    disabledProviders.delete(provider);
  } else {
    if (!availableProviders.has(provider)) {
      throw new Error("Unknown provider");
    }
    disabledProviders.add(provider);
  }

  getSlots(true);
  updateSlotData();

  return Array.from(disabledProviders);
}

async function getSlotPopularity(gameId) {
  return slotDataMap.get(gameId)?.popularity || 0;
}

function seen(gameId, name) {
  //console.log("Game: " + name + " RTP is: " + slotegatorRTP.get(name));
  if (!slotDataMap.has(gameId)) {
    slotDataMap.set(gameId, {
      popularity: 0,
      firstSeen: new Date(),
    });
  }
  slotNameMap.set(gameId, name);
}

async function updateSlotData() {
  const existingData = await SlotData.findOne({});

  const updatedData = Object.fromEntries(slotDataMap);

  let mergedData = updatedData;

  if (existingData) {
    mergedData = { ...existingData.data, ...updatedData };
  }

  await SlotData.findOneAndUpdate(
    {},
    { data: mergedData, disabledProviders: Array.from(disabledProviders) },
    { upsert: true },
  );
}

async function getSlots(forceRefresh = false) {
  if (forceRefresh || !slotCache.has("spinacGames")) {
    let spinac = [];
    // let providers = [];
    try {
      const requestBody = {
        api_login:
          process.env.WWG_API_LOGIN ||
          "7e30050a-3d06-463b-82a8-afb6e5202df6-364214",
        api_password: process.env.WWG_API_PASSWORD || "O5Dsq9VhXTxa",
        method: "getGameList",
        show_additional: true,
        show_systems: 0,
        list_type: 1,
        currency: "USD",
      };
      const apiUrl =
        process.env.WWG_API_URL ||
        "https://gs.aggregtr.com/api/system/operator";
      const response = await axios.post(apiUrl, requestBody);
      //logger.info("Logging WWG provider response");
      // console.log(response.data);

      if (response.data.error == 0) {
        let games = Object.values(response.data.response).map((game) => ({
          ...game,
          //  type: providers[i].code,
          isDisabled: false,
          isHidden: false,
          isPlaceholder: false,
          //    name: game.name,
          id: game.id_hash, // Used in getGame method as a parameter
          icon: "slots",
          //  category: ["slots"],
          releasedAt: "-",
          isMobile: null,
          //   image: game.image,
          houseEdge: getHouseEdgeForFrontend(game.name),
          popularity: getSlotPopularity(game.id_hash),
        }));

        availableProviders = new Set(games.map((g) => g.category));

        games = games.filter((game) => !disabledProviders.has(game.category));
        spinac.push(...games);
        //games.forEach((game) => if(!providers.contains(game.nam)){ })
      }

      if (spinac.length) {
        slotCache.set("spinacGames", spinac, 1800);
        spinac.forEach((game) => seen(game.id_hash, game.name));
      }
    } catch (e) {
      logger.error("Error fetching slots!", e.response?.status);
    }

    return spinac;
  } else {
    return slotCache.get("spinacGames");
  }
}

setInterval(
  () => {
    updateSlotData();
  },
  1000 * 60 * 60 * 6,
);

function validateSlotCode(code) {
  return slotDataMap.has(code);
}

function getRtp(name, defaultValue = 0.98) {
  if (typeof name !== "string") return defaultValue;

  const converted = name.replace(/\s+/g, "").toLowerCase();
  const value = slotegatorRTP.get(converted) || defaultValue;

  if (value > 1) {
    //Something went wrong
    return 0;
  }

  return value;
}

function getHouseEdgeForFrontend(name) {
  const rtp = getRtp(name, null);
  if (!rtp) return null;
  return (100 - rtp * 100).toFixed(2);
}

module.exports = {
  initSlotData,
  slotDataMap,
  getSlots,
  increasePopularity,
  getSlotName,
  getRtp,
  toggleProviderDisable,
  getProviders,
  validateSlotCode,
};
