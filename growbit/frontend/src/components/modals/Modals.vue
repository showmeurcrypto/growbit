<template>
  <div class="modals">
    <transition name="fade">
      <div class="modals-overlay" v-show="modalsShow !== null"></div>
    </transition>
    <transition name="slide-fade" mode="out-in">
      <div
        class="modals-holder"
        v-if="modalsShow !== null && !isMobile"
        v-on:click="modalsCloseButton"
      >
        <div class="holder-body">
          <div class="body-modal">
            <component v-bind:is="'Modal' + modalsShow" />
          </div>
        </div>
      </div>
    </transition>
    <vue-bottom-sheet-vue2
      :z-index="98"
      ref="modalBottom"
      custom-class="bottom-modal"
      :max-width="991"
      :max-height="850"
      @closed="handleBottomSheetClose()"
    >
      <div class="modal-container" v-if="modalsShow !== null">
        <component v-bind:is="'Modal' + modalsShow" />
      </div>
      <div v-else class="placeholder"></div>
    </vue-bottom-sheet-vue2>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ModalCaptcha from "@/components/modals/ModalCaptcha";
import ModalLogin from "@/components/modals/ModalLogin";
import ModalReset from "@/components/modals/ModalReset";
import ModalChatRules from "@/components/modals/ModalChatRules";
import ModalChatUser from "@/components/modals/ModalChatUser";
import ModalRemove from "@/components/modals/ModalRemove";
import ModalMute from "@/components/modals/ModalMute";
import ModalBan from "@/components/modals/ModalBan";
import ModalWallet from "@/components/modals/wallet/ModalWallet.vue";
import ModalTip from "@/components/modals/ModalTip";
import ModalAdminConfirm from "@/components/modals/ModalAdminConfirm";
import ModalAdminUser from "@/components/modals/ModalAdminUser";
import ModalAdminAffiliate from "@/components/modals/ModalAdminAffiliate";
import ModalAdminCrypto from "@/components/modals/ModalAdminCrypto";
import ModalRakeback from "@/components/modals/ModalRakeback.vue";
import ModalGameView from "@/components/modals/game_view/ModalGameView.vue";
import VueBottomSheetVue2 from "@webzlodimir/vue-bottom-sheet-vue2";
import ModalCreateChallenge from "@/components/modals/ModalCreateChallenge.vue";
import ModalProvabilityFair from "@/components/modals/ModalProvabilityFair.vue";
import ModalAffiliate from "@/components/modals/ModalAffiliate.vue";
import ModalBattlesModes from "@/components/modals/ModalBattlesModes.vue";
import ModalBattlesSelect from "@/components/modals/ModalBattlesSelect.vue";

import ModalGamesReport from "@/components/modals/ModalGamesReport.vue";
export default {
  components: {
    ModalBattlesModes,
    ModalBattlesSelect,
    ModalCaptcha,
    ModalLogin,
    ModalReset,
    ModalChatRules,
    ModalChatUser,
    ModalRemove,
    ModalMute,
    ModalBan,
    ModalWallet,
    ModalGamesReport,
    ModalTip,
    ModalProvabilityFair,
    ModalAdminConfirm,
    ModalAdminUser,
    ModalAdminAffiliate,
    ModalAdminCrypto,
    ModalRakeback,
    ModalGameView,
    VueBottomSheetVue2,
    ModalCreateChallenge,
    ModalAffiliate,
  },
  data() {
    return {
      isMobile: null,
    };
  },
  watch: {
    modalsShow: {
      immediate: true,
      handler() {
        if (this.modalsShow && this.isMobile) {
          this.openBottomSheet();
        }
        if (!this.modalsShow && this.isMobile) {
          this.closeBottomSheet();
        }
      },
    },
    isMobile: {
      immediate: true,
      handler() {
        if (this.modalsShow && this.isMobile) {
          this.openBottomSheet();
        }
        if (!this.modalsShow && this.isMobile) {
          this.closeBottomSheet();
        }
      },
    },
  },
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  methods: {
    ...mapActions(["modalsSetShow"]),
    handleBottomSheetClose() {
      this.modalsSetShow(null);
    },
    modalsCloseButton(e) {
      if (
        e.target.className === "modals-holder" ||
        e.target.className === "holder-body"
      ) {
        this.modalsSetShow(null);
        this.closeBottomSheet();
      }
    },
    onResize() {
      this.isMobile = window.innerWidth <= 991;
      if (window.innerWidth > 991) {
        this.closeBottomSheet();
      }
    },
    openBottomSheet() {
      this.$refs.modalBottom?.open();
    },
    closeBottomSheet() {
      this.$refs.modalBottom?.close();
    },
  },
  computed: {
    ...mapGetters(["modalsShow"]),
  },
};
</script>

<style lang="scss">
@use "/src/assets/sass/mixins" as m;

.placeholder {
  height: 800px;
}

.bottom-modal {
  background: #090c1d !important;

  > main {
    background: #090c1d !important;
  }

  > header {
    border-bottom: 1px solid#1E1F44;
    box-shadow: none;
  }
}

.modals {
  position: relative;

  .modal-container {
    max-height: calc(100dvh - 150px);
    //overflow-y: scroll;
    //padding-bottom: 50px;
    width: 100%;
    @include m.hide_scrollbar();
  }
}

.modals .modals-overlay {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #1c202980;
  user-select: none;
  z-index: 101;
  @media (max-width: 991px) {
    display: none;
  }
}

.modals .modals-overlay.fade-enter-active,
.modals .modals-overlay.fade-leave-active {
  transition: opacity 1s ease;
}

.modals .modals-overlay.fade-enter,
.modals .modals-overlay.fade-leave-to {
  opacity: 0;
}

.modals .modals-holder {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  padding: 100px 10px;

  @media (max-width: 991px) {
    display: none;
  }
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  z-index: 102;
}

.modals .modals-holder::-webkit-scrollbar-track {
  background-color: transparent;
}

.modals .modals-holder::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.modals .modals-holder.slide-fade-enter-active,
.modals .modals-holder.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.modals .modals-holder.slide-fade-enter,
.modals .modals-holder.slide-fade-leave-to {
  transform: translate(0, 50px);
  opacity: 0;
}

.modals .holder-body {
  width: 100%;
  display: flex;
  justify-content: center;
}

.modals .body-modal {
  position: relative;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.25);
}

.modals .body-modal button.button-close {
  width: 46px;
  height: 33px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 15px;
  right: 20px;
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.1));
  z-index: 1;
}

.modals .body-modal.modal-square button.button-close {
  top: 15px;
  right: 15px;
}

.modals .body-modal button.button-close .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1c2029;
}

.modals .body-modal.modal-square button.button-close .button-inner {
  background: #0c3351;
}

.modals .body-modal button.button-close .button-inner svg {
  fill: #ddd;
  transition: fill 0.3s ease;
}

.modals .body-modal button.button-close:hover .button-inner svg {
  fill: #ffffff;
}

@media only screen and (max-width: 650px) {
  .body-modal {
    width: 100%;
  }
}
</style>
