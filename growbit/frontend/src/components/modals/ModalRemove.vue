<template>
  <div class="modal-remove">
    <div class="top_menu">
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="remove-content">
      <div class="content-input">
        <div>{{ modalsData.message.message }}</div>
      </div>
      <div class="content-button">
        <AppButton
          :disabled="socketSendLoading === 'ChatRemove'"
          :click="() => modalRemoveButton()"
          height="50px"
          :fullwidth="true"
          >Remove</AppButton
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AvatarImage from "@/components/AvatarImage";
import ButtonLoading from "@/components/ButtonLoading";
import AppButton from "@/components/AppButton.vue";
import Avatar from "@/components/Avatar.vue";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "ModalRemove",
  data() {
    return {
      CloseIcon,
    };
  },
  components: {
    Avatar,
    AvatarImage,
    ButtonLoading,
    AppButton,
  },
  methods: {
    ...mapActions([
      "notificationShow",
      "chatSendRemoveSocket",
      "modalsSetShow",
      "modalsSetData",
    ]),
    modalRemoveButton() {
      const data = { messageId: this.modalsData.message._id };
      this.chatSendRemoveSocket(data);
    },
  },
  computed: {
    ...mapGetters(["socketSendLoading", "modalsData"]),
  },
};
</script>

<style scoped lang="scss">
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

  .close {
    width: 40px;
    height: 40px;
    background: #22224a;
    border-radius: 8px;
    display: grid;
    cursor: pointer;
    place-content: center;
    margin-left: auto;
    @media screen and (max-width: 991px) {
      background: transparent;
    }
  }
}

.modal-remove {
  width: 620px;
  position: relative;
  display: flex;
  justify-content: center;
  border-radius: 18px;
  border-radius: 18px;
  border-top: 32px solid #090c1d;
  border-bottom: 32px solid #090c1d;
  background: var(--dark-blue);
  border: 4px solid #090c1d;
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media screen and (max-width: 991px) {
    background: transparent;
    border: none;
    width: 100%;
  }
}

.modal-remove .info-amount span {
  font-size: 15px;
}

.modal-remove .content-input {
  position: relative;
}

.remove-content {
  padding: 20px;
}
.modal-remove .content-input div {
  width: 100%;
  height: 54px;
  padding: 0 17px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: #22224a;

  display: flex;
  margin-bottom: 30px;
  align-items: center;
}
</style>
