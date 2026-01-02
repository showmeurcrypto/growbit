<template>
  <div class="bet-amount">
    <div class="controls-amount-title">Bet Amount</div>
    <div class="controls-amount">
      <input
        id="betAmount"
        type="number"
        placeholder="Amount"
        v-model="betAmount"
        @input="validateInput"
        @change="formatInput"
        :disabled="disabled"
        :max="maxBetConverted"
      />
      <img
        :src="`/img/currencies/${selectedCurrency}.${
          selectedCurrency === 'DLS' ? 'png' : 'svg'
        }`"
        alt="icon"
      />
      <div class="cashout-buttons">
        <button v-on:click="setAmount('1/2')" :disabled="disabled">
          <div class="button-inner">&frac12</div>
        </button>
        <button
          v-on:click="setAmount('x2')"
          class="button-max"
          :disabled="disabled"
        >
          <div class="button-inner">2x</div>
        </button>
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import InfinityIcon from "@/assets/images/infinity.svg?inline";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  props: ["change", "disabled", "updateInput", "maxBet"],
  name: "BetAmount",
  mixins: [currencyExchangeRatesMixin],
  components: {
    InfinityIcon,
  },
  data() {
    return {
      betAmount: "0.00",
    };
  },
  methods: {
    ...mapActions(["notificationShow"]),
    validateInput() {
      this.betAmount = this.betAmount.replace(",", ".").replace(/[^\d.]/g, "");
      this.betAmount =
        this.betAmount.indexOf(".") >= 0
          ? this.betAmount.substr(0, this.betAmount.indexOf(".")) +
            "." +
            this.betAmount
              .substr(this.betAmount.indexOf(".") + 1, 2)
              .replace(".", "")
          : this.betAmount;
    },
    formatInput() {
      this.betAmount = Number(this.betAmount).toFixed(2);
    },
    setAmount: function (action) {
      let amount = this.betAmount;

      const balanceConverted = this.getDisplayCurrencyAmount(
        this.authUser.user.balance
      );

      if (action === "1/2") {
        amount = parseFloat(amount / 2).toFixed(2);
      } else if (action === "x2") {
        amount = parseFloat(amount * 2).toFixed(2);
      } else if (action === "max") {
        amount = balanceConverted;
      }

      amount = Math.min(amount, balanceConverted).toFixed(2);

      this.betAmount = amount > 0 ? amount : 0.01;
    },
  },
  watch: {
    betAmount: {
      immediate: true,
      handler() {
        this.change(this.betAmount);
      },
    },
    updateInput: {
      immediate: true,
      handler(newValue, oldValue) {
        this.betAmount = newValue;
      },
    },
  },
  computed: {
    ...mapGetters(["generalSettings", "authUser", "selectedCurrency"]),
    maxBetConverted() {
      return this.getDisplayCurrencyAmount(this.maxBet);
    },
    error() {
      if (+this.betAmount > this.maxBetConverted) {
        return "Max bet exceeded!";
      }

      return 0;
    },
  },
  created() {},
};
</script>

<style scoped lang="scss">
.bet-amount {
  margin-bottom: 10px;

  .error {
    color: var(--red);
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

    &:has(input:out-of-range) {
      border: 2px solid var(--red);
    }

    img {
      margin-left: auto;
      margin-right: 8px;
      height: 20px;
      width: 20px;
    }

    input {
      max-width: 100px;

      &::placeholder {
        color: #616498;
      }
    }

    .cashout-buttons {
      display: flex;
      // height: 100%;
      //width: 100%;
      align-items: center;
      //  gap: 10px;
      // padding-inline: 13px;
      height: 100%;
      width: 70px;
      background: #22224a;

      > button {
        // padding-left: 13px;
        //  padding-right: 13px;
        height: 100%;
        width: 50%;
        //position: relative;
        // display: flex;
        flex-grow: 1;
      }

      button div {
        font-weight: 900;
        font-size: 1.143rem;
        color: #eeeeee;
        text-align: center;
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
}
</style>
