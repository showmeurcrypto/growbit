<template>
  <div class="plinko-dropdown-wrapper">
    <AppDropdown
      height="42px"
      :selectedInput="plinkoFilterRows"
      :items="
        [9, 10, 11, 12, 13, 14, 15, 16].map((c) => {
          return { name: c, onSelect: () => this.plinkoSetValue(c) };
        })
      "
      :disabled="plinkoGames.length >= 1"
    ></AppDropdown>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppDropdown from "@/components/AppDropdown.vue";

export default {
  name: "PlinkoFilterRows",
  components: { AppDropdown },
  data() {
    return {};
  },
  methods: {
    ...mapActions(["plinkoSetFilterRows"]),
    plinkoSetValue(value) {
      if (this.plinkoGames.length === 0) {
        this.plinkoSetFilterRows(value);
      }
    },
  },
  computed: {
    ...mapGetters(["plinkoFilterRows", "plinkoGames"]),
  },
};
</script>

<style>
.plinko-dropdown-wrapper div > button {
  border: none !important;
}
</style>
