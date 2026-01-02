import Vue from "vue";
import Vuex from "vuex";

import modals from "./modules/modals";
import notifications from "./modules/notifications";
import sound from "./modules/sound";
import socket from "./modules/socket";
import auth from "./modules/auth";
import general from "./modules/general";
import user from "./modules/user";
import chat from "./modules/chat";
import crash from "./modules/crash";
import mines from "./modules/mines";
import plinko from "./modules/plinko";
import slide from "./modules/slide";
import cashier from "./modules/cashier";
import unbox from "./modules/unbox";
import towers from "./modules/towers";
import rakeback from "./modules/rakeback";
import affiliates from "./modules/affiliates";
import leaderboard from "./modules/leaderboard";
import admin from "./modules/admin";
import mmoCashier from "./modules/mmo_cashier";
import profileNotifications from "./modules/profile_notifications";
import games from "@/store/modules/games";
import challenges from "@/store/modules/challenges";
import coinflip from "@/store/modules/coinflip";
import battles from "@/store/modules/battles";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    modals,
    notifications,
    sound,
    socket,
    auth,
    general,
    user,
    chat,
    crash,
    mines,
    plinko,
    slide,
    cashier,
    rakeback,
    affiliates,
    leaderboard,
    admin,
    games,
    mmoCashier,
    profileNotifications,
    challenges,
    coinflip,
    unbox,
    towers,
    battles,
  },
});
