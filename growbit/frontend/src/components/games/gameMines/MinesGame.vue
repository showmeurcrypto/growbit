<template>
  <div class="mines-game">
    <transition v-if="!minesAutobet" name="slide-fade">
      <div
        v-if="
          minesGame !== null &&
          minesGame.state === 'completed' &&
          minesGame.payout > 0
        "
        class="game-result"
      >
        <div class="result-inner">
          <div class="inner-multiplier">
            x{{ parseFloat(minesGetWinMultiplier).toFixed(2) }}
          </div>
          <div class="inner-won">
            You Won <Currency></Currency>
            <div class="won-value">
              {{ getBalanceInSelectedCurrency(minesGetPayoutAmount) }}
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="game-inner">
      <div :class="'inner-tiles-' + Math.ceil(Math.sqrt(this.minesGridSize))">
        <MinesTile
          :key="`tile ${tile}`"
          v-for="tile in this.minesGridSize"
          v-bind:key="tile"
          v-bind:tile="tile - 1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import MinesTile from "@/components/games/gameMines/MinesTile.vue";
import Currency from "@/components/Currency.vue";

export default {
  name: "MinesGame",
  components: {
    Currency,
    MinesTile,
  },
  methods: {
    getBalanceInSelectedCurrency(balance) {
      return (
        this.fiatRates.data[this.selectedCurrency] * balance
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },
  computed: {
    ...mapGetters([
      "minesGame",
      "minesGridSize",
      "fiatRates",
      "selectedCurrency",
      "minesAutobet",
    ]),
    minesGetWinMultiplier() {
      return this.minesGame.multiplier;
    },
    minesGetPayoutAmount() {
      return this.minesGame.payout.toFixed(2);
    },
  },
};
</script>

<style scoped>
.mines-game {
  width: 100%;
  padding-top: 5px;
  position: relative;
  @media screen and (min-width: 991px) {
    padding-left: 16px;
  }
  margin-inline: auto;

  @media screen and (max-width: 991px) {
    padding-bottom: 20px;
  }
}

.mines-game .game-result {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.mines-game .game-result .slide-fade-enter-active {
  transition: all 0.3s;
}

.mines-game .game-result .slide-fade-enter {
  transform: translateY(20px);
  opacity: 0;
}

.mines-game .result-inner {
  width: 230px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #0f2624;
  border: 2px solid #00c74d;
}

.mines-game .inner-multiplier {
  font-size: 28px;
  font-weight: 700;
  color: #00c74d;
}

.mines-game .inner-won {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
}

.mines-game .inner-won img {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.mines-game .won-value {
  margin-left: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #00c74d;
}

.mines-game .game-inner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mines-game .inner-tiles-5 {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(5, auto);
  /*  grid-auto-rows: minmax(80px, auto);*/
  height: fit-content;

  @media only screen and (max-width: 991px) {
    gap: 0;
    grid-auto-rows: min(calc((100vw - 40px) / 5), 95px);
  }
}

.mines-game .inner-tiles-6 {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, auto);
  /*  grid-auto-rows: minmax(80px, auto);*/
  height: fit-content;

  @media only screen and (max-width: 991px) {
    gap: 0;
    grid-auto-rows: min(calc((100vw - 40px) / 6), 85px);
  }
}

.mines-game .inner-tiles-7 {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(7, auto);
  /*  grid-auto-rows: minmax(70px, auto);*/
  height: fit-content;

  @media only screen and (max-width: 991px) {
    gap: 0;
    grid-auto-rows: min(calc((100vw - 40px) / 7), 95px);
  }
}

.mines-game .inner-tiles-8 {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(8, auto);
  /*  grid-auto-rows: minmax(80px, auto);*/
  height: fit-content;

  @media only screen and (max-width: 991px) {
    gap: 0;
    grid-auto-rows: min(calc((100vw - 40px) / 8), 95px);
  }
}

@media only screen and (max-width: 991px) {
  .mines-game .result-inner {
    width: 200px;
    height: 120px;
  }

  .mines-game .inner-multiplier {
    font-size: 34px;
    font-weight: 700;
    color: #00c74d;
  }
}

.mines-game .game-result {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.mines-game .game-result .slide-fade-enter-active {
  transition: all 0.3s;
}

.mines-game .game-result .slide-fade-enter {
  transform: translateY(20px);
  opacity: 0;
}

.mines-game .result-inner {
  width: 230px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #0f2624;
  border: 2px solid #00c74d;
}

.mines-game .inner-multiplier {
  font-size: 38px;
  font-weight: 700;
  color: #00c74d;
}

.mines-game .inner-won {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #fff;
}

.mines-game .won-value {
  margin-left: 8px;
  font-size: 0.857rem;
  font-weight: 700;
  color: #00c74d;
}

.mines-game .won-value span {
  font-size: 15px;
  font-weight: 700;
  color: #00c74d;
}
</style>
