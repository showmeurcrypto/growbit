<template>
  <div class="unbox-header-box">
    <router-link class="link-back" to="/cases">
      <div class="link-inner">Back</div>
    </router-link>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "UnboxHeaderBox",
  data() {
    return {};
  },
  methods: {
    ...mapActions(["notificationShow", "modalsSetShow"]),
    unboxFairButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      this.modalsSetShow("FairSeed");
    },
  },
  computed: {
    ...mapGetters(["authUser", "unboxBoxData"]),
  },
};
</script>

<style scoped>
.unbox-header-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 25px;
}
</style>
