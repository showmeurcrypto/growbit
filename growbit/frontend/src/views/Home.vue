<template>
  <div class="home">
    <div class="home-main">
      <div
        class="race"
        v-if="leaderboardData?.data"
        @click="
          () => {
            $router.push('/leaderboard');
          }
        "
      >
        <span class="reward">
          {{
            (leaderboardData.data.rewards * 100).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}
          WORLD LOCKS
        </span>

        <div class="countdown">
          <div v-for="t of countdown">
            <span>
              {{ t.value }}
            </span>
            <span>
              {{ t.type }}
            </span>
          </div>
        </div>
        <span class="title">WEEKLY RACE</span>

        <img class="john" src="/img/banner/race.png" />
      </div>
      <div v-if="!loggedIn" class="banner">
        <div class="left">
          <div class="txt">The Ultimate Growtopia Casino Experience</div>
          <AppButton
            :click="
              () => {
                modalsSetData({ authType: 'register' });
                modalsSetShow('Login');
              }
            "
            >Sign up</AppButton
          >
        </div>

        <img class="john" src="/img/pika_money.webp" />
      </div>

      <div
        v-else
        class="welcome"
        @click="
          () => {
            $router.push('/rewards');
          }
        "
      >
        <div class="inner">
          <div class="top">
            <div class="left_txt">
              <span class="welcome_back">Welcome back</span>

              <span class="username">{{ authUser?.user?.username }}</span>
            </div>
            <div
              class="level"
              v-if="levelInfo"
              :class="{ unranked: !levelInfo.level }"
            >
              <img :src="`/img/badges/level_${levelInfo.level || 1}.png`" />
              <!-- <span>{{ levelInfo.name }}</span> -->
            </div>
            <div v-else></div>
          </div>

          <div class="progress-container">
            <div v-if="levelInfo" class="progress-data">
              <span>Your Progress</span>
              <span
                >{{
                  ((levelInfo.progress / levelInfo.levelSize) * 100).toFixed(2)
                }}%</span
              >
            </div>
            <div class="progress-bar" v-if="levelInfo">
              <div
                class="progress"
                :style="{
                  width: (levelInfo.progress / levelInfo.levelSize) * 100 + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <GameList></GameList>

      <div class="challenges" v-if="displayedChallenges">
        <Challenge
          :challenge="challenge"
          :key="challenge._id"
          v-for="challenge of displayedChallenges"
        ></Challenge>
      </div>
    </div>
  </div>
</template>

<script>
import GameList from "@/components/GameList.vue";
import Challenge from "@/views/challenges/Challenge.vue";
import { mapGetters, mapActions } from "vuex";
import LoadingAnimation from "@/components/LoadingAnimation";
import RaceTimer from "@/components/RaceTimer.vue";
import AppButton from "@/components/AppButton.vue";
import RulesIcon from "@/assets/images/chat_rules.svg";
import { getUserLevel } from "@/utils";

export default {
  name: "Home",
  metaInfo: {
    title: "Growbit",
  },
  components: {
    GameList,
    Challenge,
    RaceTimer,
    AppButton,
  },
  computed: {
    ...mapGetters(["challengesData", "leaderboardData", "authUser"]),
    loggedIn() {
      return this.authUser.user;
    },

    levelInfo() {
      let info = getUserLevel(this.authUser?.user);
      return info;
    },
    displayedChallenges() {
      let list = this.challengesData?.active;

      if (!list) return null;

      function claims(c) {
        if (
          c.claimedBy.some(
            (u) => u.toString() === this?.authUser?.user?._id?.toString()
          )
        ) {
          return 0;
        }

        return c.remainingClaims;
      }
      return list.sort((a, b) => claims(b) - claims(a)).slice(0, 2);
    },
  },
  data() {
    return {
      isMobile: false,
      countdown: [
        { type: "day", value: 0 },
        { type: "hour", value: 0 },
        { type: "min", value: 0 },
        { type: "sec", value: 0 },
      ],
      intervalId: null,
    };
  },
  methods: {
    ...mapActions([
      "leaderboardGetDataSocket",
      "modalsSetShow",
      "modalsSetData",
    ]),
    updateCountdown() {
      let endTime = this.leaderboardData.data?.endsAt;

      if (!endTime) {
        this.countdown = [
          { type: "day", value: 0 },
          { type: "hour", value: 0 },
          { type: "min", value: 0 },
          { type: "sec", value: 0 },
        ];
        return;
      }

      let remainingMs = Math.max(new Date(endTime) - new Date().getTime(), 0);
      let days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      this.countdown = [
        { type: "day", value: days },
        { type: "hour", value: hours },
        { type: "min", value: minutes },
        { type: "sec", value: seconds },
      ];
    },
    onResize() {
      this.isMobile = window.innerWidth <= 991;
    },
  },
  mounted() {
    this.updateCountdown(); // Initial call
    this.intervalId = setInterval(this.updateCountdown, 1000); // Update every second
  },
  beforeUnmount() {
    clearInterval(this.intervalId); // Cleanup on component destroy
  },
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
    if (this.leaderboardData.loading === false) {
      this.leaderboardGetDataSocket({});
    }
  },
};
</script>

