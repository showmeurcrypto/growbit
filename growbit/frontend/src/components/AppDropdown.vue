<template>
  <div class="dropdown-container" :class="{ 'rows-open': show === true }">
    <button
      @click="toggleDropdown"
      class="button-toggle"
      :style="{ height: height }"
      :disabled="disabled"
    >
      <img
        v-if="items[selected]?.iconCustom"
        class="icon-dropdown selected"
        :src="items[selected]?.iconCustom"
      />

      {{ this.items[selected]?.name }}
      <div class="button-icon">
        <Arrow></Arrow>
      </div>
    </button>
    <transition name="slide">
      <div class="rows-menu" v-if="show === true">
        <div class="menu-inner">
          <button
            v-for="(item, index) in items"
            @click="handleClick(index)"
            :class="{ active: selected === index }"
          >
            <img
              v-if="items[selected].iconCustom"
              class="icon-dropdown selected"
              :src="item.iconCustom"
            />

            {{ item.name }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Arrow from "@/assets/images/arrow.svg?inline";

export default {
  name: "AppDropdown",
  props: ["items", "height", "selectedInput", "disabled"],
  data() {
    return {
      show: false,
      selected: 0,
    };
  },
  created() {
    let N = this.items.length;
    const currPath = this.$route.path;
    for (let i = 0; i < N; i++) {
      if (this.items[i].url) {
        if (currPath.endsWith(this.items[i].url)) {
          this.selected = i;
          break;
        }
      }
    }
  },
  watch: {
    selectedInput: {
      handler: function (val) {
        if (val) {
          const index = this.items.findIndex(
            (item) =>
              (item.value || item.name).toLowerCase?.() === val ||
              (item.value || item.name) === val
          );
          if (index >= 0 && index !== this.selected) {
            this.selected = index;
          }
        }
      },
      immediate: true,
    },
  },
  components: {
    Arrow,
  },
  methods: {
    toggleDropdown() {
      this.show = !this.show;
    },
    handleClick(index) {
      this.selected = index;
      this.show = false;
      if (this.items[index].url) {
        this.$router.push(this.items[index].url);
      }
      if (this.items[index].onSelect) {
        this.items[index].onSelect();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.icon-dropdown {
  margin-right: 10px;
}
.dropdown-container {
  width: 100%;
  position: relative;

  &.rows-open {
    .button-toggle {
      border-color: #616498;
    }
  }
}

.dropdown-container button.button-toggle {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 12px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  height: 56px;
  background: #22224a;
  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 9px;

  .button-icon {
    display: flex;
  }

  > svg {
    margin-bottom: 3px;
  }

  > div {
    margin-left: auto;
  }
}

.dropdown-container button.button-toggle:disabled {
  cursor: not-allowed;
}

.dropdown-container button.button-toggle svg {
  fill: #626c7e;
  transition: all 0.3s ease;
}

.dropdown-container.rows-open button.button-toggle div svg {
  transform: rotate(180deg);
}

.dropdown-container .rows-menu {
  width: 100%;
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 9;
}

.dropdown-container .rows-menu.slide-enter-active,
.dropdown-container .rows-menu.slide-leave-active {
  overflow: hidden;
  transition: height 0.2s ease;
}

.dropdown-container .rows-menu.slide-enter-to,
.dropdown-container .rows-menu.slide-leave {
  height: 370px;
}

.dropdown-container .rows-menu.slide-enter,
.dropdown-container .rows-menu.slide-leave-to {
  height: 0;
}

.dropdown-container .menu-inner {
  width: 100%;
  position: relative;
  padding: 5px 0;
  border-radius: 5px;
  background-color: #22224a;
  max-height: 300px;
  overflow: scroll;
}

.dropdown-container .menu-inner button {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 17px;
  border-radius: 0;
  font-size: 0.857rem;
  font-weight: 600;
  color: #ffffff;
  background-color: transparent;
  border: none;
  transition: all 0.3s ease;

  &:hover,
  &.active {
    background-color: #292950;
  }
}
</style>
