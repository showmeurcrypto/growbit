<template>
  <div
    ref="unbox-spinner"
    class="unbox-spinner"
    v-bind:class="['spinner-' + unboxCount]"
  >
    <div class="spinner-inner">
      <div v-if="unboxCount === 1" class="arrow-up"></div>
      <div v-if="unboxCount === 1" class="arrow-down"></div>
      <div v-if="unboxCount > 1" class="arrow-left"></div>
      <div v-if="unboxCount > 1" class="arrow-right"></div>
      <div
        v-for="i in unboxCount"
        v-bind:key="unboxCount === 1 ? i : i + '-multi'"
        v-bind:ref="'spinner-' + i"
        class="inner-wheel"
      >
        <UnboxReel
          :multi="unboxCount > 1"
          v-bind:ref="'reel-' + i"
          v-bind:style="unboxReelStyle"
          v-bind:reel="unboxReels[i]"
          v-bind:pos="unboxReelsPos"
          v-bind:running="unboxRunning"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UnboxReel from "@/components/unbox/UnboxReel";

export default {
  name: "UnboxSpinner",
  components: {
    UnboxReel,
  },
  data() {
    return {
      unboxReelsSpinTimeout: null,
      unboxReelsPosRepeater: null,
      unboxReelsPos: 20,
      unboxReels: {
        1: [],
        2: [],
        3: [],
        4: [],
      },
      unboxReelStyle: {
        transform: "translateX(2535px) translateY(0px)",
        transition: "none",
      },
    };
  },
  methods: {
    ...mapActions(["unboxSetRunnning"]),
    unboxGetItemsFormated(items) {
      return items;
    },
    unboxGetOutcomeItem(game) {
      let pos = 0;
      let outcomeItem = null;

      for (const item of this.unboxGetItemsFormated(
        this.unboxBoxData.box.items
      )) {
        pos = pos + item.frequency * 100000;
        if (game.data.outcome <= pos) {
          outcomeItem = item;
          break;
        }
      }

      return outcomeItem;
    },
    unboxGetReelsPos() {
      const offset =
        this.unboxCount === 1
          ? this.$refs["reel-1"][0].$el.getBoundingClientRect().left +
            this.$refs["reel-1"][0].$el.getBoundingClientRect().width / 2 -
            this.$refs["unbox-spinner"].getBoundingClientRect().width / 2 -
            this.$refs["unbox-spinner"].getBoundingClientRect().left
          : this.$refs["reel-1"][0].$el.getBoundingClientRect().top +
            this.$refs["reel-1"][0].$el.getBoundingClientRect().height / 2 -
            this.$refs["unbox-spinner"].getBoundingClientRect().height / 2 -
            this.$refs["unbox-spinner"].getBoundingClientRect().top;
      const pos =
        this.unboxCount === 1
          ? Math.round(Math.abs(offset - 2535) / 130) + 20
          : Math.round(Math.abs(offset + 2450.5) / 125) + 20;

      if (this.unboxReelsPos !== pos) {
        this.unboxReelsPos = pos;

        if (this.unboxRunning === true) {
          this.soundTick.volume = this.soundVolume;
          this.soundTick.currentTime = 0;
          this.soundTick.play();
        }
      }

      this.unboxReelsPosRepeater = requestAnimationFrame(this.unboxGetReelsPos);
    },
    unboxAddReels() {
      let items = this.unboxGetItems;
      // console.log("items");
      //  console.log(items);
      this.unboxReels = { 1: [], 2: [], 3: [], 4: [] };

      for (const reel of Object.keys(this.unboxReels)) {
        for (let i = 0; i < 80; i++) {
          this.unboxReels[reel].push(
            items[Math.floor(Math.random() * items.length)]
          );
        }
      }
    },
  },
  computed: {
    ...mapGetters([
      "soundVolume",
      "soundTick",
      "soundOpen",
      "generalTimeDiff",
      "unboxCount",
      "unboxRunning",
      "unboxGames",
      "unboxBoxData",
      "unboxQuick",
    ]),
    unboxGetItems() {
      let items = [];

      for (let item of this.unboxGetItemsFormated(
        this.unboxBoxData.box.items
      )) {
        const count = Math.floor(item.frequency * 100);
        for (let i = 0; i < (count <= 0 ? 1 : count); i++) {
          items.push(item);
        }
      }

      return items;
    },
  },
  watch: {
    unboxCount: {
      handler() {
        this.unboxReelsPos = 20;

        if (this.unboxCount === 1) {
          this.unboxReelStyle = {
            transform: "translateX(2535px) translateY(0px)",
            transition: "none",
          };
        } else {
          this.unboxReelStyle = {
            transform: "translateX(0px) translateY(-2450.5px)",
            transition: "none",
          };
        }
      },
    },
    unboxGames: {
      deep: true,
      handler(data, dataOld) {
        if (this.unboxGames.length >= 1) {
          if (dataOld.length !== 0) {
            this.unboxAddReels();
          }
          this.unboxGetReelsPos();

          for (const [index, game] of this.unboxGames.entries()) {
            if (this.unboxCount === 1) {
              this.unboxReelStyle = {
                transform: "translateX(2535px) translateY(0px)",
                transition: "none",
              };
            } else {
              this.unboxReelStyle = {
                transform: "translateX(0px) translateY(-2450.5px)",
                transition: "none",
              };
            }

            this.unboxReels[index + 1][60] = this.unboxGetOutcomeItem(game);

            setTimeout(() => {
              const timeEnding =
                new Date(game.updatedAt).getTime() +
                (this.unboxQuick ? 1000 : 5000);
              let timeLeft =
                timeEnding -
                (new Date().getTime() +
                  (game.demo !== true ? this.generalTimeDiff : 0));
              timeLeft = timeLeft > 0 ? timeLeft : 0;

              if (this.unboxCount === 1) {
                this.unboxReelStyle = {
                  transform:
                    "translateX(-" +
                    (2612.5 +
                      (105 / 8) * Math.floor(Math.random() * (7 - 1 + 1)) +
                      1) +
                    "px) translateY(0px)",
                  transition:
                    "transform " +
                    timeLeft / 1000 +
                    "s cubic-bezier(0.1, 0, 0.2, 1)",
                };
              } else {
                this.unboxReelStyle = {
                  transform:
                    "translateX(0px) translateY(-" +
                    (7398 +
                      (105 / 8) * Math.floor(Math.random() * (7 - 1 + 1)) +
                      1) +
                    "px)",
                  transition:
                    "transform " +
                    timeLeft / 1000 +
                    "s cubic-bezier(0.1, 0, 0.2, 1)",
                };
              }

              this.unboxReelsSpinTimeout = setTimeout(() => {
                if (this.unboxCount === 1) {
                  this.unboxReelStyle = {
                    transform: "translateX(-2665px) translateY(0px)",
                    transition: "transform 0.25s cubic-bezier(0.1, 0, 0.2, 1)",
                  };
                } else {
                  this.unboxReelStyle = {
                    transform: "translateX(0px) translateY(-7450.5px)",
                    transition: "transform 0.25s cubic-bezier(0.1, 0, 0.2, 1)",
                  };
                }

                cancelAnimationFrame(this.unboxReelsPosRepeater);
                setTimeout(() => {
                  this.unboxSetRunnning(false);

                  this.soundOpen.volume = this.soundVolume;
                  this.soundOpen.currentTime = 0;
                  this.soundOpen.play();
                }, 250);
              }, timeLeft + 100);
            }, 250);
          }
        }
      },
    },
  },
  created() {
    this.unboxAddReels();
  },
  beforeDestroy() {
    this.unboxSetRunnning(false);
    clearTimeout(this.unboxReelsSpinTimeout);
    cancelAnimationFrame(this.unboxReelsPosRepeater);
  },
};
</script>

