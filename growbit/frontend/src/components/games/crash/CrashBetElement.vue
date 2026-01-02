<template>
  <div class="crash-bet-element">
    <div class="element-user">
      <span v-html="bet.user.username"></span>
    </div>
    <div class="element-info">
      <div v-if="bet.multiplier !== undefined" class="info-multiplier">
        <span class="gradient-green"
          >{{ parseFloat(bet.multiplier).toFixed(2) }}x</span
        >
      </div>
      <div class="info-amount">
        <Currency />
        <div class="amount-value">
          {{ crashGetAmount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";

export default {
  name: "CrashBetElement",
  components: { Currency },
  props: ["bet"],
  mixins: [currencyExchangeRatesMixin],
  computed: {
    crashGetAmount() {
      let amount = this.getDisplayCurrencyAmount(this.bet.amount);

      if (this.bet.multiplier !== undefined) {
        return (
          "+" +
          parseFloat(+amount * this.bet.multiplier)
            .toFixed(2)
            .toString()
        );
      }

      return amount.toFixed(2);
    },
  },
};
</script>

<style scoped>
.crash-bet-element {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 9px;
  align-items: center;
}

.crash-bet-element:first-of-type {
  margin-top: 0;
}

.crash-bet-element .element-user {
  display: flex;
  align-items: center;
  color: #fff;
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.26px;
}

.crash-bet-element .user-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-right: 8px;
  border-radius: 50%;
  border: 1px solid #9e9e9e;
  overflow: hidden;
}

.crash-bet-element .user-avatar .avatar-image {
  width: 100%;
  height: 100%;
}

.crash-bet-element .element-info {
  display: flex;
  align-items: center;
}

.crash-bet-element .info-multiplier {
  margin-right: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #2bf278;
}

.crash-bet-element .info-amount {
  display: flex;
  align-items: center;
}

.crash-bet-element .info-amount img {
  width: 15px;
  height: 15px;
  margin-right: 4px;
  margin-bottom: 2px;
}

.crash-bet-element .amount-value {
  font-size: 8px;
  font-weight: 600;
  color: #bbbfd0;
}

.crash-bet-element .amount-value span {
  font-size: 0.857rem;
  font-weight: 800;
  color: #ffffff;
}
</style>
