<template>
  <div class="coinflip-controls">
    <div class="controls-amount">
      <div class="side">
        <button
          :class="pick === 'heads' ? 'heads_selected' : ''"
          @click="pick = 'heads'"
        >
          <img class="heads" src="@/assets/images/coinflip/head.png" alt="" />
        </button>
        <button
          :class="pick === 'tails' ? 'tails_selected' : ''"
          @click="pick = 'tails'"
        >
          <img class="tails" src="@/assets/images/coinflip/tail.png" alt="" />
        </button>
      </div>

      <div class="input-wrapper">
        <input
          v-model="coinflipAmount"
          v-on:input="coinflipValidateInput"
          type="text"
          placeholder="Bet Amount"
        />
        <Currency />
      </div>

      <div class="amount-buttons">
        <button v-on:click="coinflipSetAmount('clear')" class="button-amount">
          Clear
        </button>
        <button v-on:click="coinflipSetAmount('2x')" class="button-amount">
          x2
        </button>
        <button v-on:click="coinflipSetAmount('max')" class="button-amount">
          MAX
        </button>
      </div>
      <div class="create">
        <AppButton :click="() => coinflipCreateButton()">Create Game</AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "CoinflipControls",
  mixins: [currencyExchangeRatesMixin],
  components: {
    AppButton,
    Currency,
  },
  data() {
    return {
      coinflipAmount: null,
      pick: "heads",
    };
  },
  methods: {
    ...mapActions(["notificationShow", "coinflipSendCreateSocket"]),
    coinflipValidateInput() {
      this.coinflipAmount = this.coinflipAmount
        .replace(",", ".")
        .replace(/[^\d.]/g, "");
      this.coinflipAmount =
        this.coinflipAmount.indexOf(".") >= 0
          ? this.coinflipAmount.substr(0, this.coinflipAmount.indexOf(".")) +
            "." +
            this.coinflipAmount
              .substr(this.coinflipAmount.indexOf(".") + 1, 2)
              .replace(".", "")
          : this.coinflipAmount;
    },
    coinflipSetAmount(action) {
      let amount = +this.coinflipAmount;

      const balanceConverted = this.getDisplayCurrencyAmount(
        this.authUser.user.balance
      );

      if (action === "clear") {
        amount = 0;
      } else if (action === "1/2") {
        amount = amount / 2;
      } else if (action === "2x") {
        amount = amount * 2;
      } else if (action === "max") {
        amount = balanceConverted;
      } else {
        amount = amount + Number(action.replace("+", ""));
      }

      amount = Math.min(balanceConverted, amount);

      this.coinflipAmount = amount.toFixed(2);
    },
    coinflipCreateButton() {
      if (this.socketSendLoading !== null) {
        return;
      }

      if (!this.authUser.user) {
        this.notificationShow({
          type: "error",
          message: "Please log in.",
        });
        return;
      }

      const dlsAmount = this.getDlsAmountForBetting(this.coinflipAmount);

      if (!dlsAmount) {
        this.notificationShow({
          type: "error",
          message: "Your entered bet amount is invalid.",
        });
        return;
      }

      this.coinflipSendCreateSocket({ amount: dlsAmount, pick: this.pick });
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "authUser"]),
  },
};
</script>

<style scoped lang="scss">
.coinflip-controls {
  max-width: 1100px;

  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 16px;

  .create {
    margin-left: auto;
    @media screen and (max-width: 991px) {
      margin-top: 10px;
      margin-left: 0;
      width: 100%;
      > button {
        width: 100%;
      }
    }
  }

  .side {
    height: 46px;
    display: flex;
    flex-direction: row;
    width: fit-content;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-right: 20px;
    @media screen and (max-width: 991px) {
      margin-right: 0;
    }

    button {
      cursor: pointer;
      border-radius: 50%;
      background: var(--purple-dark-lighter);
      display: grid;
      place-content: center;
      font-weight: bold;
      color: white;
      border: 0;
      height: 50px;
      width: 50px;
      opacity: 0.4;

      img {
        height: 45px;
      }

      &.heads_selected {
        opacity: 1;
      }

      &.tails_selected {
        opacity: 1;
      }
    }
  }

  .controls-amount {
    max-width: 1100px;

    @media screen and (max-width: 991px) {
      flex-direction: column;
      align-items: flex-start;
    }

    padding: 10px 15px;
    width: 100%;
    border-radius: 8px;
    background: var(--dark-blue-2);
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-start;
    padding: 10px;

    .input-wrapper {
      flex-grow: 1;
      padding-inline: 10px;

      display: flex;
      max-width: 300px;
      @media screen and (max-width: 991px) {
        max-width: 100%;
        width: 100%;
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
        font-weight: 600;
        color: #ffffff;
        border-radius: 10px;
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
      font-weight: 700;
      font-size: 1rem;

      color: rgba(255, 255, 255, 0.75);

      padding: 10px 24px;

      background: #22224a;
      border-radius: 5px;
    }
  }
}
</style>
