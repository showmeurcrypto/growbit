<template>
  <div class="reme">
    <div class="reme-container">
      <div class="actions-controls">
        <div class="controls-mode">
          <button
            v-on:click="setMode('manual')"
            class="button-mode"
            v-bind:class="{ 'button-selected': mode === 'manual' }"
          >
            Manual
          </button>
          <button
            v-on:click="setMode('auto')"
            class="button-mode"
            v-bind:class="{ 'button-selected': mode === 'auto' }"
          >
            Auto
          </button>
        </div>
        <div class="controls-main">
          <BetAmount
            :change="(value) => (this.betAmount = value)"
            :max-bet="maxBet"
          ></BetAmount>
          <!--           <div class="mode">
            <button
              :class="{ active: targetMode == 1 }"
              @click="targetMode = 1"
            >
              1R
            </button>
            <button
              :class="{ active: targetMode == 2 }"
              @click="targetMode = 2"
            >
              2R
            </button>
          </div> -->
          <div v-if="mode === 'auto'" class="controls-count">
            <div class="controls-amount-title">Number Of Bets</div>

            <div class="count-content">
              <input v-model="count" type="number" min="0" max="1000" />
              <InfinityIcon v-if="Number(count) === 0"></InfinityIcon>
            </div>
          </div>
          <div class="controls-bet">
            <app-button
              :fullwidth="true"
              v-if="mode !== 'auto' || autoActive === false"
              :click="playButton"
              :disabled="animationInProgress"
              class="button-create"
            >
              {{ mode === "auto" ? "Start Autobet" : "Place Bet" }}
            </app-button>
            <app-button v-else :click="stopAuto" :red="true" :fullwidth="true">
              Stop Autobet
            </app-button>
          </div>
        </div>
      </div>
      <div class="game-container">
        <div class="reme-history">
          <div v-for="h of history" :class="{ win: h[0] }">
            {{ h[1] }}
          </div>
        </div>
        <div class="score">
          <div class="res">
            <span>You</span>
            <div :class="{ win: win === true }">{{ player }}</div>
          </div>

          <div class="res">
            <span>House</span>
            <div :class="{ loss: win === false }">{{ house }}</div>
          </div>
        </div>
        <div class="wheel">
          <div>
            <img ref="wheel" src="/img/reme/wheel.webp" />
            <img class="bottom" src="/img/reme/bottom.webp" />
          </div>
        </div>
        <img class="floor" src="/img/reme/floor.png" />
      </div>
    </div>
    <div class="footer">
      <GameFooter :name="'reme'" :maxBet="maxBet"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import GameFooter from "@/components/GameFooter.vue";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import axios from "axios";
