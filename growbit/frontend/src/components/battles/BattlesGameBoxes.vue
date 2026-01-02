<template>
  <div
    class="battles-game-boxes"
    v-bind:class="{
      'boxes-rolling': game !== null && game.state === 'rolling',
    }"
  >
    <div class="boxes-list">
      <button
        v-for="(box, index) in battlesGetBoxes"
        v-bind:key="box.pos"
        v-on:click="battlesBoxButton(box.box)"
        class="button-box"
        v-bind:class="{
          'button-active':
            (index === 0 &&
              ['created', 'countdown', 'pending'].includes(game.state) ===
                true) ||
            box.pos === battlesGetRound - 1,
        }"
      >
        <img v-bind:src="'/img/cases/cases/' + box.box + '.png'" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "BattlesGameBoxes",
  components: {},
  props: ["game"],
  data() {
    return {
      unboxImagePath: process.env.VUE_APP_HOST_URL,
    };
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData"]),
    battlesBoxButton(box) {
      this.modalsSetData({ box: box });
      this.modalsSetShow("Box");
    },
  },
  computed: {
    battlesGetRound() {
      let round = 1;

      if (
        this.game !== null &&
        this.game.bets[0].outcomes !== undefined &&
        this.game.bets[0].outcomes.length >= 1
      ) {
        round = this.game.bets[0].outcomes.length;
      }

      return round;
    },
    battlesGetBoxes() {
      let pos = 0;
      let boxes = [];

      if (this.game !== null) {
        for (const box of this.game.boxes) {
          for (let i = 0; i < box.count; i++) {
            boxes.push({ pos: pos, box: box.box });
            pos = pos + 1;
          }
        }
      }

      return boxes.slice(this.battlesGetRound - 1, this.battlesGetRound + 11);
    },
  },
};
</script>

<style scoped>
.battles-game-boxes {
  width: 100%;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  background: #0b0e1f;
  border-radius: 8px;
  padding: 15px;
  z-index: 1;
}

.battles-game-boxes .boxes-background {
  width: 100%;
  height: 100%;
  position: absolute;
  padding: 1px;
  z-index: -1;
}

.battles-game-boxes .background-inner {
  width: 100%;
  height: 100%;
  display: flex;
}

.battles-game-element .battles-game-boxes .background-inner {
}

.battles-game-boxes .boxes-selector {
  width: 77px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 1px;
  z-index: -1;
}

.battles-game-boxes .selector-inner svg {
  z-index: 10;
}

.battles-game-boxes .boxes-list {
  display: flex;
  width: 100%;
  height: 100px;
}

.battles-game-boxes .boxes-list .list-move,
.battles-game-boxes .boxes-list .list-leave-active {
  transition: all 0.3s;
}

.battles-game-boxes .boxes-list .list-leave-active {
  position: absolute;
}

.battles-game-boxes .boxes-list .list-leave-to {
  transform: translateX(-62px);
}

.battles-game-boxes button.button-box {
  height: 100%;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
}

.battles-game-element .battles-game-boxes button.button-box {
  pointer-events: none;
}

.battles-game-boxes button.button-box.button-active {
  width: 77px;
  margin-right: 11px;
}

.battles-game-boxes button.button-box img {
  height: 60px;
}

.battles-game-boxes button.button-box.button-active img {
  transform: scale(1.1);
}

.battles-game-boxes.boxes-rolling button.button-box.button-active img {
  opacity: 1;
  mix-blend-mode: normal;
}
</style>
