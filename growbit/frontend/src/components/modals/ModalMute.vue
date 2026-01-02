<template>
  <div class="modal-mute">
    <div class="top_menu">
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="mute-content">
      <div class="avatar-row">
        <div class="mute-avatar">
          <transition name="fade" mode="out-in">
            <div
              v-if="
                generalUserInfo.data === null ||
                generalUserInfo.loading === true
              "
              class="avatar-loading"
            ></div>
            <div v-else class="avatar-content">
              <AvatarImage :avatarNumber="generalUserInfo.data.avatar" />
            </div>
          </transition>
        </div>
        <div class="mute-username">
          <transition name="fade" mode="out-in">
            <div
              v-if="
                generalUserInfo.data === null ||
                generalUserInfo.loading === true
              "
              class="username-loading"
            ></div>
            <div v-else class="username-content">
              <span v-html="generalUserInfo.data.username"></span>
            </div>
          </transition>
        </div>
      </div>

      <div class="mute-reason">
        <select v-model="modalReason">
          <option value="insulting">Insulting</option>
          <option value="self promotion">Self promotion</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="mute-time">
        <select v-model="modalTime">
          <option value="15m">15 minutes</option>
          <option value="30m">30 minutes</option>
          <option value="1h">1 hours</option>
          <option value="12h">12 hours</option>
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
        </select>
      </div>
      <div class="btn">
        <AppButton
          :disabled="socketSendLoading === 'AdminUserMute'"
          :click="() => modalMuteButton()"
          :height="'50px'"
          :fullwidth="true"
          >Mute</AppButton
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";
import ButtonLoading from "@/components/ButtonLoading";
import CloseIcon from "@/assets/images/close.svg";
import AppButton from "@/components/AppButton.vue";

export default {
  name: "ModalMute",
  components: {
    AppButton,
    AvatarImage,

    ButtonLoading,
  },
  data() {
    return {
      modalReason: "insulting",
      modalTime: "none",
      CloseIcon,
    };
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "adminSendUserMuteSocket",
      "modalsSetShow",
      "modalsSetData",
    ]),
    modalMuteButton() {
      let time = 0;
      if (this.modalTime === "15m") {
        time = 60 * 15;
      } else if (this.modalTime === "30m") {
        time = 60 * 30;
      } else if (this.modalTime === "1h") {
        time = 60 * 60;
      } else if (this.modalTime === "12h") {
        time = 60 * 60 * 12;
      } else if (this.modalTime === "24h") {
        time = 60 * 60 * 24;
      } else if (this.modalTime === "7d") {
        time = 60 * 60 * 24 * 7;
      }

      const data = {
        userId: this.generalUserInfo.data._id,
        time: time,
        reason: this.modalReason,
      };
      this.adminSendUserMuteSocket(data);
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

<style scoped lang="scss">
.modal-mute {
  width: 620px;
  position: relative;
  flex-direction: column;
  display: flex;
  justify-content: center;
  border-radius: 18px;
  border-top: 32px solid #090c1d;
  border-bottom: 32px solid #090c1d;
  background: var(--dark-blue);
  border: 4px solid #090c1d;

  @media screen and (max-width: 991px) {
    background: transparent;
    border: none;
    width: 100%;
  }

  select {
    border-right: 16px solid transparent;
  }
}

.top_menu {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 80px;
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

.btn {
  width: 100%;
  max-width: 448px;
  margin-top: 30px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 15px;
}
.modal-mute .mute-close {
  position: absolute;
  top: -14px;
  right: 12px;
}

.modal-mute .mute-close button {
  height: 27px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 5px;
  font-size: 0.857rem;
  font-weight: 700;

  background: #22224a;
}

.modal-mute .mute-close button:hover {
  color: #fff;
}

.modal-mute .mute-close button svg {
  margin-right: 8px;
  fill: #767c8b;
  transition: all 0.3s ease;
}

.modal-mute .mute-close button:hover svg {
  fill: #fff;
}

.modal-mute .mute-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
}

.modal-mute .content-title {
  text-transform: uppercase;
  font-size: 26px;
  font-weight: 800;
  color: #eeeeee;
}

.modal-mute .mute-avatar {
}

.modal-mute .avatar-loading,
.modal-mute .username-loading,
.modal-mute .date-loading {
  position: relative;
  overflow: hidden;
  background-color: #072435;
}

.modal-mute .avatar-loading {
  width: 95px;
  height: 95px;
  border-radius: 50%;
}

.modal-mute .username-loading {
  width: 150px;
  height: 30px;
  border-radius: 5px;
}

.modal-mute .date-loading {
  width: 110px;
  height: 19px;
  border-radius: 5px;
}

.modal-mute .avatar-loading::after,
.modal-mute .username-loading::after,
.modal-mute .date-loading::after {
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

.modal-mute .avatar-loading.fade-leave-active,
.modal-mute .username-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.modal-mute .avatar-loading.fade-leave-to,
.modal-mute .username-loading.fade-leave-to {
  opacity: 0;
}

.modal-mute .avatar-content {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  border-radius: 50%;
  border: 4px solid #090c1d;
  overflow: hidden;
}

.modal-mute .avatar-content .avatar-image {
  width: 100%;
  height: 100%;
}

.modal-mute .mute-username {
}

.modal-mute .username-content {
  display: flex;
  align-items: center;
  font-size: 1.571rem;
  font-weight: 700;
  color: #ffffff;
}

.modal-mute .username-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-mute .username-content.fade-enter-from {
  opacity: 0;
}

.modal-mute .mute-date {
  margin-top: 5px;
}

.modal-mute .date-content {
  font-size: 1rem;
  font-weight: 400;
  color: #49687d;
}

.modal-mute .date-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-mute .date-content.fade-enter-from {
  opacity: 0;
}

.modal-mute .mute-reason,
.modal-mute .mute-time {
  width: 448px;
  height: 60px;
  position: relative;
  margin-top: 25px;
  padding: 1px;
}

.modal-mute .mute-time {
  margin-top: 15px;
}

.modal-mute .mute-reason select,
.modal-mute .mute-time select {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  font-size: 1.143rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #22224a;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 5px;
}

.modal-mute button.button-mute {
  width: 170px;
  height: 48px;
  margin-top: 20px;
}

.modal-mute button.button-mute .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
  border-radius: 5px;
  color: #fff;
  background: var(--purple);
}

.modal-mute button.button-mute .button-loading.fade-leave-active {
  transition: opacity 0.5s;
}

.modal-mute button.button-mute .button-loading.fade-leave-to {
  opacity: 0;
}

.modal-mute button.button-mute .inner-content.fade-enter-active {
  transition: opacity 0.5s;
}

.modal-mute button.button-mute .inner-content.fade-enter-from {
  opacity: 0;
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
  .modal-mute {
    width: calc(100vw - 20px);
  }
}

@media only screen and (max-width: 508px) {
  .modal-mute .mute-reason,
  .modal-mute .mute-time {
    width: 100%;
  }
}
</style>
