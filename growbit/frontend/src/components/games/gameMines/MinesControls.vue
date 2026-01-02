<template>
  <!-- <div class="container-actions"> -->
  <div class="actions-controls">
    <div class="controls-mode">
      <button
        v-on:click="minesSetMode('manual')"
        class="button-mode"
        v-bind:class="{ 'button-selected': mode === 'manual' }"
        :disabled="minesAutoActive === true"
      >
        Manual
      </button>
      <button
        v-on:click="minesSetMode('auto')"
        class="button-mode"
        v-bind:class="{ 'button-selected': mode === 'auto' }"
        :disabled="
          minesGame !== null &&
          minesGame.state !== 'completed' &&
          mode !== 'auto'
        "
      >
        Auto
      </button>
    </div>
    <div class="controls-main">
      <BetAmount
        :change="(value) => (this.minesAmount = value)"
        :disabled="minesGame !== null && minesGame.state !== 'completed'"
        :max-bet="maxBet"
      ></BetAmount>
      <div class="controls-rows">
        <div class="controls-amount-title">Grid Size</div>
        <div class="rows-content grid-size">
          <button
            :class="{ active: this.minesGridSize == 25 }"
            :disabled="minesGame !== null && minesGame.state !== 'completed'"
            @click="setGridSize(25)"
          >
            25
          </button>
          <button
            :class="{ active: this.minesGridSize == 36 }"
            :disabled="minesGame !== null && minesGame.state !== 'completed'"
            @click="setGridSize(36)"
          >
            36
          </button>
          <button
            :class="{ active: this.minesGridSize == 49 }"
            :disabled="minesGame !== null && minesGame.state !== 'completed'"
            @click="setGridSize(49)"
          >
            49
          </button>
          <button
            :class="{ active: this.minesGridSize == 64 }"
            :disabled="minesGame !== null && minesGame.state !== 'completed'"
            @click="setGridSize(64)"
          >
            64
          </button>
        </div>
      </div>
      <div class="controls-rows">
        <div class="controls-amount-title">Number Of Mines</div>
        <div class="rows-content">
          <!--  <MinesDropdown
            :minesSetCount="this.minesSetCount"
            :minesCount="minesCount"
          /> -->
          <div class="controls-cashout">
            <div class="mines-amount-input">
              <input
                v-model="count"
                @input="validateMinesAmount"
                type="number"
                placeholder=""
                :min="Math.floor(Math.sqrt(minesGridSize)) - 4"
                v-bind:disabled="
                  minesGame !== null && minesGame.state !== 'completed'
                "
              />
              <BombIcon></BombIcon>
            </div>
            <div class="cashout-buttons">
              <button
                v-on:click="minesSetAmount('increase')"
                v-bind:disabled="
                  minesAutoActive === true ||
                  (minesGame !== null && minesGame.state !== 'completed')
                "
              >
                <img src="../../../assets/images/iconup.png" alt="up" />
              </button>
              <button
                v-on:click="minesSetAmount('decrease')"
                v-bind:disabled="
                  minesAutoActive === true ||
                  (minesGame !== null && minesGame.state !== 'completed')
                "
              >
                <img src="../../../assets/images/icondown.png" alt="up" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="mode === 'auto'" class="controls-count">
        <div class="controls-amount-title">Number Of Bets</div>

        <div class="count-content">
          <input v-model="countAuto" type="number" min="0" max="1000" />
          <InfinityIcon v-if="Number(countAuto) === 0"></InfinityIcon>
        </div>
      </div>
      <div class="controls-bet">
        <button
          v-if="
            (minesGame === null && !minesAutoActive) ||
            (((minesGame !== null && minesGame.state === 'completed') ||
              (minesAutoActive === false && autobetAnimationInProgress)) &&
              (mode !== 'auto' || minesAutoActive === false))
          "
          v-on:click="minesBetButton()"
          v-bind:disabled="
            socketSendLoading !== null || autobetAnimationInProgress
          "
          class="button-create"
        >
          <transition name="fade" mode="out-in">
            <ButtonLoading v-if="socketSendLoading === 'MinesBet'" />
            <div v-else class="inner-content">
              {{ mode === "auto" ? "Start Autobet" : "Place Bet" }}
            </div>
          </transition>
        </button>
        <button
          v-else-if="mode === 'auto' || minesAutoActive !== false"
          v-on:click="stopAuto()"
          class="button-stop-autobet"
        >
          <transition name="fade" mode="out-in">
            <ButtonLoading
              v-if="
                socketSendLoading === 'MinesBet' &&
                mode === 'auto' &&
                minesAutoActive === false
              "
            />
            <div v-else class="inner-content">Stop Autobet</div>
          </transition>
        </button>
        <!-- <app-button v-else-if="mode === 'auto' || minesAutoActive !== false" :click="stopAuto" :red="true" :fullwidth="true">
              Stop Autobet
        </app-button> -->
        <button
          v-else
          v-on:click="minesCashoutButton()"
          class="button-cashout"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">
            <transition name="fade" mode="out-in">
              <ButtonLoading v-if="socketSendLoading === 'MinesCashout'" />
              <div v-else class="inner-content">
                Cashout
                <div class="content-amount">
                  <div class="amount-value">
                    <span>{{
                      getBalanceInSelectedCurrency(minesGetCashoutAmount)
                    }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </button>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import ButtonLoading from "@/components/ButtonLoading.vue";
import MinesDropdown from "@/components/games/gameMines/MinesDropdown.vue";
import { minesGetGamePayout, minesGetCurrentMultiplier } from "@/utils";
import BetAmount from "@/components/BetAmount.vue";
import BombIcon from "@/assets/images/bomb_icon.svg?inline";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "MinesControls",
  mixins: [currencyExchangeRatesMixin],
  components: {
    BetAmount,
    MinesDropdown,
    ButtonLoading,
    InfinityIcon,
    BombIcon,
  },
  data() {
    return {
      mode: "manual",
      autoInfinite: false,
      // minesGridSize: 25,
      minesAmount: null,
      count: null,
      countAuto: 0,
      autoplayTimer: null,
      roundTimer: null,
      autobetAnimationInProgress: false,
    };
  },
  created() {
    this.count = Math.ceil(Math.sqrt(this.minesGridSize)) - 4;
    this.autoInfinite = false;
    this.minesSetAutobet({ autobet: false });
    this.minesSetAutoActive({ autoactive: false });
    this.minesClearSelected();
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "minesSendBetSocket",
      "minesAutobetSocket",
      "minesSendRevealSocket",
      "minesSendCashoutSocket",
      "minesSetAutobet",
      "minesSetAutoActive",
      "minesSendRevealSocket",
      "minesClearGame",
      "minesClearSelected",
      "minesSetCount",
      "minesSetGridSize",
    ]),
    minesSetAmount(type) {
      if (isNaN(this.count)) return;
      if (type === "increase") {
        this.count++;
      } else if (type === "decrease") {
        this.count--;
      }
      this.validateMinesAmount();
      //this.minesSetCount(this.count);
    },
    validateMinesAmount() {
      // console.log(newGridSize);
      if (isNaN(this.count)) {
        this.count = Math.floor(Math.sqrt(this.minesGridSize)) - 4;
      } else if (this.count > this.minesGridSize - 1) {
        this.count = this.minesGridSize - 1;
      } else if (this.count < 0) {
        this.count = Math.floor(Math.sqrt(this.minesGridSize)) - 4;
      } else {
        this.count = Math.floor(this.count);
      }
      this.minesSetCount(this.count);
    },
    validateMinesAmountGridChange() {
      if (this.count < Math.floor(Math.sqrt(this.minesGridSize)) - 4) {
        this.count = Math.floor(Math.sqrt(this.minesGridSize)) - 4;
      }
    },
    setGridSize(size) {
      if (size != 25 && size != 36 && size != 49 && size != 64) {
        this.notificationShow({
          type: "error",
          message: "Please choose a valid grid size!",
        });
        return;
      }
      this.minesClearGame();
      this.minesClearSelected();
      this.minesSetGridSize({ size: size });
      this.validateMinesAmount();
      this.validateMinesAmountGridChange();
    },
    getBalanceInSelectedCurrency(balance) {
      return (
        this.fiatRates.data[this.selectedCurrency] * balance
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    minesSetMode(mode) {
      if (mode === "manual") {
        this.autoInfinite = false;
        this.minesSetAutoActive({ autoactive: false });
        this.minesSetAutobet({ autobet: false });
        this.minesClearSelected();
      } else {
        this.minesClearGame();
        this.minesClearSelected();
        this.minesSetAutobet({ autobet: true });
      }

      this.mode = mode;
    },
    stopAuto() {
      this.autoInfinite = false;
      this.autoActive = false;
      this.minesSetAutoActive({ autoactive: false });
    },
    minesBetButton() {
      if (this.mode === "auto") {
        if (Math.floor(this.countAuto) === 0) {
          this.autoInfinite = true;
        }

        this.minesSetAutoActive({ autoactive: true });
      }

      this.play();
    },
    async play() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        this.stopAuto();
        return;
      }

      const amount = this.minesAmount;
      const minesCount = Math.floor(this.minesCount);

      if (isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered bet amount is invalid.",
        });
        this.stopAuto();
        return;
      }

      if (
        isNaN(minesCount) === true ||
        minesCount < Math.floor(Math.sqrt(this.minesGridSize)) - 4 ||
        minesCount > this.minesGridSize - 1
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered mines count is invalid.",
        });
        this.stopAuto();
        return;
      }

      if (this.mode === "auto" && !this.minesSelected.length) {
        this.notificationShow({
          type: "error",
          message: "Please Select cells.",
        });
        this.stopAuto();
        return;
      }

      if (
        this.mode === "auto" &&
        (this.minesCount === null ||
          isNaN(this.minesCount) === true ||
          this.minesCount < 0)
      ) {
        this.notificationShow({
          type: "error",
          message: "Please enter a valid mine number.",
        });
        this.stopAuto();
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(amount);

      if (dlsAmount > this.gameConfig.minesMaxBet) {
        this.notificationShow({
          type: "error",
          message:
            "Maximum allowed bet is " +
            this.getBalanceInSelectedCurrency(
              Number(this.gameConfig.minesMaxBet)
            ) +
            " " +
            this.selectedCurrency,
        });
        return;
      }

      if (this.mode === "auto" && this.minesAutoActive) {
        const data = {
          amount: dlsAmount,
          minesGridSize: this.minesGridSize,
          minesCount: minesCount,
          tiles: this.minesSelected,
        };
        let last = this.countAuto === 0 && !this.autoInfinite;
        //console.log("last");
        if (this.countAuto > 0 || this.autoInfinite) {
          this.minesAutobetSocket(data);
        }
        if (this.autoInfinite === false && this.count > 0)
          this.countAuto = this.countAuto - 1;

        if ((this.countAuto >= 0 && !last) || this.autoInfinite) {
          clearTimeout(this.autoplayTimer);
          this.autoplayTimer = setTimeout(() => {
            if (this.minesAutoActive) {
              this.minesClearGame();
              setTimeout(() => {
                this.play();
              }, 200);
            } else {
              this.minesClearGame();
            }
          }, 1000);
        } else {
          this.countAuto = Math.max(this.countAuto, 0);
          this.stopAuto();
          this.minesClearGame();
          //log("Mines game cleared " + this.minesGame);
        }
      } else {
        const data = {
          amount: dlsAmount,
          minesCount: minesCount,
          minesGridSize: this.minesGridSize,
        };
        this.minesSendBetSocket(data);
      }
    },
    minesCashoutButton() {
      const data = {};
      this.minesSendCashoutSocket(data);
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "soundMines",
      "authUser",
      "minesGame",
      "minesSelected",
      "gameConfig",
      "minesAutoActive",
      "fiatRates",
      "selectedCurrency",
      "gameConfig",
      "minesCount",
      "minesGridSize",
    ]),
    maxBet() {
      return this.gameConfig.minesMaxBet;
    },
    minesGetCashoutAmount() {
      return (
        this.minesGame.amount *
        minesGetCurrentMultiplier(this.minesGame, this.gameConfig.minesEdge)
      );
    },
  },
  beforeDestroy() {
    this.autoInfinite = false;
    this.autobetAnimationInProgress = false;
    this.minesSetAutoActive({ autoactive: false });
    this.minesSetAutobet({ autobet: false });
    this.minesClearSelected();
    clearInterval(this.roundTimer);
    clearTimeout(this.autoplayTimer);
    //console.log("Destroying MinesControls component");
  },
};
</script>

