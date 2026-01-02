<template>
  <router-link
    class="unbox-box-element"
    :class="'volatility-' + box.volatility"
    v-bind:to="'/cases/' + box._id"
  >
    <div class="element-image">
      <img :src="`/img/cases/cases/${box.image}`" />
    </div>
    <div class="case-name">
      {{ box.caseName }}
    </div>
    <div class="element-price">
      <div class="price-value">
        {{ getBalanceInSelectedCurrency(box.casePrice) }}
      </div>
      <Currency />
    </div>
    <div class="volatility-wrapper">
      <div class="volatility-bar">
        <div class="bar bar-low" :class="{ active: box.volatility === 'low' }">
          <div
            v-if="box.volatility === 'low'"
            class="volatility-exact"
            :style="{ left: (box.volatilityNumber / 1) * 100 + '%' }"
          ></div>
        </div>
        <div class="text">L</div>
      </div>
      <div class="volatility-bar">
        <div
          class="bar bar-middle"
          :class="{ active: box.volatility === 'mid' }"
        >
          <div
            v-if="box.volatility === 'mid'"
            class="volatility-exact"
            :style="{ left: (box.volatilityNumber / 5) * 100 + '%' }"
          ></div>
        </div>
        <div class="text">M</div>
      </div>
      <div class="volatility-bar">
        <div
          class="bar bar-high"
          :class="{ active: box.volatility === 'high' }"
        >
          <div
            v-if="box.volatility === 'high'"
            class="volatility-exact"
            :style="{
              left: Math.min(1, box.volatilityNumber / 50) * 100 + '%',
            }"
          ></div>
        </div>
        <div class="text">H</div>
      </div>
    </div>
  </router-link>
</template>

<script>
import { mapGetters } from "vuex";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";

export default {
  name: "UnboxBoxElement",
  components: { Currency },
  mixins: [currencyExchangeRatesMixin],

  props: ["box"],
  data() {
    return {};
  },
  methods: {
    unboxFormatValue(value) {
      return parseFloat(Math.floor(value / 10) / 100)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    getBalanceInSelectedCurrency(balance) {
      return this.getDisplayCurrencyAmountFormatted(balance);
    },
  },

  computed: {
    ...mapGetters(["selectedCurrency", "fiatRates"]),
  },
};
</script>

<style scoped lang="scss">
.unbox-box-element {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  margin-right: 9px;
  padding: 20px 10px;

  width: 100%;
  height: 220px;

  border-radius: 5px;

  z-index: 1;

  .volatility-wrapper {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    width: 100%;

    .volatility-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 33%;

      .text {
        margin-top: 5px;
        font-size: 10px;
        font-weight: 100;
      }

      .bar {
        width: 100%;
        border-radius: 5px;
        height: 3px;
        background: #161533;
        .volatility-exact {
          position: relative;
          bottom: 2.8px;
          height: 8px;
          width: 2px;
          background: white;
          z-index: 5;
        }
      }

      .bar-high.active {
        background: #ff003d;
      }

      .bar-middle.active {
        background: #ffd900;
      }

      .bar-low.active {
        background: #00ff00;
      }
    }
  }
}

.unbox-box-element.volatility-low {
  border-bottom: 3px solid #00ff00;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 75%, #02e304 170%),
    #191939;
}

.unbox-box-element.volatility-mid {
  border-bottom: 3px solid #ffd900;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 75%, #ffd900 170%),
    #191939;
}

.unbox-box-element.volatility-high {
  border-bottom: 3px solid #ff003d;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 75%, #ff003d 170%),
    #191939;
}

.unbox-box-element:hover {
  transition-duration: 0.2s;
  transform: translateY(-4px);
}
.unbox-box-element:active {
  transition-duration: 0.2s;
  transform: translateY(2px);
}

.unbox-box-element:nth-child(7n) {
  margin-right: 0;
}

.unbox-box-element .case-name {
  font-family: "Excon";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;

  color: #ffffff;
}

.unbox-box-element .element-image {
  height: 104px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unbox-box-element .element-image img {
  width: 130px;
}

.unbox-box-element .element-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unbox-box-element .price-value {
  font-family: "Excon";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 17px;

  color: #c8c8c8;
}
</style>
