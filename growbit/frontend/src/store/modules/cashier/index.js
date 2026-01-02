import axios from "axios";

const state = {
  cashierCryptoData: {
    prices: null,
    addresses: null,
    loading: false,
    error: false,
  },
  growtopia: {
    inProgress: false,
    world: null,
    loading: null,
    error: false,
    type: null,
  },
  rates: {
    data: null,
    loading: false,
  },
  selectedCurrency: "DLS",
};

const getters = {
  cashierCryptoData: (state) => state.cashierCryptoData,
  growtopiaTransaction: (state) => state.growtopia,
  fiatRates: (state) => state.rates,
  selectedCurrency: (state) => state.selectedCurrency,
};

const mutations = {
  cashier_set_currency(state, data) {
    state.selectedCurrency = data;
    localStorage.setItem("SELECTED_CURRENCY", data);
  },
  cashier_set_crypto_data(state, data) {
    state.cashierCryptoData.prices = data.prices;
    state.cashierCryptoData.addresses = data.addresses;
  },
  cashier_set_crypto_data_loading(state, status) {
    state.cashierCryptoData.loading = status;
  },
  cashier_end_growtopia_transaction(state) {
    state.growtopia.loading = false;
    state.growtopia.inProgress = false;
    state.growtopia.world = null;
    state.growtopia.type = null;
  },
  cashier_growtopia_transaction_loading(state, data = true) {
    state.growtopia.loading = data;
  },
  cashier_set_growtopia_progress(state, data) {
    console.log("Growtopia transaction in progress ", data);
    state.growtopia.inProgress = true;
    state.growtopia.loading = false;
    state.growtopia.world = data.world;
    state.growtopia.type = data.type;
  },
  cashier_set_crypto_data_error(state) {
    state.cashierCryptoData.error = true;
  },
  cashier_set_fiat_rates_loading(state, data) {
    state.rates.loading = data;
  },
  cashier_set_fiat_rates(state, data) {
    state.rates.data = data;
  },
};

const actions = {
  getFiatRates({ getters, commit, dispatch }, data) {
    commit("cashier_set_fiat_rates_loading", true);

    axios
      .get("/exchange-rates")
      .then(({ data }) => {
        commit("cashier_set_fiat_rates", data);
        commit("cashier_set_fiat_rates_loading", false);
      })
      .catch((e) => {
        dispatch("notificationShow", e);
        commit("cashier_set_fiat_rates_loading", false);
      });
  },
  setFiatRates({ getters, commit, dispatch }, rates) {
    commit("cashier_set_fiat_rates", rates);
  },
  setCurrency({ getters, commit, dispatch }, data) {
    commit("cashier_set_currency", data);
  },
  growtopiaTransactionInProgress({ getters, commit, dispatch }, data) {
    commit("cashier_set_growtopia_progress", data);
  },
  cashierSocketCryptoTransaction({ getters, commit, dispatch }, data) {
    if (
      data.transaction.state === "completed" &&
      data.transaction.type === "deposit"
    ) {
      dispatch("notificationShow", {
        type: "success",
        message:
          "Your " +
          data.transaction.data.currency +
          " deposit has been credited to your balance.",
      });
      //TODO : update balance
    } else if (
      data.transaction.state === "completed" &&
      data.transaction.type === "withdraw"
    ) {
      console.log("==> withdrawal request done: ", data);
      dispatch("notificationShow", {
        type: "success",
        message:
          "Your " +
          data.transaction.data.currency +
          " withdrawal request has been successfully processed.",
      });
    }
  },
  cashierGetCryptoDataSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketCashier === null ||
      getters.cashierCryptoData.loading === true
    ) {
      return;
    }
    commit("cashier_set_crypto_data_loading", true);
    getters.socketCashier.emit("getCryptoData", data, (res) => {
      if (res.success === true) {
        commit("cashier_set_crypto_data", res);
      } else {
        if (
          res.error.message ===
          "The network is busy while creating the coin account."
        ) {
          commit("cashier_set_crypto_data_error");
          console.log("Failed addresses from network, try again...");
        } else {
          dispatch("notificationShow", res.error);
        }
      }

      commit("cashier_set_crypto_data_loading", false);
    });
  },
  cashierGetGrowtopiaActiveTransactions({ getters, commit, dispatch }, data) {
    if (
      getters.socketCashier === null ||
      getters.socketSendLoading !== null ||
      !getters.socketCashier.connected ||
      getters.growtopiaTransaction.inProgress
    ) {
      return;
    }
    commit("cashier_growtopia_transaction_loading");
    console.log("Getting active Growtopia transactions.");

    getters.socketCashier.emit(
      "getActiveGrowtopiaTransactions",
      data,
      (res) => {
        if (res.success === false) {
          dispatch("notificationShow", res.error);
        } else {
          if (res.data) {
            dispatch("growtopiaTransactionInProgress", res.data);
          }
        }
        commit("cashier_growtopia_transaction_loading", false);
      }
    );
  },
  cashierSendGrowtopiaDepositSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketCashier === null ||
      getters.socketSendLoading !== null ||
      !getters.socketCashier.connected
    ) {
      return;
    }
    commit("cashier_growtopia_transaction_loading");

    console.log("Send Growtopia deposit request");

    getters.socketCashier.emit("sendGrowtopiaDeposit", data, (res) => {
      if (res.success === false) {
        console.error("Growtopia deposit error", res);
        dispatch("notificationShow", res.error);
      } else {
        commit("auth_update_user", res.user);
        dispatch("notificationShow", {
          type: "success",
          message: "Deposit has been completed!",
        });
      }

      commit("cashier_end_growtopia_transaction");
    });
  },
  cashierSendGrowtopiaWithdrawSocket({ getters, commit, dispatch }, data) {
    if (
      getters.socketCashier === null ||
      getters.socketSendLoading !== null ||
      !getters.socketCashier.connected
    ) {
      return;
    }

    commit("cashier_growtopia_transaction_loading");

    getters.socketCashier.emit("sendGrowtopiaWithdraw", data, (res) => {
      if (res.success === false) {
        dispatch("notificationShow", res.error);
      } else {
        commit("auth_update_user", res.user);
        dispatch("notificationShow", {
          type: "success",
          message: "Withdraw has been completed!",
        });
      }

      commit("cashier_end_growtopia_transaction");
    });
  },
  cashierSendCryptoWithdrawDepositSocket({ getters, commit, dispatch }, data) {
    if (getters.socketCashier === null || getters.socketSendLoading !== null) {
      return;
    }
    commit("socket_set_send_loading", "CryptoWithdraw");

    getters.socketCashier.emit("sendCryptoWithdraw", data, (res) => {
      if (res.success === true) {
        commit("auth_update_user", res.user);
        dispatch("notificationShow", {
          type: "success",
          message:
            "Your " +
            res.transaction.data.currency +
            " withdrawal request has been submitted for manual review.",
        });
        dispatch("modalsSetShow", null);
      } else {
        dispatch("notificationShow", res.error);
      }

      commit("socket_set_send_loading", null);
    });
  },
};

const cashier = {
  state,
  mutations,
  actions,
  getters,
};

export default cashier;
