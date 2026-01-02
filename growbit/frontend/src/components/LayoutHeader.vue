<template>
  <header>
    <div class="fixed">
      <div class="container">
        <div class="header-container">
          <div class="inner-container">
            <router-link to="/" as="div" class="flex-grow">
              <img class="logo-large" :src="Logo" />
              <img class="logo-small" :src="LogoSmall" />
            </router-link>
            <div class="switcher"></div>
            <div class="wallet" v-if="authUser?.user">
              <div class="money">
                <span class="ingame" v-if="playingSlots">(In Game)</span>

                <img
                  @click="show = !show"
                  v-if="!playingSlots"
                  :src="`/img/currencies/${selectedCurrency}.${
                    selectedCurrency === 'DLS' ? 'png' : 'svg'
                  }`"
                  alt=""
                />
                <span
                  class="balance-value"
                  :style="balanceWidth"
                  @click="show = !show"
                  v-if="!playingSlots"
                  >{{ getSymbol(selectedCurrency) + balance }}</span
                >
                <ArrowIcon
                  v-if="!playingSlots"
                  @click="show = !show"
                  class="chevron"
                >
                </ArrowIcon>

                <transition name="slide">
                  <div class="rows-menu" v-if="show === true">
                    <div class="menu-inner">
                      <button
                        @click="pickCurrency(item.currency)"
                        v-for="(item, index) in balances"
                        :class="{ active: item.currency === selectedCurrency }"
                      >
                        <span>{{ item.balance }}</span>
                        <img
                          :src="`/img/currencies/${item.currency}.${
                            item.currency === 'DLS' ? 'png' : 'svg'
                          }`"
                          alt=""
                        />
                      </button>
                    </div>
                  </div>
                </transition>

                <transition-group
                  v-if="!playingSlots"
                  mode="out-in"
                  name="balance-a"
                  :style="{ position: 'absolute' }"
                >
                  <span
                    :key="`key-${i}`"
                    v-for="(animate, i) in animated"
                    class="animated"
                  >
                    <span
                      :class="`color-${
                        animate.action === 'subtract' ? 'red' : 'green'
                      }`"
                      class="balance-value"
                    >
                      {{ getSymbol(selectedCurrency) + animate.diff }}
                    </span>
                  </span>
                </transition-group>
              </div>

              <app-button
                :click="
                  () => modalsSetShow(modalsShow === 'Wallet' ? null : 'Wallet')
                "
                :size="'16px'"
                :height="'33px'"
                :radius="'8px'"
              >
                <div>
                  <span class="wallet-txt-desktop">Deposit</span>
                  <span class="wallet-txt-mobile">+</span>
                </div>
              </app-button>
            </div>
            <div
              v-if="!authUser?.user"
              :class="`right justify-content-end flex-grow auth-btns ${
                !authUser?.user ? 'ml-auto' : ''
              }`"
            >
              <button
                @click="modalsSetShow('Login')"
                class="btn btn-transparent register-btn"
              >
                Login
              </button>
              <app-button
                :click="
                  () => {
                    modalsSetData({ authType: 'register' });
                    modalsSetShow('Login');
                  }
                "
                :height="'34px'"
                :size="'16px'"
              >
                Register
              </app-button>
            </div>
            <div v-else class="right flex-grow justify-content-end">
              <!--               <div
                v-if="authUser?.user"
                @click="
                  modalsSetShow(modalsShow === 'Rakeback' ? null : 'Rakeback')
                "
                :class="{ good: rakebackAvailable }"
              >
                <MagnetIcon></MagnetIcon>
              </div> -->
              <div
                @click="generalToggleChat()"
                class="hide-on-mobile"
                :class="{ selected: generalChat && !supportChat }"
              >
                <ChatIcon></ChatIcon>
              </div>
              <div
                v-if="authUser?.user"
                @click="generalToggleSupport()"
                class="hide-on-mobile"
                :class="{ selected: supportChat }"
              >
                <PhoneIcon></PhoneIcon>
              </div>
              <router-link
                v-if="authUser?.user"
                tag="div"
                :to="`/profile`"
                class="hide-on-mobile"
                :class="{ notifications: hasProfileNotifications }"
              >
                <UserIcon></UserIcon>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TokenIcon from "@/assets/images/mmo_coin.png";
import MagnetIcon from "@/assets/images/magnet.svg?inline";
import ChatIcon from "@/assets/images/Chat_alt.svg?inline";
import PhoneIcon from "@/assets/images/phone.svg?inline";
import UserIcon from "@/assets/images/User_fill.svg?inline";
import ArrowIcon from "@/assets/images/arrow.svg?inline";

import AppButton from "@/components/AppButton.vue";
import Logo from "@/assets/images/logo.webp";
import LogoSmall from "@/assets/images/Growbit_G.webp";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";

export default {
  mixins: [currencyExchangeRatesMixin],
  computed: {
    ...mapGetters([
      "authUser",
      "hasProfileNotifications",
      "supportChat",
      "generalChat",
      "fiatRates",
      "selectedCurrency",
      "rakebackData",
      "modalsShow",
      "authUser",
    ]),
    // rakebackAvailable() {
    //   const data = this.rakebackData?.rakeback;

    //   if (!data) {
    //     return false;
    //   }

    //   for (const r of data) {
    //     if (!r.lastClaimed) return true;
    //     const claimIntervals = {
    //       daily: 24 * 60 * 60 * 1000,
    //       weekly: 7 * 24 * 60 * 60 * 1000,
    //       monthly: 30 * 24 * 60 * 60 * 1000,
    //     };

    //     if (
    //       new Date(new Date(r.lastClaimed).getTime() + claimIntervals[r.type]) <
    //       new Date()
    //     ) {
    //       return true;
    //     }
    //   }

    //   return false;
    // },
    rakebackAvailable() {
      let rakeback = this.rakebackData?.rakeback;

      if (!rakeback) {
        return false;
      }

      const today = new Date();
      const claimIntervals = {
        daily: this.getNextDayInMiliseconds(),
        weekly: this.getNextWeekInMiliseconds(),
        monthly: this.getNextMonthInMiliseconds(),
      };

      for (const r of rakeback) {
        if (
          r.type === "daily" &&
          r.lastClaimed &&
          !this.isSameDay(new Date(r.lastClaimed), today) &&
          r.available >= 0.1
        ) {
          return true;
        } else if (!r.lastClaimed) {
          if (r.available > 0.1) {
            return true;
          }
        } else if (
          r.type === "weekly" &&
          r.lastClaimed &&
          !this.isSameWeek(new Date(r.lastClaimed), today) &&
          r.available >= 0.1
        ) {
          return true;
        } else if (!r.lastClaimed) {
          if (r.available > 0.1) {
            return true;
          }
        }

        if (
          r.type === "monthly" &&
          r.lastClaimed &&
          !this.isSameMonth(new Date(r.lastClaimed), today) &&
          r.available >= 0.1
        ) {
          return true;
        } else if (!r.lastClaimed) {
          if (r.available > 0.1) {
            return true;
          }
        }
      }

      return false;
    },

    balances() {
      if (!this.fiatRates.data) {
        return [];
      }

      let list = [];

      let balanceDls = this.authUser?.user?.balance;

      for (let f in this.fiatRates.data) {
        let rate = this.fiatRates.data[f];

        list.push({
          currency: f,
          balance: (rate * balanceDls).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        });
      }

      return list;
    },
    balance() {
      return (
        this.balances.find((b) => b.currency === this.selectedCurrency)
          ?.balance || this.authUser?.user?.balance?.toFixed(2)
      );
    },
    balanceDLS() {
      //  console.log('computed user balance ' + this.authUser?.user?.balance );
      return this.authUser?.user?.balance;
    },
    balanceWidth() {
      if (this.selectedCurrency === "DLS") {
        let width;
        if (this.balance.length <= 6) width = this.balance.length + 1;
        else width = this.balance.length - 1;
        return { width: width + "ch" };
      } else if (this.selectedCurrency === "TRY") {
        let width;
        // console.log(this.balance);
        //  console.log(this.balance.length);
        if (this.balance.length < 5) width = this.balance.length + 2;
        else if (this.balance.length < 8) width = this.balance.length + 1;
        else width = this.balance.length + 1;
        return { width: width + "ch" };
      } else if (this.selectedCurrency === "EUR") {
        let width;
        // console.log(this.balance);
        // console.log(this.balance.length);
        if (this.balance.length < 6) width = this.balance.length + 2;
        else width = this.balance.length + 1;
        return { width: width + "ch" };
      } else {
        let width;
        // console.log(this.balance);
        // console.log(this.balance.length);
        if (this.balance.length < 6) width = this.balance.length + 2;
        else if (this.balance.length < 8) width = this.balance.length + 1;
        else width = this.balance.length;
        return { width: width + "ch" };
      }
    },
  },
  components: {
    ChatIcon,
    UserIcon,
    AppButton,
    MagnetIcon,
    PhoneIcon,
    ArrowIcon,
  },
  data() {
    return {
      TokenIcon,
      playingSlots: false,
      animated: [],
      show: false,
      nonLocalFound: false,
      animationTimeout: null,
      Logo,
      LogoSmall,
      symbols: {
        USD: "$",
        GBP: "£",
        EUR: "€",
        TRY: "₺",
        DLS: "",
      },
    };
  },
  mounted() {
    this.playingSlots = !!this.$route.matched.find((m) => m.name === "Slot");
  },
  methods: {
    ...mapActions([
      "modalsSetShow",
      "modalsSetData",
      "generalToggleChat",
      "generalToggleSupport",
      "setCurrency",
    ]),
    getBalanceInSelectedCurrency(balance) {
      return this.getDisplayCurrencyAmountFormatted(balance);
    },
    pickCurrency(currency) {
      this.setCurrency(currency);
      this.show = false;
    },
    getSymbol(currency) {
      return this.symbols[currency];
    },
    getFloatBalance(balance) {
      return parseFloat(balance.replace(/[^0-9.-]+/g, ""));
    },
    getNextDayInMiliseconds() {
      const now = new Date();
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 0, 0);

      return nextDay;
    },

    getNextWeekInMiliseconds() {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + (7 - now.getDay()));
      nextWeek.setHours(0, 0, 0, 0);

      return nextWeek;
    },

    getNextMonthInMiliseconds() {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      return nextMonth;
    },

    isSameDay(date1, date2) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    },

    isSameWeek(date1, date2) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        this.getWeekNumber(date1) === this.getWeekNumber(date2)
      );
    },

    isSameMonth(date1, date2) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
      );
    },

    getWeekNumber(date) {
      const janFirst = new Date(date.getFullYear(), 0, 1);
      // Source: https://stackoverflow.com/a/27125580/3307678
      return Math.ceil(
        ((date.getTime() - janFirst.getTime()) / 86400000 +
          janFirst.getDay() +
          1) /
          7
      );
    },
  },
  watch: {
    balanceDLS: {
      handler: function (newValue, oldValue) {
        newValue = this.getFloatBalance(
          this.getBalanceInSelectedCurrency(newValue)
        );
        oldValue = this.getFloatBalance(
          this.getBalanceInSelectedCurrency(oldValue)
        );

        if (newValue == undefined || oldValue == undefined) {
          return;
        }

        //console.log(newValue);
        //console.log(oldValue);

        if (!this.playingSlots) {
          let e = {};
          if (newValue >= oldValue) {
            e.action = "add";
            e.diff = newValue - oldValue;
            e.diff = e.diff.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            //  e.diff = this.getBalanceInSelectedCurrency(newValue - oldValue);
          } else if (oldValue > newValue) {
            e.action = "subtract";
            e.diff = oldValue - newValue;
            e.diff = e.diff.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            // e.diff = this.getBalanceInSelectedCurrency(newValue - oldValue);
          }

          this.animated.push(e);
          setTimeout(
            () => (this.animated = this.animated.filter((a) => a !== e)),
            1000
          );
        }
      },
    },
    $route: {
      handler: function (newRouteValue) {
        this.playingSlots = !!newRouteValue.matched.find(
          (m) => m.name === "Slot"
        );
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/sass/mixins" as m;
@import "@/assets/sass/variables";

header {
  .auth-btns {
    //background: #090C1D;
    //border-radius: 10px;
    display: flex;
    gap: 15px;
    align-items: center;
    padding: 6px;

    .register-btn {
      color: white;
      flex-shrink: 0;
      height: 36px;
      font-weight: 800;
      align-items: center;
      padding-inline: 20px;
      font-size: 1.143rem;

      border-radius: 7px;
    }
  }

  height: $header-height;
  display: initial !important;
  flex-shrink: 0;
  z-index: 38001;
  overflow: clip;
  @include m.hide_scrollbar();

  .logo-large {
    height: 34px;
  }

  .logo-small {
    display: none;
  }

  @media (max-width: 991px) {
    .logo-large {
      display: none;
    }
    .logo-small {
      height: 39px;
      width: auto;
      display: block;
    }
  }

  .magnet-box {
    padding: 3px;
    display: grid;
    place-content: center;
    background: #090c1d;
    border-radius: 10px;
    margin-left: 5px;
    height: 45px;
  }

  .wallet {
    z-index: 5;
    margin-left: auto;
    align-items: center;
    padding: 3px;
    height: 45px;
    display: flex;

    background: #090c1d;
    border-radius: 10px;

    @media (max-width: 991px) {
      margin-right: 30px;
    }

    .money {
      //  padding-inline: 10px;
      //  white-space: nowrap;
      display: flex;
      cursor: pointer;
      align-items: center;
      justify-content: center;

      .animated {
        position: absolute;
        left: -30px;
        opacity: 0;
      }

      .color-red {
        color: red;
      }

      .color-green {
        color: green;
      }

      span {
        &.balance-value {
          padding-left: 10px;
        }
        font-family: Excon;
        letter-spacing: 0; /* Remove any default spacing */
        //width: 8ch;  /* Set the width to a multiple of the average character width */
        white-space: pre; /* Keep white space intact */
        color: white;
        font-size: 1.143rem;
        font-weight: 600;
        @media (max-width: 400px) {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &.ingame {
          padding-right: 10px;
          font-weight: 600;
          color: #564f80;
        }
      }

      > img {
        margin-left: 10px;
        // margin-right: 10px;
        height: 18px;
        width: 18px;
        padding-bottom: 1px;
      }

      .chevron {
        //padding-right: 10px;
      }

      //gap: 4px;
    }

    @media (max-width: 840px) {
      transform: unset !important;
      left: 125px !important;
    }

    .wallet-txt-desktop {
      @media (max-width: 991px) {
        display: none;
      }
    }

    .wallet-txt-mobile {
      @media (min-width: 991px) {
        display: none;
      }
    }

    display: flex;
  }

  .chat {
    display: flex;
    border: 1px solid #3b3a65;
    background: rgba(255, 255, 255, 0.07);
    cursor: pointer;
    transition: background 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    padding-top: 2px;
    width: 45px;
    height: 45px;
    align-items: center;
    justify-content: center;
    margin-left: 10px;

    > img {
      width: 22px !important;
      height: 22px !important;
      margin-left: 0 !important;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .fixed {
    height: $header-height;
    position: sticky;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 99;

    border-bottom: 2px solid #121129;

    .sidebar-switch {
      opacity: 0.4;
      cursor: pointer;
      margin-left: 15px;
    }

    .header-container {
      display: flex;

      .inner-container {
        max-width: 1100px;

        display: flex;
        align-items: center;
        margin: auto;
        width: 100%;
        @media (max-width: 991px) {
          margin: unset;
        }
      }

      border-right: 5px solid #111026;

      @media (max-width: 991px) {
        a {
          margin-right: 15px;
        }
      }

      height: $header-height;

      .switcher {
        display: flex;

        @media (max-width: 991px) {
          display: none;
        }
      }

      @media (max-width: 1800px) {
        padding: 0 10px;
      }

      @media (max-width: 1500px) {
        padding: 0 10px;
      }

      @media (max-width: 1350px) {
        padding: 0 10px;
      }

      .menuSwitcher {
        display: none;
        margin-left: 15px;
        opacity: 0.5;
        transition: opacity 0.3s ease;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }
      }
    }

    background: #111026;

    .logo {
      /*        height: 40px;
                width: 40px;
                display: flex;
                cursor: pointer;
                background: url('/img/misc/logo.png') no-repeat center;
                background-size: contain;
                margin-left: unset;
      */
      @media (min-width: 991px) {
        display: none;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
      cursor: pointer;

      &.ml-auto {
        margin-left: auto;
      }

      > div {
        display: grid;
        place-content: center;
        width: 45px;
        height: 45px;
        background: #22224a;
        border-radius: 15px;
      }

      .notifications {
        border: 2px solid #f7be2c;
      }

      .good {
        border: 2px solid #24ae59;
      }
      .selected {
        border: 2px solid #c6caff;
      }

      .hide-on-mobile {
        @media (max-width: 991px) {
          display: none;
        }
      }

      @media (max-width: 991px) {
        [data-notification-view] {
          display: none !important;
        }
      }

      .btn {
        //padding: 10px 30px !important;
        //border-radius: 10px;
      }
    }
  }
}

.balance-a-enter-active,
.balance-a-leave-active {
  transition: all 1s ease;
}

.balance-a-enter {
  margin-top: 25px;
  opacity: 1 !important;
}

.balance-a-enter-to {
  margin-top: 0;
  opacity: 0 !important;
}

.balance-a-leave,
.balance-a-leave-to {
  opacity: 0 !important;
}

.money {
  width: 100%;
  position: relative;

  .rows-menu {
    position: absolute;
    top: 42px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 9;

    &.slide-enter-active,
    &.slide-leave-active {
      overflow: hidden;
      transition: height 0.2s ease;
    }

    &.slide-enter-to,
    &.slide-leave {
      height: 370px;
    }

    &.slide-enter,
    &.slide-leave-to {
      height: 0;
    }
  }

  .menu-inner {
    width: 100%;
    position: relative;
    padding: 5px 0;
    border-radius: 5px;
    background-color: #22224a;
    max-height: 300px;
    overflow: scroll;

    button {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
      padding: 0 17px;
      border-radius: 0;
      font-size: 0.857rem;
      font-weight: 600;
      color: #ffffff;
      background-color: transparent;
      border: none;
      transition: all 0.3s ease;

      img {
        height: 18px;
        width: 18px;
      }

      &:hover,
      &.active {
        background-color: #292950;
      }
    }
  }
}
</style>
