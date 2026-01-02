<template>
  <div v-if="this.currency" class="crypto-deposit-container">
    <div class="deposit-currencies">
      <div class="top_row">
        <div class="back" @click="goBack">
          <img :src="BackIcon" />
          <span>Back</span>
        </div>
        <div class="curr">
          {{ cashierGetName }}
          <img :src="`/img/cashier/${currencyName.toLowerCase()}.png`" />
        </div>
      </div>

      <div class="crypto-disabled" v-if="!enabled">
        Crypto deposits are currently disabled
      </div>
      <div v-else class="content">
        <div
          v-if="cashierCryptoData.loading"
          class="input-loading"
          key="loading"
        ></div>
        <div v-else-if="address" class="qr-w">
          <QRCode
            v-bind:value="address"
            v-bind:options="{ width: 185, height: 185, margin: 0 }"
          />
        </div>
        <div class="err" v-else-if="cashierCryptoData.error">
          Unexpected error. Please try again in a few minutes. <br />If the
          issue persists, contact support for assistance.
        </div>
        <div class="status" v-if="!cashierCryptoData.error">
          Only send {{ cashierGetName }} to this address.
        </div>
        <div class="deposit-address" v-if="!cashierCryptoData.error">
          <div class="text">Your {{ cashierGetName }} deposit address</div>
          <div class="v">
            <input
              placeholder="Address"
              readonly
              :value="
                cashierCryptoData.loading ? 'Loading' : address || 'Error'
              "
            />
            <button class="btn" @click="addressCopyButton()">
              <img :src="CopyIcon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import QRCode from "@/components/QRCode.vue";
import RefreshIcon from "@/assets/images/refresh.svg";
import CopyIcon from "@/assets/images/copy.svg";
import BackIcon from "@/assets/images/back.svg";
import { getCryptoName } from "@/utils";

export default {
  name: "CashierCryptoDepositItem",
  components: {
    QRCode,
  },
  data() {
    return {
      RefreshIcon,
      CopyIcon,
      BackIcon,
    };
  },
  created() {},
  props: ["currency", "goBack"],
  methods: {
    ...mapActions(["notificationShow"]),

    addressCopyButton() {
      const el = document.createElement("textarea");
      el.value = this.address;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      this.notificationShow({
        type: "success",
        message: "Copied to your clipboard.",
      });
    },
  },
  computed: {
    ...mapGetters(["cashierCryptoData", "generalSettings"]),
    currencyName() {
      return this.currency.split(/[()]/)[0].trim();
    },
    network() {
      return this.currency.split(/[()]/)[1];
    },
    enabled() {
      let value = this.generalSettings;
      for (let key of "crypto.deposit.enabled".split(".")) {
        if (!value) {
          return true;
        }
        value = value[key];
      }
      return value;
    },
    cashierGetName() {
      return getCryptoName(this.currencyName);
    },
    address() {
      return this.cashierCryptoData.addresses.find(
        (a) =>
          a.name === this.currencyName &&
          (!this.network || this.network === a.network)
      )?.address;
    },
  },
};
</script>

<style scoped lang="scss">
.crypto-deposit-container {
  padding: 30px;

  @media screen and (max-width: 991px) {
    padding: 10px;
  }

  .err {
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
    min-height: 200px;
  }
}

.crypto-disabled {
  height: 200px;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  font-size: 1.3rem;
}

.content {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  align-items: center;
}

.deposit-currencies {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  align-items: center;
  justify-content: center;
  width: 100%;

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

  .deposit-address {
    width: 100%;

    input {
      background: rgba(255, 255, 255, 0.03);
      border: 0 !important;
      border-radius: 10px 0 0 10px;
      font-size: 0.857rem;
      margin-right: 0;
    }
  }
}

.deposit-address {
  @media screen and (max-width: 991px) {
    grid-row-start: 1;
    margin-bottom: 25px;
  }
  .text {
    font-weight: 600;
    margin-bottom: 5px;
    margin-top: 30px;

    @media screen and (max-width: 991px) {
      margin-top: 5px;

      font-weight: 700;
      font-size: 1rem;

      color: #eeeeee;
    }
  }

  .v {
    display: flex;
    position: relative;
    align-items: center;
    height: 56px;

    background: #22224a;
    border-radius: 10px;

    img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 20px;
      margin-top: -1px;
    }

    input {
      width: 100%;
      margin-right: 15px;
      height: 50px;
      background: #22224a;

      padding-left: 15px;
    }

    .btn {
      margin-right: 10px;
      width: 40px;
      justify-content: center;
      display: flex;
      border-radius: 0 !important;
      box-shadow: none;
      filter: drop-shadow(0px 0 0 #ffffff26);

      &:last-child {
        padding-right: 25px !important;
        border-radius: 0 10px 10px 0 !important;
      }

      img {
        left: 10px;
        right: 0;
      }
    }
  }
}

.qr-w {
  width: fit-content;
  padding: 10px;
  display: grid;
  place-content: center;
  border: 5px solid #090c1d;
  border-radius: 15px;
  margin-inline: auto;
  @media screen and (max-width: 991px) {
    background: #191939;
    border-radius: 15px;
    border: 5px solid #22224a;
  }
}

.status {
  width: fit-content;
  margin-inline: auto;
  margin-top: 15px;
  font-style: normal;
  font-weight: 700;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
