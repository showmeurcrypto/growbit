<template>
  <div class="unbox-reel" :class="{ multi: multi }">
    <div
      v-for="(item, index) in reel"
      v-bind:key="index"
      class="reel-element"
      v-bind:class="[
        'element-' + item.rarity,
        { 'element-active': index === pos },
        { 'bg-active': index === 60 && running === false },
      ]"
    >
      <div class="element-image">
        <img :src="`/img/cases/items/${item.image}`" />
        <div v-if="index === 60 && running === false" class="element-info">
          <div class="info-amount">
            <Currency />
            <div class="amount-value">
              <span
                >{{ getDisplayCurrencyAmountFormatted(item.itemPrice) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="index === 60 && running === false" class="element-info-name">
          {{ item.itemName }}
        </div>
      </div>

      <div
        v-bind:class="[{ 'test-active': index === 60 && running === false }]"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "UnboxReel",
  mixins: [currencyExchangeRatesMixin],
  components: { Currency },

  props: ["reel", "pos", "running", "multi"],
  methods: {},
  computed: {
    ...mapGetters(["selectedCurrency", "fiatRates"]),
  },
};
</script>

<style scoped lang="scss">
.unbox-reel {
  height: 100%;
  display: flex;
  align-items: center;

  @media only screen and (min-width: 991px) {
    &.multi {
      padding-top: 80px;
    }
  }
}

.unbox-spinner.spinner-2 .unbox-reel,
.unbox-spinner.spinner-3 .unbox-reel,
.unbox-spinner.spinner-4 .unbox-reel {
  width: 100%;
  flex-direction: column;
}

.unbox-reel .reel-element {
  width: 105px;
  height: 105px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 25px;
  opacity: 0.25;
  position: relative;
}

.unbox-spinner.spinner-2 .unbox-reel .reel-element,
.unbox-spinner.spinner-3 .unbox-reel .reel-element,
.unbox-spinner.spinner-4 .unbox-reel .reel-element {
  width: 100%;
  /* flex-direction: row; */
  margin-right: 0;
  margin-bottom: 10px;
  margin-top: 10px;
}

.unbox-reel .reel-element:last-child {
  margin-right: 0;
  margin-bottom: 0;
}

.unbox-reel .reel-element.element-active {
  opacity: 1;
}

.unbox-reel .element-image {
  width: 105px;
  height: 105px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.unbox-reel .element-image svg {
  flex-shrink: 0;
}

.unbox-reel .element-image img {
  width: 65px;
  height: auto;
  transition: transform 0.3s ease;
}

.unbox-reel {
  .element-info {
    position: absolute;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 40px;

    bottom: -35px;
  }

  .element-info-name {
    position: absolute;
    overflow: hidden;
    width: 100%;
    display: block;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 90px;
    @media only screen and (max-width: 991px) {
      width: 70px;
    }
    height: 20px;
    bottom: 90px;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
}

.unbox-spinner.spinner-2 .unbox-reel .element-info,
.unbox-spinner.spinner-3 .unbox-reel .element-info,
.unbox-spinner.spinner-4 .unbox-reel .element-info {
  width: auto;
  /* max-width: calc(100% - 115px); */
  align-items: center;
  /* margin-left: 10px; */
}

.unbox-reel .element-info span {
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: wrap;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #dee5ec;
}

.unbox-reel .info-amount {
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.unbox-reel .info-amount img {
  width: 12px;
  height: 12px;
  margin-right: 8px;
}

.unbox-reel .amount-value {
  font-size: 11px;
  font-weight: 600;
  color: #bbbfd0;
}

.unbox-reel .amount-value span {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

.unbox-spinner.spinner-1 .unbox-reel .bg-active {
  width: 200px !important;
  height: 100% !important;
  /* z-index: 9999 !important; */
  border-radius: 7px;
  transition: all 0.3s;
  position: relative;
}

.unbox-spinner.spinner-4 .test-active {
  position: absolute;
  top: 0px;
  bottom: 10px;
  border-radius: 7px;
  margin-top: auto;
  margin-bottom: auto;
  left: 0px;
  right: 0px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  height: 160%;

  transition: all 0.3s;
  z-index: -1;
}
.unbox-spinner.spinner-2 .test-active {
  position: absolute;
  top: 0px;
  bottom: 10px;
  border-radius: 7px;
  margin-top: auto;
  margin-bottom: auto;
  left: 0px;
  right: 0px;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  height: 160%;
  transition: all 0.3s;
  z-index: -1;
}
.unbox-spinner.spinner-3 .test-active {
  position: absolute;
  top: 0px;
  bottom: 10px;
  border-radius: 7px;
  margin-top: auto;
  margin-bottom: auto;
  left: 0px;
  right: 0px;
  margin-left: auto;
  margin-right: auto;
  width: 60%;
  height: 160%;
  transition: all 0.3s;
  z-index: -1;
}
@media only screen and (max-width: 500px) {
  .unbox-spinner.spinner-2 .test-active,
  .unbox-spinner.spinner-3 .test-active,
  .unbox-spinner.spinner-4 .test-active {
    width: 95%;
    height: 130%;
  }
}
</style>
