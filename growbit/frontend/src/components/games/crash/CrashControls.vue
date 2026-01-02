<template>
  <div class="crash-controls">
    <div class="controls-mode">
      <button
        @click="crashSetMode('manual')"
        class="button-mode"
        :class="{ 'button-selected': crashMode === 'manual' }"
      >
        Manual
      </button>
      <button
        @click="crashSetMode('auto')"
        class="button-mode"
        :class="{ 'button-selected': crashMode === 'auto' }"
      >
        Auto
      </button>
    </div>
    <div class="controls-main">
      <BetAmount
        :change="
          (value) => {
            this.crashAmount = value;
            this.crashOriginalAmount = value;
          }
        "
        :updateInput="this.crashAmount"
        :disabled="crashAutoRunning === true"
        :max-bet="maxBet"
      ></BetAmount>

      <div v-if="crashMode === 'auto'" class="controls-row-container">
        <div class="controls-cashout-container">
          <div class="controls-cashout-title">Cashout At</div>
          <div class="controls-cashout">
            <input
              v-model="crashAutoCashout"
              v-on:input="crashValidateInputCashout"
              v-on:change="crashFormatInputCashout"
              type="text"
              placeholder="Multiplier"
              v-bind:disabled="crashAutoRunning === true"
            />
            <div class="cashout-buttons">
              <button
                v-on:click="crashSetInput('crashAutoCashout', 'increase')"
                v-bind:disabled="crashAutoRunning === true"
              >
                <img src="../../../assets/images/iconup.png" alt="up" />
              </button>
              <button
                v-on:click="crashSetInput('crashAutoCashout', 'decrease')"
                v-bind:disabled="crashAutoRunning === true"
              >
                <img src="../../../assets/images/icondown.png" alt="up" />
              </button>
            </div>
          </div>
        </div>
        <div class="controls-count-container">
          <div class="controls-repeat-title">Number of bets</div>
          <div class="controls-repeat">
            <input
              v-model="crashAutoBetCount"
              v-on:input="crashValidateAutoBetCount"
              v-on:change="crashFormatInputAutoBet"
              type="text"
              placeholder="Count"
              v-bind:disabled="crashAutoRunning === true"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <div class="controls-cashout-title">Cashout At</div>
        <div class="controls-cashout">
          <input
            v-model="crashAutoCashout"
            v-on:input="crashValidateInputCashout"
            v-on:change="crashFormatInputCashout"
            type="text"
            placeholder="Multiplier"
            v-bind:disabled="crashAutoRunning === true"
          />
          <div class="cashout-buttons">
            <button
              v-on:click="crashSetInput('crashAutoCashout', 'increase')"
              v-bind:disabled="crashAutoRunning === true"
            >
              <img src="../../../assets/images/iconup.png" alt="up" />
            </button>
            <button
              v-on:click="crashSetInput('crashAutoCashout', 'decrease')"
              v-bind:disabled="crashAutoRunning === true"
            >
              <img src="../../../assets/images/icondown.png" alt="up" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="crashMode === 'manual'" class="controls-manual">
        <button
          v-if="
            authUser.user !== null &&
            crashGame !== null &&
            crashGame.state !== 'completed' &&
            crashBets.some(
              (element) =>
                element.user._id === authUser.user._id &&
                element.multiplier === undefined
            ) === true
          "
          v-on:click="crashBetCashout"
          class="betting-btn"
          v-bind:disabled="crashGame.state !== 'rolling'"
        >
          {{ crashGame.state !== "rolling" ? "Starting..." : "Cashout" }}
        </button>
        <button v-else v-on:click="crashBetButton" class="betting-btn">
          Play
        </button>
      </div>
      <div v-else class="controls-auto">
        <div class="controls-cashout-title">On win</div>
        <div class="auto-bet-controls">
          <button
            :class="!crashAutoPercentageWin ? 'active' : ''"
            @click="crashAutoPercentageWin = null"
          >
            Reset
          </button>
          <button
            :class="crashAutoPercentageWin ? 'active' : ''"
            @click="crashAutoPercentageWin = 1"
          >
            Increase
          </button>
          <span class="input-append-percent"
            ><input
              type="text"
              v-model="crashAutoPercentageWin"
              v-on:input="crashValidateAutoPercentageWin"
              v-on:change="crashFormatInputAutoPercentageWin"
              v-bind:disabled="crashAutoRunning === true" />
            <img src="../../../assets/images/percentage.svg" alt="%"
          /></span>
        </div>
        <div class="controls-cashout-title">On loss</div>
        <div class="auto-bet-controls">
          <button
            :class="!crashAutoPercentageLoss ? 'active' : ''"
            @click="crashAutoPercentageLoss = null"
          >
            Reset
          </button>
          <button
            :class="crashAutoPercentageLoss ? 'active' : ''"
            @click="crashAutoPercentageLoss = 1"
          >
            Increase
          </button>
          <span class="input-append-percent"
            ><input
              type="text"
              v-model="crashAutoPercentageLoss"
              v-on:input="crashValidateAutoPercentageWin"
              v-on:change="crashFormatInputAutoPercentageWin"
              v-bind:disabled="crashAutoRunning === true" />
            <img src="../../../assets/images/percentage.svg" alt="%"
          /></span>
        </div>
        <div class="controls-cashout-title">Stop on profit</div>
        <div class="stop-profit input-wrapper">
          <input
            v-model="crashAutoStopProfit"
            type="text"
            placeholder="Stop on profit"
            v-bind:disabled="crashAutoRunning === true"
          />
          <Currency />
        </div>
        <div class="controls-cashout-title">Stop on loss</div>

        <div class="stop-lose input-wrapper">
          <input
            v-model="crashAutoStopLoss"
            type="text"
            placeholder="Stop on loss"
            v-bind:disabled="crashAutoRunning === true"
          />
          <Currency />
        </div>
        <!--      <div class="controls-cashout-title">Number of bets</div>-->

        <!--      <div class="auto-count input-wrapper">-->
        <!--        <input-->
        <!--          v-model="crashAutoBetCount"-->
        <!--          type="text"-->
        <!--          placeholder="Number of bets"-->
        <!--        />-->
        <!--      </div>-->
        <div class="btn-wrapper">
          <button
            v-if="crashAutoRunning === true"
            v-on:click="crashAutoStopButton"
            class="betting-btn button-stop"
          >
            Stop Autobetting
          </button>
          <button v-else v-on:click="crashAutoStartButton" class="betting-btn">
            Start Autobetting
          </button>
        </div>
      </div>

      <div v-if="crashMode === 'manual'" class="bets-content">
        <div class="content-list">
          <CrashBetElement
            v-for="bet of crashBets"
            v-bind:key="bet._id"
            v-bind:bet="bet"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CrashBetElement from "@/components/games/crash/CrashBetElement.vue";
