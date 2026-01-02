<template>
  <div class="registration">
    <!-- Step 1: Credentials -->
    <div v-if="step === 1" class="login-credientials">
      <div class="email-content">
        <div class="email-title required">Name</div>
        <div class="email-input name-input">
          <input
            minlength="3"
            maxlength="20"
            v-model="username"
            pattern="^[a-zA-Z0-9]+$"
            type="text"
            placeholder="Enter Name..."
            required
          />
        </div>
      </div>
      <div class="email-content">
        <div class="email-title required">Email</div>
        <div class="email-input">
          <input
            v-model="email"
            type="email"
            placeholder="Enter Email..."
            required
          />
        </div>
      </div>
      <div class="password-content">
        <div class="password-title required">Password</div>
        <div class="password-input">
          <input
            v-model="password"
            required
            :type="showPass ? 'text' : 'password'"
            placeholder="Enter Password..."
          />
          <EyeIcon @click="togglePasswordVisibility" />
        </div>
      </div>
      <div class="password-content">
        <div class="password-title required">Repeat Password</div>
        <div class="password-input">
          <input
            required
            v-model="passwordCfm"
            :type="showPass ? 'text' : 'password'"
            placeholder="Repeat Password..."
          />
          <EyeIcon @click="togglePasswordVisibility" />
        </div>
      </div>
      <div class="email-content" style="margin-bottom: 35px">
        <div class="email-title">
          Code <span class="optional">(Optional)</span>
        </div>
        <div class="email-input">
          <input
            :disabled="disableRef"
            v-model="code"
            type="text"
            placeholder="Affiliate Code..."
          />
        </div>
      </div>
      <div class="content-buttons">
        <AppButton
          :fullwidth="true"
          :click="proceedToTerms"
          :height="'50px'"
          :disabled="!valid"
          >Continue</AppButton
        >
      </div>
    </div>

    <!-- Step 2: Terms and Conditions -->
    <div v-if="step === 2" class="terms-step">
      <h1>Create account</h1>

      <div class="terms-content">
        <LoadingAnimation v-if="loadingTos"></LoadingAnimation>
        {{ tos }}
      </div>

      <div class="agree-checkbox">
        <input type="checkbox" v-model="termsAccepted" />
        <label>I agree to the Terms and Conditions</label>
      </div>
      <div class="content-buttons">
        <AppButton
          :fullwidth="true"
          :click="register"
          :height="'50px'"
          :disabled="!termsAccepted"
          >Register</AppButton
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import EyeIcon from "@/assets/images/eye.svg?inline";
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "Register",
  props: ["tab"],
  created() {
    let code = sessionStorage.getItem("code");
    if (code) {
      this.code = code;
      this.disableRef = true;
    }
    this.loadingTos = true;

    axios
      .get("tos.txt", { baseURL: null })
      .then(({ data }) => {
        this.tos = data;
        this.loadingTos = false;
      })
      .catch((e) => {
        console.error(e);
        this.loadingTos = false;
        this.tos = "Error";
      });
  },
  data() {
    return {
      step: 1,
      tos: "",
      disableRef: false,
      USERNAME_REGEX: /^[a-zA-Z0-9]+$/,
      loadingTos: false,
      username: null,
      email: null,
      password: null,
      code: null,
      passwordCfm: null,
      showPass: false,
      termsAccepted: false,
    };
  },
  components: {
    LoadingAnimation,
    AppButton,
    EyeIcon,
  },
  methods: {
    ...mapActions([
      "modalsSetShow",
      "modalsSetData",
      "notificationShow",
      "authSendCredentialsLogin",
    ]),
    togglePasswordVisibility() {
      this.showPass = !this.showPass;
    },
    proceedToTerms() {
      this.step = 2; // Move to terms step
    },

    register() {
      if (
        this.username === null ||
        this.username.trim() === "" ||
        !this.username.trim().match(this.USERNAME_REGEX)
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered name is invalid.",
        });
        return;
      }
      if (this.username.length < 3) {
        this.notificationShow({
          type: "error",
          message: "Your entered name should be at least 3 charaters.",
        });
        return;
      }

      if (this.email === null || this.email.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered email is invalid.",
        });
        return;
      }

      const [local, domain] = this.email.trim().split("@");

      if (domain !== "gmail.com") {
        this.notificationShow({
          type: "error",
          message: "Email must be Gmail.",
        });
        return;
      }

      if (this.password === null || this.password.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered password is invalid.",
        });
        return;
      }

      if (this.password !== this.passwordCfm) {
        this.notificationShow({
          type: "error",
          message: "Your entered passwords does not match.",
        });
        return;
      }

      this.modalsSetData({
        typeCaptcha: "credentialsRegister",
        data: {
          username: this.username,
          email: this.email,
          password: this.password,
          code: this.code,
        },
      });

      setTimeout(() => {
        this.modalsSetShow("Captcha");
      }, 200);
    },
  },
  computed: {
    ...mapGetters(["authSendLoginLoading", "modalsData"]),
    valid() {
      if (
        !this.username ||
        this.username.trim() === "" ||
        !this.username.trim().match(this.USERNAME_REGEX)
      ) {
        return false;
      }
      if (this.username.length < 3) {
        return false;
      }

      if (this.password !== this.passwordCfm) {
        return false;
      }

      return !(this.email === null || this.email.trim() === "");
    },
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

.optional {
  font-weight: 500;
  font-size: 1.143rem;

  color: #616498;
}

.modal-login .login-credientials {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex-grow: 1;
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

.required::after {
  content: " *";
  color: #ae2445;
}

.modal-login .email-input {
  width: 100%;
  position: relative;
  margin-top: 5px;
}

.modal-login .email-input input {
  width: 100%;
  padding-left: 15px;
  padding-right: 5px;
  height: 51px;
  border: 2px solid #22224a;
  border-radius: 10px;
  font-style: normal;
  font-weight: 400;
  font-size: 1.143rem;
  color: var(--purple-2);

  &:user-invalid {
    border: 1px solid var(--red);
  }
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
  border: 2px solid #22224a;
  border-radius: 10px;
  color: var(--purple-2);
  padding-right: 10px;

  &:user-invalid {
    border: 1px solid var(--red);
  }

  svg {
    cursor: pointer;
  }
}

.modal-login .password-input input {
  width: 100%;
  padding-left: 15px;
  padding-right: 5px;
  height: 51px;
  color: var(--purple-2);

  font-style: normal;
  font-weight: 400;
  font-size: 1.143rem;
}

.terms-step {
  h1 {
    font-weight: 700;
    font-size: 1.29rem;

    color: #eeeeee;
    margin-top: 10px;
    margin-bottom: 7px;
  }

  .terms-content {
    overflow: scroll;
    max-height: 400px;

    font-weight: 500;
    font-size: 1.143rem;
    padding: 10px;
    white-space: pre-wrap; /* Preserves spaces and line breaks */
    color: #616498;

    background: #1d1c44;
    border: 2px solid #22224a;
    border-radius: 10px;
  }

  .agree-checkbox {
    display: flex;
    align-items: center;
    gap: 15px;

    input[type="checkbox"] {
      cursor: pointer;
      transform: scale(1.2);
    }

    label {
      font-weight: 500;
      font-size: 0.857rem;

      color: #635b8f;
    }

    margin-top: 15px;
    margin-bottom: 25px;
  }
}
</style>
