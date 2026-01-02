<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <AppLoader
        v-if="
          generalSettings === null ||
          (authToken !== null && authUser.user === null)
        "
        key="loading"
      />
      <div
        v-else-if="
          generalSettings.general.maintenance.enabled === false ||
          (authUser.user !== null && authUser.user.rank === 'admin')
        "
        class="app-page"
        key="page"
      >
        <div class="wrapper">
          <layout-sidebar v-if="showSidebar"></layout-sidebar>
          <div
            class="pageWrapper"
            :style="!showSidebar ? 'padding-left: 0 !important' : ''"
          >
            <layout-header></layout-header>
            <div class="pageContent">
              <router-view :key="$route.fullPath"></router-view>
              <div class="live-feed" v-if="showBets">
                <Bets />
              </div>
              <layout-footer v-if="showFooter"></layout-footer>
            </div>
          </div>
          <Chat></Chat>
        </div>
        <Modals />
        <BottomNav></BottomNav>
        <Notifications />
      </div>
      <AppMaintenance v-else key="maintenance" />
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppLoader from "@/components/AppLoader";
import AppMaintenance from "@/components/AppMaintenance";
import Modals from "@/components/modals/Modals";
import Notifications from "@/components/notifications/Notifications";
import LayoutHeader from "@/components/LayoutHeader.vue";
import LayoutFooter from "@/components/LayoutFooter.vue";
import LayoutSidebar from "@/components/sidebar/LayoutSidebar.vue";
import Chat from "@/components/chat/Chat.vue";
import BottomNav from "@/components/BottomNav.vue";
import Bets from "@/components/bets/Bets.vue";

export default {
  components: {
    Bets,
    LayoutSidebar,
    LayoutFooter,
    LayoutHeader,
    AppLoader,
    AppMaintenance,
    Chat,
    Modals,
    Notifications,
    BottomNav,
  },
  methods: {
    ...mapActions([
      "socketConnectGeneral",
      "getGames",
      "challengesGetActive",
      "setCurrency",
      "modalsSetShow",
      "modalsSetData",
      "getHomeGames",
    ]),
  },
  computed: {
    ...mapGetters([
      "socketGeneral",
      "generalSettings",
      "authToken",
      "authUser",
    ]),
    showFooter() {
      return !this.$route.path.startsWith("/admin");
    },
    showSidebar() {
      return !this.$route.path.startsWith("/admin");
    },
    showBets() {
      return (
        this.$route.path.startsWith("/casino") ||
        this.$route.path.startsWith("/mines") ||
        this.$route.path.startsWith("/crash") ||
        this.$route.path.startsWith("/plinko") ||
        this.$route.path.startsWith("/dice") ||
        this.$route.path.startsWith("/slide") ||
        this.$route.path.startsWith("/keno") ||
        this.$route.path.startsWith("/cases") ||
        this.$route.path.startsWith("/coinflip") ||
        this.$route.path.startsWith("/reme") ||
        this.$route.path.startsWith("/external") ||
        this.$route.path.startsWith("/tower") ||
        this.$route.path === "/"
      );
    },
  },
  watch: {
    $route: {
      handler(to, from) {
        if (this.$refs.mainContainer !== undefined) {
          this.$nextTick(() => {
            const mainContainer = this.$refs.mainContainer;
            mainContainer.scrollTo({ top: 0, behavior: "smooth" });
          });
        }
      },
    },
  },
  created() {
    if (this.authUser && this.$route.query.modal === "cashier") {
      // this.modalsSetData({ authType: "register" });
      this.modalsSetShow("Wallet");
    }

    this.socketConnectGeneral();
    this.getHomeGames();
    this.challengesGetActive();

    setTimeout(() => {
      this.getGames();
    }, 3000);
  },
  destroyed() {},
};
</script>

<style lang="scss">
@use "/src/assets/sass/mixins" as m;

#app {
  height: 100%;
  width: 100%;
}

.wrapper {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  min-height: 100%;
  width: 100%;
  min-width: 0;
}

.live-feed {
  max-width: 1100px;
  margin-inline: auto;
  margin-bottom: 100px;
}

.pageWrapper {
  //height: 100vh;
  //overflow: scroll;
  flex-grow: 1;
  @include m.hide_scrollbar();
  width: 100%;
  transition: padding-left 0.3s ease;
}

.pageContent {
  @media screen and (min-width: 991px) {
    max-height: 100vh;
  }
  height: 100%;
  overflow: scroll;
  @include m.hide_scrollbar();
  flex: 1 0 auto;
  padding-bottom: 40px;

  width: 100%;
}

body .app-loader.fade-leave-active {
  transition: opacity 0.5s ease;
}

body .app-loader.fade-leave-active {
  opacity: 0;
}

body .app-page {
  width: 100%;
  height: 100%;
  @media screen and (min-width: 991px) {
    overflow-y: hidden;
    overflow-x: scroll;
  }
}

body .app-page.fade-enter-active,
body .app-maintenance.fade-enter-active {
  transition: opacity 0.5s ease;
}

body .app-page.fade-enter-from,
body .app-maintenance.fade-enter-from {
  opacity: 0;
}

.mention {
  font-weight: 900;
  color: white;
  cursor: pointer;
}

.chat-dls {
  margin-top: 3px;
}
</style>