import BetAmount from "@/components/BetAmount.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "Reme",
  mixins: [currencyExchangeRatesMixin],
  metaInfo: {
    title: "Reme",
  },
  components: {
    Currency,
    BetAmount,
    GameFooter,
    AppButton,
    InfinityIcon,
  },
  data() {
    return {
      mode: "manual",
      autoActive: false,
      autoInfinite: false,
      animationInProgress: false,
      betAmount: "0.00",
      history: [],
      player: "",
      win: null,
      house: "",
      count: 0,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "playSoundRemeRoll",
      "playSoundRoll",
      "playSoundWin",
      "playSoundLose",
    ]),
    setMode(mode) {
      if (mode === "manual") {
        this.autoInfinite = false;
        this.autoActive = false;
      }

      this.mode = mode;
    },
    playButton() {
      if (this.mode === "auto") {
        if (Math.floor(this.count) === 0) {
          this.autoInfinite = true;
        }

        this.autoActive = true;
      }

      this.play();
    },
    stopAuto() {
      this.autoInfinite = false;
      this.autoActive = false;
    },
    spinImage(callback) {
      this.playSoundRoll();

      const image = this.$refs.wheel;

      if (image) {
        const animation = image.animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(900deg)" }],
          {
            duration: this.mode === "auto" ? 500 : 1000,
            iterations: 1,
            easing: "linear",
          }
        );

        animation.onfinish = () => {
          callback();
        };
      }
    },
    async play() {
      if (!this.authUser.user) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        this.stopAuto();
        return;
      }

      const amount = Number(this.betAmount).toFixed(2);

      this.count = Math.floor(this.count);

      if (amount === null || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet amount.",
        });
        this.stopAuto();
        return;
      }

      if (
        this.mode === "auto" &&
        (this.count === null || isNaN(this.count) === true || this.count < 0)
      ) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet number.",
        });
        this.stopAuto();
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(amount);

      if (dlsAmount > this.maxBet) {
        this.notificationShow({
          type: "error",
          message: "Max bet exceeded!",
        });
        return;
      }

      this.win = null;
      this.player = "";
      this.house = "";

      this.animationInProgress = true;

      await axios
        .post("reme/roll", {
          amount: dlsAmount,
          autobet: this.autoActive,
        })
        .then(({ data }) => {
          if (this.mode == "auto") {
            const quickSpin = () => {
              this.player = data.rolls[0];
              this.house = data.rolls[1];
              this.win = data.multiplier > 0;
              this.history.unshift([
                data.multiplier > 0,
                data.multiplier + "x",
              ]);
              this.animationInProgress = false;
              if (data.multiplier > 0) {
                this.playSoundWin();
              } else {
                this.playSoundLose();
              }
            };
            this.spinImage(quickSpin);
          } else {
            const playerSpin = () => {
              this.player = data.rolls[0];

              setTimeout(() => this.spinImage(houseSpin), 500);
            };

            const houseSpin = () => {
              this.house = data.rolls[1];
              this.win = data.multiplier > 0;
              this.history.unshift([
                data.multiplier > 0,
                data.multiplier + "x",
              ]);
              this.animationInProgress = false;
              if (data.multiplier > 0) {
                this.playSoundWin();
              } else {
                this.playSoundLose();
              }
            };
            this.spinImage(playerSpin);
          }
        })
        .catch((e) => {
          this.animationInProgress = false;

          this.notificationShow(e);
        });

      if (this.mode === "auto") {
        if (this.autoInfinite === false) this.count = this.count - 1;

        if (this.count >= 1 || this.autoInfinite === true) {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            if (this.autoActive === true) {
              this.play();
            }
          }, 750);
        } else {
          this.count = Math.max(this.count, 0);
          this.stopAuto();
        }
      }
    },
  },
  computed: {
    ...mapGetters(["generalSettings", "authUser", "gameConfig"]),
    multiplier() {
      return 1;
    },
    maxBet() {
      return this.gameConfig.maxWin / this.multiplier;
    },
    profit() {
      //console.log(this.multiplier);
      return (parseFloat(this.betAmount) * this.multiplier || 0).toFixed(2);
    },
  },
  beforeRouteLeave(to, from, next) {
    this.autoInfinite = false;
    this.autoActive = false;
    next();
  },
  created() {},
};
</script>

<style scoped lang="scss">
.reme {
  max-width: 1100px;
  width: 100%;
  padding: 30px 0 0 0;
  margin-inline: auto;
  .footer {
    max-width: 1100px;
    margin-inline: auto;
  }

  .mode {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    width: 100%;
    gap: 3px;

    button {
      &.active {
        background: var(--purple);
      }
      padding: 5px 0;
      max-width: 50%;
      width: 100%;
      border-radius: 4px;
      background: #22224a;
      border: 2px solid #161533;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
      img {
        margin-top: 5px;
      }
    }
  }
}

.reme .reme-container {
  width: 100%;
  gap: 10px;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }
}

.reme .actions-controls {
  flex-shrink: 0;
  width: 300px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media screen and (max-width: 991px) {
    justify-content: unset;
    width: 100%;
    height: unset;
    display: grid;
  }
}

.reme {
  .controls-main {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 25px;
    flex-grow: 1;
    @media screen and (max-width: 991px) {
      padding: 10px;
      display: grid;
      width: 100%;
      grid-template-columns: 1fr;
    }
  }

  .controls-mode {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
    padding: 10px;

    width: 100%;
    display: flex;
    margin-bottom: 15px;
    @media screen and (max-width: 991px) {
      grid-row-start: 10;
      margin-bottom: 0;
      margin-top: 20px;
    }
    button.button-mode {
      width: 100%;
      height: 39px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      background: #22224a;

      &:first-of-type {
        margin-right: 0;
        border-radius: 5px 0px 0px 5px;
      }

      &:last-of-type {
        margin-right: 0;
        border-radius: 0 5px 5px 0;
      }

      &.button-selected {
        background: var(--purple);
      }
    }
  }
}

.reme .input-content img {
  width: 17px;
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translate(0, -50%);
}

.reme .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 48px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
}

.reme .input-content input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reme .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.reme .content-buttons button.button-amount {
  margin: 0 15px;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #626c7e;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: not-allowed;
}

.reme .content-buttons button.button-amount.button-active {
  cursor: pointer;
}

.reme .content-buttons button.button-amount.button-active:hover {
  color: #ffffff;
}

.reme .controls-rows {
  width: 100%;
  margin-top: 24px;
}

.reme .rows-content {
  width: 100%;
  margin-top: 12px;
}

.reme .controls-risk {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.reme .controls-risk button.button-risk {
  width: calc(33.33% - 10px);
  height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #22224a;
  box-shadow: 0px 2px 0px 0px #1d222a;
  cursor: not-allowed;

  &.button-selected {
    background-color: var(--purple);
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.25);
  }
}

