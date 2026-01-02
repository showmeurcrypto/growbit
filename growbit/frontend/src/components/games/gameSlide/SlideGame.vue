<template>
  <div class="slide-game">
    <transition name="fade" mode="out-in">
      <div
        v-if="
          slideData.game !== null &&
          ['created', 'pending', 'fairness'].includes(slideData.game.state) ===
            true
        "
        class="game-info"
        key="info"
      >
        <div v-if="slideData.game.state === 'fairness'" class="info-fairness">
          Waiting for eos block
          <span>#{{ slideData.game.fair.blockNum }}</span>
        </div>
        <div v-else class="info-countdown">
          Starting
          <div class="countdown-text">
            <span>{{ slideCountdownText.split("")[0] }}</span>
            <span>{{ slideCountdownText.split("")[1] }}</span>
            <span>.</span>
            <span>{{ slideCountdownText.split("")[2] }}</span>
            <span>{{ slideCountdownText.split("")[3] }}</span>
          </div>
        </div>
      </div>
      <div v-else class="game-selector" key="selector">
        <img src="@/assets/images/slide/indicator_top.png" />
        <img src="@/assets/images/slide/indicator_bottom.png" />
      </div>
    </transition>

    <div
      class="game-reel"
      :style="slideReelStyle"
      :class="{
        shadow:
          slideData.game !== null &&
          ['created', 'pending', 'fairness'].includes(slideData.game.state) ===
            true,
      }"
    >
      <div v-for="i in 8" :key="i" class="reel-row">
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/yellow_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
        <img src="../../../assets/images/slide/red_new.png" />
        <img src="../../../assets/images/slide/purple_new.png" />
      </div>
    </div>
  </div>
</template>

<script>
// import mixins from '@/mixins';
import { mapActions, mapGetters } from "vuex";

export default {
  name: "SlideGame",
  // mixins: [
  //     mixins
  // ],
  data() {
    return {
      slideEndTimeout: null,
      slideCountdownRepeater: null,
      slideCountdownText: "0000",
      slideOrder: [2, 3, 4, 5, 6, 7, 8, 0, 9, 10, 11, 12, 13, 14, 1],
      slideReelStyle: {
        transform: "translate(0px, -50%)",
        transition: "none",
      },
    };
  },
  methods: {
    ...mapActions(["playSoundTick", "playSoundRoll"]),
    slideStartCountdown() {
      const timeEnding =
        new Date(this.slideData.game.createdAt).getTime() + 1000 * 13;
      const timeLeft = Math.floor(
        (timeEnding - (new Date().getTime() + this.generalTimeDiff)) / 10
      );

      this.slideCountdownText = String(
        timeLeft < 100
          ? "00" + timeLeft
          : timeLeft < 1000
          ? "0" + timeLeft
          : timeLeft
      );

      if (timeLeft <= 0) {
        this.slideCountdownText = "0000";
      } else {
        this.slideCountdownRepeater = requestAnimationFrame(
          this.slideStartCountdown
        );
      }
    },
  },
  computed: {
    ...mapGetters([
      "soundVolume",
      "soundSlideStart",
      "soundSlideEnd",
      "generalTimeDiff",
      "slideData",
      "testData",
    ]),
  },
  watch: {
    "slideData.game": {
      handler(data, oldData) {
        if (data.state === "created") {
          const index = this.slideOrder.indexOf(
            this.slideData.history[0].outcome
          );

          this.slideReelStyle = {
            transform: "translate(" + (5575 - 125 * index) + "px, -50%)",
            transition: "none",
          };

          this.slideStartCountdown();
        } else if (data.state === "rolling") {
          console.log("rolling", this.slideData.game.outcome);
          const index = this.slideOrder.indexOf(this.slideData.game.outcome);

          let offset =
            Math.abs(parseInt(this.slideData.game._id.substr(0, 8), 16)) % 9;
          offset = offset === 4 ? 3 : offset;

          const timeEnding =
            new Date(this.slideData.game.updatedAt).getTime() + 5000;
          let timeLeft =
            timeEnding - (new Date().getTime() + this.generalTimeDiff);
          timeLeft = timeLeft > 0 ? timeLeft : 0;

          this.slideReelStyle = {
            transform:
              "translate(" +
              (-3750 - 125 * index - 12.5 * offset) +
              "px, -50%)",
            transition:
              "transform " +
              timeLeft / 1000 +
              "s cubic-bezier(0.05, 0.85, 0.25, 1)",
          };
          this.playSoundRoll();

          this.slideEndTimeout = setTimeout(() => {
            this.slideReelStyle = {
              transform: "translate(" + (-3800 - 125 * index) + "px, -50%)",
              transition: "transform 0.2s linear",
            };
            this.playSoundTick();
          }, timeLeft + 500);
        }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    clearTimeout(this.slideEndTimeout);
    cancelAnimationFrame(this.slideCountdownRepeater);
  },
};
</script>

<style scoped>
.slide-game {
  width: 100%;
  height: 150px;
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  overflow: hidden;
}

/*.slide-game::before {
  content: "";
  width: 200px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, #11141f 0%, rgba(17, 20, 31, 0) 100%);
  z-index: 1;
}

.slide-game::after {
  content: "";
  width: 200px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(270deg, #11141f 0%, rgba(17, 20, 31, 0) 100%);
  z-index: 1;
}*/

.slide-game .game-info {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  border-radius: 18px;
  z-index: 5;
}

.slide-game .game-info.fade-enter-active,
.slide-game .game-info.fade-leave-active {
  transition: opacity 0.3s;
}

.slide-game .game-info.fade-enter-from,
.slide-game .game-info.fade-leave-to {
  opacity: 0;
}

.slide-game .info-text {
  font-size: 13px;
  font-weight: 500;
}

.slide-game .info-fairness {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.slide-game .info-countdown {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.slide-game .info-fairness span {
  margin-top: 3px;
  font-size: 1.571rem;
  color: var(--green);
}

.slide-game .countdown-text {
  display: flex;
  align-items: center;
  margin-top: 3px;
}

.slide-game .countdown-text span {
  width: 13px;
  text-align: center;
  font-size: 1.571rem;
  color: var(--green);
}

.slide-game .countdown-text span:nth-child(3) {
  width: auto;
}

.slide-game .game-selector {
  width: 6px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 5;

  > img {
    position: absolute;
    left: -14px;

    &:first-of-type {
      top: 0;
    }
    &:last-of-type {
      bottom: 0;
    }
  }
}

.slide-game .game-selector:before {
  top: 0;
}

.slide-game .game-selector:after {
  bottom: 0;
}

.slide-game .game-reel {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;

  &.shadow {
    img {
      opacity: 0.3;
    }
  }
}

.slide-game .reel-row {
  display: flex;
  align-items: center;
}

.slide-game .reel-row img {
  width: 100px;
  height: 128px;
  margin-right: 25px;
}
</style>
