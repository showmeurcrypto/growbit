import socketIo from "socket.io-client";
const state = {
  socketSendLoading: null,
  socketGeneral: socketIo(process.env.VUE_APP_SOCKET_URL + "/general", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketCrash: socketIo(process.env.VUE_APP_SOCKET_URL + "/crash", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketMines: socketIo(process.env.VUE_APP_SOCKET_URL + "/mines", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketPlinko: socketIo(process.env.VUE_APP_SOCKET_URL + "/plinko", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketSlide: socketIo(process.env.VUE_APP_SOCKET_URL + "/slide", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketCashier: socketIo(process.env.VUE_APP_SOCKET_URL + "/cashier", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketAdmin: socketIo(process.env.VUE_APP_SOCKET_URL + "/admin", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),

  socketBattles: socketIo(process.env.VUE_APP_SOCKET_URL + "/battles", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),

  mmoCashierSocket: socketIo(
    process.env.VUE_APP_SOCKET_URL + "/mmo_cashier_chat",
    {
      auth: {},
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 5000,
      transports: ["websocket"],
    }
  ),
  supportChatSocket: socketIo(
    process.env.VUE_APP_SOCKET_URL + "/support_chat",
    {
      auth: {},
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 5000,
      transports: ["websocket"],
    }
  ),
  socketUnbox: socketIo(process.env.VUE_APP_SOCKET_URL + "/unbox", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketCoinflip: socketIo(process.env.VUE_APP_SOCKET_URL + "/coinflip", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
  socketTowers: socketIo(process.env.VUE_APP_SOCKET_URL + "/towers", {
    auth: {},
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000,
    transports: ["websocket"],
  }),
};

const getters = {
  socketSendLoading: (state) => state.socketSendLoading,
  socketGeneral: (state) => state.socketGeneral,
  socketCrash: (state) => state.socketCrash,
  socketMines: (state) => state.socketMines,
  socketPlinko: (state) => state.socketPlinko,
  socketSlide: (state) => state.socketSlide,
  socketCashier: (state) => state.socketCashier,
  socketAdmin: (state) => state.socketAdmin,
  socketMmoCashier: (state) => state.mmoCashierSocket,
  supportChatSocket: (state) => state.supportChatSocket,
  socketCoinflip: (state) => state.socketCoinflip,
  socketUnbox: (state) => state.socketUnbox,
  socketTowers: (state) => state.socketTowers,
  socketBattles: (state) => state.socketBattles,
};

const mutations = {
  socket_set_send_loading(state, value) {
    state.socketSendLoading = value;
  },
};

const actions = {
  socketSetSendLoading({ commit }, value) {
    commit("socket_set_send_loading", value);
  },
  socketConnectGeneral({ getters, dispatch }) {
    if (getters.socketGeneral.connected === true) {
      getters.socketGeneral.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketGeneral.auth.token = getters.authToken;
    }

    getters.socketGeneral.disconnect().connect();

    dispatch("socketListenGeneral");
  },
  socketDisconnectGeneral({ getters }) {
    getters.socketGeneral.removeAllListeners();
    getters.socketGeneral.disconnect();
  },
  socketListenGeneral({ getters, dispatch }) {
    getters.socketGeneral.on("init", (data) => {
      dispatch("generalSocketInit", data);
      dispatch("chatSocketInit", data);
    });
    getters.socketGeneral.on("settings", (data) => {
      dispatch("generalSocketSettings", data);
    });
    getters.socketGeneral.on("updateExchangeRates", (data) => {
      dispatch("setFiatRates", data.rates);
    });
    getters.socketGeneral.on("user", (data) => {
      dispatch("generalSocketUser", data);
    });
    getters.socketGeneral.on("challengeClaim", (data) => {
      dispatch("challengeClaim", data);
    });
    getters.socketGeneral.on("anonbet", (data) => {
      dispatch("generalSocketAnonbet", data);
    });
    getters.socketGeneral.on("crashSeedUpdate", (data) => {
      dispatch("generalSocketCrashSeedUpdate", data);
    });
    getters.socketGeneral.on("bet", (data) => {
      dispatch("generalSocketBet", data);
    });
    getters.socketGeneral.on("newNotification", (data) => {
      dispatch("newNotification", data);
      dispatch("notificationShow", {
        type: "success",
        message: data.message,
      });
    });
    getters.socketGeneral.on("userTip", (data) => {
      dispatch("userTipSocket", data);
    });
    // getters.socketGeneral.on("chatOnline", (data) => {
    //   dispatch("chatSocketOnline", data);
    // });
    getters.socketGeneral.on("chatMessage", (data) => {
      dispatch("chatSocketMessage", data);
    });
    getters.socketGeneral.on("chatRemove", (data) => {
      dispatch("chatSocketRemove", data);
    });
    getters.socketGeneral.on("chatClear", (data) => {
      dispatch("chatSocketClear", data);
    });
    getters.socketGeneral.on("slotProvidersChange", (data) => {
      localStorage.removeItem("GAMES_CACHE");
    });
  },
  socketConnectCrash({ getters, dispatch }) {
    if (getters.socketCrash.connected === true) {
      getters.socketCrash.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketCrash.auth.token = getters.authToken;
    }

    getters.socketCrash.disconnect().connect();

    dispatch("socketListenCrash");
  },
  socketDisconnectCrash({ getters }) {
    getters.socketCrash.removeAllListeners();
    getters.socketCrash.disconnect();
  },
  socketListenCrash({ getters, dispatch }) {
    getters.socketCrash.on("init", (data) => {
      dispatch("crashSocketInit", data);
    });
    getters.socketCrash.on("game", (data) => {
      dispatch("crashSocketGame", data);
    });
    getters.socketCrash.on("tick", (data) => {
      dispatch("crashSocketTick", data);
    });
    getters.socketCrash.on("bet", (data) => {
      dispatch("crashSocketBet", data);
    });
  },

  socketConnectMines({ getters, dispatch }) {
    if (getters.socketMines.connected === true) {
      getters.socketMines.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketMines.auth.token = getters.authToken;
    }

    getters.socketMines.disconnect().connect();

    dispatch("socketListenMines");
  },
  socketDisconnectMines({ getters }) {
    getters.socketMines.removeAllListeners();
    getters.socketMines.disconnect();
  },
  socketListenMines({ getters, dispatch }) {
    getters.socketMines.on("init", (data) => {
      dispatch("minesSocketInit", data);
    });
  },
  socketConnectPlinko({ getters, dispatch }) {
    if (getters.socketPlinko.connected === true) {
      getters.socketPlinko.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketPlinko.auth.token = getters.authToken;
    }
    getters.socketPlinko.disconnect().connect();

    dispatch("socketListenPlinko");
  },
  socketDisconnectPlinko({ getters }) {
    getters.socketPlinko.removeAllListeners();
    getters.socketPlinko.disconnect();
  },
  socketListenPlinko({ getters, dispatch }) {
    getters.socketPlinko.on("init", (data) => {
      dispatch("plinkoSocketInit", data);
    });
    // getters.socketPlinko.on('game', (data) => { dispatch('rollSocketGame', data); });
    getters.socketPlinko.on("bet", (data) => {
      dispatch("plinkoSocketGame", data);
    });
  },
  socketConnectSlide({ getters, dispatch }) {
    if (getters.socketSlide.connected === true) {
      getters.socketSlide.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketSlide.auth.token = getters.authToken;
    }

    getters.socketSlide.disconnect().connect();

    dispatch("socketListenSlide");
  },
  socketDisconnectSlide({ getters }) {
    getters.socketSlide.removeAllListeners();
    getters.socketSlide.disconnect();
  },
  socketListenSlide({ getters, dispatch }) {
    getters.socketSlide.on("init", (data) => {
      dispatch("slideSocketInit", data);
    });
    getters.socketSlide.on("game", (data) => {
      dispatch("slideSocketGame", data);
    });
    getters.socketSlide.on("bet", (data) => {
      dispatch("slideSocketBet", data);
    });
  },
  socketConnectCashier({ getters, dispatch }) {
    if (getters.socketCashier.connected === true) {
      getters.socketCashier.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketCashier.auth.token = getters.authToken;
    }

    getters.socketCashier.disconnect().connect();

    dispatch("socketListenCashier");
  },
  socketDisconnectCashier({ getters }) {
    getters.socketCashier.removeAllListeners();
    getters.socketCashier.disconnect();
  },
  socketListenCashier({ getters, dispatch, commit }) {
    getters.socketCashier.on("cryptoTransaction", (data) => {
      dispatch("cashierSocketCryptoTransaction", data);
    });

    getters.socketCashier.on("growtopiaTransactionInProgress", (data) => {
      dispatch("growtopiaTransactionInProgress", data);
    });

    getters.socketCashier.on("growtopiaWithdrawResponse", (data) => {
      if (!data.success) {
        dispatch("notificationShow", data.error);
      } else {
        commit("auth_update_user", data.user);
        dispatch("notificationShow", {
          type: "success",
          message: "Withdraw has been completed!",
        });
      }

      commit("cashier_end_growtopia_transaction");
    });

    getters.socketCashier.on("growtopiaDepositResponse", (data) => {
      if (!data.success) {
        dispatch("notificationShow", data.error);
      } else {
        commit("auth_update_user", data.user);
        // dispatch("notificationShow", {
        //   type: "success",
        //   message: "Deposit has been completed!",
        // });
      }

      commit("cashier_end_growtopia_transaction");
    });
  },
  socketConnectAdmin({ getters, dispatch }) {
    if (getters.socketAdmin.connected === true) {
      getters.socketAdmin.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketAdmin.auth.token = getters.authToken;
    }

    getters.socketAdmin.disconnect().connect();

    dispatch("socketListenAdmin");
  },
  socketDisconnectAdmin({ getters }) {
    getters.socketAdmin.removeAllListeners();
    getters.socketAdmin.disconnect();
  },
  socketListenAdmin({ getters, dispatch, commit }) {
    getters.socketAdmin.on("cashierMessage", (data) => {
      commit("admin_cashier_chats_add_message", data);
    });
    getters.socketAdmin.on("supportChatMessage", (data) => {
      commit("admin_support_chats_add_message", data);
    });
  },
  socketConnectSupportChat({ getters, dispatch }) {
    if (getters.supportChatSocket.connected) {
      getters.supportChatSocket.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.supportChatSocket.auth.token = getters.authToken;
    }
    getters.supportChatSocket.disconnect().connect();
    dispatch("socketListenSupportChat");
  },
  socketDisconnectSupportChat({ getters }) {
    getters.supportChatSocket.removeAllListeners();
    getters.supportChatSocket.disconnect();
  },
  socketListenSupportChat({ getters, dispatch, commit }) {
    getters.supportChatSocket.on("supportChatMessage", (data) => {
      commit("support_chat_add_messages_data", data);
    });
    getters.supportChatSocket.on("init", (data) => {
      commit("support_chat_set_messages_data", data.messages);
    });
  },
  socketConnectCoinflip({ getters, dispatch }) {
    if (getters.socketCoinflip.connected === true) {
      getters.socketCoinflip.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketCoinflip.auth.token = getters.authToken;
    }

    getters.socketCoinflip.disconnect().connect();

    dispatch("socketListenCoinflip");
  },
  socketDisconnectCoinflip({ getters }) {
    getters.socketCoinflip.removeAllListeners();
    getters.socketCoinflip.disconnect();
  },
  socketListenCoinflip({ getters, dispatch }) {
    getters.socketCoinflip.on("init", (data) => {
      dispatch("coinflipSocketInit", data);
    });
    getters.socketCoinflip.on("game", (data) => {
      dispatch("coinflipSocketGame", data);
    });
  },
  socketConnectUnbox({ getters, dispatch }) {
    if (!getters.socketUnbox.connected) {
      if (getters.authToken !== null) {
        getters.socketUnbox.auth.token = getters.authToken;
      }

      getters.socketUnbox.disconnect().connect();

      dispatch("socketListenUnbox");
    }
  },
  socketDisconnectUnbox({ getters }) {
    getters.socketUnbox.removeAllListeners();
    getters.socketUnbox.disconnect();
  },
  socketListenUnbox({ getters, dispatch }) {
    getters.socketUnbox.on("init", (data) => {
      dispatch("unboxSocketInit", data);
    });
  },
  socketConnectTowers({ getters, dispatch }) {
    if (getters.socketTowers.connected === true) {
      getters.socketTowers.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketTowers.auth.token = getters.authToken;
    }

    getters.socketTowers.disconnect().connect();

    dispatch("socketListenTowers");
  },
  socketDisconnectTowers({ getters }) {
    getters.socketTowers.removeAllListeners();
    getters.socketTowers.disconnect();
  },
  socketListenTowers({ getters, dispatch }) {
    getters.socketTowers.on("init", (data) => {
      dispatch("towersSocketInit", data);
    });
  },
  socketConnectBattles({ getters, dispatch }) {
    if (getters.socketBattles.connected === true) {
      getters.socketBattles.removeAllListeners();
    }
    if (getters.authToken !== null) {
      getters.socketBattles.auth.token = getters.authToken;
    }

    getters.socketBattles.disconnect().connect();

    console.log("socket connected battles!");

    dispatch("socketListenBattles");
  },
  socketDisconnectBattles({ getters }) {
    getters.socketBattles.removeAllListeners();
    getters.socketBattles.disconnect();
  },
  socketListenBattles({ getters, dispatch }) {
    getters.socketBattles.on("init", (data) => {
      console.log("Received battles init data");
      console.log(data);
      dispatch("battlesSocketInit", data);
    });
    getters.socketBattles.on("game", (data) => {
      dispatch("battlesSocketGame", data);
    });
  },
};

const socket = {
  state,
  mutations,
  actions,
  getters,
};

export default socket;
