const fs = require("fs");

const boxes = [];

const initBoxes = async () => {
  fs.readFile("./public/boxes.json", "utf8", (err, data) => {
    if (err) {
      logger.error("Error Loading boxes:", err);
    } else {
      try {
        const parsedData = JSON.parse(data);

        const validData = parsedData
          .map((box) => {
            if (!Array.isArray(box.items)) {
              console.warn(`Case (${box.caseName}) is missing items array`);
              return null;
            }

            if (!box.casePrice) {
              console.warn(`Case (${box.caseName}) is missing casePrice`);
              return null;
            }

            let totalReturn = 0;
            let itemFrequencySum = 0;

            for (const item of box.items) {
              if (
                typeof item.itemPrice !== "number" ||
                typeof item.frequency !== "number"
              ) {
                console.warn(`Invalid item in case ${box.caseName}:`, item);
                return null;
              }

              totalReturn += item.itemPrice * item.frequency;
              itemFrequencySum += item.frequency;
            }

            // Warn if item frequencies do not sum to 1
            if (Math.abs(itemFrequencySum - 1) > 1e-6) {
              console.warn(
                `Warning: Item frequencies in case ${box.caseName} sum to ${itemFrequencySum} (should be 1)`,
              );
              return null;
            }

            // Calculate RTP as a percentage of casePrice
            let rtp = totalReturn / box.casePrice;

            console.log("rtp ", rtp);

            if (rtp > 0.98) {
              return null;
            }

            return box;
          })
          .filter(Boolean);

        boxes.push(...validData);
        //TODO: check rtp and freq
      } catch (parseErr) {
        console.error(parseErr);
        logger.error("Error parsing cases data:", parseErr);
      }
    }
  });
};

module.exports = { initBoxes, boxes };
