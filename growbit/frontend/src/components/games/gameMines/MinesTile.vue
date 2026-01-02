<template>
  <div
    v-bind:class="{
      ['mines-tile-' + Math.ceil(Math.sqrt(this.minesGridSize))]: true,
      'mines-tile': true,
      'tile-revealed': minesGame !== null && isTileRevealed,
      'tile-completed': minesGame !== null && minesGame.state === 'completed',
    }"
  >
    <transition name="fade" mode="out-in">
      <div class="tile-inner">
        <div class="inner-front">
          <div
            v-if="minesGame !== null && minesGetRevealedTile === 'coin'"
            :ref="'coin' + tile"
            class="front-coin"
          >
            <img
              v-if="isLastRevealed && minesGame.state !== 'completed'"
              :src="getWebpSrc('gem.webp')"
              alt="coin-icon"
            />
            <img
              v-else
              src="../../../assets/images/mines/gem.png"
              alt="coin-icon"
            />
          </div>
          <div
            v-else-if="minesGame !== null && minesGetRevealedTile === 'mine'"
            :ref="'bomb' + tile"
            class="front-mine"
          >
            <img
              v-if="isLastRevealed"
              :src="getWebpSrc('bomb.webp')"
              alt="bomb"
            />
            <img
              v-else
              src="../../../assets/images/mines/bomb.png"
              alt="bomb"
            />
          </div>
        </div>
        <div class="inner-back">
          <button
            v-on:click="minesRevealTile()"
            v-bind:class="{
              'button-reveal': true,
              'button-active':
                minesGame !== null || (minesAutobet && !minesAutoActive),
              selected: minesAutobet && minesSelected.includes(tile),
            }"
            v-bind:disabled="
              (socketSendLoading !== null ||
                minesGame === null ||
                minesGame.state === 'completed') &&
              minesAutoActive === true
            "
          >
            <!-- <img src="@/assets/img/mini-logo.png" alt="tiles-logo"> -->
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  // data() {
  //   return {
  //     clicked : false
  //   };
  // },
  name: "MinesTile",
  props: ["tile"],
  methods: {
    ...mapActions([
      "notificationShow",
      "minesSendRevealSocket",
      "minesPushToSelected",
      "minesPopFromSelected",
    ]),
    getWebpSrc(imageName) {
      // console.log("called on tile " + this.tile);
      if (this.$refs["coin" + this.tile] || this.$refs["bomb" + this.tile])
        return require(`../../../assets/images/mines/${
          imageName.substr(0, imageName.length - 5) + ".png"
        }`);
      return (
        require(`../../../assets/images/mines/${imageName}`) +
        `?t=${new Date().getTime()}`
      );
    },
    minesRevealTile() {
      // console.log("revealing tile");
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      if (this.minesGame === null && this.minesAutobet === false) {
        // this.notificationShow({
        //   type: "error",
        //   message: "You have no running mines game at the moment.",
        // });
        return;
      } else if (this.minesAutobet && !this.minesAutoActive) {
        // this.selected = !this.selected;
        if (!this.minesSelected.includes(this.tile)) {
          this.minesPushToSelected({ tile: this.tile });
        } else {
          this.minesPopFromSelected({ tile: this.tile });
        }
        return;
      } else if (!this.minesAutobet) {
        const data = { tile: this.tile };
        this.minesSendRevealSocket(data);
      }
    },
    refreshAnimation(revealed) {
      if (revealed === "coin") {
        let src = this.$refs["coin" + this.tile].src;
        this.$refs["coin" + this.tile].src = "";
        this.$refs["coin" + this.tile].src = src;
      }

      if (revealed === "bomb") {
        let src = this.$refs["bomb" + this.tile].src;
        this.$refs["bomb" + this.tile].src = "";
        this.$refs["bomb" + this.tile].src = src;
      }
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "authUser",
      "minesGame",
      "minesAutobet",
      "minesAutoActive",
      "minesSelected",
      "minesGridSize",
    ]),
    minesGetRevealedTile() {
      let revealed = null;

      // if (this.minesGame.state === 'completed' && this.minesGame.deck[this.tile] === 'mine') {
      if (this.minesGame.state === "completed") {
        revealed = this.minesGame.deck[this.tile];
      } else {
        const index = this.minesGame.revealed.findIndex(
          (element) => element.tile === this.tile
        );
        if (index !== -1) {
          revealed = this.minesGame.revealed[index].value;
        }
      }
      // this.refreshImage(revealed);

      return revealed;
    },
    isTileRevealed() {
      const index = this.minesGame.revealed.findIndex(
        (element) => element.tile === this.tile
      );
      return index !== -1;
    },
    isLastRevealed() {
      const index = this.minesGame.revealed.findIndex(
        (element) => element.tile === this.tile
      );
      if (index === this.minesGame.revealed.length - 1) {
        //console.log("last revealed " + this.tile);
        //this.refreshAnimation(this.minesGame.revealed[index].value);
        return true;
      }
      return false;
    },
  },

  beforeRouteLeave(to, from, next) {
    //this.selected = false;
    next();
  },
};
</script>

