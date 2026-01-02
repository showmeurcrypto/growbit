<template>
  <div class="modal-credit" :class="{ selected: selected || tab === TIP }">
    <div class="wallet-container">
      <div class="top_menu">
        <app-button
          :secondary="tab !== DEPOSIT"
          :click="() => (tab = DEPOSIT)"
          :disabled="this.growtopiaTransaction.inProgress"
          >Deposit</app-button
        >
        <app-button
          :secondary="tab !== WITHDRAW"
          :click="() => selectTab(WITHDRAW)"
          :disabled="this.growtopiaTransaction.inProgress"
          >Withdraw</app-button
        >
        <app-button
          :secondary="tab !== TIP"
          :click="() => selectTab(TIP)"
          :disabled="this.growtopiaTransaction.inProgress"
          >Tip</app-button
        >
        <div class="close" @click="modalCloseButton()">
          <img :src="CloseIcon" alt="Close" />
        </div>
        <!--        <div v-if="selected" class="back" @click="goBack()">-->
        <!--          <img :src="BackIcon" alt="Back" />-->
        <!--        </div>-->
      </div>

      <div class="top_menu_mobile" v-if="!selected">
        <AppDropdown
          height="45px"
          :items="dropdown"
          :selected-input="tab"
        ></AppDropdown>
      </div>

      <Tip v-if="tab === TIP"></Tip>
      <div v-else-if="!selected" class="opt">
        <LoadingAnimation v-if="cashierCryptoData.loading"></LoadingAnimation>
        <div v-for="group in structure">
          <label>{{ group.text }}</label>
          <div class="items">
            <div
              @click="select(item)"
              :class="`wallet-item ${item.value}`"
              v-for="item in group.options"
            >
              <img :src="item.icon" />
              <span>{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="selected" class="wallet-action">
        <div
          :style="{
            width: '100%',
            display:
              tab === DEPOSIT && selected?.group === CRYPTO ? 'block' : 'none',
          }"
        >
          <CashierCryptoDepositItem
            :go-back="goBack"
            :currency="selected.text"
          ></CashierCryptoDepositItem>
        </div>

        <MmoTransactions
          :transaction-type="tab"
          :go-back="goBack"
          v-if="selected?.group === INGAME_CURR && selected?.id !== 'Growtopia'"
          :currency="selected"
        ></MmoTransactions>
        <growtopia-items
          v-if="tab === DEPOSIT && selected?.id === 'Growtopia'"
          :game="selected"
          :go-back="goBack"
        ></growtopia-items>
        <CashierCryptoWithdrawItem
          v-if="tab === WITHDRAW && selected?.group === CRYPTO"
          :currency="selected.text"
          :go-back="goBack"
        ></CashierCryptoWithdrawItem>
        <withdraw-growtopia-items
          v-if="tab === WITHDRAW && selected?.id === 'Growtopia'"
          :go-back="goBack"
          :game="selected"
        ></withdraw-growtopia-items>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ButtonLoading from "@/components/ButtonLoading.vue";

import Crypto from "@/assets/images/crypto.svg";
import Box from "@/assets/images/box.svg";
import CloseIcon from "@/assets/images/close.svg";
import BackIcon from "@/assets/images/undo.svg";
import Arrow from "@/assets/images/arrow.svg";
import PromoIcon from "@/assets/images/promo.svg";
import Runescape3 from "@/assets/images/runescape3.svg";
import WowIcon from "@/assets/images/wow.png";
import AppButton from "@/components/AppButton.vue";
import WithdrawGrowtopiaItems from "@/components/modals/wallet/growtopia/WithdrawGrowtopiaItems.vue";
import GrowtopiaItems from "@/components/modals/wallet/growtopia/GrowtopiaItems.vue";
import CashierCryptoDepositItem from "@/components/modals/wallet/crypto/CashierCryptoDepositItem.vue";
import CashierCryptoWithdrawItem from "@/components/modals/wallet/crypto/CashierCryptoWithdrawItem.vue";
import MmoTransactions from "@/components/modals/wallet/mmo/MmoTransactions.vue";
import AppDropdown from "@/components/AppDropdown.vue";
import Tip from "@/components/modals/wallet/Tip.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

const GrowtopiaIcon = "/img/growtopia/blue_gem_lock.png";

