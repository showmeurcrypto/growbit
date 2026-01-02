<template>
  <div class="modal-admin-user">
    <div class="modal-close">
      <button v-on:click="modalsSetShow(null)">
        <img src="@/assets/images/close.svg" />
      </button>
    </div>
    <div class="modal-title">{{ modalsData.user.username }}</div>
    <div class="modal-content">
      <div class="user-nav">
        <button
          v-on:click="modalSetTab('Profile')"
          class="button-nav"
          v-bind:class="{ 'button-active': modalTab === 'Profile' }"
        >
          <div class="button-inner">
            <span>PROFILE</span>
          </div>
        </button>
        <button
          v-on:click="modalSetTab('Transactions')"
          class="button-nav"
          v-bind:class="{ 'button-active': modalTab === 'Transactions' }"
        >
          <div class="button-inner">
            <span>TRANSACTIONS</span>
          </div>
        </button>
        <button
          v-on:click="modalSetTab('Games')"
          class="button-nav"
          v-bind:class="{ 'button-active': modalTab === 'Games' }"
        >
          <div class="button-inner">
            <span>GAMES</span>
          </div>
        </button>
        <button
          v-on:click="modalSetTab('Addresses')"
          class="button-nav"
          v-bind:class="{ 'button-active': modalTab === 'Addresses' }"
        >
          <div class="button-inner">
            <span>ADDRESSES</span>
          </div>
        </button>
        <button
          v-on:click="modalSetTab('Settings')"
          class="button-nav"
          v-bind:class="{ 'button-active': modalTab === 'Settings' }"
        >
          <div class="button-inner">
            <span>SETTINGS</span>
          </div>
        </button>
      </div>
      <div class="user-content">
        <component v-bind:is="'AdminUser' + modalTab" />
      </div>
    </div>
  </div>
</template>

<script>
import AdminUserProfile from "@/components/admin/user/AdminUserProfile";
import AdminUserTransactions from "@/components/admin/user/AdminUserTransactions";
import AdminUserGames from "@/components/admin/user/AdminUserGames";
import AdminUserAddresses from "@/components/admin/user/AdminUserAddresses";
import AdminUserSettings from "@/components/admin/user/AdminUserSettings";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ModalAdminUser",
  components: {
    AdminUserProfile,
    AdminUserTransactions,
    AdminUserGames,
    AdminUserAddresses,
    AdminUserSettings,
  },
  data() {
    return {
      modalTab: "Profile",
    };
  },
  computed: {
    ...mapGetters(["modalsData"]),
  },
  methods: {
    ...mapActions(["modalsSetShow"]),
    modalSetTab(tab) {
      this.modalTab = tab;
    },
  },
};
</script>

<style scoped>
.modal-admin-user {
  width: 770px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 20px 44px 20px;
  border-radius: 18px;
  background: #191939;
  border-top: 32px solid transparent;
  border-bottom: 32px solid transparent;
  @media screen and (max-width: 991px) {
    background: transparent;
  }
}

.modal-close {
  position: absolute;
  top: -14px;
  right: 12px;
}

.modal-close button {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;

  background: #22224a;
}

.modal-close button:hover {
  color: #fff;
}

.modal-close button svg {
  margin-right: 8px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-close button:hover svg {
  fill: #fff;
}

.modal-title {
  font-size: 26px;
  font-weight: 800;
  color: #eeeeee;
}

.modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-admin-user .user-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
}

.modal-admin-user .user-nav button.button-nav {
  width: calc(20% - 16px);
  height: 54px;
  position: relative;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.modal-admin-user .user-nav button.button-nav:last-of-type {
  margin-right: 0;
}

.modal-admin-user .user-nav button.button-nav .button-inner {
  width: calc(100% - 2px);
  height: 42px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 1px;
  left: 1px;
  background: #22224a;
  border-radius: 5px;
  transition: all 0.3s ease;
  z-index: 1;
}

.modal-admin-user .user-nav button.button-nav.button-active .button-inner {
  background: #5b46bc;
}

.modal-admin-user .user-nav button.button-nav .button-inner span {
  font-size: 13px;
  font-weight: 700;
}

.modal-admin-user .user-nav button.button-nav.button-active .button-inner span {
  color: #fff;
}

.modal-admin-user .user-content {
  width: 100%;
  margin-top: 35px;
}

@media only screen and (max-width: 790px) {
  .modal-admin-user {
    width: 100%;
    padding: 35px 10px 30px 10px;
  }
}

@media only screen and (max-width: 600px) {
  .modal-admin-user .user-nav {
    flex-wrap: wrap;
  }

  .modal-admin-user .user-nav button.button-nav {
    width: calc(50% - 5px);
    margin-top: 10px;
    margin-right: 10px;
  }

  .modal-admin-user .user-nav button.button-nav:nth-child(1),
  .modal-admin-user .user-nav button.button-nav:nth-child(2) {
    margin-top: 0;
  }

  .modal-admin-user .user-nav button.button-nav:nth-child(2n) {
    margin-right: 0;
  }
}
</style>