<style scoped>
.mines-tile .inner-back button.selected {
  background: #5b46bc !important;
  border-color: #090c1d !important;
}
.mines-tile-5 {
  width: 100px;
  height: 100px;
  perspective: 1000px;
}

.mines-tile-6 {
  width: 81px;
  height: 81px;
  perspective: 1000px;
}

.mines-tile-7 {
  width: 67px;
  height: 67px;
  perspective: 1000px;
}

.mines-tile-8 {
  width: 58px;
  height: 58px;
  perspective: 1000px;
}

.mines-tile .tile-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(-180deg);
}

.mines-tile.tile-completed .tile-inner,
.mines-tile.tile-revealed .tile-inner {
  transform: rotateY(0deg);
  animation: tile-reveal-cffb6eec 0.4s linear forwards;
}

@keyframes tile-reveal-cffb6eec {
  0% {
    transform: rotateY(-180deg);
  }

  50% {
    transform: rotateY(-180deg);
  }

  to {
    transform: rotateY(0deg);
  }
}

.mines-tile .inner-back,
.mines-tile .inner-front {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
}

.mines-tile .inner-front {
  width: 100%;
  height: 100%;
  opacity: 0.2;
  transition: all 0.3s ease;
}

.mines-tile.tile-revealed .inner-front {
  opacity: 1;
}

.mines-tile .front-coin {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #263063;
  box-shadow: inset 0px -7px 0px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.mines-tile-5 .front-coin img {
  width: 80px;
}

.mines-tile-6 .front-coin img {
  width: 70px;
}

.mines-tile-7 .front-coin img {
  width: 60px;
}

.mines-tile-8 .front-coin img {
  width: 50px;
}

.mines-tile .multiplier-amount span {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.mines-tile .front-mine {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  background: #4b1b25;
  box-shadow: inset 0px -7px 0px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.mines-tile-5 .front-mine img {
  width: 90px;
}

.mines-tile-6 .front-mine img {
  width: 80px;
}

.mines-tile-7 .front-mine img {
  width: 70px;
}

.mines-tile-8 .front-mine img {
  width: 60px;
}

.mines-tile .mine-text {
  width: 72px;
  height: 29px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 15px;
  font-weight: 700;
  color: #ff879a;
  background: #7d464f;
}

.mines-tile .inner-back {
  width: 100%;
  height: 100%;
  transform: rotateY(-180deg);
}

.mines-tile .inner-back button.button-reveal {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  cursor: not-allowed;
  background: #22224a;
  box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
}

.mines-tile .inner-back button.button-reveal.button-active {
  opacity: 1;
  cursor: pointer;
}

.mines-tile .inner-back button.button-reveal img {
  width: 64px;
  height: 64px;
  /* mix-blend-mode: luminosity; */
  transition: all 0.3s ease;
  opacity: 0.4;
}

.mines-tile .inner-back button.button-reveal.button-active:hover img {
  opacity: 0.3;
}

@media only screen and (max-width: 991px) {
  .mines-tile-5 {
    width: min(calc((100vw - 70px) / 5), 90px);
    height: min(calc((100vw - 70px) / 5), 90px);
    margin-right: 10px;
  }

  .mines-tile-6 {
    width: min(calc((100vw - 70px) / 6), 90px);
    height: min(calc((100vw - 70px) / 6), 90px);
    margin-right: 10px;
  }

  .mines-tile-7 {
    width: min(calc((100vw - 70px) / 7), 90px);
    height: min(calc((100vw - 70px) / 7), 90px);
    margin-right: 10px;
  }

  .mines-tile-8 {
    width: min(calc((100vw - 80px) / 8), 90px);
    height: min(calc((100vw - 80px) / 8), 90px);
    margin-right: 10px;
  }

  .mines-tile-5:nth-child(5n) {
    margin-right: 0;
  }

  .mines-tile-6:nth-child(6n) {
    margin-right: 0;
  }

  .mines-tile-7:nth-child(7n) {
    margin-right: 0;
  }

  .mines-tile-8:nth-child(8n) {
    margin-right: 0;
  }

  .mines-tile-5 .inner-back button.button-reveal img {
    width: 40px;
    height: 40px;
  }

  .mines-tile-5 .front-coin img {
    width: 50px;
  }

  .mines-tile-5 .front-mine img {
    width: 50px;
  }

  .mines-tile-6 .inner-back button.button-reveal img {
    width: 35px;
    height: 35px;
  }

  .mines-tile-6 .front-coin img {
    width: 45px;
  }

  .mines-tile-6 .front-mine img {
    width: 45px;
  }

  .mines-tile-7 .inner-back button.button-reveal img {
    width: 30px;
    height: 30px;
  }

  .mines-tile-7 .front-coin img {
    width: 40px;
  }

  .mines-tile-7 .front-mine img {
    width: 40px;
  }

  .mines-tile-8 .inner-back button.button-reveal img {
    width: 30px;
    height: 30px;
  }

  .mines-tile-8 .front-coin img {
    width: 35px;
  }

  .mines-tile-8 .front-mine img {
    width: 35px;
  }

  .mines-tile .multiplier-amount span {
    font-size: 13px;
  }

  .mines-tile .mine-text {
    width: 52px;
    height: 26px;
    font-size: 13px;
  }
}
</style>
