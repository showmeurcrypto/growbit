const Report = require("../../../database/models/Report");

const { validateGetReportsRequest } = require("../../../utils/admin/stats");
const { generalGetChatOnlineCount } = require("../../../utils/general/chat");

const adminGetStats = async (io, socket, user, data, callback) => {
  try {
    const dailyStart = new Date();
    dailyStart.setHours(0, 0, 0, 0);

    const weeklyStart = new Date();
    weeklyStart.setHours(0, 0, 0, 0);
    weeklyStart.setDate(
      weeklyStart.getDate() -
        weeklyStart.getDay() +
        (weeklyStart.getDay() === 0 ? -6 : 1),
    );

    const monthlyStart = new Date();
    monthlyStart.setHours(0, 0, 0, 0);
    monthlyStart.setDate(1);

    let stats = await Report.aggregate([
      {
        $group: {
          _id: null,

          // TOTAL stats
          total_wager: { $sum: "$stats.total.bet" },
          total_won: { $sum: "$stats.total.won" },
          total_deposit: { $sum: "$stats.total.deposit" },
          total_withdraw: { $sum: "$stats.total.withdraw" },

          // DAILY stats
          daily_wager: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", dailyStart] },
                "$stats.total.bet",
                0,
              ],
            },
          },
          daily_won: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", dailyStart] },
                "$stats.total.won",
                0,
              ],
            },
          },
          daily_deposit: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", dailyStart] },
                "$stats.total.deposit",
                0,
              ],
            },
          },
          daily_withdraw: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", dailyStart] },
                "$stats.total.withdraw",
                0,
              ],
            },
          },

          // WEEKLY stats
          weekly_wager: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", weeklyStart] },
                "$stats.total.bet",
                0,
              ],
            },
          },
          weekly_won: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", weeklyStart] },
                "$stats.total.won",
                0,
              ],
            },
          },
          weekly_deposit: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", weeklyStart] },
                "$stats.total.deposit",
                0,
              ],
            },
          },
          weekly_withdraw: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", weeklyStart] },
                "$stats.total.withdraw",
                0,
              ],
            },
          },

          // MONTHLY stats
          monthly_wager: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", monthlyStart] },
                "$stats.total.bet",
                0,
              ],
            },
          },
          monthly_won: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", monthlyStart] },
                "$stats.total.won",
                0,
              ],
            },
          },
          monthly_deposit: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", monthlyStart] },
                "$stats.total.deposit",
                0,
              ],
            },
          },
          monthly_withdraw: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", monthlyStart] },
                "$stats.total.withdraw",
                0,
              ],
            },
          },

          // Per-game stats
          ...[
            "crash",
            "mines",
            "plinko",
            "slide",
            "dice",
            "keno",
            "coinflip",
            "slots",
            "cases",
            "reme",
            "towers",
          ].reduce(
            (acc, game) => ({
              ...acc,

              // TOTAL
              [`total_${game}_wager`]: { $sum: `$stats.games.${game}.bet` },
              [`total_${game}_won`]: { $sum: `$stats.games.${game}.won` },

              // DAILY
              [`daily_${game}_wager`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", dailyStart] },
                    `$stats.games.${game}.bet`,
                    0,
                  ],
                },
              },
              [`daily_${game}_won`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", dailyStart] },
                    `$stats.games.${game}.won`,
                    0,
                  ],
                },
              },

              // WEEKLY
              [`weekly_${game}_wager`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", weeklyStart] },
                    `$stats.games.${game}.bet`,
                    0,
                  ],
                },
              },
              [`weekly_${game}_won`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", weeklyStart] },
                    `$stats.games.${game}.won`,
                    0,
                  ],
                },
              },

              // MONTHLY
              [`monthly_${game}_wager`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", monthlyStart] },
                    `$stats.games.${game}.bet`,
                    0,
                  ],
                },
              },
              [`monthly_${game}_won`]: {
                $sum: {
                  $cond: [
                    { $gte: ["$createdAt", monthlyStart] },
                    `$stats.games.${game}.won`,
                    0,
                  ],
                },
              },
            }),
            {},
          ),
        },
      },
      {
        $project: {
          _id: 0,

          // Total stats
          total: {
            wager: "$total_wager",
            won: "$total_won",
            deposit: "$total_deposit",
            withdraw: "$total_withdraw",

            games: {
              coinflip: {
                wager: "$total_coinflip_wager",
                won: "$total_coinflip_won",
              },
              crash: { wager: "$total_crash_wager", won: "$total_crash_won" },
              mines: { wager: "$total_mines_wager", won: "$total_mines_won" },
              plinko: {
                wager: "$total_plinko_wager",
                won: "$total_plinko_won",
              },
              slide: { wager: "$total_slide_wager", won: "$total_slide_won" },
              dice: { wager: "$total_dice_wager", won: "$total_dice_won" },
              cases: { wager: "$total_cases_wager", won: "$total_cases_won" },
              keno: { wager: "$total_keno_wager", won: "$total_keno_won" },
              slots: { wager: "$total_slots_wager", won: "$total_slots_won" },
              reme: { wager: "$total_reme_wager", won: "$total_reme_won" },
              towers: {
                wager: "$total_towers_wager",
                won: "$total_towers_won",
              },
            },
          },

          // Daily stats
          daily: {
            wager: "$daily_wager",
            won: "$daily_won",
            deposit: "$daily_deposit",
            withdraw: "$daily_withdraw",

            games: {
              crash: { wager: "$daily_crash_wager", won: "$daily_crash_won" },
              coinflip: {
                wager: "$daily_coinflip_wager",
                won: "$daily_coinflip_won",
              },

              mines: { wager: "$daily_mines_wager", won: "$daily_mines_won" },
              plinko: {
                wager: "$daily_plinko_wager",
                won: "$daily_plinko_won",
              },
              slide: { wager: "$daily_slide_wager", won: "$daily_slide_won" },
              dice: { wager: "$daily_dice_wager", won: "$daily_dice_won" },
              cases: { wager: "$daily_cases_wager", won: "$daily_cases_won" },
              keno: { wager: "$daily_keno_wager", won: "$daily_keno_won" },
              slots: { wager: "$daily_slots_wager", won: "$daily_slots_won" },
              reme: { wager: "$daily_reme_wager", won: "$daily_reme_won" },
              towers: {
                wager: "$daily_towers_wager",
                won: "$daily_towers_won",
              },
            },
          },

          // Weekly stats
          weekly: {
            wager: "$weekly_wager",
            won: "$weekly_won",
            deposit: "$weekly_deposit",
            withdraw: "$weekly_withdraw",

            games: {
              crash: { wager: "$weekly_crash_wager", won: "$weekly_crash_won" },
              coinflip: {
                wager: "$weekly_coinflip_wager",
                won: "$weekly_coinflip_won",
              },

              mines: { wager: "$weekly_mines_wager", won: "$weekly_mines_won" },
              plinko: {
                wager: "$weekly_plinko_wager",
                won: "$weekly_plinko_won",
              },
              slide: { wager: "$weekly_slide_wager", won: "$weekly_slide_won" },
              dice: { wager: "$weekly_dice_wager", won: "$weekly_dice_won" },
              cases: { wager: "$weekly_cases_wager", won: "$weekly_cases_won" },
              keno: { wager: "$weekly_keno_wager", won: "$weekly_keno_won" },
              slots: { wager: "$weekly_slots_wager", won: "$weekly_slots_won" },
              reme: { wager: "$weekly_reme_wager", won: "$weekly_reme_won" },
              towers: {
                wager: "$weekly_towers_wager",
                won: "$weekly_towers_won",
              },
            },
          },

          // Monthly stats
          monthly: {
            wager: "$monthly_wager",
            won: "$monthly_won",
            deposit: "$monthly_deposit",
            withdraw: "$monthly_withdraw",

            games: {
              crash: {
                wager: "$monthly_crash_wager",
                won: "$monthly_crash_won",
              },
              mines: {
                wager: "$monthly_mines_wager",
                won: "$monthly_mines_won",
              },
              plinko: {
                wager: "$monthly_plinko_wager",
                won: "$monthly_plinko_won",
              },
              slide: {
                wager: "$monthly_slide_wager",
                won: "$monthly_slide_won",
              },
              coinflip: {
                wager: "$monthly_coinflip_wager",
                won: "$monthly_coinflip_won",
              },
              dice: { wager: "$monthly_dice_wager", won: "$monthly_dice_won" },
              cases: {
                wager: "$monthly_cases_wager",
                won: "$monthly_cases_won",
              },
              reme: { wager: "$monthly_reme_wager", won: "$monthly_reme_won" },
              towers: {
                wager: "$monthly_towers_wager",
                won: "$monthly_towers_won",
              },

              keno: { wager: "$monthly_keno_wager", won: "$monthly_keno_won" },
              slots: {
                wager: "$monthly_slots_wager",
                won: "$monthly_slots_won",
              },
            },
          },
        },
      },
    ]);

    stats = stats[0];
    stats.daily.start = dailyStart;
    stats.weekly.start = weeklyStart;
    stats.monthly.start = monthlyStart;

    count = await generalGetChatOnlineCount(io);

    callback({ success: true, stats: stats, onlineCount: count });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

const adminGetReports = async (io, socket, user, data, callback) => {
  try {
    validateGetReportsRequest(data);

    const offset = (data.page - 1) * 12;

    const dataDatabase = await Promise.all([
      Report.countDocuments({}),
      Report.find({})
        .limit(12)
        .skip(offset)
        .sort({ createdAt: -1 })
        .select("stats createdAt")
        .lean(),
    ]);

    callback({ success: true, count: dataDatabase[0], stats: dataDatabase[1] });
  } catch (err) {
    callback({
      success: false,
      error: { type: "error", message: err.message },
    });
  }
};

module.exports = {
  adminGetStats,
  adminGetReports,
};