import BetAmount from "@/components/BetAmount.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "CrashControls",
  mixins: [currencyExchangeRatesMixin],
  components: {
    Currency,
    BetAmount,
    CrashBetElement,
  },
  data() {
    return {
      crashMode: "manual",
      crashAutoRunning: false,
      crashAutoInfinite: false,
      crashOriginalAmount: null,
      crashAmount: null,
      crashAutoCashout: "2.00",
      crashAutoPercentageWin: null,
      crashAutoPercentageLoss: null,
      crashAutoStopProfit: null,
      crashAutoStopLoss: null,
      crashAutoBetCount: null,
      crashAutoTotalBet: 0,
      crashAutoTotalWon: 0,
      tempimage: "dfa",
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "crashSendBetSocket",
      "crashSendCashoutSocket",
    ]),
    getBalanceInSelectedCurrency(balance) {
      // console.log("balance is " + balance);
      // console.log("fiat rate is: " + this.fiatRates.data[this.selectedCurrency]);
      return this.fiatRates.data[this.selectedCurrency] * balance;
    },
    crashSetMode(mode) {
      if (mode === "manual") {
        this.crashAutoStopButton();
      }
      this.crashMode = mode;
    },
    crashValidateInputCashout() {
      this.crashAutoCashout = this.crashAutoCashout
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.crashAutoCashout =
        this.crashAutoCashout.indexOf(".") >= 0
          ? this.crashAutoCashout.substr(
              0,
              this.crashAutoCashout.indexOf(".")
            ) +
            "." +
            this.crashAutoCashout
              .substr(this.crashAutoCashout.indexOf(".") + 1, 2)
              .replace(".", "")
          : this.crashAutoCashout;
    },
    crashValidateAutoBetCount() {
      this.crashAutoBetCount = this.crashAutoBetCount
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.crashAutoBetCount =
        this.crashAutoBetCount.indexOf(".") >= 0
          ? this.crashAutoBetCount.substr(
              0,
              this.crashAutoBetCount.indexOf(".")
            )
          : this.crashAutoBetCount;
    },
    crashValidateAutoPercentageWin() {
      this.crashAutoPercentageWin = this.crashAutoPercentageWin
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.crashAutoPercentageWin =
        this.crashAutoPercentageWin.indexOf(".") >= 0
          ? this.crashAutoPercentageWin.substr(
              0,
              this.crashAutoPercentageWin.indexOf(".")
            )
          : this.crashAutoPercentageWin;
      // this.crashAutoPercentageWin = Number(this.crashAutoPercentageWin);
    },
    crashValidateAutoPercentageLoss() {
      this.crashAutoPercentageLoss = this.crashAutoPercentageLoss
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.crashAutoPercentageLoss =
        this.crashAutoPercentageLoss.indexOf(".") >= 0
          ? this.crashAutoPercentageLoss.substr(
              0,
              this.crashAutoPercentageLoss.indexOf(".")
            )
          : this.crashAutoPercentageLoss;
      //  this.crashAutoPercentageLoss = Number(this.crashAutoPercentageLoss);
    },
    crashFormatInputCashout() {
      this.crashAutoCashout = Number(this.crashAutoCashout).toFixed(2);
    },
    crashFormatInputAutoBet() {
      this.crashAutoBetCount = Number(this.crashAutoBetCount);
    },
    crashFormatInputAutoPercentageWin() {
      this.crashAutoPercentageWin = Number(this.crashAutoPercentageWin);
    },
    crashFormatInputAutoPercentageLoss() {
      this.crashAutoPercentageLoss = Number(this.crashAutoPercentageLoss);
    },
    crashSetInput(value, action) {
      let amount = parseFloat(this[value]);
      if (action === "increase") {
        amount = amount + 1;
      } else if (action === "decrease") {
        amount = amount - 1;
      }
      if (amount <= 1) {
        amount = 1.01;
      }
      this[value] = parseFloat(amount).toFixed(2);
    },
    crashAutoStartButton() {
      const percentageWin = this.crashAutoPercentageWin;
      const percentageLoss = this.crashAutoPercentageLoss;

      if (
        isNaN(+percentageWin) === true ||
        percentageWin < 0 ||
        percentageWin > 100
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered auto bet win percentage is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (
        isNaN(+percentageLoss) === true ||
        percentageLoss < 0 ||
        percentageLoss > 100
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered auto bet loss percentage is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (isNaN(+this.crashAutoStopProfit) === true) {
        this.notificationShow({
          type: "error",
          message: "Your entered auto bet profit stop is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (isNaN(+this.crashAutoStopLoss) === true) {
        this.notificationShow({
          type: "error",
          message: "Your entered auto bet loss stop is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (isNaN(Math.floor(this.crashAutoBetCount)) === true) {
        this.notificationShow({
          type: "error",
          message: "Your entered auto bet count is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (Math.floor(this.crashAutoBetCount) === 0) {
        this.crashAutoInfinite = true;
      }

      this.crashAutoRunning = true;
      if (this.crashGame.state === "created") {
        this.crashBetButton();
      }
    },
    crashAutoStopButton() {
      this.crashAutoTotalBet = 0;
      this.crashAutoTotalWon = 0;
      this.crashAutoInfinite = false;
      this.crashAutoRunning = false;
    },
    crashBetButton() {
      if (this.socketSendLoading !== null) {
        return;
      }

      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        this.crashAutoStopButton();
        return;
      }

      const amount = this.crashAmount;
      //  console.log("crash bet button");
      //   console.log("bet amount is " + amount);
      //   console.log("type of bet amount is" + typeof(amount));
      //   console.log(amount < 0);
      const autoCashout =
        this.crashAutoCashout === null || this.crashAutoCashout.trim() === ""
          ? 0
          : this.crashAutoCashout;

      if (amount === null || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered bet amount is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      if (
        autoCashout === null ||
        isNaN(autoCashout) === true ||
        ((autoCashout !== 0 || this.crashMode === "auto") && autoCashout <= 1)
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered bet auto cashout is invalid.",
        });
        this.crashAutoStopButton();
        return;
      }

      //   console.log(Number(this.crashAmount));
      // console.log(this.gameConfig);
      //   console.log(this.getBalanceInSelectedCurrency(Number(this.gameConfig.crashMaxBet)));
      if (
        Number(this.crashAmount) >
        this.getBalanceInSelectedCurrency(Number(this.gameConfig.crashMaxBet))
      ) {
        this.notificationShow({
          type: "error",
          message:
            "Maximum allowed bet is " +
            this.getBalanceInSelectedCurrency(
              Number(this.gameConfig.crashMaxBet)
            ) +
            " " +
            this.selectedCurrency,
        });
        this.crashAutoStopButton();
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(amount);
      const data = { amount: dlsAmount, autoCashout: autoCashout };
      this.crashSendBetSocket(data);
    },
    crashBetCashout() {
      if (this.socketSendLoading !== null) {
        return;
      }

      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      const data = {};
      this.crashSendCashoutSocket(data);
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "authUser",
      "crashGame",
      "crashBets",
      "gameConfig",
      "fiatRates",
      "selectedCurrency",
      "gameConfig",
    ]),
    maxBet() {
      return this.gameConfig.crashMaxBet;
    },
  },
  watch: {
    crashGame: {
      handler(data, dataOld) {
        if (data.state === "created" && this.crashAutoRunning === true) {
          const profit = this.crashAutoTotalWon - this.crashAutoTotalBet;
          //   console.log("auto infite is " + this.crashAutoInfinite);
          //   console.log("auto bet count is: " + this.crashAutoBetCount);
          //   console.log("auto stop profit is: " + this.crashAutoStopProfit);
          //   console.log("AutoStopProfit is: " + this.crashAutoStopProfit + " type is " + typeof(this.crashAutoStopProfit));
          //   console.log("Is AutoStopProfit equal to 0 " + (this.crashAutoStopProfit === 0));
          //   console.log("profit is: " + profit);
          //   console.log("auto stop loss is: " + this.crashAutoStopLoss);
          //   console.log((this.crashAutoStopLoss === 0 ||
          //       profit >= 0 ||
          //       profit < -this.crashAutoStopLoss)
          //   );
          //   console.log((this.crashAutoStopProfit === 0 ||
          //       profit <= 0 ||
          //       profit < this.crashAutoStopProfit));
          //   console.log((this.crashAutoInfinite === true || this.crashAutoBetCount > 0));
          //console.log(this.crashAutoInfinite);
          if (
            (this.crashAutoInfinite === true ||
              Number(this.crashAutoBetCount) > 0) &&
            (Number(this.crashAutoStopProfit) === 0 ||
              Number(profit) <= 0 ||
              Number(profit) < Number(this.crashAutoStopProfit)) &&
            (Number(this.crashAutoStopLoss) === 0 ||
              Number(profit) >= 0 ||
              Number(profit) < Number(-this.crashAutoStopLoss))
          ) {
            this.crashBetButton();
          } else {
            // console.log("stopping autobet");
            this.crashAutoStopButton();
          }
        }
      },
      deep: true,
    },
    crashBets: {
      deep: true,
      handler(data, dataOld) {
        const index = data.findIndex(
          (element) => element.user._id === this.authUser.user._id
        );
        if (index !== -1 && this.crashMode === "auto") {
          const bet = data[index];

          if (bet.payout !== undefined) {
            this.crashAutoTotalWon = this.crashAutoTotalWon + bet.payout;
            if (bet.payout > 0) {
              if (this.crashAutoPercentageWin) {
                //  console.log(this.crashAmount);
                //   console.log("bet type is " + typeof(this.crashAmount));
                //   console.log(this.crashAutoPercentageWin);
                //   console.log("autopercetageonwin type is " + typeof(this.crashAutoPercentageWin));
                this.crashAmount =
                  Number(this.crashAmount) +
                  Number(this.crashAmount) *
                    (Number(this.crashAutoPercentageWin) / 100);
                this.crashAmount = Number(this.crashAmount).toFixed(2);
                //  console.log("adjusted bet after win is: " + this.crashAmount);
              } else {
                this.crashAmount = this.crashOriginalAmount;
              }
            } else if (bet.payout === 0) {
              if (this.crashAutoPercentageLoss) {
                //   console.log(this.crashAmount);
                //    console.log("bet type is " + typeof(this.crashAmount));
                //     console.log(this.crashAutoPercentageLoss);
                //      console.log("autopercetageonwin type is " + typeof(this.crashAutoPercentageLoss));
                this.crashAmount =
                  Number(this.crashAmount) +
                  Number(this.crashAmount) *
                    (Number(this.crashAutoPercentageLoss) / 100);
                this.crashAmount = Number(this.crashAmount).toFixed(2);
                //   console.log("adjusted bet after loss is: " + this.crashAmount);
              } else {
                this.crashAmount = this.crashOriginalAmount;
              }
            }
          } else {
            if (this.crashAutoBetCount > 0) {
              this.crashAutoBetCount = this.crashAutoBetCount - 1;
            }
            this.crashAutoTotalBet = this.crashAutoTotalBet + bet.amount;
          }
        }
      },
    },
    // crashAutoBetCount: {
    //   handler(data, dataOld) {
    //     if(data === 0) {
    //       this.crashAutoInfinite = true;
    //     } else {
    //       this.crashAutoInfinite = false;
    //     }
    //   }
    // }
  },
  beforeDestroy() {
    this.crashAutoRunning = false;
  },
};
</script>

<style scoped lang="scss">
.btn-wrapper {
  padding: 4px;
  display: flex;
  flex-direction: column;
  border-radius: 13px;
  background: #090c1d;
  margin-top: 10px;
  width: 100%;
  > button {
    width: 100%;
  }
}

.crash-controls {
  display: grid;
  height: fit-content;
  grid-template-columns: 1fr;

  @media only screen and (min-width: 991px) {
    height: 100%;
    max-width: 300px;
    width: 100%;

    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
}

.controls-main {
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px;
  flex-grow: 1;
  min-height: 490px;

  @media screen and (max-width: 991px) {
    padding: 10px;
    display: grid;
    width: 100%;
    min-height: unset;
    grid-template-columns: 1fr;
  }
}

.controls-row-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-grow: 1;
  gap: 10px;
}

.controls-cashout-container {
  width: 51%;
  display: flex;
  flex-direction: column;
}

.controls-count-container {
  width: 49%;
  display: flex;
  flex-direction: column;

  .controls-repeat-title {
    margin-top: 10px;
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;
    line-height: 20px;
    color: #eeeeee;
  }

  .controls-repeat {
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

    > img {
      margin-left: auto;
      margin-right: 10px;
    }

    input {
      color: #616498;
      max-width: 100px;
      &::placeholder {
        color: #616498;
      }
    }
  }
}

.controls-mode {
  width: 100%;
  display: flex;
  margin-bottom: 15px;

  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;
  padding: 10px;

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

.crash-controls .controls-amount-title {
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #eeeeee;
}

.crash-controls .controls-cashout-title {
  margin-top: 10px;
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #eeeeee;
}

input {
  color: #616498;
  &::placeholder {
    color: #616498;
  }
}
.crash-controls {
  .controls-amount {
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

    > img {
      margin-left: auto;
      margin-right: 10px;
    }

    input {
      color: #616498;
      max-width: 100px;
      &::placeholder {
        color: #616498;
      }
    }
  }

  .controls-amount {
    margin-left: auto;

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

  .controls-row-container .controls-cashout {
    justify-content: flex-start;
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

    input {
      color: #616498;
      max-width: 33px;
      &::placeholder {
        color: #616498;
      }
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
}

.crash-controls .controls-manual {
  width: 100%;
  padding: 4px;
  border-radius: 13px;
  background: #090c1d;
  margin-top: 10px;
}

.controls-auto {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .input-wrapper {
    width: 100%;
    display: flex;
    min-width: 0;
    margin-top: 5px;

    justify-content: space-between;
    align-items: center;
    height: 42px;
    background: var(--dark-blue);
    border: 2px solid #22224a;
    border-radius: 5px;
    padding-left: 5px;

    input {
      max-width: 150px;
    }

    img {
      margin-right: 7px;
    }
  }
}

.betting-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  transition: all 0.3s ease;
  background: var(--purple);
  box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding-bottom: 4px;

  font-weight: 900;
  font-size: 1.29rem;

  color: #eeeeee;

  &.button-stop {
    background: #ae2445;
    box-shadow: inset 0px -5px 0px #941936;
  }

  &:hover {
    filter: brightness(1.1);
  }
}

.bets-content {
  margin-top: 20px;
  min-height: 167px;
  display: flex;
  flex-grow: 1;
  position: relative;
  background: #090c1d;
  border-radius: 10px;

  .content-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-behavior: smooth;
  }
}

@media only screen and (max-width: 950px) {
  .crash-controls {
    width: 100%;
    height: auto;
    margin-top: 15px;
  }
}

.controls-manual {
  @media screen and (max-width: 991px) {
    grid-row-start: 1;
    margin-bottom: 10px;
  }
}

.auto-bet-controls {
  display: flex;
  height: 42px;
  align-items: center;

  * {
    width: 33%;
    padding: 5px;
    margin-right: 5px;

    &:last-child {
      margin-right: 0;
    }
  }

  img {
    max-width: 26px;
  }

  button {
    background: transparent;
    border: 0;

    font-weight: 500;
    font-size: 1rem;

    color: var(--purple-2);

    &.active {
      border-radius: 5px;
      background: var(--dark-blue);
      color: white;
    }
  }

  .input-append-percent {
    display: flex;
    justify-content: space-between;
    background: var(--dark-blue);
    border-radius: 3px;
    padding: 0;
    margin: 5px 0;
    input {
      border: 0;
    }
  }

  padding: 5px;
  background: #22224a;
  border: 2px solid var(--dark-blue-2);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
}
</style>
