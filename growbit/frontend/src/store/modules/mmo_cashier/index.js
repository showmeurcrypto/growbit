import axios from "axios";

const state = {
  cashierChat: {
    tickets: [],
    loading: false,
  },
};

const getters = {
  mmoCashier: (state) => state.cashierChat,
};

const mutations = {
  mmo_cashier_set_data(state, data) {
    state.cashierChat.tickets = data.tickets;
  },
  mmo_cashier_add_ticket(state, data) {
    state.cashierChat.tickets.push(data.ticket);
  },
  mmo_cashier_cancel_ticket(state, ticketId) {
    state.cashierChat.tickets = state.cashierChat.tickets.filter(
      (ticket) => ticket._id !== ticketId
    );
  },
  mmo_cashier_add_message(state, data) {
    state.cashierChat.tickets
      .filter((ticket) => ticket._id === data.ticketId)[0]
      ?.messages?.push({ user: data.sender, message: data.message });
  },
  mmo_cashier_set_data_loading(state, status) {
    state.cashierChat.loading = status;
  },
};

const actions = {
  mmoCashierGetActiveTickets({ getters, commit, dispatch }, data) {
    commit("mmo_cashier_set_data_loading", true);
    axios
      .get("/mmo_cashier/getActiveTickets")
      .then(({ data }) => {
        commit("mmo_cashier_set_data", data);
        commit("mmo_cashier_set_data_loading", false);
      })
      .catch((err) => {
        dispatch("notificationShow", err.response?.data?.error);
        commit("mmo_cashier_set_data_loading", false);
      });
  },
  mmoCashierCreateTicket({ getters, commit, dispatch }, data) {
    if (getters.socketMmoCashier === null) {
      return;
    }
    getters.socketMmoCashier.emit(
      "create",
      {
        ...data,
      },
      (res) => {
        if (res.success) {
          commit("mmo_cashier_add_ticket", res);
        } else {
          dispatch("notificationShow", res.error);
        }
      }
    );
  },
  mmoCashierCancelTicket({ getters, commit, dispatch }, data) {
    if (getters.socketMmoCashier === null) {
      return;
    }

    getters.socketMmoCashier.emit(
      "cancel",
      {
        ticketId: this.activeTicket?._id,
      },
      (res) => {
        if (res.success === true) {
          commit("mmo_cashier_cancel_ticket", data.ticketId);
          dispatch("notificationShow", {
            type: "success",
            message: "Ticket has been closed!",
          });
        } else {
          dispatch("notificationShow", res.error);
        }
      }
    );
  },
  mmoCashierSendMessage({ getters, commit, dispatch }, data) {
    if (getters.socketMmoCashier === null) {
      return;
    }

    getters.socketMmoCashier.emit(
      "send",
      {
        ticketId: data.ticketId,
        message: data.message,
      },
      (res) => {
        if (res.success === true) {
          commit("mmo_cashier_add_message", {
            ticketId: data.ticketId,
            message: {
              message: data.message,
              sender: "You",
            },
          });
        } else {
          dispatch("notificationShow", res.error);
        }
      }
    );
  },
};

const mmoCashier = {
  state,
  mutations,
  actions,
  getters,
};

export default mmoCashier;
