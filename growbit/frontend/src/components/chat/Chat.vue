<template>
  <aside
    id="chat"
    v-bind:class="{
      'chat-hidden-mobile': !generalChatMobile && !supportMobile,
      'chat-hidden': !generalChat && !supportChat,
    }"
  >
    <div class="chat-content">
      <div
        v-on:scroll="chatHandleScroll()"
        class="content-messages"
        ref="chatMessages"
      >
        <transition name="fade" mode="out-in">
          <div
            v-if="messages === null || chatMessages.loading === true"
            class="messages-loading"
            key="loading"
          >
            <div
              v-for="index in 4"
              v-bind:key="index"
              class="loading-placeholder"
            >
              <div class="placeholder-user">
                <div class="user-avatar"></div>
                <div class="user-username"></div>
              </div>
              <div class="placeholder-text"></div>
            </div>
          </div>
          <div v-else class="messages-list" key="list">
            <ChatMessageElement
              :support="isSupport"
              v-for="message in messages"
              v-bind:key="message._id"
              v-bind:message="message"
            />
          </div>
        </transition>
      </div>
    </div>
    <div class="chat-footer">
      <div class="message-send">
        <div class="col">
          <div
            v-if="
              this.authUser.user &&
              this.authUser.user.rank === 'user' &&
              this.authUser?.user?.stats?.deposit < 5
            "
            class="wager-needed"
          >
            You need to deposit at least 5DL to chat.
          </div>
          <form class="send-msg-row" @submit.prevent="chatMessageButton">
            <input
              @focus=""
              @input="filterNonEnglish"
              v-model="chatMessage"
              class="text-message"
              required
              maxlength="120"
              placeholder="Enter a message"
            />
            <button class="send-btn">Send</button>

            <button class="send-icon">
              <SendIcon></SendIcon>
            </button>
          </form>
        </div>
        <div class="chat-rules-wrapper" style="margin-top: 10px">
          <div class="chat-rules" @click="modalsSetShow('ChatRules')">
            <span> Chat rules</span>

            <span>{{ chatMessage.length }}/120</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ChatMessageElement from "@/components/chat/ChatMessageElement";
import RulesIcon from "@/assets/images/chat_rules.svg";
import ChatIcon from "@/assets/images/chat.svg?inline";
import SendIcon from "@/assets/images/send.svg?inline";

