<template>
  <div v-if="!captcha" class="deposit-growtopia-container">
    <div class="header-wallet">
      <div class="back" @click="goBack()">
        <img src="@/assets/images/back.svg" />
        <span>Back</span>
      </div>
      <div class="curr">
        Growtopia Locks <img :src="`/img/growtopia/blue_gem_lock.png`" />
      </div>
    </div>

    <div class="deposit-info" @click="howToExpanded = !howToExpanded">
      <div><span>How to deposit locks ?</span> <img :src="Arrow" /></div>
      <ol v-if="howToExpanded">
        <li>
          Type in your Growtopia GrowID that you would like to deposit with,
          then press 'Start Deposit'.
        </li>
        <li>
          Wait for the loading to complete (it may take up to 30 seconds).
        </li>
        <li>
          Enter the generated world in Growtopia. (make sure that the world
          owner is in the world before dropping your locks).
        </li>
        <li>
          Drop the amount of
          <img class="icon" src="/img/growtopia/world_lock.png" />/<img
            src="/img/growtopia/diamond_lock.png"
            class="icon"
          />/<img class="icon" src="/img/growtopia/blue_gem_lock.png" />you wish
          to deposit next to the white door.
        </li>
        <li>
          You should see your balance update on the site within a few seconds
          (If it did not update, message support).
        </li>
      </ol>
    </div>

    <label
      v-if="!(growtopiaTransaction.inProgress || growtopiaTransaction.loading)"
      class="title"
      >Player GrowID</label
    >
    <input
      v-if="!(growtopiaTransaction.inProgress || growtopiaTransaction.loading)"
      required
      v-model="growId"
      type="text"
      placeholder="Enter your Grow Id here"
      class="grow_id"
    />
    <LoadingAnimation v-if="growtopiaTransaction.loading"></LoadingAnimation>
    <span class="loading-txt" v-if="growtopiaTransaction.loading"
      >Loading...This may take up to 90 seconds</span
    >

    <label v-if="growtopiaTransaction.inProgress">The bot is waiting in</label>
    <div class="world" v-if="growtopiaTransaction.inProgress">
      {{ growtopiaTransaction.world }}
    </div>
    <p v-if="growtopiaTransaction.inProgress">
      Enter the world and drop the amount of locks you wish to deposit.
    </p>
    <div v-if="growtopiaTransaction.inProgress" class="info">
      <img src="@/assets/images/triangle.svg" />
      <div>
        <span>WARNING:</span>Never share the world with people you don’t trust.
        We are not responsible for any loss due to others picking your locks or
        items up.
      </div>
    </div>
    <div
      v-if="!growtopiaTransaction.inProgress && !growtopiaTransaction.loading"
      class="min_max"
    >
      <div>
        <span>Minimum deposit is </span><span>0.20</span
        ><img class="icon" src="/img/growtopia/diamond_lock.png" />
      </div>
      <div>
        <span>Maximum deposit at once is</span><span>10</span
        ><img class="icon" src="/img/growtopia/blue_gem_lock.png" />
      </div>
    </div>
    <app-button
      v-if="!growtopiaTransaction.inProgress && !growtopiaTransaction.loading"
      :fullwidth="true"
      :disabled="!enabled"
      :click="() => startDeposit()"
      :size="'1.714rem'"
      :height="'50px'"
    >
      Deposit
    </app-button>
  </div>
  <div v-else class="captcha">
    <VueHcaptcha
      ref="modalCaptcha"
      v-bind:sitekey="modalCaptchaKey"
      @verify="modalOnVerify"
      @expired="modalOnExpire"
      @challengeExpired="modalOnExpire"
    />
  </div>
</template>

<script>
import MmobitCoin from "@/assets/images/mmo_coin.png";
import Arrow from "@/assets/images/arrow.svg";
import AppButton from "@/components/AppButton.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { mapActions, mapGetters } from "vuex";
import VueHcaptcha from "@hcaptcha/vue-hcaptcha";

