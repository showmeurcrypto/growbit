<template>
  <div class="modal-reset">
    <div class="top_menu">
      <div class="title">Reset Password</div>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="tip-container">
      <label>Password</label>
      <input class="password" placeholder="Password" v-model="modalPassword" />
      <label>Repeat Password</label>
      <input
        class="passwordcfm"
        placeholder="Repeat password"
        v-model="modalPasswordConfirm"
      />

      <app-button :fullwidth="true" :click="resetPassword" :height="'50px'">
        Reset Password
      </app-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Currency from "@/components/Currency.vue";
import AppButton from "@/components/AppButton.vue";
import CloseIcon from "@/assets/images/close.svg";
export default {
  name: "ModalReset",
  components: { AppButton, Currency },
  data() {
    return {
      CloseIcon,
      modalPassword: null,
      modalPasswordConfirm: null,
    };
  },
  methods: {
    ...mapActions(["notificationShow", "modalsSetShow", "modalsSetData"]),
    resetPassword() {
      if (this.modalPassword === null || this.modalPassword.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered password is invalid.",
        });
        return;
      }

      if (this.modalPassword !== this.modalPasswordConfirm) {
        this.notificationShow({
          type: "error",
          message: "Your entered passwords does not match.",
        });
        return;
      }

      this.modalsSetData({
        typeCaptcha: "credentialsReset",
        data: { ...this.modalsData, password: this.modalPassword },
      });
      this.modalsSetShow(null);

      setTimeout(() => {
        this.modalsSetShow("Captcha");
      }, 200);
    },
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
};
</script>

<style scoped>
.modal-reset {
  width: 700px;
  display: flex;
  justify-content: center;
  border-radius: 18px;
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  display: flex;
  flex-direction: column;

  .title {
    font-style: normal;
    font-weight: 900;
    font-size: 24px;
    line-height: 34px;
    color: #eeeeee;
  }

  @media screen and (max-width: 991px) {
    width: 100%;
    background: transparent;
  }

  .tip-container {
    padding: 30px;
    @media screen and (max-width: 991px) {
      padding: 15px;
    }

    width: 100%;

    label {
      font-weight: 700;
      font-size: 1.29rem;
      margin-bottom: 10px;

      color: #eeeeee;
    }
    .info {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 15px;
      gap: 15px;
      margin-bottom: 30px;
      @media screen and (max-width: 991px) {
        margin-bottom: 15px;
      }
      border: 1px dashed #f7be2c;
      border-radius: 10px;

      span {
        font-weight: bold;
        margin-right: 5px;
        color: var(--orange);
      }
    }
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    button {
      margin-top: auto;
    }

    input {
      font-size: 1.143rem;
      padding-inline: 10px;
      height: 56px;
      border: 2px solid #22224a;
      border-radius: 10px;
      margin-bottom: 15px;
      @media screen and (max-width: 991px) {
        background: #161533;
        height: 50px;
      }

      &:last-of-type {
        margin-bottom: 35px;
      }
    }
  }
}

.top_menu {
  display: flex;
  justify-content: flex-start;
  height: 80px;
  align-items: center;
  padding: 15px;
  background: #090c1d;
  flex-direction: row;
  gap: 15px;
  border-radius: 15px 15px 0 0;

  @media screen and (max-width: 991px) {
    display: none;
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
}
</style>
