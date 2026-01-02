const state = {
  userTransactionsData: {
    transactions: null,
    count: null,
    loading: false,
    page: 1,
  },
  userBetsData: {
    bets: null,
    count: null,
    loading: false,
    page: 1,
  },
  userSeedData: {
    data: null,
    loading: false,
  },
};

const getters = {
  userTransactionsData: (state) => state.userTransactionsData,
  userBetsData: (state) => state.userBetsData,
  userSeedData: (state) => state.userSeedData,
};

const mutations = {
  user_set_transactions_data(state, data) {
    state.userTransactionsData.transactions = data.transactions;
    state.userTransactionsData.count = data.count;
  },
  user_set_transactions_data_loading(state, status) {
    state.userTransactionsData.loading = status;
  },
  user_set_transactions_data_page(state, page) {
    state.userTransactionsData.page = page;
  },
  user_set_bets_data(state, data) {
    state.userBetsData.bets = data.bets;
    state.userBetsData.count = data.count;
  },
  user_set_bets_data_loading(state, status) {
    state.userBetsData.loading = status;
  },
  user_set_bets_data_page(state, page) {
    state.userBetsData.page = page;
  },
  user_set_seed_data(state, data) {
    state.userSeedData.data = { seed: data.seed, seedNext: data.seedNext };
  },
  user_set_seed_data_loading(state, status) {
    state.userSeedData.loading = status;
  },
};

const actions = {
  userSetTransactionsDataPage({ commit }, page) {
    commit("user_set_transactions_data_page", page);
  },
  userSetBetsDataPage({ commit }, page) {
    commit("user_set_bets_data_page", page);
  },
  userTipSocket({ dispatch, rootState }, data) {
    const amountInSelectedCurrency = (
      rootState.cashier.rates.data[rootState.cashier.selectedCurrency] *
      data.transaction.amount
    ).toFixed(2);
    const currency = rootState.cashier.selectedCurrency;
    dispatch("notificationShow", {
      type: "success",
      message: `You've been tipped ${amountInSelectedCurrency} ${currency}.`,
    });
  },
  userGetTransactionsSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketGeneral === null ||
      getters.userTransactionsData.loading === true
    ) {
      return;
    }
    commit("user_set_transactions_data_loading", true);

    getters.socketGeneral.emit("getUserTransactions", data, (res) => {
      if (res.success === true) {
        commit("user_set_transactions_data", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("user_set_transactions_data_loading", false);
    });
  },
  userGetBetsSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketGeneral === null ||
      getters.userBetsData.loading === true
    ) {
      return;
    }
    commit("user_set_bets_data_loading", true);

    getters.socketGeneral.emit("getUserBets", data, (res) => {
      if (res.success === true) {
        commit("user_set_bets_data", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("user_set_bets_data_loading", false);
    });
  },
  userGetSeedSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketGeneral === null ||
      getters.userSeedData.loading === true
    ) {
      return;
    }
    commit("user_set_seed_data_loading", true);

    getters.socketGeneral.emit("getUserSeed", data, (res) => {
      if (res.success === true) {
        commit("user_set_seed_data", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("user_set_seed_data_loading", false);
    });
  },
  userSendUserAnonymousSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "UserAnonymous");

    getters.socketGeneral.emit("sendUserAnonymous", data, (res) => {
      if (res.success === true) {
        commit("auth_set_user_anonymous", res.anonymous);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  userSendUserDiscordSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "UserDiscord");

    getters.socketGeneral.emit("sendUserDiscord", data, (res) => {
      if (res.success === true) {
        commit("auth_set_user", res.user);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  userSendClientSeedSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "UserClientSeed");

    getters.socketGeneral.emit("sendUserClientSeed", data, (res) => {
      if (res.success === true) {
        commit("user_set_seed_data", res);

        const oldSeed = res.oldSeed;

        if (oldSeed) {
          dispatch("addSeedsAfterRotation", {
            oldSeed,
          });
        }
        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully updated your client seed.",
        });
        dispatch("modalsSetShow", null);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  userSendUserTipSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "UserTip");

    getters.socketGeneral.emit("sendUserTip", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetShow", null);

        dispatch("notificationShow", {
          type: "success",
          message: `You've successfully tipped ${Number(
            data.amountInSelectedCurrency
          ).toFixed(2)} ${data.selectedCurrency}`,
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  toggleFavouriteSlot({ getters, commit, dispatch }, slot) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "FavouriteSlots");
    getters.socketGeneral.emit("toggleFavouriteSlot", { slot }, (res) => {
      if (res.success === true) {
        dispatch("userToggleFavouriteSlot", slot);
      } else {
        dispatch("notificationShow", res.error);
      }
      commit("socket_set_send_loading", null);
    });
  },
};

const user = {
  state,
  mutations,
  actions,
  getters,
};

export default user;
