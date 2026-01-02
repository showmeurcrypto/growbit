<template>
  <div class="modal-tip">
    <div class="top_menu">
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="tip-container">
      <!--      <div class="info">-->
      <!--        <img src="@/assets/images/warning.svg" />-->
      <!--        <div>-->
      <!--          <span>PLEASE NOTE:</span>By sending a tip, you acknowledge that a-->
      <!--          small tax of 1% will be going to charity. Thanks for understanding!-->
      <!--        </div>-->
      <!--      </div>-->
      <label>Username</label>
      <input
        class="username"
        placeholder="Username"
        :value="generalUserInfo.data.username"
        disabled="disabled"
      />
      <label>Amount</label>

      <div class="amount">
        <input v-model="amount" placeholder="Enter amount" type="number" />
        <Currency></Currency>
        <!-- <img src="@/assets/images/mmo_coin.png" alt="currency" /> -->
      </div>

      <app-button :fullwidth="true" :click="sendTip" :height="'50px'">
        Send Tip
      </app-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";
import ButtonLoading from "@/components/ButtonLoading";
import CloseIcon from "@/assets/images/close.svg";
import AppButton from "@/components/AppButton.vue";
import Avatar from "@/components/Avatar.vue";
import Currency from "@/components/Currency.vue";

export default {
  name: "ModalTip",
  components: {
    AvatarImage,
    ButtonLoading,
    AppButton,
    Avatar,
    Currency,
  },
  data() {
    return {
      CloseIcon,
      amount: 0.0,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "userSendUserTipSocket",
      "modalsSetShow",
    ]),
    sendTip() {
      const amount = this.amount / this.fiatRates.data[this.selectedCurrency];

      if (amount === undefined || isNaN(amount) === true || amount <= 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered tip amount is invalid.",
        });
        return;
      }

      const data = {
        receiverId: this.generalUserInfo.data._id,
        amount: amount,
        amountInSelectedCurrency: this.amount,
        selectedCurrency: this.selectedCurrency,
      };
      this.userSendUserTipSocket(data);
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "modalsData",
      "generalUserInfo",
      "fiatRates",
      "selectedCurrency",
    ]),
  },
};
</script>

<style scoped>
.modal-tip {
  width: 700px;
  display: flex;
  justify-content: center;
  border-radius: 18px;
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 991px) {
    width: 100%;
    background: transparent;
  }

  input {
    font-size: 1.143rem;
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

    .username {
      padding-inline: 10px;
      height: 56px;
      border: 2px solid #22224a;
      border-radius: 10px;
      margin-bottom: 15px;
      @media screen and (max-width: 991px) {
        background: #161533;
        height: 50px;
      }
    }

    .amount {
      color: white;

      display: flex;
      align-items: center;
      padding-inline: 10px;
      height: 56px;
      border: 2px solid #22224a;
      border-radius: 10px;
      margin-bottom: 30px;

      @media screen and (max-width: 991px) {
        background: #161533;
        height: 50px;
      }

      input {
        border: 0;
      }
      img {
        margin-left: auto;
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
