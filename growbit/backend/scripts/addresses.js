require("dotenv").config();

const CryptoAddress = require("../database/models/CryptoAddress");

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      authSource: "admin",
      user: "admin",
      pass: "admin",
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 30000,
    });

    console.log("connected");
  } catch (err) {
    console.error(err);
  }
};

const axios = require("axios");
const url = "https://api.oxapay.com/merchants/revoke/staticaddress";

const oxaKey = process.env.OXAPAY_MERCHANT_API_KEY;
async function getAddresses() {
  if (!oxaKey) return;

  let list = await CryptoAddress.find({});

  let cnt = 0;
  for (let addr of list) {
    try {
      const { data } = await axios.post(url, {
        merchant: oxaKey,
        address: addr.address,
      });

      console.log(data.result);

      cnt++;
      console.log(cnt);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (e) {
      console.error(e);
    }
  }
}

(async () => {
  try {
    await connectDB();
    await getAddresses();
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
})();
