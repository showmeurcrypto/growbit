<template>
  <div class="slide-header">
    <div class="header-top">
      <div class="top-stats">
        <span>LAST 100</span>
        <div class="stats-content">
          <div class="stats-element">
            <div class="tile red"></div>
            {{ slideGetStats.red }}
          </div>
          <div class="stats-element">
            <div class="tile purple"></div>
            {{ slideGetStats.purple }}
          </div>
          <div class="stats-element">
            <div class="tile yellow"></div>
            {{ slideGetStats.yellow }}
          </div>
        </div>
      </div>
      <div class="top-history">
        <span>PREVIOUS ROLLS</span>
        <transition-group name="history" tag="div" class="history-content">
          <button
            :key="game._id"
            v-for="game of slideData.history.slice(0, 7)"
            @click="slideGameButton()"
            :class="`tile ${slideGetOutcomeColor(game)}`"
          ></button>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { getWinningColour } from "@/utils";

export default {
  name: "SlideHeader",
  components: {},
  data() {
    return {
      slideTimerRepeater: null,
      slideTimer: 0,
      slideText: "LOADING...",
    };
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData"]),
    slideGameButton(game) {
      this.modalsSetData({ method: "slide", game: game });
      this.modalsSetShow("ProvabilityFair");
    },
    slideStartTimer() {
      const timeEnding =
        new Date(this.slideData.game.createdAt).getTime() + 1000 * 13;
      this.slideTimer =
        (timeEnding - (new Date().getTime() + this.generalTimeDiff)) / 1000;

      this.slideText =
        "Rolling in <span>" + this.slideTimer.toFixed(2) + "</span>s";

      if (this.slideTimer <= 0) {
        this.slideTimer = 0;
        this.slideText = "Rolling...";
      } else {
        this.slideTimerRepeater = requestAnimationFrame(this.slideStartTimer);
      }
    },
    slideGetOutcomeColor(game) {
      return getWinningColour(game.outcome).winningColour;
    },
  },
  computed: {
    ...mapGetters(["generalTimeDiff", "slideData"]),
    slideGetStats() {
      let stats = { red: 0, yellow: 0, purple: 0 };

      for (let game of this.slideData.history) {
        stats[this.slideGetOutcomeColor(game)] =
          stats[this.slideGetOutcomeColor(game)] + 1;
      }

      return stats;
    },
  },
  watch: {
    "slideData.game": {
      handler(data, oldData) {
        if (data.state === "created") {
          this.slideStartTimer();
        } else {
          this.slideTimer = 0;
          this.slideText = "Rolling...";
        }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    cancelAnimationFrame(this.slideTimerRepeater);
  },
};
</script>

<style scoped>
.slide-header {
  width: 100%;
  @media screen and (min-width: 991px) {
    padding-inline: 20px;
  }
}

.tile {
  width: 35px;
  height: 35px;

  border-radius: 8px;

  flex-shrink: 0;

  &.red {
    background: #ae2445;
  }
  &.purple {
    background: #6f6bfc;
  }
  &.yellow {
    background: #99bc46;
  }
}

.slide-header .header-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slide-header .top-stats,
.slide-header .top-history {
  display: flex;
  flex-direction: column;
}

.slide-header .top-history {
  align-items: flex-start;
}

.slide-header .top-stats span,
.slide-header .top-history span {
  font-style: normal;
  font-weight: 700;
  font-size: 1.143rem;

  color: #eeeeee;
}

.slide-header .stats-content,
.slide-header .history-content {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 8px;
}

.slide-header .history-content {
  width: 266px;
}

.slide-header .stats-element {
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 1rem;
  gap: 8px;
  font-weight: 600;
  color: #ffffff;
}

.slide-header .stats-element img {
  width: 28px;
  height: 28px;
  margin-right: 8px;
}

.slide-header .history-move,
.slide-header .history-enter-active,
.slide-header .history-leave-active {
  transition: all 0.3s ease;
}

.slide-header .history-leave-active {
  position: absolute;
}

.slide-header .history-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-header .history-leave-to {
  opacity: 0;
  transform: translateX(272px);
}

@media only screen and (max-width: 991px) {
  .slide-header .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .slide-header .top-stats,
  .slide-header .top-history {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .slide-header .top-history {
    margin-top: 15px;
  }

  .slide-header .top-stats span,
  .slide-header .top-history span {
    margin-right: 8px;
  }

  .slide-header .stats-content,
  .slide-header .history-content {
    margin-top: 0;
  }
}
</style>
