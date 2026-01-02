<template>
  <div class="provider-dropdown">
    <AppDropdown
      :height="'48px'"
      :items="
        ['ascending', 'descending'].map((s) => ({
          name: 'Price ' + s,
          onSelect: () => {
            unboxSetFilterSort(s === 'ascending' ? 'ascending' : 'descending');
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
  name: "UnboxFilterSort",
  methods: {
    ...mapActions(["unboxSetFilterSort"]),
  },
  computed: {
    ...mapGetters(["unboxFilterSort"]),
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
