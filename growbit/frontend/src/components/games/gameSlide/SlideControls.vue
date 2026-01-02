<template>
  <div class="slide-controls">
    <div class="controls-amount">
      <div class="input-wrapper">
        <input
          v-model="slideAmount"
          @input="slideValidateInput(slideAmount)"
          type="text"
        />
        <Currency />
      </div>

      <div class="amount-buttons">
        <button v-on:click="slideSetAmount('clear')" class="button-amount">
          Clear
        </button>
        <button v-on:click="slideSetAmount('+1')" class="button-amount">
          +1
        </button>
        <button v-on:click="slideSetAmount('+10')" class="button-amount">
          +10
        </button>
        <button v-on:click="slideSetAmount('+100')" class="button-amount">
          +100
        </button>
        <button v-on:click="slideSetAmount('1/2')" class="button-amount">
          1/2
        </button>
        <button v-on:click="slideSetAmount('x2')" class="button-amount">
          x2
        </button>
        <button v-on:click="slideSetAmount('max')" class="button-amount">
          MAX
        </button>
      </div>
    </div>
    <div class="controls-bet">
      <div class="bet-section section-red">
        <button
          v-on:click="slideBetButton('red')"
          class="button-bet"
          :disabled="socketSendLoading !== null || !betting"
        >
          <div class="button-info">
            <img src="../../../assets/images/slide/red_new.png" />
            PLACE BET
          </div>
          <div class="button-multiplier">2x</div>
        </button>
      </div>
      <div class="bet-section section-black">
        <button
          v-on:click="slideBetButton('purple')"
          class="button-bet"
          :disabled="socketSendLoading !== null || !betting"
        >
          <div class="button-info">
            <img src="../../../assets/images/slide/purple_new.png" />
            PLACE BET
          </div>
          <div class="button-multiplier">2x</div>
        </button>
      </div>
      <div class="bet-section section-green">
        <button
          v-on:click="slideBetButton('yellow')"
          class="button-bet"
          :disabled="socketSendLoading !== null || !betting"
        >
          <div class="button-info">
            <img src="../../../assets/images/slide/yellow_new.png" />
            PLACE BET
          </div>
          <div class="button-multiplier">14x</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "SlideControls",
  components: { Currency },
  mixins: [currencyExchangeRatesMixin],
  data() {
    return {
      slideAmount: "0.00",
    };
  },
  methods: {
    ...mapActions(["notificationShow", "slideSendBetSocket"]),
    slideValidateInput() {
      this.slideAmount = this.slideAmount
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.slideAmount =
        this.slideAmount.indexOf(".") >= 0
          ? this.slideAmount.substr(0, this.slideAmount.indexOf(".")) +
            "." +
            this.slideAmount
              .substr(this.slideAmount.indexOf(".") + 1, 2)
              .replace(".", "")
          : this.slideAmount;
    },
    slideSetAmount(action) {
      let amount = +this.slideAmount;

      const balanceConverted = this.getDisplayCurrencyAmount(
        this.authUser.user.balance
      );

      if (action === "clear") {
        amount = 0;
      } else if (action === "1/2") {
        amount = amount / 2;
      } else if (action === "x2") {
        amount = amount * 2;
      } else if (action === "max") {
        amount = balanceConverted;
      } else {
        amount = amount + Number(action.replace("+", ""));
      }

      amount = Math.min(balanceConverted, amount);

      this.slideAmount = amount.toFixed(2);
    },
    slideBetButton(color) {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      if (isNaN(this.slideAmount) === true || Number(this.slideAmount) <= 0) {
        this.notificationShow({
          type: "error",
          message: "Your provided bet amount is invalid.",
        });
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(this.slideAmount);

      const maxMultiplier = color === "yellow" ? 14 : 2;

      if (dlsAmount * maxMultiplier > this.gameConfig.maxWin) {
        this.notificationShow({
          type: "error",
          message: "Max win is too big!",
        });
        return;
      }

      this.slideSendBetSocket({
        amount: dlsAmount,
        color: color,
      });
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "authUser", "slideData", "gameConfig"]),
    betting() {
      return this.slideData?.game?.state === "created";
    },
  },
};
</script>

<style scoped lang="scss">
.slide-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;

  .controls-amount {
    width: 100%;
    margin-top: 16px;
    border-radius: 8px;
    background: var(--dark-blue-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    .input-wrapper {
      flex-grow: 1;
      padding-inline: 10px;

      display: flex;
      max-width: 300px;
      @media screen and (max-width: 991px) {
        max-width: 100%;
      }
      justify-content: space-between;
      height: 42px;
      align-items: center;

      border: 2px solid #22224a;
      border-radius: 5px;

      input {
        width: 100%;
        height: 58px;
        font-size: 1rem;
        font-weight: 700;
        color: #ffffff;
        border-radius: 10px;
        max-width: 200px;
      }
    }
  }

  .amount-buttons {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 10px;
    flex-wrap: wrap;
    overflow: hidden;
    max-height: 45px;

    @media screen and (max-width: 991px) {
      display: none;
    }

    button.button-amount {
      font-style: normal;
      margin: 5px 0;
      font-weight: 700;
      font-size: 1rem;

      color: rgba(255, 255, 255, 0.75);

      padding: 10px 24px;

      background: #22224a;
      border-radius: 5px;
    }
  }
}

.slide-controls .controls-bet {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  @media only screen and (max-width: 991px) {
    flex-wrap: wrap;
    gap: 0;
  }
  justify-content: space-between;
  margin-top: 20px;
}

.slide-controls .bet-section {
  width: 100%;
  max-width: 300px;
  gap: 10px;
  @media only screen and (max-width: 991px) {
    width: 100%;
    max-width: unset;
  }
  margin-top: 10px;
  padding: 3px 12px;
  background: #3a3a65;
  box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
}

.slide-controls button.button-bet {
  width: 100%;
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slide-controls button.button-bet .button-info {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.slide-controls button.button-bet .button-info img {
  width: auto;
  height: 32px;
  margin-right: 12px;
}

.slide-controls button.button-bet .button-multiplier {
  font-size: 1.29rem;
  font-weight: 700;
}

@media only screen and (max-width: 1020px) {
  .slide-controls .controls-fair,
  .slide-controls .controls-amount {
    width: 100%;
  }
}

@media only screen and (max-width: 600px) {
  .slide-controls button.button-amount:nth-child(2),
  .slide-controls button.button-amount:nth-child(3),
  .slide-controls button.button-amount:nth-child(4) {
    display: none;
  }
}

@media only screen and (max-width: 450px) {
  .slide-controls button.button-amount:nth-child(5),
  .slide-controls button.button-amount:nth-child(6) {
    display: none;
  }
}
</style>
