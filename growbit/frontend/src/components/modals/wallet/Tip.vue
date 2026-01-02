<template>
  <div class="tip-container">
    <label>Username</label>
    <input class="username" placeholder="Username" v-model="username" />
    <label>Amount</label>

    <div class="amount">
      <input v-model="amount" placeholder="Enter amount" type="number" />
      <Currency></Currency>
    </div>

    <app-button :fullwidth="true" :click="sendTip" :height="'50px'">
      Send Tip
    </app-button>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import Currency from "@/components/Currency.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      username: null,
      amount: null,
    };
  },
  components: { AppButton, Currency },
  watch: {},
  methods: {
    ...mapActions(["userSendUserTipSocket", "notificationShow"]),

    sendTip() {
      const amount = this.amount / this.fiatRates.data[this.selectedCurrency];

      if (amount === undefined || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered tip amount is invalid.",
        });
        return;
      }

      const data = {
        receiverUsername: this.username,
        amount: amount,
        amountInSelectedCurrency: this.amount,
        selectedCurrency: this.selectedCurrency,
      };
      this.userSendUserTipSocket(data);
    },
  },
  computed: {
    ...mapGetters(["fiatRates", "selectedCurrency"]),
  },
};
</script>

<style lang="scss" scoped>
.tip-container {
  padding: 30px;
  @media screen and (max-width: 991px) {
    padding: 15px;
  }

  width: 100%;

  label {
    font-weight: 700;
    font-size: 1.29rem;
    margin-bottom: 10px;
    color: #eeeeee;
  }

  input {
    font-size: 1.143rem;
  }
  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 15px;
    gap: 15px;
    margin-bottom: 30px;
    @media screen and (max-width: 991px) {
      margin-bottom: 15px;
    }
    border: 1px dashed #f7be2c;
    border-radius: 10px;

    span {
      font-weight: bold;
      margin-right: 5px;
      color: var(--orange);
    }
  }
  .header-promo {
    margin-bottom: 10px;
    font-family: "Excon";
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;
  }
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  button {
    margin-top: auto;
  }

  .username {
    padding-inline: 10px;
    height: 56px;
    border: 2px solid #22224a;
    border-radius: 10px;
    margin-bottom: 15px;

    &::placeholder {
      color: #616498;
    }
    @media screen and (max-width: 991px) {
      background: #161533;
      height: 50px;
    }
  }

  .amount {
    color: white;

    display: flex;
    align-items: center;
    padding-inline: 10px;
    height: 56px;
    border: 2px solid #22224a;
    border-radius: 10px;
    margin-bottom: 30px;

    @media screen and (max-width: 991px) {
      background: #161533;
      height: 50px;
    }

    input {
      border: 0;
      &::placeholder {
        color: #616498;
      }
    }
    img {
      margin-left: auto;
    }
  }
}
</style>
