<template>
  <div class="keno">
    <div class="keno-container">
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

          <div v-if="mode === 'auto'" class="controls-count">
            <div class="controls-amount-title">Number Of Bets</div>

            <div class="count-content">
              <input v-model="count" type="number" min="0" max="1000" />
              <InfinityIcon v-if="Number(count) === 0"></InfinityIcon>
            </div>
          </div>
          <div class="keno-btns">
            <button
              @click="pickRandom()"
              :disabled="this.autoActive || this.animationInProgress"
            >
              <MagicStickIcon></MagicStickIcon> Pick
            </button>
            <button
              @click="clear()"
              :disabled="this.autoActive || this.animationInProgress"
            >
              Clear
            </button>
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
      <div class="multipliers-mobile">
        <div
          v-for="(m, index) of multipliers"
          class="m"
          :class="{ active: index === hits }"
        >
          {{ m.toFixed(2) }}x
        </div>
      </div>
      <div class="game-container">
        <div class="keno_grid">
          <div
            :class="
              (selected.includes(n) ? 'active' : '') +
              ' ' +
              (response.includes(n) ? 'selected' : '')
            "
            v-for="n in 40"
            :key="n"
            @click="tileClick(n)"
          >
            <span>{{ n }}</span>
          </div>
        </div>
        <div class="multipliers">
          <div
            v-for="(m, index) of multipliers"
            class="m"
            :class="{ active: index === hits }"
          >
            <span> {{ m.toFixed(2) }}x </span>
            <span>
              {{ index }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <GameFooter :name="'keno'" :max-bet="maxBet"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import GameFooter from "@/components/GameFooter.vue";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import MagicStickIcon from "@/assets/images/magic_stick.svg?inline";

import axios from "axios";
import BetAmount from "@/components/BetAmount.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { kenoMultipliers } from "@/utils";

export default {
  name: "Keno",
  mixins: [currencyExchangeRatesMixin],
  metaInfo: {
    title: "Keno",
  },
  components: {
    BetAmount,
    GameFooter,
    AppButton,
    InfinityIcon,
    MagicStickIcon,
  },
  data() {
    return {
      mode: "manual",
      selected: [],
      response: [],
      hits: 0,
      autoActive: false,
      animationInProgress: false,
      autoInfinite: false,
      betAmount: "0.00",
      count: 0,
      timer: null,
    };
  },
  methods: {
    ...mapActions(["notificationShow", "playSoundOpen", "playSoundEmpty"]),
    getKenoMultipliers(picks) {
      return kenoMultipliers(this.gameConfig.kenoEdge)[picks];
    },
    tileClick(n) {
      this.response = [];
      if (this.selected.length >= 10 && !this.selected.includes(n)) return;
      if (!this.selected.includes(n)) this.selected.push(n);
      else this.selected.splice(this.selected.indexOf(n), 1);
    },
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
    clear() {
      this.hits = 0;
      this.selected = [];
      this.response = [];
    },
    pickRandom() {
      this.hits = 0;
      this.response = [];
      let picked = [];
      while (picked.length < 10) {
        let rand = Math.round(Math.random() * 39) + 1;
        if (picked.includes(rand)) continue;
        picked.push(rand);
      }
      this.selected = picked;
    },
    stopAuto() {
      this.autoInfinite = false;
      this.autoActive = false;
    },
    reveal(index, numbers) {
      if (index < numbers.length) {
        this.response.push(numbers[index]);

        if (this.selected.includes(numbers[index])) {
          this.hits++;
          this.playSoundOpen();
        } else {
          this.playSoundEmpty();
        }

        setTimeout(() => {
          this.reveal(index + 1, numbers);
        }, 100);
      } else {
        this.animationInProgress = false;
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

      if (this.animationInProgress) {
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

      if (!this.selected.length) {
        this.notificationShow({
          type: "error",
          message: "Please Select cells.",
        });
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

      if (this.mode !== "auto") {
        this.animationInProgress = true;
      }

      this.response = [];
      this.hits = 0;
      const dlsAmount = this.getDlsAmountForBetting(amount);

      if (dlsAmount > this.maxBet) {
        this.notificationShow({
          type: "error",
          message: "Max bet exceeded!",
        });
        this.animationInProgress = false;
        return;
      }

      await axios
        .post("keno/play", {
          picks: this.selected,
          amount: dlsAmount,
          mode: this.mode,
        })
        .then(({ data }) => {
          const numbers = data.numbers;

          if (this.mode === "auto") {
            this.hits = this.selected.filter((num) =>
              numbers.includes(num)
            ).length;
            this.response = numbers;
            this.playSoundOpen();
          } else {
            this.reveal(0, numbers);
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
    multipliers() {
      if (!this.selected.length) {
        return [];
      }

      return this.getKenoMultipliers(this.selected.length);
    },
    maxBet() {
      return this.gameConfig.kenoMaxBet;
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
@use "/src/assets/sass/mixins" as m;

.keno {
  max-width: 1100px;
  width: 100%;
  padding: 30px 0 0 0;
  margin-inline: auto;

  .footer {
    max-width: 1100px;
    margin-inline: auto;
  }

  .keno-btns {
    display: flex;
    gap: 10px;

    button {
      width: 100%;

      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 8px 10px;

      height: 35px;

      background: #22224a;
      border: 2px solid rgba(255, 255, 255, 0.07);
      border-radius: 5px;

      svg {
        margin-right: 10px;
      }
    }
  }

  .multipliers-mobile {
    overflow: scroll;
    gap: 3px;
    padding-left: 5px;
    display: flex;
    flex-direction: row;
    @include m.hide_scrollbar();

    > div {
      padding: 6px 4px;

      background: #191939;
      border: 1px solid rgba(255, 255, 255, 0.07);

      &.active {
        border: none;
        background: #5b46bc;
      }

      border-radius: 5px;

      font-weight: 700;
      font-size: 8px;
      text-align: center;

      color: #ffffff;
    }

    @media screen and (min-width: 991px) {
      display: none;
    }
  }
}

.keno .keno-container {
  width: 100%;
  gap: 10px;
  display: flex;

  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }

  justify-content: center;
}

.keno .actions-controls {
  width: 300px;
  flex-shrink: 0;
  height: 623px;
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

.keno {
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

.keno .input-content img {
  width: 17px;
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translate(0, -50%);
}

.keno .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 48px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
}

.keno .input-content input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.keno .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.keno .content-buttons button.button-amount {
  margin: 0 15px;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #626c7e;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: not-allowed;
}

.keno .content-buttons button.button-amount.button-active {
  cursor: pointer;
}

.keno .content-buttons button.button-amount.button-active:hover {
  color: #ffffff;
}

.keno .controls-rows {
  width: 100%;
  margin-top: 24px;
}

.keno .rows-content {
  width: 100%;
  margin-top: 12px;
}

.keno .controls-risk {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.keno .controls-risk button.button-risk {
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

.keno .controls-risk button.button-risk.button-active {
  cursor: pointer;
}

.keno .controls-risk button:last-of-type {
  margin-right: 0;
}

.keno .controls-count {
  width: 100%;
  margin-bottom: 15px;
}

.keno .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.keno .count-content {
  width: 100%;
  display: flex;
  margin-top: 12px;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
}

.keno .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.keno .count-content input::-webkit-outer-spin-button,
.keno .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.keno .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.keno .actions-info a.link-fair,
.keno .actions-info button.button-sound {
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

.keno .actions-info a.link-fair:hover,
.keno .actions-info button.button-sound:hover {
  color: #ffffff;
}

.keno .actions-info a.link-fair svg,
.keno .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.keno .actions-info a.link-fair:hover svg,
.keno .actions-info button.button-sound:hover svg {
  fill: #fff;
}

@media only screen and (max-width: 1330px) {
  .keno {
    width: 100%;
    padding: 4px 0;
  }
}

@media only screen and (max-width: 991px) {
  .keno .keno-container {
    flex-direction: column-reverse;
  }

  .keno .container-actions {
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
  margin-bottom: 15px;
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

.controls-amount-title {
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #eeeeee;
}

.keno .game-container {
  width: 100%;
  max-width: 815px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px;

  @media screen and (max-width: 991px) {
    padding: 25px 15px;
    max-width: 100%;
  }
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;

  .theme--light .history-keno {
    color: black !important;
  }

  .game-content-keno {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    padding: 0 !important;
    padding-inline: 5px !important;
    flex-direction: column;
  }

  .multipliers {
    margin-top: auto;
    height: 55px;
    overflow: scroll;
    gap: 10px;
    display: flex;
    @include m.hide_scrollbar();

    @media screen and (max-width: 991px) {
      display: none;
    }

    .m {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 5px 15px;
      background: #222142;
      border-radius: 5px;

      text-align: center;

      color: #eeeeee;

      span {
        &:first-of-type {
          font-weight: 700;
          font-size: 1.143rem;
        }
        &:last-of-type {
          font-weight: 600;
          font-size: 1rem;
          color: #eeeeee;
        }
      }

      &.active {
        span {
          color: #f7be2c;
        }
      }
    }
  }

  .keno_grid {
    display: grid;
    grid-gap: 8px;
    margin: auto;
    grid-template-columns: repeat(8, 70px);
    grid-template-rows: repeat(5, 70px);
    grid-auto-flow: column;
    position: relative;
    width: 100%;
    justify-content: center;
    //transform: translateY(-42px);

    div {
      background: #161533;

      cursor: pointer;

      text-align: center;
      transition: background-color 0.3s ease, color 0.3s ease, top 0.3s ease,
        border-color 0.3s ease;
      position: relative;
      box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.2);

      border: 4px solid #22224a;
      border-radius: 10px;

      @media (max-width: 991px) {
        border-width: 2px;
        box-shadow: inset 0px -3px 0px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
      }

      &:hover {
        filter: brightness(1.4);
      }

      span {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.429rem;
        font-weight: 700;
      }
    }

    div.active {
      background: #5b46bc;
      border-color: #090c1d;
    }

    div.selected {
      border-color: #090c1d;
      background: #0e1023;
    }

    div.active.selected {
      border-color: #090c1d;
      background: #5b46bc url("/img/keno-gem.svg") center no-repeat;
      background-size: contain;
    }
  }

  @media (max-width: 991px) {
    .game-content-keno {
      padding: 0 !important;
      min-height: 350px !important;
    }

    .keno_grid {
      grid-template-columns: repeat(8, 10vw);
      grid-template-rows: repeat(5, 10vw);
      grid-gap: 3px;

      div span {
        font-weight: 700;
        font-size: 0.857rem;
        text-align: center;
      }
    }
  }
}
</style>
