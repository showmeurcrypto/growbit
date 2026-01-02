<template>
  <div class="admin-user-profile">
    <div class="profile-date">Member since {{ adminGetDate }}</div>

    <div
      v-if="modalsData.user?.affiliates?.referrer?.username"
      class="profile-date"
    >
      Ref by : {{ modalsData.user.affiliates?.referrer?.username }}
    </div>

    <div v-if="banned" class="banned">
      <span>Banned until {{ banned }} </span
      ><button @click="unban()">Undo</button>
    </div>
    <div v-if="muted" class="banned">
      <span>Muted until {{ muted }}</span>
      <button @click="unmute()">Undo</button>
    </div>

    <div class="email-set">
      <input v-model="email" type="text" />
      <button
        v-on:click="setUserEmail()"
        v-bind:disabled="socketSendLoading !== null || !email"
      >
        Set
      </button>
    </div>

    <button class="multis" @click="detectMultis()">Detect multis</button>
    <button class="unfreeze" @click="unfreeze()">Unfreeze transactions</button>

    <div class="stats-element">
      <span>Deposited</span>
      <div class="inner-amount">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <div class="amount-value">
          {{ adminFormatValue(modalsData.user.stats.deposit) }}
        </div>
      </div>
    </div>
    <div class="stats-element">
      <span>Withdrawn</span>

      <div class="inner-amount">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <div class="amount-value">
          {{ adminFormatValue(modalsData.user.stats.withdraw) }}
        </div>
      </div>
    </div>
    <div class="stats-element">
      <span>Wagered</span>

      <div class="inner-amount">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <div class="amount-value">
          {{ adminFormatValue(modalsData.user.stats.bet) }}
        </div>
      </div>
    </div>
    <div class="stats-element">
      <span>Won</span>

      <div class="inner-amount">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <div class="amount-value">
          {{ adminFormatValue(modalsData.user.stats.won) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AvatarImage from "@/components/AvatarImage";

export default {
  name: "AdminUserProfile",
  components: {
    AvatarImage,
  },
  data() {
    return {
      email: null,
    };
  },
  methods: {
    ...mapActions([
      "adminSendUserMuteSocket",
      "adminSendUserBanSocket",
      "adminUnfreeze",
      "notificationShow",
      "adminSetUserEmail",
    ]),
    adminFormatValue(value) {
      return parseFloat(value)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    detectMultis() {
      this.socketAdmin.emit(
        "findMultis",
        {
          userId: this.modalsData.user._id,
        },
        (res) => {
          if (res.success === true) {
            let multis = res.multis;
            alert(JSON.stringify(multis, null, 2));
          } else {
            this.notificationShow(res.error);
          }
        }
      );
    },
    unfreeze() {
      this.adminUnfreeze({
        userId: this.modalsData.user._id,
      });
    },
    unban() {
      this.adminSendUserBanSocket({
        userId: this.modalsData.user._id,
        time: null,
        reason: null,
      });
    },
    setUserEmail() {
      this.adminSetUserEmail({
        userId: this.modalsData.user._id,
        email: this.email,
      });
    },
    unmute() {
      this.adminSendUserMuteSocket({
        userId: this.modalsData.user._id,
        time: null,
        reason: null,
      });
    },
  },
  watch: {
    modalsData: {
      handler(data, oldData) {
        this.email = this.modalsData.user.local.email;
      },
      deep: true,
    },
  },
  created() {
    this.email = this.modalsData.user.local.email;
  },

  computed: {
    ...mapGetters(["modalsData", "socketAdmin", "socketSendLoading"]),
    banned() {
      if (!this.modalsData.user.ban?.expire) {
        return null;
      }
      const date = new Date(this.modalsData.user.ban?.expire);
      if (date.getTime() - new Date().getTime() < 0) {
        return null;
      }

      return date.toLocaleDateString();
    },
    muted() {
      if (!this.modalsData.user.mute?.expire) {
        return null;
      }
      const date = new Date(this.modalsData.user.mute?.expire);

      if (date.getTime() - new Date().getTime() < 0) {
        return null;
      }

      return date.toLocaleDateString();
    },
    adminGetDate() {
      const date = new Date(this.modalsData.user.createdAt);
      return (
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
      );
    },
  },
};
</script>

<style scoped lang="scss">
.admin-user-profile {
  width: 100%;
  display: flex;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
  gap: 10px;

  .email-set {
    padding: 8px;
    border-radius: 4px;
    padding-left: 10px;
    display: flex;
    gap: 10px;

    background: #22224a;

    button {
      margin-left: auto;
      padding: 7px 12px;
      border-radius: 4px;
      font-weight: 800;

      background: var(--purple);
    }
  }

  .multis {
    text-wrap: nowrap;
    padding: 10px 15px;
    background: var(--red);
    font-weight: 800;
    border-radius: 4px;
  }

  .unfreeze {
    text-wrap: nowrap;
    padding: 10px 15px;
    background: green;
    font-weight: 800;
    border-radius: 4px;
  }
}

.banned {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;

  border-radius: 4px;
  background: #22224a;

  > span {
    color: var(--red);
    font-weight: 900;
    font-size: 16px;
  }

  button {
    margin-left: auto;
    padding: 7px 12px;
    background: var(--purple);
    border-radius: 4px;
    font-weight: 800;
  }
}

.admin-user-profile .profile-avatar {
  width: 95px;
  height: 95px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  border-radius: 50%;
  border: 2px solid #9e9e9e;
  overflow: hidden;
}

.admin-user-profile .profile-avatar.avatar-blue {
  border: 2px solid #559ee4;
}

.admin-user-profile .profile-avatar.avatar-green {
  border: 2px solid #b8e92d;
}

.admin-user-profile .profile-avatar.avatar-orange {
  border: 2px solid #fca311;
}

.admin-user-profile .profile-avatar.avatar-red {
  border: 2px solid #ff4e4e;
}

.admin-user-profile .profile-avatar.avatar-purple {
  border: 2px solid #6953f1;
}

.admin-user-profile .profile-avatar.avatar-partner {
  border: 2px solid #eca822;
}

.admin-user-profile .profile-avatar.avatar-mod {
  border: 2px solid #ffb703;
}

.admin-user-profile .profile-avatar.avatar-admin {
  border: 2px solid #00c74d;
}

.admin-user-profile .profile-avatar .avatar-image {
  width: 100%;
  height: 100%;
}

.admin-user-profile .profile-username {
  display: flex;
  align-items: center;
  margin-top: 18px;
  font-size: 1.571rem;
  font-weight: 700;
  color: #ffffff;
}

.admin-user-profile .username-level {
  width: 38px;
  height: 28px;
  position: relative;
  margin-left: 12px;
}

.admin-user-profile .level-inner {
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 1px;
  left: 1px;
  font-size: 0.857rem;
  font-weight: 700;
  background-color: rgba(252, 163, 17, 0.05);
  z-index: 1;
}

.admin-user-profile .profile-date {
  font-size: 1rem;
  font-weight: 400;
  background: #22224a;
  padding: 10px 15px;
  border-radius: 4px;
}

.admin-user-profile .profile-id {
  margin-top: 5px;
  font-size: 1rem;
  font-weight: 400;
  color: #db7d48;
}

.admin-user-profile .profile-actions {
  display: flex;
  align-items: center;
  margin-top: 30px;
}

.admin-user-profile .profile-actions a.link-account {
  width: 144px;
  height: 48px;
  filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.35));
}

.admin-user-profile .profile-actions a.link-account .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
  color: #bbbfd0;
  background-color: #191e27;
}

.admin-user-profile .profile-stats {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
  gap: 10px;
}

.admin-user-profile .stats-element {
  color: #fff;
  background: #22224a;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
}

.admin-user-profile .element-inner {
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 1px;
  left: 1px;
  padding: 0 16px;
  font-size: 0.857rem;
  font-weight: 600;
  background: #22224a;
  z-index: 1;
}

.admin-user-profile .inner-amount {
  display: flex;
  align-items: center;
}

.admin-user-profile .inner-amount img {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.admin-user-profile .amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #c1c1c1;
}

.admin-user-profile .amount-value span {
  font-size: 1.29rem;
  font-weight: 700;
  color: #ffffff;
}
</style>
