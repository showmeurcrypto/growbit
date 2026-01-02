<template>
  <div class="login-forgot">
    <div class="email-content">
      <div class="email-input">
        <input v-model="loginEmail" type="email" placeholder="Enter Email..." />
      </div>
    </div>
    <div class="content-buttons">
      <AppButton
        :click="() => modalResetButton()"
        :disabled="authSendLoginLoading === true"
        :fullwidth="true"
        :height="'50px'"
      >
        Reset
      </AppButton>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";

export default {
  name: "LoginForgot",
  data() {
    return {
      loginEmail: null,
    };
  },
  components: {
    AppButton,
  },
  methods: {
    ...mapActions(["notificationShow", "modalsSetShow", "modalsSetData"]),
    modalResetButton() {
      if (this.loginEmail === null || this.loginEmail.trim() === "") {
        this.notificationShow({
          type: "error",
          message: "Your entered email is invalid.",
        });
        return;
      }

      setTimeout(() => {
        this.modalsSetData({
          typeCaptcha: "credentialsRequest",
          data: { type: "reset", email: this.loginEmail },
        });
        this.modalsSetShow("Captcha");
      }, 200);
    },
  },
  computed: {
    ...mapGetters(["authSendLoginLoading"]),
  },
};
</script>

<style scoped lang="scss">
.login-forgot {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex-grow: 1;

  .content-buttons {
    margin-top: 30px;

    @media screen and (min-width: 991px) {
      margin-top: auto;
    }

    width: 100%;
  }

  .email-content {
    width: 100%;
    margin-top: 15px;

    .email-input {
      width: 100%;
      position: relative;
      margin-top: 5px;

      input {
        width: 100%;
        height: 54px;
        padding: 0 17px;
        color: #fff;
        font-weight: 400;
        font-size: 1.143rem;
        line-height: 23px;
        /* identical to box height */

        border: 2px solid #22224a;
        border-radius: 10px;

        &::placeholder {
          color: #616498;
        }

        &::-moz-placeholder {
          font-weight: 400;
          font-size: 1.143rem;
          color: #616498;
        }
      }
    }
  }
}
</style>
