<template>
  <div class="modal-chat-user">
    <div class="top_menu">
      <div class="header-txt">User Profile</div>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>

    <div class="inner">
      <div v-if="generalUserInfo.data.stats" class="border-wrapper">
        <div class="user-info">
          <img
            v-if="levelInfo.level"
            :src="`/img/badges/level_${Math.min(levelInfo.level, 5)}.png`"
          />
          <div class="nameAndJoin">
            <span class="name"> {{ generalUserInfo.data.username }}</span>
            <div class="join">
              <span>Join Date:</span>
              <span>{{
                new Date(generalUserInfo.data?.createdAt).toLocaleDateString()
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isYou" class="action-buttons">
        <button @click="modalTipButton" class="btn">Tip</button>
        <button
          v-if="this.generalUserInfo?.data?.rank !== 'admin'"
          class="btn"
          @click="ignoreUser()"
        >
          Ignore
        </button>
        <button @click="chatMuteButton()" class="btn" v-if="isAdmin">
          Mute
        </button>
      </div>

      <div v-if="generalUserInfo.data.stats" class="profile-stats">
        <div class="stat">
          <div>Deposited</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                generalUserInfo.data.stats.deposit
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>
        <div class="stat">
          <div>Withdrawn</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(
                generalUserInfo.data.stats.withdraw
              )
            }}</span>
            <Currency></Currency>
          </div>
        </div>

        <div class="stat">
          <div>Wagered</div>
          <div class="total-wager">
            <span>{{
              getDisplayCurrencyAmountFormatted(generalUserInfo.data.stats.bet)
            }}</span>
            <Currency></Currency>
          </div>
        </div>
        <div class="stat">
          <div>Played</div>
          <div class="total-wager">
            <span>{{ generalUserInfo.data.stats.played }}</span>
          </div>
        </div>
      </div>
      <div v-else class="user-hidden">
        <img src="/img/private_profile.webp" />
        <p>This profile is hidden</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Avatar from "@/components/Avatar.vue";
import AppButton from "@/components/AppButton.vue";
import CloseIcon from "@/assets/images/close.svg";
import AvatarImage from "@/components/AvatarImage.vue";
import Currency from "@/components/Currency.vue";
import { currencyExchangeRatesMixin } from "@/currencyExchangeMixin";
import { getUserLevel } from "@/utils";

export default {
  name: "ModalChatUser",
  data() {
    return {
      CloseIcon,
    };
  },
  mixins: [currencyExchangeRatesMixin],
  components: {
    AvatarImage,
    AppButton,
    Avatar,
    Currency,
  },
  methods: {
    ...mapActions(["modalsSetShow", "modalsSetData", "chatIgnoreUserSocket"]),

    modalTipButton() {
      this.modalsSetShow(null);

      setTimeout(() => {
        this.modalsSetShow("Tip");
      }, 300);
    },
    ignoreUser() {
      if (this.generalUserInfo?.data?._id) {
        this.chatIgnoreUserSocket({ userId: this.generalUserInfo.data._id });
      }
    },
    chatMuteButton() {
      this.modalsSetShow("Mute");
    },
  },
  computed: {
    ...mapGetters([
      "generalUserInfo",
      "authUser",
      "fiatRates",
      "selectedCurrency",
    ]),
    isYou() {
      return (
        this.generalUserInfo?.data?.username === this.authUser.user.username
      );
    },
    levelInfo() {
      return getUserLevel(this.generalUserInfo?.data);
    },
    isAdmin() {
      return (
        this.authUser?.user !== null &&
        (this.authUser?.user.rank === "admin" ||
          this.authUser?.user.rank === "mod")
      );
    },
  },
};
</script>

<style scoped lang="scss">
.modal-chat-user {
  width: 500px;
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

  .user-hidden {
    margin-bottom: 15px;

    display: flex;
    align-items: center;
    flex-direction: column;
    img {
      height: 150px;
    }

    p {
      font-size: 1.143rem;
      color: var(--purple-2);
    }
  }
}

.top_menu {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  padding: 10px 15px;
  background: #090c1d;
  flex-direction: row;
  gap: 15px;
  border-radius: 15px 15px 0 0;

  @media screen and (max-width: 991px) {
    display: none;
  }

  .header-txt {
    font-weight: 700;
    font-size: 14px;
    color: #eeeeee;
  }

  .close {
    width: 30px;
    height: 30px;
    background: #22224a;
    border-radius: 8px;
    display: grid;
    cursor: pointer;
    place-content: center;
    margin-left: auto;
  }
}

.border-wrapper {
  background: linear-gradient(to bottom, #3b3a65, transparent);
  padding: 2px;
  border-radius: 11px;
  margin-bottom: 10px;

  .user-info {
    width: 100%;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      height: 36px;
      width: 36px;
    }

    background-size: cover;

    background: url("/img/profile_bg.png");
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;

    .nameAndJoin {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;

      .name {
        font-weight: 700;
        font-size: 1.2rem;

        color: #eeeeee;
      }

      .join {
        span {
          &:first-of-type {
            font-weight: 700;
            font-size: 1rem;
            margin-right: 5px;

            color: #eeeeee;
          }
          &:last-of-type {
            font-weight: 700;
            font-size: 0.9rem;

            color: #564f80;
          }
        }
      }
    }
  }
}

.inner {
  padding: 10px;

  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 10px;

    padding: 8px;
    background: #090c1d;
    border-radius: 8px;

    display: grid;
    grid-template-columns: 1fr 1fr;

    @media screen and (max-width: 991px) {
      grid-template-columns: 1fr;
    }

    button {
      padding: 8px 25px 8px;

      background: #5b46bc;
      /* Modal shadow */
      box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.25);
      border-radius: 5px;

      gap: 10px;
      width: 100%;
      border-radius: 5px;
      transition: all 0.2s ease-in-out;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: "Excon";
      font-style: normal;
      font-weight: 900;
      font-size: 1.2rem;
      color: #eeeeee;

      &:nth-of-type(2) {
        background: #564f80;
        box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.25);
      }

      &:hover,
      &:focus,
      &:active {
        filter: brightness(1.1);
      }
    }
  }

  .profile-stats {
    width: 100%;
    background: #090c1d;
    border-radius: 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 10px;
    gap: 5px;

    .stat {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      padding: 7px 8px;

      background: #22224a;
      border-radius: 5px;

      .total-wager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        flex-wrap: nowrap;
        span {
          font-size: 1rem;
          font-weight: 700;
          color: #eeeeee;
        }
      }
      div:first-child {
        font-weight: 700;
        font-size: 0.9rem;
        color: #564f80;
      }

      div:last-child {
        font-size: 1rem;
        font-weight: 700;
        color: #eeeeee;
      }
    }
  }
}
</style>
