<template>
  <div class="admin-user-settings">
    <div class="settings-element element-toggle">
      <div class="element-name">TIP LOCK</div>
      <button
        v-on:click="
          adminValueButton('limits.blockTip', !modalsData.user.limits.blockTip)
        "
        v-bind:class="{
          'button-active': modalsData.user.limits.blockTip === true,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div>
    <div class="settings-element element-toggle">
      <div class="element-name">PROMO LOCK</div>
      <button
        v-on:click="
          adminValueButton(
            'limits.blockPromo',
            !modalsData.user.limits.blockPromo
          )
        "
        v-bind:class="{
          'button-active': modalsData.user.limits.blockPromo === true,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div>
    <div class="settings-element element-toggle">
      <div class="element-name">WITHDRAW LOCK</div>
      <button
        v-on:click="
          adminValueButton(
            'limits.blockWithdraw',
            !modalsData.user.limits.blockWithdraw
          )
        "
        v-bind:class="{
          'button-active': modalsData.user.limits.blockWithdraw === true,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div>
    <div class="settings-element element-toggle">
      <div class="element-name">Whitelist</div>
      <button
        v-on:click="adminValueButton('whitelist', !modalsData.user.whitelist)"
        v-bind:class="{
          'button-active': modalsData.user.whitelist,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div>
    <div
      v-if="modalsData.user.limits.blockTip === true"
      class="settings-element element-sub element-number"
    >
      <div class="element-name">SET TIP LIMIT</div>
      <div class="element-input">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <input v-model="adminLimitTip" type="text" />
        <button
          v-on:click="adminValueButton('limits.limitTip', adminLimitTip)"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">UPDATE</div>
        </button>
      </div>
    </div>
    <!--     <div class="settings-element element-toggle">
      <div class="element-name">SPONSORSHIP LOCK</div>
      <button
        v-on:click="
          adminValueButton(
            'limits.blockSponsor',
            !modalsData.user.limits.blockSponsor
          )
        "
        v-bind:class="{
          'button-active': modalsData.user.limits.blockSponsor === true,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div> -->
    <div class="settings-element element-toggle">
      <div class="element-name">LEADERBOARD LOCK</div>
      <button
        v-on:click="
          adminValueButton(
            'limits.blockLeaderboard',
            !modalsData.user.limits.blockLeaderboard
          )
        "
        v-bind:class="{
          'button-active': modalsData.user.limits.blockLeaderboard === true,
        }"
        v-bind:disabled="socketSendLoading !== null"
      ></button>
    </div>
    <div class="settings-element element-button">
      <div class="element-name">CLEAR LEADERBOARD</div>
      <button v-on:click="adminValueButton('leaderboard.points', 0)">
        <div class="button-inner">CLEAR</div>
      </button>
    </div>
    <div class="settings-element element-select">
      <div class="element-name">SET RANK</div>
      <div class="element-input">
        <select v-model="adminRank">
          <option value="user">USER</option>
          <option value="partner">PARTNER</option>
          <option value="mod">MOD</option>
          <option value="streamer">STREAMER</option>
        </select>
        <button
          v-on:click="adminValueButton('rank', adminRank)"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">UPDATE</div>
        </button>
      </div>
    </div>
    <div class="settings-element element-number">
      <div class="element-name">SET BALANCE</div>
      <div class="element-input">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <input v-model="adminBalance" type="text" />
        <button
          v-on:click="adminBalanceButton()"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">UPDATE</div>
        </button>
      </div>
    </div>
    <!--    <div class="settings-element element-number">-->
    <!--      <div class="element-name">SET VAULT</div>-->
    <!--      <div class="element-input">-->
    <!--        <img src="@/assets/images/mmo_coin.png" alt="icon" />-->
    <!--        <input v-model="adminVault" type="text" />-->
    <!--        <button-->
    <!--          v-on:click="adminValueButton('vault.amount', adminVault)"-->
    <!--          v-bind:disabled="socketSendLoading !== null"-->
    <!--        >-->
    <!--          <div class="button-inner">UPDATE</div>-->
    <!--        </button>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="settings-element element-number">
      <div class="element-name">SET DEPOSIT</div>
      <div class="element-input">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <input v-model="adminDeposit" type="text" />
        <button
          v-on:click="adminValueButton('stats.deposit', adminDeposit)"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">UPDATE</div>
        </button>
      </div>
    </div>
    <div class="settings-element element-number">
      <div class="element-name">SET WITHDRAW</div>
      <div class="element-input">
        <img src="@/assets/images/mmo_coin.png" alt="icon" />
        <input v-model="adminWithdraw" type="text" />
        <button
          v-on:click="adminValueButton('stats.withdraw', adminWithdraw)"
          v-bind:disabled="socketSendLoading !== null"
        >
          <div class="button-inner">UPDATE</div>
        </button>
      </div>
    </div>
    <div class="settings-element element-button">
      <div class="element-name">MUTE USER</div>
      <button v-on:click="adminMuteButton()" class="button-red">
        <div class="button-inner">MUTE</div>
      </button>
    </div>
    <div class="settings-element element-button">
      <div class="element-name">BAN USER</div>
      <button v-on:click="adminBanButton()" class="button-red">
        <div class="button-inner">BAN</div>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AdminUserSettings",
  data() {
    return {
      adminLimitTip: null,
      adminRank: null,
      adminBalance: null,
      adminVault: null,
      adminDeposit: null,
      adminWithdraw: null,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "adminSendUserValueSocket",
      "adminSendUserBalanceSocket",
      "generalSetUserInfoData",
    ]),
    adminValueButton(setting, value) {
      if (
        setting === "limits.limitTip" &&
        (isNaN(value) === true || value < 0)
      ) {
        this.notificationShow({
          type: "error",
          message: "Your entered tip limit is invalid.",
        });
        return;
      }

      const data = {
        userId: this.modalsData.user._id,
        setting: setting,
        value: value,
      };
      this.adminSendUserValueSocket(data);
    },
    adminBalanceButton() {
      const balance = this.adminBalance;

      if (balance === null || isNaN(balance) === true || balance < 0) {
        this.notificationShow({
          type: "error",
          message: "Your entered user balance is invalid.",
        });
        return;
      }

      const data = { userId: this.modalsData.user._id, balance: balance };
      this.adminSendUserBalanceSocket(data);
    },
    adminMuteButton() {
      this.modalsSetShow(null);
      this.generalSetUserInfoData(this.modalsData.user);

      setTimeout(() => {
        this.modalsSetShow("Mute");
      }, 300);
    },
    adminBanButton() {
      this.modalsSetShow(null);
      this.generalSetUserInfoData(this.modalsData.user);

      setTimeout(() => {
        this.modalsSetShow("Ban");
      }, 300);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData"]),
  },
  watch: {
    modalsData: {
      handler(data, oldData) {
        this.adminLimitTip = this.modalsData.user.limits.limitTip.toFixed(2);
        this.adminRank = this.modalsData.user.rank;
        this.adminBalance = this.modalsData.user.balance.toFixed(2);
        this.adminDeposit = this.modalsData.user.stats.deposit.toFixed(2);
        this.adminWithdraw = this.modalsData.user.stats.withdraw.toFixed(2);
      },
      deep: true,
    },
  },
  created() {
    this.adminLimitTip = this.modalsData.user.limits.limitTip.toFixed(2);
    this.adminRank = this.modalsData.user.rank;
    this.adminBalance = this.modalsData.user.balance.toFixed(2);
    this.adminDeposit = this.modalsData.user.stats.deposit.toFixed(2);
    this.adminWithdraw = this.modalsData.user.stats.withdraw.toFixed(2);
  },
};
</script>

