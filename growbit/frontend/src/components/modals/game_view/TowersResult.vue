<template>
  <div class="tower">
    <div class="tower-container">
      <div class="game-container">
        <div
          class="grid"
          :class="{ two: C === 2, three: C == 3, four: C == 4 }"
        >
          <div
            v-for="(cell, index) in cells"
            :key="index"
            :class="cell.className"
            @click="onCellClick(cell.col, index)"
          >
            <img v-if="cell.image" :src="cell.image" :alt="cell.alt" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["game"],
  data() {
    return {
      difficulties: {
        easy: { cols: 4, bombs: 1, name: "Easy" },
        med: { cols: 3, bombs: 1, name: "Medium" },
        hard: { cols: 2, bombs: 1, name: "Hard" },
        insane: { cols: 3, bombs: 2, name: "Insane" },
        ultraInsane: { cols: 4, bombs: 3, name: "Ultra Insane" },
      },
      R: 10,
    };
  },
  computed: {
    C() {
      console.log(this.game.risk);
      console.log(this.difficulties[this.game.risk]);
      return this.difficulties[this.game.risk].cols;
    },
    cells() {
      const output = [];
      if (!this.game.revealed.length) {
        for (let r = 0; r < this.R; r++) {
          for (let c = this.C - 1; c >= 0; c--) {
            let baseClass = "cell";

            let rowData = this.game?.deck?.[r];

            const key = `cell ${r} ${c}`;

            if (rowData[c] === "lose") {
              output.unshift({
                key,
                col: c,
                className: [baseClass, "mine"].join(" "),
                image: "/img/tower/mine.png",
                alt: "mine",
              });
            } else {
              output.unshift({
                key,
                col: c,
                className: [baseClass, "coin"].join(" "),
                image: "/img/tower/coin.png",
                alt: "coin",
              });
            }
          }
        }
      } else {
        for (let r = 0; r < this.R; r++) {
          for (let c = this.C - 1; c >= 0; c--) {
            let baseClass = "cell";

            let rowData = this.game?.deck?.[r] || this.game?.revealed?.[r]?.row;

            const key = `cell ${r} ${c}`;

            let clicked =
              r < this.game?.revealed?.length &&
              this.game?.revealed[r].tile == c;

            if (clicked) {
              baseClass += " clicked";
            }

            if (
              (!clicked && this.game?.state === "created") ||
              !rowData ||
              (this.game?.state !== "completed" &&
                this.game?.revealed?.length <= r)
            ) {
              output.unshift({ key, col: c, className: baseClass });
            } else if (rowData[c] === "lose") {
              if (clicked) {
                output.unshift({
                  key,
                  col: c,
                  className: [baseClass, "mine"].join(" "),
                  image: "/img/tower/mine.png",
                  alt: "mine",
                });
              } else {
                output.unshift({ key, col: c, className: baseClass });
              }
            } else {
              let classes = [baseClass];
              if (clicked) {
                classes.push("coin");
              }
              output.unshift({
                key,
                col: c,
                className: classes.join(" "),
                image: "/img/tower/coin.png",
                alt: "coin",
              });
            }
          }
        }
      }

      return output;
    },
  },
};
</script>

<style scoped lang="scss">
.tower {
  max-width: 1100px;
  width: 100%;
  //padding: 30px 0 0 0;
  margin-inline: auto;
}

.tower .tower-container {
  width: 100%;
  gap: 10px;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 991px) {
    padding-inline: 10px;
  }
}

.game-container {
  position: relative;
  max-height: 570px;
  overflow: hidden;
  width: 100%;
  //padding: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

div.row {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
}

.grid {
  margin-left: 15px;
  margin-right: 15px;
  position: relative;
  //z-index: 10;
  display: grid;
  background: url("/img/tower/tower.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-size: 100% 100%;
  padding: 35px 15px 25px 15px;
  &.two {
    grid-template-columns: repeat(2, auto);
  }
  &.three {
    grid-template-columns: repeat(3, auto);
  }
  &.four {
    grid-template-columns: repeat(4, auto);
  }
  gap: 6px;
  height: fit-content;
  border-radius: 4px;
}

.cell {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Field */

  background: #2f333a;
  /* Modal shadow */
  border-radius: 4px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;

  &:not(.clicked) img {
    opacity: 0.5;
  }

  width: 45px;
  height: 20px;
  svg,
  img {
    max-height: 12px;
  }
}

.mine {
  pointer-events: none;
  background: rgba(174, 36, 69, 0.4);
  border: 1px solid #ae2445;
}

.coin {
  pointer-events: none;

  background: rgba(49, 157, 41, 0.4);
  border: 1px solid #319d29;
}

.dead {
  background: #6e0202;
}

.picked {
  background: #5b46bc;
}
</style>
