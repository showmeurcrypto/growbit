<template>
  <div class="modal-ban">
    <div class="ban-title">
      <span class="gradient-green">BAN USER</span>
    </div>
    <div class="ban-avatar">
      <transition name="fade" mode="out-in">
        <div
          v-if="
            generalUserInfo.data === null || generalUserInfo.loading === true
          "
          class="avatar-loading"
        ></div>
        <div v-else class="avatar-content">
          <AvatarImage :avatarNumber="generalUserInfo.data.avatar" />
        </div>
      </transition>
    </div>
    <div class="ban-username">
      <transition name="fade" mode="out-in">
        <div
          v-if="
            generalUserInfo.data === null || generalUserInfo.loading === true
          "
          class="username-loading"
        ></div>
        <div v-else class="username-content">
          <span v-html="generalUserInfo.data.username"></span>
        </div>
      </transition>
    </div>
    <div class="ban-date">
      <transition name="fade" mode="out-in">
        <div
          v-if="
            generalUserInfo.data === null || generalUserInfo.loading === true
          "
          class="date-loading"
        ></div>
        <div v-else class="date-content">Member since {{ modalGetDate }}</div>
      </transition>
    </div>
    <div class="ban-reason">
      <select v-model="modalReason">
        <option value="self request">Self request</option>
        <option value="bug abuse">Bug abuse</option>
        <option value="cheating">Cheating</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div class="ban-time">
      <select v-model="modalTime">
        <option value="24h">24 hours</option>
        <option value="3d">3 days</option>
        <option value="7d">7 days</option>
        <option value="30d">30 days</option>
        <option value="permanent">Permanent</option>
      </select>
    </div>
    <button
      v-on:click="modalBanButton()"
      class="button-ban"
      v-bind:disabled="socketSendLoading === 'AdminUserBan'"
    >
      <div class="button-inner">
        <transition name="fade" mode="out-in">
          <ButtonLoading v-if="socketSendLoading === 'AdminUserBan'" />
          <div v-else class="inner-content">BAN USER</div>
        </transition>
      </div>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";
import ButtonLoading from "@/components/ButtonLoading";

export default {
  name: "ModalBan",
  components: {
    AvatarImage,
    ButtonLoading,
  },
  data() {
    return {
      modalReason: "self request",
      modalTime: "none",
    };
  },
  methods: {
    ...mapActions(["notificationShow", "adminSendUserBanSocket"]),
    modalBanButton() {
      let time = 0;
      if (this.modalTime === "24h") {
        time = 60 * 60 * 24;
      } else if (this.modalTime === "3d") {
        time = 60 * 60 * 24 * 3;
      } else if (this.modalTime === "7d") {
        time = 60 * 60 * 24 * 7;
      } else if (this.modalTime === "30d") {
        time = 60 * 60 * 24 * 30;
      } else if (this.modalTime === "permanent") {
        time = 60 * 60 * 24 * 365 * 100;
      }

      const data = {
        userId: this.generalUserInfo.data._id,
        time: time,
        reason: this.modalReason,
      };
      this.adminSendUserBanSocket(data);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData", "generalUserInfo"]),
    modalGetDate() {
      const date = new Date(this.generalUserInfo.data.createdAt);
      return (
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
      );
    },
  },
};
</script>

<style scoped>
.modal-ban {
  width: 773px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 35px 20px 48px 20px;
  border-radius: 15px;
  background: #191939;
}

.modal-ban .ban-title {
  text-align: center;
  font-size: 2.286rem;
  font-weight: 900;
}

.modal-ban .ban-avatar {
  margin-top: 35px;
}

.modal-ban .avatar-loading,
.modal-ban .username-loading,
.modal-ban .date-loading {
  position: relative;
  overflow: hidden;
  background-color: #072435;
}

.modal-ban .avatar-loading {
  width: 95px;
  height: 95px;
  border-radius: 50%;
}

.modal-ban .username-loading {
  width: 150px;
  height: 30px;
  border-radius: 5px;
}

.modal-ban .date-loading {
  width: 110px;
  height: 19px;
  border-radius: 5px;
}

.modal-ban .avatar-loading::after,
.modal-ban .username-loading::after,
.modal-ban .date-loading::after {
  width: 100%;
  height: 100%;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  animation-name: loading_animation;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
  background: linear-gradient(
    to right,
    #ffffff00 0%,
    rgba(255, 255, 255, 0.1) 50%,
    #ffffff00 100%
  );
}

.modal-ban .avatar-loading.fade-leave-active,
.modal-ban .username-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.modal-ban .avatar-loading.fade-leave-to,
.modal-ban .username-loading.fade-leave-to {
  opacity: 0;
}

.modal-ban .avatar-content {
  width: 95px;
  height: 95px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  border-radius: 50%;
  border: 2px solid #9e9e9e;
  overflow: hidden;
}

.modal-ban .ban-username {
  margin-top: 18px;
}

.modal-ban .username-content {
  display: flex;
  align-items: center;
  font-size: 1.571rem;
  font-weight: 700;
  color: #ffffff;
}

.modal-ban .username-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-ban .username-content.fade-enter-from {
  opacity: 0;
}

.modal-ban .ban-date {
  margin-top: 5px;
}

.modal-ban .date-content {
  font-size: 1rem;
  font-weight: 400;
  color: #49687d;
}

.modal-ban .date-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-ban .date-content.fade-enter-from {
  opacity: 0;
}

.modal-ban .ban-reason,
.modal-ban .ban-time {
  width: 448px;
  height: 72px;
  position: relative;
  margin-top: 35px;
  padding: 1px;
}

.modal-ban .ban-time {
  margin-top: 15px;
}

.modal-ban .ban-reason select,
.modal-ban .ban-time select {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background: #22224a;
  font-size: 1.143rem;
  font-weight: 600;
}

.modal-ban button.button-ban {
  width: 170px;
  height: 48px;
  margin-top: 20px;
  filter: drop-shadow(0px 4px 25px rgba(1, 230, 169, 0.15))
    drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.35));
}

.modal-ban button.button-ban .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  background: var(--red);
}

@keyframes loading_animation {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media only screen and (max-width: 793px) {
  .modal-ban {
    width: calc(100vw - 20px);
  }
}

@media only screen and (max-width: 508px) {
  .modal-ban .ban-reason,
  .modal-ban .ban-time {
    width: 100%;
  }
}
</style>