<style scoped>
.element-input {
  flex-wrap: nowrap;
  display: flex;
}

.admin-user-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-user-settings .settings-element {
  width: 100%;
  height: 47px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 20px;
  border-radius: 5px;
  background: #22224a;
}

.admin-user-settings .settings-element:first-of-type {
  margin-top: 0;
}

.admin-user-settings .element-name {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #bbbfd0;
}

.admin-user-settings .settings-element.element-toggle button {
  width: 45px;
  height: 22px;
  position: relative;
  filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
}

.admin-user-settings .settings-element.element-toggle button:disabled {
  cursor: not-allowed;
}

.admin-user-settings .settings-element.element-toggle button::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 34px;
  background: rgba(253, 59, 49, 0.4);
}

.admin-user-settings .settings-element.element-toggle button::after {
  content: "";
  width: 19px;
  height: 19px;
  position: absolute;
  top: 1px;
  left: 2px;
  border-radius: 50%;
  background: #fd3b31;
  transition: transform 0.3s ease;
}

.admin-user-settings
  .settings-element.element-toggle
  button.button-active::before {
  background: rgba(0, 199, 77, 0.4);
}

.admin-user-settings
  .settings-element.element-toggle
  button.button-active::after {
  transform: translateX(26px);
  background: var(--green);
}

.admin-user-settings .settings-element.element-text .element-input,
.admin-user-settings .settings-element.element-number .element-input {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-user-settings .settings-element.element-number .element-input img {
  width: 15px;
  height: 15px;
  position: absolute;
  top: 9px;
  left: 15px;
}

.admin-user-settings .settings-element.element-text .element-input input,
.admin-user-settings .settings-element.element-number .element-input input,
.admin-user-settings .settings-element.element-select .element-input select {
  max-width: 220px;
  height: 33px;
  margin-right: 20px;
  padding: 0 15px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 600;
  color: #ffffff;
  background: #1b2029;
  @media screen and (max-width: 991px) {
    max-width: 100px;
  }
}

.admin-user-settings .settings-element.element-number .element-input input {
  padding: 0 15px 0 37px;
}

.admin-user-settings .settings-element.element-button button,
.admin-user-settings .settings-element.element-text .element-input button,
.admin-user-settings .settings-element.element-number .element-input button,
.admin-user-settings .settings-element.element-select .element-input button {
  width: 60px;
  height: 30px;
}

.admin-user-settings .settings-element.element-button button .button-inner,
.admin-user-settings
  .settings-element.element-text
  .element-input
  button
  .button-inner,
.admin-user-settings
  .settings-element.element-number
  .element-input
  button
  .button-inner,
.admin-user-settings
  .settings-element.element-select
  .element-input
  button
  .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 800;
  color: #fff;
  border-radius: 5px;
  background: #5b46bc;
}

.admin-user-settings
  .settings-element.element-button
  button.button-red
  .button-inner {
  background: var(--red);
}
</style>