export default {
  data() {
    return {
      MmobitCoin,
      Arrow,
      growId: "",
      howToExpanded: false,
      captcha: false,
      modalCaptchaKey: process.env.VUE_APP_HCAPTCHA_KEY,
    };
  },
  computed: {
    ...mapGetters(["growtopiaTransaction", "generalSettings"]),
    enabled() {
      let value = this.generalSettings;
      for (let key of "growtopia.deposit.enabled".split(".")) {
        if (!value) {
          return true;
        }
        value = value[key];
      }
      return value;
    },
  },
  components: { LoadingAnimation, AppButton, VueHcaptcha },
  methods: {
    ...mapActions(["cashierSendGrowtopiaDepositSocket", "notificationShow"]),
    startDeposit() {
      if (!this.growId?.trim()) {
        this.notificationShow({
          type: "error",
          message: "Invalid growId",
        });
      } else {
        this.captcha = true;
      }
    },
    modalOnVerify(token, eKey) {
      this.cashierSendGrowtopiaDepositSocket({
        growId: this.growId?.trim(),
        captcha: token,
      });
      this.captcha = false;
    },
    modalOnExpire() {
      this.captcha = false;
    },
  },
  props: ["game", "gameId", "goBack"],
};
</script>

<style lang="scss" scoped>
.captcha {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}
.deposit-growtopia-container {
  padding: 30px;
  @media screen and (max-width: 991px) {
    padding: 10px;
  }

  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 15px;
    padding: 15px;
    gap: 15px;
    margin-bottom: 15px;
    @media screen and (max-width: 991px) {
      margin-bottom: 15px;
    }
    border: 1px dashed #ae2445;
    border-radius: 10px;

    span {
      font-weight: bold;
      margin-right: 5px;
      color: #ae2445;
    }
  }

  width: 100%;

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 1.29rem;
    color: #eeeeee;

    @media screen and (max-width: 991px) {
      font-weight: 700;
      font-size: 1rem;

      color: #eeeeee;
    }
  }

  .header-wallet {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;

    .back {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;

      span {
        font-style: normal;
        font-weight: 700;
        font-size: 1.429rem;
        color: #eeeeee;
      }

      @media screen and (max-width: 991px) {
        width: 45px;
        height: 45px;
        background: #22224a;
        border: 2px solid rgba(255, 255, 255, 0.07);
        border-radius: 8px;
        justify-content: center;

        span {
          display: none;
        }
      }
    }

    .curr {
      font-style: normal;
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
      display: flex;
      align-items: center;
      gap: 15px;

      img {
        height: 35px;
      }
    }
  }

  img.icon {
    height: 15px;
    width: 15px;
    margin-inline: 5px;
  }

  .min_max {
    margin-top: 5px;
    justify-content: space-between;

    display: flex;

    @media screen and (max-width: 991px) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
      width: 100%;
      gap: 5px;
      margin-bottom: 20px;
    }

    > div {
      span:nth-of-type(1) {
        font-weight: 500;
        font-size: 1rem;
      }

      span:nth-of-type(2) {
        margin-left: 5px;

        font-weight: 700;
        font-size: 1rem;
      }
    }
  }

  label {
    margin-top: 5px;
    display: block;

    margin-bottom: 5px;

    font-style: normal;
    font-weight: 700;
    font-size: 1.143rem;

    color: rgba(255, 255, 255, 0.5);
  }

  input,
  div.world {
    border-radius: 10px;
    margin-bottom: 10px;
    height: 56px;
    width: 100%;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    font-size: 1.143rem;

    background: #22224a;

    @media screen and (max-width: 991px) {
      background: #161533;
      height: 50px;
    }
  }

  .grow_id::placeholder {
    font-weight: 400;
    font-size: 1.143rem;
    line-height: 23px;
    color: #616498;
  }

  .loading-txt {
    margin-left: 15px;
  }
}

.deposit-info {
  margin-top: 15px;
  padding: 15px 15px 10px 15px;
  border-radius: 10px;
  min-height: 56px;
  @media screen and (max-width: 991px) {
    padding: 12px 15px 10px 15px;
    min-height: 50px;
  }
  background: #22224a;

  > div {
    cursor: pointer;
    display: flex;
    justify-content: space-between;

    & > span {
      font-style: normal;
      font-weight: 700;
      font-size: 1.143rem;
      color: #eeeeee;
    }
  }

  ol {
    padding-left: 15px;
    margin-top: 10px;
    list-style-type: decimal;

    li {
      margin-bottom: 8px;
      font-weight: 400;
      font-size: 1.143rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  margin-bottom: 8px;
}

button {
  margin-top: 15px;
  @media screen and (max-width: 991px) {
    margin-top: auto;
  }
}
</style>
