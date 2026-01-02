import axios from "axios";

const state = {
  challengesData: {
    active: null,
    ended: null,
    error: null,
    loading: false,
  },
};

const getters = {
  challengesData: (state) => state.challengesData,
};

const mutations = {
  challenges_set_data_active(state, challenges) {
    state.challengesData.active = challenges;
    state.challengesData.loading = false;
  },
  challenges_set_data_ended(state, challenges) {
    state.challengesData.ended = challenges;
    state.challengesData.loading = false;
  },
  challenges_set_data_loading(state, status) {
    state.challengesData.error = null;
    state.challengesData.loading = status;
  },
  challenges_claim(state, data) {
    if (state.challengesData.active) {
      let challenge = state.challengesData.active.find(
        (c) => c._id?.toString() === data.challengeId?.toString()
      );
      challenge.claimedBy.push(challenge.claimedBy.data.userId);
      challenge.remainingClaims--;
    }
  },
};

const actions = {
  challengeClaim({ getters, commit, dispatch }, data) {
    commit("challenges_claim", data);
  },
  challengesGetActive({ getters, commit, dispatch }) {
    axios
      .get("/challenges/active")
      .then(({ data }) => {
        commit("challenges_set_data_active", data.challenges);
      })
      .catch((e) => {
        state.challengesData.error = e;
        dispatch("notificationShow", e);
        commit("challenges_set_data_loading", false);
      });
  },
  challengesGetEnded({ getters, commit, dispatch }) {
    axios
      .get("/challenges/ended")
      .then(({ data }) => {
        commit("challenges_set_data_ended", data.challenges);
      })
      .catch((e) => {
        const msg = e?.response?.data?.error || {
          type: "error",
          message: "Can't load challenges",
        };
        dispatch("notificationShow", msg);
        commit("challenges_set_data_loading", false);
      });
  },
};

const challenges = {
  state,
  mutations,
  actions,
  getters,
};

export default challenges;
