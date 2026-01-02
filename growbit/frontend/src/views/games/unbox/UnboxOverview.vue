<template>
  <div class="unbox-overview">
    <transition name="fade" mode="out-in">
      <div
        v-if="socketUnbox.connected === false"
        class="overview-loading"
        key="loading"
      >
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
        <div class="loading-placeholder"></div>
      </div>
      <div
        v-else-if="unboxGetBoxes.length > 0"
        class="overview-list"
        key="data"
      >
        <UnboxBoxElement
          v-for="box of unboxGetBoxes"
          v-bind:key="box._id"
          v-bind:box="box"
        />
      </div>
      <div v-else class="overview-empty" key="empty">There are no cases :(</div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UnboxBoxElement from "@/components/unbox/UnboxBoxElement";

export default {
  name: "UnboxOverview",
  components: {
    UnboxBoxElement,
  },
  computed: {
    ...mapGetters([
      "socketUnbox",
      "unboxFilterSearch",
      "unboxFilterSort",
      "unboxFilterVolatility",
      "unboxFilterSelect",
      "unboxBoxes",
    ]),
    unboxGetBoxes() {
      let search = this.unboxFilterSearch?.toLowerCase().trim();
      let volatility = this.unboxFilterVolatility;
      let sort = this.unboxFilterSort; // Should be 'asc' or 'desc'

      let boxes = this.unboxBoxes.filter((box) => !box.reward);

      if (search) {
        boxes = boxes.filter((box) =>
          box.caseName.toLowerCase().includes(search)
        );
      }

      if (volatility !== "all") {
        boxes = boxes.filter((box) => box.volatility === volatility);
      }

      if (sort === "ascending") {
        boxes = boxes.sort((a, b) => a.casePrice - b.casePrice);
      } else if (sort === "descending") {
        boxes = boxes.sort((a, b) => b.casePrice - a.casePrice);
      }

      return boxes;
    },
  },
};
</script>

<style scoped>
.unbox-overview {
  width: 100%;
}

.unbox-overview .overview-loading,
.unbox-overview .overview-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 35px;
  margin-bottom: 40px;

  @media screen and (max-width: 1500px) {
    gap: 10px;
    grid-template-columns: repeat(5, 1fr);
  }

  @media screen and (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (max-width: 550px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 25px;
  }

  @media screen and (max-width: 450px) {
    grid-template-columns: repeat(1, 1fr);
  }
}

.unbox-overview .overview-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.unbox-overview .overview-loading.fade-leave-to {
  opacity: 0;
}

.unbox-overview .loading-placeholder {
  width: 100%;
  height: 207px;
  position: relative;
  border-radius: 4px;
  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 57%,
      rgba(207, 68, 71, 0.2) 100%
    ),
    #191939;
  overflow: hidden;
}

.unbox-overview .loading-placeholder:nth-child(7n) {
  margin-right: 0;
}

.unbox-overview .overview-empty {
  width: 100%;
  height: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  color: #5e768e;
}

.unbox-overview .overview-list.fade-enter-active,
.unbox-overview .overview-empty.fade-enter-active {
  transition: opacity 0.5s;
}

.unbox-overview .overview-list.fade-enter-from,
.unbox-overview .overview-empty.fade-enter-from {
  opacity: 0;
}

@keyframes loading_animation {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
