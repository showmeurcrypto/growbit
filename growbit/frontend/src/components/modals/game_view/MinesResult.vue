<template>
  <div v-if="game" :class="'mines_grid_res-' + game.gridSize">
    <div
      v-for="i in game.gridSize"
      :key="i - 1"
      :data-mine-id="i - 1"
      :class="`cell ${
        game.multiplier === 0 &&
        i - 1 === game.revealed?.[game.revealed?.length - 1].tile
          ? 'red'
          : ''
      } ${
        markNotRevealed && !game.revealed.find((r) => r.tile === i - 1)
          ? 'not-revealed'
          : ''
      } ${
        markNotRevealed && game.revealed?.find((r) => r.tile === i - 1)
          ? 'revealed'
          : ''
      }`"
    >
      <img
        v-if="game.deck?.[i - 1] === 'mine'"
        class="bomb"
        alt
        src="../../../assets/images/mines/bomb.webp"
      />
      <img
        v-if="game.deck?.[i - 1] === 'coin'"
        alt
        src="../../../assets/images/mines/gem.webp"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    markNotRevealed() {
      return this.game?.revealed?.length;
    },
  },
  watch: {},
  methods: {},
  props: ["game"],
};
</script>

<style lang="scss">
.mines_grid_res-25 {
  display: grid;
  grid-template-columns: repeat(5, 35px);
  grid-template-rows: repeat(5, 35px);
  grid-auto-flow: row;
  justify-content: center !important;

  .mine {
    aspect-ratio: 1;
  }

  div.cell {
    cursor: pointer !important;
    border-radius: 5px;
    opacity: 0.8;
    height: 30px;
    width: 30px;
    overflow: hidden;
    background: #191737;
    display: grid;
    place-content: center;

    &.red {
      background: #ac1212;
    }
    &.revealed {
      background: #263063;
    }

    &.not-revealed img {
      opacity: 0.4;
    }

    img {
      width: 18px;
      height: 18px;
    }
  }
}

.mines_grid_res-36 {
  display: grid;
  grid-template-columns: repeat(6, 30px);
  grid-template-rows: repeat(6, 30px);
  grid-auto-flow: row;
  justify-content: center !important;

  .mine {
    aspect-ratio: 1;
  }

  div.cell {
    cursor: pointer !important;
    border-radius: 5px;
    opacity: 0.8;
    height: 25px;
    width: 25px;
    overflow: hidden;
    background: #191737;
    display: grid;
    place-content: center;

    &.red {
      background: #ac1212;
    }
    &.revealed {
      background: #263063;
    }

    &.not-revealed img {
      opacity: 0.4;
    }

    img {
      width: 15px;
      height: 15px;
    }
  }
}

.mines_grid_res-49 {
  display: grid;
  grid-template-columns: repeat(7, 25px);
  grid-template-rows: repeat(7, 25px);
  grid-auto-flow: row;
  justify-content: center !important;

  .mine {
    aspect-ratio: 1;
  }

  div.cell {
    cursor: pointer !important;
    border-radius: 5px;
    opacity: 0.8;
    height: 20px;
    width: 20px;
    overflow: hidden;
    background: #191737;
    display: grid;
    place-content: center;

    &.red {
      background: #ac1212;
    }
    &.revealed {
      background: #263063;
    }

    &.not-revealed img {
      opacity: 0.4;
    }

    img {
      width: 12px;
      height: 12px;
    }
  }
}

.mines_grid_res-64 {
  display: grid;
  grid-template-columns: repeat(8, 20px);
  grid-template-rows: repeat(8, 20px);
  grid-auto-flow: row;
  justify-content: center !important;

  .mine {
    aspect-ratio: 1;
  }

  div.cell {
    cursor: pointer !important;
    border-radius: 5px;
    opacity: 0.8;
    height: 15px;
    width: 15px;
    overflow: hidden;
    background: #191737;
    display: grid;
    place-content: center;

    &.red {
      background: #ac1212;
    }
    &.revealed {
      background: #263063;
    }

    &.not-revealed img {
      opacity: 0.4;
    }

    img {
      width: 9px;
      height: 9px;
    }
  }
}
</style>
