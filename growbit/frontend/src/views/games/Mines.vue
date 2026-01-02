<template>
  <div class="mines">
    <div class="mines-container">
      <MinesControls />
      <MinesGame />
      <div
        v-if="minesAutobet || multipliers?.length"
        class="multipliers-wrapper"
      >
        <div class="arrow_up" @click="doShift(-1)">
          <img src="@/assets/images/Chevron_Down.png" />
        </div>

        <div class="multipliers">
          <div
            v-for="m of multipliers"
            class="m"
            :class="{ active: m[1] === turn - 1 }"
          >
            <span> {{ m[0].toFixed(2) }}x </span>
            <span>
              {{ m[1] + 1 }}
            </span>
          </div>
        </div>
        <div class="arrow_down" @click="doShift(1)">
          <img src="@/assets/images/Chevron_Down.png" />
        </div>
      </div>
    </div>

    <GameFooter :name="'mines'" :max-bet="maxBet"></GameFooter>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MinesControls from "@/components/games/gameMines/MinesControls.vue";
import MinesGame from "@/components/games/gameMines/MinesGame.vue";
import GameFooter from "@/components/GameFooter.vue";
import { minesGetGamePayout } from "@/utils";

export default {
  name: "Mines",
  metaInfo: {
    title: "Mines ",
  },
  components: {
    GameFooter,
    MinesControls,
    MinesGame,
  },
  methods: {
    ...mapActions(["socketConnectMines", "socketDisconnectMines"]),
    doShift(ds) {
      if (ds > 0) {
        const mineCount = this.minesCount;
        if (
          this.multipliers[this.multipliers.length - 1][1] >=
          this.minesGridSize - 1 - mineCount
        ) {
          return;
        }
      } else {
        if (this.multipliers[0][1] === 0) {
          return;
        }
      }
      this.shift += ds;
    },
  },
  data() {
    return {
      shift: 0,
    };
  },
  computed: {
    ...mapGetters([
      "minesGame",
      "gameConfig",
      "minesAutobet",
      "gameConfig",
      "minesSelected",
      "minesCount",
      "minesGridSize",
    ]),
    maxBet() {
      return this.gameConfig.minesMaxBet;
    },
    turn() {
      return this.minesAutobet
        ? this.minesSelected.length
        : this.minesGame?.revealed?.length || 0;
    },
    multipliers() {
      const mineCount = this.minesCount;

      let results = [[1, -1]];
      for (
        let revealedCount = 1;
        revealedCount <= this.minesGridSize - mineCount;
        revealedCount++
      ) {
        const multiplier = minesGetGamePayout(
          {
            revealed: { length: revealedCount },
            minesCount: mineCount,
            gridSize: this.minesGridSize,
            amount: 1,
          },
          this.gameConfig.minesEdge
        );
        results.push([multiplier, revealedCount - 1]);
      }

      let index = this.minesAutobet
        ? this.minesSelected.length
        : this.minesGame?.revealed?.length || 0;
      let maxTurn = this.minesGridSize - mineCount;

      if (index >= 0) {
        let left = index - 3 + this.shift;
        let right = index + 3 + this.shift;

        if (left < 0) {
          right -= left;
          left -= left;
        }

        if (right > maxTurn) {
          left -= right - maxTurn;
          right -= right - maxTurn;
        }

        results = results.slice(left, right + 1);
      }

      return results;
    },
  },

  created() {
    this.socketConnectMines();
  },
  beforeRouteLeave(to, from, next) {
    this.socketDisconnectMines();
    next();
  },
};
</script>

<style scoped lang="scss">
.mines {
  width: 1110px;
  padding-top: 30px;
  margin-inline: auto;
}

.mines .mines-container {
  width: 100%;
  display: flex;
  position: relative;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }

  .multipliers-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: fit-content;
    margin: auto 15px;

    @media screen and (max-width: 1100px) {
      display: none;
    }

    .arrow_up,
    .arrow_down {
      width: 40px;
      height: 40px;
      cursor: pointer;

      background: #22224a;
      opacity: 0.5;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 8px;
      display: grid;
      place-content: center;
    }

    .arrow_up img {
      transform: rotate(180deg);
    }

    .multipliers {
      margin: 10px 0;
      max-height: 500px;
      max-width: 80px;
      overflow: hidden;
      gap: 10px;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;

      .m {
        width: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 5px 15px;
        background: #222142;
        border-radius: 5px;

        text-align: center;

        color: #eeeeee;

        span {
          &:first-of-type {
            text-overflow: ellipsis;
            font-weight: 700;
            font-size: 1.143rem;
            overflow: hidden;
            max-width: 70px;
          }
          &:last-of-type {
            font-weight: 600;
            font-size: 1rem;
            color: #eeeeee;
          }
        }

        &.active {
          span {
            color: #f7be2c;
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 991px) {
  .mines {
    width: 100%;
    padding: 20px 0;
  }

  .mines .mines-container {
    flex-direction: column-reverse;
  }

  .mines .container-actions {
    width: 100%;
    height: auto;
    margin-top: 15px;
  }
}
</style>
