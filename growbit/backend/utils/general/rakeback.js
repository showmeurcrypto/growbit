const generalCheckSendRakebackClaimUser = (rakebackInfo, rakebackType) => {
  const now = new Date();

  if (!rakebackInfo.lastClaimed) return true; // No previous claim

  const claimIntervals = {
    daily: getNextDayInMiliseconds(),
    weekly: getNextWeekInMiliseconds(),
    monthly: getNextMonthInMiliseconds(),
  };
  const today = new Date();

  if (rakebackType === "daily") {
    if (!isSameDay(new Date(rakebackInfo.lastClaimed), today)) {
      return true;
    }
    throw new Error(
      `${rakebackType} rakeback can only be claimed once ${rakebackType}.`,
    );
  }

  if (rakebackType === "weekly") {
    if (!isSameWeek(new Date(rakebackInfo.lastClaimed), today)) {
      return true;
    }
    throw new Error(
      `${rakebackType} rakeback can only be claimed once ${rakebackType}.`,
    );
  }

  if (rakebackType === "monthly") {
    if (!isSameMonth(new Date(rakebackInfo.lastClaimed), today)) {
      return true;
    }
    throw new Error(
      `${rakebackType} rakeback can only be claimed once ${rakebackType}.`,
    );
  }
};

function calculateRakeback(betAmount, edge = 0) {
  const houseExpectedIncome = (edge / 100) * betAmount;

  const dailyPercent = 6;
  const weeklyPercent = 2.5;
  const monthlyPercent = 2;

  const daily = (dailyPercent / 100) * houseExpectedIncome;
  const weekly = (weeklyPercent / 100) * houseExpectedIncome;
  const monthly = (monthlyPercent / 100) * houseExpectedIncome;

  return {
    daily,
    weekly,
    monthly,
  };
}

function getNextDayInMiliseconds() {
  // return nextDay;
  const now = new Date();

  const nextDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );

  return nextDay.getTime();
}

function getNextWeekInMiliseconds() {
  const now = new Date();
  const currentUTCDay = now.getUTCDay();

  //const daysToAdd = (7 - currentDayUTC + 1) % 7;
  const normalizedDay = currentUTCDay === 0 ? 7 : currentUTCDay;
  const daysUntilNextMonday = 8 - normalizedDay;

  const nextMonday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilNextMonday,
      0,
      0,
      0,
      0,
    ),
  );

  return nextMonday.getTime();
}

function getNextMonthInMiliseconds() {
  const now = new Date();
  // const nextMonth = new Date(now);
  // nextMonth.setMonth(now.getMonth() + 1);
  // nextMonth.setDate(1);
  // nextMonth.setHours(0, 0, 0, 0);
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );

  return nextMonth;
}

function isSameDay(date1, date2) {
  console.log(date1);
  console.log(date2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isSameWeek(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    getWeekNumber(date1) === getWeekNumber(date2)
  );
}

function isSameMonth(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

// function getWeekNumber(date) {
//   const janFirst = new Date(date.getFullYear(), 0, 1);
//   // Source: https://stackoverflow.com/a/27125580/3307678
//   return Math.ceil(
//     ((date.getTime() - janFirst.getTime()) / 86400000 + janFirst.getDay() + 1) /
//       7,
//   );
// }

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return weekNo;
}

module.exports = {
  generalCheckSendRakebackClaimUser,
  calculateRakeback,
};
