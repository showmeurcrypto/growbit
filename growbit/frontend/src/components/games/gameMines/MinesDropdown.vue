<template>
  <div
    class="plinko-filter-rows"
    v-bind:class="{ 'rows-open': dropdown === true }"
  >
    <button
      v-on:click="toggleDropdown"
      class="button-toggle"
      v-bind:disabled="minesGame !== null && minesGame.state !== 'completed'"
    >
      {{ minesCount }}
      <BombIcon></BombIcon>
      <div class="button-icon">
        <ChevronIcon></ChevronIcon>
      </div>
    </button>
    <transition name="slide">
      <div class="rows-menu" v-if="dropdown === true">
        <div class="menu-inner">
          <button
            v-for="c of [1, 3, 5, 10]"
            @click="set(c)"
            v-bind:disabled="
              minesGame !== null && minesGame.state !== 'completed'
            "
            :class="{ active: minesCount === c }"
          >
            {{ c }}
            <BombIcon></BombIcon>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import BombIcon from "@/assets/images/bomb_icon.svg?inline";
import ChevronIcon from "@/assets/images/arrow.svg?inline";

export default {
  name: "MinesDropdown",
  props: ["minesSetCount", "minesCount"],
  data() {
    return {
      dropdown: false,
    };
  },
  components: {
    BombIcon,
    ChevronIcon,
  },
  methods: {
    set(count) {
      this.dropdown = false;
      this.minesSetCount(count);
    },
    toggleDropdown() {
      this.dropdown = !this.dropdown;
    },
  },
  computed: {
    ...mapGetters(["minesGame"]),
  },
};
</script>

<style scoped lang="scss">
.plinko-filter-rows {
  width: 100%;
  position: relative;
}

.plinko-filter-rows button.button-toggle {
  width: 100%;
  height: 47px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 17px;
  font-weight: 700;
  color: #ffffff;
  background: #22224a;
  border-radius: 5px;
  font-weight: 700;
  font-size: 1.143rem;

  gap: 10px;

  .button-icon {
    display: grid;
    place-content: center;
  }

  > svg {
    margin-bottom: 3px;
  }

  > div {
    margin-left: auto;
  }
}

.plinko-filter-rows button.button-toggle:disabled {
  cursor: not-allowed;
}

.plinko-filter-rows button.button-toggle svg {
  fill: #626c7e;
  transition: all 0.3s ease;
}

.plinko-filter-rows.rows-open button.button-toggle div svg {
  transform: rotate(180deg);
}

.plinko-filter-rows .rows-menu {
  width: 100%;
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 9;
}

.plinko-filter-rows .rows-menu.slide-enter-active,
.plinko-filter-rows .rows-menu.slide-leave-active {
  overflow: hidden;
  transition: height 0.2s ease;
}

.plinko-filter-rows .rows-menu.slide-enter-to,
.plinko-filter-rows .rows-menu.slide-leave {
  height: 370px;
}

.plinko-filter-rows .rows-menu.slide-enter,
.plinko-filter-rows .rows-menu.slide-leave-to {
  height: 0;
}

.plinko-filter-rows .menu-inner {
  width: 100%;
  position: relative;
  padding: 5px 0;
  border-radius: 5px;
  background-color: #22224a;
}

.plinko-filter-rows .menu-inner button {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 17px;
  border-radius: 0;
  justify-content: space-between;

  color: #ffffff;
  background-color: transparent;
  border: none;
  transition: all 0.3s ease;

  font-weight: 700;
  font-size: 1.143rem;

  &:hover,
  &.active {
    background-color: #292950;
  }
}
</style>
