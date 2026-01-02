const path = require("path");
const express = require("express");
const http = require("http");
const https = require("https");
const hpp = require("hpp");
const cors = require("cors");
const socket = require("socket.io");
const axios = require("axios");

// Load application config
// require('dotenv').config({ path: './config/config.env' });
require("dotenv").config();

// Init express app & create http server
const app = express();

const server = http.createServer(app);

// Create socket server
const io = socket(server, {
  transports: ["websocket"],
  cors: {
    origin: process.env.SERVER_FRONTEND_URL.split(","),
    credentials: true,
  },
  maxHttpBufferSize: 1e7,
});

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    const formattedError = {
      status: error.response?.status,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred",
      type: "error",
    };

    return Promise.reject(formattedError);
  },
);

// Load database
require("./database")();

// Init page settings
require("./utils/setting").settingInitDatabase();

require("./services/slots/slot_data").initSlotData();
require("./services/challenges").initChallenges();
require("./services/bots").init(io);
require("./services/boxLoader").initBoxes();

require("./services/cashier/fiat_exchange_rates").startFiatExchangeRatesWorker();

require("./services/cashier/crypto/crypto").preGenerateWalletAddresses();

// Enable if you are behind a reverse proxy
app.set("trust proxy", 1);

// Set other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(
  cors({
    origin: process.env.SERVER_FRONTEND_URL.split(","),
    credentials: true,
  }),
);

// Mount routes
app.use("/", require("./nexus")(io));
app.use("/api", require("./routes")(io));
app.use("/api/public", express.static(path.join(__dirname, "public")));

// Mount sockets
require("./sockets")(io);

// Set app port
const PORT = process.env.SERVER_PORT || 5001;

server.listen(PORT, "0.0.0.0", () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}, database url: ${process.env.DATABASE_URI}`,
  ),
);
