const WHALE_REQUIREMENT = process.env.VUE_APP_WHALE_REQUIREMENT || 5;
const LUCKY_REQUIREMENT = process.env.VUE_APP_LUCKY_REQUIREMENT || 2;

const state = {
  generalChatMobile: false,
  generalChat: true,
  supportChat: false,
  supportMobile: false,
  generalSettings: null,
  generalTimeDiff: null,
  generalBets: {
    bets: null,
    loading: false,
    lastUpdate: new Date(),
  },
  generalUserInfo: {
    data: null,
    loading: false,
  },
};

const getters = {
  generalChatMobile: (state) => state.generalChatMobile,
  generalChat: (state) => state.generalChat,
  generalSettings: (state) => state.generalSettings,
  generalTimeDiff: (state) => state.generalTimeDiff,
  generalBets: (state) => state.generalBets,
  generalUserInfo: (state) => state.generalUserInfo,
  supportChat: (state) => state.supportChat,
  supportMobile: (state) => state.supportMobile,
};

const mutations = {
  general_set_chat_mobile(state, value) {
    if (value) {
      state.supportMobile = false;
    }
    state.generalChatMobile = value;
  },
  general_set_support_mobile(state, value) {
    if (value) {
      state.generalChatMobile = false;
    }
    state.supportMobile = value;
  },
  general_toggle_chat(state) {
    if (state.supportChat) {
      state.supportChat = false;
      state.generalChat = true;
    } else {
      state.generalChat = !state.generalChat;
    }
  },
  general_toggle_support_chat(state, type) {
    state.supportChat = !state.supportChat;
  },
  general_set_settings(state, settings) {
    state.generalSettings = settings;
  },
  general_set_time_diff(state, time) {
    state.generalTimeDiff = time - new Date().getTime();
  },
  general_set_bets(state, bets) {
    state.generalBets.bets = bets;
  },
  general_add_bets_all(state, bet) {
    //console.log(bet);
    const lastUpdate = state.generalBets.lastUpdate;
    if (lastUpdate) {
      if (Date.now() - lastUpdate.getTime() <= 600) {
        // Throttle new bets
        return;
      }
    }
    state.generalBets.lastUpdate = new Date();
    state.generalBets.bets.all.unshift(bet);
    if (state.generalBets.bets.all.length > 15) {
      state.generalBets.bets.all.pop();
    }
  },
  general_remove_bets_all(state) {
    state.generalBets.bets.all.pop();
  },
  add_seed_after_rotation(state, { oldSeed }) {
    let userId = state.generalBets.bets.my?.[0]?.user._id?.toString();

    state.generalBets.bets.my = addSeed(
      state.generalBets.bets.my,
      oldSeed,
      userId
    );
    // state.generalBets.bets.all = addSeed(
    //   state.generalBets.bets.all,
    //   oldSeed,
    //   userId
    // );
    // state.generalBets.bets.whale = addSeed(
    //   state.generalBets.bets.whale,
    //   oldSeed,
    //   userId
    // );
    // state.generalBets.bets.lucky = addSeed(
    //   state.generalBets.bets.lucky,
    //   oldSeed,
    //   userId
    // );
  },
  add_crash_seed(state, { fair, id }) {
    if (!state.generalBets.bets) return;
    let userId = state.generalBets.bets.my?.[0]?.user._id?.toString();

    state.generalBets.bets.my = addCrashSeed(
      state.generalBets.bets.my,
      fair,
      id,
      userId
    );
    state.generalBets.bets.all = addCrashSeed(
      state.generalBets.bets.all,
      fair,
      id,
      userId
    );
    state.generalBets.bets.whale = addCrashSeed(
      state.generalBets.bets.whale,
      fair,
      id,
      userId
    );
    state.generalBets.bets.lucky = addCrashSeed(
      state.generalBets.bets.lucky,
      fair,
      id,
      userId
    );
  },
  general_add_bets_whale(state, bet) {
    state.generalBets.bets.whale.unshift(bet);
    state.generalBets.bets.whale.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },
  general_remove_bets_whale(state) {
    state.generalBets.bets.whale.pop();
  },
  general_add_bets_lucky(state, bet) {
    state.generalBets.bets.lucky.unshift(bet);
    state.generalBets.bets.lucky.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },
  general_remove_bets_lucky(state) {
    state.generalBets.bets.lucky.pop();
  },
  general_add_bets_my(state, bet) {
    state.generalBets.bets.my.unshift(bet);
    state.generalBets.bets.my.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },
  general_remove_bets_my(state) {
    state.generalBets.bets.my.pop();
  },
  general_set_bets_loading(state, status) {
    state.generalBets.loading = status;
  },
  general_set_user_info_data(state, user) {
    state.generalUserInfo.data = user;
  },
  general_set_user_info_loading(state, status) {
    state.generalUserInfo.loading = status;
  },
};

