<template>
  <div class="modal-login">
    <div class="top">
      <img src="/img/growbit_text.svg" />
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>

    <div class="login-content">
      <!--       <div class="switch-buttons">
        <button
          @click="modalSetTab('auth')"
          :class="{ active: modalTab === 'auth' }"
        >
          Log In
        </button>
        <button
          @click="modalSetTab('register')"
          :class="{ active: modalTab === 'register' }"
        >
          Register
        </button>
      </div> -->

      <Login v-if="modalTab === 'login'" v-bind:tab="modalTab" />
      <Register v-else-if="modalTab === 'register'" v-bind:tab="modalTab" />
      <LoginForgot v-else-if="modalTab === 'forgot'" v-bind:tab="modalTab" />
    </div>
    <div class="already">
      <span @click="modalSetTab('login')" v-if="modalTab === 'register'"
        >Already have account? <b>Log in</b></span
      >
      <span @click="modalSetTab('register')" v-if="modalTab === 'login'"
        >Don’t have account? <b>Sign up</b></span
      >
      <div
        v-if="modalTab === 'login'"
        class="forgot"
        @click="modalSetTab('forgot')"
      >
        Forgot your password?
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Login from "@/components/auth/Login.vue";
import Register from "@/components/auth/Register.vue";
import LoginForgot from "@/components/auth/LoginForgot";
import AppButton from "@/components/AppButton.vue";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "ModalLogin",
  components: {
    AppButton,
    Login,
    Register,
    LoginForgot,
  },
  data() {
    return {
      modalTab: "login",
      CloseIcon,
    };
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
  created() {
    if (this.modalsData?.authType === "register") {
      this.modalsSetData({ authType: null, code: this.modalsData?.code });
      this.modalSetTab("register");
    }
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData"]),
    modalSetTab(tab) {
      this.modalTab = tab;
    },
  },
};
</script>

<style scoped>
.modal-login {
  width: 650px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  border-radius: 10px;

  .already {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;

    padding: 0 15px 15px 15px;

    font-weight: 500;
    font-size: 1.143rem;

    .forgot {
      cursor: pointer;
      font-weight: 700;
      font-size: 1.143rem;
      color: #ffffff;
    }

    span {
      color: #616498;
      b {
        font-weight: 700;
        font-size: 1.143rem;

        color: #ffffff;

        cursor: pointer;
      }
    }
  }

  @media screen and (min-width: 991px) {
    min-height: 630px;
  }
  @media screen and (max-width: 991px) {
    margin-inline: auto;
    width: 100%;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .top {
    padding: 20px;
    background: #090c1d;
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 15px;

    > img:first-of-type {
      height: 30px;
      @media screen and (max-width: 991px) {
        display: none;
      }
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
}

.switch-buttons {
  display: flex;
  align-items: center;
  justify-content: center;

  > button {
    width: 100%;
    font-style: normal;
    font-weight: 700;
    font-size: 1.143rem;
    line-height: 23px;
    text-align: center;
    color: #616498;
    opacity: 0.5;
    border-bottom: 2px solid #616498;
    padding: 10px;

    &.active {
      border-color: #ffffff;
      color: #ffffff;
    }
  }
}

.login-content {
  width: 100%;
  position: relative;
  padding: 0 15px 15px 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
  @media screen and (max-width: 991px) {
    padding: 0 10px 15px 10px;
  }
}

.modal-login .login-close {
  position: absolute;
  top: -14px;
  right: 12px;
}

.modal-login .login-close button {
  height: 27px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;

  background: #22224a;
}

.modal-login .login-close button:hover {
  color: #fff;
}

.modal-login .login-close button svg {
  margin-right: 8px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-login .login-close button:hover svg {
  fill: #fff;
}
</style>
