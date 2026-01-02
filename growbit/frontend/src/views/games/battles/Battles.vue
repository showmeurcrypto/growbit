<template>
  <div class="battles">
    <div class="battles-header">
      <BattlesHeaderOverview v-if="battlesGetRouteName === 'BattlesOverview'" />
      <BattlesHeaderCreate
        v-else-if="battlesGetRouteName === 'BattlesCreate'"
      />
      <BattlesHeaderGame v-else-if="battlesGetRouteName === 'BattlesGame'" />
    </div>
    <div class="battles-content">
      <transition name="slide-fade" mode="out-in">
        <router-view v-bind:key="$route.fullPath" />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import BattlesHeaderOverview from "@/components/battles/BattlesHeaderOverview";
import BattlesHeaderCreate from "@/components/battles/BattlesHeaderCreate";
import BattlesHeaderGame from "@/components/battles/BattlesHeaderGame";

export default {
  name: "CaseBattles",
  metaInfo: {
    title: "Case Battles",
  },
  components: {
    BattlesHeaderOverview,
    BattlesHeaderCreate,
    BattlesHeaderGame,
  },
  methods: {
    ...mapActions(["socketConnectBattles", "socketDisconnectBattles"]),
  },
  computed: {
    battlesGetRouteName() {
      return this.$route.name;
    },
  },
  created() {
    this.socketConnectBattles();
  },
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectBattles();
    next();
  },
};
</script>

<style scoped>
.battles {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 10px;
}

.battles .battles-header {
  max-width: 1100px;
  width: 100%;
}

.battles .battles-content {
  max-width: 1100px;
  width: 100%;
}

@media only screen and (max-width: 1270px) {
  .battles .battles-header {
    width: 100%;
  }

  .battles .battles-content {
    width: 100%;
  }
}
</style>
