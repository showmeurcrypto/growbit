<template>
  <div class="crash-game">
    <div class="game-graph" ref="crashGraph">
      <canvas id="canvas-graph"></canvas>
    </div>
    <div class="game-info">
      <div class="info-network">
        <div class="network-point"></div>
        <span>NETWORK STATUS</span>
      </div>
    </div>
    <div v-if="crashGame !== null" class="game-inner">
      <div v-if="crashGame.state === 'completed'" class="inner-completed">
        <div class="completed-multiplier">
          {{ parseFloat(crashGame.outcome).toFixed(2) }}
        </div>
      </div>
      <div v-else-if="crashGame.state === 'rolling'" class="inner-rolling">
        <div class="rolling-multiplier">
          <span class="gradient-green"
            >{{ parseFloat(crashMultiplier).toFixed(2) }}x</span
          >
        </div>
        <transition name="fade">
          <div
            v-if="
              authUser.user !== null &&
              crashBets.some(
                (element) =>
                  element.user._id === authUser.user._id &&
                  element.multiplier === undefined
              ) === true
            "
            class="rolling-amount"
          >
            <Currency />
            <div class="amount-value">
              <span>+{{ crashFormatValue(crashGetPayoutAmount) }}</span>
            </div>
          </div>
        </transition>
      </div>
      <div v-else class="inner-waiting">
        <div class="waiting-timer">{{ crashText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import CrashGraph from "@/components/games/crash/CrashGraph";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "CrashGame",
  components: { Currency },
  mixins: [currencyExchangeRatesMixin],
  data() {
    return {
      crashTimerRepeater: null,
      crashRunRepeater: null,
      crashGraphInstance: null,
      crashProfitInfo: false,
      crashText: "Starting in 20.00s",
      crashMultiplier: 1.0001,
    };
  },
  methods: {
    crashFormatValue(value) {
      return parseFloat(value).toFixed(2).toString();
    },
    crashStartTimer() {
      const timeEnding =
        new Date(this.crashGame.createdAt).getTime() + 1000 * 6;
      const timeLeft =
        (timeEnding - (new Date().getTime() + this.generalTimeDiff)) / 1000;

      this.crashText = "Starting in " + timeLeft.toFixed(2) + "s";

      if (timeLeft <= 0) {
        this.crashText = "Pending...";
      } else {
        this.crashTimerRepeater = requestAnimationFrame(this.crashStartTimer);
      }
    },
    crashStartMutiplier() {
      const elapsed =
        new Date().getTime() +
        this.generalTimeDiff -
        new Date(this.crashGame.updatedAt).getTime();
      this.crashMultiplier = Math.pow(Math.E, 0.00006 * elapsed);

      if (this.crashGame?.state === "rolling") {
        CrashGraph.Engine.multi = this.crashMultiplier;
      }

      this.crashRunRepeater = requestAnimationFrame(this.crashStartMutiplier);
    },
  },
  computed: {
    ...mapGetters(["authUser", "generalTimeDiff", "crashGame", "crashBets"]),
    crashGetPayoutAmount() {
      return (
        this.getDisplayCurrencyAmount(
          this.crashBets[
            this.crashBets.findIndex(
              (element) => element.user._id === this.authUser.user._id
            )
          ].amount
        ) * this.crashMultiplier
      );
    },
  },
  watch: {
    crashGame: {
      handler(data, oldData) {
        if (data.state === "created") {
          CrashGraph.Engine.multi = 1.0001;
          CrashGraph.Engine.gameState = "STARTING";
          cancelAnimationFrame(this.crashRunRepeater);
          this.crashStartTimer();
        } else if (data.state === "rolling") {
          CrashGraph.Engine.multi = 1.0001;
          CrashGraph.Engine.gameState = "IN_PROGRESS";

          this.crashMultiplier = 1.0001;
          this.crashStartMutiplier();
        } else if (data.state === "completed") {
          CrashGraph.Engine.gameState = "ENDED";
          //cancelAnimationFrame(this.crashRunRepeater);
        }
      },
      deep: true,
    },
  },
  mounted() {
    let canvas = document.querySelector("#canvas-graph");

    this.crashGraphInstance = new CrashGraph.Graph();
    this.crashGraphInstance.startRendering(canvas, {
      width: 700,
      height: 500,
    });

    CrashGraph.Engine.multi = 1;

    if (this.crashGame.state === "created") {
      CrashGraph.Engine.gameState = "STARTING";
      this.crashStartTimer();
    } else if (this.crashGame.state === "rolling") {
      CrashGraph.Engine.gameState = "IN_PROGRESS";
      this.crashStartMutiplier();
    } else {
      this.crashText = "PENDING...";
    }
  },
  destroyed() {
    cancelAnimationFrame(this.crashTimerRepeater);
    cancelAnimationFrame(this.crashRunRepeater);
    this.crashGraphInstance.stopRendering();
  },
};
</script>

<style scoped lang="scss">
.crash-game {
  width: 100%;
  @media screen and (min-width: 991px) {
    min-width: 500px;
    min-height: 519px;
  }

  position: relative;
  height: fit-content;

  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;

  .game-inner {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    border-radius: 15px;
    /* background: radial-gradient(100.1% 70.84% at 100% 0%, rgba(253, 59, 49, 0.10) 0%, rgba(253, 59, 49, 0.00) 100%), radial-gradient(99.82% 70.59% at 0% 100%, rgba(253, 59, 49, 0.10) 0%, rgba(253, 59, 49, 0.00) 100%);
      box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.15) inset; */
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
  }
}

.crash-game .game-info {
  width: 90%;
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 60px;
  left: 0;
  padding: 0 20px;
}

.crash-game .info-network {
  display: flex;
  align-items: center;
}

.crash-game .info-network span {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.crash-game .network-point {
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 50%;
  background: var(--green);
}

.crash-game .info-profit {
  display: flex;
  align-items: center;
}

.crash-game .info-profit button {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff99;
}

.crash-game .info-profit button svg {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  fill: #ffffff99;
  margin-bottom: 2px;
}

.crash-game .profit-amount {
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.crash-game .profit-amount.fade-enter-active,
.crash-game .profit-amount.fade-leave-active {
  transition: opacity 0.5s;
}

.crash-game .profit-amount.fade-enter-from,
.crash-game .profit-amount.fade-leave-to {
  opacity: 0;
}

.crash-game .profit-amount img {
  width: 20px;
  height: 20px;
  margin-right: 6px;
}

.crash-game .inner-completed,
.crash-game .inner-rolling,
.crash-game .inner-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.crash-game .inner-rolling {
  position: relative;
}

.crash-game .completed-multiplier,
.crash-game .rolling-multiplier {
  color: var(--red);
  font-size: 75px;
  font-style: normal;
  font-weight: 600;
  @media only screen and (max-width: 991px) {
    font-size: 40px;
  }
}

.crash-game .rolling-amount {
  position: absolute;
  display: flex;
  align-items: center;
  bottom: -6px;
  left: 50%;
  transform: translate(-50%, 100%);
}

.crash-game .rolling-amount img {
  width: 26px;
  height: 26px;
  margin-right: 10px;
}

.crash-game .amount-value {
  font-size: 1.143rem;
  font-weight: 600;
  color: #ffffff;
}

.crash-game .amount-value span {
  font-size: 1.714rem;
  font-weight: 800;
  color: #ffffff;
}

.crash-game .inner-waiting img {
  margin-top: 25px;
}

.crash-game {
  .waiting-timer {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
  }
}

@media only screen and (max-width: 550px) {
  .crash-game .info-network span {
    display: none;
  }
}

canvas {
  width: 100%;
  max-width: 800px;
}
</style>