<style scoped lang="scss">
.mines .controls-rows {
  padding-bottom: 10px;
}

.grid-size {
  margin-top: 10px;
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
    height: 40px;
    border-radius: 4px;
    background: #22224a;
    border: 2px solid #161533;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  }
}

.controls-cashout {
  // margin-left: auto;
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
  @media (max-width: 991px) {
    justify-content: space-between;
  }

  > img {
    margin-left: auto;
    margin-right: 10px;
  }

  .mines-amount-input {
    display: flex;
    align-items: center;
    input {
      color: #616498;
      max-width: 20px;
      &::placeholder {
        color: #616498;
      }
    }
    svg {
      margin-bottom: 7px;
    }
  }

  &:has(input:out-of-range) {
    border: 2px solid var(--red);
  }

  .cashout-buttons {
    display: flex;
    align-items: center;
    gap: 5px;
    padding-inline: 7px;
    height: 100%;

    button {
      width: 30px;
      height: 26px;
      background: #22224a;
      border-radius: 3px;

      img {
        height: 10px;
        width: 10px;
      }
    }
  }
}

.mines .container-actions {
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;
}

.mines .actions-controls {
  flex-shrink: 0;
  width: 300px;
  height: 560px;
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

.mines .input-title {
  width: 100%;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.mines .input-content {
  width: 100%;
  position: relative;
  margin-top: 12px;
  border-radius: 8px;
  background: #22224a;
}

.mines {
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
      font-size: 14px;
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

.mines .input-content img {
  width: 20px;
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
}

.mines .input-content input {
  width: 100%;
  height: 58px;
  padding: 0 160px 0 49px;
  font-size: 15px;
  font-weight: 700;
  color: #616498;
}

.mines .content-buttons {
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
}

.mines .content-buttons button {
  margin: 0 15px;
  font-size: 14px;
  font-weight: 700;
  color: #626c7e;
}

.mines .controls-count {
  width: 100%;
}

.mines .count-title {
  width: 100%;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.mines .count-content {
  width: 100%;
  display: flex;
  height: 42px;
  align-items: center;
  border: 2px solid #22224a;
  border-radius: 5px;
  padding-right: 10px;
}

.mines .count-content input {
  width: 90%;
  padding: 0 17px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  -moz-appearance: textfield;
}

.mines .count-content input::-webkit-outer-spin-button,
.mines .count-content input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.mines .content-buttons button:not([disabled]):hover {
  color: #fff;
}

.mines .controls-mines {
  width: 100%;
  margin-top: 24px;
}

.mines .mines-title {
  width: 100%;
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.mines .mines-content {
  width: 100%;
  margin-top: 12px;
}

.mines .content-actions {
  width: 100%;
  display: flex;
  margin-top: 18px;
}

.mines .content-actions button {
  width: calc(25% - 12px);
  height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: #22224a;
  box-shadow: 0 2px 0 0 #1d222a;
}

.mines .content-actions button:last-of-type {
  margin-right: 0;
}

.mines .content-actions button.button-active {
  color: #fd3b31;
  background: #252129;
  box-shadow: 0 0 0 1px #59272b;
}

.mines .content-actions button img {
  width: 24px;
  margin-right: 15px;
}

.mines .controls-bet {
  width: 100%;
  margin-top: 20px;
  padding: 4px;
  border-radius: 13px;
  background: #090c1d;
  @media screen and (max-width: 991px) {
    grid-row-start: 1;
    margin: 0;
    margin-bottom: 10px;
  }
}

.mines .controls-bet button.button-cashout,
.mines .controls-bet button.button-create {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;

  .inner-content {
    font-family: "Excon";
    font-style: normal;
    font-weight: 900;
    font-size: 18px;
    color: #eeeeee;
    padding-bottom: 5px;
  }
}
.mines .controls-bet button.button-stop-autobet {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  background-color: #fff;

  .inner-content {
    font-family: "Excon";
    font-style: normal;
    font-weight: 900;
    font-size: 18px;
    color: #eeeeee;
    padding-bottom: 5px;
  }
}

.mines .controls-bet button.button-create {
  background: var(--purple);
  box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
  background: var(--purple);
}

.mines .controls-bet button.button-stop-autobet,
.mines .controls-bet button.button-cashout {
  background: var(--red);
  box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
}

.mines .controls-bet button.button-create:not([disabled]):hover {
  filter: brightness(1.1);
}

.mines .controls-bet button.button-cashout:not([disabled]):hover {
  filter: brightness(1.1);
}

.mines .controls-bet button.button-cashout img {
  width: 21px;
  margin-left: 12px;
}

.mines .controls-bet button.button-cashout .button-amount {
  margin-left: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.mines .controls-bet button.button-cashout .button-amount span {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.mines .controls-risk {
  width: 100%;
  margin-top: 18px;
}

.mines .risk-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mines .info-text {
  font-size: 13px;
  font-weight: 700;
  color: #596076;
}

.mines .info-value {
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.mines .controls-risk.risk-low .info-value {
  color: #00c74d;
}

.mines .controls-risk.risk-medium .info-value {
  color: #f4d03f;
}

.mines .controls-risk.risk-high .info-value {
  color: #fd3b31;
}

.mines .risk-bar {
  width: 100%;
  height: 8px;
  display: flex;
  margin-top: 12px;
  border-radius: 4px;
  background: #22224a;
}

.mines .bar-progress {
  height: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.mines .controls-risk.risk-low .bar-progress {
  background: var(--purple);
}

.mines .controls-risk.risk-medium .bar-progress {
  background: #f4d03f;
}

.mines .controls-risk.risk-high .bar-progress {
  background: #fd3b31;
}

.mines .actions-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.mines .actions-info a.link-fair,
.mines .actions-info button.button-sound {
  width: calc(50% - 8px);
  height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 700;

  background: #22224a;
  border-bottom: 2px solid #1d222a;
}

.mines .actions-info a.link-fair:hover,
.mines .actions-info button.button-sound:hover {
  color: #fff;
}

.mines .actions-info a.link-fair svg,
.mines .actions-info button.button-sound svg {
  width: 16px;
  margin-right: 8px;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.mines .actions-info a.link-fair:hover svg,
.mines .actions-info button.button-sound:hover svg {
  fill: #fff;
}

button.button-cashout,
button.button-auto {
  width: 100%;
  height: 44px;
  position: relative;
  z-index: 1;
}

button.button-cashout .button-inner,
button.button-auto .button-inner {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  clip-path: polygon(
    6px 0,
    calc(100% - 6px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 6px) 100%,
    6px 100%,
    0 75%,
    0 25%
  );
}

button.button-cashout .inner-content {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

button.button-cashout .content-amount {
  display: flex;
  align-items: center;
  margin-left: 11px;
}

button.button-cashout .content-amount img {
  width: 16px !important;
  height: 16px;
  margin-right: 6px;
}

.controls-amount {
  margin-left: auto;
  width: 100%;
  height: 47px;
  margin-top: 5px;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid #22224a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 15px;
  margin-bottom: 10px;

  img {
    margin-left: auto;
    margin-right: 8px;
  }

  input {
    max-width: 100px;
    color: #616498;
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
        font-size: 16px;
        color: #eeeeee;
      }
      &:first-of-type div {
        font-size: 20px;
      }
    }
  }
}

.controls-amount-title {
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 4px;
  color: #eeeeee;
}
</style>
