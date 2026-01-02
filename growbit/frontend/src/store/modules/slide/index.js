const state = {
  slideData: {
    game: null,
    bets: [],
    history: [],
    loading: false,
  },
};

const getters = {
  slideData: (state) => state.slideData,
};

const mutations = {
  slide_set_data_game(state, game) {
    state.slideData.game = game;
  },
  slide_set_data_bets(state, bets) {
    state.slideData.bets = bets;
  },
  slide_add_data_bets(state, bet) {
    state.slideData.bets.unshift(bet);
  },
  slide_set_data_history(state, history) {
    state.slideData.history = history;
  },
  slide_add_data_history(state, game) {
    state.slideData.history.unshift(game);
  },
  slide_remove_last_data_history(state) {
    state.slideData.history.pop();
  },
  slide_set_data_loading(state, status) {
    state.slideData.loading = status;
  },
};

const actions = {
  slideSocketInit({ commit }, data) {
    commit("slide_set_data_game", data.game);
    commit("slide_set_data_bets", data.bets);
    commit("slide_set_data_history", data.history);
  },
  slideSocketGame({ getters, commit }, data) {
    commit("slide_set_data_game", data.game);

    if (data.game.state === "completed") {
      commit("slide_add_data_history", data.game);
      if (getters.slideData.history.length > 100) {
        commit("slide_remove_last_data_history");
      }
    } else if (data.game.state === "created") {
      commit("slide_set_data_bets", []);
    }
  },
  slideSocketBet({ commit }, data) {
    commit("slide_add_data_bets", data.bet);
  },
  // slideGetDataSocket({ getters, commit, dispatch }, data) {
  //     if(getters.slideData.loading === true) { return; }
  //     commit('slide_set_data_loading', true);

  //     getters.socketSlide.emit('getData', data, (res) => {
  //         if(res.success === true) {
  //             commit('slide_set_data_game', res.game);
  //             commit('slide_set_data_bets', res.bets);
  //             commit('slide_set_data_history', res.history);
  //         } else {
  //             dispatch('notificationShow', res.error);
  //         }

  //         commit('slide_set_data_loading', false);
  //     });
  // },
  slideSendBetSocket({ getters, commit, dispatch }, data) {
    if (getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "slideBet");

    getters.socketSlide.emit("sendBet", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const slide = {
  state,
  mutations,
  actions,
  getters,
};

export default slide;
