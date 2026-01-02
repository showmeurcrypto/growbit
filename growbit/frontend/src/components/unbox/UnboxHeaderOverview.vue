<template>
  <div class="unbox-header-overview">
    <div class="overview-filter">
      <UnboxFilterSearch />
      <UnboxFilterVolatility />
      <UnboxFilterSort />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UnboxFilterSearch from "@/components/unbox/UnboxFilterSearch";
import UnboxFilterSort from "@/components/unbox/UnboxFilterSort";
import UnboxFilterVolatility from "@/components/unbox/UnboxFilterVolatility";

export default {
  name: "UnboxHeaderOverview",
  components: {
    UnboxFilterSearch,
    UnboxFilterSort,
    UnboxFilterVolatility,
  },
  methods: {
    ...mapActions(["unboxSetFilterSelect"]),
  },
  computed: {
    ...mapGetters(["unboxFilterSelect"]),
  },
};
</script>

<style scoped>
.unbox-header-overview {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.unbox-header-overview .overview-title {
  display: flex;
  align-items: center;
  padding-bottom: 25px;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.unbox-header-overview .overview-title svg {
  margin-right: 8px;
}

.unbox-header-overview .overview-select {
  width: calc(100% - 625px);
  display: flex;
  align-items: center;
  margin-left: 35px;
  padding-bottom: 25px;
}

.unbox-header-overview .overview-select button.button-select {
  height: 45px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-right: 25px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(110, 149, 182, 0.5);
  transition: color 0.3s ease;
}

.unbox-header-overview .overview-select button.button-select:last-child {
  margin-right: 0;
}

.unbox-header-overview .overview-select button.button-select.button-active {
  color: #ffffff;
}

.unbox-header-overview
  .overview-select
  button.button-select.button-active::after {
  content: "";
  width: 100%;
  height: 1px;
  position: absolute;
  left: 0;
  bottom: -27px;
  background: linear-gradient(146deg, #6170f1 0%, #1c47b6 100%);
}

.unbox-header-overview .overview-select button.button-select svg {
  margin-bottom: 7px;
  fill: rgba(110, 149, 182, 0.5);
  transition: all 0.3s ease;
}

.unbox-header-overview .overview-select button.button-select.button-active svg {
  fill: #6170f1;
  filter: drop-shadow(0px 2px 25px #5267e4);
}

.unbox-header-overview .overview-filter {
  display: flex;
  width: 100%;
  gap: 15px;
  padding-bottom: 25px;
  > div {
    width: 100%;
  }
  @media (max-width: 550px) {
    flex-direction: column;
  }
}

@media only screen and (max-width: 900px) {
}
</style>
