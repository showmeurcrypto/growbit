require("dotenv").config();

const CryptoAddress = require("../database/models/CryptoAddress");
const mongoose = require("mongoose");
const axios = require("axios");

mongoose.set("strictQuery", true);

const LIST_URL = "https://api.oxapay.com/merchants/list/staticaddress";
const REVOKE_URL = "https://api.oxapay.com/merchants/revoke/staticaddress";
const MERCHANT_KEY = process.env.OXAPAY_MERCHANT_API_KEY;
const PAGE_SIZE = 100;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      authSource: "admin",
      user: "admin",
      pass: "admin",
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection error", err);
    process.exit(1);
  }
};

let revoked = 0;
let failed = 0;
async function revokeAddress(address) {
  try {
    const { data } = await axios.post(REVOKE_URL, {
      merchant: MERCHANT_KEY,
      address: address,
    });
    if (data.result === 100) {
      console.log("revoked");
      revoked++;
    } else {
      failed++;
      console.error(data.message);
    }
  } catch (e) {
    failed++;
    console.error("Error");
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function revokeNotUsed() {
  if (!MERCHANT_KEY) return console.error("OXAPAY_MERCHANT_API_KEY missing");

  const dbAddresses = await CryptoAddress.find({})
    .distinct("address")
    .select("address")
    .lean()
    .exec();

  const addressesInDb = new Set(
    dbAddresses.map((a) => a.address).filter(Boolean),
  );

  if (addressesInDb.size < 500) {
    console.error("Unexpected address set size");
    return;
  }

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    try {
      const { data } = await axios.post(LIST_URL, {
        merchant: MERCHANT_KEY,
        size: PAGE_SIZE,
        page: page,
      });

      if (data.result !== 0) {
        console.error(
          `Failed to fetch addresses on page ${page}: ${data.message}`,
        );
        break;
      }

      let addresses = data.data;

      for (let addr of addresses) {
        const address = addr.address;

        if (!addressesInDb.has(address)) {
          await revokeAddress(address);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      totalPages = data.meta.pages;
      page++;
    } catch (e) {
      console.error(`Error fetching page ${page}`, e);
      break;
    }
  }

  console.log("revoked", revoked);
  console.log("failed to revoke", failed);
}

(async () => {
  try {
    await connectDB();
    await revokeNotUsed();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
