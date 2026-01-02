const adminCheckGetStatsListData = (data) => {
  if (data === undefined || data === null) {
    throw new Error("Something went wrong. Please try again in a few seconds.");
  } else if (
    data.page === undefined ||
    data.page === null ||
    isNaN(data.page) === true ||
    data.page <= 0
  ) {
    throw new Error("Your entered page is invalid.");
  }
};

module.exports = {
  validateGetReportsRequest: adminCheckGetStatsListData,
};
