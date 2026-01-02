<template>
  <div class="modal-captcha">
    <div class="top">
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="captcha-content">
      <div class="content-title">Captcha</div>
      <div class="content-captcha">
        <VueHcaptcha
          ref="modalCaptcha"
          v-bind:sitekey="modalCaptchaKey"
          @verify="modalOnVerify"
          @expired="modalOnExpire"
          @challengeExpired="modalOnExpire"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import VueHcaptcha from "@hcaptcha/vue-hcaptcha";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "ModalCaptcha",
  components: {
    VueHcaptcha,
  },
  data() {
    return {
      modalCaptchaKey: process.env.VUE_APP_HCAPTCHA_KEY,
      CloseIcon,
    };
  },
  methods: {
    ...mapActions([
      "modalsSetShow",
      "authSendCredentialsLogin",
      "authSendCredentialsRegister",
      "authSendCredentialsReset",
      "authSendCredentialsRequest",
      "generalSendPromoClaimSocket",
    ]),
    modalOnVerify(token, eKey) {
      const data = { ...this.modalsData.data, captcha: token };

      if (this.modalsData.typeCaptcha === "credentialsLogin") {
        this.authSendCredentialsLogin(data);
      } else if (this.modalsData.typeCaptcha === "credentialsRegister") {
        this.authSendCredentialsRegister(data);
      } else if (this.modalsData.typeCaptcha === "credentialsRequest") {
        this.authSendCredentialsRequest(data);
      } else if (this.modalsData.typeCaptcha === "credentialsReset") {
        this.authSendCredentialsReset(data);
      } else if (this.modalsData.typeCaptcha === "promoClaim") {
        this.generalSendPromoClaimSocket(data);
      }

      this.modalsSetShow(null);
    },
    modalOnExpire() {
      this.modalsSetShow(null);
    },
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
  mounted() {
    this.$refs.modalCaptcha.reset();
  },
};
</script>

<style scoped>
.modal-captcha {
  width: 620px;
  position: relative;
  justify-content: center;
  padding: 0;

  display: flex;

  @media screen and (min-width: 991px) {
    border-radius: 18px;
    border: 4px solid #090c1d;
    background: var(--dark-blue);
  }
  flex-direction: column;
  .top {
    padding: 30px;
    background: #090c1d;
    display: flex;
    flex-direction: row;
    gap: 15px;
    border-radius: 15px 15px 0 0;

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
}

.modal-captcha .captcha-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.modal-captcha .content-title {
  text-transform: uppercase;
  font-size: 26px;
  font-weight: 800;
  color: #eeeeee;
}

.modal-captcha .content-captcha {
  width: 303px;
  height: 78px;
  margin-top: 25px;
  border-radius: 3px;
  background: #22224a;
}

@media only screen and (max-width: 650px) {
  .modal-captcha {
    width: 100%;
  }
}

@media only screen and (max-width: 450px) {
  .modal-captcha .captcha-content {
    padding: 0 20px;
  }
}
</style>
