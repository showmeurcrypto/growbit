<template>
  <div class="plinko">
    <div class="plinko-container">
      <div class="container-actions">
        <div class="actions-controls">
          <div class="controls-mode">
            <button
              v-on:click="plinkoSetMode('manual')"
              class="button-mode"
              v-bind:class="{ 'button-selected': plinkoMode === 'manual' }"
            >
              Manual
            </button>
            <button
              v-on:click="plinkoSetMode('auto')"
              class="button-mode"
              v-bind:class="{ 'button-selected': plinkoMode === 'auto' }"
            >
              Auto
            </button>
          </div>
          <div class="controls-main">
            <BetAmount
              :max-bet="maxBet"
              :change="(value) => (this.plinkoAmount = value)"
              :disabled="plinkoGames.length >= 1"
            ></BetAmount>
            <div class="controls-rows">
              <div class="controls-amount-title">Number Of Rows</div>
              <div class="rows-content">
                <PlinkoFilterRows />
              </div>
            </div>
            <div class="controls-risk">
              <button
                v-on:click="plinkoSetRisk('low')"
                class="button-risk"
                v-bind:class="{
                  'button-selected': plinkoRisk === 'low',
                  'button-active': plinkoGames.length === 0,
                }"
              >
                Low
              </button>
              <button
                v-on:click="plinkoSetRisk('medium')"
                class="button-risk"
                v-bind:class="{
                  'button-selected': plinkoRisk === 'medium',
                  'button-active': plinkoGames.length === 0,
                }"
              >
                Medium
              </button>
              <button
                v-on:click="plinkoSetRisk('high')"
                class="button-risk"
                v-bind:class="{
                  'button-selected': plinkoRisk === 'high',
                  'button-active': plinkoGames.length === 0,
                }"
              >
                High
              </button>
            </div>
            <div v-if="plinkoMode === 'auto'" class="controls-count">
              <div class="controls-amount-title">Number Of Bets</div>

              <div class="count-content">
                <input v-model="plinkoCount" type="number" min="0" max="1000" />
                <InfinityIcon v-if="Number(plinkoCount) === 0"></InfinityIcon>
              </div>
            </div>
            <div class="controls-bet">
              <app-button
                :fullwidth="true"
                v-if="plinkoMode !== 'auto' || plinkoAutoActive === false"
                :click="plinkoCreateButton"
                class="button-create"
              >
                {{ plinkoMode === "auto" ? "Start Autobet" : "Place Bet" }}
              </app-button>
              <app-button
                v-else
                :click="plinkoStopAuto"
                :red="true"
                :fullwidth="true"
              >
                Stop Autobet
              </app-button>
            </div>
          </div>
        </div>
      </div>
      <div class="game-container">
        <div class="plinko-history">
          <div v-for="h of plinkoHistory" :class="{ win: h >= 1 }">
            {{ h.toFixed(2) }}
          </div>
        </div>
        <PlinkoGame :risk="plinkoRisk" />
      </div>
    </div>
    <div class="footer">
      <GameFooter :name="'plinko'" :max-bet="maxBet"></GameFooter>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import PlinkoFilterRows from "@/components/games/gamePlinko/PlinkoFilterRows.vue";
import AppButton from "@/components/AppButton.vue";
import PlinkoGame from "@/components/games/gamePlinko/game/PlinkoGame.vue";
import GameFooter from "@/components/GameFooter.vue";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import BetAmount from "@/components/BetAmount.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { getPlinkoPayoutForEdge, MAX_WIN, PLINKO_MULTIPLIERS } from "@/utils";
export default {
  name: "Plinko",
  mixins: [currencyExchangeRatesMixin],
  metaInfo: {
    title: "Plinko",
  },
  components: {
    BetAmount,
    GameFooter,
    PlinkoFilterRows,
    PlinkoGame,
    AppButton,
    InfinityIcon,
  },
  data() {
    return {
      plinkoMode: "manual",
      plinkoAutoActive: false,
      plinkoAutoInfinite: false,
      plinkoAmount: "0.00",
      plinkoRisk: "low",
      plinkoCount: 0,
      timer: null,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "plinkoSendCreateSocket",
      "plinkoClearGames",
      "soundSetVolume",
      "socketConnectPlinko",
      "socketDisconnectPlinko",
    ]),
    plinkoSetMode(mode) {
      if (mode === "manual") {
        this.plinkoAutoInfinite = false;
        this.plinkoAutoActive = false;
      }

      this.plinkoMode = mode;
    },
    plinkoSetRisk(risk) {
      if (this.plinkoGames.length >= 1) {
        return;
      }
      this.plinkoRisk = risk;
    },
    plinkoCreateButton() {
      if (this.plinkoMode === "auto") {
        if (Math.floor(this.plinkoCount) === 0) {
          this.plinkoAutoInfinite = true;
        }

        this.plinkoAutoActive = true;
      }

      this.plinkoSendCreate();
    },
    plinkoStopAuto() {
      this.plinkoAutoInfinite = false;
      this.plinkoAutoActive = false;
    },
    async plinkoSendCreate() {
      if (this.socketSendLoading !== null) {
        return;
      }

      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        this.plinkoStopAuto();
        return;
      }

      const amount = Number(this.plinkoAmount).toFixed(2);

      this.plinkoCount = Math.floor(this.plinkoCount);

      if (amount === null || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet amount.",
        });
        this.plinkoStopAuto();
        return;
      }

      if (
        this.plinkoMode === "auto" &&
        (this.plinkoCount === null ||
          isNaN(this.plinkoCount) === true ||
          this.plinkoCount < 0)
      ) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid bet number.",
        });
        this.plinkoStopAuto();
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

      const data = {
        amount: dlsAmount,
        rows: this.plinkoFilterRows,
        risk: this.plinkoRisk,
      };
      await this.plinkoSendCreateSocket(data);

      if (this.plinkoMode === "auto") {
        if (this.plinkoAutoInfinite === false)
          this.plinkoCount = this.plinkoCount - 1;

        if (this.plinkoCount >= 1 || this.plinkoAutoInfinite === true) {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            if (this.plinkoAutoActive === true) {
              this.plinkoSendCreate();
            }
          }, 750);
        } else {
          this.plinkoCount = Math.max(this.plinkoCount, 0);
          this.plinkoStopAuto();
        }
      }
    },
  },
  computed: {
    ...mapGetters([
      "generalSettings",
      "authUser",
      "plinkoGames",
      "plinkoFilterRows",
      "socketSendLoading",
      "plinkoHistory",
      "gameConfig",
    ]),
    maxBet() {
      return (
        this.gameConfig.maxWin /
        getPlinkoPayoutForEdge(this.gameConfig.plinkoEdge)[this.plinkoRisk][
          this.plinkoFilterRows
        ][0]
      );
    },
  },
  beforeRouteLeave(to, from, next) {
    this.plinkoAutoInfinite = false;
    this.plinkoAutoActive = false;
    this.plinkoClearGames();
    this.socketDisconnectPlinko();
    next();
  },
  created() {
    this.socketConnectPlinko();
  },
};
</script>

