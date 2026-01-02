const state = {
  adminFilterSearch: "",
  adminFilterSort: "Balance",
  adminFilterAmount: "3",
  adminFilterSelect: "All",
  adminFilterType: "Wager",
  adminFilterDuration: "7",
  adminUserList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminUserTransactionList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminTransactionList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminUserGameList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminAffiliateList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminPromoList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminCashierList: {
    data: null,
    count: null,
    codes: null,
    loading: false,
    page: 1,
  },
  adminLeaderboardList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  // adminDepositChats: {
  //   tickets: [],
  //   count: null,
  //   loading: false,
  //   page: 1,
  // },
  adminSupportChats: {
    chats: [],
    count: null,
    loading: false,
    page: 1,
  },
  adminFilterList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
  adminStatsData: {
    data: null,
    loading: false,
  },
  adminStatsList: {
    data: null,
    count: null,
    loading: false,
    page: 1,
  },
};

const getters = {
  adminFilterSearch: (state) => state.adminFilterSearch,
  adminFilterSort: (state) => state.adminFilterSort,
  adminFilterAmount: (state) => state.adminFilterAmount,
  adminFilterSelect: (state) => state.adminFilterSelect,
  adminFilterType: (state) => state.adminFilterType,
  adminFilterDuration: (state) => state.adminFilterDuration,
  adminUserList: (state) => state.adminUserList,
  adminUserTransactionList: (state) => state.adminUserTransactionList,
  adminTransactionList: (state) => state.adminTransactionList,
  adminUserGameList: (state) => state.adminUserGameList,
  adminAffiliateList: (state) => state.adminAffiliateList,
  adminPromoList: (state) => state.adminPromoList,
  adminCashierList: (state) => state.adminCashierList,
  adminBoxList: (state) => state.adminBoxList,
  adminRainList: (state) => state.adminRainList,
  adminLeaderboardList: (state) => state.adminLeaderboardList,
  adminFilterList: (state) => state.adminFilterList,
  adminStatsData: (state) => state.adminStatsData,
  adminStatsList: (state) => state.adminStatsList,
  // adminDepositChats: (state) => state.adminDepositChats,
  adminSupportChats: (state) => state.adminSupportChats,
};

