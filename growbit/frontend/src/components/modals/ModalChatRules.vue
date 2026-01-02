<template>
  <div class="modal-chat-rules">
    <div class="top_menu">
      <div class="title">Chat Rules</div>
      <div class="close" @click="modalsSetShow(null)">
        <img :src="CloseIcon" alt="Close" />
      </div>
    </div>
    <div class="rules-content">
      <div class="rule" v-for="rule of rules">
        {{ rule }}
      </div>
    </div>
    <AppButton
      :click="() => modalsSetShow(null)"
      class="button-accept"
      :height="'50px'"
    >
      Got it
    </AppButton>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import AppButton from "@/components/AppButton.vue";
import Avatar from "@/components/Avatar.vue";
import CloseIcon from "@/assets/images/close.svg";

export default {
  name: "ModalChatRules",
  components: {
    Avatar,
    AppButton,
  },
  data() {
    return {
      CloseIcon,
      rules: [
        "Avoid spamming or overusing capital letters.",
        "Be respectful—don’t harass or offend others.",
        "Keep personal information private for both yourself and others.",
        "Don’t beg or request tips.",
        "Refrain from sharing links.",
        "Advertising is not allowed.",
        "Sharing affiliate codes is prohibited.",
      ],
    };
  },
  methods: {
    ...mapActions(["modalsSetShow"]),
  },
};
</script>

<style scoped>
.modal-chat-rules {
  width: 420px;
  display: flex;
  justify-content: center;
  border-radius: 18px;
  background: var(--dark-blue);
  @media screen and (max-width: 991px) {
    background: transparent;
    border: none;
  }
  border: 4px solid #090c1d;
  flex-direction: column;

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 1.714rem;
    color: #eeeeee;
  }

  .rules-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 30px;

    .rule {
      padding: 15px;
      text-align: center;
      width: 100%;
      background: #22224a;
      border-radius: 9px;
    }
  }

  > button {
    margin: 0 30px 30px 30px;
  }
}

@media only screen and (max-width: 991px) {
  .modal-chat-rules {
    width: 100%;
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
</style>
