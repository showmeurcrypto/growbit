require("dotenv").config();

const CrashSeed = require("../database/models/CrashSeed");

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const crypto = require("crypto");

const NUMBER_OF_CRASH_SEEDS = 1000000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      authSource: "",
      user: "",
      pass: "",
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 30000,
    });

    console.log("connected");
  } catch (err) {
    console.error(err);
  }
};

async function generateCrashSeeds() {
  console.log("Deleting existing seeds");

  await CrashSeed.deleteMany({});

  console.log("Generating crash seeds");
  let batch = [];
  let hash = null;
  let previousHash = null;

  let start = new Date().getTime();

  for (let index = 0; index < NUMBER_OF_CRASH_SEEDS; index++) {
    if (previousHash) {
      hash = crypto
        .createHash("sha256")
        .update(previousHash.toString())
        .digest("hex");
    } else {
      //First seed
      hash = crypto.randomBytes(24).toString("hex");
    }
    batch.push({
      previousHash,
      index,
      seedServer: hash,
    });
    if (batch.length === 500) {
      await CrashSeed.insertMany(batch);
      //await new Promise(resolve => setTimeout(resolve, 2000))
      batch = [];
    }
    previousHash = hash;
  }

  if (batch.length) {
    await CrashSeed.insertMany(batch);
  }

  let elapsed = (new Date().getTime() - start) / 1000;
  console.log(`Crash seeds generated in ${elapsed}s`);
}

(async () => {
  try {
    await connectDB();
    await generateCrashSeeds();
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
})();
