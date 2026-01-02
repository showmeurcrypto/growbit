const state = {
  towersRisk: "easy",
  towersGame: null,
  towersAutobet: false,
  towersAutoActive: false,
  towersSelected: [],
};

const getters = {
  towersRisk: (state) => state.towersRisk,
  towersGame: (state) => state.towersGame,
  towersAutobet: (state) => state.towersAutobet,
  towersAutoActive: (state) => state.towersAutoActive,
  towersSelected: (state) => state.towersSelected,
};

const mutations = {
  towers_set_risk(state, value) {
    state.towersRisk = value;
  },
  towers_set_game(state, game) {
    state.towersGame = game;
  },
  towers_set_autobet(state, autobet) {
    state.towersAutobet = autobet;
  },
  towers_push_to_selected(state, tile) {
    state.towersSelected.push(tile);
  },
  towers_pop_from_selected(state, tile) {
    state.towersSelected.pop();
  },
  towers_clear_selected(state) {
    state.towersSelected = [];
  },
};

const actions = {
  towersSetRisk({ commit }, value) {
    // commit("towers_clear_selected");
    // commit("towers_set_game", null);
    commit("towers_set_risk", value);
  },
  towersClearSelected({ commit }) {
    commit("towers_clear_selected");
  },
  towersSetAutobet({ commit }, data) {
    commit("towers_set_autobet", data.autobet);
  },
  towersPushToSelected({ commit }, data) {
    commit("towers_push_to_selected", data.tile);
  },
  towersPopFromSelected({ commit }) {
    commit("towers_pop_from_selected");
  },
  towersClearGame({ commit }) {
    commit("towers_set_game", null);
  },
  towersSocketInit({ commit }, data) {
    if (data.game) {
      commit("towers_set_risk", data.game.risk);
      commit("towers_set_game", data.game);
    }
  },
  towersSendBetSocket({ getters, commit, dispatch }, data) {
    if (getters.socketTowers === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "TowersBet");

    getters.socketTowers.emit("sendBet", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        commit("towers_set_game", res.game);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  towersAutobetSocket({ getters, commit, dispatch }, data) {
    // console.log("executing autobet");
    if (getters.socketTowers === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "TowersBet");

    getters.socketTowers.emit("autobet", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        //  console.log("setting autobet game");
        commit("towers_set_game", res.game);
        if (res.game.payout == 0) {
          dispatch("playExplosion");
        } else {
          dispatch("playMinesReveal", null, {});
        }
        //  console.log("autobet game set");
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  towersSendRevealSocket({ getters, commit, dispatch }, data) {
    if (getters.socketTowers === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "TowersReveal");

    getters.socketTowers.emit("sendReveal", data, (res) => {
      if (res.success === true) {
        commit("towers_set_game", res.game);

        if (res.game.state !== "completed" || res.game.payout > 0) {
          dispatch("playMinesReveal", null, {});
        } else {
          dispatch("playExplosion");
        }
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  towersSendCashoutSocket({ getters, commit, dispatch }, data) {
    if (getters.socketTowers === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "TowersCashout");

    getters.socketTowers.emit("sendCashout", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        commit("towers_set_game", res.game);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const towers = {
  state,
  mutations,
  actions,
  getters,
};

export default towers;
