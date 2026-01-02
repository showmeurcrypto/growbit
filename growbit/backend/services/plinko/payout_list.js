const PLINKO_HOUSE_EDGE = process.env.PLINKO_HOUSE_EDGE || 4;

function getPayoutForEdge(edge) {
  if (edge === 1) {
    return PayoutLists;
  }

  const original_edge = 1;
  const one_minus_new_edge = 1 - edge / 100;
  const one_minus_edge_old = 1 - original_edge / 100;
  const edge_adjustment_multiplier = one_minus_edge_old / one_minus_new_edge;

  return {
    low: {
      8: PayoutLists.low[8].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      9: PayoutLists.low[9].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      10: PayoutLists.low[10].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      11: PayoutLists.low[11].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      12: PayoutLists.low[12].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      13: PayoutLists.low[13].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      14: PayoutLists.low[14].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      15: PayoutLists.low[15].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      16: PayoutLists.low[16].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
    },
    medium: {
      8: PayoutLists.medium[8].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      9: PayoutLists.medium[9].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      10: PayoutLists.medium[10].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      11: PayoutLists.medium[11].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      12: PayoutLists.medium[12].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      13: PayoutLists.medium[13].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      14: PayoutLists.medium[14].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      15: PayoutLists.medium[15].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      16: PayoutLists.medium[16].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
    },
    high: {
      8: PayoutLists.high[8].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      9: PayoutLists.high[9].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      10: PayoutLists.high[10].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      11: PayoutLists.high[11].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      12: PayoutLists.high[12].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      13: PayoutLists.high[13].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      14: PayoutLists.high[14].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      15: PayoutLists.high[15].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
      16: PayoutLists.high[16].map(
        (payout) => payout / edge_adjustment_multiplier,
      ),
    },
  };
}

const PayoutLists = {
  low: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
    10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
    14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  medium: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
    10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
    14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  high: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
    10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
    14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
    16: [
      1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000,
    ],
  },
};

function getPayoutMultiplierForHole(hole, riskLevel, rows) {
  const edge = parseFloat(PLINKO_HOUSE_EDGE);
  return getPayoutForEdge(edge)[riskLevel][rows][hole];
}

module.exports = {
  getPayoutMultiplierForHole,
  PLINKO_HOUSE_EDGE,
};
