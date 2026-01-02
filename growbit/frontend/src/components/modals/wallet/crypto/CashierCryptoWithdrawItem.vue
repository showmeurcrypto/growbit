<template>
  <div class="crypto-deposit-element element-open">
    <div class="element-accordion">
      <div class="accordion-inner">
        <div class="top_row">
          <div class="back" @click="goBack">
            <img :src="BackIcon" />
            <span>Back</span>
          </div>
          <div class="curr">
            {{ cashierGetName }}
            <img :src="`/img/cashier/${currency.toLowerCase()}.png`" />
          </div>
        </div>
        <div v-if="cashierCryptoData.loading">
          <LoadingAnimation></LoadingAnimation>
        </div>
        <div class="err" v-else-if="cashierCryptoData.error">
          Unexpected error. Please try again in a few minutes. <br />If the
          issue persists, contact support for assistance.
        </div>
        <div class="withdraw-addresss" v-if="!cashierCryptoData.error">
          <div>Withdraw Address</div>
          <input
            v-model="cashierAddress"
            placeholder="Enter your address here"
          />
        </div>

        <div class="currency-conversion" v-if="!cashierCryptoData.error">
          <div class="title">Currency conversion</div>
          <div class="currency-conversion-inner">
            <div class="currency-input">
              <transition name="fade" mode="out-in">
                <div
                  v-if="cashierCryptoData.loading === true"
                  class="element-loading"
                  key="loading"
                ></div>
                <div v-else class="currency-input-inner">
                  <input
                    :disabled="
                      cashierCryptoData.loading || !cashierCryptoData.prices
                    "
                    v-model="tokenAmount"
                    v-on:input="onAmountInput"
                  />
                  <!-- <img src="@/assets/images/mmo_coin.png" alt="currency" /> -->
                  <Currency></Currency>
                </div>
              </transition>
              <div @click="maxInput()" class="right max">MAX</div>
            </div>
            <img src="../../../../assets/images/equals.svg" />
            <div class="currency-input">
              <transition name="fade" mode="out-in">
                <div
                  v-if="cashierCryptoData.loading === true"
                  class="element-loading"
                  key="loading"
                ></div>
                <div v-else class="currency-input-inner">
                  <input :disabled="true" v-model="convertedToCrypto" />
                </div>
              </transition>
              <div class="right curr">{{ currency }}</div>
            </div>
          </div>
        </div>
        <p class="fee" v-if="!cashierCryptoData.error && currencyInfo">
          Minimum withdrawal is {{ currencyInfo.minWithdraw }}
          {{ this.selectedCurrency }}. Withdrawal fee is {{ currencyInfo.fee }}
          {{ this.selectedCurrency }}.
        </p>
        <div class="withdraw-submit" v-if="!cashierCryptoData.error">
          <AppButton
            :fullwidth="true"
            height="50px"
            :click="() => cashierWithdrawButton()"
            :disabled="socketSendLoading !== null || !enabled"
          >
            Withdraw
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import QRCode from "@/components/QRCode.vue";
import BackIcon from "@/assets/images/back.svg";
import AppButton from "@/components/AppButton.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { getCryptoName } from "@/utils";
import Currency from "@/components/Currency.vue";

