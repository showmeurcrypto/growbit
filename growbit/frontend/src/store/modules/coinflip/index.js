const state = {
  coinflipFilterAnimation: "normal",
  coinflipFilterCount: 2,
  coinflipFilterSort: "new",
  coinflipGames: [],
  coinflipGameData: {
    game: null,
    loading: false,
  },
};

const getters = {
  coinflipFilterAnimation: (state) => state.coinflipFilterAnimation,
  coinflipFilterCount: (state) => state.coinflipFilterCount,
  coinflipFilterSort: (state) => state.coinflipFilterSort,
  coinflipGames: (state) => state.coinflipGames,
  coinflipGameData: (state) => state.coinflipGameData,
};

const mutations = {
  coinflip_set_filter_animation(state, value) {
    state.coinflipFilterAnimation = value;
  },
  coinflip_set_filter_count(state, value) {
    state.coinflipFilterCount = value;
  },
  coinflip_set_filter_sort(state, value) {
    state.coinflipFilterSort = value;
  },
  coinflip_set_games(state, games) {
    state.coinflipGames = games;
  },
  coinflip_add_games(state, game) {
    state.coinflipGames.push(game);
  },
  coinflip_update_games(state, game) {
    state.coinflipGames.splice(
      state.coinflipGames.findIndex((element) => element._id === game._id),
      1,
      game
    );

    if (game.state == "completed") {
      setTimeout(() => {
        state.coinflipGames = state.coinflipGames.filter(
          (element) => element._id !== game._id
        );
      }, 10000);
    }
  },
  coinflip_remove_games(state, game) {
    state.coinflipGames = state.coinflipGames.filter(
      (element) => element._id !== game._id
    );
  },
  coinflip_set_game_data_game(state, game) {
    state.coinflipGameData.game = game;
  },
  coinflip_set_game_data_loading(state, status) {
    state.coinflipGameData.loading = status;
  },
};

const actions = {
  coinflipRemoveGame({ commit }, game) {
    commit("coinflip_remove_games", game);
  },
  coinflipSetFilterAnimation({ commit }, value) {
    commit("coinflip_set_filter_animation", value);
  },
  coinflipSetFilterCount({ commit }, value) {
    commit("coinflip_set_filter_count", value);
  },
  coinflipSetFilterSort({ commit }, value) {
    commit("coinflip_set_filter_sort", value);
  },
  coinflipSetGameData({ commit }, game) {
    commit("coinflip_set_game_data_game", game);
  },
  coinflipSocketInit({ commit }, data) {
    commit("coinflip_set_games", data.games);
  },
  coinflipSocketGame({ getters, commit }, data) {
    if (
      getters.coinflipGames.some((element) => element._id === data.game._id) ===
      true
    ) {
      commit("coinflip_update_games", data.game);
    } else {
      commit("coinflip_add_games", data.game);
    }
  },
  coinflipSendCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketCoinflip === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "CoinflipCreate");

    getters.socketCoinflip.emit("createCoinflipGame", data, (res) => {
      if (res.success === false) {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  coinflipCallCoinflipBotSocket({ getters, commit, dispatch }, data) {
    if (getters.socketCoinflip === null || getters.socketSendLoading !== null) {
      return;
    }

    getters.socketCoinflip.emit("callCoinflipBot", data, (res) => {
      if (!res.success) {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  coinflipSendJoinSocket({ getters, commit, dispatch }, data) {
    if (getters.socketCoinflip === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "CoinflipJoin");

    getters.socketCoinflip.emit("joinCoinflipGame", data, (res) => {
      if (res.success === false) {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const coinflip = {
  state,
  mutations,
  actions,
  getters,
};

export default coinflip;