<style scoped>
.unbox-spinner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 1px;
  z-index: 1;
}

.unbox-spinner::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}

.unbox-spinner::after {
  content: "";
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  top: 1px;
  left: 1px;
  z-index: -1;
}

.unbox-spinner .inner-wheel {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.unbox-spinner .spinner-inner .arrow-down {
  position: absolute;
  right: 47%;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  margin-top: -1px;

  border-top: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    right: 45%;
  }
}

.unbox-spinner .spinner-inner .arrow-up {
  position: absolute;
  right: 47%;
  bottom: 4px;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;

  border-bottom: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    right: 45%;
  }
}

.unbox-spinner .spinner-inner .arrow-left {
  position: absolute;
  bottom: 47%;
  right: 0px;
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;

  border-right: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    bottom: 40%;
  }
}

.unbox-spinner .spinner-inner .arrow-right {
  position: absolute;
  bottom: 47%;
  left: 0px;
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;

  border-left: 20px solid #22224a;

  @media screen and (max-width: 991px) {
    bottom: 40%;
  }
}

.unbox-spinner .inner-wheel:last-child {
  border-right: none;
}

.unbox-spinner.spinner-2 .inner-wheel {
  width: 50%;
}

.unbox-spinner.spinner-3 .inner-wheel {
  width: 33.33%;
}

.unbox-spinner.spinner-4 .inner-wheel {
  width: 25%;
}

.unbox-spinner .spinner-inner {
  display: flex;
  height: 100%;
  /*    flex-direction: column;*/
}

@media only screen and (max-width: 900px) {
  /*.unbox-spinner {
            height: auto;
        }

        .unbox-spinner .spinner-inner {
            flex-direction: column;
        }

        .unbox-spinner .inner-wheel {
            height: 140px;
            border-bottom: 1px solid rgba(28, 71, 182, 0.35);
            border-right: none;
        }

        .unbox-spinner .inner-wheel:last-child {
            border-bottom: none;
        }

        .unbox-spinner.spinner-2 .inner-wheel,
        .unbox-spinner.spinner-3 .inner-wheel,
        .unbox-spinner.spinner-4 .inner-wheel {
            width: 100%;
        }*/
}
</style>