<style scoped lang="scss">
.plinko-history {
  position: absolute;
  flex-direction: column;
  display: flex;
  right: 20px;
  width: 47px;
  @media screen and (max-width: 991px) {
    right: 10px;
    bottom: 150px;
  }
  max-height: 50%;
  overflow: hidden;
  flex-wrap: wrap;
  gap: 5px;

  > div {
    flex-shrink: 0;
    font-weight: 700;
    font-size: 1rem;

    text-align: center;

    color: #090c1d;

    width: 45px;

    border-radius: 3px;

    background: var(--purple);
    box-shadow: inset 0 -4px #0003;
    padding-bottom: 3px;
    &.win {
      background: var(--green);
    }
  }
}
.plinko {
  width: 1300px;
  padding: 30px 0 10px 0;
  margin-inline: auto;

  .footer {
    max-width: 1090px;
    margin-inline: auto;
  }
}

.plinko .plinko-container {
  width: 100%;
  gap: 10px;
  display: flex;
  justify-content: center;
  padding-inline: 10px;
}

.plinko .container-actions {
  width: 380px;
  height: 670px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.plinko .actions-controls {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 991px) {
    display: grid;
  }
}
.plinko {
  .controls-main {
    background: var(--dark-blue);
    border: 4px solid #090c1d;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 20px;
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
    @media screen and (max-width: 991px) {
      margin-top: 15px;
      grid-row-start: 20;
    }

    width: 100%;
    display: flex;
    margin-bottom: 15px;

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

.plinko .input-content img {
  width: 17px;

  position: absolute;
  top: 50%;
  left: 18px;
  transform: translate(0, -50%);
}

.plinko .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 48px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: transparent;
}

.plinko .input-content input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plinko .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.plinko .content-buttons button.button-amount {
  margin: 0 15px;
  padding: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #626c7e;
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: not-allowed;
}

.plinko .content-buttons button.button-amount.button-active {
  cursor: pointer;
}

.plinko .content-buttons button.button-amount.button-active:hover {
  color: #ffffff;
}

.plinko .controls-rows {
  width: 100%;
  margin-top: 24px;
}

.plinko .rows-content {
  width: 100%;
  margin-top: 12px;
}

.plinko .controls-risk {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.plinko .controls-risk button.button-risk {
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
  background: #22224a;

  cursor: not-allowed;

  &.button-selected {
    background-color: var(--purple);
  }
}

.plinko .controls-risk button.button-risk.button-active {
  cursor: pointer;
}

.plinko .controls-risk button:last-of-type {
  margin-right: 0;
}

.plinko .controls-count {
  width: 100%;
  margin-top: 24px;
}

.plinko .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.plinko .count-content {
  width: 100%;
  display: flex;
  margin-top: 12px;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
  svg {
    margin-left: auto;
  }
}

.plinko .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.plinko .count-content input::-webkit-outer-spin-button,
.plinko .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.plinko .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.plinko .actions-info a.link-fair,
.plinko .actions-info button.button-sound {
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

.plinko .actions-info a.link-fair:hover,
.plinko .actions-info button.button-sound:hover {
  color: #ffffff;
}

.plinko .actions-info a.link-fair svg,
.plinko .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.plinko .actions-info a.link-fair:hover svg,
.plinko .actions-info button.button-sound:hover svg {
  fill: #fff;
}

@media only screen and (max-width: 1330px) {
  .plinko {
    width: 100%;
    padding: 4px 0;
  }
}

@media only screen and (max-width: 1100px) {
  .plinko .plinko-container {
    flex-direction: column-reverse;
  }

  .plinko .container-actions {
    width: 100%;
    height: auto;
  }
}

.controls-bet {
  margin-top: 20px;
  width: 100%;
  padding: 8px 4px 4px 4px;
  border-radius: 8px;
  background: #090c1d;
  @media screen and (max-width: 991px) {
    grid-row-start: 1;
    margin: 0;
    margin-bottom: 10px;
  }
}

.controls-amount {
  margin-left: auto;
  width: 100%;
  height: 42px;
  margin-top: 5px;
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

    button {
      div {
        font-weight: 900;
        font-size: 1.143rem;
        color: #eeeeee;
      }
      &:first-of-type div {
        font-size: 1.429rem;
      }
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

.game-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  padding: 20px 0;

  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
