const generalGetLeaderboardTimeLeft = (endDate) => {
  return new Date(endDate).getTime() - new Date().getTime();
};

const getNextSundayMidnight = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const getRaceRewards = (total) => {
  let rewards = [];
  for (let i = 0; i < 10; i++) {
    if (i < 3) {
      rewards.push({
        prize: (1 / Math.pow(2, i + 1)) * total,
      });
    } else {
      rewards.push({
        prize: (1 / 56) * total,
      });
    }
  }

  return rewards;
};

module.exports = {
  getRaceRewards,
  getNextSundayMidnight,
  generalGetLeaderboardTimeLeft,
};
