require("dotenv").config();

const mongoose = require("mongoose");

const cryptoTransactionModel = require("../database/models/CryptoTransaction");
const Report = require("../database/models/Report");

mongoose.set("strictQuery", true);

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

async function updateReports() {
  try {
    const cryptoTransactions = await cryptoTransactionModel.find().exec();

    for (const transaction of cryptoTransactions) {
      const amountDSL = transaction.amount;

      if (
        transaction.user?.rank !== "admin" &&
        transaction.type === "deposit"
      ) {
        const transactionDate = transaction.createdAt
          .toISOString()
          .slice(0, 10);

        await Report.findOneAndUpdate(
          { createdAt: transactionDate },
          {
            $inc: {
              "stats.total.withdraw": -amountDSL,
              "stats.crypto.withdraw": -amountDSL,
            },
          },
        ).exec();
      }
    }

    console.log("Reports updated successfully.");
  } catch (err) {
    console.error("Error updating reports:", err);
  }
}

(async () => {
  try {
    await connectDB();
    await updateReports();
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
})();
