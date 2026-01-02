<template>
  <div class="crash-history">
    <transition-group class="history-list" name="list" tag="div">
      <CrashHistoryElement
        v-for="game of crashHistory"
        v-bind:key="game._id"
        v-bind:game="game"
      />
    </transition-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import CrashHistoryElement from "@/components/games/crash/CrashHistoryElement.vue";

export default {
  name: "CrashHistory",
  components: {
    CrashHistoryElement,
  },
  computed: {
    ...mapGetters(["crashHistory"]),
  },
};
</script>

<style scoped>
.crash-history {
  width: calc(100% - 20px);
  height: 35px;
  position: absolute;
  margin-top: 15px;
  top: 0;
  overflow: hidden;
  left: 15px;
}

/*.crash-history::after {
  content: "";
  width: 200px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(7, 44, 68, 0) 0%, #22224a 100%);
  z-index: 1;
}*/

.crash-history .history-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.crash-history .list-enter-active {
  transition: all 0.5s;
}

.crash-history .list-enter {
  opacity: 0;
  transform: translateX(-15px);
}

@media only screen and (max-width: 1140px) {
  .crash-history {
    margin-top: 10px;
  }
}
</style>
