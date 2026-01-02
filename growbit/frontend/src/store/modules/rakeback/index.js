const state = {
  rakebackData: {
    rakeback: null,
    loading: false,
  },
};

const getters = {
  rakebackData: (state) => state.rakebackData,
};

const mutations = {
  rakeback_set_data(state, data) {
    state.rakebackData.rakeback = [
      { type: "daily", ...data.rakeback.daily },
      { type: "weekly", ...data.rakeback.weekly },
      { type: "monthly", ...data.rakeback.monthly },
    ];
  },
  rakeback_update(state, type) {
    const index = state.rakebackData.rakeback.findIndex((r) => r.type === type);
    if (index >= 0) {
      const updatedRakeback = [...state.rakebackData.rakeback];
      updatedRakeback[index] = {
        ...updatedRakeback[index],
        lastClaimed: new Date(),
      };
      state.rakebackData.rakeback = updatedRakeback;
    }
  },
  rakeback_set_data_loading(state, status) {
    state.rakebackData.loading = status;
  },
};

const actions = {
  rakebackGetDataSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketGeneral === null ||
      getters.rakebackData.loading === true
    ) {
      return;
    }
    commit("rakeback_set_data_loading", true);

    getters.socketGeneral.emit("getRakebackData", data, (res) => {
      if (res.success === true) {
        commit("rakeback_set_data", res);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("rakeback_set_data_loading", false);
    });
  },
  rakebackSendClaimSocket({ getters, commit, dispatch }, data) {
    if (getters.socketGeneral === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "RakebackClaim");

    getters.socketGeneral.emit("sendRakebackClaim", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        commit("rakeback_update", data.rakebackType);

        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully claimed your rakeback earnings.",
        });
        dispatch("modalsSetShow", null);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const rakeback = {
  state,
  mutations,
  actions,
  getters,
};

export default rakeback;
