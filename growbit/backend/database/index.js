const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

mongoose.set("strictQuery", true);
mongoose.set("autoIndex", true);

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

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
