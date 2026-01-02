require("dotenv").config();

const SlideSeed = require("../database/models/SlideSeed");

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const crypto = require("crypto");

const NUMBER_OF_SLIDE_SEEDS = 1000000;

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

async function generateSlideSeeds() {
  console.log("Deleting existing seeds");

  await SlideSeed.deleteMany({});

  console.log("Generating slide seeds");
  let batch = [];
  let hash = null;
  let previousHash = null;

  let start = new Date().getTime();

  for (let index = 0; index < NUMBER_OF_SLIDE_SEEDS; index++) {
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
      await SlideSeed.insertMany(batch);
      //await new Promise(resolve => setTimeout(resolve, 2000))
      batch = [];
    }
    previousHash = hash;
  }

  if (batch.length) {
    await SlideSeed.insertMany(batch);
  }

  let elapsed = (new Date().getTime() - start) / 1000;
  console.log(`Slide seeds generated in ${elapsed}s`);
}

(async () => {
  try {
    await connectDB();
    await generateSlideSeeds();
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
})();
