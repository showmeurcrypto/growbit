const ignoreMsg = new Set([
  "You have no running mines game at the moment.",
  "Your entered tile is already revealed.",
]);

const state = {
  minesGame: null,
  minesAutobet: false,
  minesAutoActive: false,
  minesSelected: [],
  minesCount: 1,
  minesGridSize: 25,
};

const getters = {
  minesGame: (state) => state.minesGame,
  minesAutobet: (state) => state.minesAutobet,
  minesSelected: (state) => state.minesSelected,
  minesCount: (state) => state.minesCount,
  minesAutoActive: (state) => state.minesAutoActive,
  minesGridSize: (state) => state.minesGridSize,
};

const mutations = {
  mines_set_game(state, game) {
    state.minesGame = game;
  },
  mines_set_count(state, count) {
    state.minesCount = count;
  },
  mines_set_autobet(state, autobet) {
    state.minesAutobet = autobet;
  },
  mines_push_to_selected(state, tile) {
    state.minesSelected.push(tile);
  },
  mines_pop_from_selected(state, tile) {
    state.minesSelected = state.minesSelected.filter((curr) => {
      curr !== tile;
    });
  },
  mines_clear_selected(state) {
    state.minesSelected = [];
  },
  mines_set_auto_active(state, autoactive) {
    state.minesAutoActive = autoactive;
  },
  mines_set_grid_size(state, size) {
    state.minesGridSize = size;
  },
};

const actions = {
  minesClearGame({ commit }) {
    commit("mines_set_game", null);
  },
  minesClearSelected({ commit }) {
    commit("mines_clear_selected");
  },
  minesSetAutobet({ commit }, data) {
    commit("mines_set_autobet", data.autobet);
  },
  minesSetAutoActive({ commit }, data) {
    commit("mines_set_auto_active", data.autoactive);
  },
  minesSetGridSize({ commit }, data) {
    commit("mines_set_grid_size", data.size);
  },
  minesPushToSelected({ commit }, data) {
    commit("mines_push_to_selected", data.tile);
  },
  minesSetCount({ commit }, count) {
    commit("mines_set_count", count);
  },
  minesPopFromSelected({ commit }, data) {
    commit("mines_pop_from_selected", data.tile);
  },
  minesSocketInit({ commit }, data) {
    // console.log(data);
    if (data.game) {
      commit("mines_set_game", data.game);
      commit("mines_set_grid_size", data.game.gridSize);
      commit("mines_set_count", data.game.minesCount);
    }
  },
  minesSendBetSocket({ getters, commit, dispatch }, data) {
    if (getters.socketMines === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "MinesBet");

    getters.socketMines.emit("sendBet", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        commit("mines_set_game", res.game);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
  minesAutobetSocket({ getters, commit, dispatch }, data) {
    // console.log("executing autobet");
    if (getters.socketMines === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "MinesBet");

    getters.socketMines.emit("autobet", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        //  console.log("setting autobet game");
        commit("mines_set_game", res.game);
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
  minesSendRevealSocket({ getters, commit, dispatch }, data) {
    if (getters.socketMines === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "MinesReveal");

    getters.socketMines.emit("sendReveal", data, (res) => {
      if (res.success === true) {
        commit("mines_set_game", res.game);

        if (res.game.state !== "completed" || res.game.payout > 0) {
          dispatch("playMinesReveal", null, {});
        } else {
          dispatch("playExplosion");
        }
      } else {
        if (!ignoreMsg.has(res.error.message)) {
          dispatch("notificationShow", res.error);
        }
      }

      commit("socket_set_send_loading", null);
    });
  },
  minesSendCashoutSocket({ getters, commit, dispatch }, data) {
    if (getters.socketMines === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "MinesCashout");

    getters.socketMines.emit("sendCashout", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        commit("mines_set_game", res.game);
        dispatch("playSoundCash");
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const mines = {
  state,
  mutations,
  actions,
  getters,
};

export default mines;