const mutations = {
  admin_set_filter_search(state, value) {
    state.adminFilterSearch = value;
  },
  admin_set_filter_sort(state, value) {
    state.adminFilterSort = value;
  },
  admin_set_filter_amount(state, value) {
    state.adminFilterAmount = value;
  },
  admin_set_filter_select(state, value) {
    state.adminFilterSelect = value;
  },
  admin_set_filter_type(state, value) {
    state.adminFilterType = value;
  },
  admin_set_filter_duration(state, value) {
    state.adminFilterDuration = value;
  },
  admin_set_user_list(state, data) {
    state.adminUserList.data = data.users;
    state.adminUserList.count = data.count;
  },
  // admin_set_cashier_chats(state, data) {
  //   state.adminDepositChats.tickets = data.tickets || [];
  // },
  // admin_cashier_chats_add_message(state, data) {
  //   state.adminDepositChats.tickets
  //     .filter((ticket) => ticket._id === data.ticketId)[0]
  //     ?.messages.push({ sender: data.sender, message: data.message });
  // },
  admin_set_support_chats(state, data) {
    state.adminSupportChats.chats = data.chats || [];
  },
  admin_support_chats_add_message(state, data) {
    let chat = state.adminSupportChats.chats.find(
      (chat) => chat.user === data.user
    );

    if (chat) {
      chat.updatedAt = new Date();
      chat.messages.push({ sender: data.sender, message: data.message });
    } else {
      //New chat
      //TODO: what if this is not a message from new chat but a message from chat which is not on the list ?
      state.adminSupportChats.chats.unshift({
        updatedAt: new Date(),
        user: data.user,
        username: data.sender,
        messages: [{ sender: data.sender, message: data.message }],
      });
    }

    state.adminSupportChats.chats.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    state.adminSupportChats.chats = state.adminSupportChats.chats.slice(0, 40);
  },
  admin_support_chats_remove_chat(state, data) {
    state.adminSupportChats.chats = state.adminSupportChats.chats.filter(
      (chat) => chat.user !== data.user
    );
  },
  // admin_cashier_chats_new_ticket(state, data) {
  //   state.adminDepositChats.tickets.push(data);
  // },
  // admin_cashier_chats_remove_ticket(state, data) {
  //   state.adminDepositChats.tickets = state.adminDepositChats.tickets.filter(
  //     (t) => t._id !== data.ticketId
  //   );
  // },
  admin_update_user_list(state, user) {
    state.adminUserList.data.splice(
      state.adminUserList.data.findIndex((element) => element._id === user._id),
      1,
      user
    );
  },
  admin_set_user_list_loading(state, status) {
    state.adminUserList.loading = status;
  },
  admin_set_user_list_page(state, page) {
    state.adminUserList.page = page;
  },
  admin_set_user_data(state, data) {
    state.adminUserData.data = data.user;
  },
  admin_set_user_data_loading(state, status) {
    state.adminUserData.loading = status;
  },
  admin_set_transaction_list(state, data) {
    state.adminTransactionList.data = data.transactions;
    state.adminTransactionList.count = data.count;
  },
  admin_set_transaction_list_loading(state, status) {
    state.adminTransactionList.loading = status;
  },
  admin_set_transaction_list_page(state, page) {
    state.adminTransactionList.page = page;
  },
  admin_set_user_transaction_list(state, data) {
    state.adminUserTransactionList.data = data.transactions;
    state.adminUserTransactionList.count = data.count;
  },
  admin_set_user_transaction_list_loading(state, status) {
    state.adminUserTransactionList.loading = status;
  },
  admin_set_user_transaction_list_page(state, page) {
    state.adminUserTransactionList.page = page;
  },
  admin_set_user_game_list(state, data) {
    state.adminUserGameList.data = data.games;
    state.adminUserGameList.count = data.count;
  },
  admin_set_user_game_list_loading(state, status) {
    state.adminUserGameList.loading = status;
  },
  admin_set_user_game_list_page(state, page) {
    state.adminUserGameList.page = page;
  },
  admin_set_affiliate_list(state, data) {
    state.adminAffiliateList.data = data.affiliates;
    state.adminAffiliateList.count = data.count;
  },
  admin_update_affiliate_list(state, affiliate) {
    state.adminAffiliateList.data.splice(
      state.adminAffiliateList.data.findIndex(
        (element) => element._id === affiliate._id
      ),
      1,
      affiliate
    );
  },
  admin_set_affiliate_list_loading(state, status) {
    state.adminAffiliateList.loading = status;
  },
  admin_set_affiliate_list_page(state, page) {
    state.adminAffiliateList.page = page;
  },
  admin_set_promo_list(state, data) {
    state.adminPromoList.data = data.promos;
    state.adminPromoList.count = data.count;
  },
  admin_add_promo_list(state, promo) {
    state.adminPromoList.data.push(promo);
  },
  admin_remove_promo_list(state, promo) {
    state.adminPromoList.data.splice(
      state.adminPromoList.data.findIndex(
        (element) => element._id === promo._id
      ),
      1
    );
  },
  admin_set_promo_list_loading(state, status) {
    state.adminPromoList.loading = status;
  },
  admin_set_promo_list_page(state, page) {
    state.adminPromoList.page = page;
  },
  admin_set_cashier_list(state, data) {
    state.adminCashierList.data = data.transactions;
    state.adminCashierList.count = data.count;
  },
  admin_set_cashier_list_codes(state, codes) {
    state.adminCashierList.codes = codes;
  },
  admin_remove_cashier_list(state, transaction) {
    state.adminCashierList.data.splice(
      state.adminCashierList.data.findIndex(
        (element) => element._id === transaction._id
      ),
      1
    );
  },
  admin_set_cashier_list_loading(state, status) {
    state.adminCashierList.loading = status;
  },
  admin_set_cashier_list_page(state, page) {
    state.adminCashierList.page = page;
  },
  admin_set_leaderboard_list(state, data) {
    state.adminLeaderboardList.data = data.leaderboards;
    state.adminLeaderboardList.count = data.count;
  },
  admin_add_leaderboard_list(state, leaderboard) {
    state.adminLeaderboardList.data.unshift(leaderboard);
  },
  admin_update_leaderboard_list(state, leaderboard) {
    state.adminLeaderboardList.data.splice(
      state.adminLeaderboardList.data.findIndex(
        (element) => element._id === leaderboard._id
      ),
      1,
      leaderboard
    );
  },
  admin_remove_leaderboard_list(state, leaderboard) {
    state.adminLeaderboardList.data.splice(
      state.adminLeaderboardList.data.findIndex(
        (element) => element._id === leaderboard._id
      ),
      1
    );
  },
  admin_set_leaderboard_list_loading(state, status) {
    state.adminLeaderboardList.loading = status;
  },
  admin_set_leaderboard_list_page(state, page) {
    state.adminLeaderboardList.page = page;
  },
  admin_set_filter_list(state, data) {
    state.adminFilterList.data = data.filters;
    state.adminFilterList.count = data.count;
  },
  admin_add_filter_list(state, filter) {
    state.adminFilterList.data.unshift(filter);
  },
  admin_remove_filter_list(state, filter) {
    state.adminFilterList.data.splice(
      state.adminFilterList.data.findIndex(
        (element) => element._id === filter._id
      ),
      1
    );
  },
  admin_set_filter_list_loading(state, status) {
    state.adminFilterList.loading = status;
  },
  admin_set_filter_list_page(state, page) {
    state.adminFilterList.page = page;
  },
  admin_set_stats_data(state, data) {
    console.log(data);
    state.adminStatsData.data = {
      stats: data.stats,
      list: data.list,
      onlineCount: data.onlineCount,
    };
  },
  admin_set_stats_data_loading(state, status) {
    state.adminStatsData.loading = status;
  },
  admin_set_stats_list(state, data) {
    state.adminStatsList.data = data.stats;
    state.adminStatsList.count = data.count;
  },
  admin_set_stats_list_loading(state, status) {
    state.adminStatsList.loading = status;
  },
  // admin_set_cashier_chats_loading(state, status) {
  //   state.adminDepositChats.loading = status;
  // },
  admin_set_support_chats_loading(state, status) {
    state.adminSupportChats.loading = status;
  },
  admin_set_stats_list_page(state, page) {
    state.adminStatsList.page = page;
  },
};

