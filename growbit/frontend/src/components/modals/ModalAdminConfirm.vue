<template>
  <div class="modal-admin-confirm">
    <div class="modal-close">
      <button v-on:click="modalsSetShow(null)">
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.0005 1.22222L9.77827 0L5.50019 4.27808L1.22222 0.000111474L0 1.22233L4.27797 5.5003L0.000501987 9.77776L1.22272 11L5.50019 6.72252L9.77776 11.0001L11 9.77788L6.72241 5.5003L11.0005 1.22222Z"
          ></path>
        </svg>
        CLOSE
      </button>
    </div>
    <div class="modal-title">Admin Confirm</div>
    <div class="modal-content">
      <div class="confirm-info">{{ modalsData.messageConfirm }}</div>
      <button
        v-on:click="modalConfirmButton()"
        class="button-confirm"
        v-bind:disabled="socketSendLoading !== null"
      >
        <div class="button-inner">CONFIRM ACTION</div>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ModalAdminConfirm",
  methods: {
    ...mapActions(["modalsSetShow", "adminSendCashierCryptoActionSocket"]),
    modalConfirmButton() {
      const data = { ...this.modalsData.data };

      if (this.modalsData.typeConfirm === "cryptoAction") {
        this.adminSendCashierCryptoActionSocket(data);
      }

      this.modalsSetShow(null);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData"]),
  },
};
</script>

<style scoped>
.modal-admin-confirm {
  width: 720px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 20px 44px 20px;
  border-radius: 18px;
  background: #191939;
  border-top: 32px solid transparent;
  border-bottom: 32px solid transparent;
}

.modal-close {
  position: absolute;
  top: -14px;
  right: 12px;
}

.modal-close button {
  height: 27px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;

  background: #22224a;
}

.modal-close button:hover {
  color: #fff;
}

.modal-close button svg {
  margin-right: 8px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-close button:hover svg {
  fill: #fff;
}

.modal-title {
  text-transform: uppercase;
  font-size: 26px;
  font-weight: 800;
  color: #eeeeee;
}

.modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-admin-confirm .confirm-info {
  width: 100%;
  margin-top: 12px;
  text-align: center;
  font-size: 1.143rem;
  font-weight: 600;
}

.modal-admin-confirm button.button-confirm {
  width: 200px;
  height: 48px;
  margin-top: 20px;
  filter: drop-shadow(0px 4px 25px rgba(1, 230, 169, 0.15))
    drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.35));
}

.modal-admin-confirm button.button-confirm .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  transition: all 0.3s ease;
  background: var(--purple);
}

@media only screen and (max-width: 740px) {
  .modal-admin-confirm {
    width: calc(100vw - 20px);
    padding: 35px 10px 30px 10px;
  }
}

@media only screen and (max-width: 500px) {
  .modal-admin-confirm {
    padding: 65px 10px 30px 10px;
  }
}
</style>
