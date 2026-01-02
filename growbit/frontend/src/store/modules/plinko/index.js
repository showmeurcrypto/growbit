const state = {
  plinkoFilterRows: 13,
  plinkoGames: [],
  plinkoHistory: [],
};

const getters = {
  plinkoFilterRows: (state) => state.plinkoFilterRows,
  plinkoGames: (state) => state.plinkoGames,
  plinkoHistory: (state) => state.plinkoHistory,
};

const mutations = {
  plinko_set_filter_rows(state, value) {
    state.plinkoFilterRows = value;
  },
  plinko_add_game(state, game) {
    state.plinkoGames.push(game);
  },
  plinko_remove_game(state, game) {
    state.plinkoGames.splice(
      state.plinkoGames.findIndex((element) => element._id === game._id),
      1
    );
    state.plinkoHistory.unshift(game.multiplier);
    if (state.plinkoHistory.length > 10) {
      state.plinkoHistory.pop();
    }
  },
  plinko_empty_games(state) {
    state.plinkoGames = [];
  },
};

const actions = {
  plinkoSetFilterRows({ getters, commit }, value) {
    if (getters.plinkoFilterRows === value) {
      return;
    }
    commit("plinko_set_filter_rows", value);
  },
  plinkoSendCreateSocket({ getters, commit, dispatch }, data) {
    if (getters.socketPlinko === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "PlinkoCreate");
    getters.socketPlinko.emit("sendCreate", data, (res) => {
      if (res.success === true) {
        commit("plinko_add_game", res.game);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  plinkoSocketGame({ commit }, data) {
    commit("plinko_add_game", data.bet);
  },
  plinkoRemoveGame({ commit }, game) {
    commit("plinko_remove_game", game);
  },
  plinkoClearGames({ commit }) {
    commit("plinko_empty_games");
  },
};

const plinko = {
  state,
  mutations,
  actions,
  getters,
};

export default plinko;