export default {
  name: "Chat",
  components: {
    ChatIcon,
    SendIcon,
    ChatMessageElement,
  },
  data() {
    return {
      chatMessage: "",
      RulesIcon,
      isMobile: false,
    };
  },
  created() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },

  methods: {
    ...mapActions([
      "notificationShow",
      "modalsSetShow",
      "modalsSetData",
      "generalSetChatMobile",
      "chatSetScroll",
      "chatGetMessagesSocket",
      "chatSendMessageSocket",
      "chatSendClearSocket",
      "chatSendLockSocket",
      "generalToggleChat",
      "supportChatSendMessage",
      "generalSetUserInfoData",
    ]),
    filterNonEnglish() {
      this.chatMessage = this.chatMessage.replace(
        /[^a-zA-Z0-9\s.,!?@#%&$()\[\]\-'"\/:;]/g,
        ""
      );
    },
    chatHandleCommand(parts) {
      const command = parts[0];
      const param = parts[1];

      if (command === "/clear") {
        const data = {};
        this.chatSendClearSocket(data);
      }
      if (command === "/lock") {
        const data = { value: false };
        this.chatSendLockSocket(data);
      } else if (command === "/unlock") {
        const data = { value: true };
        this.chatSendLockSocket(data);
      } else if (command === "/user" && param) {
        let found = this.messages
          .map((m) => m.user)
          .find((u) => u.username?.toLowerCase() === param.toLowerCase());

        if (found) {
          this.generalSetUserInfoData(found);
          this.modalsSetShow("ChatUser");
        }
      }
    },
    chatScrollToBottom() {
      this.$nextTick(() => {
        let container = this.$refs.chatMessages;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    onResize() {
      this.isMobile = window.innerWidth <= 991;
    },
    chatHandleScroll() {
      let container = this.$refs.chatMessages;
      this.chatSetScroll(
        container.scrollHeight -
          (container.scrollTop + container.clientHeight) <
          100
      );
    },
    chatMessageButton() {
      if (this.authUser.user === null) {
        this.notificationShow({
          type: "error",
          message: "Please sign in to perform this action.",
        });
        return;
      }

      if (
        this.generalSettings.chat.enabled === false &&
        this.authUser.user.rank !== "admin"
      ) {
        this.notificationShow({
          type: "error",
          message: "You can not send a chat message.",
        });
        return;
      }

      if (
        this.generalSettings.chat.mode === "normal" &&
        this.authUser.user.rank !== "admin" &&
        new Date().getTime() - this.chatLastMessage < 3000
      ) {
        this.notificationShow({
          type: "error",
          message: "You can only send 1 message every 3 seconds.",
        });
        return;
      }

      if (
        this.generalSettings.chat.mode === "slow" &&
        this.authUser.user.rank !== "admin" &&
        new Date().getTime() - this.chatLastMessage < 6000
      ) {
        this.notificationShow({
          type: "error",
          message:
            "You can only send 1 message every 6 seconds because the chat is in slow mode.",
        });
        return;
      }

      const message = this.chatMessage.trim();

      if (message === "") {
        return;
      }

      let parts = message.split(/\s+/);

      if (
        ["mod", "admin"].includes(this.authUser.user.rank) &&
        ["/clear", "/lock", "/unlock"].includes(parts[0])
      ) {
        this.chatHandleCommand(parts);
        this.chatMessage = "";
        return;
      }
      if (["/user"].includes(parts[0])) {
        this.chatHandleCommand(parts);
        this.chatMessage = "";
        return;
      }
      const data = { message: message };

      if (this.isSupport) {
        this.supportChatSendMessage(data);
      } else {
        this.chatSendMessageSocket(data);
      }

      this.chatMessage = "";
    },
  },
  computed: {
    ...mapGetters([
      "socketSendLoading",
      "generalSettings",
      "authUser",
      "chatScroll",
      "chatMessages",
      "chatLastMessage",
      "generalChatMobile",
      "generalChat",
      "supportMessages",
      "supportChat",
      "supportMobile",
    ]),
    isSupport() {
      return (
        (this.supportChat && !this.isMobile) ||
        (this.isMobile && this.supportMobile)
      );
    },
    messages() {
      if (!this.isSupport) {
        if (!this.chatMessages?.data) {
          return null;
        }

        if (this.authUser?.user?.ignoreList?.length) {
          const ignored = new Set(
            this.authUser.user.ignoreList.map((u) => u._id?.toString())
          );
          return this.chatMessages.data.filter(
            (m) => !ignored.has(m.user?._id?.toString())
          );
        } else {
          return this.chatMessages.data;
        }
      } else {
        let messages = this.supportMessages.data || [];

        messages = messages.map((m) => ({
          user: {
            username: m.sender,
            rank: m.sender === "admin" ? "admin" : "user",
          },
          message: m.message,
        }));

        if (!messages.length) {
          messages.push({
            user: {
              username: "admin",
              rank: "admin",
            },
            message:
              "Welcome to GrowBit Live Support! Start a chat by sending us a message, and one of our support specialists will assist you shortly.",
          });
        }

        return messages;
      }
    },
  },
  watch: {
    "chatMessages.data": {
      handler(state, oldState) {
        const message =
          this.chatMessages.data[this.chatMessages.data.length - 1];
        if (
          this.chatScroll === true ||
          this.chatMessages.data.length === 0 ||
          (this.authUser.user !== null &&
            message !== undefined &&
            message.type === "user" &&
            message.user._id === this.authUser.user._id)
        ) {
          setTimeout(() => {
            this.chatScrollToBottom();
          }, 200);
        }
      },
      deep: true,
    },

    generalChat: {
      handler(state, oldState) {
        setTimeout(() => {
          this.chatScrollToBottom();
        }, 500);
      },
    },
    generalChatMobile: {
      handler(state, oldState) {
        setTimeout(() => {
          this.chatScrollToBottom();
        }, 500);
      },
    },
  },
  mounted() {
    this.chatScrollToBottom();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/sass/variables";

aside#chat {
  min-width: 350px;
  @media screen and (min-width: 991px) {
    max-width: 350px;
    max-height: 100vh;
  }
  width: 350px;
  z-index: 50;
  transition: all ease 0.4s;
  position: relative;
  border-left: 2px solid #14132e;

  background: var(--very-dark);

  .chat-rules-wrapper {
    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  @media screen and (min-width: 991px) {
    display: flex;
    flex-direction: column;
  }

  &.chat-hidden-mobile {
    @media screen and (max-width: 991px) {
      display: none;
    }
  }

  .chat-footer {
    margin-top: auto;
    width: 100%;
    padding-inline: 10px;
    right: 10px;
    padding-bottom: 15px;
  }

  .chat-content {
    width: 100%;
    overflow: scroll;
    max-height: calc(100vh - 110px);
    position: relative;
  }

  @media only screen and (max-width: 991px) {
    position: fixed;
    width: 100%;
    top: 75px;
    bottom: 65px;

    .chat-content {
      width: 100%;
      height: calc(100% - 70px);
      position: relative;
    }

    .chat-footer {
      width: unset;
      position: fixed;

      bottom: 50px;
      max-width: unset;

      left: 0;
      right: 0;
      padding: 10px;
      height: 70px;
      background: #090c1d;
    }
  }
}

aside#chat.chat-hidden {
  @media screen and (min-width: 991px) {
    width: 0;
    max-width: 0;
    min-width: 0;

    .chat-content {
      display: none;
    }

    .chat-footer {
      display: none;
    }
  }
}

aside#chat .chat-toggle {
  position: absolute;
  left: -45px;
  bottom: 150px;

  button {
    width: 45px;
    height: 45px;
    background: #161533;
    box-shadow: -2px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 8px 0px 0px 8px;
    display: grid;
    place-content: center;

    svg path {
      fill: #5b46bc;
      stroke: #5b46bc;
    }
  }
}

aside#chat .chat-header {
  width: 100%;
  height: $header-height;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  padding: 0 18px;
  display: flex;
  z-index: 100;
  justify-content: center;
  align-items: center;
  background: #191d26;
}

aside#chat .header-online {
  display: flex;
  align-items: center;
  font-size: 0.857rem;
  font-weight: 600;
  color: #fff;
}

aside#chat .online-dot {
  width: 15px;
  height: 15px;
  position: relative;
  margin-right: 6px;
}

