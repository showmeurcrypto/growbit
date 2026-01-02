<template>
  <div class="unbox-item-element" v-bind:class="['element-' + item.rarity]">
    <div class="inner-percentage">
      {{ formatToTwoDecimals(item.frequency * 100) }}%
    </div>
    <div class="inner-image">
      <img :src="`/img/cases/items/${item.image}`" />
    </div>
    <div class="inner-name">{{ item.itemName }}</div>
    <div class="inner-price">
      <Currency />
      <div class="price-value">
        <span>{{ getDisplayCurrencyAmountFormatted(item.itemPrice) }} </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "UnboxItemElement",
  mixins: [currencyExchangeRatesMixin],
  props: ["item"],
  components: {
    Currency,
  },
  methods: {
    formatToTwoDecimals(num) {
      let formatted = num.toFixed(10); // Convert with 10 decimal places to avoid precision errors
      let [integerPart, decimalPart] = formatted.split(".");

      decimalPart = decimalPart.replace(/0+$/, "");

      if (decimalPart.length < 2) {
        decimalPart = decimalPart.padEnd(2, "0");
      }

      if (decimalPart === "") {
        return integerPart;
      }

      return integerPart + "." + decimalPart;
    },
  },
  computed: {
    ...mapGetters(["selectedCurrency", "fiatRates"]),
  },
};
</script>

<style scoped lang="scss">
.unbox-item-element {
  position: relative;
  padding-top: 35px;
  z-index: 1;
  width: 100%;
  height: 175px;
  background: #191939;
  border-radius: 5px;
}

.unbox-item-element.element-1 {
  border-bottom: 3px solid #b0c3d9;
}
.unbox-item-element.element-2 {
  border-bottom: 3px solid #5e98d9;
}
.unbox-item-element.element-3 {
  border-bottom: 3px solid #4b69ff;
}
.unbox-item-element.element-4 {
  border-bottom: 3px solid #8847ff;
}
.unbox-item-element.element-5 {
  border-bottom: 3px solid #d32ce6;
}
.unbox-item-element.element-6 {
  border-bottom: 3px solid #eb4b4b;
}
.unbox-item-element.element-7 {
  border-bottom: 3px solid #e4ae39;
}
.unbox-item-element.element-8 {
  border-bottom: 3px solid #ffd700;
}

.modal-box .unbox-item-element {
}

.unbox-item-element .inner-percentage {
  position: absolute;
  top: 9px;
  left: 9px;

  font-family: "Excon";
  font-style: normal;
  font-weight: 700;
  font-size: 9px;
  line-height: 13px;

  color: #d9d9d9;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 9px 7px;
  gap: 10px;
  height: 15px;

  background: #22224a;
  border-radius: 3px;
}

.unbox-item-element .inner-image {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unbox-item-element .inner-image img {
  width: 60px;
}

.unbox-item-element .inner-name {
  margin-top: 15px;
  margin-bottom: 10px;
  text-align: center;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  margin-inline: auto;
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 17px;
  color: #c8c8c8;
}

.unbox-item-element .inner-price {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.unbox-item-element .inner-price img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.unbox-item-element .price-value {
  font-size: 10px;
  font-weight: 600;
  color: #bbbfd0;
}

.unbox-item-element .price-value span {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}
</style>
