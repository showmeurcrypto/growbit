<template>
  <div class="provider-dropdown">
    <AppDropdown
      :height="'48px'"
      :items="
        ['all', 'low', 'mid', 'high'].map((s) => ({
          name: 'Volatility ' + s,
          onSelect: () => {
            unboxSetFilterVolatility(s);
          },
        }))
      "
    ></AppDropdown>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppDropdown from "@/components/AppDropdown.vue";

export default {
  name: "UnboxFilterVolatility",
  methods: {
    ...mapActions(["unboxSetFilterVolatility"]),
  },
  computed: {
    ...mapGetters(["unboxFilterVolatility"]),
  },
  components: {
    AppDropdown,
  },
};
</script>

<style scoped lang="scss">
.provider-dropdown {
  width: 100%;
  max-width: 300px;
  @media (max-width: 550px) {
    max-width: 550px;
  }
}
</style>
