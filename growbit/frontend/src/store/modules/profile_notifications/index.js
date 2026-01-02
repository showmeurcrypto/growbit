import axios from "axios";

const state = {
  profileNotifications: [],
};

const getters = {
  profileNotifications: (state) => state.profileNotifications,
  hasProfileNotifications: (state) => !!state.profileNotifications?.length,
};

const mutations = {
  profile_notification_add(state, notification) {
    state.profileNotifications.push(notification);
  },
  profile_notifications_set(state, notifications) {
    state.profileNotifications = notifications;
  },
  profile_notification_remove(state, index) {
    state.profileNotifications.splice(index, 1);
  },
};

const actions = {
  notificationsLoad({ getters, commit, dispatch }, data) {
    axios
      .get("/notifications")
      .then(({ data }) => {
        const notifications = data.notifications;
        commit("profile_notifications_set", notifications);
      })
      .catch((error) => {
        dispatch("notificationShow", error);
      });
  },
  newNotification({ getters, commit }, data) {
    commit("profile_notification_add", data);
  },
  profileNotificationRemove({ getters, commit, dispatch }, notification) {
    axios
      .post("/notifications/read", { messageId: notification._id })
      .then(({ data }) => {
        const index = getters.profileNotifications.findIndex(
          (element) => element._id === notification._id
        );
        if (index !== -1) {
          commit("profile_notification_remove", index);
        }
      })
      .catch((error) => {
        dispatch("notificationShow", error);
      });
  },
};

const profileNotifications = {
  state,
  mutations,
  actions,
  getters,
};

export default profileNotifications;