.reme .controls-risk button.button-risk.button-active {
  cursor: pointer;
}

.reme .controls-risk button:last-of-type {
  margin-right: 0;
}

.reme .controls-count {
  width: 100%;
}

.reme .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.reme .count-content {
  width: 100%;
  display: flex;
  margin-top: 12px;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
}

.reme .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.reme .count-content input::-webkit-outer-spin-button,
.reme .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.reme .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.reme .actions-info a.link-fair,
.reme .actions-info button.button-sound {
  width: calc(50% - 8px);
  height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;

  background-color: #22224a;
  border-bottom: 2px solid #1d222a;
  transition: all 0.3s ease;
}

.reme .actions-info a.link-fair:hover,
.reme .actions-info button.button-sound:hover {
  color: #ffffff;
}

.reme .actions-info a.link-fair svg,
.reme .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.reme .actions-info a.link-fair:hover svg,
.reme .actions-info button.button-sound:hover svg {
  fill: #fff;
}

@media only screen and (max-width: 1330px) {
  .reme {
    width: 100%;
    padding: 10px 0;
  }
}

@media only screen and (max-width: 991px) {
  .reme .reme-container {
    flex-direction: column-reverse;
  }

  .reme .container-actions {
    width: 100%;
    height: auto;
    margin-top: 0;
  }
}

.controls-bet {
  margin-top: 20px;
  width: 100%;
  padding: 8px 4px 4px 4px;
  border-radius: 8px;
  background: #090c1d;
  @media screen and (max-width: 991px) {
    margin-top: 0;
    margin-bottom: 10px;
    grid-row-start: 1;
  }
}

.controls-amount {
  margin-left: auto;
  width: 100%;
  height: 42px;
  margin-top: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid #22224a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;

  img {
    margin-left: auto;
    margin-right: 8px;
  }

  input {
    max-width: 100px;
  }

  .cashout-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-inline: 13px;
    height: 100%;
    background: #22224a;

    button div {
      font-weight: 900;
      font-size: 1.143rem;
      color: #eeeeee;
    }
  }
}

.profit {
  margin-left: auto;
  width: 100%;
  height: 42px;
  margin-top: 5px;
  margin-bottom: 10px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;
  background: #22224a;
  border: 2px solid #161533;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  border-radius: 5px;

  img {
    margin-left: auto;
    margin-right: 8px;
  }

  input {
    max-width: 100px;
  }
}

.controls-amount-title {
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #eeeeee;
}

.game-container {
  max-height: 500px;
  overflow: hidden;
  width: 100%;
  padding: 20px 0 0 0;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media screen and (max-width: 991px) {
    padding: 10px 0 0 0;
  }
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;

  .score {
    display: flex;
    justify-content: space-between;
    padding-inline: 30px;

    width: 100%;
    .res {
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      > span {
        font-family: "Excon";
        font-style: normal;
        font-weight: 700;
        font-size: 2rem;

        color: #eeeeee;
      }
      > div {
        border: 1px solid #22224a;

        &.win {
          border: 2px solid var(--green);
        }

        &.loss {
          border: 2px solid var(--red);
        }
        display: grid;
        place-content: center;

        width: 75px;
        height: 75px;

        @media (max-width: 991px) {
          width: 60px;
          height: 60px;
        }

        background: #0e0d1f;
        border-radius: 8px;

        font-family: "Excon";
        font-style: normal;
        font-weight: 700;
        font-size: 2.85rem;

        color: #eeeeee;
      }
    }
  }

  .wheel {
    display: grid;
    place-content: center;
    width: 100%;
    margin-top: auto;
    height: 220px;
    @media screen and (max-width: 991px) {
      height: 140px;
    }

    > div {
      width: 200px;
      height: 200px;
      position: relative;

      @media screen and (max-width: 991px) {
        width: 120px;
        height: 120px;
      }

      > img {
        position: absolute;
        width: 200px;
        @media screen and (max-width: 991px) {
          width: 120px;
        }
        z-index: 2;
        &.bottom {
          z-index: 1;
          bottom: -13px;
        }
      }
    }
  }

  .floor {
    height: 60px;
    width: 100%;
    z-index: 3;
  }

  .reme-history {
    display: flex;
    max-width: 90%;
    width: 100%;
    overflow: hidden;
    flex-wrap: wrap;
    height: 26px;
    @media screen and (max-width: 991px) {
      height: 25px;
    }
    margin-bottom: 20px;
    gap: 5px;

    > div {
      flex-shrink: 0;
      font-weight: 700;
      font-size: 1rem;

      text-align: center;

      color: #090c1d;

      width: 45px;

      border-radius: 3px;

      background: var(--red);
      box-shadow: inset 0 -4px #0003;
      padding-bottom: 3px;
      &.win {
        background: var(--green);
      }
    }
  }
}
</style>
