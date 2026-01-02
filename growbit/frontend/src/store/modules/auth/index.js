import axios from "axios";

const state = {
  authSendLoginLoading: false,
  authStep: "login",
  authToken:
    localStorage.getItem("token") === null
      ? null
      : localStorage.getItem("token"),
  authUser: {
    user: null,
    loading: false,
  },
};

const getters = {
  authSendLoginLoading: (state) => state.authSendLoginLoading,
  authToken: (state) => state.authToken,
  authUser: (state) => state.authUser,
};

const mutations = {
  auth_set_send_login_loading(state, status) {
    state.authSendLoginLoading = status;
  },
  auth_set_token(state, token) {
    state.authToken = token;
  },
  auth_set_user(state, user) {
    state.authUser.user = user;
  },
  auth_update_user(state, user) {
    const fieldsToUpdate = [
      "balance",
      "stats",
      "ban",
      "discordId",
      "discordToken",
    ];

    for (const key of fieldsToUpdate) {
      if (user[key] !== undefined) {
        state.authUser.user[key] = user[key];
      }
    }
  },
  update_ignore_list(state, user) {
    state.authUser.user.ignoreList = user.ignoreList;
  },
  add_claimed_key(state, key) {
    if (state.authUser?.user?.claimedKeys) {
      state.authUser.user.claimedKeys.push(key);
    }
  },
  toggle_favourite_slot(state, slot) {
    let favourites = state.authUser.user.favouriteSlots;
    const index = favourites.indexOf(slot);
    if (index < 0) {
      favourites.push(slot);
    } else {
      favourites = favourites.splice(index, 1);
    }
  },
  auth_set_user_anonymous(state, anonymous) {
    state.authUser.user.anonymous = anonymous;
  },
  auth_set_user_loading(state, status) {
    state.authUser.loading = status;
  },
};

const actions = {
  addClaimedKey({ commit }, key) {
    commit("addClaimedKey", key);
  },
  async authGetUser({ getters, commit, dispatch }, data) {
    if (getters.authUser.loading === true) {
      return;
    }
    commit("auth_set_user_loading", true);
    try {
      const res = await axios.get("/auth/me", data);
      if (res.data.success) {
        commit("auth_set_user", res.data.user);
        dispatch("socketConnectCashier");
        //dispatch("socketConnectMmoCashier");
        dispatch("socketConnectSupportChat");
        dispatch("notificationsLoad");
        dispatch("getFiatRates");
        dispatch("rakebackGetDataSocket");

        const selectedCurrency = localStorage.getItem("SELECTED_CURRENCY");

        if (selectedCurrency) {
          dispatch("setCurrency", selectedCurrency);
        }

        if (res.data.user.rank === "admin" || res.data.user.rank === "mod") {
          dispatch("socketConnectAdmin");
        }
        if (res.data.user.rank === "admin") {
          sessionStorage.setItem("admin", "yes");
        }
      }
    } catch (err) {
      if (err?.status === 401) {
        dispatch("authLogoutUser");
      }

      dispatch("notificationShow", err);
    }

    commit("auth_set_user_loading", false);
  },
  async authSendCredentialsLogin({ getters, commit, dispatch }, data) {
    if (getters.authSendLoginLoading === true) {
      return;
    }
    commit("auth_set_send_login_loading", true);

    try {
      const res = await axios.post("/auth/credentials", data);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["x-auth-token"] = res.data.token;

        commit("auth_set_token", res.data.token);
        commit("auth_set_user", res.data.user);

        dispatch("socketConnectGeneral");
        dispatch("socketConnectCashier");
        dispatch("getFiatRates");
        dispatch("rakebackGetDataSocket");

        if (res.data.user.rank === "admin" || res.data.user.rank === "mod") {
          dispatch("socketConnectAdmin");
        }

        dispatch("modalsSetShow", null);
      }
    } catch (err) {
      dispatch("notificationShow", err);
    }

    commit("auth_set_send_login_loading", false);
  },

  async authSendCredentialsRegister({ getters, commit, dispatch }, data) {
    if (getters.authSendLoginLoading === true) {
      return;
    }
    commit("auth_set_send_login_loading", true);

    try {
      const res = await axios.post("/auth/credentials/register", data);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["x-auth-token"] = res.data.token;

        commit("auth_set_token", res.data.token);
        commit("auth_set_user", res.data.user);

        dispatch("socketConnectGeneral");
        dispatch("socketConnectCashier");
        dispatch("getFiatRates");
        dispatch("rakebackGetDataSocket");

        if (res.data.user.rank === "admin" || res.data.user.rank === "mod") {
          dispatch("socketConnectAdmin");
        }

        dispatch("modalsSetShow", null);
        let num = Math.floor(Math.random() * 9) + 1;
        localStorage.setItem("avatar", num);
      }
    } catch (err) {
      dispatch("notificationShow", err);
    }

    commit("auth_set_send_login_loading", false);
  },
  async authSendCredentialsRequest({ getters, commit, dispatch }, data) {
    if (getters.authSendLoginLoading === true) {
      return;
    }
    commit("auth_set_send_login_loading", true);

    try {
      const res = await axios.post("/auth/credentials/request", data);
      if (res.data.success) {
        dispatch("notificationShow", {
          type: "success",
          message: "Reset link sent, check your email.",
        });
      }
    } catch (err) {
      dispatch("notificationShow", err);
    }

    commit("auth_set_send_login_loading", false);
  },
  async authSendCredentialsVerify({ getters, commit, dispatch }, data) {
    if (getters.authSendLoginLoading === true) {
      return;
    }
    commit("auth_set_send_login_loading", true);

    try {
      const res = await axios.post("/auth/credentials/verify", data);
      if (state.authUser?.user?.local) {
        state.authUser.user.local.emailVerified = true;
      }
      if (res.data.success) {
        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully verified your email.",
        });
      }
    } catch (err) {
      dispatch("notificationShow", err);
    }

    commit("auth_set_send_login_loading", false);
  },
  async authSendCredentialsReset({ getters, commit, dispatch }, data) {
    if (getters.authSendLoginLoading === true) {
      return;
    }
    commit("auth_set_send_login_loading", true);

    try {
      const res = await axios.post("/auth/credentials/reset", data);
      if (res.data.success) {
        dispatch("notificationShow", {
          type: "success",
          message: "You have successfully reset your password.",
        });
      }
    } catch (err) {
      dispatch("notificationShow", err);
    }

    commit("auth_set_send_login_loading", false);
  },
  authLogoutUser({ commit }) {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["x-auth-token"];
    commit("auth_set_user", null);
    commit("auth_set_token", null);
  },
  userToggleFavouriteSlot({ commit }, slot) {
    commit("toggle_favourite_slot", slot);
  },
};

const auth = {
  state,
  mutations,
  actions,
  getters,
};

export default auth;
