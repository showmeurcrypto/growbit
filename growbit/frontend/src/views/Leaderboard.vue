<template>
  <div class="leaderboard">
    <div class="leaderboard-top">
      <div class="title">Weekly race</div>
      <div class="race-text">
        Get ready to accelerate your way to the top! Every week, we’re hosting
        an exciting race where you can compete for incredible rewards. Play your
        favorite games, climb the leaderboard, and claim your share of the prize
        pool!
      </div>

      <div class="mobile-header">
        <div class="title-mobile">Weekly race</div>
        <div class="text">
          Get ready to accelerate your way to the top! Every week, we’re hosting
          an exciting race where you can compete for incredible rewards. Play
          your favorite games, climb the leaderboard, and claim your share of
          the prize pool!
        </div>
      </div>

      <div
        v-if="!leaderboardData.loading && leaderboardData.data !== null"
        class="countdown-content"
      >
        <RaceTimer :end="leaderboardData.data?.endsAt"></RaceTimer>
      </div>
      <transition name="fade" mode="out-in">
        <div
          v-if="!leaderboardData.loading && leaderboardData.data !== null"
          class="leaderboard-podium"
          key="data"
        >
          <LeaderboardPodiumElement
            :key="2"
            :position="`#2`"
            :winner="leaderboardData.data?.winners?.[1]"
          />
          <LeaderboardPodiumElement
            :key="1"
            :position="`#1`"
            :winner="leaderboardData.data?.winners?.[0]"
          />
          <LeaderboardPodiumElement
            :key="3"
            :position="`#3`"
            :winner="leaderboardData.data?.winners?.[2]"
          />
        </div>
      </transition>
    </div>
    <table
      class="leaderboard-users"
      v-if="leaderboardData.data || leaderboardData.loading"
    >
      <thead>
        <tr class="users-header">
          <th class="header-element element-rank">Rank</th>
          <th class="header-element element-user">Name</th>
          <th class="header-element element-wagered">Points</th>
          <th class="header-element element-prize">Reward</th>
        </tr>
      </thead>

      <transition name="fade" mode="out-in">
        <div
          v-if="leaderboardData.loading === true"
          class="content-loading"
          key="loading"
        >
          <LoadingAnimation />
        </div>
        <tbody
          class="users-list"
          v-else-if="
            leaderboardData.data !== null &&
            leaderboardData.data.winners.length > 3
          "
          key="data"
        >
          <LeaderboardUserElement
            v-for="(winner, index) of leaderboardData.data.winners.slice(3)"
            :key="index"
            :position="`${index + 4}`"
            :winner="winner"
          />
        </tbody>
      </transition>
    </table>
    <div class="missing" v-else>
      <img src="/img/race_missing.webp" alt="" />
      <p>Oh no! Race is not active!</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation";
import AvatarImage from "@/components/AvatarImage";
import LeaderboardUserElement from "@/components/leaderboard/LeaderboardUserElement";
import LeaderboardPodiumElement from "@/components/leaderboard/LeaderboardPodiumElement";
import RaceTimer from "@/components/RaceTimer.vue";

export default {
  name: "Leaderboard",
  metaInfo: {
    title: "Leaderboard ",
  },
  components: {
    RaceTimer,
    LoadingAnimation,
    AvatarImage,
    LeaderboardUserElement,
    LeaderboardPodiumElement,
  },
  data() {
    return {};
  },
  methods: {
    getEnd() {
      let start = new Date(this.leaderboardData.data?.createdAt);
      start.setDate(start.getDate() + 7);
      return start.toUTCString();
    },
    ...mapActions(["leaderboardGetDataSocket"]),
  },
  computed: {
    ...mapGetters(["generalTimeDiff", "leaderboardData"]),
  },
  watch: {},
  created() {
    if (this.leaderboardData.loading === false) {
      const data = {};
      this.leaderboardGetDataSocket(data);
    }
  },
};
</script>

<style scoped lang="scss">
.challenges-head {
  height: 300px;
  background: #1c1b3c;
  border: 7px solid #1c1b3c;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 20px;

  h1 {
    font-weight: 900;
    font-size: 64px;
    color: #eeeeee;
  }

  @media screen and (max-width: 991px) {
    display: none;
  }
}

.leaderboard {
  max-width: 1120px;
  margin-inline: auto;
  width: 100%;
  min-height: calc(100vh - 112px);
  padding: 40px 10px;
  @media screen and (max-width: 991px) {
    padding: 15px;
  }

  .leaderboard-top {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-bottom: 30px;

    .title {
      width: 100%;
      text-align: left;
      font-weight: 900;
      font-size: 36px;
      color: #eeeeee;
      @media screen and (max-width: 991px) {
        display: none;
      }
    }

    .race-text {
      font-weight: 700;
      font-size: 1.143rem;

      color: var(--purple-2);
      @media screen and (max-width: 991px) {
        display: none;
      }
    }

    .mobile-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      padding: 20px;
      gap: 10px;
      background: var(--dark-blue);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      @media screen and (min-width: 991px) {
        display: none;
      }
      .title-mobile {
        font-weight: 700;
        font-size: 1.429rem;

        color: #eeeeee;
      }

      .text {
        font-weight: 500;
        font-size: 1rem;

        color: var(--purple-2);
      }
    }
  }

  .countdown-content {
    font-weight: 700;
    font-size: 1.714rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #eeeeee;
    margin-top: 50px;
    @media screen and (max-width: 991px) {
      margin-top: 20px;
      height: 44px;
      background: #22224a;
      border-radius: 8px;
    }

    margin-bottom: 20px;
    width: 100%;
    height: 53px;
    background: var(--dark-blue-2);
    border-radius: 10px;
  }
}

.leaderboard .leaderboard-podium {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto auto;
  flex-wrap: wrap;
  @media screen and (min-width: 991px) {
    margin-top: 25px;
  }
  gap: 15px;
  z-index: 1;
  > div {
    // width: 100%;
  }

  @media screen and (max-width: 991px) {
    grid-template-columns: auto;
  }
}

.leaderboard .leaderboard-users {
  width: 100%;
  margin-top: 40px;
}

.leaderboard th.header-element {
  font-weight: 700;
  font-size: 1.143rem;
  color: var(--purple-2);
  padding: 10px 0;

  text-align: center;
  &:first-of-type {
    text-align: left;
    padding-left: 15px;
  }

  &:last-of-type {
    text-align: right;
    padding-right: 15px;
  }
}

.leaderboard .users-list {
  margin-top: 8px;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.leaderboard .content-loading {
  width: 100%;
  height: 192px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.leaderboard .content-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.leaderboard .content-loading.fade-leave-to {
  opacity: 0;
}

.leaderboard .list-data {
  width: 100%;
}

.leaderboard .list-empty {
  width: 100%;
  height: 192px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 700;
  color: var(--purple-2);
}

.leaderboard .list-data.fade-enter-active,
.leaderboard .list-empty.fade-enter-active {
  transition: opacity 0.5s;
}

.leaderboard .list-data.fade-enter-from,
.leaderboard .list-empty.fade-enter-from {
  opacity: 0;
}

.missing {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  img {
    height: 300px;
  }

  p {
    font-size: 1.143rem;
    color: var(--purple-2);
  }
}
</style>
