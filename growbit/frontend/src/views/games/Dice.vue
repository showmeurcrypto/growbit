<template>
  <div class="dice">
    <div class="dice-container">
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
          <div class="controls-amount-title">Profit on Win</div>
          <div class="profit">
            <span>{{ profit }}</span>
            <Currency />
          </div>
          <div class="mode">
            <button
              :class="{ active: targetMode == 'under' }"
              @click="targetMode = 'under'"
            >
              <img src="@/assets/images/dice/under.svg" />
            </button>
            <button
              :class="{ active: targetMode == 'over' }"
              @click="targetMode = 'over'"
            >
              <img src="@/assets/images/dice/over.svg" />
            </button>
            <button
              :class="{ active: targetMode == 'between' }"
              @click="targetMode = 'between'"
            >
              <img src="@/assets/images/dice/inside.svg" />
            </button>
            <button
              :class="{ active: targetMode == 'outside' }"
              @click="targetMode = 'outside'"
            >
              <img src="@/assets/images/dice/outside.svg" />
            </button>
          </div>
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
        <DiceGame
          ref="gameComponent"
          :on-target-change="
            (t, t2) => {
              this.target = t;
              this.target2 = t2;
            }
          "
          :targetMode="targetMode"
        ></DiceGame>
      </div>
    </div>
    <div class="footer">
      <GameFooter :name="'dice'" :maxBet="maxBet"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import GameFooter from "@/components/GameFooter.vue";
import DiceGame from "@/components/games/gameDice/DiceGame.vue";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import axios from "axios";
import BetAmount from "@/components/BetAmount.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { getDiceChance } from "@/utils";

export default {
  name: "Dice",
  mixins: [currencyExchangeRatesMixin],
  metaInfo: {
    title: "Dice",
  },
  components: {
    Currency,
    BetAmount,
    GameFooter,
    DiceGame,
    AppButton,
    InfinityIcon,
  },
  data() {
    return {
      mode: "manual",
      autoActive: false,
      autoInfinite: false,
      betAmount: "0.00",
      target: 50,
      target2: 70,
      targetMode: "under",
      timer: null,
      count: 0,
    };
  },
  methods: {
    ...mapActions(["notificationShow"]),
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

      await axios
        .post("dice/roll", {
          target: this.target,
          target2: this.target2,
          amount: dlsAmount,
          mode: this.targetMode,
        })
        .then(({ data }) => {
          this.$refs.gameComponent.callback(data.win, data.roll);
        })
        .catch((e) => {
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
      //console.log("chance " + getDiceChance(this.target, this.target2, this.targetMode));
      // return (
      //   (getDiceChance(this.target, this.target2, this.targetMode) *
      //     (100 - this.gameConfig.diceEdge)) /
      //   100
      // );
      return (
        (100 - this.gameConfig.diceEdge) /
        getDiceChance(this.target, this.target2, this.targetMode)
      );
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
.dice {
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
      max-width: 25%;
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

.dice .dice-container {
  width: 100%;
  gap: 10px;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }
}

.dice .actions-controls {
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

.dice {
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

.dice .input-content img {
  width: 17px;
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translate(0, -50%);
}

.dice .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 48px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
}

.dice .input-content input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dice .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.dice .content-buttons button.button-amount {
  margin: 0 15px;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #626c7e;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: not-allowed;
}

.dice .content-buttons button.button-amount.button-active {
  cursor: pointer;
}

.dice .content-buttons button.button-amount.button-active:hover {
  color: #ffffff;
}

.dice .controls-rows {
  width: 100%;
  margin-top: 24px;
}

.dice .rows-content {
  width: 100%;
  margin-top: 12px;
}

.dice .controls-risk {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.dice .controls-risk button.button-risk {
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

.dice .controls-risk button.button-risk.button-active {
  cursor: pointer;
}

.dice .controls-risk button:last-of-type {
  margin-right: 0;
}

.dice .controls-count {
  width: 100%;
}

.dice .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.dice .count-content {
  width: 100%;
  display: flex;
  margin-top: 12px;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
}

.dice .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.dice .count-content input::-webkit-outer-spin-button,
.dice .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.dice .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.dice .actions-info a.link-fair,
.dice .actions-info button.button-sound {
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

.dice .actions-info a.link-fair:hover,
.dice .actions-info button.button-sound:hover {
  color: #ffffff;
}

.dice .actions-info a.link-fair svg,
.dice .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.dice .actions-info a.link-fair:hover svg,
.dice .actions-info button.button-sound:hover svg {
  fill: #fff;
}

@media only screen and (max-width: 1330px) {
  .dice {
    width: 100%;
    padding: 10px 0;
  }
}

@media only screen and (max-width: 991px) {
  .dice .dice-container {
    flex-direction: column-reverse;
  }

  .dice .container-actions {
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
  width: 100%;
  padding: 20px 0;

  @media screen and (max-width: 991px) {
    padding: 0;
  }
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;
}
</style>