const actions = {
  adminSetFilterSearch({ commit }, value) {
    commit("admin_set_filter_search", value);
  },
  adminSetFilterSort({ commit }, value) {
    commit("admin_set_filter_sort", value);
  },
  adminSetFilterAmount({ commit }, value) {
    commit("admin_set_filter_amount", value);
  },
  adminSetFilterSelect({ commit }, value) {
    commit("admin_set_filter_select", value);
  },
  adminSetFilterType({ commit }, value) {
    commit("admin_set_filter_type", value);
  },
  adminSetFilterDuration({ commit }, value) {
    commit("admin_set_filter_duration", value);
  },
  adminSetUserListPage({ commit }, page) {
    commit("admin_set_user_list_page", page);
  },
  adminSetUserTransactionListPage({ commit }, page) {
    commit("admin_set_user_transaction_list_page", page);
  },
  adminSetTransactionListPage({ commit }, page) {
    commit("admin_set_transaction_list_page", page);
  },
  adminSetUserGameListPage({ commit }, page) {
    commit("admin_set_user_game_list_page", page);
  },
  adminSetAffiliateListPage({ commit }, page) {
    commit("admin_set_affiliate_list_page", page);
  },
  adminSetPromoListPage({ commit }, page) {
    commit("admin_set_promo_list_page", page);
  },
  adminSetCashierListPage({ commit }, page) {
    commit("admin_set_cashier_list_page", page);
  },
  adminSetLeaderboardListPage({ commit }, page) {
    commit("admin_set_leaderboard_list_page", page);
  },
  adminSetFilterListPage({ commit }, page) {
    commit("admin_set_filter_list_page", page);
  },
  adminSetStatsListPage({ commit }, page) {
    commit("admin_set_stats_list_page", page);
  },
  adminGetUserListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminUserList.loading === true
    ) {
      return;
    }
    commit("admin_set_user_list_loading", true);

    getters.socketAdmin.emit("getUserList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_user_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_user_list_loading", false);
    });
  },
  // adminGetDepositChatsSocket({ getters, commit, dispatch }, data) {
  //   if (
  //     getters.socketAdmin === null ||
  //     getters.adminDepositChats.loading === true
  //   ) {
  //     return;
  //   }
  //   commit("admin_set_cashier_chats_loading", true);

  //   getters.socketAdmin.emit("getCashierChats", data, (res) => {
  //     if (res.success === true) {
  //       commit("admin_set_cashier_chats", res);
  //     } else {
  //       dispatch("notificationShow", res.error);
  //     }

  //     commit("admin_set_cashier_chats_loading", false);
  //   });
  // },

  adminGetSupportChats({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminSupportChats.loading === true
    ) {
      return;
    }
    commit("admin_set_support_chats_loading", true);
    getters.socketAdmin.emit("getSupportChats", data, (res) => {
      if (res.success) {
        commit("admin_set_support_chats", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_support_chats_loading", false);
    });
  },

  adminSupportChatsSendMessageSocket({ getters, commit, dispatch }, data) {
    if (!getters.socketAdmin === null || getters.adminSupportChats.loading) {
      return;
    }
    getters.socketAdmin.emit("sendSupportChatMessage", data, (res) => {
      if (res.success) {
        commit("admin_support_chats_add_message", {
          sender: "admin",
          message: data.message,
          user: data.userId,
        });
      } else {
        dispatch("notificationShow", res.error);
      }
    });
  },

  adminSupportChatsDelete({ getters, commit, dispatch }, data) {
    if (!getters.socketAdmin === null || getters.adminSupportChats.loading) {
      return;
    }
    getters.socketAdmin.emit("supportChatDelete", data, (res) => {
      if (res.success) {
        commit("admin_support_chats_remove_chat", {
          user: data.userId,
        });
      } else {
        dispatch("notificationShow", res.error);
      }
    });
  },

  // adminDepositChatsSendMessageSocket({ getters, commit, dispatch }, data) {
  //   if (
  //     getters.socketAdmin === null ||
  //     getters.adminSupportChats.loading === true
  //   ) {
  //     return;
  //   }
  //   getters.socketAdmin.emit("sendCashierChatMessage", data, (res) => {
  //     if (res.success === true) {
  //       commit("admin_cashier_chats_add_message", {
  //         ticketId: data.ticketId,
  //         sender: "admin",
  //         message: data.message,
  //         userId: data.userId,
  //       });
  //     } else {
  //       dispatch("notificationShow", res.error);
  //     }
  //   });
  // },

  adminGetUserTransactionListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminUserTransactionList.loading === true
    ) {
      return;
    }
    commit("admin_set_user_transaction_list_loading", true);

    getters.socketAdmin.emit("getUserTransactionList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_user_transaction_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_user_transaction_list_loading", false);
    });
  },
  adminGetTransactionListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminUserTransactionList.loading === true
    ) {
      return;
    }
    commit("admin_set_transaction_list_loading", true);

    getters.socketAdmin.emit("getTransactionList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_transaction_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_transaction_list_loading", false);
    });
  },
  adminGetUserGameListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminUserGameList.loading === true
    ) {
      return;
    }
    commit("admin_set_user_game_list_loading", true);

    getters.socketAdmin.emit("getUserGameList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_user_game_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_user_game_list_loading", false);
    });
  },
  adminGetAffiliateListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminAffiliateList.loading === true
    ) {
      return;
    }
    commit("admin_set_affiliate_list_loading", true);

    getters.socketAdmin.emit("getAffiliateList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_affiliate_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_affiliate_list_loading", false);
    });
  },
  adminGetPromoListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminPromoList.loading === true
    ) {
      return;
    }
    commit("admin_set_promo_list_loading", true);

    getters.socketAdmin.emit("getPromoList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_promo_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_promo_list_loading", false);
    });
  },
  adminGetCashierListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminCashierList.loading === true
    ) {
      return;
    }
    commit("admin_set_cashier_list_loading", true);

    getters.socketAdmin.emit("getCashierList", data, (res) => {
      if (res.success === true) {
        console.log("get cashier list: ", res);
        commit("admin_set_cashier_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_cashier_list_loading", false);
    });
  },
  adminGetLeaderboardListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminLeaderboardList.loading === true
    ) {
      return;
    }
    commit("admin_set_leaderboard_list_loading", true);

    getters.socketAdmin.emit("getLeaderboardList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_leaderboard_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_leaderboard_list_loading", false);
    });
  },
  adminGetFilterListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminLeaderboardList.loading === true
    ) {
      return;
    }
    commit("admin_set_filter_list_loading", true);

    getters.socketAdmin.emit("getFilterList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_filter_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_filter_list_loading", false);
    });
  },
  adminGetStatsDataSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminStatsData.loading === true
    ) {
      return;
    }
    commit("admin_set_stats_data_loading", true);

    getters.socketAdmin.emit("getStatsData", data, (res) => {
      if (res.success === true) {
        commit("admin_set_stats_data", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_stats_data_loading", false);
    });
  },
  adminGetStatsListSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketAdmin === null ||
      getters.adminStatsList.loading === true
    ) {
      return;
    }
    commit("admin_set_stats_list_loading", true);

    getters.socketAdmin.emit("getStatsList", data, (res) => {
      if (res.success === true) {
        commit("admin_set_stats_list", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("admin_set_stats_list_loading", false);
    });
  },
  adminSendSettingValueSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminSettingValue");

    getters.socketAdmin.emit("sendSettingValue", data, (res) => {
      if (res.success === true) {
        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully updated the page settings.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendUserValueSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminUserValue");

    getters.socketAdmin.emit("sendUserValue", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { user: res.user });

        if (getters.adminUserList.data !== null) {
          commit("admin_update_user_list", res.user);
        }

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully updated the user.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendUserBalanceSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminUserBalance");

    getters.socketAdmin.emit("sendUserBalance", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { user: res.user });

        if (getters.adminUserList.data !== null) {
          commit("admin_update_user_list", res.user);
        }

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully updated the users balance.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendUserMuteSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminUserMute");

    getters.socketAdmin.emit("sendUserMute", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { user: res.user });
        dispatch("modalsSetShow", null);

        if (getters.adminUserList.data !== null) {
          commit("admin_update_user_list", res.user);
        }
        dispatch("notificationShow", {
          type: "success",
          message: "User updated!",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminUnfreeze({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminUserBan");

    getters.socketAdmin.emit("unfreeze", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetShow", null);
        dispatch("notificationShow", {
          type: "success",
          message: "User unfrozen!",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSetUserEmail({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminSetEmail");

    getters.socketAdmin.emit("setUserEmail", data, (res) => {
      if (res.success === true) {
        dispatch("notificationShow", {
          type: "success",
          message: "Email changed!",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendUserBanSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminUserBan");

    getters.socketAdmin.emit("sendUserBan", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { user: res.user });
        dispatch("modalsSetShow", null);

        if (getters.adminUserList.data !== null) {
          commit("admin_update_user_list", res.user);
        }
        dispatch("notificationShow", {
          type: "success",
          message: "User updated!",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendAffiliateBlockSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminAffiliateBlock");

    getters.socketAdmin.emit("sendAffiliateBlock", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { affiliate: res.affiliate });

        if (
          getters.adminAffiliateList.data.findIndex(
            (element) => element._id === res.affiliate._id
          ) !== -1
        ) {
          commit("admin_update_affiliate_list", res.affiliate);
        }

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully update the users affiliate block.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendAffiliateClearSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminAffiliateClear");

    getters.socketAdmin.emit("sendAffiliateClear", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { affiliate: res.affiliate });

        if (
          getters.adminAffiliateList.data.findIndex(
            (element) => element._id === res.affiliate._id
          ) !== -1
        ) {
          commit("admin_update_affiliate_list", res.affiliate);
        }

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully cleared the users affiliates.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSetAffiliateCodeSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminAffiliateBlock");

    getters.socketAdmin.emit("setAffiliateCode", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { affiliate: res.affiliate });

        if (
          getters.adminAffiliateList.data.findIndex(
            (element) => element._id === res.affiliate._id
          ) !== -1
        ) {
          commit("admin_update_affiliate_list", res.affiliate);
        }

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully updated the users affiliate code.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendAffiliateAvailableSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminAffiliateAvailable");

    getters.socketAdmin.emit("sendAffiliateAvailable", data, (res) => {
      if (res.success === true) {
        dispatch("modalsSetData", { affiliate: res.affiliate });

        if (
          getters.adminAffiliateList.data.findIndex(
            (element) => element._id === res.affiliate._id
          ) !== -1
        ) {
          commit("admin_update_affiliate_list", res.affiliate);
        }

        dispatch("notificationShow", {
          type: "success",
          message:
            "You have successfully updated the users available earnings.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendPromoCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminPromoCreate");

    getters.socketAdmin.emit("sendPromoCreate", data, (res) => {
      if (res.success === true) {
        commit("admin_add_promo_list", res.promo);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully created a new promo code.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendPromoRemoveSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminPromoRemove");

    getters.socketAdmin.emit("sendPromoRemove", data, (res) => {
      if (res.success === true) {
        commit("admin_remove_promo_list", res.promo);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully removed the promo code.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendCashierCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminCashierCreate");

    getters.socketAdmin.emit("sendCashierCreate", data, (res) => {
      if (res.success === true) {
        commit("admin_set_cashier_list_codes", res.codes);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully created a new gift code.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendCashierCryptoActionSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminCashierCryptoAction");

    getters.socketAdmin.emit("sendCashierCryptoAction", data, (res) => {
      if (res.success === true) {
        console.log("approved withdraw trx: ", res.transaction);
        commit("admin_remove_cashier_list", res.transaction);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendCashierMmoActionSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading");

    getters.socketAdmin.emit("sendCashierMmoAction", data, (res) => {
      if (res.success === true) {
        dispatch("notificationShow", { type: "success", message: "Done" });
      } else {
        dispatch("notificationShow", res.error);
      }
      commit("admin_cashier_chats_remove_ticket", data);
      commit("socket_set_send_loading", null);
    });
  },

  adminSendLeaderboardCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminLeaderboardCreate");

    getters.socketAdmin.emit("sendLeaderboardCreate", data, (res) => {
      if (res.success === true) {
        commit("admin_add_leaderboard_list", res.leaderboard);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully created a new leaderboard.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendLeaderboardStopSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminLeaderboardStop");

    getters.socketAdmin.emit("sendLeaderboardStop", data, (res) => {
      if (res.success === true) {
        if (res.leaderboard.state === "created") {
          commit("admin_remove_leaderboard_list", res.leaderboard);
        } else {
          commit("admin_update_leaderboard_list", res.leaderboard);
        }
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendFilterCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminFilterCreate");

    getters.socketAdmin.emit("sendFilterCreate", data, (res) => {
      if (res.success === true) {
        commit("admin_add_filter_list", res.filter);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully added a new filter phrase.",
        });
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  adminSendFilterRemoveSocket({ getters, commit, dispatch }, data) {
    if (getters.socketAdmin === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "AdminFilterRemove");

    getters.socketAdmin.emit("sendFilterRemove", data, (res) => {
      if (res.success === true) {
        commit("admin_remove_filter_list", res.filter);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const admin = {
  state,
  mutations,
  actions,
  getters,
};

export default admin;
