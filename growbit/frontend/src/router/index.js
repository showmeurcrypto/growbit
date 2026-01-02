import Vue from "vue";
import VueRouter from "vue-router";

// Load vuex store
import store from "../store";

// Load route views
import Home from "../views/Home";
import Crash from "../views/games/Crash.vue";
import Slide from "../views/games/Slide.vue";
import Mines from "../views/games/Mines.vue";
import Plinko from "../views/games/Plinko.vue";
import Reme from "../views/games/Reme.vue";
import Tower from "../views/games/Tower.vue";
import Leaderboard from "../views/Leaderboard";
import Challenges from "../views/challenges/DailyChallenges.vue";
import GamesIndex from "../views/GamesIndex.vue";
import Dice from "@/views/games/Dice.vue";
import Coinflip from "@/views/games/Coinflip.vue";

import ThirdParty from "@/components/games/ThirdParty.vue";
import Keno from "@/views/games/Keno.vue";
import ProfilePrivacy from "@/views/profile/ProfilePrivacy.vue";
import Unbox from "../views/games/unbox/Unbox";
import UnboxOverview from "../views/games/unbox/UnboxOverview";
import UnboxBox from "../views/games/unbox/UnboxBox";
import Battles from "../views/games/battles/Battles";
import BattlesOverview from "../views/games/battles/BattlesOverview";
import BattlesGame from "../views/games/battles/BattlesGame";
import BattlesCreate from "../views/games/battles/BattlesCreate";

const Terms = () => import("../views/Terms");
const Rewards = () => import("../views/Rewards");

const Privacy = () => import("../views/Privacy");

const Faq = () => import("../views/Faq");

const NotFound = () => import("../views/404");

const Profile = () =>
  import(/* webpackChunkName: "group-user" */ "../views/profile/Profile");
const ProfileOverview = () =>
  import(
    /* webpackChunkName: "group-user" */ "../views/profile/ProfileOverview"
  );

const ProfileAffiliate = () =>
  import(
    /* webpackChunkName: "group-user" */ "../views/profile/ProfileAffiliate"
  );

const ProfileStats = () =>
  import(
    /* webpackChunkName: "group-user" */ "../views/profile/ProfileStats.vue"
  );

const ProfileSettings = () =>
  import(
    /* webpackChunkName: "group-user" */ "../views/profile/ProfileSettings"
  );
const ProfileTransactions = () =>
  import(
    /* webpackChunkName: "group-user" */ "../views/profile/ProfileTransactions"
  );
const Admin = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/Admin");
const Logs = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/Logs");
const AdminDashboard = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminDashboard");
const AdminUsers = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminUsers");
const AdminAffiliates = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminAffiliates"
  );

const AdminCurrencies = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminCurrencies.vue"
  );

const AdminSlots = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminSlots.vue");
const AdminSupport = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminSupport.vue"
  );
const AdminChallenges = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminChallenges.vue"
  );
const AdminPromo = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminPromo");
const AdminCashier = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminCashier");
const AdminLeaderboards = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminLeaderboards"
  );
const AdminStats = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminStats");
const AdminSettings = () =>
  import(/* webpackChunkName: "group-admin" */ "../views/admin/AdminSettings");
