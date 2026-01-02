<template>
  <MmoChat
    v-if="activeTicket"
    :ticket="activeTicket"
    :cancel="() => cancelDeposit()"
    :send="(msg) => sendMessage(msg)"
  ></MmoChat>
  <div class="loader" v-else-if="loadingExchangeRates">
    <LoadingAnimation></LoadingAnimation>
  </div>
  <div class="loader" v-else-if="error">Error</div>
  <div v-else class="crypto-deposit-element element-open">
    <div class="element-accordion">
      <div class="accordion-inner">
        <div class="top_row">
          <div class="back" @click="goBack">
            <img :src="BackIcon" />
            Back
          </div>
          <div class="curr">
            {{ currency.text }} gold <img :src="`/img/cashier/gold.png`" />
          </div>
        </div>
        <div class="withdraw-addresss">
          <div class="title">Amount</div>
          <div class="amount-wrapper">
            <input
              v-model="currencyInputAmount"
              :placeholder="`Enter amount${getUnitText(currency.id)}`"
              v-if="isDeposit"
            />
            <input
              v-model="tokenInputAmount"
              placeholder="Enter amount"
              v-else
            />
            <div v-if="isDeposit">{{ getUnit(currency.id) }}</div>
            <img
              src="@/assets/images/mmo_coin.png"
              alt="currency"
              v-if="!isDeposit"
            />
          </div>
        </div>
        <div class="title" v-if="isDeposit">Converts to</div>
        <div class="currency-input-inner" v-if="isDeposit">
          {{ tokenConverted }}
          <img src="@/assets/images/mmo_coin.png" alt="currency" />
        </div>
        <div class="withdraw-submit">
          <AppButton :fullwidth="true" :click="() => start()">
            {{ transactionType }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BackIcon from "@/assets/images/back.svg";
import AppButton from "@/components/AppButton.vue";
import MmoChat from "@/components/modals/wallet/mmo/MmoChat.vue";
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "MmoTransactions",
  components: {
    LoadingAnimation,
    AppButton,
    MmoChat,
  },
  props: ["currency", "goBack", "transactionType"],
  data() {
    return {
      currencyInputAmount: null,
      tokenInputAmount: 0,
      loadingExchangeRates: false,
      error: null,
      dollarToCurrency: 1,
      currencyToDollar: 1,
      BackIcon,
    };
  },
  created() {
    if (!this.activeTicket) {
      this.loadingExchangeRates = true;
      axios
        .get("/mmo_cashier/exchangeRates")
        .then(({ data }) => {
          const rate = data.exchangeRates?.filter(
            (e) => e.currency === this.currency.id
          )?.[0];
          if (rate) {
            this.loadingExchangeRates = false;
            this.dollarToCurrency = rate.dollarToCurrency;
            this.currencyToDollar = rate.currencyToDollar;
          } else {
            this.loadingExchangeRates = true;
          }
        })
        .catch((err) => {
          this.error = err;
          this.notificationShow(
            err.response?.data?.error || {
              type: "error",
              message: "Fetching exchange rates has failed",
            }
          );
          this.loadingExchangeRates = false;
        });
    }
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "mmoCashierSendMessage",
      "mmoCashierCreateTicket",
      "mmoCashierCancelTicket",
    ]),
    cancelDeposit() {
      this.mmoCashierCancelTicket({ ticketId: this.activeTicket._id });
    },
    getUnitText(currency) {
      if (currency === "rs3_gold") {
        return " in millions";
      }
      if (currency === "wow_gold") {
        return " in thousands";
      }
      return "";
    },
    getUnit(currency) {
      if (currency === "rs3_gold") {
        return "M";
      }
      if (currency === "wow_gold") {
        return "K";
      }
      return "";
    },
    start() {
      this.mmoCashierCreateTicket({
        currency: this.currency.id,
        currencyAmount: this.currencyInputAmount,
        transactionType: this.transactionType,
        tokenAmount: this.tokenInputAmount,
      });
    },
    sendMessage(msg) {
      this.mmoCashierSendMessage({
        ticketId: this.activeTicket._id,
        message: msg,
      });
    },
  },
  computed: {
    ...mapGetters(["mmoCashier"]),
    activeTicket() {
      return this.mmoCashier?.tickets?.filter(
        (ticket) => ticket.currency === this.currency.id
      )?.[0];
    },
    isDeposit() {
      return this.transactionType === "deposit";
    },
    tokenConverted() {
      return (this.currencyInputAmount || 0) * this.currencyToDollar;
    },
    // goldConverted() {
    //   return (this.tokenInputAmount || 0) * this.dollarToCurrency;
    // },
  },
};
</script>

<style scoped lang="scss">
.loader {
  display: grid;
  place-content: center;
  min-height: 300px;
}

.crypto-deposit-element {
  width: 100%;
  padding: 30px;

  @media screen and (max-width: 991px) {
    padding: 10px;
  }

  .top_row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;

    .back {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      font-style: normal;
      font-weight: 700;
      font-size: 1.429rem;
      color: #eeeeee;
    }

    .curr {
      font-style: normal;
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
      display: flex;
      align-items: center;
      gap: 15px;

      img {
        height: 35px;
      }
    }
  }

  .fee {
    margin-top: 10px;
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;
    color: var(--purple-2);
  }
}

.currency-input-inner {
  display: flex;
  align-items: center;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 17px;
  height: 56px;
  background: #22224a;
  border-radius: 10px;
  margin-bottom: 30px;
}

.title {
  font-style: normal;
  font-weight: 700;
  font-size: 1.29rem;
  margin-bottom: 10px;
}

.withdraw-submit {
  width: 100%;
  margin-top: auto;
  > * {
    text-transform: capitalize;
  }
}

.amount-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 17px 15px;

  height: 56px;

  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  margin-bottom: 15px;

  input {
    font-weight: 400;
    font-size: 1.143rem;

    &::placeholder {
      color: var(--purple-2);
    }
  }
}
</style>
