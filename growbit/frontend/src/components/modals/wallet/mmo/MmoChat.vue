<template>
  <div class="mmo-wallet">
    <div class="mobile-top-menu">
      <InboxIcon /> <span>Cashier Chat </span>
      <div class="info" @click="toggle"><SettingsIcon /></div>
    </div>

    <div v-if="!(isMobile && !showTicketInfo)" class="deposit-info">
      <label>Order ID</label>
      <div class="field">
        {{ ticket._id }}
      </div>

      <label>Currency Type</label>
      <div class="field">
        {{ ticket.currency }}
      </div>
      <label>Amount</label>
      <div class="currency-conversion-inner">
        <div class="currency-input field">
          {{ ticket.currencyAmount }}
        </div>
        <img src="../../../../assets/images/equals.svg" />
        <div class="currency-input field">
          {{ ticket.currencyAmount }}
          <img src="@/assets/images/mmo_coin.png" alt="currency" />
        </div>
      </div>

      <div class="line"></div>

      <div class="info">
        <label>Some helpful information</label>

        <p>
          1. Cashier will inform you where the trade will take place and which
          username to trade.
        </p>
        <p>
          2. Before accepting the trade please confirm in chat that you’re in
          fact trading one of the cashiers.
        </p>
        <p>
          3. You should see your balance update on the site within a few seconds
          (If it did not update, message support).
        </p>
      </div>

      <AppButton :click="() => cancel()" :red="true">Cancel Order</AppButton>
    </div>

    <SupportChat
      :on-send="(msg) => sendMessage(msg)"
      :ticket="ticket"
    ></SupportChat>
  </div>
</template>

<script>
import AppButton from "@/components/AppButton.vue";
import SupportChat from "@/components/modals/wallet/mmo/chat/SupportChat.vue";
import InboxIcon from "@/assets/images/inbox.svg?inline";
import SettingsIcon from "@/assets/images/setting.svg?inline";
export default {
  props: ["ticket", "cancel", "send"],
  data() {
    return {
      isMobile: true,
      showTicketInfo: false,
    };
  },
  components: { AppButton, SupportChat, InboxIcon, SettingsIcon },
  computed: {},
  watch: {},
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  methods: {
    sendMessage(msg) {
      this.send(msg);
    },
    toggle() {
      this.showTicketInfo = !this.showTicketInfo;
    },
    onResize() {
      this.isMobile = window.innerWidth <= 991;
    },
  },
};
</script>

<style lang="scss" scoped>
.mmo-wallet {
  width: 100%;
  display: flex;

  @media (max-width: 991px) {
    flex-direction: column;
    min-height: calc(100vh - 160px);
    background-color: var(--dark-blue);
  }

  .mobile-top-menu {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 15px;
    width: 100%;
    gap: 12px;
    height: 70px;
    background: #090c1d;

    span {
      font-weight: 700;
      font-size: 1.429rem;
      color: #eeeeee;
    }

    .info {
      display: grid;
      place-content: center;
      width: 40px;
      height: 40px;
      background: #22224a;
      border: 2px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      margin-left: auto;
      cursor: pointer;

      svg path {
        fill: white;
      }
    }

    @media screen and (min-width: 991px) {
      display: none;
    }
  }

  .deposit-info {
    width: 40%;
    @media screen and (max-width: 991px) {
      width: 100%;
    }
    padding: 20px;
    background: var(--dark-blue-2);
    display: flex;
    flex-direction: column;

    .line {
      width: 100%;
      height: 0px;
      margin-top: 10px;
      margin-bottom: 25px;

      border: 3px solid #22224a;
    }

    label {
      font-style: normal;
      font-weight: 700;
      font-size: 1.29rem;
      margin-bottom: 5px;
    }

    .info {
      width: 100%;
      height: fit-content;
      background: #22224a;
      border-radius: 10px;
      padding: 20px 20px 5px 20px;

      p {
        font-weight: 400;
        font-size: 1.143rem;

        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 15px;
      }

      margin-bottom: 40px;
    }

    .field {
      display: flex;
      width: 100%;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 5px 15px;
      height: 56px;
      background: #22224a;
      border-radius: 10px;

      font-style: normal;
      font-weight: 700;
      font-size: 1.143rem;

      color: #eeeeee;
      margin-bottom: 15px;
    }

    .currency-conversion-inner {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      margin-bottom: 15px;

      .currency-input {
        justify-content: space-between;
        margin-bottom: 0;
      }
    }
  }
}
</style>