const actions = {
  generalSocketCrashSeedUpdate({ commit, dispatch }, data) {
    // console.log("general crash update");
    // console.log(data);
    commit("add_crash_seed", { fair: data.game.fair, id: data.game.id });
    // dispatch("addCrashSeed", {
    //    seed: data.game.fair.seed,
    //    id: data.game.id
    // });
  },
  generalToggleSupport({ commit }, value) {
    commit("general_toggle_support_chat", value);
  },
  addSeedsAfterRotation({ commit }, value) {
    commit("add_seed_after_rotation", value);
  },
  // addCrashSeed({  commit }, data) {
  // {
  //   console.log("adding crash seed dispatch received");
  //   console.log(data);
  //   commit("add_crash_seed", data);
  // }
  //},
  generalSetSupportMobile({ commit }, value) {
    commit("general_set_support_mobile", value);
  },
  generalSetChatMobile({ commit }, value) {
    commit("general_set_chat_mobile", value);
  },
  generalToggleChat({ commit }, value) {
    commit("general_toggle_chat");
  },
  generalSetUserInfoData({ commit }, user) {
    commit("general_set_user_info_data", user);
  },
  generalSocketInit({ commit }, data) {
    commit("general_set_settings", data.settings);
    commit("general_set_time_diff", data.time);
  },
  generalSocketBet({ getters, commit }, data) {
    //   console.log("bet received");
    // console.log(data);
    if (getters.generalBets.bets !== null) {
      commit("general_add_bets_all", data.bet);

      if (data.bet.amount >= WHALE_REQUIREMENT) {
        commit("general_add_bets_whale", data.bet);
        if (getters.generalBets.bets.whale.length >= 15) {
          commit("general_remove_bets_whale");
        }
      }
      if (data.bet.multiplier >= LUCKY_REQUIREMENT) {
        //console.log("adding bet to lucky");
        commit("general_add_bets_lucky", data.bet);
        if (getters.generalBets.bets.lucky.length >= 15) {
          commit("general_remove_bets_lucky");
        }
      }
      if (
        getters.authUser.user !== null &&
        data.bet.user !== null &&
        getters.authUser.user._id === data.bet.user._id
      ) {
        commit("general_add_bets_my", data.bet);
        if (getters.generalBets.bets.my.length >= 15) {
          commit("general_remove_bets_my");
        }
      }
    }
  },
  generalSocketSettings({ commit }, data) {
    commit("general_set_settings", data.settings);
  },
  generalSocketUser({ getters, commit }, data) {
    if (
      new Date(getters.authUser.user.updatedAt).getTime() <=
      new Date(data.user.updatedAt).getTime()
    ) {
      commit("auth_update_user", data.user);
    }
  },
  generalSocketAnonbet({ getters, commit }, data) {
    if (
      getters.authUser.user !== null &&
      data.bet.user !== null &&
      getters.authUser.user._id === data.bet.user._id &&
      getters.generalBets.bets
    ) {
      commit("general_add_bets_my", data.bet);
      if (getters.generalBets.bets.my.length >= 15) {
        commit("general_remove_bets_my");
      }
    }
  },
  generalGetBetsDataSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketGeneral === null ||
      getters.generalBets.loading === true
    ) {
      return;
    }
    commit("general_set_bets_loading", true);
    getters.socketGeneral.emit("getBetsData", data, (res) => {
      if (res.success === true) {
        commit("general_set_bets", res.bets);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("general_set_bets_loading", false);
    });
  },
  generalSendPromoClaimSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "GeneralPromoClaim");

    getters.socketGeneral.emit("sendPromoClaim", data, (res) => {
      if (res.success === true) {
        dispatch("notificationShow", {
          type: "success",
          message: "You've successfully claimed a promo code.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

function addSeed(bets, oldSeed, userId) {
  if (bets?.length) {
    for (let bet of bets) {
      if (bet?.user?._id?.toString() === userId) {
        if (
          ["mines", "dice", "plinko", "keno", "reme", "towers"].includes(
            bet.method
          )
        ) {
          // bet.fair = {
          //   seed: oldSeed,
          // };
          bet.fair.seed.seedServer = oldSeed.seedServer;
          bet.fair.seed.state = "completed";
        }
      }
    }
  }
  return [...bets];
}

function addCrashSeed(bets, fair, id) {
  if (bets?.length) {
    for (let bet of bets) {
      if (bet.method === "crash") {
        if (bet?.game?._id === id) {
          bet.fair = fair;
        }
      }
    }
  }

  return [...bets];
}

const general = {
  state,
  mutations,
  actions,
  getters,
};

export default general;