const DEPOSIT = "deposit";
const PROMOCODE = "promocode";
const TIP = "tip";
const WITHDRAW = "withdraw";
const INGAME_CURR = "Video-game currency";
const INGAME_ITEMS = "Ingame items";
const CRYPTO = "Crypto currency";

export default {
  name: "ModalWallet",
  components: {
    LoadingAnimation,
    CashierCryptoDepositItem,
    CashierCryptoWithdrawItem,
    ButtonLoading,
    GrowtopiaItems,
    MmoTransactions,
    WithdrawGrowtopiaItems,
    Tip,
    AppButton,
    AppDropdown,
  },
  data() {
    return {
      modalAmount: 0,
      DEPOSIT,
      WITHDRAW,
      INGAME_CURR,
      INGAME_ITEMS,
      CRYPTO,
      PROMOCODE,
      TIP,
      CloseIcon,
      WowIcon,
      Runescape3,
      BackIcon,
      PromoIcon,
      GrowtopiaIcon,
      selected: null,
      showNetwork: new Set(["USDT"]),
      LTC_OPTION: {
        icon: `/img/cashier/ltc.png`,
        text: "LTC",
        value: "LTC",
        style: "",
        group: CRYPTO,
      },
      Arrow,
      tab: DEPOSIT,
      dropdown: [
        {
          name: "Deposit",
          onSelect: () => this.selectTab(DEPOSIT),
        },
        {
          name: "Withdraw",
          onSelect: () => this.selectTab(WITHDRAW),
        },
        {
          name: "Tip",
          onSelect: () => this.selectTab(TIP),
        },
      ],
    };
  },
  created() {
    this.cashierGetCryptoDataSocket();
    this.cashierGetGrowtopiaActiveTransactions();
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "cashierSendCreditDepositSocket",
      "cashierGetCryptoDataSocket",
      "cashierGetGrowtopiaActiveTransactions",
    ]),
    modalCloseButton() {
      this.modalsSetShow(null);
    },
    goBack() {
      if (
        this.growtopiaTransaction.inProgress ||
        this.growtopiaTransaction.loading
      ) {
        return;
      }
      this.selected = null;
    },

    selectTab(tab) {
      if (
        this.growtopiaTransaction.inProgress ||
        this.growtopiaTransaction.loading
      ) {
        return;
      }

      if (tab === WITHDRAW && this.selected?.group === CRYPTO) {
        this.selected = this.LTC_OPTION;
      }
      this.tab = tab;
    },
    select(select) {
      if (
        this.growtopiaTransaction.inProgress ||
        this.growtopiaTransaction.loading
      ) {
        return;
      }
      this.selected = select;
    },
  },
  watch: {
    growtopiaTransaction: {
      immediate: true,
      deep: true,
      handler(state, oldState) {
        if (
          state.inProgress &&
          (this.selected?.id != "Growtopia" || this.tab != state.type)
        ) {
          this.selected = {
            text: "Growtopia",
            id: "Growtopia",
            group: INGAME_CURR,
            icon: GrowtopiaIcon,
          };
          this.tab = state.type;
        }
      },
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "modalsData",
      "cashierCryptoData",
      "growtopiaTransaction",
    ]),
    structure() {
      return [
        {
          text: INGAME_CURR,
          icon: Box,
          bg: null,
          options: [
            {
              text: "Growtopia",
              value: "Growtopia",
              id: "Growtopia",
              group: INGAME_CURR,
              icon: GrowtopiaIcon,
            },
            // {
            //   text: "RS3 Gold",
            //   id: "rs3_gold",
            //   group: INGAME_CURR,
            //   icon: Runescape3,
            // },
            // {
            //   text: "WOW Gold",
            //   id: "wow_gold",
            //   group: INGAME_CURR,
            //   icon: WowIcon,
            // },
          ],
        },
        {
          text: CRYPTO,
          icon: Crypto,
          bg: null,
          options:
            this.tab === WITHDRAW
              ? [this.LTC_OPTION]
              : (this.cashierCryptoData.addresses || []).map((currency) => {
                  return {
                    icon: `/img/cashier/${currency.name.toLowerCase()}.png`,
                    text: this.showNetwork.has(currency.name)
                      ? `${currency.name} (${currency.network})`
                      : currency.name,
                    value: currency.name,
                    style: "",
                    group: CRYPTO,
                  };
                }),
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-credit {
  width: 1000px;

  &.selected {
    @media (min-width: 991px) {
      width: 700px;
    }
  }

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--dark-blue);
  border-radius: 15px;
  border: 4px solid #090c1d;

  @media (max-width: 991px) {
    width: 100%;
    background: #090c1d;
  }
  .items {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .back,
  .close {
    width: 40px;
    height: 40px;
    background: #22224a;
    border-radius: 8px;
    display: grid;
    cursor: pointer;
    place-content: center;
  }

  .close {
    margin-left: auto;
  }
}

.select-wrapper {
  width: 100%;
  @media (min-width: 991px) {
    display: none;
  }
}

.cashier-select-wrapper {
  width: 100%;
  margin-bottom: 25px;
  color: #f7be2c;
}

.select-wrapper {
  width: 100%;
  @media (min-width: 991px) {
    display: none;
  }
}

.cashier-select-wrapper {
  width: 100%;
  margin-bottom: 25px;
  color: #f7be2c;
}

.wallet-container {
  height: fit-content;
  display: flex;
  width: 100%;
  z-index: 5;
  flex-direction: column;
  overflow: scroll;

  .wallet-action {
    display: flex;
    flex-grow: 1;
    align-items: center;
    flex-direction: column;
  }

  .top_menu_mobile {
    display: flex;
    flex-direction: row;
    gap: 15px;
    padding: 15px;

    @media screen and (min-width: 991px) {
      display: none;
    }
  }

  .top_menu {
    padding: 30px;
    background: #090c1d;
    display: flex;
    height: 80px;
    align-items: center;
    flex-direction: row;
    gap: 15px;

    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .opt {
    padding: 30px;
    @media (max-width: 991px) {
      padding: 15px;
    }

    > div {
      display: flex;
      flex-direction: column;

      > label {
        margin-bottom: 20px;
        font-family: "Excon";
        font-style: normal;
        font-weight: 700;
        font-size: 1.429rem;
        line-height: 28px;
        color: #eeeeee;
      }

      margin-bottom: 30px;
    }
  }

  .wallet-item {
    width: 170px;
    gap: 25px;

    background: #22224a;
    cursor: pointer;
    border: 2px solid #00a2ff;

    border-radius: 10px;
    padding: 25px 19px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    @media (max-width: 991px) {
      max-width: 45%;
      gap: 10px;
      padding: 15px 10px;
    }
    span {
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
      text-transform: capitalize;
    }

    img {
      width: 35px;
      height: 35px;
      border-radius: 10px;
    }

    &.BCH {
      border: 2px solid #0eb98b; /* Bitcoin Cash */
    }

    &.BNB {
      border: 2px solid #f3ba2f; /* Binance Coin */
    }

    &.BTC {
      border: 2px solid #f7931a; /* Bitcoin */
    }

    &.DOGE {
      border: 2px solid #c2a633; /* Dogecoin */
    }

    &.DOGS {
      border: 2px solid #6c757d; /* Dogs */
    }

    &.LTC {
      border: 2px solid #345d9d; /* Litecoin */
    }

    &.NOT {
      border: 2px solid #000000; /* Not Coin */
    }

    &.POL {
      border: 2px solid #8247e5; /* Polygon */
    }

    &.SHIB {
      border: 2px solid #fbaa28; /* Shiba Inu */
    }

    &.SOL {
      border: 2px solid #3a87ff; /* Solana */
    }

    &.TON {
      border: 2px solid #0098ff; /* Toncoin */
    }

    &.TRX {
      border: 2px solid #eb0029; /* TRON */
    }

    &.USDT {
      border: 2px solid #26a17b; /* Tether */
    }

    &.USDC {
      border: 2px solid #2775ca; /* USD Coin */
    }

    &.XMR {
      border: 2px solid #f26822; /* Monero */
    }
  }

  .promo-item {
    width: fit-content;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 15px;
    gap: 25px;
    background: #22224a;
    border: 2px solid #090c1d;
    border-radius: 10px;

    span {
      font-family: "Excon";
      font-style: normal;
      font-weight: 700;
      font-size: 1.29rem;
      color: #eeeeee;
    }
  }
}
</style>
