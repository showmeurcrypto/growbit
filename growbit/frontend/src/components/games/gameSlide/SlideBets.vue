<template>
  <div class="slide-bets">
    <div
      v-bind:class="[
        'bets-section',
        'section-red',
        'section-' +
          (slideIsCompleted === true
            ? slideGetOutcomeColor(slideData.game) === 'red'
              ? 'won'
              : 'lose'
            : ''),
      ]"
    >
      <div class="section-info">
        <div class="info-left">{{ slideGetStats.red.bets }} Bets Total</div>
        <div class="info-amount">
          <Currency></Currency>
          <span>{{
            this.getDisplayCurrencyAmountFormatted(slideGetStats.red.amount)
          }}</span>
        </div>
      </div>
      <div v-if="slideGetBets.red.length" class="line"></div>

      <transition-group name="bets" tag="div" class="section-content">
        <SlideBetElement
          v-for="bet of slideGetBets.red"
          v-bind:key="bet._id"
          v-bind:bet="bet"
        />
      </transition-group>
    </div>
    <div
      v-bind:class="[
        'bets-section',
        'section-green',
        'section-' +
          (slideIsCompleted === true
            ? slideGetOutcomeColor(slideData.game) === 'purple'
              ? 'won'
              : 'lose'
            : ''),
      ]"
    >
      <div class="section-info">
        <div class="info-left">{{ slideGetStats.purple.bets }} Bets Total</div>
        <div class="info-amount">
          <Currency></Currency>
          <span>{{
            this.getDisplayCurrencyAmountFormatted(slideGetStats.purple.amount)
          }}</span>
        </div>
      </div>
      <div v-if="slideGetBets.purple.length" class="line"></div>

      <transition-group name="bets" tag="div" class="section-content">
        <SlideBetElement
          v-for="bet of slideGetBets.purple"
          v-bind:key="bet._id"
          v-bind:bet="bet"
        />
      </transition-group>
    </div>
    <div
      v-bind:class="[
        'bets-section',
        'section-black',
        'section-' +
          (slideIsCompleted === true
            ? slideGetOutcomeColor(slideData.game) === 'yellow'
              ? 'won'
              : 'lose'
            : ''),
      ]"
    >
      <div class="section-info">
        <div class="info-left">{{ slideGetStats.yellow.bets }} Bets Total</div>
        <div class="info-amount">
          <Currency></Currency>
          <span>{{
            this.getDisplayCurrencyAmountFormatted(slideGetStats.yellow.amount)
          }}</span>
        </div>
      </div>
      <div v-if="slideGetBets.yellow.length" class="line"></div>

      <transition-group name="bets" tag="div" class="section-content">
        <SlideBetElement
          v-for="bet of slideGetBets.yellow"
          v-bind:key="bet._id"
          v-bind:bet="bet"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
// import mixins from '@/mixins';
import { mapGetters } from "vuex";
import SlideBetElement from "@/components/games/gameSlide/SlideBetElement.vue";
import { getWinningColour } from "@/utils";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  name: "SlideBets",
  components: {
    Currency,
    SlideBetElement,
  },
  mixins: [currencyExchangeRatesMixin],
  methods: {
    slideGetOutcomeColor(game) {
      return getWinningColour(game.outcome).winningColour;
    },
    slideGetOutcomeMultiplier(game) {
      return getWinningColour(game.outcome).winningMultiplier;
    },
  },
  computed: {
    ...mapGetters(["slideData"]),
    slideIsCompleted() {
      return (
        this.slideData.game !== null &&
        this.slideData.game.state === "completed"
      );
    },
    slideGetStats() {
      let stats = {
        red: { bets: 0, amount: 0 },
        yellow: { bets: 0, amount: 0 },
        purple: { bets: 0, amount: 0 },
      };

      for (const bet of [
        ...this.slideGetBets.red,
        ...this.slideGetBets.yellow,
        ...this.slideGetBets.purple,
      ]) {
        stats[bet.color].bets = stats[bet.color].bets + 1;
        stats[bet.color].amount = stats[bet.color].amount + bet.amount;
      }

      return stats;
    },
    slideGetBets() {
      let bets = { red: [], yellow: [], purple: [] };

      for (const bet of this.slideData.bets) {
        if (this.slideData.game.state === "completed") {
          bets[bet.color].push({
            ...bet,
            amount:
              this.slideGetOutcomeColor(this.slideData.game) === bet.color
                ? Math.floor(
                    this.slideGetOutcomeMultiplier(this.slideData.game) *
                      bet.amount
                  )
                : -bet.amount,
          });
        } else {
          bets[bet.color].push(bet);
        }
      }

      bets.red.sort(function (a, b) {
        return +b.amount - +a.amount;
      });
      bets.yellow.sort(function (a, b) {
        return +b.amount - +a.amount;
      });
      bets.purple.sort(function (a, b) {
        return +b.amount - +a.amount;
      });
      return bets;
    },
  },
};
</script>

<style scoped>
.slide-bets {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  @media only screen and (max-width: 991px) {
    flex-wrap: wrap;
  }
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 15px;
  gap: 15px;
}

.slide-bets .bets-section {
  width: 100%;
  max-width: 300px;
  border-radius: 7px;
  background: #22224a;
  border: 2px solid rgba(255, 255, 255, 0.07);

  @media only screen and (max-width: 991px) {
    width: 100%;
    max-width: unset;
  }

  .section-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 8px 8px 8px;
  }
}

.slide-bets .info-left {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.slide-bets .info-left img {
  width: 20px;
  height: 20px;
  display: none;
  margin-right: 8px;
}

.slide-bets .info-amount {
  display: flex;
  align-items: center;
}

.slide-bets .info-amount img {
  margin-right: 5px;
  margin-bottom: 2px;
}

.slide-bets .amount-number {
  font-size: 11px;
  font-weight: 700;
  color: #bbbbbb;
  transition: color 0.3s ease;
}

.slide-bets .amount-number >>> span {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  transition: color 0.3s ease;
}

.slide-bets .bets-section.section-lose {
  opacity: 0.33;
}

.slide-bets .bets-section.section-lose .amount-number,
.slide-bets .bets-section.section-lose .amount-number >>> span {
  color: #fd3b31;
}

.slide-bets .bets-section.section-won .amount-number,
.slide-bets .bets-section.section-won .amount-number >>> span {
  color: #00c74d;
}

.slide-bets .section-content {
  width: 100%;
  margin-top: 5px;
}

.slide-bets .bets-move,
.slide-bets .bets-enter-active {
  transition: all 0.3s ease;
}

.slide-bets .bets-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.line {
  width: 100%;
  height: 1px;
  border-top: 2px solid rgba(255, 255, 255, 0.07);

  @media only screen and (max-width: 1020px) {
    display: none;
  }
}
</style>
