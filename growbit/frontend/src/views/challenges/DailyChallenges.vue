<template>
  <div class="bonuses-container">
    <!--    <div class="challenges-head">-->
    <!--      <h1>Daily Challenges</h1>-->
    <!--    </div>-->

    <div class="challenges">
      <div class="header">
        <div class="title">
          <span>Daily Challenges </span>
        </div>
      </div>
      <div class="challenge-text">
        Start each day with a bang! Join our Daily Challenge to win exciting
        rewards and make every moment count. It’s quick, thrilling, and packed
        with opportunities to boost your winnings!
      </div>

      <!--      <div class="mobile-banner"></div>-->

      <div class="mobile-header">
        <div class="title">Daily Challenges</div>
        <div class="text">
          Start each day with a bang! Join our Daily Challenge to win exciting
          rewards and make every moment count. It’s quick, thrilling, and packed
          with opportunities to boost your winnings!
        </div>
      </div>
      <div class="countdown-content">
        <RaceTimer :end="midnight()"></RaceTimer>
      </div>
      <div class="content">
        <div class="err" v-if="challengesData.error">
          {{ challengesData.error }}
        </div>
        <div v-else-if="challengesData.loading">Loading...</div>
        <div class="missing" v-else-if="challenges && challenges.length === 0">
          <img src="/img/challenges_missing.webp" alt="" />
          <p>Oh no! There's no active challenges!</p>
        </div>
        <div class="challenge-list" v-else-if="challenges">
          <challenge
            :hide-buttons="true"
            :key="challenge._id"
            v-for="challenge of challenges"
            :challenge="challenge"
          ></challenge>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TrophyIcon from "@/assets/images/trophy_icon.svg";
import AppButton from "@/components/AppButton.vue";
import Challenge from "@/views/challenges/Challenge.vue";
import RaceTimer from "@/components/RaceTimer.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  components: { Challenge, AppButton, RaceTimer },
  computed: {
    ...mapGetters(["challengesData"]),
    challenges() {
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

      let challenges = this.challengesData.active;

      if (!challenges) return null;

      return challenges.sort((a, b) => claims(b) - claims(a));
    },
  },
  created() {},
  data() {
    return {
      TrophyIcon,
    };
  },
  methods: {
    ...mapActions(["notificationShow", "challengesGetEnded"]),
    midnight() {
      const now = new Date();

      return new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0
        )
      ).toUTCString();
    },
  },
};
</script>

<style lang="scss" scoped>
.bonuses-container {
  padding: 40px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }
  max-width: 1180px;
  margin-inline: auto;

  .challenges-head {
    height: 300px;
    background: #1c1b3c;
    border: 7px solid #1c1b3c;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 15px;
    padding: 40px;

    h1 {
      font-weight: 900;
      font-size: 64px;
      color: #eeeeee;
    }

    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .mobile-banner {
    height: 200px;
    width: 100%;
    //background-image: url("/img/banner/challenges_banner.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: top;
    @media screen and (min-width: 991px) {
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

    .title {
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

  .challenge-text {
    font-weight: 700;
    font-size: 1.143rem;

    color: var(--purple-2);
    margin-bottom: 50px;
    @media screen and (max-width: 991px) {
      display: none;
    }
  }
  .countdown-content {
    font-weight: 700;
    font-size: 1.714rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #eeeeee;
    margin-bottom: 20px;
    width: 100%;
    height: 53px;
    background: var(--dark-blue-2);
    border-radius: 10px;

    @media screen and (max-width: 991px) {
      margin-top: 15px;
      height: 44px;
      background: #22224a;
      border-radius: 8px;
    }
  }

  .mobile-title {
    @media screen and (min-width: 991px) {
      display: none;
    }
    width: 100%;
    text-align: center;
    font-weight: 700;
    font-size: 1.429rem;
    color: #f7be2c;
    text-shadow: 0px 0px 5px rgba(246, 190, 44, 0.33);
    margin: 15px 0;
  }

  .line {
    @media screen and (min-width: 991px) {
      display: none;
    }
    height: 3px;
    width: 100%;
    background-image: linear-gradient(
      to right,
      transparent,
      #2c2b4f 50%,
      transparent 100%
    );
  }

  .challenges {
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .counter {
        border: 1px solid #3b3a65;
        background: rgba(255, 255, 255, 0.07);
        cursor: pointer;
        transition: background 0.3s ease;
        border-radius: 50px;
        box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
        padding: 5px 20px;

        i {
          margin-left: 8px;
          font-size: 1.143rem;
          color: var(--orange);
        }
      }

      .title {
        display: flex;
        align-items: center;

        span {
          font-weight: 900;
          font-size: 36px;

          color: #eeeeee;
        }
      }
      @media (max-width: 991px) {
        display: none;
      }
    }

    .content {
      .err {
        color: red;
      }

      .challenge-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 20px;
        padding: 25px 0;

        @media (max-width: 991px) {
          padding-top: 0;

          display: flex;
          flex-direction: column;
          align-items: center;
        }
      }
    }
  }

  .buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    justify-content: flex-end;

    @media (max-width: 991px) {
      display: none;
    }
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
}
</style>
