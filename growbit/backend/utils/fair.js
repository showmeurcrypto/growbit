const fetch = require("node-fetch");
const NodeCache = require("node-cache");

const cache = new NodeCache({ checkperiod: 3 });

const fairGetData = async () => {
  const cacheKey = "fair_get_data";

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return { success: true, data: cachedData };
  }

  const response = await fetch("https://eos.greymass.com/", {
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data = await response.json();
    cache.set(cacheKey, data, 3); // Cache for 3 sec
    return { success: true, data };
  } else {
    throw new Error("Failed to fetch data");
  }
};

const fairGetBlockData = async (blockNum) => {
  const cacheKey = `block_${blockNum}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return { success: true, data: cachedData };
  }

  const response = await fetch("https://eos.greymass.com/v1/chain/get_block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ block_num_or_id: blockNum }),
  });

  if (response.ok) {
    const data = await response.json();
    cache.set(cacheKey, data, 30); // Cache for 30 sec
    return { success: true, data };
  } else {
    throw new Error("Failed to fetch block data");
  }
};

module.exports = {
  fairGetData,
  fairGetBlockData,
};
