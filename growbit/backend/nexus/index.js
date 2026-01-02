const express = require("express");
const router = express.Router();
const { processTransaction } = require("../services/slots/fiverscan");

module.exports = (io) => {
  router.post("/gold_api", async (req, res) => {
    console.log("nexus request received");
    try {
      const {
        method,
        agent_code,
        agent_secret,
        agent_balance,
        user_code,
        user_balance,
        game_type,
        live,
        slot,
      } = req.body;
      if (agent_secret === process.env.NEXUS_AGENT_SECRET) {
        const response = await processTransaction(
          method,
          agent_code,
          agent_secret,
          agent_balance,
          user_code,
          user_balance,
          game_type,
          live,
          slot,
          io,
        );

        console.log("response to nexus request:");
        console.log(response);
        res.status(200).json({ status: 1, user_balance: response });
      }
    } catch (err) {
      console.log("Error processing nexus callback: " + err);
      res.status(500).json({
        success: false,
        error: { status: 0, user_balance: 0, msg: err },
      });
    }
  });

  return router;
};