aside#chat .online-dot:before {
  content: "";
  width: 5px;
  height: 5px;
  position: absolute;
  top: 5px;
  left: 5px;
  border-radius: 50%;
  background: var(--purple);
}

aside#chat .dot-wave {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  animation: online-counter-91702dd6 2s linear infinite forwards;
}

@keyframes online-counter-91702dd6 {
  0% {
    transform: scale(0.2);
    background: rgba(0, 199, 77, 0.2);
  }

  50% {
    transform: scale(0.7);
    background: rgba(0, 199, 77, 0.2);
  }

  100% {
    transform: scale(1.2);
    background: rgba(0, 199, 77, 0);
  }
}

aside#chat .header-socials {
  display: flex;
}

aside#chat .header-socials a.socials-twitter {
  background: #234965;
}

aside#chat .header-socials a.socials-twitter svg {
  fill: #53b5ff;
}

aside#chat .header-socials a {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  z-index: 100;
}

aside#chat .chat-room {
  width: 100%;
  padding: 15px 15px 0 15px;
}
//
//aside#chat .chat-content::before {
//  content: "";
//  width: 100%;
//  height: 50px;
//  position: absolute;
//  pointer-events: none;
//  top: 0;
//  left: 0;
//  background: linear-gradient(180deg, #090c1d 0%, rgba(9, 12, 29, 0) 100%);
//  z-index: 10;
//}

aside#chat .chat-content .content-messages {
  height: 100%;
  padding: 10px 10px 12px 10px;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  transition: height 0.2s ease;
}
aside#chat .chat-content.rain-join-layout .content-messages {
  height: calc(100% - 195px);
}

aside#chat .content-messages::-webkit-scrollbar-track {
  background-color: transparent;
}

aside#chat .content-messages::-webkit-scrollbar {
  width: 0;
  height: 0;
}

aside#chat .messages-loading {
  width: 100%;
  padding: 0 15px;
}

aside#chat .messages-loading.fade-leave-active {
  transition: opacity 0.2s;
}

aside#chat .messages-loading.fade-leave-to {
  opacity: 0;
}

aside#chat .content-lock {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translate(-50%, 0);
}

aside#chat.chat-rain .content-lock {
  bottom: 157px;
  z-index: 100;
}

aside#chat .content-lock button.button-lock {
  height: 30px;
  position: relative;
  padding: 1px;
  filter: drop-shadow(0px 2px 10px rgba(1, 230, 169, 0.15))
    drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
  z-index: 1;
}

