<template>
  <div class="crash">
    <div class="crash-container">
      <transition name="fade" mode="out-in">
        <div
          v-if="socketCrash.connected === false"
          class="container-loading"
          key="loading"
        >
          <LoadingAnimation></LoadingAnimation>
        </div>
        <div v-else class="container-data" key="data">
          <CrashControls />

          <div class="data-left">
            <CrashGame />
            <CrashHistory />
          </div>
        </div>
      </transition>
    </div>

    <GameFooter :name="'crash'"></GameFooter>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CrashGame from "@/components/games/crash/CrashGame.vue";
import CrashHistory from "@/components/games/crash/CrashHistory.vue";
import CrashControls from "@/components/games/crash/CrashControls.vue";
import GameFooter from "@/components/GameFooter.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "Crash",
  metaInfo: {
    title: "Crash ",
  },
  components: {
    LoadingAnimation,
    GameFooter,
    CrashGame,
    CrashHistory,
    CrashControls,
  },
  methods: {
    ...mapActions(["socketConnectCrash", "socketDisconnectCrash"]),
  },
  computed: {
    ...mapGetters(["socketCrash"]),
  },
  created() {
    this.socketConnectCrash();
  },
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectCrash();
    next();
  },
};
</script>

<style scoped>
.crash {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-inline: auto;
  padding-top: 30px;
  max-width: 1100px;

  .crash-container {
    width: 100%;
    display: contents;
  }
}

.crash .container-loading {
  display: grid;
  place-content: center;
  height: 510px;
  width: 100%;
  border-radius: 10px;
  max-width: 1100px;
  overflow: hidden;
  position: relative;

  &::after {
    width: 100%;
    height: 100%;
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    animation-name: loading_animation;
    animation-duration: 1s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
    background: var(--dark-blue-2);
  }
}

.crash .container-data {
  width: 100%;
  display: flex;
  gap: 15px;
  justify-content: space-between;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }
}

.crash .container-data.fade-enter-active {
  transition: opacity 0.5s;
}

.crash .container-data.fade-enter-from {
  opacity: 0;
}

.crash .data-left {
  width: 100%;
  position: relative;
}

@keyframes loading_animation {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@media only screen and (max-width: 1140px) {
  .crash .crash-container {
    width: 100%;
  }
}

@media only screen and (max-width: 991px) {
  .crash {
    width: 100%;
    padding: 10px 0;
  }

  .crash .container-loading,
  .crash .container-data {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .crash .loading-element {
    width: 100% !important;
  }

  .crash .loading-element:nth-child(2) {
    height: 200px;
    margin-top: 15px;
  }

  .crash .data-left {
    width: 100%;
  }
}
</style>
