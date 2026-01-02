import { mapGetters } from "vuex";

export const currencyExchangeRatesMixin = {
  computed: {
    ...mapGetters(["fiatRates", "selectedCurrency", "authUser", "gameConfig"]),
  },
  methods: {
    getDlsAmountForBetting(amount) {
      const rate = this.fiatRates.data[this.selectedCurrency];
      const dlsAmount = amount / rate;
      return Math.min(dlsAmount, this.authUser?.user?.balance);
    },
    getDisplayCurrencyAmount(amount) {
      const rate = this.fiatRates.data?.[this.selectedCurrency || "DLS"] || 1;
      return amount * rate;
    },
    getDisplayCurrencyAmountFormatted(amount) {
      return this.getDisplayCurrencyAmount(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },
};
