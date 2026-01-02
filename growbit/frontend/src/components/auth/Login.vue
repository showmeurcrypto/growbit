<template>
  <form class="login-credientials" @submit.prevent="loginAction()">
    <div class="email-content">
      <div class="email-title">Email or Username</div>
      <div class="email-input">
        <input
          v-model="loginEmail"
          type="text"
          placeholder="Enter username or email..."
          required
        />
      </div>
    </div>
    <div class="password-content">
      <div class="password-title">Password</div>
      <div class="password-input">
        <input
          required
          v-model="loginPassword"
          :type="showPass ? 'text' : 'password'"
          placeholder="Enter Password..."
        />
        <EyeIcon @click="showPass = !showPass" />
      </div>
    </div>

    <div class="content-buttons">
      <AppButton :fullwidth="true" :click="() => {}" :height="'50px'"
        >Log In</AppButton
      >
    </div>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import EyeIcon from "@/assets/images/eye.svg?inline";

export default {
  name: "Login",
  components: { AppButton, EyeIcon },
  props: ["tab"],
  data() {
    return {
      loginEmail: null,
      loginPassword: null,
      showPass: false,
    };
  },
  methods: {
    ...mapActions([
      "modalsSetShow",
      "modalsSetData",
      "notificationShow",
      "authSendCredentialsLogin",
      "authSendCredentialsRegister",
    ]),
    loginAction() {
      if (this.loginEmail === null || this.loginEmail.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered email is invalid.",
        });
        return;
      }

      if (this.loginPassword === null || this.loginPassword.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered password is invalid.",
        });
        return;
      }

      this.modalsSetData({
        typeCaptcha: "credentialsLogin",
        data: { email: this.loginEmail, password: this.loginPassword },
      });

      setTimeout(() => {
        this.modalsSetShow("Captcha");
      }, 200);
    },
    loginTermsButton() {
      this.modalsSetShow(null);
      setTimeout(() => {
        this.modalsSetShow("Terms");
      }, 300);
    },
  },
  computed: {
    ...mapGetters(["authSendLoginLoading"]),
  },
};
</script>

<style scoped lang="scss">
input::placeholder {
  color: #616498;
}

.content-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 30px;
  @media screen and (min-width: 991px) {
    margin-top: auto;
  }
}

.modal-login .login-credientials {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
  align-items: center;
}

.modal-login .content-title {
  /* text-transform: uppercase; */
  font-size: 26px;
  font-weight: 600;
  color: #fff;
}

.modal-login .email-content {
  width: 100%;
  margin-top: 15px;
}

.email-content .email-title {
  font-weight: 700;
  font-size: 1.29rem;
  color: #eeeeee;
}

.modal-login .email-input {
  width: 100%;
  position: relative;
  margin-top: 5px;
}

.modal-login .email-input input {
  width: 100%;
  font-style: normal;
  font-weight: 400;
  font-size: 1.143rem;
  color: var(--purple-2);
  padding-left: 15px;
  height: 51px;
  border: 2px solid #22224a;
  border-radius: 10px;
}

.modal-login .password-content {
  width: 100%;
  margin-top: 15px;
}

.password-content .password-title {
  font-weight: 700;
  font-size: 1.29rem;
  color: #eeeeee;
}

.modal-login .password-input {
  width: 100%;
  position: relative;
  margin-top: 5px;
  display: flex;
  align-items: center;
  padding-left: 15px;
  padding-right: 10px;
  height: 51px;
  border: 2px solid #22224a;
  border-radius: 10px;

  svg {
    cursor: pointer;
  }
}

.modal-login .password-input input {
  width: 100%;
  font-style: normal;
  font-weight: 400;
  font-size: 1.143rem;
  color: var(--purple-2);
}

.modal-login .content-info {
  margin-top: 10px;

  font-family: Poppins;
  font-size: 10.673px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
  text-transform: uppercase;
}

.modal-login .content-buttons .button-register {
  border-radius: 9.583px;
  background: #222833;
  padding: 10px 18px;

  text-shadow: 0px 3.833px 3.833px rgba(0, 0, 0, 0.23);
  font-family: Poppins;
  font-size: 16.291px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.489px;
  text-transform: uppercase;
}

.modal-login .content-buttons .button-register:hover {
  color: #fff;
}

@media only screen and (max-width: 450px) {
  .modal-login .content-button,
  .modal-login .content-input {
    width: 100%;
  }
}
</style>