export default {
  name: "CashierCryptoWithdrawItem",
  components: {
    LoadingAnimation,
    QRCode,
    AppButton,
    Currency,
  },
  props: ["currency", "cryptoElement", "goBack"],
  created() {},
  data() {
    return {
      tokenAmount: 0,
      convertedToCrypto: 0,
      cashierAddress: null,
      BackIcon,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "cashierSendCryptoWithdrawDepositSocket",
    ]),
    // getBalanceInDLS(balance) {
    //   return (
    //     this.fiatRates.data[this.selectedCurrency] * balance
    //   ).toLocaleString("en-US", {
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    //   });
    // },
    maxInput() {
      console.log(this.authUser.user.balance);
      this.tokenAmount =
        this.authUser.user.balance * this.fiatRates.data[this.selectedCurrency];
      this.onAmountInput();
    },
    onAmountInput() {
      const price =
        this.cashierCryptoData?.prices?.[this.currencyName.toUpperCase()]
          ?.price;
      if (price) {
        this.convertedToCrypto = (
          parseFloat(
            this.tokenAmount / this.fiatRates.data[this.selectedCurrency]
          ) / price
        ).toFixed(8);
      }
    },
    cashierWithdrawButton() {
      const amount =
        this.tokenAmount / this.fiatRates.data[this.selectedCurrency]; // tokens are represented in selected currency so we
      if (this.cashierAddress === null || this.cashierAddress.trim() === "") {
        // need to convert it to locks
        this.notificationShow({
          type: "error",
          message:
            "You need to enter a valid " + this.currency + " withdraw address.",
        });
        return;
      }

      const data = {
        currency: this.currency,
        amount: amount,
        address: this.cashierAddress,
      };
      this.cashierSendCryptoWithdrawDepositSocket(data);
      this.tokenAmount = 0;
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "cashierCryptoData",
      "fiatRates",
      "selectedCurrency",
      "authUser",
    ]),
    enabled() {
      let value = this.generalSettings;
      for (let key of "crypto.withdraw.enabled".split(".")) {
        if (!value) {
          return true;
        }
        value = value[key];
      }
      return value;
    },
    currencyName() {
      return this.currency.split("(")[0];
    },
    cashierGetName() {
      return getCryptoName(this.currencyName);
    },
    currencyInfo() {
      let data = Object.values(
        this.cashierCryptoData?.prices?.[this.currencyName]?.info?.networkList
      )?.[0];

      if (!data) return null;

      // let fee = data.withdrawFee + data.staticFixedFee;
      let fee = data.withdrawFee;
      let minWithdraw = data.withdrawMin;

      const price =
        this.cashierCryptoData?.prices?.[this.currencyName.toUpperCase()]
          ?.price;

      if (price) {
        fee = fee * price * this.fiatRates.data[this.selectedCurrency];
        minWithdraw =
          minWithdraw * price * this.fiatRates.data[this.selectedCurrency];
      }

      return {
        fee: fee?.toFixed(2),
        minWithdraw: minWithdraw?.toFixed(2),
      };
    },
  },
};
</script>

<style scoped lang="scss">
.crypto-deposit-element {
  width: 100%;
  padding: 30px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }

  .err {
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
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

      span {
        font-style: normal;
        font-weight: 700;
        font-size: 1.429rem;
        color: #eeeeee;
      }

      @media screen and (max-width: 991px) {
        width: 45px;
        height: 45px;
        background: #22224a;
        border: 2px solid rgba(255, 255, 255, 0.07);
        border-radius: 8px;
        justify-content: center;

        span {
          display: none;
        }
      }
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
    text-align: left;
    color: var(--purple-2);
    align-self: flex-start;
  }
}

.crypto-deposit-element button.element-toggle {
  width: 100%;
  height: 66px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #22224a;
}

.crypto-deposit-element button.element-toggle svg {
  height: 9px;
  fill: #626c7e;
  transition: all 0.3s ease;
}

.crypto-deposit-element.element-open button.element-toggle svg {
  fill: #fff;
  transform: rotate(180deg);
}

.crypto-deposit-element button.element-toggle .button-info {
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 1.143rem;
  font-weight: 700;
  color: #626c7e;
  transition: all 0.3s ease;
}

.crypto-deposit-element.element-open button.element-toggle .button-info {
  color: #fff;
}

