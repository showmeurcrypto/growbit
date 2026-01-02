<template>
  <div
    class="crash-history-element"
    :class="{
      'element-high': crashGetOutcome >= 2,
    }"
  >
    <div class="element-inner">
      <span>{{ crashGetOutcome }}x</span>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "CrashHistoryElement",
  props: ["game"],
  methods: {
    ...mapActions(["modalsSetData", "modalsSetShow"]),
  },
  computed: {
    crashGetOutcome() {
      return parseFloat(this.game.outcome).toFixed(2);
    },
  },
};
</script>

<style scoped>
div.crash-history-element {
  width: 70px;
  height: 35px;
  position: relative;
  flex-shrink: 0;
  margin-right: 4px;
}

div.crash-history-element:last-of-type {
  margin-right: 0;
}

div.crash-history-element .element-inner {
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 1px;
  left: 1px;
  border-radius: 3px;
  background: #22224a;
  z-index: 1;
}

div.crash-history-element.element-high .element-inner {
  border-radius: 3px;
  background: var(--green);
  opacity: 1;
}
Crash div.crash-history-element .element-inner span {
  border-radius: 3px;
  color: white;

  font-weight: 500;
  font-size: 1rem;
}

div.crash-history-element.element-high .element-inner span {
  color: #090c1d;
  border-radius: 3px;
}
</style>
