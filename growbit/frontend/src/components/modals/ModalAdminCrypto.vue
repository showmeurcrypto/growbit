<template>
  <div class="modal-admin-crypto">
    <div class="modal-close">
      <button v-on:click="modalsSetShow(null)">
        <img src="@/assets/images/close.svg" />
      </button>
    </div>
    <div class="modal-content">
      <div class="crypto-element element-currency">
        <div class="element-title">Crypto amount</div>
        <div class="element-content">
          <div class="content-inner">
            {{ modalsData.transaction.data.cryptoAmount.toFixed(8) }}
          </div>
          <img
            :src="
              '/img/cashier/' +
              modalsData.transaction.data.currency.toLowerCase() +
              '.png'
            "
            alt="icon"
          />
          <button
            v-on:click="
              modalCopyButton(
                modalsData.transaction.data.cryptoAmount.toFixed(8)
              )
            "
            class="button-copy"
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.16493 13.7385C4.51414 13.7385 3.17051 12.3949 3.17051 10.7441V3.52246H1.93758C0.868744 3.52246 0 4.39108 0 5.45991V14.9715C0 16.0403 0.868744 16.909 1.93758 16.909H10.7445C11.8133 16.909 12.6821 16.0403 12.6821 14.9715V13.7385H6.16493Z"
              />
              <path
                d="M15.5004 1.93758C15.5004 0.867325 14.6331 0 13.563 0H6.16512C5.09486 0 4.22754 0.867325 4.22754 1.93758V10.7445C4.22754 11.8147 5.09486 12.6821 6.16512 12.6821H13.563C14.6331 12.6821 15.5004 11.8147 15.5004 10.7445V1.93758Z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="crypto-element">
        <div class="element-title">Address</div>
        <div class="element-content">
          <div class="content-inner">
            {{ modalsData.transaction.data.receiver }}
          </div>
          <button
            v-on:click="modalCopyButton(modalsData.transaction.data.receiver)"
            class="button-copy"
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.16493 13.7385C4.51414 13.7385 3.17051 12.3949 3.17051 10.7441V3.52246H1.93758C0.868744 3.52246 0 4.39108 0 5.45991V14.9715C0 16.0403 0.868744 16.909 1.93758 16.909H10.7445C11.8133 16.909 12.6821 16.0403 12.6821 14.9715V13.7385H6.16493Z"
              />
              <path
                d="M15.5004 1.93758C15.5004 0.867325 14.6331 0 13.563 0H6.16512C5.09486 0 4.22754 0.867325 4.22754 1.93758V10.7445C4.22754 11.8147 5.09486 12.6821 6.16512 12.6821H13.563C14.6331 12.6821 15.5004 11.8147 15.5004 10.7445V1.93758Z"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- <div class="crypto-element">
                <div class="element-title">TRANSACTION HASH</div>
                <div class="element-content">
                    <input v-model="modalTransactionHash" type="text" placeholder="ENTER TRANSACTION HASH..." />
                </div>
            </div> -->
      <div class="crypto-buttons">
        <button
          v-on:click="modalApproveButton()"
          class="button-approve"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">APPROVE</div>
        </button>
        <button v-on:click="modalCancelButton()" class="button-cancel">
          <div class="button-inner">CANCEL</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ModalAdminCrypto",
  data() {
    return {
      // modalTransactionHash: null
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "modalsSetData",
      "adminSendCashierCryptoActionSocket",
    ]),
    modalCopyButton(value) {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      this.notificationShow({
        type: "success",
        message: "Copied to your clipboard.",
      });
    },
    modalApproveButton() {
      // if (this.modalTransactionHash === null || this.modalTransactionHash.trim() === '') {
      //     this.notificationShow({ type: 'error', message: 'Your entered transaction hash is invalid.' });
      //     return;
      // }

      // const data = { action: 'approve', transactionId: this.modalsData.transaction._id, transactionHash: this.modalTransactionHash };
      console.log("transaction: ", this.modalsData.transaction);
      const data = {
        action: "approve",
        transactionId: this.modalsData.transaction._id,
      };
      this.adminSendCashierCryptoActionSocket(data);
      this.modalsSetShow(null);
    },
    modalCancelButton() {
      this.modalsSetShow(null);
      this.modalsSetData({
        typeConfirm: "cryptoAction",
        messageConfirm:
          "Please confirm that you want cancel the crypto transaction.",
        data: {
          action: "cancel",
          transactionId: this.modalsData.transaction._id,
        },
      });

      setTimeout(() => {
        this.modalsSetShow("AdminConfirm");
      }, 200);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData"]),
  },
};
</script>

<style scoped>
.modal-admin-crypto {
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
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 5px;
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

.modal-admin-crypto .crypto-element {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 35px;
}

.modal-admin-crypto .element-title {
  font-size: 1rem;
  font-weight: 800;
}

.modal-admin-crypto .element-content {
  width: 100%;
  height: 60px;
  position: relative;
  margin-top: 10px;
  padding: 1px;
}

.modal-admin-crypto .element-content img {
  width: 22px;
  height: 22px;
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translate(0, -50%);
}

.modal-admin-crypto .content-inner,
.modal-admin-crypto .element-content input {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-size: 1.143rem;
  font-weight: 600;
  color: #fff;
  background: #22224a;

  border-radius: 8px;
}

.modal-admin-crypto .crypto-element.element-currency .content-inner {
  padding: 0 15px 0 44px;
}

.modal-admin-crypto .element-content input::placeholder {
}

.modal-admin-crypto .element-content button.button-copy {
  position: absolute;
  top: 50%;
  right: 22px;
  transform: translate(0, -50%);
}

.modal-admin-crypto .element-content button.button-copy svg {
  width: 20px;
  height: auto;
  fill: #767c8b;
  transition: fill 0.3s ease;
}

.modal-admin-crypto .element-content button.button-copy:hover svg {
  fill: #ffffff;
}

.modal-admin-crypto .crypto-buttons {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.modal-admin-crypto button.button-approve,
.modal-admin-crypto button.button-cancel {
  width: 190px;
  height: 48px;
  margin-top: 20px;
}

.modal-admin-crypto button.button-approve {
  margin-right: 12px;
}

.modal-admin-crypto button.button-approve .button-inner,
.modal-admin-crypto button.button-cancel .button-inner {
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
}

.modal-admin-crypto button.button-approve .button-inner {
  background: var(--purple);
}

.modal-admin-crypto button.button-cancel .button-inner {
  background: #fe524a;
  border-bottom: 2px solid #db382f;
}

@media only screen and (max-width: 740px) {
  .modal-admin-crypto {
    width: calc(100vw - 20px);
    padding: 35px 10px 30px 10px;
  }
}

@media only screen and (max-width: 500px) {
  .modal-admin-crypto {
    padding: 65px 10px 30px 10px;
  }
}
</style>
