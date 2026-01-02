<template>
  <div>
    <div v-if="unboxGetRouteName === 'UnboxOverview'" class="top">
      <div>
        <span>Cases</span>
      </div>
    </div>
    <div class="unbox">
      <div class="unbox-header">
        <UnboxHeaderOverview v-if="unboxGetRouteName === 'UnboxOverview'" />
        <UnboxHeader v-else-if="unboxGetRouteName === 'UnboxBox'" />
      </div>
      <div class="unbox-content">
        <transition name="slide-fade" mode="out-in">
          <router-view />
        </transition>
      </div>
      <!-- <GameFooter :name="'cases'"></GameFooter> -->
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import UnboxHeaderOverview from "@/components/unbox/UnboxHeaderOverview";
import UnboxHeaderBox from "@/components/unbox/UnboxHeaderBox";
import UnboxHeader from "@/components/unbox/UnboxHeader";
import GameFooter from "@/components/GameFooter.vue";

export default {
  name: "Cases",
  metaInfo: {
    title: "Cases",
  },
  components: {
    UnboxHeaderOverview,
    UnboxHeader,
    GameFooter,
  },
  methods: {
    ...mapActions(["socketConnectUnbox", "socketDisconnectUnbox"]),
  },
  computed: {
    unboxGetRouteName() {
      return this.$route.name;
    },
  },
  created() {
    this.socketConnectUnbox();
  },
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectUnbox();
    next();
  },
};
</script>

<style scoped lang="scss">
.top {
  height: 125px;

  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 25px;
  @media screen and (max-width: 991px) {
    margin-bottom: 15px;
    height: 85px;
  }
  background: rgba(34, 34, 74, 0.5);

  > div {
    padding-inline: 40px;
    @media (max-width: 650px) {
      padding: 10px;
    }
    margin-inline: auto;
    max-width: 1180px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;

    > span {
      font-weight: 700;
      font-size: 28px;
      color: #eeeeee;
      text-transform: capitalize;
    }
  }
}

.unbox {
  padding-top: 25px;
  @media only screen and (max-width: 991px) {
    padding-top: 5px;

    padding-inline: 10px;
  }
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1100px;
  margin: auto;

  .unbox-header {
    width: 100%;
  }

  .unbox-content {
    width: 100%;
  }
}
</style>