<style scoped lang="scss">
.banner {
  display: flex;
  position: relative;
  width: 100%;
  align-items: center;
  flex-direction: row;
  padding: 25px;
  padding-left: 40px;
  min-height: 190px;
  margin-bottom: 25px;
  cursor: pointer;
  justify-content: flex-start;
  height: 220px;

  background: linear-gradient(
      271.71deg,
      rgba(0, 0, 0, 0) 50%,
      rgba(91, 70, 188, 0.11) 100%
    ),
    linear-gradient(
      91.71deg,
      rgba(82, 64, 172, 0) 50%,
      rgba(82, 64, 172, 0.11) 100%
    ),
    #090c1d;

  border-radius: 5px;

  .left {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    flex-direction: column;

    @media screen and (max-width: 991px) {
      align-items: center;
    }
  }

  .txt {
    width: 400px;
    text-wrap: wrap;
    font-weight: 900;
    font-size: 2rem;
    @media screen and (max-width: 991px) {
      width: unset;
      text-align: center;
    }
  }

  @media screen and (max-width: 991px) {
    height: 190px;

    .john {
      height: 95px;
    }
  }

  @media screen and (max-width: 600px) {
    img.banner-text {
      height: 100px;
      margin-bottom: 40px;
    }
  }

  .john {
    height: 200px;

    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: 5px;
  }

  @media screen and (max-width: 991px) {
    .john {
      height: 170px;
    }
  }

  @media screen and (max-width: 600px) {
    .john {
      display: none;
    }
  }
}

.race {
  display: flex;
  position: relative;
  width: 100%;
  align-items: center;
  flex-direction: column;
  //padding: 25px;
  height: 190px;
  border-radius: 10px;
  margin-bottom: 25px;
  cursor: pointer;
  justify-content: center;
  //border: 2px solid #5B46BC;

  background: linear-gradient(
      271.71deg,
      rgba(0, 0, 0, 0) 50%,
      rgba(91, 70, 188, 0.11) 92.25%
    ),
    linear-gradient(
      91.71deg,
      rgba(82, 64, 172, 0) 50%,
      rgba(178, 110, 71, 0.11) 87.75%
    ),
    #090c1d;

  @media screen and (max-width: 991px) {
    padding: 12px;
  }

  @media screen and (max-width: 991px) {
    .john {
      height: 170px;
    }
  }

  @media screen and (max-width: 600px) {
    .john {
      display: none;
    }
  }

  .john {
    height: 220px;

    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: 5px;
  }

  .reward {
    font-size: 2.4rem;
    font-weight: 900;
    color: #f6be2c;
    margin-bottom: 8px;
    text-align: center;
  }

  .countdown {
    display: flex;
    gap: 10px;

    isolation: isolate;
    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 6px 8px 8px;
      width: 45px;
      position: relative;

      background: #070916;
      border-radius: 5px;
      gap: 5px;

      &::after {
        position: absolute;
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        border-radius: 6px;
        z-index: -1;

        background: linear-gradient(to bottom, #b16e47, #090c1d 55%);

        margin: -2px;
      }

      > span {
        &:first-of-type {
          font-weight: 800;
          font-size: 16px;

          text-align: center;

          color: #ffffff;
        }

        &:last-of-type {
          text-transform: capitalize;

          font-style: normal;
          font-weight: 600;
          font-size: 12px;

          color: rgba(255, 255, 255, 0.15);
        }
      }
    }
  }

  .title {
    margin-top: 5px;
    font-size: 2.3rem;
    font-weight: 700;
  }
}
.challenges {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.home {
  @media screen and (min-width: 991px) {
    padding: 30px 15px 0 15px;
  }
  padding-inline: 10px;

  width: 100%;
  overflow: hidden;
  max-width: 1130px;
  position: relative;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 70px 0px; */
  justify-content: center;

  .home-main {
    width: 100%;
    display: flex;
    flex-direction: column;
    //overflow-x: hidden;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    /* mix-blend-mode; */
  }
}

@media only screen and (max-width: 1300px) {
  .home .home-main {
    padding: 10px 0 0 0;
  }
}

.welcome {
  width: 100%;

  border-radius: 11px;
  margin-bottom: 40px;
  cursor: pointer;

  .inner {
    align-self: flex-start;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #161533;
    border-radius: 8px;
    height: 250px;
    padding: 25px;
    justify-content: space-between;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .top {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .left_txt {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .username {
        margin-top: 5px;
        font-size: 1.7rem;
        font-weight: 900;
        margin-bottom: 25px;
      }

      .welcome_back {
        opacity: 0.7;
        font-size: 1.4rem;
        font-weight: 800;
      }
    }

    .level {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 5px;
      justify-content: center;

      &.unranked {
        opacity: 0.2;
        filter: grayscale(100%);
      }
      img {
        width: auto;
        height: 100px;
      }
      span {
        font-weight: 700;
        font-size: 1.1rem;

        color: #b4a6e2;
      }
    }
  }

  .progress-container {
    width: 100%;
    border-radius: 8px;
    padding: 12px 0;

    .progress-data {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          font-weight: 800;
          font-size: 1rem;
          color: white;
        }
        &:last-of-type {
          font-weight: 600;
          font-size: 1rem;

          color: #93959f;
        }
      }
    }

    .progress-bar {
      width: 100%;
      background: #0e0d1f;

      border-radius: 5px;
      height: 10px;

      .progress {
        height: 100%;
        border-radius: 5px;
        background: #625498;
      }
    }
  }
}
</style>
