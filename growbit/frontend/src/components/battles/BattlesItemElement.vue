<template>
  <!--   <div class="battles-item-element" >
    <div class="element-inner">
      <div class="inner-name">{{ item.itemName }}</div>
      <div class="inner-image">
        <img :src="`/img/cases/items/${item.image}`" />
      </div>
      <div class="inner-price">
        <div class="price-value">
          {{ getDisplayCurrencyAmountFormatted(item.itemPrice)}}
        </div>
      </div>
    </div>
  </div> -->
  <div class="battles-item-element" v-bind:class="['element-' + item.rarity]">
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
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import Currency from "@/components/Currency.vue";
export default {
  name: "BattlesItemElement",
  props: ["item"],
  mixins: [currencyExchangeRatesMixin],
  components: { Currency },
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
};
</script>

<style scoped>
.battles-item-element {
  position: relative;
  padding-top: 35px;
  z-index: 1;
  width: 100%;
  height: 175px;
  background: #191939;
  border-radius: 5px;
}

.battles-game.game-3 .battles-item-element {
  width: calc(33.33% - 2.66px);
}

.battles-game.game-4 .battles-item-element {
  width: calc(50% - 2px);
}

.battles-game.game-2 .battles-item-element:nth-child(4n) {
  margin-right: 0;
}

.battles-game.game-3 .battles-item-element:nth-child(3n) {
  margin-right: 0;
}

.battles-game.game-4 .battles-item-element:nth-child(2n) {
  margin-right: 0;
}

.battles-item-element.element-1 {
  border-bottom: 3px solid #b0c3d9;
}
.battles-item-element.element-2 {
  border-bottom: 3px solid #5e98d9;
}
.battles-item-element.element-3 {
  border-bottom: 3px solid #4b69ff;
}
.battles-item-element.element-4 {
  border-bottom: 3px solid #8847ff;
}
.battles-item-element.element-5 {
  border-bottom: 3px solid #d32ce6;
}
.battles-item-element.element-6 {
  border-bottom: 3px solid #eb4b4b;
}
.battles-item-element.element-7 {
  border-bottom: 3px solid #e4ae39;
}
.battles-item-element.element-8 {
  border-bottom: 3px solid #ffd700;
}

.battles-item-element .inner-percentage {
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

.battles-item-element .inner-image {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.battles-item-element .inner-image img {
  width: 60px;
}

.battles-item-element .inner-name {
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

.battles-item-element .inner-price {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.battles-item-element .inner-price img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.battles-item-element .price-value {
  font-size: 10px;
  font-weight: 600;
  color: #bbbfd0;
}

.battles-item-element .price-value span {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

/*.battles-item-element:before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #0a273f;
  z-index: -1;
}

.battles-item-element.element-blue:before {
  background: linear-gradient(
    223deg,
    rgba(66, 107, 252, 0.35) 0%,
    rgb(66, 107, 252, 0.6) 100%
  );
}

.battles-item-element.element-purple:before {
  background: linear-gradient(
    223deg,
    rgba(253, 134, 255, 0.35) 0%,
    rgb(253, 134, 255, 0.6) 100%
  );
}

.battles-item-element.element-green:before {
  background: linear-gradient(
    223deg,
    rgba(46, 202, 146, 0.35) 0%,
    rgb(46, 202, 146, 0.6) 100%
  );
}

.battles-item-element.element-red:before {
  background: linear-gradient(
    223deg,
    rgb(218, 50, 50, 0.35) 0%,
    rgb(218, 50, 50, 0.6) 100%
  );
}

.battles-item-element.element-yellow:before {
  background: linear-gradient(
    223deg,
    rgba(220, 177, 25, 0.35) 0%,
    rgba(220, 177, 25, 0.6) 100%
  );
}

.battles-item-element .element-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  background: linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element.element-blue .element-inner {
  background: radial-gradient(
      80% 80% at 50% 50%,
      rgb(66, 107, 252, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element.element-purple .element-inner {
  background: radial-gradient(
      80% 80% at 50% 50%,
      rgb(253, 134, 255, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element.element-green .element-inner {
  background: radial-gradient(
      80% 80% at 50% 50%,
      rgb(46, 202, 146, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element.element-red .element-inner {
  background: radial-gradient(
      80% 80% at 50% 50%,
      rgb(218, 50, 50, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element.element-yellow .element-inner {
  background: radial-gradient(
      80% 80% at 50% 50%,
      rgba(220, 177, 25, 0.2) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(
      223deg,
      rgba(5, 29, 48, 0.35) 0%,
      rgba(31, 99, 153, 0.09) 50%,
      rgba(5, 29, 48, 0.35) 100%
    ),
    repeating-linear-gradient(
      -55deg,
      transparent,
      transparent 5px,
      rgba(2, 21, 36, 0.25) 5px,
      rgba(2, 21, 36, 0.25) 10px
    ),
    #042037;
}

.battles-item-element .inner-name {
  height: 38px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #5e768e;
}

.battles-item-element .inner-image {
  width: 100%;            
  height: 74px;          
  display: flex;
  justify-content: center; 
  align-items: center;     
  margin: 15px 0 0;        
  overflow: hidden;        
}

.battles-item-element .inner-image img {
  max-width: 90%;         
  max-height: 100%;       
  object-fit: contain;    
  display: block;         
}

.battles-item-element .inner-price {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.battles-item-element .inner-price img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.battles-item-element .price-value {
  font-size: 10px;
  font-weight: 600;
  color: #bbbfd0;
}

.battles-item-element .price-value span {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

@media only screen and (max-width: 1100px) {
  .battles-item-element {
    width: calc(33.33% - 2.66px);
  }

  .battles-item-element:nth-child(4n) {
    margin-right: 4px;
  }

  .battles-item-element:nth-child(3n) {
    margin-right: 0;
  }
}*/
</style>