const AdminTransactions = () =>
  import(
    /* webpackChunkName: "group-admin" */ "../views/admin/AdminTransactions.vue"
  );
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/r/:code",
    name: "Home",
    component: Home,
    beforeEnter: (to, from, next) => {
      if (!store.getters.authUser.user) {
        store.dispatch("modalsSetData", {
          code: to.params.code,
          authType: "register",
        });

        sessionStorage.setItem("code", to.params.code);

        store.dispatch("modalsSetShow", "Login");
      }

      next("/");
    },
  },
  {
    path: "/casino/:category",
    name: "Casino",
    component: GamesIndex,
  },
  {
    path: "/crash",
    name: "Crash",
    component: Crash,
  },
  {
    path: "/dice",
    name: "Dice",
    component: Dice,
  },
  {
    path: "/slide",
    name: "Slide",
    component: Slide,
  },
  {
    path: "/keno",
    name: "Keno",
    component: Keno,
  },
  {
    path: "/reme",
    name: "Reme",
    component: Reme,
  },
  {
    path: "/coinflip",
    name: "Coinflip",
    component: Coinflip,
    // meta: {
    //   auth: true,
    //   admin: true,
    // },
  },
  {
    path: "/mines",
    name: "Mines",
    component: Mines,
  },
  {
    path: "/towers",
    name: "Tower",
    component: Tower,
  },
  {
    path: "/plinko",
    name: "Plinko",
    component: Plinko,
  },
  {
    path: "/battles",
    component: Battles,
    meta: {
      auth: true,
      admin: true,
    },
    children: [
      {
        path: "",
        name: "BattlesOverview",
        component: BattlesOverview,
      },
      {
        path: "create",
        name: "BattlesCreate",
        meta: {
          auth: true,
        },
        component: BattlesCreate,
      },
      {
        path: ":gameId",
        name: "BattlesGame",
        component: BattlesGame,
      },
    ],
  },
  {
    path: "/cases",
    component: Unbox,
    children: [
      {
        path: "",
        name: "UnboxOverview",
        component: UnboxOverview,
      },
      {
        path: ":boxId",
        name: "UnboxBox",
        component: UnboxBox,
      },
    ],
  },
  {
    path: "/external/:provider/:slot",
    name: "Slot",
    component: ThirdParty,
    beforeEnter: (to, from, next) => {
      if (!store.getters.authUser.user) {
        store.dispatch("modalsSetShow", "Login");
        next("/");
      }
      next();
      return true;
    },
  },
  {
    path: "/profile",
    component: Profile,
    meta: {
      auth: true,
    },
    children: [
      {
        path: "",
        name: "ProfileOverview",
        component: ProfileOverview,
      },
      {
        path: "settings",
        name: "ProfileSettings",
        component: ProfileSettings,
      },
      {
        path: "affiliates",
        name: "ProfileAffiliates",
        component: ProfileAffiliate,
      },
      {
        path: "Stats",
        name: "ProfileStats",
        component: ProfileStats,
      },
      {
        path: "transactions",
        name: "ProfileTransactions",
        component: ProfileTransactions,
      },
      {
        path: "privacy",
        name: "ProfilePrivacy",
        component: ProfilePrivacy,
      },
    ],
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: Leaderboard,
  },
  {
    path: "/challenges",
    name: "Challenges",
    component: Challenges,
  },
  {
    path: "/rewards",
    name: "Rewards",
    component: Rewards,
    meta: {
      auth: true,
      //  admin: true,
    },
  },
  {
    path: "/faq",
    name: "Faq",
    component: Faq,
  },
  {
    path: "/terms",
    name: "Terms",
    component: Terms,
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: Privacy,
  },
  {
    path: "/admin",
    component: Admin,
    meta: {
      auth: true,
      admin: true,
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: AdminDashboard,
      },
      {
        path: "logs",
        name: "Logs",
        component: Logs,
      },
      {
        path: "users",
        name: "AdminUsers",
        component: AdminUsers,
      },
      {
        path: "affiliates",
        name: "AdminAffiliates",
        component: AdminAffiliates,
      },
      {
        path: "promo",
        name: "AdminPromo",
        component: AdminPromo,
      },
      {
        path: "cashier",
        name: "AdminCashier",
        component: AdminCashier,
      },
      {
        path: "leaderboard",
        name: "AdminLeaderboard",
        component: AdminLeaderboards,
      },
      {
        path: "support",
        name: "Support",
        component: AdminSupport,
      },
      {
        path: "currencies",
        name: "Currencies",
        component: AdminCurrencies,
      },
      {
        path: "stats",
        name: "AdminStats",
        component: AdminStats,
      },
      {
        path: "payments",
        name: "AdminPayments",
        component: AdminTransactions,
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: AdminSettings,
      },
      {
        path: "challenges",
        name: "AdminChallenges",
        component: AdminChallenges,
      },
      {
        path: "slots",
        name: "AdminSlots",
        component: AdminSlots,
      },
    ],
  },
  {
    path: "/reset",
    beforeEnter: (to, from, next) => {
      store.dispatch("modalsSetData", {
        userId: to.query.userId,
        token: to.query.token,
      });
      store.dispatch("modalsSetShow", "Reset");

      next("/");
    },
  },
  {
    path: "/verify",
    beforeEnter: (to, from, next) => {
      const data = { userId: to.query.userId, token: to.query.token };
      store.dispatch("authSendCredentialsVerify", data);
      next("/");
    },
  },
  {
    path: "*",
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    window.scrollTo(0, 0);

    const pageContent = document.getElementsByClassName("pageContent")[0];
    const pageWrapper = document.getElementsByClassName("pageWrapper")[0];

    if (pageContent) {
      pageContent.scrollTop = 0;
    }

    if (pageWrapper) {
      pageWrapper.scrollTop = 0;
    }
  },
});

router.beforeEach(async function (to, from, next) {
  if (
    store.getters.authToken !== null &&
    store.getters.authUser.user === null &&
    store.getters.authUser.loading === false
  ) {
    await store.dispatch("authGetUser");
  }

  let adminSession = !!sessionStorage.getItem("admin");

  if (
    to.matched.some((record) => record.meta.auth) &&
    store.getters.authUser.user === null
  ) {
    next(false);
  } else if (
    to.matched.some((record) => record.meta.admin) &&
    (store.getters.authUser.user === null ||
      store.getters.authUser.user.rank !== "admin" ||
      !adminSession)
  ) {
    next(false);
  } else {
    next();
  }
});

export default router;
