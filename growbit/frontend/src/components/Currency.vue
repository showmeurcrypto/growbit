<template>
  <img
    class="currency"
    :src="`/img/currencies/${selectedCurrency}.${
      selectedCurrency === 'DLS' ? 'png' : 'svg'
    }`"
    alt="icon"
  />
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Currency",
  components: {},
  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapGetters(["generalSettings", "authUser", "selectedCurrency"]),
  },
  created() {},
};
</script>

<style scoped lang="scss">
img.currency {
  height: 20px;
  width: 20px;
}
</style>
