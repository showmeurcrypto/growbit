<template>
  <div class="modal-rakeback">
    <div class="top">
      <span>Rakeback</span>
      <div class="close" @click="modalCloseButton()">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="content">
      <Rakeback />
    </div>
  </div>
</template>

<script>
import Rakeback from "@/components/Rakeback.vue";
import CloseIcon from "@/assets/images/close.svg";

import { mapActions } from "vuex";

export default {
  name: "ModalRakeback",
  created() {},
  components: {
    Rakeback,
  },
  data() {
    return {
      CloseIcon,
    };
  },
  computed: {},
  methods: {
    ...mapActions(["notificationShow", "modalsSetShow"]),
    modalCloseButton() {
      this.modalsSetShow(null);
    },
  },
};
</script>

<style scoped lang="scss">
@use "/src/assets/sass/mixins" as m;

.modal-rakeback {
  max-width: 550px;
  @media screen and (max-width: 991px) {
    max-width: 100%;
  }
  border-radius: 18px;
  border: 4px solid #090c1d;
  background: var(--dark-blue);

  @media screen and (max-width: 991px) {
    background: transparent;
  }

  .top {
    padding: 30px;
    background: #090c1d;
    height: 80px;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 15px;

    span {
      font-weight: 900;
      font-size: 1.714rem;
    }

    .close {
      width: 40px;
      height: 40px;
      background: #22224a;
      border-radius: 8px;
      display: grid;
      cursor: pointer;
      place-content: center;
      margin-left: auto;
    }

    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .content {
    padding: 20px;
    @media screen and (max-width: 991px) {
      padding: 10px 5px 10px 5px;
    }
  }
}
</style>