aside#chat .content-lock button.button-lock::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #01e1a4 100%);
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 7px) 100%,
    7px 100%,
    0 75%,
    0 25%
  );
  z-index: -1;
}

aside#chat .content-lock button.button-lock .button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.128) 0%,
      rgba(0, 33, 24, 0.132) 25%,
      rgba(0, 99, 73, 0.144986) 60%,
      rgba(1, 193, 143, 0.0925409) 80%,
      rgba(1, 237, 176, 0.068) 100%
    )
    #064552;
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    100% 25%,
    100% 75%,
    calc(100% - 7px) 100%,
    7px 100%,
    0 75%,
    0 25%
  );
}

aside#chat .content-rain {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 15px 15px 0 15px;
  z-index: 1;
}

aside#chat .content-rain .fade-slide-enter-active,
aside#chat .content-rain .fade-slide-leave-active {
  transition: all 0.3s ease;
}

aside#chat .content-rain .fade-slide-enter,
aside#chat .content-rain .fade-slide-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

aside#chat .loading-placeholder {
  width: 100%;
  margin-top: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #1a1e27;
}

aside#chat .loading-placeholder:first-of-type {
  margin-top: 0;
}

aside#chat .placeholder-user {
  display: flex;
  align-items: center;
}

aside#chat .user-avatar {
  width: 37px;
  height: 37px;
  position: relative;
  margin-right: 13px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #1a1e27;
}

aside#chat .user-username {
  width: 75px;
  height: 20px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-color: #1a1e27;
}

aside#chat .placeholder-text {
  width: 100%;
  height: 19px;
  position: relative;
  margin-top: 8px;
  border-radius: 5px;
  overflow: hidden;
  background-color: #1a1e27;
}

aside#chat .user-avatar::after,
aside#chat .user-username::after,
aside#chat .placeholder-text::after {
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

aside#chat .messages-list {
  width: 100%;
  height: 100%;
}

aside#chat .messages-list.fade-enter-active {
  transition: opacity 0.1s;
}

aside#chat .messages-list.fade-enter-from {
  opacity: 0;
}

.message-send {
  .chat-rules {
    display: flex;
    gap: 8px;
    padding-left: 5px;
    padding-right: 5px;
    align-items: center;
    padding-bottom: 10px;
    padding-top: 5px;
    cursor: pointer;
    justify-content: space-between;
    span {
      font-weight: 700;
      font-size: 1rem;
      color: #9789cd;

      &:last-of-type {
        font-style: normal;
        font-weight: 500;
        font-size: 1rem;

        color: rgba(151, 137, 205, 0.6);
      }
    }
  }
  .col {
    display: flex;
    flex-direction: column;
    position: relative;

    .wager-needed {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 9px 7px;
      background: #ae2445;

      font-style: normal;
      font-weight: 800;
      font-size: 1rem;
      margin-bottom: 10px;
      margin-inline: -10px;

      @media screen and (max-width: 991px) {
        top: -45px;
        right: 0;
        left: 0;
        position: absolute;
      }
    }

    input.wager:focus {
      background: #ae2445;
      outline: none !important;
      border: 1px solid red !important;
    }
  }

  .send-msg-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    width: 100%;
    height: 40px;
    color: #eee;
    font-size: 1rem;
    resize: none;

    input {
      width: 100%;
      display: block;
      transition: color 0.3s ease;
      background: #121129;
      padding-left: 8px;
      border: 2px solid #22224a;
      border-radius: 10px;
    }

    button,
    input {
      height: 40px;
      font-weight: 500;
      font-size: 1rem;
      &::placeholder {
        color: #616498;
      }
    }

    button {
      height: 40px;
      background: var(--purple);
      box-shadow: inset 0px -5px 0px rgba(0, 0, 0, 0.25);
      border-radius: 10px;
      font-style: normal;
      font-weight: 900;
      font-size: 1rem;
      padding: 10px 13px;
      position: relative;
      color: rgba(238, 238, 238, 0.933333);
      &:after {
        content: "";
        z-index: -1;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        border-radius: 11px;
        background: #090c1d;

        position: absolute;
        margin: -4px;
      }

      @media screen and (max-width: 991px) {
        display: none;
      }
    }

    .send-icon {
      width: 40px;
      height: 40px;
      background: #22224a;
      border: 2px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      display: grid;
      place-content: center;
      flex-shrink: 0;
      box-shadow: unset;

      cursor: pointer;
      @media screen and (min-width: 991px) {
        display: none;
      }
    }
  }
}
</style>
