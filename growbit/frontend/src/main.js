import $ from "jquery";
window.$ = $;
window.jQuery = $;

import Vue from "vue";
import VueMeta from "vue-meta";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { mapGetters } from "vuex";

import "@/assets/css/global.css";

import { loadTouchJQuery } from "@/lib/jquery-touch-punch";

loadTouchJQuery(window.$);

Vue.use(VueMeta);

Vue.config.productionTip = false;

axios.defaults.baseURL = process.env.VUE_APP_BACKEND_URL;

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    const formattedError = {
      status: error.response?.status,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred",
      type: "error",
    };

    return Promise.reject(formattedError);
  }
);

const token = localStorage.getItem("token");
if (token !== undefined && token !== null) {
  axios.defaults.headers.common["x-auth-token"] = token;
}

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