.crypto-deposit-element button.element-toggle .button-info img {
  width: 34px;
  height: 34px;
  margin-right: 12px;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.crypto-deposit-element.element-open button.element-toggle .button-info img {
  opacity: 1;
}

.crypto-deposit-element .element-accordion {
  width: 100%;
  height: 0px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.element-open .element-accordion {
  height: 430px !important;
}

.crypto-deposit-element .element-accordion.slide-enter-active,
.crypto-deposit-element .element-accordion.slide-leave-active {
  overflow: hidden;
  transition: height 0.2s ease;
}

.crypto-deposit-element .element-accordion.slide-enter-to,
.crypto-deposit-element .element-accordion.slide-leave {
  height: 168px;
}

.crypto-deposit-element .element-accordion.slide-enter,
.crypto-deposit-element .element-accordion.slide-leave-to {
  height: 0;
}

.crypto-deposit-element .accordion-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  height: 100%;
}

.crypto-deposit-element .accordion-inner .accordin-header {
  width: 100%;
  display: flex;
  align-items: center;
}

.crypto-deposit-element .inner-barcode {
  width: 132px;
  height: 132px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #fff;
}

.crypto-deposit-element .inner-barcode img {
  width: 87%;
  height: 87%;
}

.crypto-deposit-element .inner-info {
  flex: 1 1;
  margin-left: 20px;
  padding: 20px;
  border-radius: 5px;
  background: #13161c;
}

.crypto-deposit-element .info-title {
  font-size: 1rem;
  font-weight: 700;
}

.crypto-deposit-element .info-address {
  margin-top: 6px;
  display: flex;
  align-items: center;
}

.crypto-deposit-element button.button-copy {
  height: 32px;
  margin-left: 12px;
  padding: 0 10px;
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
  background: #fd3b31;
  border-bottom: 2px solid #97302b;
}

.crypto-deposit-element button.button-copy:hover {
  background: #fe524a;
}

.crypto-deposit-element .address-value {
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  text-decoration: underline;
  font-size: 1.29rem;
  font-weight: 600;
  color: #fd3b31;
}

.crypto-deposit-element .info-text {
  margin-top: 16px;
  color: #66686b;
  font-family: Poppins;
  font-size: 0.857rem;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.deposit-crypto {
  width: 100%;
  margin-top: 35px;
}

.deposit-crypto .crypto-title {
  display: flex;
  align-items: center;
}

.deposit-crypto .title-value {
  font-size: 1.429rem;
  font-weight: 800;
  color: #eeeeee;
}

.deposit-crypto .title-value span {
  font-size: 26px;
}

.deposit-crypto .title-bonus {
  height: 26px;
  display: flex;
  align-items: center;
  margin-left: 12px;
  padding: 0 8px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
  background: #fd3b31;
}

.crypto-deposit-element .currency-info {
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 15px;
  font-weight: 700;
  color: #626c7e;
  transition: all 0.3s ease;
}

.crypto-deposit-element .currency-info img {
  width: 30px;
  height: 30px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.withdraw-addresss {
  width: 100%;

  > div {
    width: 100%;
    @media screen and (min-width: 991px) {
      margin-top: 20px;
    }
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    border: 2px solid #22224a;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 56px;
    font-size: 1.143rem;
    @media screen and (max-width: 991px) {
      height: 50px;
      background: #161533;
    }
    padding-left: 10px;
  }
}

.withdraw-addresss input::placeholder {
  font-style: normal;
  font-weight: 400;
  font-size: 1.143rem;
  color: var(--purple-2);
}

.currency-conversion {
  .title {
    width: 100%;
    margin-top: 20px;
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;
    margin-bottom: 5px;
  }

  margin-top: 10px;
  width: 100%;
  color: #fff;
}

.currency-conversion {
  .currency-conversion-inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 5px;

    .currency-input {
      padding-left: 10px;

      height: 56px;
      @media screen and (max-width: 991px) {
        height: 50px;
      }
      display: flex;
      align-items: center;
      border: 2px solid #22224a;
      border-radius: 10px;

      .currency-input-inner {
        display: flex;
        align-items: center;
        padding-right: 10px;

        input {
          width: 90%;
          // max-width: 267px;
          font-style: normal;
          font-weight: 400;
          font-size: 1.143rem;
          color: var(--purple-2);
        }
      }

      overflow: hidden;

      .curr {
        text-transform: uppercase;
      }

      .right {
        background: #22224a;
        height: 100%;
        width: fit-content;
        display: grid;
        place-content: center;
        padding-inline: 15px;
      }

      .max {
        cursor: pointer;
      }
    }
  }
}

.withdraw-submit {
  width: 100%;
  margin-top: auto;
}
</style>
